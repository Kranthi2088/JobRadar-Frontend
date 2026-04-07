import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@jobradar/db";
import { JobFeed } from "@/components/job-feed";
import { buildJobWhereFromWatchlists } from "@/lib/watchlist-jobs";
import { isUnitedStatesJobLocationOrTitle } from "@jobradar/shared";
import { parseTimelineHours } from "@/lib/dashboard-time-window";

type DashboardPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const timelineRaw = resolvedSearchParams?.timeline;
  const timeline = parseTimelineHours(
    Array.isArray(timelineRaw) ? timelineRaw[0] : timelineRaw
  );
  const windowMs = timeline * 60 * 60 * 1000;

  const watchlists = await prisma.watchlist.findMany({
    where: { userId },
    select: {
      companyId: true,
      roleKeyword: true,
      locationFilter: true,
      seniorityFilter: true,
      company: true,
    },
  });

  const jobWhere = buildJobWhereFromWatchlists(watchlists, windowMs);

  const initialJobsRaw = await prisma.job.findMany({
    where: jobWhere,
    include: {
      company: { select: { name: true, slug: true, logoUrl: true } },
    },
    orderBy: [
      { postedAt: { sort: "desc", nulls: "last" } },
      { detectedAt: "desc" },
    ],
    take: 100,
  });

  type JobRow = (typeof initialJobsRaw)[number];
  const initialJobs = initialJobsRaw
    .filter((j: JobRow) => isUnitedStatesJobLocationOrTitle(j.location, j.title))
    .map((j: JobRow) => ({
      id: j.id,
      externalId: j.externalId,
      title: j.title,
      url: j.url,
      team: j.team,
      location: j.location,
      seniority: j.seniority,
      postedAt: j.postedAt ? j.postedAt.toISOString() : null,
      detectedAt: j.detectedAt.toISOString(),
      company: j.company,
    }));

  const watchedCompanies = watchlists.map((w) => ({
    slug: w.company.slug,
    name: w.company.name,
    logoUrl: w.company.logoUrl,
  }));

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1080px] px-8 py-10 text-sm text-jr-text2">
          Loading feed…
        </div>
      }
    >
      <JobFeed
        initialJobs={initialJobs}
        watchedCompanies={watchedCompanies}
        initialTimelineHours={timeline}
      />
    </Suspense>
  );
}
