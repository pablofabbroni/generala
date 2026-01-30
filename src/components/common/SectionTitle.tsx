"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function SectionTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm font-semibold text-white/80", className)} {...props} />;
}
