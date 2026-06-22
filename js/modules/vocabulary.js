import { speak, getTTSRate } from '../utils/tts.js';
import { playDing, playBuzz } from '../utils/audio.js';
import { addXP, markWordLearned } from '../utils/gamification.js';
import { getState, save } from '../state.js';
import { lookupWord, playWordAudio } from '../utils/dictionary.js';

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

function shortDef(str, max = 60) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max).replace(/\s\w+$/, '') + '…' : str;
}

export async function renderVocabularySession(container, words, topicId, onComplete) {
  const rate = getTTSRate();
  const sessionWords = shuffle(words).slice(0, Math.min(10, words.length));

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:40vh;flex-direction:column;gap:0.8rem">
      <div style="font-size:2.5rem;animation:pulse 1s infinite">📖</div>
      <p style="color:var(--color-text-light)">Loading word data…</p>
    </div>`;

  const dictCache = {};
  await Promise.allSettled(
    sessionWords.map(async w => {
      dictCache[w.en] = await lookupWord(w.en);
    })
  );

  const phases = ['flashcards', 'match', 'fillblank', 'spelling', 'context'];
  let phaseIdx = 0;

  function nextPhase() {
    if (phaseIdx >= phases.length) { onComplete(); return; }
    const phase = phases[phaseIdx++];
    container.innerHTML = '';
    if (phase === 'flashcards') renderFlashcards(container, sessionWords, topicId, rate, dictCache, nextPhase);
    else if (phase === 'match')     renderMatch(container, sessionWords.slice(0, 6), topicId, rate, dictCache, nextPhase);
    else if (phase === 'fillblank') renderFillBlank(container, sessionWords, topicId, rate, dictCache, nextPhase);
    else if (phase === 'spelling')  renderSpelling(container, sessionWords.slice(0, 6), topicId, rate, dictCache, nextPhase);
    else if (phase === 'context')   renderContext(container, sessionWords, topicId, rate, dictCache, nextPhase);
  }

  nextPhase();
}

function playWord(w, dictCache, rate) {
  const audio = dictCache[w.en]?.audio;
  playWordAudio(audio, () => speak(w.en, rate));
}

function renderFlashcards(container, words, topicId, rate, dictCache, onDone) {
  let idx = 0;

  function show() {
    if (idx >= words.length) { onDone(); return; }
    const w = words[idx];
    const dict = dictCache[w.en];
    const state = getState();
    markWordLearned(state, topicId, w.en);
    const xp = addXP(state, 'flashcard');
    save();

    const phonetic = dict?.phonetic ? `<span style="color:var(--color-text-light);font-size:1rem">${dict.phonetic}</span>` : '';
    const pos = dict?.partOfSpeech ? `<em style="color:var(--color-text-light);font-size:0.9rem">${dict.partOfSpeech}</em>` : '';
    const def = dict?.definition
      ? `<div style="font-size:1rem;line-height:1.5;color:var(--color-text);margin:0.4rem 0">${dict.definition}</div>`
      : `<div style="font-size:1rem;color:var(--color-text-light)">Look it up in the dictionary!</div>`;
    const example = dict?.example
      ? `<div style="font-size:0.9rem;color:var(--color-text-light);font-style:italic;margin-top:0.3rem">"${dict.example}"</div>`
      : '';

    container.innerHTML = `
      <div class="exercise-wrapper slide-up">
        <div class="exercise-header">
          <h3>📖 Flashcards</h3>
          <span class="ex-counter">${idx + 1} / ${words.length}</span>
        </div>
        <div class="flashcard" id="fc-card">
          <div class="fc-emoji">${w.emoji}</div>
          <div class="fc-word">${w.en}</div>
          ${phonetic}
          <button class="btn btn-sm" id="fc-play" style="margin-top:0.5rem">🔊 Listen</button>
        </div>
        <div id="fc-back" style="display:none" class="flashcard">
          <div class="fc-emoji">${w.emoji}</div>
          <div class="fc-word">${w.en}</div>
          ${pos}
          ${def}
          ${example}
        </div>
        <div class="fc-controls">
          <button class="btn btn-secondary" id="fc-flip">👁 See definition</button>
          <button class="btn btn-primary" id="fc-next" style="display:none">Next ➡</button>
        </div>
      </div>
    `;

    playWord(w, dictCache, rate);

    document.getElementById('fc-play').addEventListener('click', () => playWord(w, dictCache, rate));
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

function renderMatch(container, words, topicId, rate, dictCache, onDone) {
  const items = shuffle(words);
  let selected = null;
  let matched = 0;

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
        selected = btn;
        btn.classList.add('selected');
        if (btn.dataset.type === 'emoji') playWord(items[btn.dataset.idx], dictCache, rate);
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

function renderFillBlank(container, words, topicId, rate, dictCache, onDone) {
  const questions = shuffle(words).slice(0, Math.min(8, words.length));
  let idx = 0;
  let firstTry = true;

  function show() {
    if (idx >= questions.length) { onDone(); return; }
    const w = questions[idx];
    const others = words.filter(x => x.en !== w.en);
    const distractors = shuffle(others).slice(0, 2).map(x => x.en);
    const options = shuffle([w.en, ...distractors]);
    const dict = dictCache[w.en];
    const hint = dict?.partOfSpeech ? `(${dict.partOfSpeech})` : '';

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

    playWord(w, dictCache, rate);
    document.getElementById('listen-btn').addEventListener('click', () => playWord(w, dictCache, rate));
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
          const defHint = dict?.definition ? `<br><small>${shortDef(dict.definition)}</small>` : '';
          document.getElementById('feedback').innerHTML = `<div class="feedback-box correct">✅ Correct! <strong>${w.en}</strong> ${hint}${defHint}</div>`;
          setTimeout(() => { idx++; firstTry = true; show(); }, 1400);
        } else {
          btn.classList.add('wrong');
          container.querySelectorAll(`.option-btn[data-val="${w.en}"]`).forEach(b => b.classList.add('reveal'));
          playBuzz();
          firstTry = false;
          document.getElementById('feedback').innerHTML = `<div class="feedback-box wrong">❌ The answer is "<strong>${w.en}</strong>"</div>`;
          setTimeout(() => { idx++; show(); }, 1600);
        }
      });
    });
  }

  show();
}

const CONTEXT_SENTENCES = {
  animals:  (w) => [`I saw a ${w.en} at the zoo yesterday.`, `The ${w.en} is my favourite animal.`, `A ${w.en} can run very fast.`],
  food:     (w) => [`I love eating ${w.en} for breakfast.`, `She bought some ${w.en} at the market.`, `Can I have a ${w.en}, please?`],
  sports:   (w) => [`He is really good at ${w.en}.`, `We do ${w.en} every Saturday morning.`, `She won a medal for ${w.en}.`],
  school:   (w) => [`I forgot my ${w.en} at home today.`, `The teacher used a ${w.en} to explain.`, `Please put your ${w.en} on the desk.`],
  family:   (w) => [`My ${w.en} is very kind and funny.`, `I love spending time with my ${w.en}.`, `Her ${w.en} lives in another city.`],
  clothes:  (w) => [`She is wearing a red ${w.en} today.`, `I need a new ${w.en} for the winter.`, `He put on his ${w.en} and went out.`],
  places:   (w) => [`We visited the ${w.en} last weekend.`, `There is a beautiful ${w.en} near my house.`, `Let's meet at the ${w.en} at noon.`],
  transport:(w) => [`We took the ${w.en} to the city centre.`, `The ${w.en} arrived right on time.`, `I go to school by ${w.en} every day.`],
  weather:  (w) => [`It was ${w.en} all day yesterday.`, `I do not like ${w.en} weather at all.`, `It looks ${w.en} outside — bring an umbrella!`],
  body:     (w) => [`My ${w.en} hurts after playing football.`, `She raised her ${w.en} to answer the question.`, `Wash your ${w.en}s before you eat!`],
  colors:   (w) => [`My favourite colour is ${w.en}.`, `She painted the wall ${w.en}.`, `The ${w.en} flowers look beautiful today.`],
  numbers:  (w) => [`There are ${w.en} students in our class.`, `I have ${w.en} pets at home.`, `Can you write the number ${w.en}?`],
  _custom:  (w) => [`I use the word ${w.en} every day.`, `Can you say "${w.en}" out loud?`, `The word ${w.en} is very useful.`],
};

