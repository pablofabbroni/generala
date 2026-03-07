import { Settings, Shield, Bell, Database, Save } from "lucide-react"

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                    Configuración del <span className="text-amber-500">Club</span>
                </h1>
                <p className="text-sm text-white/40 font-medium uppercase tracking-widest mt-1">Variables globales y mantenimiento del sistema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="rounded-[2rem] border border-white/5 bg-zinc-900/50 p-8 space-y-6">
                    <div className="flex items-center gap-3 text-amber-500">
                        <Settings className="h-5 w-5" />
                        <h2 className="text-lg font-black uppercase italic">General</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Nombre del Sitio</label>
                            <input defaultValue="Generala Club" className="w-full rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-sm text-white focus:border-amber-500/50 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Mensaje Global</label>
                            <textarea placeholder="Ej: ¡Bienvenidos al club!" className="w-full h-24 rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-sm text-white focus:border-amber-500/50 outline-none resize-none" />
                        </div>
                    </div>
                </div>

                {/* Economic Settings */}
                <div className="rounded-[2rem] border border-white/5 bg-zinc-900/50 p-8 space-y-6">
                    <div className="flex items-center gap-3 text-emerald-500">
                        <Shield className="h-5 w-5" />
                        <h2 className="text-lg font-black uppercase italic">Economía</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Bono Diario</label>
                                <input type="number" defaultValue="100" className="w-full rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-sm text-white focus:border-amber-500/50 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Costo Mín. Mesa</label>
                                <input type="number" defaultValue="50" className="w-full rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-sm text-white focus:border-amber-500/50 outline-none" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div>
                                <p className="text-xs font-bold text-white uppercase tracking-wider">Modo Mantenimiento</p>
                                <p className="text-[10px] text-white/40 uppercase font-medium">Desactiva el acceso al juego</p>
                            </div>
                            <div className="h-6 w-12 rounded-full bg-zinc-800 p-1 cursor-pointer">
                                <div className="h-4 w-4 rounded-full bg-zinc-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="flex items-center gap-2 rounded-2xl bg-amber-500 px-8 py-4 text-xs font-black uppercase tracking-widest text-black hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10">
                    <Save className="h-4 w-4" />
                    Guardar Configuración
                </button>
            </div>
        </div>
    )
}
