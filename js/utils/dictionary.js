const DICT_PREFIX = 'dict_';
const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

export async function lookupWord(word) {
  const key = `${DICT_PREFIX}${word.toLowerCase().replace(/\s+/g, '_')}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);

    const res = await fetch(`${API_URL}${encodeURIComponent(word.toLowerCase())}`);
    if (!res.ok) return null;

    const data = await res.json();
    const entry = data[0];
    const firstMeaning = entry.meanings?.[0];
    const firstDef = firstMeaning?.definitions?.[0];

    const result = {
      word: entry.word,
      phonetic: entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '',
      audio: entry.phonetics?.find(p => p.audio)?.audio || '',
      partOfSpeech: firstMeaning?.partOfSpeech || '',
      definition: firstDef?.definition || '',
      example: firstDef?.example || '',
    };

    localStorage.setItem(key, JSON.stringify(result));
    return result;
  } catch {
    return null;
  }
}

let _currentAudio = null;

export function playWordAudio(audioUrl, fallbackFn) {
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  if (audioUrl) {
    _currentAudio = new Audio(audioUrl);
    _currentAudio.play().catch(() => { if (fallbackFn) fallbackFn(); });
    return true;
  }
  if (fallbackFn) fallbackFn();
  return false;
}
