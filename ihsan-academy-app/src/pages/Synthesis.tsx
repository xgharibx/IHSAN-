import { Link } from "react-router-dom";
import { useSynthesis, useWeekMeta } from "@/hooks/useWeekHooks";
import { Icons } from "@/components/Icons";

export default function Synthesis() {
  const synthesis = useSynthesis();
  const meta = useWeekMeta();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <div className="pill mx-auto mb-3">التركيب الموحّد</div>
        <h1 className="font-display text-4xl text-sand-50 sm:text-5xl">
          {synthesis.title}
        </h1>
        <p className="mt-3 text-lg text-sand-100/60">{synthesis.subtitle}</p>
      </div>

      <section className="card relative overflow-hidden p-8 sm:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-300/10 blur-3xl" />
        <div className="relative">
          <h2 className="font-display text-2xl text-gold-200">الفكرة الجامعة</h2>
          <p className="mt-4 text-lg leading-loose text-sand-100/90">
            {synthesis.bigIdea}
          </p>
        </div>
      </section>

      <section className="card mt-6 p-8 sm:p-10">
        <h2 className="font-display text-2xl text-sand-50">التفسير المتكامل</h2>
        <div className="prose-arabic mt-4 max-w-none">
          {synthesis.integratedExplanation.split("\n\n").map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section className="card mt-6 p-8 sm:p-10">
        <h2 className="font-display text-2xl text-sand-50">الرسائل الأساسية</h2>
        <ul className="mt-4 space-y-3">
          {synthesis.keyMessages.map((m: string, i: number) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-300/20 text-xs font-bold text-gold-300">
                {i + 1}
              </span>
              <span className="text-sand-100/90">{m}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-6 p-8 sm:p-10">
        <h2 className="font-display text-2xl text-sand-50">
          {(synthesis.beforeNextWeek ?? []).length > 0
            ? meta.number === 8
              ? "قائمة ما قبل التخرّج"
              : "قائمة ما قبل الأسبوع التالي"
            : "قائمة الجاهزية"}
        </h2>
        <ul className="mt-4 space-y-2">
          {(synthesis.beforeNextWeek ?? synthesis.beforeWeek2 ?? []).map((item: string) => {
            const done = item.startsWith("✓");
            return (
              <li key={item} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                    done ? "bg-emerald-glow/20 text-emerald-glow" : "bg-white/5 text-sand-100/40"
                  }`}
                >
                  {done ? "✓" : "·"}
                </span>
                <span className={done ? "text-sand-100/40 line-through" : "text-sand-100/80"}>
                  {item.replace(/^✓\s*/, "")}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/knowledge-tree" className="btn btn-outline">
          <Icons.Network size={16} /> شجرة المعرفة
        </Link>
        <Link to="/tutor" className="btn btn-primary">
          <Icons.Sparkles size={16} /> المعلّم الذكي
        </Link>
      </section>
    </div>
  );
}
