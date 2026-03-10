'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageContainer } from "@/components/layout/PageContainer"
import { User, Trophy, Coins, Lock, Mail, Edit2, TrendingUp, History, Copy, Check, Share2, DollarSign, Save, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface Props {
    profile: any
}

export function ProfileClient({ profile: initialProfile }: Props) {
    const [profile, setProfile] = useState(initialProfile)
    const [copied, setCopied] = useState(false)
    const [isEditingAlias, setIsEditingAlias] = useState(false)
    const [newAlias, setNewAlias] = useState(profile?.alias || '')
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    const stats = profile?.player_stats?.[0] || { games_played: 0, games_won: 0, games_lost: 0, win_rate: 0 }
    const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/login?invite=${profile?.invite_code}` : ''

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSaveAlias = async () => {
        const alias = newAlias.trim().toLowerCase().replace(/\s+/g, '_')
        if (!alias || alias === profile.alias) {
            setIsEditingAlias(false)
            return
        }

        setSaving(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ alias })
                .eq('id', profile.id)
                .select()
                .single()

            if (error) throw error
            setProfile(data)
            setIsEditingAlias(false)
        } catch (err: any) {
            console.error('Error saving alias:', err)
            alert('Error al guardar el alias: ' + (err.message || 'Error desconocido'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <PageContainer className="py-12">
            <div className="mx-auto max-w-4xl space-y-12 px-4">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 border-b border-white/5 pb-12">
                    <div className="relative group">
                        <div className="h-40 w-40 overflow-hidden rounded-full border-2 border-white/10 bg-zinc-900 shadow-2xl transition-all group-hover:border-amber-500/50">
                            {profile?.image ? (
                                <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-white/5">
                                    <User className="h-16 w-16" />
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-2 right-2 rounded-full bg-amber-500 p-2 text-black shadow-lg hover:bg-amber-400 transition-all">
                            <Edit2 className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                                <h1 className="text-4xl font-black text-white uppercase italic tracking-tight">{profile?.name || 'Nuevo Jugador'}</h1>
                                {isEditingAlias ? (
                                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 font-bold text-xs">@</span>
                                            <input
                                                type="text"
                                                value={newAlias}
                                                onChange={(e) => setNewAlias(e.target.value)}
                                                className="bg-black/40 border border-amber-500/50 rounded-xl pl-7 pr-3 py-1 text-sm text-amber-500 focus:outline-none w-40 font-black uppercase italic"
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            onClick={handleSaveAlias}
                                            disabled={saving}
                                            className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => { setIsEditingAlias(false); setNewAlias(profile.alias) }}
                                            className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditingAlias(true)}
                                        className="group/alias flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all"
                                    >
                                        <span className="text-sm font-black text-amber-500 italic uppercase">@{profile?.alias || 'sin_alias'}</span>
                                        <Edit2 className="h-3 w-3 text-white/10 group-hover/alias:text-amber-500 transition-colors" />
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-center md:justify-start gap-2 text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                    <Mail className="h-3 w-3" />
                                    {profile?.email}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-amber-500">
                                <Coins className="h-4 w-4" />
                                <span className="text-sm font-black tabular-nums">{profile?.credits || 0} Fichas</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-emerald-500">
                                <span className="text-lg">💵</span>
                                <span className="text-sm font-black tabular-nums">{profile?.usd_balance || '0.00'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referral Section */}
                <div className="rounded-[2.5rem] border border-white/10 bg-zinc-900/50 p-8 space-y-6">
                    <div className="flex items-center gap-3 text-amber-500">
                        <Share2 className="h-5 w-5" />
                        <h2 className="text-xl font-black uppercase italic tracking-tight">Gana Dinero Invitando</h2>
                    </div>
                    <p className="text-sm text-white/50 max-w-2xl leading-relaxed">
                        Comparte tu link único con amigos. Por cada nuevo usuario que se registre con tu código, recibirás <span className="text-emerald-500 font-bold">$5.00</span> de regalo.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full rounded-2xl border border-white/5 bg-black/40 px-6 py-4 font-mono text-xs text-white/60 truncate">
                            {referralLink}
                        </div>
                        <Button
                            onClick={copyToClipboard}
                            className="w-full md:w-auto px-8 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? 'Copiado' : 'Copiar Link'}
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Jugadas', value: stats.games_played, icon: History, color: 'text-zinc-400' },
                        { label: 'Ganadas', value: stats.games_won, icon: Trophy, color: 'text-amber-500' },
                        { label: 'Perdidas', value: stats.games_lost, icon: TrendingUp, color: 'text-red-500' },
                        { label: '% Victorias', value: `${stats.win_rate}%`, icon: TrendingUp, color: 'text-emerald-500' },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-3xl border border-white/5 bg-zinc-900/30 p-6 text-center backdrop-blur-sm">
                            <stat.icon className={`h-5 w-5 mx-auto mb-3 opacity-20 ${stat.color}`} />
                            <p className="text-2xl font-black text-white tabular-nums">{stat.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Settings / Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
                    <div className="rounded-3xl border border-white/5 bg-zinc-900/10 p-8 space-y-6">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
                            <Lock className="h-4 w-4 text-amber-500" />
                            Seguridad
                        </h3>
                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-sm font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                Cambiar Contraseña
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <p className="text-[10px] text-white/20 uppercase tracking-widest leading-relaxed">
                                Si iniciaste sesión con Google, la gestión de contraseña se realiza en su plataforma.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/5 bg-zinc-900/10 p-8 space-y-6">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white uppercase tracking-wider">
                            <User className="h-4 w-4 text-emerald-500" />
                            Preferencia de Perfil
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Perfil Público</span>
                                <div className="h-6 w-11 rounded-full bg-emerald-500/20 border border-emerald-500/50 relative">
                                    <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}
