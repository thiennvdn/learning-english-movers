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

export function renderListeningSession(container, exercises, onComplete) {
  if (!exercises || exercises.length === 0) {
    container.innerHTML = `<div class="card" style="text-align:center;padding:2rem">
      <p>No listening exercises for this topic yet!</p>
      <button class="btn btn-primary" style="margin-top:1rem" id="done-btn">Continue ➡</button>
    </div>`;
    document.getElementById('done-btn').addEventListener('click', onComplete);
    return;
  }

  const items = shuffle(exercises).slice(0, Math.min(3, exercises.length));
  let idx = 0;

  function next() {
    if (idx >= items.length) { onComplete(); return; }
    const ex = items[idx];
    container.innerHTML = '';
    if (ex.type === 'listen_choose') renderListenChoose(container, ex, idx, items.length, advance);
    else if (ex.type === 'listen_answer') renderListenAnswer(container, ex, idx, items.length, advance);
    else if (ex.type === 'dictation_lite') renderDictationLite(container, ex, idx, items.length, advance);
    else advance();
  }

  function advance() { idx++; next(); }
  next();
}

function renderListenChoose(container, ex, idx, total, onNext) {
  const rate = getTTSRate();

  container.innerHTML = `
    <div class="exercise-wrapper slide-up">
      <div class="exercise-header">
        <h3>🎧 Listen &amp; Choose</h3>
        <span class="ex-counter">${idx + 1} / ${total}</span>
      </div>
      <p style="color:var(--color-text-light);text-align:center">Listen and choose the correct picture</p>
      <button class="btn listen-btn" id="listen-btn">🔊 Listen</button>
      <div class="emoji-options" id="options">
        ${ex.options.map((emoji, i) => `
          <button class="emoji-option-btn" data-idx="${i}">
            <span class="eo-emoji">${emoji}</span>
            <span class="eo-label">${ex.optionLabels[i]}</span>
          </button>
        `).join('')}
      </div>
      <div id="feedback"></div>
    </div>
  `;

  speak(ex.text, rate);
  document.getElementById('listen-btn').addEventListener('click', () => speak(ex.text, rate));

  let firstTry = true;
  container.querySelectorAll('.emoji-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.emoji-option-btn').forEach(b => b.disabled = true);
      const chosen = parseInt(btn.dataset.idx);
      const state = getState();
      recordExercise(state, 'listening', chosen === ex.correct);

      if (chosen === ex.correct) {
        btn.classList.add('correct');
        playDing();
        const xp = addXP(state, firstTry ? 'correct_first' : 'correct_retry');
        save();
        showXPFly(xp);
        document.getElementById('feedback').innerHTML = `<div class="feedback-box correct">✅ Correct!</div>`;
        setTimeout(onNext, 1200);
      } else {
        btn.classList.add('wrong');
        container.querySelectorAll(`.emoji-option-btn[data-idx="${ex.correct}"]`).forEach(b => b.classList.add('correct'));
        playBuzz();
        firstTry = false;
        save();
        document.getElementById('feedback').innerHTML = `<div class="feedback-box wrong">❌ Listen again!</div>`;
        speak(ex.text, rate * 0.85);
        setTimeout(onNext, 2000);
      }
    });
  });
}

function renderListenAnswer(container, ex, idx, total, onNext) {
  const rate = getTTSRate();

  container.innerHTML = `
    <div class="exercise-wrapper slide-up">
      <div class="exercise-header">
        <h3>🎧 Listen &amp; Answer</h3>
        <span class="ex-counter">${idx + 1} / ${total}</span>
      </div>
      <button class="btn listen-btn" id="listen-btn">🔊 Listen to the dialogue</button>
      <div id="question-area" style="display:none">
        <div class="sentence-display" style="margin:1rem 0">${ex.question}</div>
        <div class="options-grid">
          ${ex.options.map((opt, i) => `
            <button class="option-btn" data-idx="${i}">${String.fromCharCode(65+i)}. ${opt}</button>
          `).join('')}
        </div>
      </div>
      <div id="feedback"></div>
    </div>
  `;

  const listenBtn = document.getElementById('listen-btn');
  listenBtn.addEventListener('click', async () => {
    listenBtn.disabled = true;
    await speak(ex.text, rate * 0.9);
    document.getElementById('question-area').style.display = '';
    listenBtn.textContent = '🔊 Listen again';
    listenBtn.disabled = false;
  });

  let firstTry = true;
  container.addEventListener('click', e => {
    const btn = e.target.closest('.option-btn');
    if (!btn || btn.disabled) return;
    container.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    const chosen = parseInt(btn.dataset.idx);
    const state = getState();
    recordExercise(state, 'listening', chosen === ex.correct);

    if (chosen === ex.correct) {
      btn.classList.add('correct');
      playDing();
      const xp = addXP(state, firstTry ? 'correct_first' : 'correct_retry');
      save();
      showXPFly(xp);
      document.getElementById('feedback').innerHTML = `<div class="feedback-box correct">✅ Correct!</div>`;
      setTimeout(onNext, 1200);
    } else {
      btn.classList.add('wrong');
      container.querySelectorAll(`.option-btn[data-idx="${ex.correct}"]`).forEach(b => b.classList.add('reveal'));
      playBuzz();
      firstTry = false;
      save();
      document.getElementById('feedback').innerHTML = `<div class="feedback-box wrong">❌ The correct answer is "${ex.options[ex.correct]}"</div>`;
      setTimeout(onNext, 1800);
    }
  });
}

