import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SocialView from "@/components/social/SocialView"

export default async function FriendsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Fetch friends (accepted)
    const { data: friendships } = await supabase
        .from('friends')
        .select(`
            id,
            status,
            requester_id,
            addressee_id,
            requester:profiles!requester_id(id, name, alias, image),
            addressee:profiles!addressee_id(id, name, alias, image)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    const friends = friendships
        ?.filter(f => f.status === 'accepted')
        .map(f => {
            const isRequester = f.requester_id === user.id
            const friend = isRequester ? f.addressee : f.requester
            return {
                ...friend,
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
        <div className="py-20 px-4 max-w-7xl mx-auto">
            <SocialView
                initialFriends={friends}
                initialPending={pending}
                currentUserId={user.id}
            />
        </div>
    )
}
