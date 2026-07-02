// Utility helpers for the UI

export const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export const fmtSeconds = (s: number) => {
  if (s < 60) return `${s} ث`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m < 60) return sec ? `${m} د ${sec} ث` : `${m} د`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h} س ${mm} د`;
};

export const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
};
