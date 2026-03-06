import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { User, Trophy, Coins, Lock, Mail, Edit2, TrendingUp, History } from "lucide-react"

export default async function ProfilePage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, player_stats(*)')
        .eq('id', user.id)
        .single()

    const stats = profile?.player_stats?.[0] || { games_played: 0, games_won: 0, games_lost: 0, win_rate: 0 }

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
                            <h1 className="text-4xl font-black text-white uppercase italic tracking-tight">{profile?.name || 'Nuevo Jugador'}</h1>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-center md:justify-start gap-2 text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                    <Mail className="h-3 w-3" />
                                    {profile?.email}
                                </div>
                                <div className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-amber-500">
                                    <Trophy className="h-4 w-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Código:</span>
                                    <span className="text-sm font-mono font-black tracking-[0.2em]">{profile?.invite_code}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-amber-500">
                                <Coins className="h-4 w-4" />
                                <span className="text-sm font-black tabular-nums">{profile?.credits} Fichas</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-2 text-blue-500">
                                <Trophy className="h-4 w-4" />
                                <span className="text-sm font-black uppercase tracking-widest">Nivel 1</span>
                            </div>
                        </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            <User className="h-4 w-4 text-blue-500" />
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
