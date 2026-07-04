import type { Course } from "@/types";
import { attachDeepContent } from "./deepContent";
import contemporary from "./courses/contemporary.json";
import fiqh_rules from "./courses/fiqh-rules.json";
import ihsan_soul from "./courses/ihsan-soul.json";
import positive_psych from "./courses/positive-psych.json";
import sahaba from "./courses/sahaba.json";
import sahabiyyat from "./courses/sahabiyyat.json";
import seerah_app from "./courses/seerah-app.json";
import seerah from "./courses/seerah.json";
import soul_app from "./courses/soul-app.json";
import tafsir from "./courses/tafsir.json";

const courses: Course[] = [
  contemporary,
  fiqh_rules,
  ihsan_soul,
  positive_psych,
  sahaba,
  sahabiyyat,
  seerah_app,
  seerah,
  soul_app,
  tafsir,
] as unknown as Course[];

export default attachDeepContent(courses);
