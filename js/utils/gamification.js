import { TOPICS } from '../data/vocabulary.js';

const XP_TABLE = {
  flashcard: 2,
  correct_first: 10,
  correct_retry: 5,
  module_complete: 30,
  daily_complete: 100
};

const LEVEL_THRESHOLDS = [
  [15, 'Champion'],
  [10, 'Movers Star'],
  [5,  'Explorer'],
  [1,  'Beginner']
];

export function getLevelName(level) {
  for (const [threshold, name] of LEVEL_THRESHOLDS) {
    if (level >= threshold) return name;
  }
  return 'Beginner';
}

export function addXP(profileData, action) {
  const amount = XP_TABLE[action] ?? 0;
  if (!amount) return 0;
  profileData.profile.totalXP = (profileData.profile.totalXP || 0) + amount;
  profileData.daily.xpToday = (profileData.daily.xpToday || 0) + amount;
  profileData.profile.level = Math.floor(profileData.profile.totalXP / 200) + 1;

  const today = getTodayStr();
  if (!profileData.progress.xpHistory) profileData.progress.xpHistory = [];
  const existing = profileData.progress.xpHistory.find(h => h.date === today);
  if (existing) {
    existing.xp = profileData.daily.xpToday;
  } else {
    profileData.progress.xpHistory.push({ date: today, xp: amount });
  }
  return amount;
}

export function updateStreak(profileData) {
  const today = getTodayStr();
  const last = profileData.streak.lastDate;
  if (last === today) return;

  const yesterday = getOffsetDateStr(-1);
  if (last === yesterday) {
    profileData.streak.current = (profileData.streak.current || 0) + 1;
  } else {
    profileData.streak.current = 1;
  }
  profileData.streak.lastDate = today;
  if (!profileData.streak.history) profileData.streak.history = [];
  if (!profileData.streak.history.includes(today)) {
    profileData.streak.history.push(today);
  }
}

export function getTopicCompletion(profileData, topicId) {
  const topicData = profileData.progress.topics?.[topicId];
  if (!topicData) return 0;
  const total = TOPICS[topicId]?.words.length || 20;
  return Math.round(((topicData.wordsLearned?.length || 0) / total) * 100);
}

export function markWordLearned(profileData, topicId, wordEn) {
  if (!profileData.progress.topics[topicId]) {
    profileData.progress.topics[topicId] = { wordsLearned: [], exercises: { total: 0, correct: 0 }, lastPracticed: null };
  }
  const t = profileData.progress.topics[topicId];
  if (!t.wordsLearned.includes(wordEn)) t.wordsLearned.push(wordEn);
  t.lastPracticed = getTodayStr();
}

export function recordExercise(profileData, type, correct) {
  if (!profileData.progress[type]) profileData.progress[type] = { total: 0, correct: 0 };
  profileData.progress[type].total++;
  if (correct) profileData.progress[type].correct++;
}

const BADGE_DEFS = [
  { id: 'first_step',    name: 'First Step',    emoji: '🌟', check: p => (p.daily.completedTasks?.length || 0) > 0 },
  { id: 'on_fire_7',     name: 'On Fire',        emoji: '🔥', check: p => (p.streak.current || 0) >= 7 },
  { id: 'on_fire_30',    name: 'Unstoppable',    emoji: '🔥🔥', check: p => (p.streak.current || 0) >= 30 },
  { id: 'word_master',   name: 'Word Master',    emoji: '📚', check: p => countWordsLearned(p) >= 100 },
  { id: 'good_listener', name: 'Good Listener',  emoji: '🎧', check: p => (p.progress.listening?.total || 0) >= 20 },
  { id: 'writer',        name: 'Writer',         emoji: '✍️', check: p => (p.progress.writing?.total || 0) >= 20 },
  { id: 'grammar_guru',  name: 'Grammar Guru',   emoji: '📝', check: p => (p.progress.grammar?.total || 0) >= 20 },
  ...Object.keys(TOPICS).map(id => ({
    id: `topic_${id}`,
    name: `${TOPICS[id].name} Expert`,
    emoji: TOPICS[id].emoji,
    check: p => getTopicCompletion(p, id) >= 100
  }))
];

export function checkBadges(profileData) {
  const newBadges = [];
  if (!profileData.badges) profileData.badges = [];
  for (const def of BADGE_DEFS) {
    if (!profileData.badges.includes(def.id) && def.check(profileData)) {
      profileData.badges.push(def.id);
      newBadges.push(def);
    }
  }
  return newBadges;
}

export function getAllBadgeDefs() { return BADGE_DEFS; }

function countWordsLearned(p) {
  return Object.values(p.progress.topics || {})
    .reduce((sum, t) => sum + (t.wordsLearned?.length || 0), 0);
}

export function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getOffsetDateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function getLast7DaysXP(profileData) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = getOffsetDateStr(-i);
    const entry = (profileData.progress.xpHistory || []).find(h => h.date === date);
    const d = new Date(date + 'T00:00:00');
    const label = i === 0 ? 'Today' : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    result.push({ date, label, xp: entry?.xp || 0 });
  }
  return result;
}
