'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePresence(userId: string | undefined) {
    const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({})
    const supabase = createClient()

    useEffect(() => {
        if (!userId) return

        const channel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: userId,
                },
            },
        })

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState()
                setOnlineUsers(state)
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                console.log('Joined:', newPresences)
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                console.log('Left:', leftPresences)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        online_at: new Date().toISOString(),
                    })
                }
            })

        return () => {
            channel.unsubscribe()
        }
    }, [userId, supabase])

    return { onlineUsers, onlineCount: Object.keys(onlineUsers).length }
}
