import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isFlexibleAssignmentEnabled } from "@/lib/features/sprint6-matching";
import { getSelectableServiceCategories, type ServiceCategoryRow } from "@/lib/service-category-tree";
import BookingNewClient, {
  type BookingLansia,
  type BookingCategory,
} from "@/components/keluarga/booking/BookingNewClient";

export const dynamic = "force-dynamic";

function DirectBookingEntry() {
  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0D47A1]">Buat kunjungan</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Pilih Helper yang akan mendampingi</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Mode penugasan fleksibel sedang tidak tersedia. Anda tetap dapat membuat kunjungan dengan memilih Helper terverifikasi dari katalog.</p>
        </div>
        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-slate-700">
            <p className="font-bold text-slate-900">Pilih Helper terlebih dahulu</p>
            <p className="mt-1">Gunakan filter lokasi, radius, jadwal, dan layanan untuk menemukan pendamping yang sesuai. Setelah itu pilih “Tanya ketersediaan” untuk mengisi detail kunjungan.</p>
          </div>
          <Link href="/cari-helper" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0D47A1] px-5 text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2">
            Cari Helper di sekitar
          </Link>
        </section>
      </div>
    </main>
  );
}

export default async function BookingNewPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialMode = resolvedParams?.mode === "cepat" ? "cepat" : "pelamar";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/booking/new");

  if (!isFlexibleAssignmentEnabled()) return <DirectBookingEntry />;

  const [lansiaResult, categoryResult] = await Promise.all([
    supabase
      .from("lansia_profiles")
      .select("id, nama, alamat")
      .eq("keluarga_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("service_categories")
      .select("id, nama, tingkat, harga_dasar, estimasi_durasi_menit, is_high_risk, is_active, parent_id, jarak_min_km, jarak_max_km")
      .or("is_active.eq.true,parent_id.is.null")
      .order("tingkat")
      .order("nama"),
  ]);

  const lansias = (lansiaResult.data ?? []) as BookingLansia[];
  const categories = getSelectableServiceCategories((categoryResult.data ?? []) as ServiceCategoryRow[]) as unknown as BookingCategory[];

  return (
    <BookingNewClient
      lansias={lansias}
      categories={categories}
      initialMode={initialMode}
    />
  );
}
