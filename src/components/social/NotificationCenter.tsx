'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Play, UserPlus, Gamepad2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSound } from '@/hooks/useSound'

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([])
    const supabase = createClient()
    const router = useRouter()
    const { playSound } = useSound()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Load unread notifications
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('receiver_id', user.id)
                .eq('is_read', false)
                .order('created_at', { ascending: false })

            if (data) setNotifications(data)

            // Subscribe to new notifications
            const channel = supabase
                .channel(`notifs-${user.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `receiver_id=eq.${user.id}`
                }, (payload) => {
                    setNotifications(prev => [payload.new, ...prev])
                    playSound('chipClink')
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
        init()
    }, [supabase, playSound])

    const handleAccept = async (notif: any) => {
        // Mark as read
        await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id)
        setNotifications(prev => prev.filter(n => n.id !== notif.id))

        if (notif.type === 'room_invite') {
            router.push(`/play/game/${notif.payload.room_id}`)
        } else if (notif.type === 'friend_request') {
            router.push('/friends')
        }
    }

    const handleDismiss = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    if (notifications.length === 0) return null

    return (
        <div className="fixed top-24 right-4 z-[100] w-full max-w-sm pointer-events-none">
            <AnimatePresence>
                {notifications.map((notif, idx) => (
                    <motion.div
                        key={notif.id}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className="mb-3 pointer-events-auto"
                    >
                        <div className="rounded-[2rem] border border-amber-500/30 bg-black/90 backdrop-blur-xl p-5 shadow-2xl shadow-amber-500/10">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-black shrink-0">
                                    {notif.type === 'room_invite' ? <Gamepad2 className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">{notif.title}</p>
                                    <p className="text-xs text-white/60 font-medium leading-relaxed">{notif.message}</p>

                                    <div className="flex items-center gap-2 pt-3">
                                        <button
                                            onClick={() => handleAccept(notif)}
                                            className="flex-1 bg-white text-black text-[9px] font-black uppercase tracking-widest py-2 rounded-xl hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Play className="h-3 w-3" />
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={() => handleDismiss(notif.id)}
                                            className="p-2 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
