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
        <div className="space-y-8 w-full max-w-5xl px-4">
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
                            className="w-full rounded-2xl border border-white/5 bg-zinc-900/50 py-3 pl-12 pr-4 text-xs text-white focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-white/10 uppercase font-mono tracking-widest"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center gap-4 text-white/20">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Buscando Mesas Disponibles...</p>
                    </div>
                ) : rooms.length > 0 ? (
                    rooms.map((room) => (
                        <div
                            key={room.id}
                            className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-500 bg-zinc-900/30 p-6 hover:translate-y-[-4px] ${room.is_private ? 'border-amber-500/20 hover:border-amber-500/40' : 'border-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-white uppercase italic truncate pr-4">
                                        {room.name}
                                    </h3>
                                    {room.is_private && (
                                        <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-widest">
                                            Privada
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Variante</p>
                                        <p className="text-xs font-black text-white/60 uppercase">{room.variant}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Jugadores</p>
                                        <div className="flex items-center gap-1.5 text-xs font-black text-white/60">
                                            <Users className="h-3 w-3" />
                                            <span>0 / {room.max_players}</span>
                                        </div>
                                    </div>
                                </div>

                                {room.password && (
                                    <div className="relative mt-2">
                                        <Shield className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/20" />
                                        <input
                                            type="password"
                                            placeholder="Contraseña requerida"
                                            value={passwordInput[room.id] || ''}
                                            onChange={(e) => setPasswordInput(prev => ({ ...prev, [room.id]: e.target.value }))}
                                            className="w-full rounded-xl border border-white/5 bg-zinc-950/50 py-2 pl-9 pr-4 text-[10px] text-white focus:border-amber-500/50 outline-none"
                                        />
                                    </div>
                                )}

                                <Button
                                    onClick={() => joinRoom(room)}
                                    disabled={joiningId === room.id}
                                    className={`w-full rounded-2xl p-4 flex items-center justify-center gap-2 transition-all ${room.is_private && !passwordInput[room.id] && room.password
                                            ? 'bg-white/5 text-white/20 opacity-50 cursor-not-allowed'
                                            : 'bg-white text-black hover:bg-amber-500 uppercase font-black text-[10px] tracking-widest'
                                        }`}
                                >
                                    {joiningId === room.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                                    Entrar a Jugar
                                </Button>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                                <Trophy className="h-24 w-24" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center rounded-[2.5rem] border border-dashed border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No se encontraron mesas activas</p>
                        <p className="text-[8px] text-white/10 uppercase mt-2">¡Sé el primero en crear una!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
