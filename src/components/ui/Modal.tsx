"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function Modal({ open, onOpenChange, title, children, footer, className }: Props) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={cn("w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950/90 backdrop-blur-md shadow-soft", className)}>
          <div className="p-5 border-b border-white/10">
            <div className="text-base font-semibold">{title}</div>
          </div>
          <div className="p-5">{children}</div>
          {footer ? <div className="p-5 pt-0">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
