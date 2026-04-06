"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Chip } from "@/components/ui/chip";
import { Btn } from "@/components/ui/button";
import { getJobAgeBadge, timeAgo } from "@/lib/utils";

interface Job {
  id: string;
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

const badgeMeta = {
  green: { color: "#34C759", bg: "#F0FBF3", label: "New" },
  amber: { color: "#FF9500", bg: "#FFF8EC", label: "Recent" },
  gray: { color: "#AEAEB2", bg: "#F5F5F7", label: null },
};

export function JobCard({
  job,
  isRead,
  onRead,
  isNew = false,
  isFirst = false,
  isLast = false,
}: {
  job: Job;
  isRead: boolean;
  onRead: () => void;
  isNew?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const [applied, setApplied] = useState(false);
  const freshnessRef = job.postedAt ?? job.detectedAt;
  const badge = getJobAgeBadge(freshnessRef);
  const meta = badgeMeta[badge.color];

  const handleApply = async () => {
    window.open(job.url, "_blank");
    onRead();

    try {
      await fetch(`/api/jobs/${job.id}/applied`, { method: "POST" });
      setApplied(true);
    } catch {
      // Non-critical
    }
  };

  const borderRadius = isFirst && isLast
    ? "14px"
    : isFirst
      ? "14px 14px 0 0"
      : isLast
        ? "0 0 14px 14px"
        : "0";

  return (
    <div
      className="flex items-center gap-3.5 bg-white transition-colors duration-[120ms]"
      style={{
        padding: "16px 20px",
        borderRadius,
        borderLeft: isNew ? "3px solid #34C759" : "3px solid transparent",
        animation: isNew ? "fadeDown 0.35s ease" : "none",
      }}
    >
      <Logo
        name={job.company.name}
        slug={job.company.slug}
        logoUrl={job.company.logoUrl}
        size={38}
      />

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-baseline gap-2">
          <span className="text-sm font-medium text-jr-text1 font-text tracking-[-0.01em]">
            {job.title}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] text-jr-text2 font-text">
            {job.company.name}
          </span>
          {job.team && (
            <>
              <span className="text-sm text-black/[0.08]">·</span>
              <span className="text-[12.5px] text-jr-text3">{job.team}</span>
            </>
          )}
          {job.location && (
            <>
              <span className="text-sm text-black/[0.08]">·</span>
              <span className="text-[12.5px] text-jr-text3">{job.location}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2.5">
        {meta.label && (
          <Chip
            label={meta.label}
            color={meta.color}
            bg={meta.bg}
          />
        )}
        <span className="min-w-[52px] text-right text-xs text-jr-text3 font-mono">
          {timeAgo(freshnessRef)}
        </span>
        {applied ? (
          <Btn variant="success" className="w-[88px]">Applied ✓</Btn>
        ) : (
          <Btn variant="primary" onClick={handleApply} className="w-[72px]">
            Apply
          </Btn>
        )}
      </div>
    </div>
  );
}
