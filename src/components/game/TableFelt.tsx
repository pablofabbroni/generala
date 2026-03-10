"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TableFeltProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export function TableFelt({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] p-2 sm:p-4 lg:p-8">
            {/* Wood Frame Container */}
            <div className="wood-frame relative h-full min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-4rem)] w-full rounded-[2.5rem] sm:rounded-[3.5rem] lg:rounded-[4.5rem] p-1.5 sm:p-3 lg:p-4 bg-[#1a0f08]">
                {/* Inner Bezel for deeper look */}
                <div className="absolute inset-0 rounded-[2.3rem] sm:rounded-[3.3rem] lg:rounded-[4.3rem] border-4 border-black/20 pointer-events-none z-10" />

                {/* Felt Background Wrapper */}
                <div className="relative h-full w-full rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] overflow-hidden">
                    <div className="casino-felt absolute inset-0 -z-10" />

                    {/* Vignette Overlay */}
                    <div className="casino-vignette absolute inset-0 z-0" />

                    {/* Content Area */}
                    <div className="relative z-10 h-full w-full p-4 sm:p-8 lg:p-12 overflow-y-auto scrollbar-hide">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
