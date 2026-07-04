// Lightweight markdown renderer for chat messages — Arabic + GFM compatible.
// Returns an HTML string safe to render via dangerouslySetInnerHTML (after escape of user input).

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface Block {
  type: "h1" | "h2" | "h3" | "p" | "ul" | "ol" | "code" | "quote" | "hr";
  text?: string;
  items?: string[];
  lang?: string;
}

function parseMarkdown(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", text: code.join("\n"), lang });
      i++;
      continue;
    }

    // Headings
    const h3 = t.match(/^###\s+(.*)$/);
    const h2 = t.match(/^##\s+(.*)$/);
    const h1 = t.match(/^#\s+(.*)$/);
    if (h3) { blocks.push({ type: "h3", text: h3[1] }); i++; continue; }
    if (h2) { blocks.push({ type: "h2", text: h2[1] }); i++; continue; }
    if (h1) { blocks.push({ type: "h1", text: h1[1] }); i++; continue; }

    // HR
    if (t.match(/^([-*_]\s*){3,}$/)) { blocks.push({ type: "hr" }); i++; continue; }

    // Blockquote
    if (t.startsWith(">")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        items.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: items.join(" ") });
      continue;
    }

    // Unordered list
    if (t.match(/^[-*]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (t.match(/^\d+\.\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Empty line: paragraph break
    if (t === "") {
      i++;
      continue;
    }

    // Regular paragraph: consume until empty line or new block
    const para: string[] = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i];
      if (next.trim() === "" || next.match(/^(#|>|[-*]\s|\d+\.|```)/)) break;
      para.push(next);
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

function inlineFormat(text: string): string {
  // Bold: **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic: *text* or _text_
  text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  text = text.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
  // Inline code: `text`
  text = text.replace(/`([^`\n]+)`/g, '<code dir="ltr" class="px-1.5 py-0.5 rounded bg-white/10 text-sm font-mono">$1</code>');
  // Link: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-gold-300 underline">$1</a>');
  return text;
}

function blockHtml(block: Block): string {
  switch (block.type) {
    case "h1": return `<h1 class="text-2xl font-bold mt-4 mb-2 text-sand-50">${inlineFormat(escapeHtml(block.text ?? ""))}</h1>`;
    case "h2": return `<h2 class="text-xl font-bold mt-4 mb-2 text-sand-50">${inlineFormat(escapeHtml(block.text ?? ""))}</h2>`;
    case "h3": return `<h3 class="text-lg font-semibold mt-3 mb-1.5 text-sand-50">${inlineFormat(escapeHtml(block.text ?? ""))}</h3>`;
    case "p": return `<p class="my-2 leading-relaxed text-sand-100">${inlineFormat(escapeHtml(block.text ?? ""))}</p>`;
    case "ul": {
      const items = (block.items ?? []).map(i => `<li class="my-0.5 leading-relaxed">${inlineFormat(escapeHtml(i))}</li>`).join("");
      return `<ul class="list-disc list-inside my-2 space-y-0.5 text-sand-100">${items}</ul>`;
    }
    case "ol": {
      const items = (block.items ?? []).map(i => `<li class="my-0.5 leading-relaxed">${inlineFormat(escapeHtml(i))}</li>`).join("");
      return `<ol class="list-decimal list-inside my-2 space-y-0.5 text-sand-100">${items}</ol>`;
    }
    case "code": return `<pre dir="ltr" class="my-2 p-3 rounded-lg bg-black/30 text-sm font-mono overflow-x-auto"><code class="text-sand-100">${escapeHtml(block.text ?? "")}</code></pre>`;
    case "quote": return `<blockquote class="my-2 ps-4 border-s-2 border-gold-300/40 text-sand-100/80 italic">${inlineFormat(escapeHtml(block.text ?? ""))}</blockquote>`;
    case "hr": return `<hr class="my-3 border-white/10" />`;
  }
}

export function renderMarkdown(md: string): string {
  if (!md) return "";
  const blocks = parseMarkdown(md);
  return blocks.map(blockHtml).join("");
}

/** Extract markdown links for citation rendering */
export function extractMarkdownLinks(md: string): { text: string; url: string }[] {
  const out: { text: string; url: string }[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(md)) !== null) out.push({ text: m[1], url: m[2] });
  return out;
}