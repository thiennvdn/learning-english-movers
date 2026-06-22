import { loadProfile, getState } from './state.js';
import { checkBadges } from './utils/gamification.js';
import { save } from './state.js';
import { renderHome } from './screens/home.js';
import { renderLearn } from './screens/learn.js';
import { renderDaily } from './screens/daily.js';
import { renderProgress } from './screens/progress.js';
import { renderSettings } from './screens/settings.js';

const SCREENS = {
  home: renderHome,
  daily: renderDaily,
  learn: renderLearn,
  progress: renderProgress,
  settings: renderSettings,
};

async function init() {
  const params = new URLSearchParams(location.search);
  const name = params.get('profile');
  if (!name) { location.href = 'index.html'; return; }

  loadProfile(name);
  const state = getState();
  if (!state) { location.href = 'index.html'; return; }

  checkBadges(state);
  save();

  const container = document.getElementById('screen');
  const tabs = document.querySelectorAll('.tab-nav a');

  function navigate(hash) {
    const screen = (hash || '').replace('#', '') || 'home';
    const validScreen = SCREENS[screen] ? screen : 'home';

    tabs.forEach(t => t.classList.toggle('active', t.dataset.screen === validScreen));

    container.innerHTML = '';
    container.className = 'screen-container slide-up';
    SCREENS[validScreen](container);
  }

  window.addEventListener('hashchange', () => navigate(location.hash));

  tabs.forEach(t => {
    t.addEventListener('click', e => {
      e.preventDefault();
      location.hash = '#' + t.dataset.screen;
    });
  });

  navigate(location.hash || '#home');
}

document.addEventListener('DOMContentLoaded', init);
