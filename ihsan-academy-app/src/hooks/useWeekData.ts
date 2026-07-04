// useWeekData — single source of truth for the currently-viewed week bundle.
// All pages that previously read `data.week1` directly now read through this
// hook so the week switcher in Layout.tsx actually changes the data context.
//
// Falls back to week1 (the always-loaded reference) if the selected week has
// not been registered yet (e.g. a stored `selectedWeek` from before new
// content shipped).
import { useStore } from "@/store/useStore";
import { data, type WeekBundle } from "@/data";

export function useWeekData(): WeekBundle {
  const selectedWeek = useStore((s) => s.selectedWeek);
  const key = `week${selectedWeek}`;
  return data.weeks[key] ?? data.weeks.week1;
}

export function useAvailableWeeks(): { id: number; key: string; title: string; number: number }[] {
  return Object.values(data.weeks)
    .map((b) => ({
      id: b.meta.number,
      key: `week${b.meta.number}`,
      title: b.meta.title,
      number: b.meta.number,
    }))
    .sort((a, b) => a.number - b.number);
}

export const TOTAL_WEEKS = 8;
