import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { data } from "@/data";
import { useWeekData, useAvailableWeeks, TOTAL_WEEKS } from "@/hooks/useWeekData";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: ReactNode }) {
  const recentCourseId = useStore((s) => s.recentCourseId);
  const unlocked = useStore((s) => s.unlockedAchievements.length);
  const setSelectedWeek = useStore((s) => s.setSelectedWeek);
  const selectedWeek = useStore((s) => s.selectedWeek);
  const loc = useLocation();
  const week = useWeekData();
  const available = useAvailableWeeks();
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [loc.pathname]);

  // Close the week picker when navigating
  useEffect(() => {
    setPickerOpen(false);
  }, [loc.pathname]);

  const navItems = [
    { to: "/", label: "الرئيسية", icon: "◉" },
    { to: "/dashboard", label: "لوحة الأسبوع", icon: "▦" },
    { to: "/courses", label: "الدورات", icon: "❖" },
    { to: "/knowledge-tree", label: "شجرة المعرفة", icon: "✦" },
    { to: "/study", label: "بطاقات واختبارات", icon: "◧" },
    { to: "/activities", label: "الأنشطة", icon: "✺" },
    { to: "/tutor", label: "المعلّم الذكي", icon: "✦" },
    { to: "/synthesis", label: "التركيب", icon: "◆" },
  ];
  const mobileTabItems = [
    { to: "/", label: "الرئيسية", icon: "◉" },
    { to: "/courses", label: "الدورات", icon: "❖" },
    { to: "/study", label: "بطاقات", icon: "◧" },
    { to: "/activities", label: "الأنشطة", icon: "✺" },
    { to: "/tutor", label: "المعلّم", icon: "✦" },
  ];
  const totalCourses = week.courses.length;

  return (
    <div className="min-h-screen bg-cosmic">
      <div className="starfield">
        <div className="star-layer-mid" />
        <div className="star-layer-near" />
      </div>

      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-ink-950/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-700 shadow-glow">
              <span className="font-display text-xl font-bold text-ink-950">إ</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-lg leading-none text-sand-50">أكاديمية الإحسان</div>
              <div className="text-[11px] text-sand-100/60">الأسبوع {week.meta.number} · نظام تعلّم ذكي</div>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.slice(0, 7).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    isActive
                      ? "bg-gold-300/20 text-gold-200"
                      : "text-sand-100/70 hover:text-sand-50 hover:bg-white/5",
                  )
                }
                end={n.to === "/"}
              >
                <span className="ml-1 text-gold-300">{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <NavLink
              to="/achievements"
              className="pill hover:border-gold-300/40"
              title="الإنجازات"
            >
              <span className="text-gold-300">★</span>
              <span>{unlocked}</span>
            </NavLink>

            {/* Week switcher — only weeks with loaded data are selectable; the rest are disabled as "قريبًا". */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setPickerOpen((o) => !o)}
                className="pill hover:border-gold-300/40"
                title="تبديل الأسبوع"
              >
                <span className="text-gold-300">▦</span>
                <span className="text-[11px] text-sand-100/60">الأسبوع</span>
                <span className="text-sm font-bold text-gold-200">
                  {selectedWeek} / {TOTAL_WEEKS}
                </span>
              </button>
              {pickerOpen && (
                <div className="absolute end-0 top-full z-50 mt-2 w-64 rounded-2xl border border-white/10 bg-ink-900/95 p-2 shadow-deep backdrop-blur-md">
                  {Array.from({ length: TOTAL_WEEKS }).map((_, i) => {
                    const n = i + 1;
                    const availableWeek = available.find((a) => a.number === n);
                    const isAvailable = !!availableWeek;
                    const isCurrent = selectedWeek === n;
                    return (
                      <button
                        key={n}
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedWeek(n);
                            setPickerOpen(false);
                          }
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-right text-xs transition-all",
                          isCurrent
                            ? "bg-gold-300/20 text-gold-200"
                            : isAvailable
                              ? "text-sand-100/80 hover:bg-white/5"
                              : "cursor-not-allowed text-sand-100/30",
                        )}
                      >
                        <span className="font-bold">الأسبوع {n}</span>
                        <span className="truncate text-[11px] text-sand-100/50">
                          {isAvailable
                            ? (availableWeek!.title.replace(/^الأسبوع [^-]+ — /, ""))
                            : "قريبًا"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* mobile nav (secondary — full list, for destinations not in the bottom tab bar) */}
        <div className="border-t border-white/5 lg:hidden">
          <div className="no-scrollbar flex overflow-x-auto px-2 py-2">
            {navItems
              .filter((n) => !mobileTabItems.some((m) => m.to === n.to))
              .map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    cn(
                      "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                      isActive
                        ? "bg-gold-300/20 text-gold-200"
                        : "text-sand-100/70 hover:text-sand-50 hover:bg-white/5",
                    )
                  }
                  end={n.to === "/"}
                >
                  <span className="ml-1 text-gold-300">{n.icon}</span>
                  {n.label}
                </NavLink>
              ))}
          </div>
        </div>
      </header>

      <main className="relative z-10 pb-24 lg:pb-0">{children}</main>

      {/* Floating mobile bottom tab bar */}
      <nav className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
        <div className="glass-strong flex items-center justify-around rounded-2xl border border-white/10 px-1 py-1.5 shadow-deep">
          {mobileTabItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-all",
                  isActive ? "bg-gold-300/20 text-gold-200" : "text-sand-100/60 hover:text-sand-50",
                )
              }
              end={n.to === "/"}
            >
              <span className="text-base leading-none">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <footer className="relative z-10 mt-24 border-t border-white/5 bg-ink-950/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <div className="mb-2 font-display text-lg text-gold-200">أكاديمية الإحسان</div>
            <p className="text-sm text-sand-100/60">
              نظام تعلّم ذكي متعدد الأسابيع لتحويل المواد التعليمية إلى تجربة معرفية حيّة.
              حاليًا: {week.meta.title}.
            </p>
          </div>
          <div>
            <div className="mb-2 text-sm font-bold text-sand-50">إحصاء سريعة</div>
            <ul className="space-y-1 text-sm text-sand-100/60">
              <li>{totalCourses} دورات هذا الأسبوع</li>
              <li>{week.flashcards.length} بطاقة مراجعة</li>
              <li>{week.quizzes.length} سؤال متنوّع</li>
              <li>{week.activities.length} نشاط تطبيقي</li>
              <li>{data.achievements.length} إنجاز قابل للفتح</li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-sm font-bold text-sand-50">قريبًا</div>
            <ul className="space-y-1 text-sm text-sand-100/60">
              {Array.from({ length: TOTAL_WEEKS }).map((_, i) => {
                const n = i + 1;
                const availableWeek = available.find((a) => a.number === n);
                return (
                  <li key={n} className={availableWeek && n !== week.meta.number ? "text-sand-100/30 line-through" : ""}>
                    {n === week.meta.number
                      ? `الأسبوع ${n} — الحالي`
                      : availableWeek
                        ? `الأسبوع ${n} — متاح`
                        : `الأسبوع ${n} — قريبًا`}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-sand-100/50 sm:px-6">
            <div>© أكاديمية الإحسان — نظام تعلّم ذكي</div>
            {recentCourseId && (
              <div className="hidden md:block">
                الدورة الأخيرة: {week.courses.find((c) => c.id === recentCourseId)?.title}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
