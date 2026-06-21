import { getState } from '../state.js';
import { getAllBadgeDefs, getTopicCompletion, getLast7DaysXP } from '../utils/gamification.js';
import { TOPICS, TOPIC_ORDER } from '../data/vocabulary.js';

export function renderProgress(container) {
  const state = getState();
  const { streak, profile } = state;

  const last7 = getLast7DaysXP(state);
  const todayXP = last7[6].xp;
  const yesterdayXP = last7[5].xp;
  const maxXP = Math.max(...last7.map(d => d.xp), 1);

  let motivational = '';
  if (todayXP > yesterdayXP) {
    motivational = `You earned ${todayXP - yesterdayXP} more XP than yesterday! 🎉`;
  } else if (todayXP === yesterdayXP && todayXP > 0) {
    motivational = `Same as yesterday — keep going! 💪`;
  } else if (todayXP > 0) {
    motivational = `You're ${yesterdayXP - todayXP} XP away from yesterday's score! 💪`;
  } else {
    motivational = `Start today's lesson to earn XP! ⭐`;
  }

  const calendarHtml = buildCalendar(streak.history || []);
  const badgeDefs = getAllBadgeDefs();
  const earnedBadges = state.badges || [];

  container.innerHTML = `
    <div class="progress-screen">
      <h1>📊 My Progress</h1>

      <div class="progress-section card" style="padding:1.2rem">
        <h2>🔥 Streak</h2>
        <div style="font-size:3rem;text-align:center;font-weight:800;color:var(--color-secondary)">
          ${streak.current} day${streak.current !== 1 ? 's' : ''}
        </div>
        <div class="streak-calendar" style="margin-top:0.8rem">
          ${calendarHtml}
        </div>
      </div>

      <div class="progress-section card" style="padding:1.2rem">
        <h2>⭐ XP This Week</h2>
        <div class="motivational">${motivational}</div>
        <div class="bar-chart" style="margin-top:0.8rem">
          ${last7.map(d => `
            <div class="bar-row">
              <span class="bar-label">${d.label}</span>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(d.xp / maxXP) * 100}%"></div>
              </div>
              <span class="bar-val">${d.xp}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="progress-section card" style="padding:1.2rem">
        <h2>🏆 Badges (${earnedBadges.length}/${badgeDefs.length})</h2>
        <div class="badge-grid" style="margin-top:0.8rem">
          ${badgeDefs.map(def => {
            const earned = earnedBadges.includes(def.id);
            return `<div class="badge-item ${earned ? '' : 'locked'}" title="${def.name}">
              <div class="badge-emoji">${def.emoji}</div>
              <div class="badge-name">${def.name}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="progress-section card" style="padding:1.2rem">
        <h2>📚 Topics</h2>
        <div class="topic-progress-list" style="margin-top:0.8rem">
          ${TOPIC_ORDER.map(id => {
            const topic = TOPICS[id];
            const pct = getTopicCompletion(state, id);
            return `<div class="topic-prog-row">
              <span class="topic-prog-emoji">${topic.emoji}</span>
              <span class="topic-prog-name">${topic.name}</span>
              <div class="topic-prog-bar">
                <div class="topic-prog-fill" style="width:${pct}%"></div>
              </div>
              <span class="topic-prog-pct">${pct}%</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function buildCalendar(studiedDates) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = today.toISOString().slice(0, 10);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  let html = `<div style="text-align:center;font-weight:700;margin-bottom:0.5rem;color:var(--color-text-light)">${monthName}</div>`;

  // Day headers
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  html += dayNames.map(d => `<div style="text-align:center;font-size:0.65rem;font-weight:700;color:var(--color-text-light)">${d}</div>`).join('');

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div></div>`;
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const isStudied = studiedDates.includes(dateStr);
    const isToday = dateStr === todayStr;
    let cls = 'cal-day empty';
    if (isStudied) cls = 'cal-day studied';
    if (isToday) cls += ' today';
    html += `<div class="${cls}">${day}</div>`;
  }

  return html;
}
