import { speak, getTTSRate } from '../utils/tts.js';
import { playDing, playBuzz } from '../utils/audio.js';
import { addXP, markWordLearned } from '../utils/gamification.js';
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

export function renderVocabularySession(container, words, topicId, onComplete) {
  const rate = getTTSRate();
  const sessionWords = shuffle(words).slice(0, Math.min(10, words.length));
  const phases = ['flashcards', 'match', 'fillblank', 'spelling'];
  let phaseIdx = 0;

  function nextPhase() {
    if (phaseIdx >= phases.length) {
      onComplete();
      return;
    }
    const phase = phases[phaseIdx++];
    container.innerHTML = '';
    if (phase === 'flashcards') renderFlashcards(container, sessionWords, topicId, rate, nextPhase);
    else if (phase === 'match') renderMatch(container, sessionWords.slice(0, 4), topicId, rate, nextPhase);
    else if (phase === 'fillblank') renderFillBlank(container, sessionWords, topicId, rate, nextPhase);
    else if (phase === 'spelling') renderSpelling(container, sessionWords.slice(0, 4), topicId, rate, nextPhase);
  }

  nextPhase();
}

function renderFlashcards(container, words, topicId, rate, onDone) {
  let idx = 0;

  function show() {
    if (idx >= words.length) { onDone(); return; }
    const w = words[idx];
    const state = getState();
    markWordLearned(state, topicId, w.en);
    const xp = addXP(state, 'flashcard');
    save();

    container.innerHTML = `
      <div class="exercise-wrapper slide-up">
        <div class="exercise-header">
          <h3>📖 Flashcards</h3>
          <span class="ex-counter">${idx + 1} / ${words.length}</span>
        </div>
        <div class="flashcard" id="fc-card">
          <div class="fc-emoji">${w.emoji}</div>
          <div class="fc-word">${w.en}</div>
          <button class="btn btn-sm" id="fc-play" style="margin-top:0.5rem">🔊 Listen</button>
        </div>
        <div id="fc-back" style="display:none" class="flashcard" style="background:#E8F5E9">
          <div class="fc-emoji">${w.emoji}</div>
          <div class="fc-word">${w.en}</div>
          <div class="fc-vi" style="margin-top:0.5rem">${w.vi}</div>
        </div>
        <div class="fc-controls">
          <button class="btn btn-secondary" id="fc-flip">👁 See meaning</button>
          <button class="btn btn-primary" id="fc-next" style="display:none">Next ➡</button>
        </div>
      </div>
    `;

    speak(w.en, rate);

    document.getElementById('fc-play').addEventListener('click', () => speak(w.en, rate));
    document.getElementById('fc-flip').addEventListener('click', () => {
      document.getElementById('fc-card').style.display = 'none';
      document.getElementById('fc-back').style.display = 'flex';
      document.getElementById('fc-flip').style.display = 'none';
      document.getElementById('fc-next').style.display = '';
      playDing();
      showXPFly(xp);
    });
    document.getElementById('fc-next').addEventListener('click', () => { idx++; show(); });
  }

  show();
}

function renderMatch(container, words, topicId, rate, onDone) {
  const items = shuffle(words);
  let selected = null;
  let matched = 0;

  const emojiIds = items.map((_, i) => `emoji_${i}`);
  const wordIds = shuffle(items.map((_, i) => i)).map(i => `word_${i}`);

  container.innerHTML = `
    <div class="exercise-wrapper slide-up">
      <div class="exercise-header">
        <h3>🔗 Match the Words</h3>
        <span class="ex-counter">${matched} / ${items.length}</span>
      </div>
      <p style="color:var(--color-text-light);margin-bottom:0.8rem">Tap an emoji, then tap the matching word!</p>
      <div class="match-cols">
        <div id="emoji-col">
          ${items.map((w, i) => `
            <button class="match-item" data-type="emoji" data-idx="${i}" id="emoji_${i}">
              ${w.emoji}
            </button>
          `).join('')}
        </div>
        <div id="word-col">
          ${shuffle(items.map((w, i) => ({ w, i }))).map(({ w, i }) => `
            <button class="match-item" data-type="word" data-idx="${i}" id="word_${i}">
              ${w.en}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.match-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('correct')) return;

      if (!selected) {
        if (selected) selected.classList.remove('selected');
        selected = btn;
        btn.classList.add('selected');
        if (btn.dataset.type === 'emoji') {
          speak(items[btn.dataset.idx].en, rate);
        }
      } else {
        if (selected === btn) { btn.classList.remove('selected'); selected = null; return; }
        const selIdx = parseInt(selected.dataset.idx);
        const btnIdx = parseInt(btn.dataset.idx);
        if (selIdx === btnIdx) {
          selected.classList.remove('selected');
          selected.classList.add('correct');
          btn.classList.add('correct');
          selected = null;
          matched++;
          playDing();
          const xp = addXP(getState(), 'correct_first');
          save();
          showXPFly(xp);
          container.querySelector('.ex-counter').textContent = `${matched} / ${items.length}`;
          if (matched === items.length) setTimeout(onDone, 600);
        } else {
          btn.classList.add('selected');
          setTimeout(() => {
            selected?.classList.remove('selected');
            btn.classList.remove('selected');
            selected = null;
          }, 500);
          playBuzz();
        }
      }
    });
  });
}

