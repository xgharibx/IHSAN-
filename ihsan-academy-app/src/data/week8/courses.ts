import type { Course } from "@/types";
import { attachDeepContent } from "./deepContent";
import contemporary from "./courses/contemporary.json";
import positive_psych from "./courses/positive-psych.json";
import tafsir from "./courses/tafsir.json";

const courses: Course[] = [
  contemporary,
  positive_psych,
  tafsir,
] as unknown as Course[];

export default attachDeepContent(courses);
