import { useState } from "react";
import { data } from "@/data";
import { useStore } from "@/store/useStore";
import { Icons } from "@/components/Icons";

export default function Activities() {
  const [day, setDay] = useState(1);
  const markActivity = useStore((s) => s.markActivity);
  const cp = useStore((s) => s.courseProgress);

  const dayActivities = data.week1.activities.filter((a) => {
    // Spread activities across the week in round-robin
    const idx = data.week1.activities.indexOf(a);
    return idx % 7 === (day - 1);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <div className="pill mb-3">الأنشطة والجدول</div>
        <h1 className="font-display text-4xl text-sand-50">رحلة الأسبوع</h1>
        <p className="mt-2 max-w-2xl text-sand-100/60">
          أنشطة تطبيقية، جدول زمني، وإنجازات قابلة للفتح. اختر يومًا من الأسبوع.
        </p>
      </div>

      <div className="card mb-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-sand-50">خط زمني للأسبوع</h2>
            <p className="mt-1 text-xs text-sand-100/50">
              انقر على أي يوم لاستكشاف أنشطته
            </p>
          </div>
          <div className="pill text-xs">7 أيام</div>
        </div>
        <div className="relative">
          <div className="absolute right-4 top-5 h-0.5 w-[calc(100%-2rem)] bg-gradient-to-l from-gold-300/40 via-gold-300/20 to-transparent" />
          <div className="relative grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = i + 1;
              const active = day === d;
              return (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all ${
                    active
                      ? "border-gold-300/40 bg-gold-300/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${
                      active ? "bg-gold-300 text-ink-950" : "bg-white/5 text-sand-100"
                    }`}
                  >
                    {d}
                  </div>
                  <div className="text-[11px] text-sand-100/60">
                    {d === 1 ? "السبت" : d === 2 ? "الأحد" : d === 3 ? "الإثنين" : d === 4 ? "الثلاثاء" : d === 5 ? "الأربعاء" : d === 6 ? "الخميس" : "الجمعة"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dayActivities.length === 0 ? (
          <div className="card p-6 text-center text-sand-100/60 md:col-span-2">
            استرح اليوم أو راجع ما قرأته سابقًا.
          </div>
        ) : (
          dayActivities.map((a) => {
            const course = data.week1.courses.find((c) => c.id === a.courseId);
            const done = cp[a.courseId]?.activitiesCompleted.includes(a.id);
            return (
              <div key={a.id} className="card p-6">
                <div className="flex items-center justify-between">
                  <span
                    className="pill"
                    style={{
                      color: course?.scrollColor,
                      borderColor: `${course?.scrollColor}40`,
                    }}
                  >
                    {course?.title}
                  </span>
                  <span className="text-xs text-sand-100/50">{a.duration}</span>
                </div>
                <h3 className="mt-3 font-display text-xl text-sand-50">{a.title}</h3>
                <p className="mt-2 text-sm leading-loose text-sand-100/80">{a.prompt}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-sand-100/50">
                    {a.type === "individual"
                      ? "فردي"
                      : a.type === "discussion"
                        ? "حوار"
                        : a.type === "practical"
                          ? "تطبيقي"
                          : "تأمّل"}
                  </span>
                  {done ? (
                    <span className="text-emerald-glow">✓ مُنجَز</span>
                  ) : (
                    <button
                      onClick={() => markActivity(a.courseId, a.id)}
                      className="btn btn-primary text-xs"
                    >
                      <Icons.Check size={14} /> منجز
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-2xl text-sand-50">جميع أنشطة الأسبوع</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.week1.activities.map((a) => {
            const c = data.week1.courses.find((cc) => cc.id === a.courseId);
            const done = cp[a.courseId]?.activitiesCompleted.includes(a.id);
            return (
              <div
                key={a.id}
                className="card p-4"
                style={{ borderColor: done ? "rgba(26,160,132,0.3)" : undefined }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className="pill"
                    style={{ color: c?.scrollColor, borderColor: `${c?.scrollColor}40` }}
                  >
                    {c?.title}
                  </span>
                  <span className="text-sand-100/50">{a.duration}</span>
                </div>
                <h4 className="mt-2 text-base font-medium text-sand-50">{a.title}</h4>
                <p className="mt-1 line-clamp-3 text-sm text-sand-100/60">{a.prompt}</p>
                <div className="mt-3 flex justify-end text-xs">
                  {done ? (
                    <span className="text-emerald-glow">✓</span>
                  ) : (
                    <button
                      onClick={() => markActivity(a.courseId, a.id)}
                      className="btn btn-outline text-[11px]"
                    >
                      منجز
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
