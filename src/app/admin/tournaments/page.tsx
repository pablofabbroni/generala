'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Plus, Calendar, Users, DollarSign, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminTournaments() {
    const [tournaments, setTournaments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchTournaments()
    }, [])

    const fetchTournaments = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('tournaments')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error) setTournaments(data || [])
        setLoading(false)
    }

    const handleCreateTournament = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const newTournament = {
            name: formData.get('name'),
            start_at: new Date(formData.get('start_at') as string).toISOString(),
            end_at: new Date(formData.get('end_at') as string).toISOString(),
            entry_fee: parseInt(formData.get('entry_fee') as string),
            prize_pool_amount: parseInt(formData.get('prize_pool_amount') as string),
            prize_pool_type: 'fixed',
            status: 'scheduled'
        }

        const { error } = await supabase
            .from('tournaments')
            .insert([newTournament])

        if (!error) {
            setShowCreateModal(false)
            fetchTournaments()
        }
    }

    const deleteTournament = async (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar este torneo?')) return
        const { error } = await supabase
            .from('tournaments')
            .delete()
            .eq('id', id)

        if (!error) fetchTournaments()
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        Gestión de <span className="text-amber-500 text-glow-amber">Torneos</span>
                    </h1>
                    <p className="text-sm text-white/40 font-medium uppercase tracking-widest mt-1">Crea y administra los eventos del club</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Torneo
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((t) => (
                        <div key={t.id} className="rounded-[2rem] border border-white/5 bg-zinc-900/50 p-6 space-y-4 hover:border-amber-500/20 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                                    <Trophy className="h-6 w-6" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => deleteTournament(t.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500/40 hover:text-red-500 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-white uppercase">{t.name}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold mt-1">
                                    <span className={`px-2 py-0.5 rounded-full ${t.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                                            t.status === 'running' ? 'bg-emerald-500/20 text-emerald-400' :
                                                'bg-zinc-500/20 text-zinc-400'
                                        }`}>
                                        {t.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-white/5 pt-4">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Calendar className="h-3 w-3" />
                                        <span>Inicia</span>
                                    </div>
                                    <span className="text-white/80">{format(new Date(t.start_at), 'd MMM, HH:mm', { locale: es })}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <DollarSign className="h-3 w-3" />
                                        <span>Entrada</span>
                                    </div>
                                    <span className="text-amber-500">{t.entry_fee} Créditos</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Trophy className="h-3 w-3 text-amber-500" />
                                        <span>Premio</span>
                                    </div>
                                    <span className="text-emerald-500">{t.prize_pool_amount} Créditos</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                        <h2 className="text-2xl font-black text-white uppercase italic">Configurar <span className="text-amber-500">Torneo</span></h2>

                        <form onSubmit={handleCreateTournament} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Nombre del Torneo</label>
                                <input name="name" required className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none" placeholder="Ej: GRAN FINAL DOMINGO" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Inicia</label>
                                    <input name="start_at" type="datetime-local" required className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white focus:border-amber-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Termina</label>
                                    <input name="end_at" type="datetime-local" required className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white focus:border-amber-500 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Costo Entrada</label>
                                    <input name="entry_fee" type="number" required defaultValue="50" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Premio Total</label>
                                    <input name="prize_pool_amount" type="number" required defaultValue="1000" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest">Cancelar</Button>
                                <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black uppercase tracking-widest">Crear Ahora</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
