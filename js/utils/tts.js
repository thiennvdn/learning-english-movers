export function speak(text, rate = 1.0) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    utt.rate = rate;
    utt.pitch = 1.1;
    utt.onend = resolve;
    utt.onerror = resolve;
    // Chrome bug: utterances longer than ~255 chars get cut off; chunk if needed
    window.speechSynthesis.speak(utt);
  });
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

export function getTTSRate() {
  try {
    const params = new URLSearchParams(location.search);
    const name = params.get('profile');
    if (name) {
      const raw = localStorage.getItem(`movers_${name}`);
      if (raw) {
        const data = JSON.parse(raw);
        return data.settings?.ttsRate ?? 1.0;
      }
    }
  } catch {}
  return 1.0;
}
