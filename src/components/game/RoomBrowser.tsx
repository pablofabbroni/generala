'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Users, Shield, Loader2, Plus, ArrowRight, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface Room {
    id: string
    name: string
    variant: string
    max_players: number
    players: number
    is_private: boolean
    invite_code: string
    password?: string
    rules?: Record<string, boolean>
    participant_count?: number
}

export default function RoomBrowser({ onOpenCreate }: { onOpenCreate: () => void }) {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [searchCode, setSearchCode] = useState('')
    const [joiningId, setJoiningId] = useState<string | null>(null)
    const [passwordInput, setPasswordInput] = useState<Record<string, string>>({})

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchRooms()

        // Subscribe to changes
        const channel = supabase
            .channel('room-browser')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
                fetchRooms()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchRooms = async () => {
        try {
            // Cleanup stale rooms older than 10 minutes
            try { await supabase.rpc('cleanup_stale_rooms') } catch (_) { /* ignore if function doesn't exist */ }

            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            setRooms(data || [])
        } catch (err) {
            console.error('Error fetching rooms:', err)
        } finally {
            setLoading(false)
        }
    }

    const joinRoom = async (room: Room) => {
        if (room.password && passwordInput[room.id] !== room.password) {
            alert('Contraseña incorrecta')
            return
        }

        setJoiningId(room.id)
        try {
            router.push(`/play/game/${room.id}`)
        } finally {
            setJoiningId(null)
        }
    }

    const handleSearch = async () => {
        if (!searchCode.trim()) {
            fetchRooms()
            return
        }

        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('invite_code', searchCode.toUpperCase())
                .eq('is_active', true)
                .single()

            if (data) {
                setRooms([data])
            } else {
                setRooms([])
            }
        } catch (err) {
            console.error('Error searching room:', err)
            setRooms([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 w-full max-w-6xl px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
                        Navegador de <span className="text-amber-500">Salas</span>
                    </h2>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                        Unite a una partida o buscá por código
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por código..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full rounded-2xl border border-white/10 bg-zinc-900/50 py-3 pl-12 pr-4 text-xs text-white focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-white/10 uppercase font-mono tracking-widest"
                        />
                    </div>
                    <Button
                        onClick={onOpenCreate}
                        className="rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[10px] tracking-widest h-[46px] px-6"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Mesa
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-950/40 backdrop-blur-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Nombre de Sala</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20 text-center">Estado</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Variantes Activas</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20 text-center">Jugadores</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 text-white/20">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Buscando Mesas...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : rooms.length > 0 ? (
                            rooms.map((room: any) => (
                                <tr key={room.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white uppercase italic truncate max-w-[200px]">
                                                {room.name}
                                            </span>
                                            <span className="text-[10px] font-mono text-amber-500/60 font-bold uppercase tracking-widest">
                                                ID: {room.invite_code}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            {room.is_private ? (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                                    <Shield className="h-3 w-3" />
                                                    Privada
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                    Pública
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(room.rules || {}).map(([key, value]) => {
                                                if (!value) return null;
                                                const labels: Record<string, string> = {
                                                    minorStraight: 'Escalera Menor',
                                                    doubleGenerala: 'Doble Generala',
                                                    upperBonus63: 'Bonus 63',
                                                    chance: 'Chance'
                                                };
                                                return (
                                                    <span key={key} className="px-2 py-0.5 rounded-lg bg-white/5 text-[8px] font-bold text-white/40 uppercase tracking-widest border border-white/5">
                                                        {labels[key] || key}
                                                    </span>
                                                );
                                            })}
                                            {(!room.rules || Object.values(room.rules).every(v => !v)) && (
                                                <span className="text-[9px] font-medium text-white/20 uppercase tracking-widest italic">Standard</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2 text-xs font-black text-white/60">
                                            <div className="flex -space-x-1">
                                                {Array.from({ length: room.max_players }).map((_, i) => (
                                                    <div key={i} className={`h-2.5 w-2.5 rounded-full border border-zinc-950 ${i < (room.participant_count || 0) ? 'bg-amber-500' : 'bg-white/10'}`} />
                                                ))}
                                            </div>
                                            <span className="tabular-nums">{(room.participant_count || 0)} / {room.max_players}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {room.password && (
                                                <input
                                                    type="password"
                                                    placeholder="PIN"
                                                    value={passwordInput[room.id] || ''}
                                                    onChange={(e) => setPasswordInput(prev => ({ ...prev, [room.id]: e.target.value }))}
                                                    className="w-20 rounded-xl border border-white/5 bg-zinc-950/50 py-1.5 px-3 text-[10px] text-white focus:border-amber-500/50 outline-none placeholder:text-white/10"
                                                />
                                            )}
                                            <Button
                                                onClick={() => joinRoom(room)}
                                                disabled={joiningId === room.id}
                                                className="rounded-xl h-9 px-4 flex items-center gap-2 bg-white text-black hover:bg-amber-500 uppercase font-black text-[9px] tracking-widest transition-all"
                                            >
                                                {joiningId === room.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                                                Unirse
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No se encontraron mesas activas</p>
                                    <button onClick={onOpenCreate} className="text-amber-500/50 hover:text-amber-500 text-[9px] font-black uppercase tracking-widest mt-2 underline">¡Sé el primero en crear una!</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
