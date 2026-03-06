'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageContainer } from '@/components/layout/PageContainer'
import { Users, Loader2, ArrowLeft, Trophy, Shield, UserPlus, Play, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from '@/hooks/useSound'

interface Participant {
    user_id: string
    joined_at: string
    is_ready: boolean
    profiles: {
        name: string
        alias: string
        image: string
        invite_code: string
    }
}

export default function GameRoomPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const { playSound } = useSound()

    const [room, setRoom] = useState<any>(null)
    const [participants, setParticipants] = useState<Participant[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [gameStarted, setGameStarted] = useState(false)
    const [friends, setFriends] = useState<any[]>([])

    const fetchRoomData = useCallback(async () => {
        const { data: roomData, error: roomError } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', id)
            .single()

        if (roomError) {
            console.error('Room error:', roomError)
            router.push('/play/selection')
            return
        }
        setRoom(roomData)

        const { data: participantsData } = await supabase
            .from('room_participants')
            .select('*, profiles(*)')
            .eq('room_id', id)

        setParticipants(participantsData || [])
    }, [id, supabase, router])

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            if (user) {
                // Auto-join room participant
                await supabase.from('room_participants').upsert({
                    room_id: id,
                    user_id: user.id
                })

                // Get connected friends
                const { data: friendships } = await supabase
                    .from('friends')
                    .select('*, requester:profiles!friends_requester_id_fkey(*), addressee:profiles!friends_addressee_id_fkey(*)')
                    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
                    .eq('status', 'accepted')

                const friendsList = friendships?.map(f => f.requester_id === user.id ? f.addressee : f.requester) || []
                setFriends(friendsList)
            }

            await fetchRoomData()
            setLoading(false)
        }
        init()

        // Subscribe to participant changes
        const participantChannel = supabase
            .channel(`room-${id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'room_participants',
                filter: `room_id=eq.${id}`
            }, () => {
                fetchRoomData()
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
                filter: `id=eq.${id}`
            }, (payload) => {
                if (payload.new.is_active === false) {
                    // Logic for game start if triggered by DB
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(participantChannel)
        }
    }, [id, supabase, fetchRoomData])

    // Countdown logic
    useEffect(() => {
        if (room && participants.length === room.max_players && !gameStarted) {
            if (countdown === null) {
                setCountdown(10)
                playSound('chipClink') // Placeholder sound
            }
        } else {
            setCountdown(null)
        }
    }, [participants.length, room, gameStarted, countdown, playSound])

    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            if (countdown <= 3) playSound('diceRoll')
            return () => clearTimeout(timer)
        } else if (countdown === 0) {
            handleStartGame()
        }
    }, [countdown, playSound])

    const handleStartGame = async () => {
        setGameStarted(true)
        playSound('win') // Celebration of game starting

        // Host updates room to active game
        if (participants[0]?.user_id === currentUser?.id) {
            await supabase.from('rooms').update({
                is_active: false // We use is_active=false to mean "in progress/taken" if needed, 
                // or we could add a 'status' field. Let's assume the game view handles it.
            }).eq('id', id)
        }

        // Redirect to actual game view (passing room context)
        // For now, let's show a big STARTING screen
    }

    const sendInvite = async (friendId: string) => {
        await supabase.from('notifications').insert({
            receiver_id: friendId,
            sender_id: currentUser.id,
            type: 'room_invite',
            title: 'Invitación a partida',
            message: `${currentUser.email} te invita a jugar Generala.`,
            payload: { room_id: id, password: room.password }
        })
        alert('Invitación enviada!')
    }

    if (loading) return (
        <PageContainer className="flex items-center justify-center min-h-[80vh]">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        </PageContainer>
    )

    if (gameStarted) {
        return (
            <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950 overflow-hidden">
                <motion.div
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-amber-500/20 blur-[120px] rounded-full animate-pulse" />
                    <h1 className="relative text-7xl md:text-9xl font-black italic uppercase tracking-tighter text-white">
                        ¡A <span className="text-amber-500">JUGAR</span>!
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex items-center gap-4 text-white/40 font-black uppercase tracking-[0.4em] text-xs"
                >
                    <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                    Entrando a la mesa casino...
                </motion.div>
            </div>
        )
    }

    return (
        <PageContainer className="py-12 relative overflow-hidden">
            {/* Animated Background elements for the lobby */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none opacity-20">
                <div className="h-[800px] w-[800px] bg-amber-500/10 blur-[150px] rounded-full" />
            </div>

            {/* Countdown Overlay when active */}
            <AnimatePresence>
                {countdown !== null && countdown > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md pointer-events-none"
                    >
                        <motion.div
                            key={countdown}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            exit={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-[200px] font-black italic text-amber-500 drop-shadow-[0_0_50px_rgba(245,158,11,0.5)]"
                        >
                            {countdown}
                        </motion.div>
                        <p className="text-xl font-black uppercase tracking-[0.5em] text-white/80 -mt-10">La partida comienza</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="mx-auto max-w-6xl px-4 space-y-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Button variant="ghost" onClick={() => router.push('/play/selection')} className="text-white/40 hover:text-white mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Abandonar Lobby
                        </Button>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tight leading-none">
                            Sala de <span className="text-amber-500">Espera</span>
                        </h1>
                        <p className="text-sm text-white/40 font-bold uppercase tracking-widest ont-mono">
                            ID: <span className="text-amber-500/80">{room.invite_code}</span>
                        </p>
                    </div>

                    {countdown !== null && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-amber-500 text-black px-8 py-4 rounded-[2rem] flex flex-col items-center shadow-2xl shadow-amber-500/20"
                        >
                            <span className="text-4xl font-black italic leading-none">{countdown}s</span>
                            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Para comenzar</span>
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Players in Lobby */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/20">
                                <Users className="h-4 w-4" />
                                Jugadores en la mesa ({participants.length} / {room.max_players})
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {participants.map((p, idx) => (
                                <motion.div
                                    key={p.user_id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center gap-4 p-5 rounded-[2rem] border border-white/5 bg-zinc-900/30 backdrop-blur-xl"
                                >
                                    <div className="h-14 w-14 rounded-full border-2 border-amber-500/20 p-1 flex-shrink-0">
                                        <div className="h-full w-full rounded-full bg-zinc-800 overflow-hidden">
                                            {p.profiles?.image ? <img src={p.profiles.image} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-white/20 font-black italic text-xl">?</div>}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-black text-white uppercase italic truncate leading-none">
                                            {p.profiles?.name || p.profiles?.alias || 'Invitado'}
                                        </p>
                                        <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                            {idx === 0 ? <Shield className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                            {idx === 0 ? 'Anfitrión' : 'Listo'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Empty slots */}
                            {Array.from({ length: room.max_players - participants.length }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-5 rounded-[2rem] border border-dashed border-white/5 bg-white/[0.02] opacity-50">
                                    <div className="h-14 w-14 rounded-full border-2 border-white/5 border-dashed flex items-center justify-center text-white/10">
                                        <UserPlus className="h-6 w-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10">Esperando...</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Invites */}
                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/20">
                            <UserPlus className="h-4 w-4" />
                            Invitar Amigos Online
                        </h2>

                        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                            {friends.length > 0 ? (
                                <div className="space-y-3">
                                    {friends.map(friend => (
                                        <div key={friend.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                                                    {friend.image && <img src={friend.image} className="h-full w-full object-cover" />}
                                                </div>
                                                <p className="text-[10px] font-black text-white uppercase italic truncate w-24">
                                                    {friend.name || friend.alias}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => sendInvite(friend.id)}
                                                className="h-8 rounded-xl px-4 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                Invitar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-center py-6 text-white/20 font-bold uppercase tracking-widest leading-relaxed">
                                    No hay amigos conectados ahora.<br />Compartí tu código para que entren.
                                </p>
                            )}

                            <div className="pt-4 border-t border-white/5 text-center">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Tu código para compartir</p>
                                <div className="text-2xl font-black text-white font-mono tracking-[0.3em] mb-4">
                                    {room.invite_code}
                                </div>
                                <Button className="w-full rounded-2xl h-12 uppercase font-black text-[10px]">
                                    <Play className="mr-2 h-4 w-4" />
                                    Iniciar Ahora (CPU)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}
