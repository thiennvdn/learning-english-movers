import { TOPICS, TOPIC_ORDER } from '../data/vocabulary.js';
import { GRAMMAR_EXERCISES } from '../data/grammar.js';
import { LISTENING_EXERCISES } from '../data/listening.js';
import { getState, save } from '../state.js';
import { addXP, checkBadges, updateStreak, getTodayStr } from '../utils/gamification.js';
import { playComplete } from '../utils/audio.js';
import { renderVocabularySession } from '../modules/vocabulary.js';
import { renderListeningSession } from '../modules/listening.js';
import { renderGrammarSession } from '../modules/grammar.js';
import { renderWritingSession } from '../modules/writing.js';

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDailyTasks(state) {
  const today = getTodayStr();
  if (state.daily.date === today && state.daily.tasks?.length > 0) {
    return state.daily.tasks;
  }

  const topicProgress = state.progress.topics || {};
  const sorted = TOPIC_ORDER.slice().sort((a, b) => {
    const aLast = topicProgress[a]?.lastPracticed || '0000-00-00';
    const bLast = topicProgress[b]?.lastPracticed || '0000-00-00';
    return aLast.localeCompare(bLast);
  });

  const t1 = sorted[0];
  const t2 = sorted[1];

  const words1 = shuffle(TOPICS[t1].words).slice(0, 5);
  const words2 = shuffle(TOPICS[t2].words).slice(0, 5);

  const listen1 = LISTENING_EXERCISES.filter(e => e.topic === t1);
  const listen2 = LISTENING_EXERCISES.filter(e => e.topic === t2);
  const allListening = shuffle([...listen1, ...listen2]).slice(0, 2);

  const grammarPool = shuffle([...GRAMMAR_EXERCISES]).slice(0, 5);
  const writingWords = shuffle([...words1, ...words2]);

  const tasks = [
    { type: 'vocabulary', topic: t1, label: `📖 ${TOPICS[t1].name} Vocabulary`, words: words1, id: `vocab_${t1}` },
    { type: 'vocabulary', topic: t2, label: `📖 ${TOPICS[t2].name} Vocabulary`, words: words2, id: `vocab_${t2}` },
    { type: 'listening', label: '🎧 Listening', exercises: allListening, id: 'listening' },
    { type: 'grammar', label: '📝 Grammar', exercises: grammarPool, id: 'grammar' },
    { type: 'writing', label: '✏️ Writing', words: writingWords, id: 'writing' },
  ];

  state.daily = { date: today, tasks, completedTasks: [], xpToday: state.daily?.xpToday || 0 };
  save();
  return tasks;
}

export function renderDaily(container) {
  const state = getState();
  const tasks = generateDailyTasks(state);
  const completed = state.daily.completedTasks || [];

  // Find next incomplete task
  const nextIdx = tasks.findIndex(t => !completed.includes(t.id));

  if (nextIdx === -1) {
    renderCompletion(container, state);
    return;
  }

  renderTaskUI(container, tasks, nextIdx, state);
}

function renderTaskUI(container, tasks, currentIdx, state) {
  const completed = state.daily.completedTasks || [];
  const task = tasks[currentIdx];

  container.innerHTML = `
    <div class="daily-screen">
      <div class="daily-header">
        <h2>📅 Daily Lesson</h2>
        <span class="daily-xp">⭐ ${state.daily.xpToday || 0} XP</span>
      </div>
      <div class="task-steps">
        ${tasks.map((t, i) => {
          let cls = 'task-step';
          if (completed.includes(t.id)) cls += ' done';
          else if (i === currentIdx) cls += ' active';
          return `<div class="${cls}" title="${t.label}"></div>`;
        }).join('')}
      </div>
      <div style="text-align:center;margin:0.3rem 0;color:var(--color-text-light);font-size:0.85rem">
        Step ${currentIdx + 1} of ${tasks.length} — ${task.label}
      </div>
      <div class="exercise-container" id="exercise-area"></div>
    </div>
  `;

  const area = document.getElementById('exercise-area');

  function onTaskComplete() {
    state.daily.completedTasks = [...(state.daily.completedTasks || []), task.id];
    addXP(state, 'module_complete');
    updateStreak(state);
    save();

    const nextIncomplete = tasks.findIndex(t => !(state.daily.completedTasks || []).includes(t.id));
    if (nextIncomplete === -1) {
      // All tasks done — daily bonus
      addXP(state, 'daily_complete');
      checkBadges(state);
      save();
      renderCompletion(container, state);
    } else {
      renderTaskUI(container, tasks, nextIncomplete, state);
    }
  }

  if (task.type === 'vocabulary') {
    renderVocabularySession(area, task.words, task.topic, onTaskComplete);
  } else if (task.type === 'listening') {
    renderListeningSession(area, task.exercises, onTaskComplete);
  } else if (task.type === 'grammar') {
    renderGrammarSession(area, task.exercises, onTaskComplete);
  } else if (task.type === 'writing') {
    renderWritingSession(area, task.words, onTaskComplete);
  }
}

function renderCompletion(container, state) {
  const newBadges = checkBadges(state);
  save();
  playComplete();
  showConfetti();

  const badgeHtml = newBadges.length
    ? `<div style="margin:1rem 0">
        <h3>🏆 New Badges!</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;margin-top:0.5rem">
          ${newBadges.map(b => `<span class="badge-pill badge-new">${b.emoji} ${b.name}</span>`).join('')}
        </div>
       </div>`
    : '';

  container.innerHTML = `
    <div class="completion-screen slide-up">
      <div class="big-emoji">🎆</div>
      <h1>Amazing job!</h1>
      <div class="xp-earned">+${state.daily.xpToday} XP today!</div>
      <div style="color:var(--color-text-light)">🔥 ${state.streak.current} day streak</div>
      ${badgeHtml}
      <button class="btn btn-primary btn-large" id="go-home" style="margin-top:1rem">🏠 Go Home</button>
      <button class="btn btn-secondary" id="go-learn" style="margin-top:0.5rem">📚 Keep Learning</button>
    </div>
  `;

  document.getElementById('go-home').addEventListener('click', () => { location.hash = '#home'; });
  document.getElementById('go-learn').addEventListener('click', () => { location.hash = '#learn'; });
}

function showConfetti() {
  const colors = ['#FFB347','#4A90E2','#5CB85C','#E74C3C','#9B59B6','#F1C40F'];
  for (let i = 0; i < 50; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    const size = 8 + Math.random() * 8;
    dot.style.cssText = `
      position:fixed;
      left:${Math.random() * 100}vw;
      top:-20px;
      width:${size}px;
      height:${size}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation:fall ${1 + Math.random() * 1.5}s linear ${Math.random() * 0.8}s forwards;
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 3000);
  }
}
