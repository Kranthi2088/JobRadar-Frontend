import type { Prisma } from "@jobradar/db";
import { recentJobPostedAfter } from "@jobradar/shared";

type WatchlistRow = {
  companyId: string;
  roleKeyword: string;
  locationFilter: string | null;
  seniorityFilter: string | null;
};

/**
 * Show jobs the employer marked as recently posted, **or** jobs we fetched recently
 * (`detectedAt`). Needed when `postedAt` from the ATS is stale but the role is still open
 * (Microsoft PCSX, etc.).
 */
export function recentJobVisibilityWhere(): Prisma.JobWhereInput {
  const after = recentJobPostedAfter();
  return {
    OR: [
      { postedAt: { gte: after } },
      { detectedAt: { gte: after } },
    ],
  };
}

/** Jobs that satisfy at least one watchlist row AND fall in the recent (24h) visibility window. */
export function buildJobWhereFromWatchlists(
  watchlists: WatchlistRow[]
): Prisma.JobWhereInput {
  if (watchlists.length === 0) {
    return { id: { in: [] } };
  }

  return {
    AND: [
      {
        OR: watchlists.map((wl) => {
          const parts: Prisma.JobWhereInput[] = [{ companyId: wl.companyId }];
          const kw = wl.roleKeyword?.trim();
          if (kw) {
            parts.push({ title: { contains: kw, mode: "insensitive" } });
          }
          const loc = wl.locationFilter?.trim();
          if (loc) {
            parts.push({ location: { contains: loc, mode: "insensitive" } });
          }
          const sen = wl.seniorityFilter?.trim();
          if (sen) {
            parts.push({
              OR: [
                { seniority: { contains: sen, mode: "insensitive" } },
                { title: { contains: sen, mode: "insensitive" } },
              ],
            });
          }
          return { AND: parts };
        }),
      },
      recentJobVisibilityWhere(),
    ],
  };
}
