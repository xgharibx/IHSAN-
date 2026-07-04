import { useEffect, useRef, useState } from "react";
import { useWeekData } from "@/hooks/useWeekData";
import { useStore } from "@/store/useStore";
import { CourseIcon, Icons } from "@/components/Icons";

type Node = {
  id: string;
  label: string;
  type: "course" | "concept";
  x: number;
  y: number;
  color: string;
};

// Keep every node comfortably inside the container regardless of aspect ratio
// (mobile's narrower 4:5 box was clipping nodes placed near the raw 0%/100% edges).
const pad = (v: number) => 8 + v * 84;

export default function KnowledgeTree() {
  const week = useWeekData();
  const [selected, setSelected] = useState<Node | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markStarted = useStore((s) => s.markStarted);
  const setRecent = useStore((s) => s.setRecent);

  useEffect(() => {
    if (selected?.type === "course") {
      markStarted(selected.id);
      setRecent(selected.id);
    }
  }, [selected, markStarted, setRecent]);

  const course = selected?.type === "course"
    ? week.courses.find((c) => c.id === selected.id)
    : null;
  const concept = selected?.type === "concept"
    ? week.concepts.find((c) => c.id === selected.id)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <div className="pill mx-auto mb-3">ربط الدورات</div>
        <h1 className="font-display text-4xl text-sand-50">شجرة المعرفة</h1>
        <p className="mt-2 text-sand-100/60">
          {week.knowledgeMap.description ?? "خريطة بصرية توضح الروابط بين دورات الأسبوع ومفاهيمه."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div ref={containerRef} className="card relative aspect-[4/5] overflow-hidden sm:aspect-[16/12]">
          {/* Edges */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {week.knowledgeMap.edges.map((e: any, i: number) => {
              const from = week.knowledgeMap.nodes.find((n: any) => n.id === e.from);
              const to = week.knowledgeMap.nodes.find((n: any) => n.id === e.to);
              if (!from || !to) return null;
              return (
                <g key={i}>
                  <line
                    x1={pad(from.x)}
                    y1={pad(from.y)}
                    x2={pad(to.x)}
                    y2={pad(to.y)}
                    stroke="rgba(47,158,100,0.25)"
                    strokeWidth={0.18}
                    strokeDasharray="0.6 0.4"
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {week.knowledgeMap.nodes.map((n: any) => {
            const isSelected = selected?.id === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setSelected(n)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 transition-all duration-500 ${
                  isSelected
                    ? "scale-125 border-gold-300 shadow-glow"
                    : "border-white/10 hover:scale-110"
                }`}
                style={{
                  left: `${pad(n.x)}%`,
                  top: `${pad(n.y)}%`,
                  background: n.type === "concept" ? "rgba(255,209,102,0.15)" : n.color + "30",
                  color: n.type === "concept" ? "#ffd166" : n.color,
                  width: n.type === "concept" ? "44px" : "60px",
                  height: n.type === "concept" ? "44px" : "60px",
                  borderColor: isSelected ? n.color : n.type === "concept" ? "#ffd16640" : n.color + "40",
                }}
                title={n.label}
              >
                {n.type === "course" ? (
                  <CourseIcon name={week.courses.find((c) => c.id === n.id)?.iconKey ?? "sparkles"} size={22} />
                ) : (
                  <Icons.Diamond size={18} />
                )}
              </button>
            );
          })}

          {/* Node labels */}
          {week.knowledgeMap.nodes.map((n: any) => (
            <div
              key={`l-${n.id}`}
              className="pointer-events-none absolute -translate-x-1/2 transform text-center text-[10px] font-medium sm:text-xs"
              style={{
                left: `${pad(n.x)}%`,
                top: `calc(${pad(n.y)}% + ${n.type === "concept" ? 30 : 38}px)`,
                color: n.type === "concept" ? "#ffd166" : n.color,
                width: 120,
              }}
            >
              {n.label}
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="card p-5">
          {selected ? (
            <div>
              <div className="flex items-center gap-3">
                {course && (
                  <div
                    className="grid h-10 w-10 place-items-center rounded-lg"
                    style={{ background: `${course.scrollColor}25`, color: course.scrollColor }}
                  >
                    <CourseIcon name={course.iconKey} size={20} />
                  </div>
                )}
                {concept && (
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold-300/20 text-gold-300">
                    <Icons.Diamond size={20} />
                  </div>
                )}
                <div className="pill">{selected.type === "course" ? "دورة" : "مفهوم"}</div>
              </div>
              <h2 className="mt-3 font-display text-2xl text-sand-50">
                {course ? course.title : concept?.name}
              </h2>
              <p className="mt-1 text-sm text-sand-100/60">
                {course ? course.subtitle : ""}
              </p>
              <p className="mt-4 text-sm leading-loose text-sand-100/80">
                {course ? course.summary : concept?.deepExplanation}
              </p>

              {concept && (
                <div className="mt-4 space-y-2 text-xs">
                  <div className="rounded-lg bg-white/[0.04] p-3">
                    <div className="text-sand-100/50">التعريف</div>
                    <div className="mt-1 text-sand-100/80">{concept.definition}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-3">
                    <div className="text-sand-100/50">مثال</div>
                    <div className="mt-1 text-sand-100/80">{concept.example}</div>
                  </div>
                </div>
              )}

              {course && (
                <a
                  href={`/course/${course.slug}`}
                  className="btn btn-primary mt-6"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/course/${course.slug}`;
                  }}
                >
                  افتح الدورة
                  <Icons.ArrowLeft size={16} className="flip-x" />
                </a>
              )}
              {concept && (
                <div className="mt-4 text-xs text-sand-100/50">
                  <div className="mb-1 text-sand-100/70">دورات مرتبطة:</div>
                  <div className="flex flex-wrap gap-1">
                    {concept.relatedCourseIds.map((id) => {
                      const rc = week.courses.find((c) => c.id === id);
                      if (!rc) return null;
                      return (
                        <span
                          key={id}
                          className="pill"
                          style={{ color: rc.scrollColor, borderColor: `${rc.scrollColor}40` }}
                        >
                          {rc.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid h-full place-items-center text-center text-sand-100/50">
              <div>
                <Icons.Network size={48} className="mx-auto mb-3 text-gold-300/40" />
                <div>انقر على أي عقدة لاستكشافها</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="card p-3 text-center text-xs text-sand-100/60">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-gold-300/60 align-middle" /> مفاهيم
        </div>
        <div className="card p-3 text-center text-xs text-sand-100/60">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-rose-glow/60 align-middle" /> دورة
        </div>
        <div className="card p-3 text-center text-xs text-sand-100/60">
          <span className="mr-2 inline-block h-3 w-1/4 align-middle bg-gold-300/30" /> علاقة
        </div>
      </div>
    </div>
  );
}
