"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TableFeltProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export function TableFelt({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 p-2 sm:p-4 lg:p-8">
            {/* Wood Frame Container */}
            <div className="wood-frame relative h-full min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-4rem)] w-full rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] p-4 sm:p-8 lg:p-12">
                {/* Felt Background */}
                <div className="casino-felt absolute inset-0 -z-10 rounded-[1.5rem] sm:rounded-[2.5rem] lg:rounded-[3.5rem]" />

                {/* Vignette Overlay */}
                <div className="casino-vignette absolute inset-0 z-0 rounded-[1.5rem] sm:rounded-[2.5rem] lg:rounded-[3.5rem]" />

                {/* Content Area */}
                <div className="relative z-10 h-full w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
