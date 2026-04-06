"use client";

import { getCompanyLogoUrl } from "@/lib/utils";

const BRAND_COLORS = [
  "#635BFF", "#D97757", "#10A37F", "#5E6AD2", "#F24E1E",
  "#FF385C", "#0052FF", "#FF3621", "#29B5E8", "#7C3AED",
  "#01A4C4", "#5865F2", "#00C4CC", "#3D72F6", "#FCB400",
];

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BRAND_COLORS[Math.abs(hash) % BRAND_COLORS.length];
}

export function Logo({
  name,
  slug,
  logoUrl,
  size = 36,
}: {
  name: string;
  slug?: string;
  logoUrl?: string | null;
  size?: number;
}) {
  const bg = colorFromName(name);
  const resolvedUrl = logoUrl || getCompanyLogoUrl(name);
  const radius = size * 0.22;
  const fontSize = size * 0.46;

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
      }}
    >
      <img
        src={resolvedUrl}
        alt={name}
        className="absolute inset-0 h-full w-full object-contain bg-white"
        style={{ borderRadius: radius }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        className="items-center justify-center text-white font-bold font-display"
        style={{
          display: "none",
          width: size,
          height: size,
          borderRadius: radius,
          background: bg,
          fontSize,
          letterSpacing: "-0.02em",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)",
        }}
      >
        {name[0]}
      </div>
    </div>
  );
}

export function LogoFallback({
  name,
  size = 36,
}: {
  name: string;
  size?: number;
}) {
  const bg = colorFromName(name);
  const radius = size * 0.22;
  const fontSize = size * 0.46;

  return (
    <div
      className="flex items-center justify-center text-white font-bold font-display flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        fontSize,
        letterSpacing: "-0.02em",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)",
      }}
    >
      {name[0]}
    </div>
  );
}
