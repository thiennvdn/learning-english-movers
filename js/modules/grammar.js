import { speak, getTTSRate } from '../utils/tts.js';
import { playDing, playBuzz } from '../utils/audio.js';
import { addXP, recordExercise } from '../utils/gamification.js';
import { getState, save } from '../state.js';

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showXPFly(amount) {
  const el = document.createElement('div');
  el.className = 'xp-flyup';
  el.textContent = `+${amount} XP`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

export function renderGrammarSession(container, exercises, onComplete) {
  if (!exercises || exercises.length === 0) {
    container.innerHTML = `<div class="card" style="text-align:center;padding:2rem">
      <p>No grammar exercises available.</p>
      <button class="btn btn-primary" style="margin-top:1rem" id="done-btn">Continue ➡</button>
    </div>`;
    document.getElementById('done-btn').addEventListener('click', onComplete);
    return;
  }

  const items = shuffle(exercises).slice(0, Math.min(8, exercises.length));
  let idx = 0;

  function next() {
    if (idx >= items.length) { onComplete(); return; }
    const ex = items[idx];
    container.innerHTML = '';
    if (ex.type === 'multiple_choice') renderMC(container, ex, idx, items.length, advance);
    else if (ex.type === 'fill_blank') renderFillBlank(container, ex, idx, items.length, advance);
    else if (ex.type === 'true_false') renderTrueFalse(container, ex, idx, items.length, advance);
    else advance();
  }

  function advance() { idx++; next(); }
  next();
}

function displaySentence(sentence) {
  return sentence.replace('___', '<span class="blank">___</span>');
}

function renderMC(container, ex, idx, total, onNext) {
  const rate = getTTSRate();
  const fullSentence = ex.options[ex.correct];

  container.innerHTML = `
    <div class="exercise-wrapper slide-up">
      <div class="exercise-header">
        <h3>📝 Choose the Correct Answer</h3>
        <span class="ex-counter">${idx + 1} / ${total}</span>
      </div>
      <div class="sentence-display">${displaySentence(ex.sentence)}</div>
      <button class="btn btn-sm listen-btn" id="listen-btn" style="margin:0.5rem auto">🔊 Listen</button>
      <div class="options-grid">
        ${ex.options.map((opt, i) => `<button class="option-btn" data-idx="${i}">${opt}</button>`).join('')}
      </div>
      <div id="feedback"></div>
    </div>
  `;

  document.getElementById('listen-btn').addEventListener('click', () => speak(ex.sentence.replace('___', '...'), rate));

  let firstTry = true;
  container.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
      const chosen = parseInt(btn.dataset.idx);
      const state = getState();
      recordExercise(state, 'grammar', chosen === ex.correct);

      if (chosen === ex.correct) {
        btn.classList.add('correct');
        playDing();
        const xp = addXP(state, firstTry ? 'correct_first' : 'correct_retry');
        save();
        showXPFly(xp);
        speak(ex.sentence.replace('___', ex.options[ex.correct]), rate);
        document.getElementById('feedback').innerHTML = `<div class="feedback-box correct">✅ ${ex.explanation}</div>`;
        setTimeout(onNext, 1400);
      } else {
        btn.classList.add('wrong');
        container.querySelectorAll(`.option-btn[data-idx="${ex.correct}"]`).forEach(b => b.classList.add('reveal'));
        playBuzz();
        firstTry = false;
        save();
        document.getElementById('feedback').innerHTML = `
          <div class="feedback-box wrong">❌ ${ex.explanation}</div>
          <button class="btn btn-primary next-btn" style="margin-top:0.8rem;width:100%">Got it! Next →</button>`;
        const nb = document.querySelector('.next-btn');
        nb.addEventListener('click', onNext);
        nb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
}

function renderFillBlank(container, ex, idx, total, onNext) {
  const rate = getTTSRate();

  container.innerHTML = `
    <div class="exercise-wrapper slide-up">
      <div class="exercise-header">
        <h3>📝 Fill in the Blank</h3>
        <span class="ex-counter">${idx + 1} / ${total}</span>
      </div>
      <div class="sentence-display">${displaySentence(ex.sentence)}</div>
      <div class="text-input-row" style="margin-top:0.8rem">
        <input class="text-input" type="text" id="grammar-input" placeholder="Type your answer..." autocorrect="off" spellcheck="false">
        <button class="btn btn-primary" id="check-btn">Check</button>
      </div>
      <div id="feedback"></div>
    </div>
  `;

  const input = document.getElementById('grammar-input');
  input.focus();

  function check() {
    const val = input.value.trim().toLowerCase();
    const correct = ex.correct.toLowerCase();
    const state = getState();
    recordExercise(state, 'grammar', val === correct);

    if (val === correct) {
      input.classList.add('correct');
      document.getElementById('check-btn').disabled = true;
      playDing();
      const xp = addXP(state, 'correct_first');
      save();
      showXPFly(xp);
      speak(ex.sentence.replace('___', ex.correct), rate);
      document.getElementById('feedback').innerHTML = `<div class="feedback-box correct">✅ ${ex.explanation}</div>`;
      setTimeout(onNext, 1400);
    } else {
      input.classList.add('wrong');
      document.getElementById('check-btn').disabled = true;
      playBuzz();
      save();
      document.getElementById('feedback').innerHTML = `
        <div class="feedback-box wrong">❌ Answer: <strong>${ex.correct}</strong> — ${ex.explanation}</div>
        <button class="btn btn-primary next-btn" style="margin-top:0.8rem;width:100%">Got it! Next →</button>`;
      const nb2 = document.querySelector('.next-btn');
      nb2.addEventListener('click', onNext);
      nb2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  document.getElementById('check-btn').addEventListener('click', check);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
}

function renderTrueFalse(container, ex, idx, total, onNext) {
  const rate = getTTSRate();

  container.innerHTML = `
    <div class="exercise-wrapper slide-up">
      <div class="exercise-header">
        <h3>📝 True or False?</h3>
        <span class="ex-counter">${idx + 1} / ${total}</span>
      </div>
      <div class="sentence-display">${ex.sentence}</div>
      <button class="btn btn-sm listen-btn" id="listen-btn" style="margin:0.5rem auto">🔊 Listen</button>
      <div class="tf-buttons" style="margin-top:0.8rem">
        <button class="btn btn-primary tf-btn" data-val="true">✅ True</button>
        <button class="btn btn-danger tf-btn" data-val="false">❌ False</button>
      </div>
      <div id="feedback"></div>
    </div>
  `;

  document.getElementById('listen-btn').addEventListener('click', () => speak(ex.sentence, rate));
  speak(ex.sentence, rate);

  container.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tf-btn').forEach(b => b.disabled = true);
      const chosen = btn.dataset.val === 'true';
      const state = getState();
      recordExercise(state, 'grammar', chosen === ex.correct);

      if (chosen === ex.correct) {
        btn.style.outline = '3px solid var(--color-success)';
        playDing();
        const xp = addXP(state, 'correct_first');
        save();
        showXPFly(xp);
        document.getElementById('feedback').innerHTML = `<div class="feedback-box correct">✅ ${ex.explanation}</div>`;
        setTimeout(onNext, 1400);
      } else {
        btn.style.outline = '3px solid var(--color-error)';
        playBuzz();
        save();
        document.getElementById('feedback').innerHTML = `
          <div class="feedback-box wrong">❌ ${ex.explanation}</div>
          <button class="btn btn-primary next-btn" style="margin-top:0.8rem;width:100%">Got it! Next →</button>`;
        const nb = document.querySelector('.next-btn');
        nb.addEventListener('click', onNext);
        nb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
}
