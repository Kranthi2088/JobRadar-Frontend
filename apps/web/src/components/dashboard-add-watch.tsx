"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Building2, Plus } from "lucide-react";
import { getCompanyLogoUrl } from "@/lib/utils";
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

export function DashboardAddWatch({
  companies,
  plan,
  watchlistCount,
}: {
  companies: Company[];
  plan: PlanType;
  watchlistCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Company | null>(null);
  const [keyword, setKeyword] = useState("Software Engineer");
  const [locationFilter, setLocationFilter] = useState("");
  const [seniorityFilter, setSeniorityFilter] = useState("");
  const [intervalSec, setIntervalSec] = useState(300);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const limits = PLAN_LIMITS[plan];
  const atLimit = watchlistCount >= limits.maxCompanies;

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  const submit = async () => {
    if (!selected || !keyword.trim()) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selected.id,
          roleKeyword: keyword.trim(),
          locationFilter: locationFilter.trim() || undefined,
          seniorityFilter: seniorityFilter.trim() || undefined,
          pollingIntervalSeconds: intervalSec,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      setOpen(false);
      setSelected(null);
      setQ("");
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-8 border border-brand-100 bg-brand-50/40">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Companies to monitor
          </h2>
          <p className="mt-1 text-sm text-gray-600 max-w-xl">
            Adding a company runs an immediate job fetch, then the worker keeps
            polling on your interval. Only watchlisted companies are fetched—use
            a longer interval on a slow machine.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Manage the full list on{" "}
            <Link href="/watchlist" className="text-brand-700 underline">
              Watchlist
            </Link>
            .
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={atLimit}
            className="btn-primary gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add company
          </button>
        )}
      </div>

      {atLimit && (
        <p className="mt-3 text-sm text-amber-800">
          Company limit reached for your plan. Remove one on the watchlist or
          upgrade.
        </p>
      )}

      {open && !atLimit && (
        <div className="mt-6 space-y-4 border-t border-brand-100 pt-6">
          {err && (
            <p className="text-sm text-red-600" role="alert">
              {err}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Company
              </label>
              {selected ? (
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-gray-200">
                  <img
                    src={selected.logoUrl || getCompanyLogoUrl(selected.name)}
                    alt=""
                    className="h-7 w-7 rounded object-contain"
                  />
                  <span className="text-sm font-medium">{selected.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="ml-auto text-xs text-brand-600"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input pl-9 text-sm"
                    placeholder="Search…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  {q && (
                    <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {filtered.slice(0, 8).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                          onClick={() => {
                            setSelected(c);
                            setQ("");
                          }}
                        >
                          <Building2 className="h-4 w-4 text-gray-400" />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Role keyword
              </label>
              <input
                className="input text-sm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Location (optional)
              </label>
              <input
                className="input text-sm"
                placeholder="e.g. San Francisco, UK Remote"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Only jobs whose location contains this text are shown and alerted.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Experience level (optional)
              </label>
              <input
                className="input text-sm"
                placeholder="e.g. Junior, Staff"
                value={seniorityFilter}
                onChange={(e) => setSeniorityFilter(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Matches job title or inferred level (e.g. avoid Senior by typing Junior).
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Check for new jobs every
              </label>
              <select
                className="input text-sm max-w-md"
                value={intervalSec}
                onChange={(e) => setIntervalSec(Number(e.target.value))}
              >
                {POLLING_INTERVAL_PRESETS.map((p) => (
                  <option key={p.seconds} value={p.seconds}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={!selected || loading}
              className="btn-primary text-sm"
            >
              {loading ? "Saving…" : "Save & start monitoring"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setErr("");
              }}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
