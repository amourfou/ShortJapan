"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:from-sky-300 hover:to-indigo-400 active:scale-[0.98]",
  secondary:
    "bg-white/10 text-white border border-white/20 hover:bg-white/15 active:scale-[0.98]",
  ghost: "bg-transparent text-slate-200 hover:bg-white/10 active:scale-[0.98]",
};

export function PrimaryButton({
  children,
  variant = "primary",
  fullWidth = true,
  className = "",
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-semibold transition",
        "min-h-12 touch-manipulation",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:scale-100",
        fullWidth ? "w-full" : "",
        variantClass[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
