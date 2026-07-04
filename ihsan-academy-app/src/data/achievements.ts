// Aggregated achievements across all loaded weeks (deduped by id).
// See `data/index.ts` for the per-week source and the global `data.achievements`
// aggregator (which dedupes across `week1` and `week2` etc.).
import { data } from "./index";

export const achievements = data.achievements;