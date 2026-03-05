'use client'

import { useState } from 'react'
import { login, signup, loginWithProvider } from './actions'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Chrome, Facebook, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true)
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-black tracking-tighter text-white uppercase italic"
                    >
                        Generala <span className="text-amber-500">Club</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-2 text-sm font-medium tracking-widest text-white/40 uppercase"
                    >
                        {isLogin ? 'Bienvenido de nuevo, jugador' : 'Unite al club exclusivo'}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl"
                >
                    {/* Animated Background Decoration */}
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

                    {error && (
                        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="mb-8 flex rounded-2xl bg-zinc-950/50 p-1">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${isLogin ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${!isLogin ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    <form action={isLogin ? login : signup} onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode='wait'>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Nombre Completo</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            name="name"
                                            type="text"
                                            required={!isLogin}
                                            placeholder="Juan Pérez"
                                            className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 py-3.5 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/10"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="tu@email.com"
                                    className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 py-3.5 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Contraseña</label>
                                {isLogin && (
                                    <Link href="/forgot-password" title="¿La olvidaste?" className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 hover:text-amber-500 transition-colors">
                                        ¿La olvidaste?
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
                                    className="w-full rounded-2xl border border-white/5 bg-zinc-950/50 py-3.5 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="group relative w-full overflow-hidden rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-amber-500 disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                                ) : (
                                    <>
                                        {isLogin ? 'Entrar al Club' : 'Crear Cuenta'}
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
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="bg-[#111] px-4 text-white/20">O continuar con</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => loginWithProvider('google')}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-zinc-950/50 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white/5"
                        >
                            <Chrome className="h-4 w-4 text-amber-500" />
                            Google
                        </button>
                        <button
                            onClick={() => loginWithProvider('facebook')}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-zinc-950/50 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white/5"
                        >
                            <Facebook className="h-4 w-4 text-blue-500" />
                            Facebook
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
