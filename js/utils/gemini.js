const CACHE_KEY_PREFIX = 'movers_ai_';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
export function getGeminiKey() {
  return localStorage.getItem('movers_gemini_key') || '';
}

export function setGeminiKey(key) {
  if (key) localStorage.setItem('movers_gemini_key', key.trim());
  else localStorage.removeItem('movers_gemini_key');
}
export function clearAICache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(CACHE_KEY_PREFIX)) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
}

function getCacheKey(type, date) {
  return `${CACHE_KEY_PREFIX}${type}_${date}`;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function callGemini(prompt, key) {
  const res = await fetch(`${API_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\[[\s\S]*\])/);
  if (!jsonMatch) throw new Error('No JSON in response');
  return JSON.parse(jsonMatch[1]);
}

export async function generateGrammarExercises(topicHint = '') {
  const key = getGeminiKey();
  if (!key) return null;

  const today = getTodayStr();
  const cacheKey = getCacheKey('grammar', today);
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const prompt = `Generate 10 English grammar exercises at Cambridge Movers+ level (for children aged 8-11).
${topicHint ? `Today's theme: ${topicHint}.` : ''}
Mix these grammar points: present simple, present continuous, past simple, present perfect (has/have done), future (going to), comparatives, can/can't, wh-questions (where/when/what/who/how/why).
Use child-friendly vocabulary: animals, food, school, sports, family, weather, places.

Return ONLY a JSON array (no markdown prose), each item:
{
  "id": "ai_g_1",
  "point": "present_perfect",
  "type": "multiple_choice" | "fill_blank" | "true_false",
  "sentence": "She ___ already eaten lunch.",
  "options": ["have","has","is"],   // only for multiple_choice
  "correct": 1,                      // index for MC, string for fill_blank, boolean for true_false
  "explanation": "She → has + past participle"
}`;

  try {
    const exercises = await callGemini(prompt, key);
    const valid = exercises.filter(e => e.sentence && e.explanation);
    localStorage.setItem(cacheKey, JSON.stringify(valid));
    return valid;
  } catch (e) {
    console.warn('Gemini grammar error:', e.message);
    return null;
  }
}

export async function generateListeningExercises(topics = []) {
  const key = getGeminiKey();
  if (!key) return null;

  const today = getTodayStr();
  const cacheKey = getCacheKey('listening', today);
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const topicList = topics.length ? topics.join(', ') : 'animals, food, school, weather, transport';

  const prompt = `Generate 6 English listening comprehension exercises at Cambridge Movers+ level (children aged 8-11).
Topics to use (pick from): ${topicList}.

Each exercise must be one of these types:
1. "listen_answer" — a short realistic dialogue (2-4 exchanges, 40-80 words), one comprehension question, 3 multiple-choice options.
2. "dictation_lite" — a clear, simple sentence (6-12 words) the child hears and arranges word tiles.

Return ONLY a JSON array:
[
  {
    "id": "ai_l_1",
    "topic": "animals",
    "type": "listen_answer",
    "text": "Teacher: What is your favourite animal? Sam: I love elephants because they are so big and clever. Teacher: That is a great choice, Sam!",
    "question": "Why does Sam love elephants?",
    "options": ["They are fast","They are big and clever","They can fly"],
    "correct": 1
  },
  {
    "id": "ai_l_2",
    "topic": "weather",
    "type": "dictation_lite",
    "text": "It was very cold and snowy last winter.",
    "words": ["It","was","very","cold","and","snowy","last","winter"]
  }
]`;

  try {
    const exercises = await callGemini(prompt, key);
    const valid = exercises.filter(e => e.text && e.topic && e.type);
    localStorage.setItem(cacheKey, JSON.stringify(valid));
    return valid;
  } catch (e) {
    console.warn('Gemini listening error:', e.message);
    return null;
  }
}

export async function generateVocabularyStory(words = [], topicName = '') {
  const key = getGeminiKey();
  if (!key) return null;

  const today = getTodayStr();
  const wordList = words.slice(0, 6).map(w => w.en).join(', ');
  const cacheKey = getCacheKey(`story_${topicName}`, today);
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const prompt = `Write a very short, fun story for children aged 8-11 (5-7 sentences, max 80 words) that naturally uses ALL of these English words: ${wordList}.
The story should be about ${topicName || 'everyday life'}, easy to understand, with simple sentences.
After the story, create 3 comprehension questions with 3 multiple-choice options each.

Return ONLY JSON:
{
  "story": "One sunny day, Tom went to the zoo...",
  "questions": [
    {
      "question": "Where did Tom go?",
      "options": ["The park","The zoo","The beach"],
      "correct": 1
    }
  ]
}`;

  try {
    const result = await callGemini(prompt, key);
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (e) {
    console.warn('Gemini story error:', e.message);
    return null;
  }
}
