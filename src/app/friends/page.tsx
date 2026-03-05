import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { UserPlus, Users, Clock, Check, X, Search, User } from "lucide-react"

export default async function FriendsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Fetch friends (accepted)
    const { data: friendships } = await supabase
        .from('friends')
        .select('*, requester:profiles!friends_requester_id_fkey(*), addressee:profiles!friends_addressee_id_fkey(*)')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    const friends = friendships?.filter(f => f.status === 'accepted').map(f =>
        f.requester_id === user.id ? f.addressee : f.requester
    ) || []

    const pending = friendships?.filter(f => f.status === 'pending' && f.addressee_id === user.id).map(f => f.requester) || []

    return (
        <PageContainer className="py-12">
            <div className="mx-auto max-w-4xl space-y-12 px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tight">Círculo de <span className="text-amber-500">Amigos</span></h1>
                        <p className="text-sm text-white/40 font-bold uppercase tracking-widest mt-1">Conectate con otros jugadores</p>
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por usuario o email..."
                            className="w-full rounded-2xl border border-white/5 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-white/10"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main List */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/20">
                            <Users className="h-4 w-4" />
                            Lista de Amigos ({friends.length})
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {friends.map((friend: any) => (
                                <div key={friend.id} className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/30 p-4 transition-all hover:bg-zinc-900/50 hover:border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                                                {friend.image ? (
                                                    <img src={friend.image} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-white/20">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Presence Indicator */}
                                            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 ${friend.last_seen_at && (new Date().getTime() - new Date(friend.last_seen_at).getTime() < 2 * 60 * 1000)
                                                    ? 'bg-emerald-500' : 'bg-zinc-600'
                                                }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-black text-white uppercase italic">{friend.name || 'Sin nombre'}</p>
                                            <p className="text-[10px] text-white/20 uppercase tracking-widest">
                                                {friend.last_seen_at && (new Date().getTime() - new Date(friend.last_seen_at).getTime() < 2 * 60 * 1000)
                                                    ? 'En línea' : 'Desconectado'}
                                            </p>
                                        </div>
                                        <button className="p-2 rounded-xl bg-white/5 text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {friends.length === 0 && (
                                <div className="col-span-full py-12 text-center rounded-3xl border border-dashed border-white/5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/10">No tenés amigos agregados aún</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Requests */}
                    <div className="space-y-8">
                        <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/20">
                            <Clock className="h-4 w-4" />
                            Pendientes ({pending.length})
                        </h2>

                        <div className="space-y-4">
                            {pending.map((req: any) => (
                                <div key={req.id} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                                            {req.image && <img src={req.image} alt="" className="h-full w-full object-cover" />}
                                        </div>
                                        <p className="truncate text-[10px] font-black text-white uppercase tracking-widest">{req.name || req.email}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400">
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                        <button className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {pending.length === 0 && (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/10 text-center py-4">Sin solicitudes pendientes</p>
                            )}
                        </div>

                        <div className="rounded-3xl bg-zinc-900/10 border border-white/5 p-6 space-y-4">
                            <div className="flex items-center gap-2 text-amber-500">
                                <UserPlus className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Invitar Amigos</span>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider font-medium">Comparte tu email o búscalo directamente en el Club.</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}
