'use client'

import { useState, useEffect } from 'react'
import { Play, Loader2, Clock, Megaphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { claimAdReward } from '@/lib/services/economy'
import { useRouter } from 'next/navigation'

interface Props {
    lastClaimed: string | null
    credits: number
    dailyCount: number
}

export function AdRewardCard({ lastClaimed, credits, dailyCount }: Props) {
    const [loading, setLoading] = useState(false)
    const [showingAd, setShowingAd] = useState(false)
    const [adTimer, setAdTimer] = useState(10)
    const [cooldownTime, setCooldownTime] = useState<string | null>(null)
    const [canClaim, setCanClaim] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkEligibility = () => {
            if (credits >= 20) {
                setCanClaim(false)
                return
            }

            if (dailyCount >= 5) {
                setCanClaim(false)
                return
            }

            if (!lastClaimed) {
                setCanClaim(true)
                return
            }

            const now = new Date()
            const last = new Date(lastClaimed)
            const diff = 2 * 60 * 60 * 1000 - (now.getTime() - last.getTime())

            if (diff <= 0) {
                setCanClaim(true)
                setCooldownTime(null)
            } else {
                setCanClaim(false)
                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                setCooldownTime(`${hours}h ${minutes}m`)
            }
        }

        checkEligibility()
        const interval = setInterval(checkEligibility, 60000)
        return () => clearInterval(interval)
    }, [lastClaimed, credits, dailyCount])

    const startAd = () => {
        setShowingAd(true)
        setAdTimer(10)
    }

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (showingAd && adTimer > 0) {
            interval = setInterval(() => setAdTimer(t => t - 1), 1000)
        } else if (showingAd && adTimer === 0) {
            handleClaim()
        }
        return () => clearInterval(interval)
    }, [showingAd, adTimer])

    const handleClaim = async () => {
        try {
            setLoading(true)
            await claimAdReward()
            setShowingAd(false)
            router.refresh()
        } catch (err: any) {
            alert(err.message)
            setShowingAd(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all ${canClaim
                        ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                        : 'border-white/5 bg-zinc-900/30 opacity-60'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 ${canClaim ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/20'}`}>
                        <Megaphone className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Rescate</p>
                        <p className="text-[9px] font-medium text-white/40 uppercase tracking-tighter">
                            {canClaim
                                ? 'Mirá un aviso para +50'
                                : cooldownTime
                                    ? `Espera ${cooldownTime}`
                                    : credits >= 20
                                        ? 'Saldo suficiente'
                                        : 'Límite diario'}
                        </p>
                    </div>
                </div>

                {canClaim ? (
                    <button
                        onClick={startAd}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-emerald-400 disabled:opacity-50 transition-all"
                    >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
                        Ver Aviso
                    </button>
                ) : (
                    <div className="rounded-xl bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                        Bloqueado
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {showingAd && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
                    >
                        <div className="max-w-md w-full text-center space-y-8">
                            <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-amber-500/20" />
                                <Loader2 className="h-12 w-12 text-white/10 animate-spin" />
                                <p className="absolute bottom-4 left-0 right-0 text-[10px] font-bold uppercase tracking-widest text-white/20">Simulando Publicidad...</p>

                                <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xs font-black text-white">
                                    {adTimer}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-white uppercase italic">Generala <span className="text-amber-500">Premium</span></h2>
                                <p className="text-sm text-white/40">Tu recompensa estará lista en unos segundos.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