function renderContext(container, words, topicId, rate, dictCache, onDone) {
  const questions = shuffle(words).slice(0, Math.min(5, words.length));
  let idx = 0;

  function show() {
    if (idx >= questions.length) { onDone(); return; }
    const w = questions[idx];
    const dict = dictCache[w.en];

    const sentenceTemplates = dict?.example
      ? [dict.example, ...(CONTEXT_SENTENCES[topicId] || CONTEXT_SENTENCES.animals)(w)]
      : (CONTEXT_SENTENCES[topicId] || CONTEXT_SENTENCES.animals)(w);
    const sentence = sentenceTemplates[0];

    const others = words.filter(x => x.en !== w.en);

    const useDefinitions = !!(dict?.definition);

    let opts;
    if (useDefinitions) {
      const distractors = shuffle(others).slice(0, 2).map(x => ({
        en: x.en,
        label: shortDef(dictCache[x.en]?.definition) || x.emoji,
        emoji: x.emoji,
      }));
      opts = shuffle([
        { en: w.en, label: shortDef(dict.definition), emoji: w.emoji },
        ...distractors,
      ]);
    } else {
      const distractors = shuffle(others).slice(0, 2);
      opts = shuffle([w, ...distractors]).map(x => ({ en: x.en, label: x.emoji, emoji: x.emoji }));
    }

    container.innerHTML = `
      <div class="exercise-wrapper slide-up">
        <div class="exercise-header">
          <h3>💬 Word in Context</h3>
          <span class="ex-counter">${idx + 1} / ${questions.length}</span>
        </div>
        <div class="sentence-display" style="font-size:1.1rem;line-height:1.8;margin:0.8rem 0">
          ${sentence.replace(new RegExp(`\\b${w.en}\\b`, 'i'),
            `<span style="background:var(--color-primary);color:#fff;padding:0.1rem 0.5rem;border-radius:6px;font-weight:800">${w.en}</span>`)}
        </div>
        <button class="btn listen-btn" id="ctx-listen" style="margin:0.5rem auto">🔊 Listen</button>
        <p style="text-align:center;color:var(--color-text-light);font-size:0.9rem;margin-bottom:0.6rem">
          What does "<strong>${w.en}</strong>" mean?
        </p>
        <div class="options-grid" style="grid-template-columns:1fr">
          ${opts.map(opt => `
            <button class="option-btn" data-val="${opt.en}" style="font-size:0.95rem;text-align:left">
              ${opt.emoji} ${opt.label}
            </button>
          `).join('')}
        </div>
        <div id="ctx-feedback"></div>
      </div>
    `;

    speak(sentence, rate);
    document.getElementById('ctx-listen').addEventListener('click', () => speak(sentence, rate));

    let firstTry = true;
    container.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
        const isCorrect = btn.dataset.val === w.en;
        const state = getState();

        if (isCorrect) {
          btn.classList.add('correct');
          playDing();
          const xp = addXP(state, firstTry ? 'correct_first' : 'correct_retry');
          save();
          showXPFly(xp);
          document.getElementById('ctx-feedback').innerHTML = `<div class="feedback-box correct">✅ Correct! <strong>${w.en}</strong>${dict?.partOfSpeech ? ` (${dict.partOfSpeech})` : ''}</div>`;
          setTimeout(() => { idx++; show(); }, 1300);
        } else {
          btn.classList.add('wrong');
          container.querySelectorAll(`.option-btn[data-val="${w.en}"]`).forEach(b => b.classList.add('reveal'));
          playBuzz();
          firstTry = false;
          save();
          document.getElementById('ctx-feedback').innerHTML = `<div class="feedback-box wrong">❌ The word is "<strong>${w.en}</strong>"</div>`;
          setTimeout(() => { idx++; show(); }, 1600);
        }
      });
    });
  }

  show();
}

function renderSpelling(container, words, topicId, rate, dictCache, onDone) {
  const questions = shuffle(words).slice(0, Math.min(6, words.length));
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
          <input class="text-input" type="text" id="spell-input" placeholder="Type the word…" autocomplete="off" autocorrect="off" spellcheck="false">
          <button class="btn btn-primary" id="spell-check">Check ✓</button>
        </div>
        <div id="spell-feedback"></div>
      </div>
    `;

    playWord(w, dictCache, rate);
    document.getElementById('spell-listen').addEventListener('click', () => playWord(w, dictCache, rate));

    const input = document.getElementById('spell-input');
    input.focus();

    function check() {
      const val = input.value.trim().toLowerCase();
      if (!val) return;
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
        input.classList.remove('correct');
        playBuzz();
        playWord(w, dictCache, rate);
        document.getElementById('spell-feedback').innerHTML = `<div class="feedback-box wrong">❌ Correct spelling: <strong>${w.en}</strong></div>`;
        setTimeout(() => { idx++; show(); }, 1800);
      }
    }

    document.getElementById('spell-check').addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  }

  show();
}
