import type { Course } from "@/types";
import { attachDeepContent } from "./deepContent";
import positive_psych from "./courses/positive-psych.json";

const courses: Course[] = [
  positive_psych,
] as unknown as Course[];

export default attachDeepContent(courses);
