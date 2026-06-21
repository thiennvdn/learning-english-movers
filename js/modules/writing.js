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

function generateExercises(words) {
  const shuffled = shuffle(words);
  const exercises = [];

  // Word order: use 4 words as sentences
  shuffled.slice(0, 4).forEach(w => {
    const sentences = [
      { text: `This is a ${w.en}.`, words: ['This', 'is', 'a', w.en + '.'] },
      { text: `I can see a ${w.en}.`, words: ['I', 'can', 'see', 'a', w.en + '.'] },
      { text: `The ${w.en} is here.`, words: ['The', w.en, 'is', 'here.'] },
    ];
    const s = sentences[Math.floor(Math.random() * sentences.length)];
    exercises.push({ type: 'word_order', word: w, sentence: s.text, words: s.words });
  });

  // Sentence builder: fill in the word
  shuffled.slice(4, 8).forEach(w => {
    const templates = [
      { template: `I like _____.`, answer: w.en },
      { template: `Look at the _____.`, answer: w.en },
      { template: `Can you see the _____?`, answer: w.en },
    ];
    const t = templates[Math.floor(Math.random() * templates.length)];
    exercises.push({ type: 'sentence_builder', word: w, template: t.template, answer: t.answer,
      allWords: words });
  });

  return shuffle(exercises).slice(0, 5);
}

export function renderWritingSession(container, words, onComplete) {
  if (!words || words.length < 4) {
    container.innerHTML = `<div class="card" style="text-align:center;padding:2rem">
      <p>Not enough words for writing exercises.</p>
      <button class="btn btn-primary" style="margin-top:1rem" id="done-btn">Continue ➡</button>
    </div>`;
    document.getElementById('done-btn').addEventListener('click', onComplete);
    return;
  }

  const exercises = generateExercises(words);
  let idx = 0;

  function next() {
    if (idx >= exercises.length) { onComplete(); return; }
    const ex = exercises[idx];
    container.innerHTML = '';
    if (ex.type === 'word_order') renderWordOrder(container, ex, idx, exercises.length, advance);
    else if (ex.type === 'sentence_builder') renderSentenceBuilder(container, ex, idx, exercises.length, advance);
    else advance();
  }

  function advance() { idx++; next(); }
  next();
}

function renderWordOrder(container, ex, idx, total, onNext) {
  const rate = getTTSRate();
  const scrambled = shuffle([...ex.words]);
  let answer = [];

  function updateUI() {
    const answerEl = document.getElementById('wo-answer');
    const bankEl = document.getElementById('wo-bank');

    const usedCount = {};
    answer.forEach(w => { usedCount[w] = (usedCount[w] || 0) + 1; });
    const poolCount = {};
    ex.words.forEach(w => { poolCount[w] = (poolCount[w] || 0) + 1; });

    answerEl.innerHTML = answer.length
      ? answer.map((w, i) => `<span class="placed-word" data-pos="${i}">${w}</span>`).join('')
      : '<span style="color:var(--color-text-light);padding:0.5rem">Tap words below...</span>';

    bankEl.innerHTML = scrambled.map((w, i) => {
      const needed = poolCount[w] || 0;
      const used = usedCount[w] || 0;
      const isUsed = used >= needed || (scrambled.indexOf(w) !== i && used >= scrambled.slice(0, i).filter(x => x === w).length + 1);
      return `<button class="word-tile ${isUsed ? 'used' : ''}" data-word="${w}">${w}</button>`;
    }).join('');

    // Simpler: track by position
    const usedPositions = new Set();
    const wordCount = {};
    answer.forEach(w => { wordCount[w] = (wordCount[w] || 0) + 1; });

    bankEl.innerHTML = '';
    const tempCount = {};
    scrambled.forEach((w, i) => {
      tempCount[w] = (tempCount[w] || 0) + 1;
      const used = wordCount[w] || 0;
      const isUsed = tempCount[w] <= used;
      const btn = document.createElement('button');
      btn.className = `word-tile${isUsed ? ' used' : ''}`;
      btn.dataset.word = w;
      btn.dataset.scrambleIdx = i;
      btn.textContent = w;
      bankEl.appendChild(btn);
    });
  }

  container.innerHTML = `
    <div class="exercise-wrapper slide-up">
      <div class="exercise-header">
        <h3>✏️ Word Order</h3>
        <span class="ex-counter">${idx + 1} / ${total}</span>
      </div>
      <div style="text-align:center;font-size:3rem;margin:0.3rem 0">${ex.word.emoji}</div>
      <p style="text-align:center;color:var(--color-text-light)">Make a sentence with <strong>${ex.word.en}</strong>!</p>
      <button class="btn btn-sm listen-btn" id="listen-hint">🔊 Hint</button>
      <div class="word-order-answer" id="wo-answer"></div>
      <div class="word-bank" id="wo-bank"></div>
      <div style="display:flex;gap:0.6rem;margin-top:0.5rem">
        <button class="btn btn-secondary" id="wo-clear">🗑 Clear</button>
        <button class="btn btn-primary" id="wo-check">✓ Check</button>
      </div>
      <div id="feedback"></div>
    </div>
  `;

  updateUI();

  document.getElementById('listen-hint').addEventListener('click', () => speak(ex.sentence, rate * 0.85));

  document.getElementById('wo-bank').addEventListener('click', e => {
    const btn = e.target.closest('.word-tile');
    if (!btn || btn.classList.contains('used')) return;
    answer.push(btn.dataset.word);
    updateUI();
  });

  document.getElementById('wo-answer').addEventListener('click', e => {
    const span = e.target.closest('.placed-word');
    if (!span) return;
    answer.splice(parseInt(span.dataset.pos), 1);
    updateUI();
  });

  document.getElementById('wo-clear').addEventListener('click', () => { answer = []; updateUI(); });

  document.getElementById('wo-check').addEventListener('click', () => {
    if (answer.length === 0) return;
    const state = getState();
    const correct = answer.join(' ') === ex.words.join(' ');
    recordExercise(state, 'writing', correct);

    if (correct) {
      playDing();
      const xp = addXP(state, 'correct_first');
      save();
      showXPFly(xp);
      speak(ex.sentence, rate);
      document.getElementById('feedback').innerHTML = `<div class="feedback-box correct">✅ Perfect!</div>`;
      setTimeout(onNext, 1500);
    } else {
      playBuzz();
      save();
      document.getElementById('feedback').innerHTML = `<div class="feedback-box wrong">❌ Correct: "${ex.sentence}"</div>`;
      setTimeout(onNext, 2000);
    }
  });
}