function renderFillBlank(container, words, topicId, rate, onDone) {
  const questions = shuffle(words).slice(0, Math.min(5, words.length));
  let idx = 0;
  let firstTry = true;

  function show() {
    if (idx >= questions.length) { onDone(); return; }
    const w = questions[idx];
    const others = words.filter(x => x.en !== w.en);
    const distractors = shuffle(others).slice(0, 2).map(x => x.en);
    const options = shuffle([w.en, ...distractors]);

    container.innerHTML = `
      <div class="exercise-wrapper slide-up">
        <div class="exercise-header">
          <h3>📝 Fill in the Blank</h3>
          <span class="ex-counter">${idx + 1} / ${questions.length}</span>
        </div>
        <div style="text-align:center;font-size:3rem;margin:0.5rem 0">${w.emoji}</div>
        <button class="btn listen-btn" id="listen-btn">🔊 Listen</button>
        <div class="options-grid">
          ${options.map(opt => `<button class="option-btn" data-val="${opt}">${opt}</button>`).join('')}
        </div>
        <div id="feedback"></div>
      </div>
    `;

    speak(w.en, rate);
    document.getElementById('listen-btn').addEventListener('click', () => speak(w.en, rate));
    firstTry = true;

    container.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.val === w.en;
        container.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

        if (isCorrect) {
          btn.classList.add('correct');
          playDing();
          const xp = addXP(getState(), firstTry ? 'correct_first' : 'correct_retry');
          save();
          showXPFly(xp);
          document.getElementById('feedback').innerHTML = `<div class="feedback-box correct">✅ Correct! "${w.en}" = "${w.vi}"</div>`;
          setTimeout(() => { idx++; firstTry = true; show(); }, 1200);
        } else {
          btn.classList.add('wrong');
          container.querySelectorAll(`.option-btn[data-val="${w.en}"]`).forEach(b => b.classList.add('reveal'));
          playBuzz();
          firstTry = false;
          document.getElementById('feedback').innerHTML = `<div class="feedback-box wrong">❌ The answer is "${w.en}"</div>`;
          setTimeout(() => { idx++; show(); }, 1500);
        }
      });
    });
  }

  show();
}

function renderSpelling(container, words, topicId, rate, onDone) {
  const questions = shuffle(words).slice(0, Math.min(4, words.length));
  let idx = 0;

  function show() {
    if (idx >= questions.length) { onDone(); return; }
    const w = questions[idx];

    container.innerHTML = `
      <div class="exercise-wrapper slide-up">
        <div class="exercise-header">
          <h3>✍️ Spelling</h3>
          <span class="ex-counter">${idx + 1} / ${questions.length}</span>
        </div>
        <div style="text-align:center;font-size:3.5rem;margin:0.5rem 0">${w.emoji}</div>
        <p style="text-align:center;color:var(--color-text-light)">Listen and type the word:</p>
        <button class="btn listen-btn" id="spell-listen">🔊 Listen</button>
        <div class="text-input-row">
          <input class="text-input" type="text" id="spell-input" placeholder="Type the word..." autocomplete="off" autocorrect="off" spellcheck="false">
          <button class="btn btn-primary" id="spell-check">Check</button>
        </div>
        <div id="spell-feedback"></div>
      </div>
    `;

    speak(w.en, rate);
    document.getElementById('spell-listen').addEventListener('click', () => speak(w.en, rate));

    const input = document.getElementById('spell-input');
    input.focus();

    function check() {
      const val = input.value.trim().toLowerCase();
      const correct = w.en.toLowerCase();
      if (val === correct) {
        input.classList.add('correct');
        playDing();
        const xp = addXP(getState(), 'correct_first');
        save();
        showXPFly(xp);
        document.getElementById('spell-feedback').innerHTML = `<div class="feedback-box correct">✅ Great spelling!</div>`;
        setTimeout(() => { idx++; show(); }, 1000);
      } else {
        input.classList.add('wrong');
        playBuzz();
        document.getElementById('spell-feedback').innerHTML = `<div class="feedback-box wrong">❌ The correct spelling is "<strong>${w.en}</strong>"</div>`;
        speak(w.en, rate);
        setTimeout(() => { idx++; show(); }, 1800);
      }
    }

    document.getElementById('spell-check').addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  }

  show();
}
