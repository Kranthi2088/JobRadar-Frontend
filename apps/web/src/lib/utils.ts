import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getJobAgeBadge(detectedAt: Date | string): {
  label: string;
  color: "green" | "amber" | "gray";
} {
  const detected = typeof detectedAt === "string" ? new Date(detectedAt) : detectedAt;
  const ageMs = Date.now() - detected.getTime();
  const ONE_HOUR = 60 * 60 * 1000;
  const SIX_HOURS = 6 * ONE_HOUR;

  if (ageMs < ONE_HOUR) return { label: "Fresh", color: "green" };
  if (ageMs < SIX_HOURS) return { label: "Recent", color: "amber" };
  return { label: "Older", color: "gray" };
}

/** Exact local date/time for ATS “posted” display. */
export function formatExactLocalTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** e.g. "3 hours ago", "2 days ago" — clearer for ATS posted time. */
export function timeAgoVerbose(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function getCompanyLogoUrl(companyName: string): string {
  const domain = companyName.toLowerCase().replace(/\s+/g, "") + ".com";
  return `https://logo.clearbit.com/${domain}`;
}

/** Web Push applicationServerKey (VAPID public key, URL-safe base64). */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
