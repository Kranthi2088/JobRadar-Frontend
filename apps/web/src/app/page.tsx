import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-bg text-jr-text1">
      {/* Navigation */}
      <nav
        className="fixed top-0 z-50 w-full"
        style={{
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-black">
              J
            </div>
            <span className="text-sm font-semibold tracking-[-0.18px] text-white">
              JobRadar
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-xs font-normal text-white/80 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link href="/auth/signin" className="btn-primary h-8 px-4 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex min-h-[92vh] items-center bg-black pt-20">
        <div className="mx-auto w-full max-w-[980px] px-6 text-center">
          <h1 className="mx-auto max-w-4xl text-[56px] font-semibold leading-[1.07] tracking-[-0.28px] text-white sm:text-[56px]">
            Be the first to apply.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[21px] font-normal leading-[1.19] tracking-[0.231px] text-white">
            JobRadar monitors company career pages at the ATS source level and
            notifies you within 90 seconds of a new posting.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="#how-it-works" className="btn-pill border-white text-white">
              Learn more
            </Link>
            <Link href="/auth/signin" className="btn-primary gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface-bg py-16">
        <div className="mx-auto grid max-w-[980px] grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {[
            { value: "<90s", label: "Alert latency" },
            { value: "20+", label: "ATS platforms" },
            { value: "24/7", label: "Monitoring uptime" },
            { value: "99.9%", label: "Job coverage" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[40px] font-semibold leading-[1.1] tracking-[-0.2px] text-jr-text1">
                {stat.value}
              </p>
              <p className="mt-1 text-[14px] leading-[1.29] tracking-[-0.224px] text-jr-text2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-black py-24">
        <div className="mx-auto max-w-[980px] px-6">
          <div className="text-center">
            <h2 className="text-[40px] font-semibold leading-[1.1] text-white">
              How JobRadar works
            </h2>
            <p className="mt-4 text-[21px] font-normal leading-[1.19] tracking-[0.231px] text-white">
              Three steps to never miss a job posting again
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Add your target companies",
                description:
                  "Search from 2,000+ tech companies or add any company with a public careers page.",
              },
              {
                step: "02",
                title: "We poll every 60 seconds",
                description:
                  "Our engine monitors each company's ATS directly with no aggregator delay.",
              },
              {
                step: "03",
                title: "Get alerted instantly",
                description:
                  "The moment a matching role is posted, you get a direct link to the apply page.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-lg px-6 py-7"
                style={{ background: "#272729" }}
              >
                <span className="text-[14px] leading-[1.29] tracking-[-0.224px] text-[#2997ff]">
                  {item.step}
                </span>
                <h3 className="mt-3 text-[28px] font-normal leading-[1.14] tracking-[0.196px] text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-white/85">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-surface-bg py-24">
        <div className="mx-auto max-w-[980px] px-6">
          <div className="text-center">
            <h2 className="text-[40px] font-semibold leading-[1.1] text-jr-text1">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-[21px] font-normal leading-[1.19] tracking-[0.231px] text-jr-text1">
              Start free. Upgrade when you need more power.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
            {[
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
                cta: "Get started",
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
                cta: "Start free trial",
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
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="relative flex flex-col rounded-lg bg-white p-6"
                style={
                  plan.highlighted
                    ? { boxShadow: "rgba(0, 0, 0, 0.22) 3px 5px 30px 0px" }
                    : undefined
                }
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-jr-accent px-4 py-1 text-[12px] text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-jr-text1">
                  {plan.name}
                </h3>
                <p className="mt-4">
                  <span className="text-[40px] font-semibold leading-[1.1] text-jr-text1">
                    {plan.price}
                  </span>
                  <span className="text-[14px] tracking-[-0.224px] text-jr-text2">{plan.period}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-jr-text2">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-jr-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signin"
                  className={`mt-8 w-full text-center ${
                    plan.highlighted ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="mx-auto max-w-[980px] px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-bold text-black">
              J
            </div>
            <span className="font-semibold text-white">JobRadar</span>
          </div>
          <p className="text-[12px] leading-[1.33] tracking-[-0.12px] text-white/70">
            &copy; {new Date().getFullYear()} JobRadar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