function renderSentenceBuilder(container, ex, idx, total, onNext) {
  const rate = getTTSRate();
  const distractors = shuffle(ex.allWords.filter(w => w.en !== ex.answer)).slice(0, 2).map(w => w.en);
  const options = shuffle([ex.answer, ...distractors]);

  container.innerHTML = `
    <div class="exercise-wrapper slide-up">
      <div class="exercise-header">
        <h3>✏️ Sentence Builder</h3>
        <span class="ex-counter">${idx + 1} / ${total}</span>
      </div>
      <div style="text-align:center;font-size:3rem;margin:0.3rem 0">${ex.word.emoji}</div>
      <div class="sentence-display">
        ${ex.template.replace('_____', '<span class="blank">_____</span>')}
      </div>
      <p style="text-align:center;color:var(--color-text-light);margin:0.5rem 0">Choose the correct word:</p>
      <div class="word-bank" style="justify-content:center">
        ${options.map(opt => `<button class="word-tile" data-word="${opt}">${opt}</button>`).join('')}
      </div>
      <div id="feedback"></div>
    </div>
  `;

  let firstTry = true;
  container.querySelectorAll('.word-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.word-tile').forEach(b => b.disabled = true);
      const chosen = btn.dataset.word;
      const state = getState();
      const correct = chosen === ex.answer;
      recordExercise(state, 'writing', correct);

      if (correct) {
        btn.style.background = 'var(--color-success)';
        playDing();
        const xp = addXP(state, firstTry ? 'correct_first' : 'correct_retry');
        save();
        showXPFly(xp);
        speak(ex.template.replace('_____', ex.answer), rate);
        document.getElementById('feedback').innerHTML = `<div class="feedback-box correct">✅ "${ex.template.replace('_____', ex.answer)}"</div>`;
        setTimeout(onNext, 1500);
      } else {
        btn.style.background = 'var(--color-error)';
        container.querySelectorAll(`.word-tile[data-word="${ex.answer}"]`).forEach(b => { b.style.background = 'var(--color-success)'; });
        playBuzz();
        firstTry = false;
        save();
        document.getElementById('feedback').innerHTML = `<div class="feedback-box wrong">❌ Answer: "${ex.answer}"</div>`;
        setTimeout(onNext, 1800);
      }
    });
  });
}
