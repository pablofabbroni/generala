'use client'

import { useState, useEffect } from 'react'

interface CountdownProps {
    targetDate: Date
    onComplete?: () => void
}

export function TournamentCountdown({ targetDate, onComplete }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date()

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                })
            } else {
                onComplete?.()
            }
        }

        const timer = setInterval(calculateTimeLeft, 1000)
        calculateTimeLeft()

        return () => clearInterval(timer)
    }, [targetDate, onComplete])

    const formatNumber = (num: number) => num.toString().padStart(2, '0')

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <span className="text-xl font-black text-white">{formatNumber(timeLeft.days)}</span>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Días</span>
            </div>
            <div className="text-xl font-black text-white/20">:</div>
            <div className="flex flex-col items-center">
                <span className="text-xl font-black text-white">{formatNumber(timeLeft.hours)}</span>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Hrs</span>
            </div>
            <div className="text-xl font-black text-white/20">:</div>
            <div className="flex flex-col items-center">
                <span className="text-xl font-black text-white">{formatNumber(timeLeft.minutes)}</span>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Min</span>
            </div>
            <div className="text-xl font-black text-white/20">:</div>
            <div className="flex flex-col items-center">
                <span className="text-xl font-black text-white text-glow-amber">{formatNumber(timeLeft.seconds)}</span>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Seg</span>
            </div>
        </div>
    )
}
