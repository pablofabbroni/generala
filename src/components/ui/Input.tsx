"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl bg-white/5 border border-white/10 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10",
        className
      )}
      {...props}
    />
  );
}
