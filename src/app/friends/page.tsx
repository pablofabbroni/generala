import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import SocialView from "@/components/social/SocialView"

export default async function FriendsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Fetch friendships with profiles
    const { data: friendships } = await supabase
        .from('friends')
        .select(`
            *,
            requester:profiles!friends_requester_id_fkey(*),
            addressee:profiles!friends_addressee_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    const friends = friendships
        ?.filter(f => f.status === 'accepted')
        .map(f => {
            const friendProfile = f.requester_id === user.id ? f.addressee : f.requester
            return {
                ...friendProfile,
                friendship_id: f.id
            }
        }) || []

    const pending = friendships
        ?.filter(f => f.status === 'pending' && f.addressee_id === user.id)
        .map(f => ({
            ...f.requester,
            friendship_id: f.id
        })) || []

    return (
        <PageContainer className="py-12">
            <div className="mx-auto max-w-6xl px-4">
                <SocialView
                    initialFriends={friends}
                    initialPending={pending}
                    currentUserId={user.id}
                />
            </div>
        </PageContainer>
    )
}
