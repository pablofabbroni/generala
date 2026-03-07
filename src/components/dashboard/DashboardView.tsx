'use client'

import { useState } from 'react'
import { PageContainer } from "@/components/layout/PageContainer"
import { ModeCard } from "@/components/dashboard/ModeCard"
import { Calculator, Dices, Trophy, BookOpen, Calendar, MessageSquare, Star, Send, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/store/gameStore"
import { DailyBonusCard } from "./DailyBonusCard"
import { AdRewardCard } from "./AdRewardCard"
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface Props {
    profile: any
}

export default function DashboardView({ profile }: Props) {
    const router = useRouter()
    const setGameMode = useGameStore((s) => s.setGameMode)
    const [feedbackSent, setFeedbackSent] = useState(false)
    const [submittingFeedback, setSubmittingFeedback] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<'bug' | 'idea' | 'ux'>('idea')
    const [message, setMessage] = useState('')
    const supabase = createClient()

    const handleModeSelect = (mode: "digital" | "analog", path: string) => {
        setGameMode(mode)
        router.push(path)
    }

    const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmittingFeedback(true)

        try {
            const { error } = await supabase
                .from('feedback')
                .insert({
                    user_id: profile?.id,
                    category: selectedCategory,
                    message: message,
                    page: 'dashboard',
                    status: 'new'
                })

            if (error) throw error
            setFeedbackSent(true)
            setMessage('')
        } catch (err) {
            console.error('Error submitting feedback:', err)
        } finally {
            setSubmittingFeedback(false)
        }
    }

    return (
        <PageContainer className="flex flex-col items-center gap-12 py-12">
            <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic">
                    Generala <span className="text-amber-500">Club</span>
                </h1>
                <p className="text-white/40 font-medium tracking-widest uppercase text-sm">
                    Elegí tu mesa y empezá a jugar
                </p>
            </div>

            {/* Economy Section - Compact and Below Header */}
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl px-4">
                <div className="flex-1">
                    <DailyBonusCard lastClaimed={profile?.last_daily_bonus_at} />
                </div>
                <div className="flex-1">
                    <AdRewardCard
                        lastClaimed={profile?.last_ad_reward_at}
                        credits={profile?.credits || 0}
                        dailyCount={profile?.ad_reward_count_today || 0}
                    />
                </div>
            </div>

            {/* Game Modes Section - Grid for Desktop, Carousel for Mobile */}
            <div className="w-full max-w-4xl px-4">
                {/* Mobile Carousel View */}
                <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 pb-6 -mx-4 px-4">
                    <div className="snap-center shrink-0 w-[85vw]">
                        <ModeCard
                            title="Juega ahora"
                            description="Entrá a una mesa, lanzá los dados y probá tu suerte contra la CPU o amigos."
                            icon={Dices}
                            variant="gold"
                            onClick={() => router.push("/play/selection")}
                        />
                    </div>
                    <div className="snap-center shrink-0 w-[85vw]">
                        <ModeCard
                            title="Torneos del Club"
                            description="Participá en eventos exclusivos y ganá premios únicos cada semana."
                            icon={Calendar}
                            variant="gold"
                            onClick={() => router.push("/tournaments")}
                        />
                    </div>
                    <div className="snap-center shrink-0 w-[85vw]">
                        <ModeCard
                            title="Reglas"
                            description="Repasá las reglas oficiales, variantes y bonos especiales de la Generala."
                            icon={BookOpen}
                            variant="glass"
                            onClick={() => router.push("/rules")}
                        />
                    </div>
                    <div className="snap-center shrink-0 w-[85vw]">
                        <ModeCard
                            title="Comunidad"
                            description="Conectate con el club, chateá con otros jugadores y encontrá nuevos rivales."
                            icon={MessageSquare}
                            variant="glass"
                            onClick={() => router.push("/friends")}
                        />
                    </div>
                </div>

                {/* Desktop Grid View */}
                <div className="hidden md:grid grid-cols-2 gap-8">
                    <ModeCard
                        title="Juega ahora"
                        description="Entrá a una mesa, lanzá los dados y probá tu suerte contra la CPU o amigos."
                        icon={Dices}
                        variant="gold"
                        onClick={() => router.push("/play/selection")}
                    />

                    <ModeCard
                        title="Torneos del Club"
                        description="Participá en competencias exclusivas y ganá premios únicos cada semana."
                        icon={Calendar}
                        variant="gold"
                        onClick={() => router.push("/tournaments")}
                    />

                    <ModeCard
                        title="Reglas"
                        description="Repasá las reglas oficiales, variantes y bonos especiales de la Generala."
                        icon={BookOpen}
                        variant="glass"
                        onClick={() => router.push("/rules")}
                    />

                    <ModeCard
                        title="Comunidad"
                        description="Conectate con el club, chateá con otros jugadores y encontrá nuevos rivales en tiempo real."
                        icon={MessageSquare}
                        variant="glass"
                        onClick={() => router.push("/community")}
                    />
                </div>

                {/* Carousel Indicators for Mobile */}
                <div className="flex justify-center gap-2 mt-2 md:hidden">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    ))}
                </div>
            </div>

            {/* Feedback Section */}
            <div className="w-full max-w-4xl px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/50 p-8 backdrop-blur-sm"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <MessageSquare className="h-5 w-5" />
                                <span className="text-xs font-black uppercase tracking-widest">Beta / Pruebas</span>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic">Tu feedback <span className="text-amber-500">Importa</span></h3>
                            <p className="text-sm text-white/50 max-w-md">Esta versión está en pruebas. Tu comentario nos ayuda a mejorar la experiencia del Club.</p>
                        </div>

                        {feedbackSent ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-500"
                            >
                                <Star className="h-5 w-5 fill-current" />
                                <span className="text-xs font-bold uppercase tracking-widest">¡Gracias por tu mensaje!</span>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleFeedbackSubmit} className="w-full md:w-auto flex-1 max-w-sm space-y-4">
                                <div className="flex gap-2">
                                    {['bug', 'idea', 'ux'].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat as any)}
                                            className={`flex-1 rounded-xl border py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === cat
                                                ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20'
                                                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Contanos qué te pareció..."
                                        className="w-full h-24 rounded-2xl border border-white/10 bg-zinc-950/50 p-4 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/20 resize-none"
                                    />
                                    <button
                                        disabled={submittingFeedback}
                                        className="absolute bottom-3 right-3 p-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-all disabled:opacity-50"
                                    >
                                        {submittingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="flex items-center gap-8 pt-8">
                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all">
                        <Trophy className="h-5 w-5 text-white/40 group-hover:text-amber-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60">Leaderboard</span>
                </div>
            </div>
        </PageContainer>
    )
}
