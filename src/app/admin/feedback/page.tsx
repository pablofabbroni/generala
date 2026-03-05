import { createClient } from "@/lib/supabase/server"
import { MessageSquare, Star, Clock, CheckCircle2, User, ExternalLink } from "lucide-react"

export default async function AdminFeedbackPage() {
    const supabase = createClient()
    const { data: feedbacks } = await supabase
        .from('feedback')
        .select('*, profiles(name, email, image)')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white uppercase italic">Gestión de <span className="text-amber-500">Feedback</span></h1>
                <p className="text-sm text-white/40 font-medium uppercase tracking-widest mt-1">Comentarios y reportes de los jugadores</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {feedbacks?.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:bg-zinc-900/80">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest ${item.category === 'bug' ? 'bg-red-500/10 text-red-500' :
                                                item.category === 'ux' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {item.category}
                                        </span>
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                            {new Date(item.created_at).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`h-3 w-3 ${s <= (item.rating || 0) ? 'text-amber-500 fill-current' : 'text-white/10'}`} />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-white font-medium italic">"{item.message}"</p>

                                {item.page && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                                        <ExternalLink className="h-3 w-3" />
                                        Página: {item.page}
                                    </div>
                                )}
                            </div>

                            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                                        {item.profiles?.image ? (
                                            <img src={item.profiles.image} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-white/20">
                                                <User className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="truncate text-xs font-bold text-white">{item.profiles?.name || 'Anónimo'}</p>
                                        <p className="truncate text-[10px] text-white/20">{item.profiles?.email || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-2">
                                    <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all">
                                        <Clock className="h-3 w-3" />
                                        En revisión
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/20 transition-all">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Resolver
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {feedbacks?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/10">
                        <MessageSquare className="h-12 w-12 text-white/10 mb-4" />
                        <p className="text-sm text-white/20 font-bold uppercase tracking-widest">No hay feedback para mostrar</p>
                    </div>
                )}
            </div>
        </div>
    )
}
