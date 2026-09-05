import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isSprint6MatchingEnabled } from "@/lib/features/sprint6-matching";
import BookingNewClient, {
  type BookingLansia,
  type BookingCategory,
} from "@/components/keluarga/booking/BookingNewClient";

export const dynamic = "force-dynamic";

export default async function BookingNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/booking/new");
  if (!isSprint6MatchingEnabled()) redirect("/cari-helper");

  const [lansiaResult, categoryResult] = await Promise.all([
    supabase
      .from("lansia_profiles")
      .select("id, nama, alamat")
      .eq("keluarga_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("service_categories")
      .select("id, nama, tingkat, harga_dasar, estimasi_durasi_menit, is_high_risk, jarak_min_km, jarak_max_km")
      .eq("is_active", true)
      .order("tingkat")
      .order("nama"),
  ]);

  const lansias = (lansiaResult.data ?? []) as BookingLansia[];
  const categories = (categoryResult.data ?? []) as BookingCategory[];

  return (
    <BookingNewClient lansias={lansias} categories={categories} />
  );
}
