import { getState, save } from '../state.js';
import { lookupWord } from '../utils/dictionary.js';
import { getGeminiKey, setGeminiKey, clearAICache } from '../utils/gemini.js';

const PIN_KEY = 'movers_parent_pin';

function getPin() { return localStorage.getItem(PIN_KEY) || ''; }
function savePin(pin) { localStorage.setItem(PIN_KEY, pin); }

export function renderParent(container) {
  const pin = getPin();
  if (!pin) {
    renderSetPin(container);
  } else {
    renderEnterPin(container);
  }
}

function renderSetPin(container) {
  container.innerHTML = `
    <div class="settings-screen">
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:3rem">👨‍👩‍👧</div>
        <h1>Parent Mode</h1>
        <p style="color:var(--color-text-light)">Create a 4-digit PIN to protect this area from your child.</p>
      </div>
      <div class="settings-section">
        <h2>Create PIN</h2>
        <div class="pin-dots" id="pin-dots" style="display:flex;gap:12px;justify-content:center;margin:1rem 0">
          ${[0,1,2,3].map(i => `<div id="dot-${i}" style="width:18px;height:18px;border-radius:50%;border:2.5px solid var(--color-primary);background:transparent"></div>`).join('')}
        </div>
        <div class="pin-pad" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:240px;margin:0 auto">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(n => `
            <button class="btn pin-key" data-val="${n}" style="font-size:1.4rem;padding:0.7rem;${n===''?'visibility:hidden':''}">${n}</button>
          `).join('')}
        </div>
        <p id="pin-msg" style="text-align:center;color:var(--color-error);margin-top:0.8rem;font-size:0.9rem;min-height:1.2em"></p>
        <button class="btn btn-secondary" style="margin-top:1rem;width:100%" id="back-btn">← Back to app</button>
      </div>
    </div>
  `;

  let entered = '';
  let confirming = false;
  let firstPin = '';

  function updateDots(len) {
    [0,1,2,3].forEach(i => {
      const dot = document.getElementById(`dot-${i}`);
      dot.style.background = i < len ? 'var(--color-primary)' : 'transparent';
    });
  }

  container.querySelectorAll('.pin-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.val;
      if (v === '⌫') {
        entered = entered.slice(0, -1);
        updateDots(entered.length);
        return;
      }
      if (v === '' || entered.length >= 4) return;
      entered += v;
      updateDots(entered.length);

      if (entered.length === 4) {
        if (!confirming) {
          firstPin = entered;
          entered = '';
          confirming = true;
          updateDots(0);
          document.getElementById('pin-msg').textContent = 'Enter PIN again to confirm';
        } else {
          if (entered === firstPin) {
            savePin(entered);
            renderDashboard(container);
          } else {
            entered = '';
            firstPin = '';
            confirming = false;
            updateDots(0);
            document.getElementById('pin-msg').textContent = 'PINs did not match. Try again.';
          }
        }
      }
    });
  });

  document.getElementById('back-btn').addEventListener('click', () => { location.hash = '#home'; });
}

function renderEnterPin(container) {
  container.innerHTML = `
    <div class="settings-screen">
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:3rem">🔐</div>
        <h1>Parent Mode</h1>
        <p style="color:var(--color-text-light)">Enter your PIN to continue.</p>
      </div>
      <div class="settings-section">
        <div class="pin-dots" style="display:flex;gap:12px;justify-content:center;margin:1rem 0">
          ${[0,1,2,3].map(i => `<div id="dot-${i}" style="width:18px;height:18px;border-radius:50%;border:2.5px solid var(--color-primary);background:transparent"></div>`).join('')}
        </div>
        <div class="pin-pad" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:240px;margin:0 auto">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(n => `
            <button class="btn pin-key" data-val="${n}" style="font-size:1.4rem;padding:0.7rem;${n===''?'visibility:hidden':''}">${n}</button>
          `).join('')}
        </div>
        <p id="pin-msg" style="text-align:center;color:var(--color-error);margin-top:0.8rem;font-size:0.9rem;min-height:1.2em"></p>
        <button class="btn btn-secondary" style="margin-top:1rem;width:100%" id="back-btn">← Back to app</button>
      </div>
    </div>
  `;

  let entered = '';

  function updateDots(len) {
    [0,1,2,3].forEach(i => {
      const dot = document.getElementById(`dot-${i}`);
      dot.style.background = i < len ? 'var(--color-primary)' : 'transparent';
    });
  }

  container.querySelectorAll('.pin-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.val;
      if (v === '⌫') {
        entered = entered.slice(0, -1);
        updateDots(entered.length);
        return;
      }
      if (v === '' || entered.length >= 4) return;
      entered += v;
      updateDots(entered.length);

      if (entered.length === 4) {
        if (entered === getPin()) {
          renderDashboard(container);
        } else {
          entered = '';
          updateDots(0);
          document.getElementById('pin-msg').textContent = 'Incorrect PIN. Try again.';
        }
      }
    });
  });

  document.getElementById('back-btn').addEventListener('click', () => { location.hash = '#home'; });
}

