'use server'

import { createClient } from '@/lib/supabase/server'

export async function getProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) throw error
    return data
}

export async function claimDailyBonus() {
    const supabase = createClient()
    const profile = await getProfile()

    if (!profile) throw new Error('Usuario no logueado')

    const now = new Date()
    const lastBonus = profile.last_daily_bonus_at ? new Date(profile.last_daily_bonus_at) : null

    // Check 24h cooldown
    if (lastBonus && (now.getTime() - lastBonus.getTime()) < 24 * 60 * 60 * 1000) {
        const nextAvailable = new Date(lastBonus.getTime() + 24 * 60 * 60 * 1000)
        throw new Error(`Siguiente bonus disponible en ${nextAvailable.toLocaleString()}`)
    }

    const bonusAmount = 100

    // Atomic update in Supabase would be better with an RPC, 
    // but for simplicity we'll do sequential updates or just use the ledger logic.
    // Ideally: Start Transaction
    const { data, error } = await supabase.from('profiles').update({
        credits: (profile.credits || 0) + bonusAmount,
        last_daily_bonus_at: now.toISOString()
    }).eq('id', profile.id)

    if (error) throw error

    // Register transaction
    await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'daily_bonus',
        amount: bonusAmount,
        meta: { date: now.toISOString() }
    })

    return { success: true, amount: bonusAmount }
}

export async function claimAdReward() {
    const supabase = createClient()
    const profile = await getProfile()

    if (!profile) throw new Error('Usuario no logueado')

    // Removal of balance check as per user request
    /*
    if (profile.credits >= 20) {
        throw new Error('Solo podés pedir rescate con publicidad si tenés menos de 20 fichas.')
    }
    */

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const lastAd = profile.last_ad_reward_at ? new Date(profile.last_ad_reward_at) : null

    // Check 30min cooldown (changed from 2h)
    if (lastAd && (now.getTime() - lastAd.getTime()) < 30 * 60 * 1000) {
        throw new Error('Debés esperar 30 minutos entre cada rescate.')
    }

    // Check daily limit (5)
    const currentCount = profile.ad_reward_count_date === today ? profile.ad_reward_count_today : 0
    if (currentCount >= 5) {
        throw new Error('Límite diario de rescates alcanzado (5 por día).')
    }

    const rewardAmount = 50

    const { error } = await supabase.from('profiles').update({
        credits: (profile.credits || 0) + rewardAmount,
        last_ad_reward_at: now.toISOString(),
        ad_reward_count_today: currentCount + 1,
        ad_reward_count_date: today
    }).eq('id', profile.id)

    if (error) throw error

    await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'ad_reward',
        amount: rewardAmount,
        meta: { date: now.toISOString() }
    })

    return { success: true, amount: rewardAmount }
}

export async function enterRoom(roomId: string) {
    const supabase = createClient()
    const profile = await getProfile()
    if (!profile) throw new Error('No logueado')

    const { data: room, error: roomErr } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

    if (roomErr || !room) throw new Error('Sala no encontrada')

    if (profile.credits < room.entry_fee) {
        throw new Error('Fichas insuficientes para entrar')
    }

    // Deduct credits
    const { error: updateErr } = await supabase.from('profiles').update({
        credits: profile.credits - room.entry_fee
    }).eq('id', profile.id)

    if (updateErr) throw updateErr

    // Record entry
    await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'game_entry',
        amount: -room.entry_fee,
        meta: { room_id: roomId, room_name: room.name }
    })

    return { success: true }
}
