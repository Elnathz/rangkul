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
import { ServiceTiersTabs, type ServiceCategoryItem } from "@/components/helper/ServiceTiersTabs";
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
        helper_service_categories ( service_categories ( id, nama, tingkat, is_high_risk ) )
      `)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!profile) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 pb-28 sm:px-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="font-heading text-2xl font-bold text-foreground">Mulai sebagai Helper</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Lengkapi profil dan dokumen Anda agar Koordinator dapat melakukan verifikasi.
          </p>
          <Button asChild className="mt-5 min-h-11 rounded-xl">
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

  const helperCategories: ServiceCategoryItem[] = (profile.helper_service_categories ?? [])
    .map((item) => {
      const category = Array.isArray(item.service_categories)
        ? item.service_categories[0]
        : item.service_categories;
      return category as ServiceCategoryItem | null;
    })
    .filter((cat): cat is ServiceCategoryItem => Boolean(cat && cat.nama));

  const serviceCategoryNames = helperCategories.map((c) => c.nama);
  const serviceCoverage = `${Number(profile.radius_layanan_km).toLocaleString("id-ID")} km`;

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-5 pb-28 sm:space-y-7 sm:px-6 sm:py-7 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-5 rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-xs font-medium tracking-wide text-white">
            Workspace Helper
          </span>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{helperName}</h1>
          <p className="mt-1.5 text-sm text-primary-foreground/80">
            <span className="font-semibold text-primary-foreground">
              {helperStatusLabel[profile.status] ?? profile.status}
            </span>
            {profile.status === "verified" ? ` · Tingkat ${profile.tingkat_kepercayaan}` : ""}
          </p>
        </div>
        {canBrowse ? (
          <Button asChild className="min-h-11 w-full rounded-xl bg-white text-primary shadow-sm hover:bg-white/90 sm:w-auto">
            <Link href="/helper/tugas/baru">Cari Tugas</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="min-h-11 w-full rounded-xl border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:w-auto">
            <Link href="/helper/verifikasi">Lihat verifikasi</Link>
          </Button>
        )}
      </header>

      {/* Ringkasan Kerja (3 Kartu Metrik di Atas) */}
      <section aria-labelledby="helper-metrics-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="helper-metrics-heading" className="font-heading text-xl font-bold text-foreground">Ringkasan kerja</h2>
          <span className="text-xs text-muted-foreground">Data operasional terkini</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BriefcaseBusiness className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">Tugas aktif</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{activeTasks.length}</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--success-bg)] text-[var(--success)]">
              <CircleCheck className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">Tugas selesai</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{profile.total_tugas_selesai}</p>
          </div>
          <Link href="/helper/penghasilan" className="group rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <Wallet className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">Saldo tersedia</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{formatRupiah(Number(profile.saldo_tersedia))}</p>
          </Link>
        </div>
      </section>

      {/* Grid 2-Kolom Seimbang: Tugas Berikutnya & Jangkauan Layanan */}
      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        {/* Kolom Kiri: Tugas Berikutnya */}
        <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 bg-[var(--surface-subtle)] px-6 py-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Tugas berikutnya</h2>
              <p className="mt-1 text-sm text-muted-foreground">Status dan tindakan kunjungan terdekat.</p>
            </div>
            <CalendarClock className="size-5 text-primary" aria-hidden="true" />
          </div>
          {nextTask && taskStatus ? (
            <div className="p-6">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {taskStatus.label}
              </span>
              <h3 className="mt-3 font-heading text-2xl font-bold text-foreground">
                {Array.isArray(nextTask.service_categories)
                  ? nextTask.service_categories[0]?.nama
                  : nextTask.service_categories?.nama || "Kunjungan Rangkul"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Untuk {Array.isArray(nextTask.lansia_profiles) ? nextTask.lansia_profiles[0]?.nama : nextTask.lansia_profiles?.nama || "lansia"}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{taskStatus.description}</p>
              <Button asChild className="mt-6 min-h-11 rounded-xl">
                <Link href={`/helper/tugas/${nextTask.id}`}>Lihat detail tugas</Link>
              </Button>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <h3 className="font-heading text-lg font-bold text-foreground">Belum ada tugas aktif</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Cari tugas yang tersedia sesuai wilayah dan layananmu.</p>
              {canBrowse ? (
                <Button asChild className="mt-5 min-h-11 rounded-xl">
                  <Link href="/helper/tugas/baru">Cari Tugas</Link>
                </Button>
              ) : null}
            </div>
          )}
        </article>

        {/* Kolom Kanan: Ketersediaan & Jangkauan Layanan dengan Tabs */}
        <aside className="space-y-5">
          <AvailabilityToggle initialValue={profile.is_available} disabled={!canBrowse} />

          <article className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Jangkauan layanan</h2>
                <p className="mt-1 text-sm text-muted-foreground">Wilayah dan tingkat layanan yang Anda pilih.</p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="size-5" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-border/60 bg-[var(--surface-subtle)] p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Radius Layanan</p>
              <p className="mt-1 font-heading text-xl font-bold tabular-nums text-foreground">{serviceCoverage}</p>
              <p className="text-xs text-muted-foreground">Titik domisili: {profile.wilayah_domisili}</p>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Layanan Aktif</p>
              <ServiceTiersTabs categories={helperCategories} />
            </div>

            <div className="mt-4 border-t border-border/70 pt-3.5">
              <Link href="/helper/profil/edit" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Atur jangkauan
              </Link>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
