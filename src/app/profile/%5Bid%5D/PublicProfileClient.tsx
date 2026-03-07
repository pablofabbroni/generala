'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageContainer } from "@/components/layout/PageContainer"
import { User, Trophy, TrendingUp, History, UserPlus, Loader2, Check, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { motion } from 'framer-motion'

interface Props {
    profile: any
    currentUserId: string
}

export function PublicProfileClient({ profile, currentUserId }: Props) {
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const supabase = createClient()
    const stats = profile?.player_stats?.[0] || { games_played: 0, games_won: 0, games_lost: 0, win_rate: 0 }

    const handleAddFriend = async () => {
        setSending(true)
        try {
            const { error } = await supabase
                .from('friends')
                .insert({
                    requester_id: currentUserId,
                    addressee_id: profile.id,
                    status: 'pending'
                })

            if (error) throw error
            setSent(true)
        } catch (err: any) {
            console.error('Error adding friend:', err)
            alert('Error: ' + (err.message || 'No se pudo enviar la solicitud'))
        } finally {
            setSending(false)
        }
    }

    return (
        <PageContainer className="py-20">
            <div className="mx-auto max-w-2xl px-4 space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center space-y-6"
                >
                    <div className="relative">
                        <div className="h-48 w-48 overflow-hidden rounded-full border-4 border-white/5 bg-zinc-900 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                            {profile.image ? (
                                <img src={profile.image} alt={profile.alias} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-zinc-950 text-white/5">
                                    <User className="h-20 w-20" />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-emerald-500 border-4 border-[#09090b] shadow-lg flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
                            @{profile.alias || 'jugador_generala'}
                        </h1>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Jugador del Club</p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={handleAddFriend}
                            disabled={sending || sent}
                            className={`px-8 py-6 rounded-2xl font-black uppercase tracking-widest transition-all ${sent ? 'bg-emerald-500 text-black' : 'bg-white text-black hover:bg-amber-500'}`}
                        >
                            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : sent ? <Check className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                            {sent ? 'Solicitud Enviada' : 'Agregar Amigo'}
                        </Button>
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Victorias', value: stats.games_won, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                        { label: 'Racha', value: '7', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                        { label: 'Partidas', value: stats.games_played, icon: History, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                        { label: 'Win Rate', value: `${stats.win_rate}%`, icon: ShieldAlert, color: 'text-purple-500', bg: 'bg-purple-500/5' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-6 rounded-[2rem] border border-white/5 ${stat.bg} space-y-4`}
                        >
                            <stat.icon className={`h-5 w-5 ${stat.color} opacity-40`} />
                            <div>
                                <p className="text-3xl font-black text-white tabular-nums">{stat.value}</p>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </PageContainer>
    )
}
