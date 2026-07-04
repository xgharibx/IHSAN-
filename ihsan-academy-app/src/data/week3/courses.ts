import ihsanSoul from "./courses/ihsan-soul.json";
import tafsir from "./courses/tafsir.json";
import seerahApp from "./courses/seerah-app.json";
import fiqhRules from "./courses/fiqh-rules.json";
import soulApp from "./courses/soul-app.json";
import sahaba from "./courses/sahaba.json";
import sahabiyyat from "./courses/sahabiyyat.json";
import contemporary from "./courses/contemporary.json";
import positivePsych from "./courses/positive-psych.json";
import type { Course } from "@/types";
import { attachDeepContent } from "./deepContent";

const courses: Course[] = [
  ihsanSoul,
  tafsir,
  seerahApp,
  fiqhRules,
  soulApp,
  sahaba,
  sahabiyyat,
  contemporary,
  positivePsych,
] as unknown as Course[];

export default attachDeepContent(courses);