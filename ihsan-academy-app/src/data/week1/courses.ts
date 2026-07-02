// Centralized data loader that aggregates all course JSON files
// and re-exports them as a single typed array.

import ihsanSoul from "./courses/ihsan-soul.json";
import tafsir from "./courses/tafsir.json";
import seerah from "./courses/seerah.json";
import fiqhRules from "./courses/fiqh-rules.json";
import contemporary from "./courses/contemporary.json";
import seerahApp from "./courses/seerah-app.json";
import soulApp from "./courses/soul-app.json";
import sahaba from "./courses/sahaba.json";
import sahabiyyat from "./courses/sahabiyyat.json";
import positivePsych from "./courses/positive-psych.json";
import type { Course } from "@/types";
import { attachDeepContent } from "./deepContent";

const courses: Course[] = [
  ihsanSoul,
  tafsir,
  seerah,
  sahaba,
  sahabiyyat,
  contemporary,
  seerahApp,
  fiqhRules,
  soulApp,
  positivePsych,
] as unknown as Course[];

// Merge in any optional per-course "deep content" files discovered next to this
// module (deep-explanation phases, long summaries, study guides, deep concepts).
// See deepContent.ts for the naming convention — any course automatically picks
// up its own files, so this never needs to change when new content is added.
export default attachDeepContent(courses);