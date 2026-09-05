import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleCheck,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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
        total_tugas_selesai, wilayah_domisili, radius_layanan_km, foto_wajah_url,
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
  const helperAvatarUrl = profile.foto_wajah_url || (user.user_metadata?.avatar_url as string | undefined);

  const helperCategories: ServiceCategoryItem[] = (profile.helper_service_categories ?? [])
    .map((item) => {
      const category = Array.isArray(item.service_categories)
        ? item.service_categories[0]
        : item.service_categories;
      return category as ServiceCategoryItem | null;
    })
    .filter((category): category is ServiceCategoryItem => Boolean(category));

  const serviceCoverage = `${Number(profile.radius_layanan_km).toLocaleString("id-ID")} km`;

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-5 pb-28 sm:space-y-7 sm:px-6 sm:py-7 lg:px-8">
      {/* Elevated Human-Centered Header */}
      <header className="relative overflow-hidden rounded-2xl bg-primary bg-gradient-to-br from-[#0D3B82] via-[#0D47A1] to-[#1565C0] p-6 text-primary-foreground shadow-md sm:p-7 border border-white/10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 size-48 rounded-full bg-blue-400/10 blur-2xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 sm:items-center">
            {/* Avatar Badge with verified ring */}
            <div className="relative flex size-13 shrink-0 items-center justify-center rounded-2xl bg-white/15 font-heading text-lg font-bold text-white shadow-inner border border-white/20 backdrop-blur-xs sm:size-15 sm:text-xl overflow-hidden">
              {helperAvatarUrl ? (
                <img
                  src={helperAvatarUrl}
                  alt={helperName}
                  className="size-full object-cover"
                />
              ) : (
                helperName.slice(0, 2).toUpperCase()
              )}
              {profile.status === "verified" ? (
                <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0D47A1] z-10" title="Terverifikasi">
                  <CheckCircle2 className="size-2.5 text-white" aria-hidden="true" />
                </span>
              ) : null}
            </div>

            {/* Context & Metadata */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white backdrop-blur-xs border border-white/10">
                  <ShieldCheck className="size-3 text-blue-200" aria-hidden="true" />
                  Workspace Helper
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-bold text-emerald-200 border border-emerald-400/30">
                  {helperStatusLabel[profile.status] ?? profile.status}
                </span>
              </div>

              <h1 className="mt-1.5 font-heading text-2xl font-black tracking-tight text-white sm:text-3xl">
                {helperName}
              </h1>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="size-3 text-amber-300" aria-hidden="true" />
                  Tingkat <strong className="text-white capitalize">{profile.tingkat_kepercayaan}</strong>
                </span>
                <span className="text-white/40">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3 text-blue-200" aria-hidden="true" />
                  {profile.wilayah_domisili}
                </span>
                <span className="text-white/40">·</span>
                <span>Radius {serviceCoverage}</span>
              </div>
            </div>
          </div>

          {/* Action Cluster */}
          <div className="flex shrink-0 items-center gap-3 self-stretch sm:self-auto">
            {canBrowse ? (
              <Button asChild className="min-h-11 w-full rounded-xl bg-white font-bold text-[#0D47A1] shadow-sm hover:bg-white/90 sm:w-auto px-6 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Link href="/helper/tugas/baru" className="flex items-center gap-2">
                  <Search className="size-4" aria-hidden="true" />
                  <span>Cari Tugas</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="min-h-11 w-full rounded-xl border-white/40 bg-transparent font-bold text-white hover:bg-white/10 hover:text-white sm:w-auto px-5">
                <Link href="/helper/verifikasi">Lihat verifikasi</Link>
              </Button>
            )}
          </div>
        </div>
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
