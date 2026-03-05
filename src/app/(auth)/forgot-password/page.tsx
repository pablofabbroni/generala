'use client'

import { forgotPassword } from './actions'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tighter text-white uppercase italic"
                    >
                        Recuperar <span className="text-amber-500">Acceso</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-2 text-sm font-medium tracking-widest text-white/40 uppercase"
                    >
                        Te enviaremos un link para resetear tu clave
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl"
                >
                    {success ? (
                        <div className="text-center space-y-6 py-4">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-emerald-500/20 p-4">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white">Email enviado</h3>
                                <p className="text-sm text-white/40">Revisá tu bandeja de entrada (y la carpeta de spam) para continuar.</p>
                            </div>
                            <Link
                                href="/login"
                                className="block w-full rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-amber-500"
                            >
                                Volver al Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form action={forgotPassword} onSubmit={() => setLoading(true)} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Email Registrado</label>
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

                                <button
                                    disabled={loading}
                                    className="group relative w-full overflow-hidden rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-amber-500 disabled:opacity-50"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-black" />
                                        ) : (
                                            'Enviar Instrucciones'
                                        )}
                                    </span>
                                </button>

                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    Volver al Login
                                </Link>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
