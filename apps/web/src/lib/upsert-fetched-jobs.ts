import {
  fetchJobsFromAllSources,
  computeListingKey,
} from "@jobradar/ats-adapters";
import { prisma } from "@jobradar/db";
import { shouldPersistFetchedJob } from "@jobradar/shared";

/** Fetch from all CompanySource rows, merge/dedupe, upsert into DB. */
export async function fetchAndUpsertCompanyJobs(company: {
  id: string;
  slug: string;
  preferredSourceId: string | null;
  sources: Array<{
    id: string;
    atsType: string;
    endpoint: string;
    priority: number;
  }>;
}) {
  if (company.sources.length === 0) {
    return { imported: 0, primarySourceId: null as string | null };
  }

  const { jobs, perSource, primarySourceId } = await fetchJobsFromAllSources({
    slug: company.slug,
    sources: company.sources,
    preferredSourceId: company.preferredSourceId,
  });

  for (const r of perSource) {
    await prisma.companySource
      .update({
        where: { id: r.sourceId },
        data: {
          lastSuccessAt: r.ok ? new Date() : undefined,
          lastError: r.ok ? null : (r.error ?? "error"),
        },
      })
      .catch(() => {});
  }

  if (jobs.length > 0 && primarySourceId) {
    await prisma.company
      .update({
        where: { id: company.id },
        data: { preferredSourceId: primarySourceId },
      })
      .catch(() => {});
  }

  const toStore = jobs.filter(shouldPersistFetchedJob);

  for (const job of toStore) {
    const listingKey = job.listingKey ?? computeListingKey(job.url);
    await prisma.job.upsert({
      where: {
        companyId_listingKey: {
          companyId: company.id,
          listingKey,
        },
      },
      create: {
        companyId: company.id,
        companySourceId: job.companySourceId ?? null,
        listingKey,
        externalId: job.id,
        title: job.title,
        url: job.url,
        team: job.team,
        location: job.location,
        seniority: job.seniority,
        postedAt: job.postedAt ?? null,
        detectedAt: job.detectedAt,
      },
      update: {
        companySourceId: job.companySourceId ?? null,
        externalId: job.id,
        title: job.title,
        url: job.url,
        team: job.team,
        location: job.location,
        seniority: job.seniority,
        ...(job.postedAt ? { postedAt: job.postedAt } : {}),
      },
    });
  }

  return { imported: toStore.length, primarySourceId, perSource };
}
