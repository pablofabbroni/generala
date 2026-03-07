'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageContainer } from '@/components/layout/PageContainer'
import { Send, Users, MessageSquare, Star, Smile, Search, Loader2, User, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface Props {
    profile: any
}

export function CommunityClient({ profile }: Props) {
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [onlineUsers, setOnlineUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const fetchInitialMessages = async () => {
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*, profiles(alias, name, image)')
                    .eq('type', 'global')
                    .order('created_at', { ascending: false })
                    .limit(50)

                if (error) throw error
                if (data) setMessages(data.reverse())
            } catch (err) {
                console.error('Error fetching messages:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchInitialMessages()

        // Realtime Subscription
        const channel = supabase
            .channel('global-chat')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: 'type=eq.global'
            }, async (payload) => {
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('alias, name, image')
                    .eq('id', payload.new.user_id)
                    .single()

                const messageWithProfile = { ...payload.new, profiles: userData }
                setMessages(prev => [...prev, messageWithProfile])
            })
            .subscribe()

        // Presence Logic
        const presenceChannel = supabase.channel('online-players')
        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState()
                const players = Object.values(state).flat()
                setOnlineUsers(players)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presenceChannel.track({
                        id: profile.id,
                        alias: profile.alias,
                        image: profile.image,
                        online_at: new Date().toISOString(),
                    })
                }
            })

        return () => {
            supabase.removeChannel(channel)
            supabase.removeChannel(presenceChannel)
        }
    }, [supabase, profile])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        const content = newMessage.trim()
        if (!content || sending) return

        setSending(true)
        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    user_id: profile.id,
                    content: content,
                    type: 'global'
                })

            if (error) {
                console.error('Supabase error:', error)
                throw error
            }

            setNewMessage('')
            setShowEmojiPicker(false)
        } catch (err: any) {
            console.error('Full send error:', err)
            alert('No se pudo enviar el mensaje: ' + (err.message || 'Error desconocido'))
        } finally {
            setSending(false)
        }
    }

    const onEmojiSelect = (emoji: any) => {
        setNewMessage(prev => prev + emoji.native)
    }

    return (
        <PageContainer className="py-8 h-[calc(100vh-100px)]">
            <div className="flex flex-col lg:flex-row h-full gap-6 px-4 relative">
                {/* Chat Section */}
                <div className="flex-1 flex flex-col bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm relative z-10 shadow-2xl">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white uppercase italic">Comunidad <span className="text-amber-500">Club</span></h1>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Chat Global y Jugadores Activos</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all group"
                        >
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{onlineUsers.length} En Línea</span>
                            <Users className={`h-4 w-4 text-emerald-500/40 group-hover:text-emerald-500 transition-all ${isSidebarOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-4">
                                <MessageSquare className="h-16 w-16" />
                                <p className="font-black uppercase tracking-widest text-center px-4">Comienza la conversación con el club</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={i}
                                    className={`flex items-start gap-4 ${msg.user_id === profile.id ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-white/5 flex-shrink-0 overflow-hidden shadow-lg">
                                        {msg.profiles?.image ? (
                                            <img src={msg.profiles.image} className="h-full w-full object-cover" alt="" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-white/10 font-black">
                                                {msg.profiles?.alias?.[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`flex flex-col gap-1 max-w-[75%] ${msg.user_id === profile.id ? 'items-end' : ''}`}>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">
                                            @{msg.profiles?.alias || 'Jugador'}
                                        </span>
                                        <div className={`px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-xl ${msg.user_id === profile.id
                                            ? 'bg-amber-500 text-black rounded-tr-none'
                                            : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-6 bg-white/5 border-t border-white/5 relative">
                        <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                    className="absolute bottom-full right-6 mb-4 z-[60]"
                                >
                                    <div className="shadow-2xl rounded-[2rem] overflow-hidden border border-white/10">
                                        <Picker
                                            data={data}
                                            onEmojiSelect={onEmojiSelect}
                                            theme="dark"
                                            skinTonePosition="none"
                                            previewPosition="none"
                                            navPosition="bottom"
                                            perLine={8}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSendMessage} className="flex gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje al club..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${showEmojiPicker ? 'text-amber-500' : 'text-white/20 hover:text-white/40'}`}
                                >
                                    <Smile className="h-5 w-5" />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="bg-white text-black px-6 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-500 transition-all disabled:opacity-50 shadow-xl shadow-white/5"
                            >
                                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar - Collapsible */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: 320 }}
                            exit={{ opacity: 0, x: 20, width: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="flex flex-col bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden h-full shadow-2xl backdrop-blur-md relative z-0"
                        >
                            <div className="p-6 border-b border-white/5 bg-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-white">
                                        <Users className="h-5 w-5 text-amber-500" />
                                        <span className="font-black uppercase tracking-widest text-xs">Conectados ahora</span>
                                    </div>
                                    <button
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="p-1 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-all"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                                {onlineUsers.map((user: any, i) => (
                                    <Link
                                        key={i}
                                        href={`/profile/${user.id}`}
                                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                                    >
                                        <div className="relative">
                                            <div className="h-10 w-10 rounded-xl bg-zinc-800 overflow-hidden border border-white/5 transition-all group-hover:border-amber-500/50">
                                                {user.image ? <img src={user.image} className="h-full w-full object-cover" /> : <User className="h-5 w-5 m-auto text-white/10 mt-2.5" />}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-lg" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-white truncate uppercase tracking-tight group-hover:text-amber-500 transition-colors">@{user.alias}</p>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Jugando</p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <Star className="h-3 w-3 text-amber-500 fill-current" />
                                        </div>
                                    </Link>
                                ))}
                                {onlineUsers.length === 0 && (
                                    <p className="text-center py-10 text-[10px] font-black uppercase tracking-widest text-white/10">Sólo tú estás aquí</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageContainer>
    )
}