async function renderDashboard(container) {
  const state = getState();
  const customWords = state.customWords || [];
  const enabled = state.settings?.customWordsEnabled ?? true;

  container.innerHTML = `
    <div class="settings-screen">
      <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:1rem">
        <div style="font-size:2rem">👨‍👩‍👧</div>
        <h1 style="margin:0">Parent Dashboard</h1>
        <button class="btn" style="margin-left:auto;font-size:0.8rem" id="back-btn">✕ Exit</button>
      </div>

      <div class="settings-section">
        <h2>📚 Custom Vocabulary</h2>
        <p style="color:var(--color-text-light);font-size:0.85rem;margin-bottom:0.8rem">
          Add words for your child to study. They will appear as a special "My Words" lesson.
        </p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.8rem">
          <input type="text" id="word-input" placeholder="English word (e.g. astronaut)"
            style="flex:1;min-width:0;padding:0.6rem 0.8rem;border:1.5px solid var(--color-border);border-radius:10px;font-size:0.95rem;font-family:inherit;background:var(--color-card)">
          <input type="text" id="emoji-input" placeholder="Emoji 🌟"
            style="width:80px;padding:0.6rem;border:1.5px solid var(--color-border);border-radius:10px;font-size:1.2rem;text-align:center;font-family:inherit;background:var(--color-card)">
          <button class="btn btn-primary" id="add-word-btn" style="white-space:nowrap">+ Add</button>
        </div>
        <p id="add-msg" style="font-size:0.85rem;min-height:1.2em;color:var(--color-success)"></p>

        <div id="word-list" style="display:flex;flex-direction:column;gap:8px;margin-top:0.5rem">
          ${customWords.length === 0
            ? `<p style="color:var(--color-text-light);font-size:0.9rem">No custom words yet.</p>`
            : customWords.map((w, i) => `
              <div style="display:flex;align-items:center;gap:0.6rem;background:var(--color-card);border:0.5px solid var(--color-border);border-radius:10px;padding:0.6rem 0.8rem">
                <span style="font-size:1.4rem">${w.emoji}</span>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:700">${w.en}</div>
                  ${w.definition ? `<div style="font-size:0.8rem;color:var(--color-text-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${w.definition}</div>` : ''}
                </div>
                <button class="btn" data-del="${i}" style="padding:0.3rem 0.6rem;font-size:0.85rem;color:var(--color-error)">✕</button>
              </div>
            `).join('')
          }
        </div>
      </div>

      <div class="settings-section">
        <h2>⚙️ Settings</h2>
        <label style="display:flex;align-items:center;gap:0.8rem;cursor:pointer">
          <input type="checkbox" id="enable-toggle" ${enabled ? 'checked' : ''}
            style="width:20px;height:20px;cursor:pointer;accent-color:var(--color-primary)">
          <span>Include "My Words" in daily lessons</span>
        </label>
        <p style="color:var(--color-text-light);font-size:0.8rem;margin-top:0.4rem;margin-left:28px">
          Requires at least 4 custom words.
        </p>
      </div>

      <div class="settings-section">
        <h2>🤖 AI Exercises (Gemini)</h2>
        <p style="color:var(--color-text-light);font-size:0.85rem;margin-bottom:0.8rem">
          Paste your free Gemini API key to unlock AI-generated exercises every day.
          Get it at <strong>aistudio.google.com → Get API Key</strong> (free tier).
        </p>
        ${getGeminiKey()
          ? `<p style="color:var(--color-success);font-size:0.9rem;margin-bottom:0.5rem">✅ AI exercises are active</p>`
          : `<p style="color:var(--color-text-light);font-size:0.9rem;margin-bottom:0.5rem">Not configured — using built-in exercises</p>`
        }
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <input type="password" id="ai-key-input" placeholder="${getGeminiKey() ? '••••••••••••••' : 'AIza...'}"
            style="flex:1;min-width:0;padding:0.6rem 0.8rem;border:1.5px solid var(--color-border);border-radius:10px;font-size:0.9rem;font-family:inherit;background:var(--color-card)">
          <button class="btn btn-primary" id="save-ai-btn">Save</button>
          ${getGeminiKey() ? `<button class="btn btn-danger" id="remove-ai-btn">Remove</button>` : ''}
        </div>
      </div>

      <div class="settings-section">
        <h2>🔐 PIN</h2>
        <button class="btn" id="change-pin-btn" style="width:100%">Change PIN</button>
      </div>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', () => { location.hash = '#home'; });

  document.getElementById('change-pin-btn').addEventListener('click', () => {
    localStorage.removeItem(PIN_KEY);
    renderSetPin(container);
  });

  document.getElementById('save-ai-btn').addEventListener('click', () => {
    const val = document.getElementById('ai-key-input').value.trim();
    if (!val) return;
    setGeminiKey(val);
    clearAICache();
    renderDashboard(container);
  });

  document.getElementById('remove-ai-btn')?.addEventListener('click', () => {
    setGeminiKey('');
    clearAICache();
    renderDashboard(container);
  });

  document.getElementById('enable-toggle').addEventListener('change', e => {
    if (!state.settings) state.settings = {};
    state.settings.customWordsEnabled = e.target.checked;
    save();
  });

  container.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.del);
      const words = state.customWords || [];
      words.splice(idx, 1);
      state.customWords = words;
      save();
      renderDashboard(container);
    });
  });

  document.getElementById('add-word-btn').addEventListener('click', () => addWord(container, state));

  document.getElementById('word-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addWord(container, state);
  });
}

async function addWord(container, state) {
  const wordInput = document.getElementById('word-input');
  const emojiInput = document.getElementById('emoji-input');
  const msg = document.getElementById('add-msg');
  const word = wordInput.value.trim().toLowerCase();

  if (!word) return;

  const existing = (state.customWords || []).find(w => w.en === word);
  if (existing) {
    msg.style.color = 'var(--color-error)';
    msg.textContent = `"${word}" is already in your list.`;
    return;
  }

  msg.style.color = 'var(--color-text-light)';
  msg.textContent = 'Looking up definition…';

  const dict = await lookupWord(word);
  const emoji = emojiInput.value.trim() || dict?.partOfSpeech === 'noun' ? (emojiInput.value.trim() || '📝') : '📝';
  const definition = dict?.definition || '';

  if (!state.customWords) state.customWords = [];
  state.customWords.push({
    en: word,
    emoji: emojiInput.value.trim() || '📝',
    definition,
    addedAt: new Date().toISOString().slice(0, 10),
  });
  save();

  msg.style.color = 'var(--color-success)';
  msg.textContent = dict ? `✅ Added "${word}" with definition!` : `✅ Added "${word}" (no definition found — that's OK!)`;

  wordInput.value = '';
  emojiInput.value = '';

  const wordList = document.getElementById('word-list');
  const words = state.customWords;
  wordList.innerHTML = words.map((w, i) => `
    <div style="display:flex;align-items:center;gap:0.6rem;background:var(--color-card);border:0.5px solid var(--color-border);border-radius:10px;padding:0.6rem 0.8rem">
      <span style="font-size:1.4rem">${w.emoji}</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700">${w.en}</div>
        ${w.definition ? `<div style="font-size:0.8rem;color:var(--color-text-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${w.definition}</div>` : ''}
      </div>
      <button class="btn" data-del="${i}" style="padding:0.3rem 0.6rem;font-size:0.85rem;color:var(--color-error)">✕</button>
    </div>
  `).join('');

  wordList.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.del);
      words.splice(idx, 1);
      state.customWords = words;
      save();
      renderDashboard(container);
    });
  });
}
