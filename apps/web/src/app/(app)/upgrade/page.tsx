"use client";

import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Up to 5 companies",
      "1 role keyword",
      "Browser push notifications",
      "60-second polling",
      "7-day job history",
    ],
    cta: "Current plan",
    disabled: true,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    features: [
      "Unlimited companies",
      "Unlimited role keywords",
      "Browser + mobile push",
      "30-second polling",
      "90-day job history",
      "Email digest",
      "Location & seniority filters",
    ],
    cta: "Upgrade to Pro",
    disabled: false,
    highlighted: true,
  },
  {
    name: "Teams",
    price: "$49",
    period: "/month",
    features: [
      "Everything in Pro",
      "15-second polling",
      "1-year job history",
      "5 team seats",
      "Slack integration",
      "Recruiter dashboard",
    ],
    cta: "Contact sales",
    disabled: false,
    highlighted: false,
  },
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planName: string) => {
    if (planName === "Teams") {
      window.open(
        "mailto:sales@jobradar.app?subject=JobRadar Teams Plan",
        "_blank"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName.toLowerCase() }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1080px] px-8 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-[28px] font-bold font-display text-jr-text1 tracking-[-0.03em] mb-1">
          Upgrade your plan
        </h1>
        <p className="text-sm text-jr-text2 font-text">
          Get faster alerts and unlimited monitoring.
        </p>
      </div>

      <div className="mx-auto grid max-w-[900px] gap-5 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-r4 bg-white p-[22px]",
              plan.highlighted
                ? "shadow-[0_4px_20px_rgba(0,102,204,0.12)]"
                : ""
            )}
            style={{
              border: plan.highlighted
                ? "1.5px solid #0066CC"
                : "0.5px solid rgba(0,0,0,0.08)",
              boxShadow: plan.highlighted
                ? undefined
                : "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {plan.highlighted && (
              <span
                className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-lg px-4 py-1 text-[11px] font-semibold text-white"
                style={{ background: "#0066CC" }}
              >
                Most Popular
              </span>
            )}
            <h3 className="mt-2 text-[15px] font-semibold text-jr-text1 font-text">
              {plan.name}
            </h3>
            <p className="mt-3">
              <span className="text-[28px] font-bold text-jr-text1 font-display tracking-[-0.03em]">
                {plan.price}
              </span>
              <span className="text-sm text-jr-text3 font-text">
                {plan.period}
              </span>
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-[13px] text-jr-text2 font-text"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="mt-0.5 flex-shrink-0"
                  >
                    <path
                      d="M3 7l2.5 2.5L11 4"
                      stroke="#34C759"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Btn
                variant={plan.highlighted ? "primary" : "secondary"}
                onClick={() => handleUpgrade(plan.name)}
                disabled={plan.disabled || loading}
                className="w-full justify-center"
              >
                {plan.cta}
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
