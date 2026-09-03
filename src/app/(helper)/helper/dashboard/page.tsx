import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarClock,
  CircleCheck,
  MapPin,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import { redirect } from "next/navigation";

import { AvailabilityToggle } from "@/components/helper/AvailabilityToggle";
import { Button } from "@/components/ui/button";
import type { TaskStatus } from "@/lib/constants/task-status";
import { createClient } from "@/lib/supabase/server";
import { getTaskStatusPresentation } from "@/lib/tasks/task-status-presentation";

const formatRupiah = (value: number) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
}).format(value);

const helperStatusLabel: Record<string, string> = {
  pending_verification: "Menunggu verifikasi",
  verified: "Terverifikasi",
  under_review: "Sedang ditinjau",
  rejected: "Perlu perbaikan profil",
  suspended: "Ditangguhkan",
};

export default async function HelperDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: userData }, { data: profile }] = await Promise.all([
    supabase.from("users").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("helper_profiles")
      .select(`
        id, status, tingkat_kepercayaan, is_available, saldo_tersedia,
        total_tugas_selesai, wilayah_domisili, radius_layanan_km,
        helper_service_categories ( service_categories ( nama ) )
      `)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!profile) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 pb-28 sm:px-6">
        <section className="rounded-md border border-border bg-card p-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">Mulai sebagai Helper</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Lengkapi profil dan dokumen Anda agar Koordinator dapat melakukan verifikasi.
          </p>
          <Button asChild className="mt-5 min-h-11">
            <Link href="/helper/verifikasi">Lengkapi profil</Link>
          </Button>
        </section>
      </main>
    );
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, status, jadwal_waktu, lansia_profiles(nama), service_categories(nama)")
    .eq("helper_id", profile.id)
    .order("jadwal_waktu", { ascending: true })
    .limit(8);
  const activeTasks = (tasks ?? []).filter((task) => !["selesai", "dibatalkan"].includes(task.status));
  const nextTask = activeTasks[0];
  const taskStatus = nextTask ? getTaskStatusPresentation(nextTask.status as TaskStatus) : null;
  const canBrowse = profile.status === "verified";
  const helperName = userData?.full_name || "Helper";
  const serviceCategoryNames = (profile.helper_service_categories ?? [])
    .map((item) => {
      const category = Array.isArray(item.service_categories)
        ? item.service_categories[0]
        : item.service_categories;
      return category?.nama;
    })
    .filter((name): name is string => Boolean(name));
  const serviceCoverage = `${Number(profile.radius_layanan_km).toLocaleString("id-ID")} km`;

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-4 py-5 pb-28 sm:px-6 sm:py-6 lg:px-8">
      <header className="flex flex-col gap-5 rounded-lg bg-primary p-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{helperName}</h1>
          <p className="mt-2 text-sm text-primary-foreground/80">
            <span className="font-semibold text-primary-foreground">
              {helperStatusLabel[profile.status] ?? profile.status}
            </span>
            {profile.status === "verified" ? ` · ${profile.tingkat_kepercayaan}` : ""}
          </p>
        </div>
        {canBrowse ? (
          <Button asChild className="min-h-11 w-full bg-white text-primary hover:bg-white/90 sm:w-auto">
            <Link href="/helper/tugas/baru">Cari Tugas</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="min-h-11 w-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:w-auto">
            <Link href="/helper/verifikasi">Lihat verifikasi</Link>
          </Button>
        )}
      </header>

      <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <article className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border bg-[var(--surface-subtle)] px-5 py-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Tugas berikutnya</h2>
              <p className="mt-1 text-sm text-muted-foreground">Status dan tindakan diperbarui sesuai perkembangan kunjungan.</p>
            </div>
            <CalendarClock className="size-5 text-primary" aria-hidden="true" />
          </div>
          {nextTask && taskStatus ? (
            <div className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-primary">{taskStatus.label}</p>
              <h3 className="mt-3 font-heading text-xl font-bold text-foreground">
                {Array.isArray(nextTask.service_categories)
                  ? nextTask.service_categories[0]?.nama
                  : nextTask.service_categories?.nama || "Kunjungan Rangkul"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Untuk {Array.isArray(nextTask.lansia_profiles) ? nextTask.lansia_profiles[0]?.nama : nextTask.lansia_profiles?.nama || "lansia"}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{taskStatus.description}</p>
              <Button asChild className="mt-5 min-h-11">
                <Link href={`/helper/tugas/${nextTask.id}`}>Lihat detail tugas</Link>
              </Button>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <h3 className="font-heading text-lg font-bold text-foreground">Belum ada tugas aktif</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Cari tugas yang tersedia sesuai wilayah dan layananmu.</p>
              {canBrowse ? (
                <Button asChild className="mt-5 min-h-11">
                  <Link href="/helper/tugas/baru">Cari Tugas</Link>
                </Button>
              ) : null}
            </div>
          )}
        </article>

        <aside className="space-y-4">
          <AvailabilityToggle initialValue={profile.is_available} disabled={!canBrowse} />
          <article className="rounded-lg border border-[var(--brand-sky)] bg-[var(--info-bg)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Jangkauan layanan</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--ink-secondary)]">Wilayah dan layanan yang Anda pilih untuk menerima peluang tugas.</p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                <MapPin className="size-5" aria-hidden="true" />
              </span>
            </div>
            <dl className="mt-5 grid gap-4 border-t border-primary/15 pt-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="text-sm text-muted-foreground">Radius layanan</dt>
                <dd className="mt-1 font-heading text-xl font-bold tabular-nums text-foreground">{serviceCoverage}</dd>
                <p className="mt-1 text-sm leading-5 text-[var(--ink-secondary)]">Dari {profile.wilayah_domisili}</p>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Layanan aktif</dt>
                <dd className="mt-1 text-sm font-semibold leading-6 text-foreground">
                  {serviceCategoryNames.length > 0 ? serviceCategoryNames.join(", ") : "Belum memilih layanan"}
                </dd>
              </div>
            </dl>
            <Link href="/helper/profil/edit" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Atur jangkauan
            </Link>
          </article>
          <article className="rounded-lg border border-border bg-[var(--surface-subtle)] p-5">
            <h2 className="font-heading text-lg font-bold text-foreground">Langkah berikutnya</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {canBrowse
                ? "Aktifkan ketersediaan saat Anda siap menerima peluang yang sesuai."
                : "Selesaikan proses verifikasi sebelum mengambil tugas baru."}
            </p>
            {!canBrowse ? (
              <Link href="/helper/verifikasi" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Buka verifikasi
              </Link>
            ) : null}
          </article>
        </aside>
      </section>

      <section aria-labelledby="helper-metrics-heading">
        <div className="mb-3">
          <h2 id="helper-metrics-heading" className="font-heading text-xl font-bold text-foreground">Ringkasan kerja</h2>
          <p className="mt-1 text-sm text-muted-foreground">Data tugas dan saldo yang tersedia saat ini.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-4">
            <BriefcaseBusiness className="size-5 text-primary" aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-muted-foreground">Tugas aktif</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{activeTasks.length}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <CircleCheck className="size-5 text-[var(--success)]" aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-muted-foreground">Tugas selesai</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{profile.total_tugas_selesai}</p>
          </div>
          <Link href="/helper/penghasilan" className="rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Wallet className="size-5 text-primary" aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-muted-foreground">Saldo tersedia</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{formatRupiah(Number(profile.saldo_tersedia))}</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
