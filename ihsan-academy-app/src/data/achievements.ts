// Re-export the static achievements list to keep imports tidy
import raw from "./week1/achievements.json";
import type { Achievement } from "@/types";

export const achievements: Achievement[] = raw as Achievement[];
