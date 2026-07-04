// Speech service — Arabic STT (Speech-to-Text) and TTS (Text-to-Speech) via the Web Speech API.

let recognitionInstance: any = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window;
}

export interface SpeechRecognitionCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (err: any) => void;
  onEnd: () => void;
  onStart: () => void;
}

export function startSpeechRecognition(
  lang: string = "ar-SA",
  callbacks: SpeechRecognitionCallbacks,
): () => void {
  if (!isSpeechRecognitionSupported()) {
    callbacks.onError("Speech recognition not supported in this browser");
    return () => {};
  }
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = lang;
  recognition.lang = lang;
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let finalTranscript = "";

  recognition.onstart = () => callbacks.onStart();
  recognition.onresult = (event: any) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const r = event.results[i];
      if (r.isFinal) {
        finalTranscript += r[0].transcript;
      } else {
        interim += r[0].transcript;
      }
    }
    callbacks.onResult(finalTranscript + interim, finalTranscript.length > 0);
  };
  recognition.onerror = (e: any) => callbacks.onError(e);
  recognition.onend = () => callbacks.onEnd();

  try {
    recognition.start();
  } catch (e) {
    callbacks.onError(e);
  }
  recognitionInstance = recognition;

  return () => {
    try {
      recognition.stop();
    } catch {}
  };
}

export function stopSpeechRecognition() {
  if (recognitionInstance) {
    try { recognitionInstance.stop(); } catch {}
    recognitionInstance = null;
  }
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakArabic(
  text: string,
  options: { rate?: number; pitch?: number; voice?: SpeechSynthesisVoice | null; onEnd?: () => void } = {},
): () => void {
  if (!isSpeechSynthesisSupported()) return () => {};
  if (currentUtterance) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
  // Strip markdown and citation tags before speaking
  const plainText = text
    .replace(/\[CITATIONS\].*?\[\/CITATIONS\]/gs, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[📖🎓❓📝💧🔬🔗🗺️⚡🪞🎯]/g, "")
    .trim();

  const utterance = new SpeechSynthesisUtterance(plainText);
  utterance.lang = "ar-SA";
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;
  if (options.voice) utterance.voice = options.voice;
  if (options.onEnd) utterance.onend = options.onEnd;

  currentUtterance = utterance;
  try {
    window.speechSynthesis.speak(utterance);
  } catch {}
  return () => {
    try { window.speechSynthesis.cancel(); } catch {}
  };
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
}

export function getArabicVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(v => v.lang?.startsWith("ar") || v.lang?.includes("Arabic"));
}