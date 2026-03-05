'use client'

import { useState, useEffect } from 'react'
import { Calendar, Loader2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { claimDailyBonus } from '@/lib/services/economy'
import { useRouter } from 'next/navigation'

interface Props {
    lastClaimed: string | null
}

export function DailyBonusCard({ lastClaimed }: Props) {
    const [loading, setLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState<string | null>(null)
    const [canClaim, setCanClaim] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkCanClaim = () => {
            if (!lastClaimed) {
                setCanClaim(true)
                return
            }

            const now = new Date()
            const last = new Date(lastClaimed)
            const diff = 24 * 60 * 60 * 1000 - (now.getTime() - last.getTime())

            if (diff <= 0) {
                setCanClaim(true)
                setTimeLeft(null)
            } else {
                setCanClaim(false)
                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                setTimeLeft(`${hours}h ${minutes}m`)
            }
        }

        checkCanClaim()
        const interval = setInterval(checkCanClaim, 60000)
        return () => clearInterval(interval)
    }, [lastClaimed])

    const handleClaim = async () => {
        try {
            setLoading(true)
            await claimDailyBonus()
            router.refresh()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-3xl border p-6 transition-all ${canClaim
                    ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                    : 'border-white/5 bg-zinc-900/50 opacity-60'
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Bonus Diario</p>
                    <h3 className="text-xl font-black text-white uppercase italic">Regalo del <span className="text-amber-500">Club</span></h3>
                    <p className="text-xs text-white/40">Vuelve cada día para reclamar +100 fichas gratis.</p>
                </div>
                <div className={`rounded-2xl p-3 ${canClaim ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/20'}`}>
                    <Calendar className="h-6 w-6" />
                </div>
            </div>

            <div className="mt-8">
                {canClaim ? (
                    <button
                        onClick={handleClaim}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reclamar +100 Fichas'}
                    </button>
                ) : (
                    <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/5 bg-zinc-950/50 py-3 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <span>Disponible en {timeLeft}</span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
