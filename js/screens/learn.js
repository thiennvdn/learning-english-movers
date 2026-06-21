import { TOPICS, TOPIC_ORDER } from '../data/vocabulary.js';
import { LISTENING_EXERCISES } from '../data/listening.js';
import { GRAMMAR_EXERCISES } from '../data/grammar.js';
import { getState, save } from '../state.js';
import { getTopicCompletion } from '../utils/gamification.js';
import { renderVocabularySession } from '../modules/vocabulary.js';
import { renderListeningSession } from '../modules/listening.js';
import { renderGrammarSession } from '../modules/grammar.js';
import { renderWritingSession } from '../modules/writing.js';

export function renderLearn(container) {
  const state = getState();

  container.innerHTML = `
    <div class="learn-screen">
      <h1>📚 Topics</h1>
      <div class="topic-grid">
        ${TOPIC_ORDER.map(id => {
          const topic = TOPICS[id];
          const pct = getTopicCompletion(state, id);
          return `<div class="topic-card card" data-topic="${id}">
            <div class="topic-emoji">${topic.emoji}</div>
            <div class="topic-name">${topic.name}</div>
            <div class="topic-pct">${pct}%</div>
            <div class="mini-progress"><div style="width:${pct}%"></div></div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.topic-card').forEach(card => {
    card.addEventListener('click', () => renderTopicDetail(container, card.dataset.topic));
  });
}

function renderTopicDetail(container, topicId) {
  const topic = TOPICS[topicId];
  const state = getState();
  const pct = getTopicCompletion(state, topicId);

  container.innerHTML = `
    <div class="topic-detail slide-up">
      <button class="btn btn-sm back-btn" id="back-btn">← Back</button>
      <div style="text-align:center;padding:1rem 0">
        <div style="font-size:4rem">${topic.emoji}</div>
        <h1>${topic.name}</h1>
        <div style="color:var(--color-text-light);margin-top:0.3rem">${pct}% complete · ${topic.words.length} words</div>
      </div>
      <div class="module-buttons">
        <button class="btn btn-module" data-module="vocabulary">📖 Vocabulary</button>
        <button class="btn btn-module" data-module="listening">🎧 Listening</button>
        <button class="btn btn-module" data-module="grammar">📝 Grammar</button>
        <button class="btn btn-module" data-module="writing">✏️ Writing</button>
      </div>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', () => renderLearn(container));

  container.querySelectorAll('[data-module]').forEach(btn => {
    btn.addEventListener('click', () => launchModule(container, btn.dataset.module, topicId));
  });
}

function launchModule(container, moduleType, topicId) {
  const topic = TOPICS[topicId];
  const state = getState();

  const onComplete = () => {
    save();
    renderTopicDetail(container, topicId);
  };

  container.innerHTML = '';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:0.8rem;margin-bottom:1rem';
  header.innerHTML = `
    <button class="btn btn-sm" id="module-back">← Back</button>
    <span style="font-weight:700">${topic.emoji} ${topic.name} — ${getModuleLabel(moduleType)}</span>
  `;
  container.appendChild(header);

  document.getElementById('module-back').addEventListener('click', () => renderTopicDetail(container, topicId));

  const exerciseContainer = document.createElement('div');
  container.appendChild(exerciseContainer);

  if (moduleType === 'vocabulary') {
    renderVocabularySession(exerciseContainer, topic.words, topicId, onComplete);
  } else if (moduleType === 'listening') {
    const exercises = LISTENING_EXERCISES.filter(e => e.topic === topicId);
    renderListeningSession(exerciseContainer, exercises, onComplete);
  } else if (moduleType === 'grammar') {
    const exercises = shuffle([...GRAMMAR_EXERCISES]).slice(0, 5);
    renderGrammarSession(exerciseContainer, exercises, onComplete);
  } else if (moduleType === 'writing') {
    renderWritingSession(exerciseContainer, topic.words, onComplete);
  }
}

function getModuleLabel(type) {
  return { vocabulary:'📖 Vocabulary', listening:'🎧 Listening', grammar:'📝 Grammar', writing:'✏️ Writing' }[type] || type;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
