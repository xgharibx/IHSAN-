// ChatSessionList — sidebar with multi-session management

import { useState } from "react";
import { useStore, type ChatSession } from "@/store/useStore";
import { Icons } from "./Icons";

interface ChatSessionListProps {
  currentSessionId: string;
  onSelect: (sessionId: string) => void;
}

export function ChatSessionList({ currentSessionId, onSelect }: ChatSessionListProps) {
  const sessions = useStore((s) => s.chatSessions);
  const deleteSession = useStore((s) => s.deleteChatSession);
  const renameSession = useStore((s) => s.renameChatSession);
  const pinSession = useStore((s) => s.pinChatSession);

  // Sort: pinned first, then by last message time
  const sorted = [...sessions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.lastMessageAt - a.lastMessageAt;
  });

  if (sessions.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-[11px] text-sand-100/40">
        لا توجد محادثات سابقة
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sorted.map((s) => (
        <SessionItem
          key={s.id}
          session={s}
          active={s.id === currentSessionId}
          onSelect={() => onSelect(s.id)}
          onDelete={() => {
            if (confirm("حذف هذه المحادثة؟")) deleteSession(s.id);
          }}
          onRename={(title) => renameSession(s.id, title)}
          onPin={() => pinSession(s.id)}
        />
      ))}
    </div>
  );
}

function SessionItem({
  session, active, onSelect, onDelete, onRename, onPin,
}: {
  session: ChatSession;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
  onPin: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(session.title);

  const dateStr = new Date(session.lastMessageAt).toLocaleDateString("ar-EG", { day: "2-digit", month: "2-digit" });

  return (
    <div
      className={`group relative flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition-all ${
        active
          ? "border-gold-300/40 bg-gold-300/10"
          : "border-white/5 bg-white/[0.02] hover:border-white/15"
      }`}
    >
      {session.pinned && (
        <span title="مثبتة" className="text-gold-300">📌</span>
      )}

      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => { if (title.trim() && title !== session.title) onRename(title.trim()); setEditing(false); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { if (title.trim() && title !== session.title) onRename(title.trim()); setEditing(false); }
            if (e.key === "Escape") setEditing(false);
          }}
          className="min-w-0 flex-1 bg-transparent text-xs text-sand-100 outline-none"
        />
      ) : (
        <button
          onClick={onSelect}
          onDoubleClick={() => setEditing(true)}
          className="min-w-0 flex-1 truncate text-right text-sand-100"
          title={session.title}
        >
          {session.title}
        </button>
      )}

      <span className="shrink-0 text-[10px] text-sand-100/40">{dateStr}</span>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          className="rounded p-0.5 hover:bg-white/10"
          title={session.pinned ? "إلغاء التثبيت" : "تثبيت"}
        >
          {session.pinned ? "📌" : "📍"}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          className="rounded p-0.5 hover:bg-white/10"
          title="إعادة تسمية"
        >
          ✏
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="rounded p-0.5 text-rose-glow hover:bg-rose-glow/10"
          title="حذف"
        >
          🗑
        </button>
      </div>
    </div>
  );
}