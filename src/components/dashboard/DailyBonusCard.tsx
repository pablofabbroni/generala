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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all ${canClaim
                ? 'border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                : 'border-white/10 bg-zinc-900/60 opacity-60'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 ${canClaim ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/20'}`}>
                    <Calendar className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Bonus Diario</p>
                    <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mt-0.5">
                        {canClaim ? '¡Tu regalo está listo!' : `Disponible en ${timeLeft}`}
                    </p>
                </div>
            </div>

            {canClaim ? (
                <button
                    onClick={handleClaim}
                    disabled={loading}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-amber-400 disabled:opacity-50 transition-all"
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Reclamar +100'}
                </button>
            ) : (
                <div className="rounded-xl bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                    Siguiente
                </div>
            )}
        </motion.div>
    )
}
