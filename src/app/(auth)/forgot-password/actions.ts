'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function forgotPassword(formData: FormData) {
    const supabase = createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
        return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    return redirect(`/forgot-password?success=true`)
}

export async function resetPassword(formData: FormData) {
    const supabase = createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({
        password: password,
    })

    if (error) {
        return redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
    }

    return redirect(`/login?message=Contraseña actualizada correctamente`)
}
