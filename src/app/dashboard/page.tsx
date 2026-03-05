import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardView from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return <DashboardView profile={profile} />;
}
