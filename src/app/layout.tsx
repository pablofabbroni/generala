import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generala Club",
  description: "La mejor experiencia de Generala: Dados 3D, IA avanzada y modo anotador profesional.",
};

import { Navbar } from "@/components/layout/Navbar";
import NotificationCenter from "@/components/social/NotificationCenter";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen">
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute -bottom-40 right-0 h-[500px] w-[700px] rounded-full bg-sky-400/10 blur-3xl" />
          </div>
          <Navbar />
          <NotificationCenter />
          <main className="pt-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
