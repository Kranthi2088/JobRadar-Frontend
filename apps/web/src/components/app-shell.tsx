"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Live Feed", href: "/dashboard" },
  { name: "Watchlist", href: "/watchlist" },
  { name: "Settings", href: "/settings" },
];

export function AppShell({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F7" }}>
      {/* Top nav bar */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.18)",
        }}
      >
        <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-8">
          {/* Wordmark */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-bold text-black font-mono">
              J
            </div>
            <span className="text-[15px] font-semibold font-display text-white tracking-[-0.02em]">
              JobRadar
            </span>
          </Link>

          {/* Center nav */}
          <div className="flex items-center gap-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "rounded-pill px-3.5 py-1.5 text-[12px] font-text transition-all duration-[120ms]",
                    isActive
                      ? "bg-white/[0.12] font-medium text-white"
                      : "font-normal text-white/80 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-white/70 font-mono">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-jr-green"
                style={{ boxShadow: "0 0 6px #34C759" }}
              />
              Polling
            </div>
            <div className="h-4 w-px bg-white/20" />
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="h-7 w-7 rounded-full"
              />
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white font-text"
                style={{
                  background: "#1d1d1f",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {user.name?.[0] || user.email?.[0] || "U"}
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-white/70 hover:text-white transition-colors font-text"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
