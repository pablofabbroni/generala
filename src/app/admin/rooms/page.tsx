import { createClient } from "@/lib/supabase/server"
import { DoorOpen, Plus, Calendar, Users, Coins, Trophy, Trash2, Edit2, Play, CheckCircle2, XCircle } from "lucide-react"
import { revalidatePath } from "next/cache"

export default async function AdminRoomsPage() {
    const supabase = createClient()
    const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false })

    async function createRoom(formData: FormData) {
        'use server'
        const supabase = createClient()

        const data = {
            name: formData.get('name') as string,
            level: formData.get('level') as string,
            variant: formData.get('variant') as string,
            max_players: parseInt(formData.get('max_players') as string),
            entry_fee: parseInt(formData.get('entry_fee') as string),
            start_at: formData.get('start_at') ? new Date(formData.get('start_at') as string).toISOString() : null,
            is_active: true
        }

        const { error } = await supabase.from('rooms').insert(data)
        if (error) console.error(error)
        revalidatePath('/admin/rooms')
    }

    async function toggleRoomStatus(id: string, currentStatus: boolean) {
        'use server'
        const supabase = createClient()
        await supabase.from('rooms').update({ is_active: !currentStatus }).eq('id', id)
        revalidatePath('/admin/rooms')
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic">Gestión de <span className="text-amber-500">Salas</span></h1>
                    <p className="text-sm text-white/40 font-medium uppercase tracking-widest mt-1">Crea y administra las mesas de juego</p>
                </div>

                <button className="flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-amber-400 transition-all">
                    <Plus className="h-4 w-4" />
                    Nueva Sala
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario de Creación */}
                <div className="lg:col-span-1 rounded-3xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-xl h-fit">
                    <h2 className="text-lg font-black text-white uppercase italic mb-6">Configurar Sala</h2>
                    <form action={createRoom} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Nombre de la Sala</label>
                            <input name="name" required placeholder="Ej: Mesa VIP, Torneo Express" className="w-full rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-sm text-white focus:border-amber-500/50 outline-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Nivel</label>
                                <select name="level" className="w-full rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-sm text-white focus:border-amber-500/50 outline-none">
                                    <option value="casual">Casual</option>
                                    <option value="intermedia">Intermedia</option>
                                    <option value="alta">Alta</option>
                                    <option value="tournament">Torneo</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Variante</label>
                                <select name="variant" className="w-full rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-sm text-white focus:border-amber-500/50 outline-none">
                                    <option value="standard">Estándar</option>
                                    <option value="speed">Rápida</option>
                                    <option value="multi">Multi-Dados</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Jugadores Máx.</label>
                                <input name="max_players" type="number" defaultValue="4" className="w-full rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-sm text-white focus:border-amber-500/50 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Costo (Créditos)</label>
                                <input name="entry_fee" type="number" defaultValue="50" className="w-full rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-sm text-white focus:border-amber-500/50 outline-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Fecha de Comienzo (Opcional)</label>
                            <input name="start_at" type="datetime-local" className="w-full rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-sm text-white focus:border-amber-500/50 outline-none" />
                        </div>

                        <button type="submit" className="w-full rounded-xl bg-white py-4 text-xs font-black uppercase tracking-widest text-black hover:bg-amber-500 transition-all">
                            Crear Sala
                        </button>
                    </form>
                </div>

                {/* Listado de Salas */}
                <div className="lg:col-span-2 space-y-4">
                    {rooms?.map((room) => (
                        <div key={room.id} className="rounded-3xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-xl flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-2xl ${room.is_active ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <DoorOpen className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-white uppercase italic">{room.name}</h3>
                                        <span className="rounded-lg bg-zinc-800 px-2 py-1 text-[10px] font-black uppercase text-white/40">
                                            {room.variant}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/20">
                                            <Trophy className="h-3 w-3" />
                                            {room.level}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/20">
                                            <Users className="h-3 w-3" />
                                            {room.max_players} Jugadores
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500/60">
                                            <Coins className="h-3 w-3" />
                                            -{room.entry_fee}
                                        </div>
                                    </div>
                                    {room.start_at && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500/60 mt-2">
                                            <Calendar className="h-3 w-3" />
                                            Comienza: {new Date(room.start_at).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <form action={async () => {
                                    'use server'
                                    await toggleRoomStatus(room.id, room.is_active)
                                }}>
                                    <button className={`p-3 rounded-xl transition-all ${room.is_active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
                                        {room.is_active ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    </button>
                                </form>
                                <button className="p-3 rounded-xl bg-white/5 text-white/20 hover:text-white transition-all">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button className="p-3 rounded-xl bg-white/5 text-white/20 hover:text-red-500 transition-all">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {rooms?.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/10 text-white/10">
                            <DoorOpen className="h-12 w-12 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">No hay salas creadas</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
