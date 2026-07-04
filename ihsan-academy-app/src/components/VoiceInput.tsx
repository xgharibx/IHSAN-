// VoiceInput — animated microphone button with Web Speech API integration

import { useEffect, useRef, useState } from "react";
import { startSpeechRecognition, stopSpeechRecognition, isSpeechRecognitionSupported } from "@/services/speech";

interface VoiceInputProps {
  lang?: string;
  onTranscript: (text: string, isFinal: boolean) => void;
  className?: string;
}

export function VoiceInput({ lang = "ar-SA", onTranscript, className = "" }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      if (stopRef.current) stopRef.current();
    };
  }, []);

  const handleClick = () => {
    if (error) setError(null);
    if (listening) {
      stopRef.current?.();
      stopRef.current = null;
      setListening(false);
      setInterim("");
      return;
    }
    setInterim("");
    const stop = startSpeechRecognition(lang, {
      onStart: () => setListening(true),
      onResult: (text, isFinal) => {
        setInterim(text);
        onTranscript(text, isFinal);
      },
      onError: (e) => {
        setListening(false);
        const msg = typeof e === "string" ? e : (e?.error || "حدث خطأ في التعرف على الصوت");
        setError(msg);
      },
      onEnd: () => {
        setListening(false);
        setInterim("");
      },
    });
    stopRef.current = stop;
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all ${
        listening
          ? "bg-rose-glow text-white"
          : "bg-white/[0.04] text-sand-100/70 hover:bg-gold-300/15 hover:text-gold-200"
      } ${className}`}
      title={listening ? "إيقاف التسجيل" : "إدخال صوتي"}
    >
      {listening ? (
        <>
          <span className="absolute inset-0 animate-ping rounded-full bg-rose-glow/40" />
          <span className="relative h-3 w-3 rounded-sm bg-white" />
        </>
      ) : (
        <span>🎤</span>
      )}
      {error && (
        <div className="absolute top-full right-0 mt-1 rounded bg-rose-glow/10 px-2 py-1 text-[10px] text-rose-glow whitespace-nowrap">
          {error}
        </div>
      )}
    </button>
  );
}