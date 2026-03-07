import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PublicProfileClient } from "./PublicProfileClient"

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")
    if (user.id === params.id) redirect("/profile")

    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('*, player_stats(*)')
        .eq('id', params.id)
        .single()

    if (!targetProfile) notFound()

    // Check if profile is public (we added is_public in migration)
    if (targetProfile.is_public === false) {
        // Return a "Private Profile" view or notFound
        return (
            <div className="py-20 text-center">
                <h1 className="text-2xl font-black text-white uppercase italic">Perfil Privado</h1>
                <p className="text-white/40 mt-2 uppercase tracking-widest text-xs">Este usuario ha decidido mantener su perfil en modo privado.</p>
            </div>
        )
    }

    return <PublicProfileClient profile={targetProfile} currentUserId={user.id} />
}