function renderDictationLite(container, ex, idx, total, onNext) {
  const rate = getTTSRate();
  const wordPool = shuffle([...ex.words]);
  let answer = [];

  function updateDisplay() {
    document.getElementById('answer-area').innerHTML = answer.length
      ? answer.map((w, i) => `<span class="placed-word" data-pos="${i}">${w}</span>`).join('')
      : '<span style="color:var(--color-text-light);padding:0.5rem">Tap words to build the sentence...</span>';

    document.getElementById('word-bank').innerHTML = wordPool
      .filter((_, i) => !answer.includes(wordPool[i]) || wordPool.indexOf(wordPool[i]) !== i)
      .map((w, i) => {
        const used = answer.includes(w) && answer.indexOf(w) <= i;
        return `<button class="word-tile ${used ? 'used' : ''}" data-word="${w}" data-pool-idx="${i}">${w}</button>`;
      }).join('');

    // Rebuild with all words, tracking used by position
    const usedCount = {};
    answer.forEach(w => { usedCount[w] = (usedCount[w] || 0) + 1; });

    document.getElementById('word-bank').innerHTML = ex.words.map((w, i) => {
      const timesInAnswer = usedCount[w] || 0;
      const timesInPool = ex.words.slice(0, i + 1).filter(x => x === w).length;
      const isUsed = timesInPool <= timesInAnswer;
      return `<button class="word-tile ${isUsed ? 'used' : ''}" data-word="${w}">${w}</button>`;
    }).join('');
  }

  container.innerHTML = `
    <div class="exercise-wrapper slide-up">
      <div class="exercise-header">
        <h3>🎧 Put Words in Order</h3>
        <span class="ex-counter">${idx + 1} / ${total}</span>
      </div>
      <button class="btn listen-btn" id="listen-btn">🔊 Listen</button>
      <div class="word-order-answer" id="answer-area">
        <span style="color:var(--color-text-light);padding:0.5rem">Tap words to build the sentence...</span>
      </div>
      <div class="word-bank" id="word-bank"></div>
      <div style="display:flex;gap:0.6rem;margin-top:0.5rem">
        <button class="btn btn-secondary" id="clear-btn">🗑 Clear</button>
        <button class="btn btn-primary" id="check-btn">✓ Check</button>
      </div>
      <div id="feedback"></div>
    </div>
  `;

  updateDisplay();
  speak(ex.text, rate * 0.85);
  document.getElementById('listen-btn').addEventListener('click', () => speak(ex.text, rate * 0.85));

  document.getElementById('word-bank').addEventListener('click', e => {
    const btn = e.target.closest('.word-tile');
    if (!btn || btn.classList.contains('used')) return;
    answer.push(btn.dataset.word);
    updateDisplay();
  });

  document.getElementById('answer-area').addEventListener('click', e => {
    const span = e.target.closest('.placed-word');
    if (!span) return;
    const pos = parseInt(span.dataset.pos);
    answer.splice(pos, 1);
    updateDisplay();
  });

  document.getElementById('clear-btn').addEventListener('click', () => { answer = []; updateDisplay(); });

  document.getElementById('check-btn').addEventListener('click', () => {
    if (answer.length === 0) return;
    const state = getState();
    const correct = answer.join(' ') === ex.words.join(' ');
    recordExercise(state, 'listening', correct);

    if (correct) {
      playDing();
      const xp = addXP(state, 'correct_first');
      save();
      showXPFly(xp);
      document.getElementById('feedback').innerHTML = `<div class="feedback-box correct">✅ Perfect sentence!</div>`;
      setTimeout(onNext, 1200);
    } else {
      playBuzz();
      save();
      document.getElementById('feedback').innerHTML = `<div class="feedback-box wrong">❌ Correct: "${ex.words.join(' ')}"</div>`;
      setTimeout(onNext, 2000);
    }
  });
}
