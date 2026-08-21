import HelperDirectoryClient from "@/components/koordinator/HelperDirectoryClient";
import KoordinatorStatusGuard from "@/components/koordinator/KoordinatorStatusGuard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function VerifiedHelperDirectoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: koordinator } = await supabase
    .from("koordinator_profiles")
    .select("id, wilayah, status")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <KoordinatorStatusGuard koordinator={koordinator}>
      <HelperDirectoryClient />
    </KoordinatorStatusGuard>
  );
}
