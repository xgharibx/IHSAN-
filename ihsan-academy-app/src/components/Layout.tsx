import { ReactNode, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { data } from "@/data";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: ReactNode }) {
  const recentCourseId = useStore((s) => s.recentCourseId);
  const unlocked = useStore((s) => s.unlockedAchievements.length);
  const loc = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
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
  // Curated subset for the mobile floating tab bar — a bottom bar works best with
  // ~5 destinations; the rest stay reachable via the desktop nav / Home page cards.
  const mobileTabItems = [
    { to: "/", label: "الرئيسية", icon: "◉" },
    { to: "/courses", label: "الدورات", icon: "❖" },
    { to: "/study", label: "بطاقات", icon: "◧" },
    { to: "/activities", label: "الأنشطة", icon: "✺" },
    { to: "/tutor", label: "المعلّم", icon: "✦" },
  ];
  const totalCourses = data.week1.courses.length;

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
              <div className="text-[11px] text-sand-100/60">الأسبوع الأول · نظام تعلّم ذكي</div>
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
            <div className="hidden md:block">
              <div className="text-[11px] text-sand-100/60">الأسبوع</div>
              <div className="text-sm font-bold text-gold-200">1 / 4</div>
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
              الأسبوع الأول: تأسيس الخلافة بالإحسان.
            </p>
          </div>
          <div>
            <div className="mb-2 text-sm font-bold text-sand-50">إحصاء سريعة</div>
            <ul className="space-y-1 text-sm text-sand-100/60">
              <li>{totalCourses} دورات هذا الأسبوع</li>
              <li>{data.week1.flashcards.length} بطاقة مراجعة</li>
              <li>{data.week1.quizzes.length} سؤال متنوّع</li>
              <li>{data.week1.activities.length} نشاط تطبيقي</li>
              <li>{data.achievements?.length ?? 0} إنجاز قابل للفتح</li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-sm font-bold text-sand-50">قريبًا</div>
            <ul className="space-y-1 text-sm text-sand-100/60">
              <li>الأسبوع الثاني — التطبيق</li>
              <li>الأسبوع الثالث — التوسّع</li>
              <li>الأسبوع الرابع — التركيب النهائي</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-sand-100/50 sm:px-6">
            <div>© أكاديمية الإحسان — نظام تعلّم ذكي</div>
            {recentCourseId && (
              <div className="hidden md:block">
                الدورة الأخيرة: {data.week1.courses.find((c) => c.id === recentCourseId)?.title}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
