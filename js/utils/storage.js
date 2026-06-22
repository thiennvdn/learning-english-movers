export function getProfile(name) {
  const raw = localStorage.getItem(`movers_${name}`);
  return raw ? JSON.parse(raw) : null;
}

export function saveProfile(name, data) {
  localStorage.setItem(`movers_${name}`, JSON.stringify(data));
}

export function getAllProfiles() {
  const profiles = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('movers_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data?.profile) profiles.push(data);
      } catch {}
    }
  }
  return profiles;
}

export function deleteProfile(name) {
  localStorage.removeItem(`movers_${name}`);
}

export function createDefaultProfile(name, avatar) {
  return {
    profile: { name, avatar, level: 1, totalXP: 0 },
    streak: { current: 0, lastDate: null, history: [] },
    daily: { date: null, tasks: [], completedTasks: [], xpToday: 0 },
    progress: {
      topics: {},
      grammar: { total: 0, correct: 0 },
      listening: { total: 0, correct: 0 },
      writing: { total: 0, correct: 0 },
      xpHistory: []
    },
    badges: [],
    customWords: [],
    settings: { ttsRate: 1.0, customWordsEnabled: true }
  };
}
