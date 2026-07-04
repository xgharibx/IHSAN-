// ChatMessage — rich rendering of AI / user messages with markdown, citations, TTS, etc.

import { useState } from "react";
import { Icons } from "./Icons";
import { speakArabic, stopSpeaking } from "@/services/speech";
import { renderMarkdown } from "@/services/markdownRenderer";

export interface CitationRef {
  courseId: string;
  conceptIds?: string[];
}

interface ChatMessageProps {
  role: "user" | "model";
  text: string;
  timestamp?: number;
  citations?: CitationRef[];
  confidence?: number;
  suggestedFollowUps?: string[];
  courseColor?: string;
  courseTitle?: string;
  onFollowUpClick?: (question: string) => void;
  onCitationClick?: (courseId: string) => void;
  onImagePreview?: (dataUrl: string) => void;
  imageDataUrl?: string;
}

export function ChatMessage(props: ChatMessageProps) {
  const [expanded, setExpanded] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = props.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(props.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakArabic(props.text, {
        onEnd: () => setSpeaking(false),
      });
    }
  };

  const formattedTime = props.timestamp
    ? new Date(props.timestamp).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    : "";

  // Confidence badge color
  const confidenceColor = !props.confidence
    ? "text-sand-100/40"
    : props.confidence > 0.8
    ? "text-emerald-glow"
    : props.confidence > 0.5
    ? "text-gold-300"
    : "text-rose-glow";

  return (
    <div className={`flex ${isUser ? "justify-start" : "justify-end"} animate-fade-in-up`}>
      <div
        className={`group relative max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
          isUser
            ? "bg-gradient-to-br from-gold-300/15 to-gold-300/5 border border-gold-300/20 text-sand-50"
            : "bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 text-sand-100"
        }`}
      >
        {/* Header (model only): course badge + confidence */}
        {!isUser && (props.courseTitle || props.confidence !== undefined) && (
          <div className="mb-2 flex items-center gap-2 text-[11px] text-sand-100/60">
            {props.courseTitle && (
              <span
                className="rounded-full border px-2 py-0.5"
                style={{
                  borderColor: `${props.courseColor ?? "#2f9e64"}50`,
                  color: props.courseColor ?? "#2f9e64",
                }}
              >
                {props.courseTitle}
              </span>
            )}
            {props.confidence !== undefined && (
              <span
                className={`inline-flex items-center gap-1 ${confidenceColor}`}
                title="مستوى الثقة في الإجابة"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>{Math.round(props.confidence * 100)}%</span>
              </span>
            )}
          </div>
        )}

        {/* Image attachment (user) */}
        {isUser && props.imageDataUrl && (
          <div className="mb-2 overflow-hidden rounded-lg border border-white/10">
            <img
              src={props.imageDataUrl}
              alt="مرفق"
              className="max-h-40 w-auto cursor-pointer object-contain"
              onClick={() => props.onImagePreview?.(props.imageDataUrl!)}
            />
          </div>
        )}

        {/* Message body */}
        {isUser ? (
          <div className="whitespace-pre-wrap">{props.text}</div>
        ) : (
          <div
            className="tutor-prose"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(props.text) }}
          />
        )}

        {/* Footer: timestamp + actions */}
        <div className="mt-2 flex items-center gap-2 text-[10px] text-sand-100/40">
          {formattedTime && <span>{formattedTime}</span>}
          <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {/* Copy */}
            <button
              onClick={handleCopy}
              className="rounded p-1 hover:bg-white/10"
              title="نسخ"
            >
              {copied ? <Icons.Check size={12} /> : "📋"}
            </button>
            {/* TTS (model only) */}
            {!isUser && (
              <button
                onClick={handleSpeak}
                className="rounded p-1 hover:bg-white/10"
                title={speaking ? "إيقاف" : "استماع"}
              >
                {speaking ? "⏸" : "🔊"}
              </button>
            )}
            {/* Expand (long messages) */}
            {props.text.length > 400 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="rounded p-1 hover:bg-white/10"
                title={expanded ? "طي" : "توسيع"}
              >
                {expanded ? "▾" : "▴"}
              </button>
            )}
          </div>
        </div>

        {/* Citations */}
        {!isUser && props.citations && props.citations.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2 text-[10px]">
            <span className="text-sand-100/50">📚 مصادر:</span>
            {props.citations.map((c, i) => (
              <button
                key={i}
                onClick={() => props.onCitationClick?.(c.courseId)}
                className="rounded-full border border-gold-300/30 bg-gold-300/10 px-2 py-0.5 text-gold-200 transition-colors hover:bg-gold-300/20"
              >
                {c.courseId}
                {c.conceptIds && c.conceptIds.length > 0 && ` (${c.conceptIds.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Suggested follow-ups */}
        {!isUser && expanded && props.suggestedFollowUps && props.suggestedFollowUps.length > 0 && (
          <div className="mt-3 border-t border-white/5 pt-2">
            <div className="mb-1.5 text-[10px] text-sand-100/50">💡 استكشف:</div>
            <div className="flex flex-col gap-1.5">
              {props.suggestedFollowUps.map((q, i) => (
                <button
                  key={i}
                  onClick={() => props.onFollowUpClick?.(q)}
                  className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-right text-xs text-sand-100/80 transition-colors hover:border-gold-300/30 hover:bg-gold-300/5"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Image preview modal
export function ImagePreview({ dataUrl, onClose }: { dataUrl: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-sand-100 hover:bg-white/20"
      >
        إغلاق
      </button>
      <img
        src={dataUrl}
        alt="معاينة"
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
      />
    </div>
  );
}