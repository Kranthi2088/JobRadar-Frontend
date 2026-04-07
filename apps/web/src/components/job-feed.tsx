"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { JobCard } from "./job-card";
import { Logo } from "@/components/ui/logo";
import { Divider } from "@/components/ui/divider";
import { cn } from "@/lib/utils";
import {
  isUnitedStatesJobLocationOrTitle,
} from "@jobradar/shared";
import {
  DEFAULT_TIMELINE_HOURS,
  parseTimelineHours,
  TIMELINE_HOUR_OPTIONS,
  type TimelineHours,
} from "@/lib/dashboard-time-window";

interface Job {
  id: string;
  externalId: string;
  title: string;
  url: string;
  team: string | null;
  location: string | null;
  seniority: string | null;
  postedAt: string | null;
  detectedAt: string;
  company: {
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

interface WatchedCompany {
  slug: string;
  name: string;
  logoUrl?: string | null;
}

function jobSortTime(job: Job): number {
  const raw = job.postedAt || job.detectedAt;
  return new Date(raw).getTime();
}

function isWithinLastHours(job: Job, hours: number): boolean {
  const ageMs = Date.now() - new Date(job.postedAt || job.detectedAt).getTime();
  return ageMs <= hours * 60 * 60 * 1000;
}

function matchesDashboardConstraints(job: Job, timelineHours: number): boolean {
  return (
    isWithinLastHours(job, timelineHours) &&
    isUnitedStatesJobLocationOrTitle(job.location, job.title)
  );
}

function parseFilter(v: string | null): "all" | "new" | "applied" {
  if (v === "new" || v === "applied") return v;
  return "all";
}

function parseCompanySlug(
  raw: string | null,
  watched: WatchedCompany[]
): string {
  if (!raw || raw === "all") return "all";
  return watched.some((w) => w.slug === raw) ? raw : "all";
}

function normalizeWatchedCompanies(rows: any[]): WatchedCompany[] {
  const bySlug = new Map<string, WatchedCompany>();
  for (const r of rows) {
    const c = r?.company;
    if (!c?.slug || !c?.name || bySlug.has(c.slug)) continue;
    bySlug.set(c.slug, {
      slug: c.slug,
      name: c.name,
      logoUrl: c.logoUrl ?? null,
    });
  }
  return Array.from(bySlug.values());
}

export function JobFeed(props: {
  initialJobs: Job[];
  watchedCompanies?: WatchedCompany[];
  initialTimelineHours?: TimelineHours;
}) {
  return <JobFeedInner {...props} />;
}

function JobFeedInner({
  initialJobs,
  watchedCompanies = [],
  initialTimelineHours = DEFAULT_TIMELINE_HOURS as TimelineHours,
}: {
  initialJobs: Job[];
  watchedCompanies?: WatchedCompany[];
  initialTimelineHours?: TimelineHours;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [watchedCompaniesState, setWatchedCompaniesState] =
    useState<WatchedCompany[]>(watchedCompanies);
  const [connected, setConnected] = useState(false);
  const [readJobs, setReadJobs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "new" | "applied">(() =>
    parseFilter(searchParams.get("filter"))
  );
  const [companyFilter, setCompanyFilter] = useState(
    () => parseCompanySlug(searchParams.get("company"), watchedCompaniesState)
  );
  const [timelineHours, setTimelineHours] = useState<TimelineHours>(() =>
    parseTimelineHours(searchParams.get("timeline") ?? String(initialTimelineHours))
  );

  const watchedSlugKey = useMemo(
    () => watchedCompaniesState.map((w) => w.slug).sort().join(","),
    [watchedCompaniesState]
  );

  // Sync filter UI from URL (back/forward, shared links). watchedSlugKey limits reruns when watchlist changes.
  useEffect(() => {
    setFilter(parseFilter(searchParams.get("filter")));
    setCompanyFilter(
      parseCompanySlug(searchParams.get("company"), watchedCompaniesState)
    );
    setTimelineHours(
      parseTimelineHours(searchParams.get("timeline") ?? String(initialTimelineHours))
    );
  }, [searchParams, watchedSlugKey, initialTimelineHours]);

  const setFilterWithUrl = useCallback(
    (v: "all" | "new" | "applied") => {
      setFilter(v);
      const p = new URLSearchParams(searchParams.toString());
      if (v === "all") p.delete("filter");
      else p.set("filter", v);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setCompanyWithUrl = useCallback(
    (slug: string) => {
      setCompanyFilter(slug);
      const p = new URLSearchParams(searchParams.toString());
      if (slug === "all") p.delete("company");
      else p.set("company", slug);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const reloadDashboardData = useCallback(
    async (hours: TimelineHours) => {
      try {
        const [watchlistRes, jobsRes] = await Promise.all([
          fetch("/api/watchlist", { credentials: "include", cache: "no-store" }),
          fetch(`/api/jobs?limit=100&page=1&timeline=${hours}`, {
            credentials: "include",
            cache: "no-store",
          }),
        ]);
        if (watchlistRes.ok) {
          const rows = await watchlistRes.json();
          if (Array.isArray(rows)) {
            setWatchedCompaniesState(normalizeWatchedCompanies(rows));
          }
        }
        if (jobsRes.ok) {
          const payload = await jobsRes.json();
          const rows = Array.isArray(payload?.jobs) ? payload.jobs : [];
          setJobs(rows);
        }
      } catch {
        // Keep existing data if reload fails.
      }
    },
    []
  );

  const setTimelineWithUrl = useCallback(
    async (hours: TimelineHours) => {
      setTimelineHours(hours);
      const p = new URLSearchParams(searchParams.toString());
      if (hours === DEFAULT_TIMELINE_HOURS) p.delete("timeline");
      else p.set("timeline", String(hours));
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      await reloadDashboardData(hours);
    },
    [pathname, reloadDashboardData, router, searchParams]
  );

  const [nextPoll, setNextPoll] = useState(60);
  const [pulsing, setPulsing] = useState(false);
  const [newJobFlash, setNewJobFlash] = useState<Job | null>(null);

  // Poll countdown
  useEffect(() => {
    const t = setInterval(() => {
      setNextPoll((p) => {
        if (p <= 1) {
          setPulsing(true);
          setTimeout(() => setPulsing(false), 700);
          return 60;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    setWatchedCompaniesState((prev) => {
      // During route-segment refreshes, server props can momentarily be empty.
      // Keep existing watched companies until we get a non-empty replacement.
      if (watchedCompanies.length === 0 && prev.length > 0) return prev;
      return watchedCompanies;
    });
  }, [watchedCompanies]);

  useEffect(() => {
    const hours = parseTimelineHours(
      searchParams.get("timeline") ?? String(initialTimelineHours)
    );
    void reloadDashboardData(hours);
  }, [searchParams, initialTimelineHours, reloadDashboardData]);

  const connectSSE = useCallback(() => {
    const eventSource = new EventSource("/api/jobs/stream");

    eventSource.addEventListener("connected", () => {
      setConnected(true);
    });

    eventSource.addEventListener("new-job", (event) => {
      const newJob = JSON.parse(event.data) as Job;
      if (!matchesDashboardConstraints(newJob, timelineHours)) {
        return;
      }
      setJobs((prev) => {
        // Update list in-place without page refresh; avoid duplicates on reconnect/overlap.
        if (prev.some((j) => j.id === newJob.id)) return prev;
        return [newJob, ...prev];
      });
      setNewJobFlash(newJob);
      setTimeout(() => setNewJobFlash(null), 3500);
    });

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
      setTimeout(connectSSE, 5000);
    };

    return eventSource;
  }, [timelineHours]);

  useEffect(() => {
    const es = connectSSE();
    return () => es.close();
  }, [connectSSE]);

  const sortedJobs = useMemo(
    () => [...jobs].sort((a, b) => jobSortTime(b) - jobSortTime(a)),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    return sortedJobs.filter((job) => {
      if (!matchesDashboardConstraints(job, timelineHours)) return false;
      if (companyFilter !== "all" && job.company.slug !== companyFilter) return false;
      if (filter === "new") {
        return isWithinLastHours(job, 1);
      }
      if (filter === "applied") return appliedJobs.has(job.id);
      return true;
    });
  }, [sortedJobs, companyFilter, filter, appliedJobs, timelineHours]);

  const constrainedJobs = useMemo(
    () => jobs.filter((j) => matchesDashboardConstraints(j, timelineHours)),
    [jobs, timelineHours]
  );

  const newJobCount = useMemo(
    () => constrainedJobs.filter((j) => isWithinLastHours(j, 1)).length,
    [constrainedJobs]
  );

  return (
    <div className="mx-auto max-w-[1080px] px-8 py-10">
      {/* Page header */}
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold font-display text-jr-text1 tracking-[-0.03em] mb-1">
            Live feed
          </h1>
          <p className="text-sm text-jr-text2 font-text">
            Watching {watchedCompaniesState.length} companies · {constrainedJobs.length} roles
            found
          </p>
        </div>

        {/* Poll indicator */}
        <div
          className="flex items-center gap-2.5 rounded-r3 bg-white px-3.5 py-2"
          style={{
            border: "0.5px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div className="relative h-2 w-2">
            {pulsing && (
              <div
                className="absolute -inset-[3px] rounded-full bg-jr-green animate-ring"
                style={{ opacity: 0.3 }}
              />
            )}
            <div className="h-2 w-2 rounded-full bg-jr-green" />
          </div>
          <span className="text-xs text-jr-text2 font-mono">
            Next poll in{" "}
            <span className="font-medium text-jr-text1">{nextPoll}s</span>
          </span>
        </div>
      </div>

      {/* New job banner */}
      {newJobFlash && (
        <div
          className="mb-4 flex items-center gap-2.5 rounded-r2 bg-jr-green-light px-4 py-3 animate-fade-down"
          style={{ border: "0.5px solid rgba(52,199,89,0.27)" }}
        >
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-jr-green" />
          <span className="text-[13px] font-medium text-[#1A7A35] font-text">
            New role detected — {newJobFlash.company.name} ·{" "}
            {newJobFlash.title}
          </span>
        </div>
      )}

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Job list */}
        <div>
          {/* Filter tabs */}
          <div
            className="mb-4 flex w-fit gap-0.5 rounded-r2 p-[3px]"
            style={{ background: "rgba(0,0,0,0.05)" }}
          >
            {(
              [
                ["all", "All"],
                ["new", "New"],
                ["applied", "Applied"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setFilterWithUrl(v)}
                className={cn(
                  "rounded-lg px-3.5 py-[5px] text-[12.5px] font-medium font-text border-none cursor-pointer transition-all duration-[120ms]",
                  filter === v
                    ? "bg-white text-jr-text1 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                    : "bg-transparent text-jr-text2"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Job cards */}
          <div className="flex flex-col gap-px">
            {filteredJobs.length === 0 ? (
              <div className="rounded-r3 bg-white py-16 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-bg">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <circle
                      cx="6"
                      cy="6"
                      r="4.5"
                      stroke="#AEAEB2"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M9.5 9.5L12 12"
                      stroke="#AEAEB2"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-jr-text1">
                  No jobs found
                </h3>
                <p className="mt-1 text-sm text-jr-text2">
                  {constrainedJobs.length === 0
                    ? "Jobs will appear here after the worker loads listings."
                    : "Try adjusting your filters."}
                </p>
              </div>
            ) : (
              filteredJobs.map((job, i) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isRead={readJobs.has(job.id)}
                  onRead={() =>
                    setReadJobs((prev) => new Set([...prev, job.id]))
                  }
                  isNew={
                    Date.now() -
                      new Date(
                        job.postedAt || job.detectedAt
                      ).getTime() <
                    10 * 60 * 1000
                  }
                  isFirst={i === 0}
                  isLast={i === filteredJobs.length - 1}
                />
              ))
            )}
          </div>
        </div>

        {/* Right stats panel */}
        <div className="flex flex-col gap-3">
          {/* Overview */}
          <div
            className="overflow-hidden rounded-r3 bg-white"
            style={{
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              border: "0.5px solid rgba(0,0,0,0.08)",
            }}
          >
            <div className="p-4 px-[18px]">
              <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-jr-text3 font-text">
                Overview
              </div>
              {[
                ["Jobs detected", String(constrainedJobs.length), "#1D1D1F"],
                ["In last hour", String(newJobCount), "#0066CC"],
                ["Applied", String(appliedJobs.size), "#6E6E73"],
                ["Avg. alert delay", "< 60s", "#34C759"],
              ].map(([label, val, color]) => (
                <div
                  key={label}
                  className="mb-2.5 flex items-center justify-between"
                >
                  <span className="text-[13px] text-jr-text2 font-text">
                    {label}
                  </span>
                  <span
                    className="text-[13px] font-semibold font-mono"
                    style={{ color }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <Divider />
            <div className="p-3 px-[18px]">
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-jr-text3 font-text">
                Timeline
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {TIMELINE_HOUR_OPTIONS.map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setTimelineWithUrl(hours)}
                    className={cn(
                      "rounded-pill border-none px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                      timelineHours === hours
                        ? "bg-jr-accent text-white"
                        : "bg-surface-bg text-jr-text2"
                    )}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>
            <Divider />
            <div className="p-3 px-[18px]">
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-jr-text3 font-text">
                Company filter
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCompanyWithUrl("all")}
                  className={cn(
                    "rounded-pill border-none px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                    companyFilter === "all"
                      ? "bg-jr-accent text-white"
                      : "bg-surface-bg text-jr-text2"
                  )}
                >
                  All
                </button>
                {watchedCompaniesState.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setCompanyWithUrl(c.slug)}
                    className={cn(
                      "rounded-pill border-none px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                      companyFilter === c.slug
                        ? "bg-jr-accent text-white"
                        : "bg-surface-bg text-jr-text2"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <Divider />
            <div className="p-3 px-[18px]">
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-jr-text3 font-text">
                Watching
              </div>
              <div className="flex flex-wrap gap-1.5">
                {watchedCompaniesState.map((c) => (
                  <Logo
                    key={c.slug}
                    name={c.name}
                    slug={c.slug}
                    logoUrl={c.logoUrl}
                    size={28}
                  />
                ))}
                {watchedCompaniesState.length === 0 && (
                  <span className="text-xs text-jr-text3 font-text">
                    No companies watched
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
