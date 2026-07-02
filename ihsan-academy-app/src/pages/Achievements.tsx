import { data } from "@/data";
import { useStore } from "@/store/useStore";
import { Icons } from "@/components/Icons";

export default function Achievements() {
  const unlocked = useStore((s) => s.unlockedAchievements);
  const cp = useStore((s) => s.courseProgress);

  const total = data.achievements.length;
  const pct = Math.round((unlocked.length / total) * 100);

  const getAchievementIcon = (key: string) => {
    const map: Record<string, any> = {
      sprout: Icons.Sprout,
      trophy: Icons.Trophy,
      crown: Icons.Crown,
      cards: Icons.Cards,
      graduation: Icons.Trophy,
      book: Icons.Book,
      moon: Icons.Moon,
      check: Icons.Check,
      star: Icons.Star,
      network: Icons.Network,
      diamond: Icons.Diamond,
      rocket: Icons.Rocket,
    };
    return map[key] ?? Icons.Star;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <div className="pill mb-3">الإنجازات</div>
        <h1 className="font-display text-4xl text-sand-50">رحلتك من الإنجازات</h1>
        <p className="mt-2 max-w-2xl text-sand-100/60">
          كل إنجاز يفتح معلمًا في رحلتك. تابع تقدّمك واحتفل بكل محطة.
        </p>
      </div>

      <div className="card mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-sand-100/60">الإنجازات المفتوحة</div>
            <div className="font-display text-3xl text-sand-50">
              {unlocked.length}
              <span className="text-sm text-sand-100/50"> / {total}</span>
            </div>
          </div>
          <div className="font-display text-3xl text-gold-300">{pct}%</div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.achievements.map((a) => {
          const ok = unlocked.includes(a.id);
          const Icon = getAchievementIcon(a.iconKey);
          return (
            <div
              key={a.id}
              className={`card relative overflow-hidden p-5 transition-all ${
                ok ? "border-gold-300/30" : "opacity-60"
              }`}
            >
              {ok && (
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-300/20 blur-3xl" />
              )}
              <div className="relative flex items-start gap-3">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                    ok ? "bg-gold-300/20 text-gold-300" : "bg-white/5 text-sand-100/40"
                  }`}
                >
                  <Icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg text-sand-50">{a.title}</h3>
                  <p className="mt-1 text-sm text-sand-100/60">{a.description}</p>
                  <div className="mt-2 text-xs text-sand-100/40">{a.criteria}</div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                {ok ? (
                  <span className="pill text-emerald-glow">✓ مفتوح</span>
                ) : (
                  <span className="pill">مغلق</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
