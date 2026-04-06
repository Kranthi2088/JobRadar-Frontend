"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ChevronRight, Search, Bell, Building2 } from "lucide-react";
import { cn, getCompanyLogoUrl } from "@/lib/utils";

const POPULAR_ROLES = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Designer",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Engineering Manager",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchCompanies = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setCompanies([]);
      return;
    }
    const res = await fetch(`/api/companies?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setCompanies(data);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      for (const companyId of selectedCompanies) {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, roleKeyword: role }),
        });
      }

      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription.toJSON()),
          });
        } catch {
          // Push not available, proceed
        }
      }

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 w-16 rounded-full transition-colors",
                s <= step ? "bg-brand-600" : "bg-gray-200"
              )}
            />
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <div className="card animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-600 mb-4">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                What role are you looking for?
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                We&apos;ll alert you when jobs matching this keyword are posted.
              </p>
            </div>

            <input
              type="text"
              placeholder="e.g. Software Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input mb-4"
              autoFocus
            />

            <div className="flex flex-wrap gap-2 mb-6">
              {POPULAR_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    role === r
                      ? "bg-brand-100 text-brand-700 ring-1 ring-brand-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!role.trim()}
              className="btn-primary w-full gap-2"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Companies */}
        {step === 2 && (
          <div className="card animate-fade-in">
            <div className="text-center mb-6">
              <Building2 className="mx-auto h-10 w-10 text-brand-600 mb-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Add your target companies
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Select up to 5 companies to monitor (free plan).
              </p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => searchCompanies(e.target.value)}
                className="input pl-9"
                autoFocus
              />
              {companies.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg bg-white shadow-lg ring-1 ring-gray-200 max-h-48 overflow-auto">
                  {companies.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        if (!selectedCompanies.includes(c.id)) {
                          setSelectedCompanies((prev) => [...prev, c.id]);
                        }
                        setSearchQuery("");
                        setCompanies([]);
                      }}
                      disabled={selectedCompanies.includes(c.id)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <img
                        src={c.logoUrl || getCompanyLogoUrl(c.name)}
                        alt=""
                        className="h-6 w-6 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="text-sm">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCompanies.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Selected ({selectedCompanies.length}/5)
                </p>
                {selectedCompanies.map((id) => {
                  const company = companies.find((c: any) => c.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <span className="text-sm text-gray-900">
                        {company?.name || id}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedCompanies((prev) =>
                            prev.filter((c) => c !== id)
                          )
                        }
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedCompanies.length === 0}
                className="btn-primary flex-1 gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Notifications */}
        {step === 3 && (
          <div className="card animate-fade-in">
            <div className="text-center mb-6">
              <Bell className="mx-auto h-10 w-10 text-brand-600 mb-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Enable notifications
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Get alerted within 90 seconds of a new job posting — even when
                your browser is closed.
              </p>
            </div>

            <div className="rounded-lg bg-brand-50 p-4 mb-6">
              <h3 className="text-sm font-semibold text-brand-900 mb-2">
                Your setup:
              </h3>
              <ul className="space-y-1 text-sm text-brand-700">
                <li>Role: {role}</li>
                <li>Companies: {selectedCompanies.length} selected</li>
                <li>Polling: Every 60 seconds</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? "Setting up..." : "Start monitoring"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
