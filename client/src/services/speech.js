// Browser Web Speech API wrapper

export function startSpeechRecognition(onResult, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.("Speech recognition not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang             = "en-IN";
  recognition.interimResults   = false;
  recognition.maxAlternatives  = 1;
  recognition.continuous       = false;

  recognition.onresult  = (e) => onResult(e.results[0][0].transcript);
  recognition.onerror   = (e) => onError?.(e.error);

  recognition.start();
  return recognition;
}

export function speakText(text, lang = "en-IN") {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel(); // stop any current speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang  = lang;
  utterance.rate  = 0.9; // slightly slower for elderly
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
