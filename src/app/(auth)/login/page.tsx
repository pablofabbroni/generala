'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LoginPageContent } from './LoginPageContent'

export default function LoginPage() {
    return <LoginPageContent />
}
