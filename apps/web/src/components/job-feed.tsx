"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { JobCard } from "./job-card";
import { Logo } from "@/components/ui/logo";
import { Divider } from "@/components/ui/divider";
import { cn } from "@/lib/utils";

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

interface CompanyOption {
  id: string;
  name: string;
  slug: string;
}

interface WatchedCompany {
  slug: string;
  name: string;
  logoUrl?: string | null;
}

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

function jobSortTime(job: Job): number {
  const raw = job.postedAt || job.detectedAt;
  return new Date(raw).getTime();
}

function isWithinLastHours(job: Job, hours: number): boolean {
  const ageMs = Date.now() - new Date(job.postedAt || job.detectedAt).getTime();
  return ageMs <= hours * 60 * 60 * 1000;
}

function isUnitedStatesLocation(location: string | null): boolean {
  if (!location) return false;
  const s = location.toLowerCase();
  return (
    s.includes("united states") ||
    s.includes(" usa") ||
    s.includes(", us") ||
    s.includes("remote, us")
  );
}

function matchesDashboardConstraints(job: Job): boolean {
  return isWithinLastHours(job, 4) && isUnitedStatesLocation(job.location);
}

export function JobFeed({
  initialJobs,
  companies,
  watchedCompanies = [],
}: {
  initialJobs: Job[];
  companies: CompanyOption[];
  watchedCompanies?: WatchedCompany[];
}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [connected, setConnected] = useState(false);
  const [readJobs, setReadJobs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "new" | "applied">("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
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

  const connectSSE = useCallback(() => {
    const eventSource = new EventSource("/api/jobs/stream");

    eventSource.addEventListener("connected", () => {
      setConnected(true);
    });

    eventSource.addEventListener("new-job", (event) => {
      const newJob = JSON.parse(event.data) as Job;
      if (!matchesDashboardConstraints(newJob)) {
        return;
      }
      setJobs((prev) => [newJob, ...prev]);
      setNewJobFlash(newJob);
      setTimeout(() => setNewJobFlash(null), 3500);
    });

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
      setTimeout(connectSSE, 5000);
    };

    return eventSource;
  }, []);

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
      if (!matchesDashboardConstraints(job)) return false;
      if (companyFilter !== "all" && job.company.slug !== companyFilter) return false;
      if (filter === "new") {
        return isWithinLastHours(job, 1);
      }
      if (filter === "applied") return appliedJobs.has(job.id);
      return true;
    });
  }, [sortedJobs, companyFilter, filter, appliedJobs]);

  const constrainedJobs = useMemo(
    () => jobs.filter((j) => matchesDashboardConstraints(j)),
    [jobs]
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
            Watching {watchedCompanies.length} companies · {constrainedJobs.length} roles
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
                onClick={() => setFilter(v)}
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
                Company filter
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCompanyFilter("all")}
                  className={cn(
                    "rounded-pill border-none px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors",
                    companyFilter === "all"
                      ? "bg-jr-accent text-white"
                      : "bg-surface-bg text-jr-text2"
                  )}
                >
                  All
                </button>
                {watchedCompanies.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setCompanyFilter(c.slug)}
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
                {watchedCompanies.map((c) => (
                  <Logo
                    key={c.slug}
                    name={c.name}
                    slug={c.slug}
                    logoUrl={c.logoUrl}
                    size={28}
                  />
                ))}
                {watchedCompanies.length === 0 && (
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
