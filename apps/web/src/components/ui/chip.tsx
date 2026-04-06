"use client";

export function Chip({
  label,
  color = "#6E6E73",
  bg = "#F5F5F7",
  className = "",
}: {
  label: string;
  color?: string;
  bg?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium tracking-[0.01em] font-text rounded-full ${className}`}
      style={{
        color,
        background: bg,
        padding: "2px 8px",
        border: `0.5px solid ${color}33`,
      }}
    >
      {label}
    </span>
  );
}
