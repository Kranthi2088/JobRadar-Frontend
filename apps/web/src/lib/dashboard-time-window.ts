import { RECENT_JOB_POST_WINDOW_MS } from "@jobradar/shared";

export const DEFAULT_TIMELINE_HOURS =
  RECENT_JOB_POST_WINDOW_MS / (60 * 60 * 1000);

export const TIMELINE_HOUR_OPTIONS = [1, 4, 12, 24, 48, 72] as const;

export type TimelineHours = (typeof TIMELINE_HOUR_OPTIONS)[number];

function parsePositiveInt(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseTimelineHours(
  raw: string | null | undefined
): TimelineHours {
  const n = parsePositiveInt(raw);
  if (n && TIMELINE_HOUR_OPTIONS.includes(n as TimelineHours)) {
    return n as TimelineHours;
  }
  return DEFAULT_TIMELINE_HOURS as TimelineHours;
}
