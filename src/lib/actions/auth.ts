'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
export async function ensureInviteCode(userId: string) {
    const supabase = createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('invite_code')
        .eq('id', userId)
        .single()

    if (!profile?.invite_code) {
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        await supabase
            .from('profiles')
            .update({ invite_code: newCode })
            .eq('id', userId)

        revalidatePath('/play/selection')
        return newCode
    }

    return profile.invite_code
}
