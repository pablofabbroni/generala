import { createClient } from "@/lib/supabase/server"
import { Coins, Users, Gamepad2, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default async function AdminDashboardPage() {
    const supabase = createClient()

    // KPIs fetching
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

    const { data: transactions } = await supabase.from('transactions').select('type, amount')

    const stats = {
        totalUsers: totalUsers || 0,
        chipsIssued: transactions?.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0) || 0,
        chipsConsumed: Math.abs(transactions?.filter(t => t.amount < 0 && t.type === 'game_entry').reduce((acc, t) => acc + t.amount, 0) || 0),
        rakeAccumulated: Math.abs(transactions?.filter(t => t.type === 'rake').reduce((acc, t) => acc + t.amount, 0) || 0),
    }

    const kpiCards = [
        { label: 'Usuarios Totales', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Fichas Emitidas', value: stats.chipsIssued, icon: ArrowUpRight, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Fichas Consumidas', value: stats.chipsConsumed, icon: ArrowDownRight, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Rake Acumulado', value: stats.rakeAccumulated, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white uppercase italic">Dashboard <span className="text-amber-500">Global</span></h1>
                <p className="text-sm text-white/40 font-medium uppercase tracking-widest mt-1">Resumen de actividad y economía del club</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card) => (
                    <div key={card.label} className="rounded-3xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`rounded-2xl p-3 ${card.bg} ${card.color}`}>
                                <card.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{card.label}</p>
                            <p className="text-3xl font-black text-white tabular-nums">{card.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-3xl border border-white/5 bg-zinc-900/10 p-8">
                    <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Actividad Reciente</h3>
                    <div className="flex items-center justify-center h-48 border border-dashed border-white/10 rounded-2xl">
                        <p className="text-xs text-white/20 uppercase tracking-widest">Gráfico de actividad (Próximamente)</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-zinc-900/10 p-8">
                    <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Distribución de Fichas</h3>
                    <div className="flex items-center justify-center h-48 border border-dashed border-white/10 rounded-2xl">
                        <p className="text-xs text-white/20 uppercase tracking-widest">Gráfico de economía (Próximamente)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
