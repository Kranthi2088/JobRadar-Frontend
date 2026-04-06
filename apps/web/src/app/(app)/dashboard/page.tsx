import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@jobradar/db";
import { JobFeed } from "@/components/job-feed";
import { buildJobWhereFromWatchlists } from "@/lib/watchlist-jobs";
import type { PlanType } from "@jobradar/shared";

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

function fourHourCutoffDate(): Date {
  return new Date(Date.now() - FOUR_HOURS_MS);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;
  const plan = ((session!.user as any).plan || "free") as PlanType;

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

  const jobWhere = buildJobWhereFromWatchlists(watchlists);
  const cutoff = fourHourCutoffDate();

  const initialJobsRaw = await prisma.job.findMany({
    where: {
      AND: [
        jobWhere,
        {
          OR: [{ postedAt: { gte: cutoff } }, { detectedAt: { gte: cutoff } }],
        },
        {
          OR: [
            { location: { contains: "United States", mode: "insensitive" } },
            { location: { contains: "USA", mode: "insensitive" } },
            { location: { contains: ", US", mode: "insensitive" } },
            { location: { contains: " US ", mode: "insensitive" } },
            { location: { contains: "Remote, US", mode: "insensitive" } },
          ],
        },
      ],
    },
    include: {
      company: { select: { name: true, slug: true, logoUrl: true } },
    },
    orderBy: [
      { postedAt: { sort: "desc", nulls: "last" } },
      { detectedAt: "desc" },
    ],
    take: 100,
  });

  const initialJobs = initialJobsRaw.map((j) => ({
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

  const companies = watchlists.map((w) => ({
    id: w.company.id,
    name: w.company.name,
    slug: w.company.slug,
  }));

  const watchedCompanies = watchlists.map((w) => ({
    slug: w.company.slug,
    name: w.company.name,
    logoUrl: w.company.logoUrl,
  }));

  return (
    <JobFeed
      initialJobs={initialJobs}
      companies={companies}
      watchedCompanies={watchedCompanies}
    />
  );
}
