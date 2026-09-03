import Link from "next/link";
import { Heart, Plus, UserRound } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type LansiaSummary = {
  id: string;
  nama: string;
  umur: number | null;
  hubungan_keluarga: string | null;
  tingkat_mobilitas: string | null;
};

export default async function LansiaOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("lansia_profiles")
    .select("id, nama, umur, hubungan_keluarga, tingkat_mobilitas")
    .eq("keluarga_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const lansias = (data ?? []) as LansiaSummary[];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Profil Lansia</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Kelola informasi orang yang menerima kunjungan dan buka Riwayat Rangkul dari profilnya.</p>
        </div>
        <Button asChild className="min-h-11 w-full sm:w-auto">
          <Link href="/lansia/tambah"><Plus className="size-4" aria-hidden="true" />Tambah Lansia</Link>
        </Button>
      </header>

      {error ? (
        <section role="alert" className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          <p className="font-semibold">Profil lansia belum dapat dimuat.</p>
          <p className="mt-1">Muat ulang halaman. Jika masalah berlanjut, hubungi Admin melalui pesan.</p>
        </section>
      ) : lansias.length === 0 ? (
        <section className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Heart className="size-6" aria-hidden="true" /></div>
          <h2 className="mt-4 font-heading text-lg font-bold text-foreground">Belum ada profil lansia</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Tambahkan profil terlebih dahulu agar Anda dapat membuat kunjungan dan menyimpan Riwayat Rangkul.</p>
          <Button asChild className="mt-5 min-h-11"><Link href="/lansia/tambah">Tambah Profil Lansia</Link></Button>
        </section>
      ) : (
        <section className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="Daftar profil lansia">
          {lansias.map((lansia) => (
            <Link key={lansia.id} href={`/lansia/${lansia.id}`} className="group flex min-h-32 items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-base font-bold text-primary" aria-hidden="true">{lansia.nama.slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-heading text-base font-bold text-foreground">{lansia.nama}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{lansia.umur ? `${lansia.umur} tahun` : "Usia belum diisi"}{lansia.hubungan_keluarga ? `, ${lansia.hubungan_keluarga}` : ""}</span>
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary"><UserRound className="size-3.5" aria-hidden="true" />{lansia.tingkat_mobilitas || "Detail profil"}</span>
              </span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
