"use client";

import { useState, useMemo, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { Btn } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
  PLAN_LIMITS,
  POLLING_INTERVAL_PRESETS,
  type PlanType,
} from "@jobradar/shared";

interface Company {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  sources: { atsType: string }[];
}

interface WatchlistItem {
  id: string;
  companyId: string;
  roleKeyword: string;
  pollingIntervalSeconds: number;
  locationFilter: string | null;
  seniorityFilter: string | null;
  company: Company;
}

const ATS_COLORS: Record<string, string> = {
  Greenhouse: "#34C759",
  Ashby: "#5E6AD2",
  Lever: "#FF6B35",
  Workday: "#0066CC",
  Custom: "#AEAEB2",
};

function atsColor(atsType: string): string {
  return ATS_COLORS[atsType] || "#AEAEB2";
}

function sourcesLabel(sources: { atsType: string }[]): string {
  if (!sources?.length) return "—";
  return sources.map((s) => s.atsType).join(", ");
}

export function WatchlistManager({
  initialWatchlists,
  companies,
  plan,
}: {
  initialWatchlists: WatchlistItem[];
  companies: Company[];
  plan: PlanType;
}) {
  const [watchlists, setWatchlists] = useState(initialWatchlists);
  const [search, setSearch] = useState("");
  const [roleKeyword, setRoleKeyword] = useState(
    () => initialWatchlists[0]?.roleKeyword?.trim() || "Software Engineer"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  // Same origin + cookie as POST — reconciles UI if SSR DB and API DB ever disagree.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/watchlist", { credentials: "include" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!Array.isArray(data) || cancelled) return;
        const enriched: WatchlistItem[] = data.map((w: WatchlistItem) => {
          const full = companies.find((c) => c.id === w.companyId);
          return {
            ...w,
            company: full
              ? { ...w.company, sources: full.sources }
              : { ...w.company, sources: w.company?.sources ?? [] },
          };
        });
        setWatchlists(enriched);
        setError("");
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time sync; companies is initial SSR list
  }, []);

  const atPlanLimit =
    Number.isFinite(limits.maxCompanies) &&
    watchlists.length >= limits.maxCompanies;

  /** API can return 403 "at limit" while local state was still empty — don't show that stale banner. */
  const showErrorBanner =
    Boolean(error) &&
    !(
      !atPlanLimit &&
      /free plan is limited|upgrade to pro for unlimited/i.test(error)
    );

  const watchedIds = useMemo(
    () => new Set(watchlists.map((w) => w.companyId)),
    [watchlists]
  );

  const filteredCompanies = useMemo(
    () =>
      companies.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [companies, search]
  );

  const toggle = async (company: Company) => {
    const existing = watchlists.find((w) => w.companyId === company.id);
    if (existing) {
      try {
        const res = await fetch(`/api/watchlist/${existing.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(
            typeof data.error === "string"
              ? data.error
              : "Could not remove — try again."
          );
          return;
        }
        setWatchlists((prev) => prev.filter((w) => w.id !== existing.id));
        setError("");
      } catch {
        setError("Network error while removing.");
      }
    } else {
      if (watchlists.length >= limits.maxCompanies) {
        setError(
          `Free plan limit (${limits.maxCompanies} companies) reached. Remove one or upgrade.`
        );
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId: company.id,
            roleKeyword: roleKeyword.trim() || "Software Engineer",
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add");
        }
        const newItem = await res.json();
        setWatchlists((prev) => [newItem, ...prev]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const atsBreakdown = useMemo(() => {
    const watched = companies.filter((c) => watchedIds.has(c.id));
    const map: Record<string, number> = {};
    for (const c of watched) {
      for (const s of c.sources) {
        map[s.atsType] = (map[s.atsType] || 0) + 1;
      }
    }
    return Object.entries(map);
  }, [companies, watchedIds]);

  const watchedCompanies = useMemo(
    () => companies.filter((c) => watchedIds.has(c.id)),
    [companies, watchedIds]
  );

  return (
    <div className="mx-auto max-w-[1080px] px-8 py-10">
      <div className="grid grid-cols-[1fr_300px] gap-8">
        {/* Left side */}
        <div>
          <h1 className="text-[28px] font-bold font-display text-jr-text1 tracking-[-0.03em] mb-1.5">
            Watchlist
          </h1>
          <p className="text-sm text-jr-text2 mb-8">
            Select companies to monitor. We poll every 60 seconds.
          </p>

          {showErrorBanner && (
            <div
              className="mb-4 flex items-center gap-2 rounded-r2 px-4 py-3 text-sm"
              style={{
                background: "#FFF0F0",
                color: "#FF3B30",
                border: "0.5px solid rgba(255,59,48,0.2)",
              }}
            >
              {error}
            </div>
          )}

          {/* Role keyword */}
          <div
            className="mb-6 overflow-hidden rounded-r3 bg-white"
            style={{
              border: "0.5px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="px-[18px] pt-3.5">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-jr-text3 font-text">
                Role keyword
              </div>
              <input
                value={roleKeyword}
                onChange={(e) => setRoleKeyword(e.target.value)}
                className="w-full border-none bg-transparent pb-3.5 text-xl font-semibold font-display text-jr-text1 tracking-[-0.02em] outline-none"
              />
            </div>
            <Divider />
            <div className="px-[18px] py-2.5 text-xs text-jr-text3 font-text">
              Matched against job titles in real time
            </div>
          </div>

          {/* Search */}
          <div
            className="mb-3.5 flex h-10 items-center gap-2.5 rounded-r2 bg-white px-3.5"
            style={{
              border: "0.5px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <svg
              width="14"
              height="14"
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
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="flex-1 border-none bg-transparent text-[13.5px] text-jr-text1 font-text outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="border-none bg-transparent text-base leading-none text-jr-text3 cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Company list */}
          <div
            className="overflow-hidden rounded-r4 bg-white"
            style={{
              border: "0.5px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {filteredCompanies.map((c, i) => {
              const isWatched = watchedIds.has(c.id);
              return (
                <div key={c.id}>
                  {i > 0 && <Divider />}
                  <button
                    type="button"
                    onClick={() => toggle(c)}
                    className="flex w-full cursor-pointer items-center gap-3.5 px-[18px] py-[13px] text-left transition-colors duration-[120ms] border-none"
                    style={{
                      background: isWatched
                        ? "#E8F0FB"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isWatched)
                        e.currentTarget.style.background = "#F5F5F7";
                    }}
                    onMouseLeave={(e) => {
                      if (!isWatched)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Logo
                      name={c.name}
                      slug={c.slug}
                      logoUrl={c.logoUrl}
                      size={36}
                    />
                    <div className="flex-1">
                      <div className="mb-0.5 text-sm font-medium text-jr-text1 font-text">
                        {c.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11.5px] text-jr-text3">
                          {sourcesLabel(c.sources)}
                        </span>
                      </div>
                    </div>
                    {/* Checkbox */}
                    <div
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md transition-all duration-150"
                      style={{
                        border: isWatched
                          ? "none"
                          : "1.5px solid rgba(0,0,0,0.08)",
                        background: isWatched
                          ? "#0066CC"
                          : "transparent",
                        boxShadow: isWatched
                          ? "0 1px 4px rgba(0,102,204,0.3)"
                          : "none",
                      }}
                    >
                      {isWatched && (
                        <svg
                          width="11"
                          height="8"
                          viewBox="0 0 11 8"
                          fill="none"
                        >
                          <path
                            d="M1 4L3.8 7L10 1"
                            stroke="#fff"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
            {filteredCompanies.length === 0 && (
              <div className="py-12 text-center text-sm text-jr-text3 font-text">
                No results for &quot;{search}&quot;
              </div>
            )}
          </div>
        </div>

        {/* Right — Summary */}
        <div className="sticky top-[72px] flex h-fit flex-col gap-3">
          {/* Selected companies card */}
          <div
            className="overflow-hidden rounded-r4 bg-white"
            style={{
              border: "0.5px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="p-4 px-[18px]">
              <div className="mb-3.5 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-jr-text1 font-text">
                  Selected companies
                </span>
                <span
                  className="rounded-full px-[9px] py-0.5 text-xs font-semibold font-mono"
                  style={{
                    color:
                      watchlists.length >= limits.maxCompanies
                        ? "#FF9500"
                        : "#AEAEB2",
                    background:
                      watchlists.length >= limits.maxCompanies
                        ? "#FFF8EC"
                        : "#F5F5F7",
                  }}
                >
                  {watchlists.length} /{" "}
                  {limits.maxCompanies === Infinity
                    ? "∞"
                    : limits.maxCompanies}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-4 h-[3px] overflow-hidden rounded-full bg-surface-bg">
                <div
                  className="h-full rounded-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${Math.min(100, (watchlists.length / (limits.maxCompanies === Infinity ? watchlists.length || 1 : limits.maxCompanies)) * 100)}%`,
                    background:
                      watchlists.length >= limits.maxCompanies
                        ? "#FF9500"
                        : "#0066CC",
                  }}
                />
              </div>

              {/* Watched rows */}
              {watchedCompanies.length === 0 ? (
                <div className="py-5 text-center text-[13px] text-jr-text3 font-text">
                  Select companies from the list
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {watchedCompanies.map((c) => {
                    const primaryAts =
                      c.sources[0]?.atsType || "Custom";
                    return (
                      <div
                        key={c.id}
                        className="flex items-center gap-2.5 py-2"
                      >
                        <Logo
                          name={c.name}
                          slug={c.slug}
                          logoUrl={c.logoUrl}
                          size={30}
                        />
                        <div className="flex-1">
                          <div className="text-[13px] font-medium text-jr-text1 font-text">
                            {c.name}
                          </div>
                          <div
                            className="text-[11px] font-mono"
                            style={{
                              color: atsColor(primaryAts),
                            }}
                          >
                            {primaryAts}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(c);
                          }}
                          className="flex h-[22px] w-[22px] items-center justify-center rounded-md text-sm text-jr-text3 transition-all duration-100 cursor-pointer border-none bg-transparent"
                          style={{
                            border: "0.5px solid rgba(0,0,0,0.08)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "#FFF0F0";
                            e.currentTarget.style.color = "#FF3B30";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "transparent";
                            e.currentTarget.style.color = "#AEAEB2";
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {atPlanLimit && (
                <>
                  <Divider />
                  <div
                    className="px-[18px] py-3"
                    style={{ background: "#FFF8EC" }}
                  >
                    <div className="mb-2 text-xs text-[#8A5800] font-text">
                      Free plan limit reached. Upgrade for unlimited
                      monitoring.
                    </div>
                    <Btn
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      Upgrade to Pro
                    </Btn>
                  </div>
                </>
              )}

            {/* Polling stats */}
            {watchedCompanies.length > 0 && (
              <>
                <Divider />
                <div className="px-[18px] py-3.5">
                  <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-jr-text3 font-text">
                    Polling estimate
                  </div>
                  {[
                    [
                      "Requests per tick",
                      String(watchlists.length),
                    ],
                    ["Concurrency limit", "50 (p-limit)"],
                    ["Max alert delay", "~60s"],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      className="mb-2 flex justify-between"
                    >
                      <span className="text-[12.5px] text-jr-text2 font-text">
                        {l}
                      </span>
                      <span className="text-[12.5px] font-medium text-jr-text1 font-mono">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Divider />
            <div className="p-3.5">
              <Btn
                variant={saved ? "success" : "primary"}
                onClick={handleSave}
                className="h-10 w-full justify-center text-sm"
                disabled={watchedCompanies.length === 0}
              >
                {saved
                  ? "Saved"
                  : watchedCompanies.length === 0
                    ? "Select companies to continue"
                    : `Save ${watchlists.length} ${watchlists.length === 1 ? "company" : "companies"}`}
              </Btn>
            </div>
          </div>

          {/* ATS legend */}
          {atsBreakdown.length > 0 && (
            <div
              className="rounded-r3 bg-white px-[18px] py-3.5"
              style={{
                border: "0.5px solid rgba(0,0,0,0.08)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-jr-text3 font-text">
                Data sources
              </div>
              {atsBreakdown.map(([ats, n]) => (
                <div
                  key={ats}
                  className="mb-[7px] flex items-center justify-between"
                >
                  <div className="flex items-center gap-[7px]">
                    <span
                      className="block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{
                        background: atsColor(ats),
                      }}
                    />
                    <span className="text-[12.5px] text-jr-text2 font-text">
                      {ats}
                    </span>
                  </div>
                  <span className="text-xs text-jr-text3 font-mono">
                    {n} {n === 1 ? "co." : "cos."}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
