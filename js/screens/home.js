import { getState } from '../state.js';
import { getLevelName } from '../utils/gamification.js';

export function renderHome(container) {
  const state = getState();
  const { profile, streak, daily } = state;
  const done = daily.completedTasks?.length || 0;
  const total = daily.tasks?.length || 0;
  const levelName = getLevelName(profile.level);
  const todayXP = daily.xpToday || 0;

  let ctaLabel = '▶ Start Today\'s Lesson';
  let ctaClass = 'btn-primary';
  if (total > 0 && done === total) {
    ctaLabel = '✅ Lesson Complete!';
    ctaClass = 'btn-success';
  } else if (done > 0) {
    ctaLabel = '▶ Continue Lesson';
  }

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  container.innerHTML = `
    <div class="home-screen">
      <div class="greeting">
        <h1>${profile.avatar} Hello, ${profile.name}!</h1>
        <div class="chips-row">
          <span class="chip chip-fire">🔥 ${streak.current} day${streak.current !== 1 ? 's' : ''}</span>
          <span class="chip chip-xp">⭐ ${todayXP} XP today</span>
          <span class="chip chip-level">Lv.${profile.level} ${levelName}</span>
        </div>
      </div>

      <div class="daily-card card">
        <div class="daily-card-header">
          <h2>📅 Today's Lesson</h2>
          <span class="daily-progress">${total > 0 ? `${done}/${total} done` : 'Ready!'}</span>
        </div>
        <div class="progress-bar" style="margin-bottom:1rem">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <button class="btn ${ctaClass} btn-large" id="start-daily">${ctaLabel}</button>
      </div>

      <div class="stats-row" style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem">
        <div class="card" style="text-align:center;padding:1rem">
          <div style="font-size:2rem">⭐</div>
          <div style="font-weight:800;font-size:1.3rem;color:var(--color-secondary)">${profile.totalXP}</div>
          <div style="font-size:0.8rem;color:var(--color-text-light)">Total XP</div>
        </div>
        <div class="card" style="text-align:center;padding:1rem">
          <div style="font-size:2rem">🏆</div>
          <div style="font-weight:800;font-size:1.3rem;color:var(--color-primary)">${(state.badges || []).length}</div>
          <div style="font-size:0.8rem;color:var(--color-text-light)">Badges</div>
        </div>
      </div>

      <div class="quick-actions">
        <button class="btn btn-secondary" id="go-learn">📚 Browse Topics</button>
        <button class="btn btn-secondary" id="go-progress">📊 My Progress</button>
      </div>
    </div>
  `;

  document.getElementById('start-daily').addEventListener('click', () => {
    location.hash = '#daily';
  });
  document.getElementById('go-learn').addEventListener('click', () => {
    location.hash = '#learn';
  });
  document.getElementById('go-progress').addEventListener('click', () => {
    location.hash = '#progress';
  });
}
