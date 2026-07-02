export default function LoadingScreen() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-gold-300/20 border-t-gold-300" />
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-emerald-glow/20 border-t-emerald-glow" />
        </div>
        <div className="text-sm text-sand-100/60">جارٍ التحميل…</div>
      </div>
    </div>
  );
}
