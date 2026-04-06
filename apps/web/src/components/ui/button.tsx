"use client";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success";

export function Btn({
  children,
  variant = "primary",
  onClick,
  className = "",
  disabled = false,
  type = "button",
  style,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  style?: React.CSSProperties;
}) {
  const base =
    "inline-flex h-11 items-center justify-center gap-1.5 rounded-r2 border border-transparent px-[15px] text-[17px] font-normal font-text tracking-[-0.374px] leading-none transition-all duration-150 outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-jr-accent text-white hover:bg-[#0077ED]",
    secondary:
      "bg-[#1D1D1F] text-white hover:bg-[#2B2B2D]",
    ghost: "bg-transparent text-jr-link hover:underline",
    success:
      "bg-jr-green-light text-jr-green",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(base, variants[variant], className)}
      style={style}
    >
      {children}
    </button>
  );
}
