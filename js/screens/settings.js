import { getState, getProfileName, save } from '../state.js';
import { deleteProfile } from '../utils/storage.js';
import { clearAICache } from '../utils/gemini.js';

const AVATARS = ['🐱','🐶','🦊','🐸','🦁','🐧','🦋','🐬','🦄','🐙','🐼','🦉','🐺','🦖','🐲'];

export function renderSettings(container) {
  const state = getState();
  const currentRate = state.settings?.ttsRate ?? 1.0;

  container.innerHTML = `
    <div class="settings-screen">
      <h1>⚙️ Settings</h1>

      <div class="settings-section">
        <h2>Choose Avatar</h2>
        <div class="avatar-grid">
          ${AVATARS.map(a => `
            <button class="avatar-btn ${state.profile.avatar === a ? 'selected' : ''}" data-avatar="${a}">${a}</button>
          `).join('')}
        </div>
      </div>

      <div class="settings-section">
        <h2>🔊 Voice Speed</h2>
        <div class="speed-buttons">
          <button class="btn speed-btn ${currentRate === 0.7 ? 'active' : ''}" data-rate="0.7">🐢 Slow</button>
          <button class="btn speed-btn ${currentRate === 1.0 ? 'active' : ''}" data-rate="1">🚶 Normal</button>
          <button class="btn speed-btn ${currentRate === 1.3 ? 'active' : ''}" data-rate="1.3">🐇 Fast</button>
        </div>
      </div>

      <div class="settings-section">
        <h2>👤 Profile</h2>
        <div style="color:var(--color-text-light);font-size:0.9rem">
          <p>Name: <strong>${state.profile.name}</strong></p>
          <p>Level: <strong>${state.profile.level}</strong></p>
          <p>Total XP: <strong>${state.profile.totalXP}</strong></p>
        </div>
      </div>

      <div class="settings-section">
        <h2>👨‍👩‍👧 Parent Mode</h2>
        <p style="color:var(--color-text-light);font-size:0.85rem;margin-bottom:0.8rem">
          Add custom vocabulary for your child, view their progress, and manage settings.
        </p>
        <button class="btn btn-primary" id="parent-btn" style="width:100%">🔐 Enter Parent Mode</button>
        <button class="btn" id="clear-cache-btn" style="width:100%;margin-top:0.5rem;font-size:0.85rem;color:var(--color-text-light)">
          🔄 Refresh AI exercises
        </button>
      </div>

      <div class="settings-section danger-zone">
        <h2 style="color:var(--color-error)">⚠️ Danger Zone</h2>
        <p style="color:var(--color-text-light);font-size:0.85rem;margin-bottom:0.8rem">
          This will delete all progress for this profile. This cannot be undone.
        </p>
        <button class="btn btn-danger" id="reset-btn">🗑️ Reset All Data</button>
      </div>
    </div>
  `;

  container.querySelectorAll('.avatar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.profile.avatar = btn.dataset.avatar;
      save();
      renderSettings(container);
    });
  });

  container.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!state.settings) state.settings = {};
      state.settings.ttsRate = parseFloat(btn.dataset.rate);
      save();
      renderSettings(container);
    });
  });

  document.getElementById('parent-btn').addEventListener('click', () => {
    location.hash = '#parent';
  });

  document.getElementById('clear-cache-btn').addEventListener('click', () => {
    clearAICache();
    const btn = document.getElementById('clear-cache-btn');
    btn.textContent = '✅ Done! Go to Daily for new exercises';
    btn.disabled = true;
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm(`Reset all data for "${state.profile.name}"?\n\nThis will delete all XP, streaks, progress and cached data. This cannot be undone.`)) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('movers_') || k.startsWith('dict_'))) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      location.href = 'index.html';
    }
  });
}
