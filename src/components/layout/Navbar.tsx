import Link from 'next/link'
import { Trophy, User, LogOut, Coins, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'

export async function Navbar() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                            Generala <span className="text-amber-500 transition-colors group-hover:text-amber-400">Club</span>
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-6">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-amber-500/20 bg-amber-500/10 px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg shadow-amber-500/5">
                            <Coins className="h-3.5 w-3.5 sm:h-4 w-4 text-amber-500" />
                            <span className="text-[10px] sm:text-sm font-black text-amber-500 tabular-nums">{profile?.credits || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg shadow-emerald-500/5">
                            <span className="text-[10px] sm:text-sm">💵</span>
                            <span className="text-[10px] sm:text-sm font-black text-emerald-500 tabular-nums">{profile?.usd_balance || '0.00'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                            href="/friends"
                            title="Círculo de Amigos"
                            className="flex flex-col items-center group relative"
                        >
                            <div className="p-2 rounded-full hover:bg-white/5 transition-all text-white/40 group-hover:text-amber-500">
                                <Trophy className="h-5 w-5" />
                            </div>
                        </Link>

                        <Link
                            href="/community"
                            title="Comunidad y Chat"
                            className="flex flex-col items-center group relative"
                        >
                            <div className="p-2 rounded-full hover:bg-white/5 transition-all text-white/40 group-hover:text-amber-500">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                        </Link>

                        <Link href="/profile" className="flex items-center gap-2 group">
                            <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-zinc-800 transition-all group-hover:border-amber-500/50">
                                {profile?.image ? (
                                    <img src={profile.image} alt={profile.name || 'User'} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-white/20">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        </Link>

                        <form action={signOut}>
                            <button type="submit" className="p-2 rounded-full hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
    )
}
