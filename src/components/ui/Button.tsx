"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant="primary", size="md", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-2xl font-medium transition focus:outline-none focus:ring-2 focus:ring-white/15 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-white text-zinc-950 hover:bg-white/90 shadow-soft",
    secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
    ghost: "bg-transparent text-white hover:bg-white/10",
    danger: "bg-rose-500 text-white hover:bg-rose-500/90",
  } as const;
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  } as const;

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
