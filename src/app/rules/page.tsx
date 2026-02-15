"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, BookOpen, Star, Zap, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RulesPage() {
    const router = useRouter();

    return (
        <PageContainer className="max-w-4xl py-12 space-y-12 pb-32">
            <div className="space-y-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard")}
                    className="group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Volver al Dashboard
                </Button>

                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
                            Reglas del <span className="text-amber-500">Club</span>
                        </h1>
                        <p className="text-white/40 font-medium tracking-widest uppercase text-xs">
                            Todo lo que necesitás saber para ganar
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8">
                {/* General Section */}
                <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Zap className="text-amber-500 h-6 w-6" />
                        Conceptos Clave
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3 p-6 rounded-3xl bg-white/5 border border-white/5">
                            <h3 className="text-amber-500 font-bold uppercase text-sm tracking-widest">Servido</h3>
                            <p className="text-sm text-white/60 leading-relaxed">
                                Se considera "Servido" cuando lográs una de las categorías mayores
                                (Escalera, Full o Poker) en el **primer tiro** de tu turno.
                                ¡Esto te otorga **+5 puntos extra** sobre el valor base!
                            </p>
                        </div>

                        <div className="space-y-3 p-6 rounded-3xl bg-white/5 border border-white/5">
                            <h3 className="text-amber-500 font-bold uppercase text-sm tracking-widest">Chance</h3>
                            <p className="text-sm text-white/60 leading-relaxed">
                                Es tu "comodín". Suma el total de los 5 dados en cualquier momento.
                                Ideal para cuando no pudiste armar ninguna otra combinación pero tenés números altos.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Score Table Section */}
                <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Star className="text-amber-500 h-6 w-6" />
                        Puntuaciones
                    </h2>

                    <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/20">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                                <tr>
                                    <th className="px-6 py-4">Categoría</th>
                                    <th className="px-6 py-4">Base</th>
                                    <th className="px-6 py-4">Servido</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-white/80">
                                <tr>
                                    <td className="px-6 py-4 font-medium">Números (1 al 6)</td>
                                    <td className="px-6 py-4">Dados iguales</td>
                                    <td className="px-6 py-4">—</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium">Escalera Menor</td>
                                    <td className="px-6 py-4">15 pts</td>
                                    <td className="px-6 py-4 text-emerald-400">20 pts</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium">Escalera Mayor</td>
                                    <td className="px-6 py-4">20 pts</td>
                                    <td className="px-6 py-4 text-emerald-400">25 pts</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium">Full</td>
                                    <td className="px-6 py-4">30 pts</td>
                                    <td className="px-6 py-4 text-emerald-400">35 pts</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium">Poker</td>
                                    <td className="px-6 py-4">40 pts</td>
                                    <td className="px-6 py-4 text-emerald-400">45 pts</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium">Generala</td>
                                    <td className="px-6 py-4">50 pts</td>
                                    <td className="px-6 py-4">—</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium text-amber-500">Doble Generala*</td>
                                    <td className="px-6 py-4">100 pts</td>
                                    <td className="px-6 py-4">—</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[10px] text-white/30 italic">* Si la variante está activada. Nota: Jugar con Escalera Menor habilita la opción de Doble Generala.</p>
                </section>

                {/* Variants Section */}
                <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Info className="text-amber-500 h-6 w-6" />
                        Variantes del Club
                    </h2>

                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
                            <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                            <div>
                                <h4 className="font-bold text-white">Escalera Menor y Mayor</h4>
                                <p className="text-xs text-white/40">Podés elegir jugar con dos tipos de escalera para sumar más puntos.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
                            <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                            <div>
                                <h4 className="font-bold text-white">Bono de 63 puntos</h4>
                                <p className="text-xs text-white/40">Si la suma de tus puntos del 1 al 6 es igual o mayor a 63, ¡recibís un bono de 35 puntos adicionales!</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PageContainer>
    );
}
