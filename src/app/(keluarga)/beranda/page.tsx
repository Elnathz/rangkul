import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Heart, HeartPulse, Plus, Sparkles, UsersRound } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { TaskStatus } from "@/lib/constants/task-status";
import { createClient } from "@/lib/supabase/server";
import { canRolePerformTaskAction, getTaskStatusPresentation } from "@/lib/tasks/task-status-presentation";

export default async function BerandaKeluargaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: lansias },
    { data: activeTasks },
    { data: upcomingTasks },
    { data: latestCompleted },
  ] = await Promise.all([
    supabase.from("users").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("lansia_profiles")
      .select("id, nama, hubungan_keluarga")
      .eq("keluarga_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("tasks")
      .select(`
        id, status, jadwal_waktu, started_at,
        lansia_profiles(nama),
        service_categories(nama),
        helper_profiles(users(full_name))
      `)
      .eq("keluarga_id", user.id)
      .in("status", ["dikonfirmasi", "dikerjakan", "menunggu_persetujuan_keluarga"])
      .order("jadwal_waktu", { ascending: true })
      .limit(1),
    supabase
      .from("tasks")
      .select("id, status, jadwal_waktu, lansia_profiles(nama), service_categories(nama)")
      .eq("keluarga_id", user.id)
      .in("status", ["diajukan", "menunggu_persetujuan_koordinator"])
      .order("jadwal_waktu", { ascending: true })
      .limit(3),
    supabase
      .from("tasks")
      .select("id, completed_at, lansia_profiles(nama), service_categories(nama), health_snapshots(energi, mood, mobilitas, cerita_hari_ini)")
      .eq("keluarga_id", user.id)
      .eq("status", "selesai")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const activeTask = activeTasks?.[0];
  const activeStatus = activeTask ? getTaskStatusPresentation(activeTask.status as TaskStatus) : null;
  const canCancel = activeTask ? canRolePerformTaskAction(activeTask.status as TaskStatus, "keluarga", "cancel") : false;

  const rawSnapshot = latestCompleted?.health_snapshots;
  const snapshot = Array.isArray(rawSnapshot) ? rawSnapshot[0] : rawSnapshot;

  const activeLansiaName = Array.isArray(activeTask?.lansia_profiles)
    ? activeTask?.lansia_profiles[0]?.nama
    : activeTask?.lansia_profiles?.nama;

  const activeHelperUser = Array.isArray(activeTask?.helper_profiles)
    ? activeTask?.helper_profiles[0]?.users
    : activeTask?.helper_profiles?.users;

  const activeHelperName = Array.isArray(activeHelperUser)
    ? activeHelperUser[0]?.full_name
    : activeHelperUser?.full_name;

  const familyAvatarUrl = (user?.user_metadata?.avatar_url || user?.user_metadata?.foto_url || null) as string | null;

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-5 pb-28 sm:space-y-7 sm:px-6 sm:py-7 lg:px-8">
      {/* 1. Elevated Human-Centered Header */}
      <header className="relative overflow-hidden rounded-2xl bg-primary bg-gradient-to-br from-[#0D3B82] via-[#0D47A1] to-[#1565C0] p-6 text-primary-foreground shadow-md sm:p-7 border border-white/10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 size-48 rounded-full bg-blue-400/10 blur-2xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 sm:items-center">
            {/* Avatar Badge with warm heart badge */}
            <div className="relative flex size-13 shrink-0 items-center justify-center rounded-2xl bg-white/15 font-heading text-lg font-bold text-white shadow-inner border border-white/20 backdrop-blur-xs sm:size-15 sm:text-xl overflow-hidden">
              {familyAvatarUrl ? (
                <img
                  src={familyAvatarUrl}
                  alt={profile?.full_name || "Keluarga"}
                  className="size-full object-cover"
                />
              ) : (
                (profile?.full_name || "Keluarga").slice(0, 2).toUpperCase()
              )}
              <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 ring-2 ring-[#0D47A1] z-10" title="Keluarga Tercinta">
                <Heart className="size-2.5 text-white fill-white" aria-hidden="true" />
              </span>
            </div>

            {/* Context & Metadata */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white backdrop-blur-xs border border-white/10">
                  <Sparkles className="size-3 text-blue-200" aria-hidden="true" />
                  Dashboard Keluarga
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90 border border-white/15">
                  {(lansias ?? []).length} Orang Tersayang Terdaftar
                </span>
              </div>

              <h1 className="mt-1.5 font-heading text-2xl font-black tracking-tight text-white sm:text-3xl">
                Halo, {profile?.full_name || "Keluarga"}
              </h1>

              <p className="mt-1 text-xs text-white/80 sm:text-sm">
                Pantau pendampingan lansia tersayang dalam lingkungan komunitas yang aman.
              </p>
            </div>
          </div>

          {/* Action Cluster */}
          <div className="flex shrink-0 items-center gap-3 self-stretch sm:self-auto">
            <Button asChild className="min-h-11 w-full rounded-xl bg-white font-bold text-[#0D47A1] shadow-sm hover:bg-white/90 sm:w-auto px-6 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Link href="/booking/new" className="flex items-center gap-2">
                <Plus className="size-4" aria-hidden="true" />
                <span>Buat Kunjungan</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Active Visit / Needs Attention Card */}
      {activeTask && activeStatus ? (
        <section className="overflow-hidden rounded-[18px] border-2 border-[#0D47A1]/30 bg-white shadow-sm">
          <div className="flex items-center justify-between bg-[#EEF5FF] px-5 py-3.5 border-b border-[#0D47A1]/15">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0D47A1] opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-[#0D47A1]"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">
                Kunjungan Sedang Berlangsung
              </span>
            </div>
            <span className="inline-flex rounded-full bg-[#0D47A1] px-3 py-0.5 text-xs font-bold text-white">
              {activeStatus.label}
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
                  {Array.isArray(activeTask.service_categories)
                    ? activeTask.service_categories[0]?.nama
                    : activeTask.service_categories?.nama || "Pendampingan Lansia"}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#0D47A1]">
                  Untuk: {activeLansiaName || "Orang Tersayang"}
                </p>
                {activeHelperName && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Helper bertugas: <span className="font-medium text-foreground">{activeHelperName}</span>
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Jadwal: {new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date(activeTask.jadwal_waktu))}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Button asChild className="min-h-11 bg-[#0D47A1] text-white hover:bg-[#0D47A1]/90">
                  <Link href={`/kunjungan/${activeTask.id}`}>Lihat Status</Link>
                </Button>
                <Button asChild variant="outline" className="min-h-11 border-border text-foreground hover:bg-muted/40">
                  <Link href={`/pesan`}>Hubungi Helper</Link>
                </Button>
                {canCancel && (
                  <Button asChild variant="outline" className="min-h-11 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive">
                    <Link href={`/kunjungan/${activeTask.id}`}>Lihat opsi pembatalan</Link>
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground bg-[#F8FAFD] p-3 rounded-xl border border-border/60">
              {activeStatus.description}
            </p>
          </div>
        </section>
      ) : null}

      {/* 3. Riwayat Rangkul Preview Card */}
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/70 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#0D47A1]/10 text-[#0D47A1]">
              <HeartPulse className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">Riwayat Rangkul Terbaru</h2>
              <p className="text-xs text-muted-foreground">Catatan observasi dan kebugaran lansia non-diagnostik</p>
            </div>
          </div>
          <Link
            href="/lansia"
            className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 text-xs font-semibold text-[#0D47A1] hover:bg-[#0D47A1]/5 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2"
          >
            Lihat Semua Profil
          </Link>
        </div>

        {snapshot ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Kunjungan: <strong className="text-foreground">{Array.isArray(latestCompleted?.lansia_profiles) ? latestCompleted?.lansia_profiles[0]?.nama : latestCompleted?.lansia_profiles?.nama}</strong>
              </span>
              <span>
                {latestCompleted?.completed_at
                  ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(latestCompleted.completed_at))
                  : "Baru saja"}
              </span>
            </div>

            {/* Indicator Pills */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#F8FAFD] border border-border p-3 text-center">
                <p className="text-[11px] font-medium text-muted-foreground">Energi</p>
                <p className="mt-1 font-heading text-base font-bold text-foreground">{snapshot.energi}/5</p>
              </div>
              <div className="rounded-xl bg-[#F8FAFD] border border-border p-3 text-center">
                <p className="text-[11px] font-medium text-muted-foreground">Mood</p>
                <p className="mt-1 font-heading text-base font-bold text-foreground">{snapshot.mood}/5</p>
              </div>
              <div className="rounded-xl bg-[#F8FAFD] border border-border p-3 text-center">
                <p className="text-[11px] font-medium text-muted-foreground">Mobilitas</p>
                <p className="mt-1 font-heading text-base font-bold text-foreground">{snapshot.mobilitas}/5</p>
              </div>
            </div>

            {/* Story / Memory capsule */}
            {snapshot.cerita_hari_ini && (
              <div className="rounded-xl bg-[#F0F6FF] border border-[#0D47A1]/15 p-4 text-xs leading-relaxed text-slate-700 italic">
                &quot;{snapshot.cerita_hari_ini}&quot;
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Belum ada ringkasan Health Snapshot. Setelah kunjungan selesai, catatan observasi lansia akan tampil di sini.
          </div>
        )}
      </section>

      {/* 4. Orang Tersayang & Kunjungan Mendatang (2-Column Grid) */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Orang Tersayang (Lansia) */}
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <UsersRound className="size-5 text-[#0D47A1]" />
              <h2 className="font-heading text-lg font-bold text-foreground">Orang Tersayang</h2>
            </div>
            <Button asChild size="sm" variant="outline" className="min-h-11 gap-1 rounded-xl text-xs font-semibold">
              <Link href="/lansia/tambah">
                <Plus className="size-3.5" /> Tambah Lansia
              </Link>
            </Button>
          </div>

          {(lansias ?? []).length ? (
            <div className="divide-y divide-border/60">
              {(lansias ?? []).map((lansia) => (
                <Link
                  key={lansia.id}
                  href={`/lansia/${lansia.id}`}
                  className="flex min-h-14 items-center justify-between py-3 transition-colors hover:bg-muted/30 px-2 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#0D47A1]/10 font-heading font-bold text-sm text-[#0D47A1]">
                      {lansia.nama.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{lansia.nama}</p>
                      <p className="text-xs text-muted-foreground">{lansia.hubungan_keluarga || "Keluarga"}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Belum ada profil lansia yang didaftarkan.
            </div>
          )}
        </div>

        {/* Kunjungan Mendatang */}
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-[#0D47A1]" />
              <h2 className="font-heading text-lg font-bold text-foreground">Kunjungan Mendatang</h2>
            </div>
            <Link
              href="/kunjungan"
              className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 text-xs font-semibold text-[#0D47A1] hover:bg-[#0D47A1]/5 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2"
            >
              Semua Kunjungan
            </Link>
          </div>

          {(upcomingTasks ?? []).length ? (
            <div className="divide-y divide-border/60">
              {(upcomingTasks ?? []).map((task) => {
                const taskPres = getTaskStatusPresentation(task.status as TaskStatus);
                const lansiaName = Array.isArray(task.lansia_profiles)
                  ? task.lansia_profiles[0]?.nama
                  : task.lansia_profiles?.nama;
                const catName = Array.isArray(task.service_categories)
                  ? task.service_categories[0]?.nama
                  : task.service_categories?.nama;

                return (
                  <Link
                    key={task.id}
                    href={`/kunjungan/${task.id}`}
                    className="flex min-h-14 items-center justify-between py-3 transition-colors hover:bg-muted/30 px-2 rounded-xl"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">{catName || "Pendampingan"}</p>
                      <p className="text-xs text-muted-foreground">
                        Untuk: {lansiaName || "Lansia"} · {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(task.jadwal_waktu))}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {taskPres.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Belum ada kunjungan mendatang.{" "}
              <Link href="/booking/new" className="font-semibold text-[#0D47A1] underline">
                Pesan sekarang
              </Link>
              .
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
