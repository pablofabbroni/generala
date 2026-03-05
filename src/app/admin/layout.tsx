import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, Coins, DoorOpen, Trophy, MessageSquare, Settings, LogOut, ChevronRight } from "lucide-react"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect("/dashboard")
    }

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'Usuarios', icon: Users, href: '/admin/users' },
        { label: 'Economía', icon: Coins, href: '/admin/economy' },
        { label: 'Salas', icon: DoorOpen, href: '/admin/rooms' },
        { label: 'Torneos', icon: Trophy, href: '/admin/tournaments' },
        { label: 'Feedback', icon: MessageSquare, href: '/admin/feedback' },
        { label: 'Configuración', icon: Settings, href: '/admin/settings' },
    ]

    return (
        <div className="flex min-h-screen bg-zinc-950">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/5 bg-zinc-900/50 backdrop-blur-xl lg:block">
                <div className="flex h-16 items-center px-8 border-b border-white/5">
                    <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                        Admin <span className="text-amber-500">Panel</span>
                    </span>
                </div>
                <nav className="space-y-1 p-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest text-white/40 transition-all hover:bg-white/5 hover:text-white"
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="h-4 w-4 transition-colors group-hover:text-amber-500" />
                                {item.label}
                            </div>
                            <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest text-white/20 hover:text-white transition-all">
                        <LogOut className="h-4 w-4" />
                        Salir al Juego
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-64">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
