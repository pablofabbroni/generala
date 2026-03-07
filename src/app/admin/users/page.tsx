import { createClient } from "@/lib/supabase/server"
import { Search, MoreVertical, Shield, Ban, CheckCircle2, History, Coins, Trash2 } from "lucide-react"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export default async function AdminUsersPage() {
    const supabase = createClient()
    const { data: users } = await supabase
        .from('profiles')
        .select('*, player_stats(*)')
        .order('created_at', { ascending: false })

    async function deleteUser(id: string) {
        'use server'
        const supabase = createClient()
        const { error } = await supabase.from('profiles').delete().eq('id', id)
        if (error) console.error(error)
        revalidatePath('/admin/users')
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Gestión de <span className="text-amber-500">Usuarios</span></h1>
                    <p className="text-sm text-white/40 font-medium uppercase tracking-widest mt-1">Lista completa de jugadores registrados</p>
                </div>

                <div className="relative group w-64">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar jugador..."
                        className="w-full rounded-2xl border border-white/5 bg-zinc-900/50 py-3 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-white/10"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Usuario</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Rol</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Saldo</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Partidas</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Estado</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-white/40">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users?.map((user) => (
                            <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                                            {user.image ? (
                                                <img src={user.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-white/10">
                                                    <History className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{user.name || 'Sin nombre'}</p>
                                            <p className="text-[10px] text-white/20 uppercase tracking-widest">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-white/40'
                                        }`}>
                                        {user.role === 'admin' && <Shield className="h-3 w-3" />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-sm font-black text-amber-500">
                                        <Coins className="h-3 w-3" />
                                        {user.credits}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-white/60">{user.player_stats?.[0]?.games_played || 0} Jugadas</p>
                                        {user.player_stats?.[0]?.win_rate > 0 && (
                                            <p className="text-[10px] text-emerald-500/60 font-medium">{user.player_stats[0].win_rate}% VR</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {user.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                                        {user.status === 'active' ? 'Activo' : 'Suspendido'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link href={`/admin/users/${user.id}`} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all">
                                            <History className="h-4 w-4" />
                                        </Link>
                                        <form action={async () => {
                                            'use server'
                                            if (confirm('¿Estás seguro de eliminar este usuario?')) {
                                                await deleteUser(user.id)
                                            }
                                        }}>
                                            <button className="p-2 rounded-lg bg-red-500/10 text-red-500/40 hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
