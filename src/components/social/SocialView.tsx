'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, Search, User, Check, X, Loader2, Clock, Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Player {
    id: string
    name: string
    email: string
    image: string
    alias: string
    invite_code: string
}

interface Friendship {
    id: string
    requester_id: string
    addressee_id: string
    status: 'pending' | 'accepted' | 'rejected'
}

export default function SocialView({ initialFriends, initialPending, currentUserId }: any) {
    const [search, setSearch] = useState('')
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<Player[]>([])
    const [friends, setFriends] = useState<any[]>(initialFriends || [])
    const [pending, setPending] = useState<any[]>(initialPending || [])
    const [processingId, setProcessingId] = useState<string | null>(null)

    const supabase = createClient()

    const handleSearch = async () => {
        const query = search.trim()
        if (!query) return

        setSearching(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`name.ilike.%${query}%,invite_code.ilike.%${query}%,email.ilike.%${query}%`)
                .neq('id', currentUserId)
                .limit(10)

            if (error) throw error
            setSearchResults(data || [])
        } catch (err: any) {
            console.error('Error searching players:', err)
            alert('Error al buscar jugadores: ' + (err.message || 'Error desconocido'))
        } finally {
            setSearching(false)
        }
    }

    const sendFriendRequest = async (targetUserId: string) => {
        setProcessingId(targetUserId)
        try {
            const { error } = await supabase
                .from('friends')
                .insert({
                    requester_id: currentUserId,
                    addressee_id: targetUserId,
                    status: 'pending'
                })

            if (error) throw error

            // Re-fetch search to update button status if needed, 
            // or just show a success message
            setSearchResults(prev => prev.filter(p => p.id !== targetUserId))
        } catch (err) {
            console.error('Error sending friend request:', err)
        } finally {
            setProcessingId(null)
        }
    }

    const respondToRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
        setProcessingId(requestId)
        try {
            const { error } = await supabase
                .from('friends')
                .update({ status })
                .eq('id', requestId)

            if (error) throw error

            if (status === 'accepted') {
                // Add to friends list and remove from pending
                const acceptedReq = pending.find(p => p.friendship_id === requestId)
                if (acceptedReq) {
                    setFriends(prev => [...prev, acceptedReq])
                }
            }
            setPending(prev => prev.filter(p => p.friendship_id !== requestId))
        } catch (err) {
            console.error('Error responding to request:', err)
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tight">Círculo de <span className="text-amber-500">Amigos</span></h1>
                    <p className="text-sm text-white/40 font-bold uppercase tracking-widest mt-1">Conectate con otros jugadores</p>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Buscar por Alias, Código o Nombre..."
                        className="w-full rounded-2xl border border-white/5 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-white/10"
                    />
                    {searching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                        </div>
                    )}
                </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-500">
                        <Search className="h-4 w-4" />
                        Resultados de búsqueda
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.map((player) => (
                            <div key={player.id} className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-amber-500/50">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-zinc-800 shadow-lg">
                                        {player.image ? (
                                            <img src={player.image} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-white/5">
                                                <User className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-white uppercase italic tracking-tight">{player.name}</p>
                                        <p className="text-[10px] font-mono text-amber-500 font-bold tracking-widest uppercase truncate max-w-[120px]">
                                            {player.invite_code}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => sendFriendRequest(player.id)}
                                    disabled={processingId === player.id}
                                    className="rounded-xl bg-amber-500 p-2 text-black hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50"
                                >
                                    {processingId === player.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-8">
                    <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/20">
                        <Users className="h-4 w-4" />
                        Lista de Amigos ({friends.length})
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {friends.map((friend: any) => (
                            <div key={friend.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/50 p-5 transition-all hover:bg-zinc-950 hover:border-white/20">
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
                                        {/* Simplified Online Indicator */}
                                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-black text-white uppercase italic">{friend.name || friend.alias || 'Sin nombre'}</p>
                                        <p className="text-[10px] text-white/20 uppercase tracking-widest">En línea</p>
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
                            <div key={req.friendship_id} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                                        {req.image && <img src={req.image} alt="" className="h-full w-full object-cover" />}
                                    </div>
                                    <p className="truncate text-[10px] font-black text-white uppercase tracking-widest">{req.name || req.alias || req.email}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => respondToRequest(req.friendship_id, 'accepted')}
                                        disabled={processingId === req.friendship_id}
                                        className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50"
                                    >
                                        {processingId === req.friendship_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    </button>
                                    <button
                                        onClick={() => respondToRequest(req.friendship_id, 'rejected')}
                                        disabled={processingId === req.friendship_id}
                                        className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-50"
                                    >
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
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider font-medium">Busca a tus amigos por su nombre o alias arriba.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
