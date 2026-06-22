import { getState } from '../state.js';
import { getLevelName } from '../utils/gamification.js';

export function renderHome(container) {
  const state = getState();
  const { profile, streak, daily } = state;
  const done  = daily.completedTasks?.length || 0;
  const total = daily.tasks?.length || 0;
  const levelName = getLevelName(profile.level);
  const todayXP = daily.xpToday || 0;
  const nextLevel = (profile.level) * 200;
  const prevLevel = (profile.level - 1) * 200;
  const levelPct  = Math.min(100, Math.round(((profile.totalXP - prevLevel) / (nextLevel - prevLevel)) * 100));

  let ctaLabel = '▶ Start Today\'s Lesson';
  let ctaClass = 'btn-primary';
  if (total > 0 && done === total) {
    ctaLabel = '🎉 Lesson Complete!';
    ctaClass = 'btn-success';
  } else if (done > 0) {
    ctaLabel = '▶ Continue Lesson';
  }

  const taskPct = total > 0 ? Math.round((done / total) * 100) : 0;

  container.innerHTML = `
    <div class="home-screen">

      <div class="greeting">
        <div style="display:flex;align-items:center;gap:0.7rem;margin-bottom:0.5rem">
          <span style="font-size:3rem;line-height:1">${profile.avatar}</span>
          <div>
            <div style="font-size:0.82rem;color:rgba(255,255,255,0.75);font-weight:700;margin-bottom:0.1rem">Hello!</div>
            <h1 style="font-size:1.6rem;line-height:1.1">${profile.name} 👋</h1>
          </div>
        </div>
        <div class="chips-row">
          <span class="chip chip-fire">🔥 ${streak.current} day streak</span>
          <span class="chip chip-xp">⭐ ${todayXP} XP today</span>
          <span class="chip chip-level">🏅 Lv.${profile.level}</span>
        </div>
        <div style="margin-top:0.8rem">
          <div style="display:flex;justify-content:space-between;font-size:0.76rem;color:rgba(255,255,255,0.8);font-weight:700;margin-bottom:0.3rem">
            <span>${levelName}</span>
            <span>${profile.totalXP} / ${nextLevel} XP</span>
          </div>
          <div style="height:8px;background:rgba(255,255,255,0.2);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${levelPct}%;background:#FFD700;border-radius:4px;transition:width 0.6s ease"></div>
          </div>
        </div>
      </div>

      <div class="daily-card card">
        <div class="daily-card-header">
          <h2>📅 Daily Lesson</h2>
          <span class="daily-progress">${total > 0 ? `${done} / ${total}` : '0 / 5'}</span>
        </div>
        <div class="progress-bar" style="margin-bottom:0.5rem">
          <div class="progress-fill" style="width:${taskPct}%"></div>
        </div>
        <div style="display:flex;gap:0.4rem;margin-bottom:1rem">
          ${Array.from({length: total || 5}, (_, i) => {
            const isDone   = i < done;
            const isActive = i === done && done < (total || 5);
            const bg = isDone ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-border)';
            const fg = (isDone || isActive) ? '#fff' : 'var(--color-text-light)';
            return `<div style="flex:1;height:28px;border-radius:999px;background:${bg};display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;color:${fg};transition:all 0.3s">${isDone ? '✓' : i + 1}</div>`;
          }).join('')}
        </div>
        <button class="btn ${ctaClass} btn-large" id="start-daily">${ctaLabel}</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.7rem">
        <div class="card" style="text-align:center;padding:1rem 0.5rem">
          <div style="font-size:2rem">🔥</div>
          <div style="font-weight:900;font-size:1.4rem;color:var(--color-error)">${streak.current}</div>
          <div style="font-size:0.72rem;color:var(--color-text-light);font-weight:700">Day Streak</div>
        </div>
        <div class="card" style="text-align:center;padding:1rem 0.5rem">
          <div style="font-size:2rem">⭐</div>
          <div style="font-weight:900;font-size:1.4rem;color:var(--color-secondary)">${profile.totalXP}</div>
          <div style="font-size:0.72rem;color:var(--color-text-light);font-weight:700">Total XP</div>
        </div>
        <div class="card" style="text-align:center;padding:1rem 0.5rem">
          <div style="font-size:2rem">🏆</div>
          <div style="font-weight:900;font-size:1.4rem;color:var(--color-primary)">${(state.badges || []).length}</div>
          <div style="font-size:0.72rem;color:var(--color-text-light);font-weight:700">Badges</div>
        </div>
      </div>

      <div class="quick-actions">
        <button class="btn btn-secondary" id="go-learn">📚 Topics</button>
        <button class="btn btn-secondary" id="go-progress">📊 Progress</button>
      </div>

    </div>
  `;

  document.getElementById('start-daily').addEventListener('click', () => { location.hash = '#daily'; });
  document.getElementById('go-learn').addEventListener('click', () => { location.hash = '#learn'; });
  document.getElementById('go-progress').addEventListener('click', () => { location.hash = '#progress'; });
}
