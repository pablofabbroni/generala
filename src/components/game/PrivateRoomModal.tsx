'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Search, Copy, Check, Send, Loader2, Shield, Settings2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface Props {
    isOpen: boolean
    onClose: () => void
    userProfile: any
}

export default function PrivateRoomModal({ isOpen, onClose, userProfile }: Props) {
    const [copied, setCopied] = useState(false)

    // Room Configuration State
    const [maxPlayers, setMaxPlayers] = useState(2)
    const [roomName, setRoomName] = useState('')
    const [gameVariants, setGameVariants] = useState({
        minorStraight: false,
        doubleGenerala: false,
        upperBonus63: true,
        chance: true
    })
    const [password, setPassword] = useState('')
    const [creating, setCreating] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleCopyCode = () => {
        navigator.clipboard.writeText(userProfile?.invite_code || '')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const createPrivateRoom = async () => {
        setCreating(true)
        try {
            const { data, error } = await supabase
                .from('rooms')
                .insert({
                    name: roomName.trim() || `Sala de ${userProfile?.name}`,
                    level: 'casual',
                    variant: 'standard',
                    rules: gameVariants,
                    max_players: maxPlayers,
                    players_allowed: maxPlayers,
                    entry_fee: 0,
                    is_private: true,
                    invite_code: userProfile?.invite_code,
                    password: password || null,
                    is_active: true
                })
                .select()
                .single()

            if (error) throw error

            // Redirect to game with the new room ID
            router.push(`/play/game/${data.id}`)
            onClose()
        } catch (err: any) {
            console.error('Error creating private room:', err)
            alert('Error al crear la sala: ' + (err.message || 'Error desconocido'))
        } finally {
            setCreating(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-white uppercase italic">Configurar <span className="text-amber-500">Mesa Privada</span></h2>
                            <button onClick={onClose} className="rounded-full p-2 text-white/20 hover:bg-white/5 hover:text-white transition-all">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
                            {/* User's ID Section */}
                            <div className="rounded-2xl bg-zinc-950/50 p-6 border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Tu Código de Invitación</p>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-2xl font-black tracking-widest text-white font-mono">{userProfile?.invite_code || '------'}</span>
                                    <button
                                        onClick={handleCopyCode}
                                        className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                                    >
                                        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                        {copied ? 'Copiado' : 'Copiar'}
                                    </button>
                                </div>
                            </div>

                            {/* Room Setup - Moved Name Here */}
                            <div className="space-y-4 rounded-2xl bg-zinc-950/20 p-6 border border-white/5">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Nombre de la Sala (Opcional)</label>
                                    <input
                                        type="text"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        placeholder={`Sala de ${userProfile?.name}`}
                                        className="w-full rounded-xl border border-white/5 bg-zinc-950/50 py-2.5 px-4 text-xs text-white focus:border-amber-500/50 outline-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2 mb-2 text-amber-500 pt-2">
                                    <Settings2 className="h-4 w-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Configuración de Juego</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Cantidad de Jugadores</label>
                                        <div className="flex gap-2">
                                            {[2, 3, 4].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => setMaxPlayers(num)}
                                                    className={`flex-1 py-3 rounded-2xl border text-xs font-black transition-all ${maxPlayers === num
                                                        ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20'
                                                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                                        }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Variantes de Reglas</label>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'minorStraight', label: 'Escalera menor', desc: 'Suma 15 pts por 4 dados seguidos' },
                                            { id: 'doubleGenerala', label: 'Generala doble', desc: 'Habilita segunda fila de 100 pts' },
                                            { id: 'upperBonus63', label: 'Bonus 63', desc: '+35 pts si el bloque superior es > 63' },
                                            { id: 'chance', label: 'Chance', desc: 'Comodín que suma todos los dados' },
                                        ].map(v => (
                                            <div
                                                key={v.id}
                                                onClick={() => setGameVariants(prev => ({ ...prev, [v.id]: !prev[v.id as keyof typeof gameVariants] }))}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${gameVariants[v.id as keyof typeof gameVariants]
                                                    ? 'bg-amber-500/10 border-amber-500/30'
                                                    : 'bg-zinc-950/20 border-white/5 opacity-50'
                                                    }`}
                                            >
                                                <div className="min-w-0 pr-4">
                                                    <p className={`text-[10px] font-black uppercase tracking-tight ${gameVariants[v.id as keyof typeof gameVariants] ? 'text-amber-500' : 'text-white/40'}`}>
                                                        {v.label}
                                                    </p>
                                                    <p className="text-[8px] font-medium text-white/20 truncate">{v.desc}</p>
                                                </div>
                                                <div className={`h-5 w-9 rounded-full relative transition-colors ${gameVariants[v.id as keyof typeof gameVariants] ? 'bg-amber-500' : 'bg-white/10'
                                                    }`}>
                                                    <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all ${gameVariants[v.id as keyof typeof gameVariants] ? 'right-1' : 'left-1'
                                                        }`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Contraseña (Opcional)</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20" />
                                        <input
                                            type="text"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Sin contraseña"
                                            className="w-full rounded-xl border border-white/5 bg-zinc-950/50 py-2.5 pl-10 pr-4 text-xs text-white focus:border-amber-500/50 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>


                            <button
                                onClick={createPrivateRoom}
                                disabled={creating}
                                className="w-full rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-widest text-black hover:bg-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                                {creating ? 'Creando Mesa...' : 'Crear y Entrar a la Sala'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
