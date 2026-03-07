'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Calendar, Users, DollarSign, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TournamentCountdown } from '@/components/tournaments/TournamentCountdown'
import { Navbar } from '@/components/layout/Navbar'
import { PageContainer } from '@/components/layout/PageContainer'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TournamentLobby() {
    const [tournaments, setTournaments] = useState<any[]>([])
    const [userEntries, setUserEntries] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const loadInitialData = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login?redirect=/tournaments')
                return
            }
            setUser(session.user)
            await Promise.all([fetchTournaments(), fetchUserEntries(session.user.id)])
            setLoading(false)
        }
        loadInitialData()
    }, [])

    const fetchTournaments = async () => {
        const { data, error } = await supabase
            .from('tournaments')
            .select('*')
            .in('status', ['scheduled', 'running'])
            .order('start_at', { ascending: true })

        if (!error) setTournaments(data || [])
    }

    const fetchUserEntries = async (userId: string) => {
        const { data, error } = await supabase
            .from('tournament_entries')
            .select('tournament_id')
            .eq('user_id', userId)

        if (!error) setUserEntries(data.map(e => e.tournament_id))
    }

    const handleInscribe = async (tournament: any) => {
        if (!user) return

        const { error } = await supabase
            .from('tournament_entries')
            .insert([{
                tournament_id: tournament.id,
                user_id: user.id,
                paid_entry: true
            }])

        if (!error) {
            // Deduct credits (ideally via RPC or trigger, but for now client side for simplicity in POC)
            await supabase.rpc('deduct_credits', { user_id: user.id, amount: tournament.entry_fee })

            setUserEntries([...userEntries, tournament.id])
            // In a real app, show a toast here
        }
    }

    return (
        <main className="min-h-screen bg-[#09090b]">
            <Navbar />
            <PageContainer>
                <div className="py-12 space-y-12">
                    <div className="flex items-center justify-between">
                        <button onClick={() => router.push('/dashboard')} className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-xs font-black uppercase tracking-widest">Volver</span>
                        </button>
                        <div className="text-right">
                            <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                                Lobby de <span className="text-amber-500 text-glow-amber">Torneos</span>
                            </h1>
                            <p className="text-[10px] md:text-sm text-white/40 font-bold uppercase tracking-[0.2em]">Compite contra los mejores del club</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {tournaments.length === 0 ? (
                                <div className="lg:col-span-2 py-20 text-center space-y-4 rounded-[3rem] border border-white/5 bg-white/5">
                                    <Trophy className="h-12 w-12 text-white/10 mx-auto" />
                                    <p className="text-white/20 font-black uppercase tracking-widest">No hay torneos programados en este momento</p>
                                </div>
                            ) : (
                                tournaments.map((t) => (
                                    <div key={t.id} className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/50 p-8 flex flex-col justify-between group hover:border-amber-500/30 transition-all shadow-2xl">
                                        <div className="absolute top-0 right-0 p-6">
                                            {userEntries.includes(t.id) ? (
                                                <div className="px-3 py-1 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                                    Inscripto
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
                                                    Abierto
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 text-amber-500">
                                                <Trophy className="h-5 w-5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Evento Especial</span>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{t.name}</h3>
                                                <p className="text-sm text-white/40 font-bold uppercase tracking-widest">
                                                    {format(new Date(t.start_at), "eeee d 'de' MMMM", { locale: es })}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-8 py-4 border-y border-white/5">
                                                <div className="space-y-1">
                                                    <span className="block text-[8px] font-black text-white/30 uppercase tracking-widest">Premio Total</span>
                                                    <span className="text-2xl font-black text-emerald-500 italic uppercase">
                                                        {t.prize_pool_amount} <span className="text-xs">U$S</span>
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-[8px] font-black text-white/30 uppercase tracking-widest">Costo</span>
                                                    <span className="text-2xl font-black text-white italic uppercase">
                                                        {t.entry_fee} <span className="text-xs">CR</span>
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-[8px] font-black text-white/30 uppercase tracking-widest">Participantes</span>
                                                    <span className="text-2xl font-black text-white italic uppercase">
                                                        8/16
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">El torneo comienza en:</span>
                                                <TournamentCountdown targetDate={new Date(t.start_at)} />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between">
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-[#09090b] bg-zinc-800" />
                                                ))}
                                                <div className="h-8 w-8 rounded-full border-2 border-[#09090b] bg-zinc-900 flex items-center justify-center text-[8px] font-black text-white/20">
                                                    +4
                                                </div>
                                            </div>
                                            {userEntries.includes(t.id) ? (
                                                <Button disabled className="bg-white/5 text-white/40 font-black uppercase tracking-widest px-8">
                                                    Ya estás dentro
                                                </Button>
                                            ) : (
                                                <Button onClick={() => handleInscribe(t)} className="bg-white hover:bg-amber-500 text-zinc-950 font-black uppercase tracking-widest px-8 shadow-xl shadow-white/5 transition-all hover:scale-105 active:scale-95">
                                                    Inscribirme Ahora
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </PageContainer>
        </main>
    )
}
