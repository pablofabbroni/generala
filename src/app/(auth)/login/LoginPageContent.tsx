'use client'

import { useState, useEffect } from 'react'
import { login, signup, loginWithProvider } from './actions'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Chrome, ArrowRight, Loader2, AlertCircle, Calculator, Users, Trophy, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ModeCard } from '@/components/dashboard/ModeCard'
import { useGameStore } from '@/store/gameStore'

export function LoginPageContent() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [inviteCode, setInviteCode] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const router = useRouter()
    const error = searchParams.get('error')
    const setGameMode = useGameStore((s) => s.setGameMode)

    useEffect(() => {
        const invite = searchParams.get('invite')
        if (invite) {
            setInviteCode(invite)
            // If user arrives via invite, they likely need to register
            setIsLogin(false)
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true)
    }

    const handleAnotadorClick = () => {
        setGameMode("analog")
        router.push("/play/setup")
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            {/* Hero Section */}
            <div className="relative pt-20 pb-12 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                            Generala <span className="text-amber-500 text-glow-amber">Club</span>
                        </h1>
                        <p className="mt-4 text-sm md:text-lg font-bold tracking-[0.3em] text-white/40 uppercase">
                            La experiencia definitiva de dados
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-20 space-y-20">
                {/* Main Content: Split Login & Anotador */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Access Cards (Left/Top) */}
                    <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ModeCard
                                title="Anotador"
                                description="¿Jugás con dados físicos? Usá la app solo para anotar sin registrarte."
                                icon={Calculator}
                                variant="gold"
                                onClick={handleAnotadorClick}
                            />

                            {/* Proactive Placeholders for requested cards */}
                            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 flex flex-col justify-between group transition-all hover:border-white/20 h-full">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-amber-500">
                                        <Users className="h-5 w-5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">En Vivo</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase italic">124 <span className="text-white/40">Jugadores</span></h3>
                                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Compitiendo ahora mismo en el club</p>
                                </div>
                                <div className="mt-6 flex -space-x-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-[#09090b] bg-zinc-800 flex items-center justify-center overflow-hidden">
                                            <div className="h-full w-full bg-gradient-to-br from-amber-500/20 to-amber-500/10" />
                                        </div>
                                    ))}
                                    <div className="h-8 px-3 rounded-full border-2 border-[#09090b] bg-zinc-900 flex items-center justify-center text-[10px] font-black text-white/40">
                                        +119
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra requested cards: Ranking & Tournaments */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <Trophy className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Top Ranking</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Semanal</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { pos: 1, name: 'Tavo_Apostador', pts: 12450 },
                                        { pos: 2, name: 'Facu_Dices', pts: 11200 },
                                        { pos: 3, name: 'Santi_King', pts: 9800 },
                                    ].map((player) => (
                                        <div key={player.pos} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/50 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <span className={player.pos === 1 ? 'text-amber-500 font-black' : 'text-white/20 font-black'}>{player.pos}</span>
                                                <span className="text-xs font-bold text-white/80">{player.name}</span>
                                            </div>
                                            <span className="text-xs font-mono text-white/40">{player.pts} pts</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-500">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Torneos del Club</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase italic">GRAN FINAL <span className="text-amber-500">DOMINGO</span></h3>
                                    <p className="text-xs text-white/40 font-bold uppercase tracking-[0.15em]">Premio: 5.000 Créditos</p>
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase">
                                        20:00 HS
                                    </div>
                                    <Link href="/login" className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest underline underline-offset-4 decoration-amber-500/50">
                                        Ver detalles
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Login Form (Right/Bottom) */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/50 p-8 md:p-10 shadow-2xl backdrop-blur-xl"
                        >
                            <div className="mb-8 flex rounded-2xl bg-zinc-950/50 p-1.5">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    Iniciar Sesión
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    Registro
                                </button>
                            </div>

                            <form action={isLogin ? login : signup} onSubmit={handleSubmit} className="space-y-5">
                                <AnimatePresence mode='wait'>
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Nombre de Usuario</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                                                <input
                                                    name="name"
                                                    type="text"
                                                    required={!isLogin}
                                                    placeholder="Tu nombre o alias"
                                                    className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 py-4 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/10"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {inviteCode && !isLogin && (
                                    <input type="hidden" name="referred_by" value={inviteCode} />
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="tu@email.com"
                                            className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 py-4 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Contraseña</label>
                                        {isLogin && (
                                            <Link href="/forgot-password" title="¿La olvidaste?" className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 hover:text-amber-500 transition-colors">
                                                ¿Olvidaste tu clave?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 py-4 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/10"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    className="group relative w-full overflow-hidden rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-amber-500 disabled:opacity-50 mt-4"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-black" />
                                        ) : (
                                            <>
                                                {isLogin ? 'Entrar al Club' : 'Registrarme'}
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="bg-[#121214] px-4 text-white/20">O unirse con</span>
                                </div>
                            </div>

                            <button
                                onClick={() => loginWithProvider('google')}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-zinc-950/50 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/5"
                            >
                                <Chrome className="h-5 w-5 text-amber-500" />
                                Google account
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
