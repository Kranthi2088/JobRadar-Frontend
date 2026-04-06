"use client";

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px bg-black/[0.08] ${className}`}
    />
  );
}
