const fs = require("fs");
const p = "src/pages/CourseDetail.tsx";
let c = fs.readFileSync(p, "utf8");

// Fix 1: add data import
c = c.replace(
  'import { getCourseBySlug } from "@/data";',
  'import { getCourseBySlug, data } from "@/data";'
);

// Fix 2: add setSelectedWeek near setRecent
c = c.replace(
  'const setRecent = useStore((s) => s.setRecent);',
  'const setSelectedWeek = useStore((s) => s.setSelectedWeek);\n  const setRecent = useStore((s) => s.setRecent);'
);

// Fix 3: replace the markStarted useEffect to also auto-switch week
c = c.replace(
  `  useEffect(() => {
    if (course) {
      markStarted(course.id);
      setRecent(course.id);
    }
  }, [course, markStarted, setRecent]);`,
  `  // Auto-switch the selected week to the week this course belongs to,
  // so all dependent data (flashcards / quizzes / activities / concepts) load correctly.
  useEffect(() => {
    if (course) {
      // Find which week contains this course
      const owningWeek = Object.values(data.weeks).find(
        (w) => w.courses.some((c) => c.id === course.id)
      );
      if (owningWeek && owningWeek.meta.number !== useStore.getState().selectedWeek) {
        setSelectedWeek(owningWeek.meta.number);
      }
      markStarted(course.id);
      setRecent(course.id);
    }
  }, [course, markStarted, setRecent, setSelectedWeek]);`
);

fs.writeFileSync(p, c, "utf8");
console.log("Done");
