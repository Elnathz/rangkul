import Link from "next/link";
import { AlertTriangle, ArrowRight, ClipboardCheck, FileWarning, ShieldAlert, UserRoundCheck, UsersRound } from "lucide-react";
import { redirect } from "next/navigation";

import KoordinatorStatusGuard from "@/components/koordinator/KoordinatorStatusGuard";
import { RegionAddress } from "@/components/ui/RegionAddress";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type PendingHelper = {
  id: string;
  created_at: string;
  wilayah_domisili: string;
  koordinator_id: string | null;
  users: { full_name: string | null } | { full_name: string | null }[] | null;
};

type ScopedHelper = {
  id: string;
  is_available: boolean;
  koordinator_id: string | null;
  status: string;
  wilayah_domisili: string;
};

function helperName(helper: PendingHelper) {
  const user = Array.isArray(helper.users) ? helper.users[0] : helper.users;
  return user?.full_name || "Helper tanpa nama";
}

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function KoordinatorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: koordinator } = await supabase
    .from("koordinator_profiles")
    .select("id, wilayah, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isProfileIncomplete = !koordinator?.wilayah;
  const isOperational = koordinator?.status === "verified" && !isProfileIncomplete;
  let scopedHelpers: ScopedHelper[] = [];
  let pendingHelpers: PendingHelper[] = [];
  let activeHelperCount = 0;

  if (koordinator?.id && koordinator.wilayah) {
    const [{ data: helpers }, { data: pendingData }, { data: activeTasks }] = await Promise.all([
      supabase.from("helper_profiles").select("id, is_available, wilayah_domisili, status, koordinator_id").or(`koordinator_id.eq.${koordinator.id},koordinator_id.is.null`),
      supabase.from("helper_profiles").select("id, created_at, wilayah_domisili, koordinator_id, users(full_name)").eq("status", "pending_verification").or(`koordinator_id.eq.${koordinator.id},koordinator_id.is.null`).order("created_at", { ascending: false }),
      isOperational ? supabase.from("tasks").select("helper_id").eq("status", "dikerjakan") : Promise.resolve({ data: [] as Array<{ helper_id: string | null }> }),
    ]);
    const belongsToWilayah = (helper: { koordinator_id: string | null; wilayah_domisili: string }) => helper.koordinator_id === koordinator.id || (helper.koordinator_id === null && helper.wilayah_domisili.includes(koordinator.wilayah));
    scopedHelpers = ((helpers ?? []) as ScopedHelper[]).filter(belongsToWilayah);
    pendingHelpers = ((pendingData ?? []) as PendingHelper[]).filter(belongsToWilayah).slice(0, 3);
    const scopedHelperIds = new Set(scopedHelpers.map((helper) => helper.id));
    activeHelperCount = new Set((activeTasks ?? []).map((task) => task.helper_id).filter((id): id is string => Boolean(id && scopedHelperIds.has(id)))).size;
  }

  const [approvalResult, emergencyResult, reportResult] = await Promise.all([
    isOperational ? supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "menunggu_persetujuan_koordinator") : Promise.resolve({ count: 0, error: null }),
    isOperational ? supabase.from("emergency_alerts").select("id", { count: "exact", head: true }).eq("status", "active") : Promise.resolve({ count: 0, error: null }),
    isOperational ? supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "menunggu") : Promise.resolve({ count: 0, error: null }),
  ]);

  const verifiedHelperCount = scopedHelpers.filter((helper) => helper.status === "verified").length;
  const availableHelperCount = scopedHelpers.filter((helper) => helper.status === "verified" && helper.is_available).length;
  const unavailableHelperCount = Math.max(verifiedHelperCount - availableHelperCount, 0);
  const pendingHelperCount = pendingHelpers.length;
  const approvalCount = approvalResult.count ?? 0;
  const activeEmergencyCount = emergencyResult.count ?? 0;
  const pendingReportCount = reportResult.count ?? 0;
  const hasQueueError = Boolean(approvalResult.error || emergencyResult.error || reportResult.error);
  const actions = [
    { title: "Verifikasi Helper", detail: pendingHelperCount ? `${pendingHelperCount} pengajuan perlu ditinjau.` : "Tidak ada pengajuan baru di wilayah Anda.", count: pendingHelperCount, href: "/koordinator/pengajuan", icon: UserRoundCheck, tone: "info" },
    { title: "Persetujuan kunjungan", detail: approvalCount ? `${approvalCount} kunjungan memerlukan keputusan Anda.` : "Tidak ada kunjungan yang menunggu persetujuan.", count: approvalCount, href: "/koordinator/persetujuan", icon: ClipboardCheck, tone: "warning" },
    { title: "Darurat aktif", detail: activeEmergencyCount ? `${activeEmergencyCount} sinyal SOS perlu ditangani sekarang.` : "Tidak ada sinyal SOS aktif.", count: activeEmergencyCount, href: "/koordinator/darurat", icon: AlertTriangle, tone: "danger" },
    { title: "Laporan menunggu", detail: pendingReportCount ? `${pendingReportCount} laporan perlu ditindaklanjuti.` : "Tidak ada laporan yang menunggu peninjauan.", count: pendingReportCount, href: "/koordinator/laporan", icon: FileWarning, tone: "warning" },
  ];

  return <KoordinatorStatusGuard koordinator={koordinator}>
    <main className="mx-auto min-h-screen max-w-6xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
      <header className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <div><h1 className="font-heading text-xl font-bold tracking-[-0.03em] text-foreground sm:text-2xl">Beranda Wilayah</h1><p className="mt-0.5 text-xs text-muted-foreground sm:text-sm sm:leading-6">Mulai dari antrean yang perlu keputusan, lalu pantau kondisi Helper di wilayah Anda.</p></div>
        <div className="rounded-xl border border-border bg-[var(--surface-subtle)] px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm"><p className="font-semibold text-foreground">Wilayah operasional</p><div className="mt-1 text-muted-foreground"><RegionAddress value={koordinator?.wilayah} compact /></div></div>
      </header>

      {isProfileIncomplete ? <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">Lengkapi pengajuan profil</h2><p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm sm:leading-6">Atur wilayah dan dokumen jabatan agar Anda dapat melihat antrean Helper serta tindakan wilayah yang diizinkan.</p></div><Button asChild className="min-h-11 shrink-0"><Link href="/koordinator/pengajuan">Lengkapi pengajuan</Link></Button></div></section> : <>
        <section className="overflow-hidden rounded-2xl border border-border bg-card" aria-labelledby="action-queue-heading">
          <div className="flex items-center justify-between border-b border-border bg-[var(--surface-subtle)] px-3.5 py-3 sm:px-5 sm:py-4"><div><h2 id="action-queue-heading" className="font-heading text-base font-bold tracking-[-0.02em] text-foreground sm:text-xl">Tindakan perlu ditangani</h2><p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Antrean yang benar-benar membutuhkan keputusan Anda.</p></div><ShieldAlert className="size-5 text-primary sm:size-6" aria-hidden="true" /></div>
          <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">{actions.map((action) => {
            const emphasized = action.count > 0;
            const iconTone = action.tone === "danger" && emphasized ? "bg-destructive/10 text-destructive" : action.tone === "warning" && emphasized ? "bg-amber-100 text-amber-800" : emphasized ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground";
            return <Link key={action.href} href={action.href} className="group flex min-h-24 items-start gap-3 px-3.5 py-3.5 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-32 sm:px-5 sm:py-5"><span className={`flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10 ${iconTone}`}><action.icon className="size-4.5 sm:size-5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-foreground sm:text-sm">{action.title}</span>{emphasized ? <span className={action.tone === "danger" ? "rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold text-white sm:text-xs" : "rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground sm:text-xs"}>{action.count > 99 ? "99+" : action.count}</span> : null}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">{action.detail}</span></span><ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" /></Link>;
          })}</div>
        </section>

        {hasQueueError ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 sm:px-4 sm:py-3 sm:text-sm">Sebagian antrean belum dapat dimuat. Buka halaman tindakan terkait untuk mencoba lagi.</p> : null}

        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card"><div className="flex items-center justify-between border-b border-border bg-[var(--surface-subtle)] px-3.5 py-3 sm:px-5 sm:py-4"><div><h2 className="font-heading text-base font-bold text-foreground sm:text-lg">Aktivitas Wilayah Terbaru</h2><p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Pengajuan Helper yang benar-benar masuk dari wilayah Anda.</p></div><Link href="/koordinator/pengajuan" className="inline-flex min-h-10 items-center text-xs font-semibold text-primary underline underline-offset-4 sm:min-h-11 sm:text-sm">Lihat antrean</Link></div>{pendingHelpers.length ? <div className="divide-y divide-border">{pendingHelpers.map((helper) => <div key={helper.id} className="flex flex-col gap-3 px-3.5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4"><div className="min-w-0"><h3 className="truncate text-xs font-bold text-foreground sm:text-sm">{helperName(helper)}</h3><div className="mt-1 text-xs text-muted-foreground"><RegionAddress value={helper.wilayah_domisili} compact /></div><p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">Mengajukan verifikasi pada {formatSubmittedAt(helper.created_at)}</p></div><Button asChild variant="outline" className="min-h-10 shrink-0 border-primary/20 text-xs text-primary hover:bg-primary/5 hover:text-primary sm:min-h-11 sm:text-sm"><Link href={`/koordinator/helper/${helper.id}`}>Tinjau Helper</Link></Button></div>)}</div> : <div className="px-4 py-8 text-center text-xs text-muted-foreground sm:py-10 sm:text-sm">Tidak ada Helper yang menunggu verifikasi. Semua pengajuan sudah ditinjau.</div>}</div>
          <aside className="rounded-2xl border border-border bg-[var(--surface-subtle)] p-4 sm:p-5"><UsersRound className="size-5 text-primary sm:size-6" aria-hidden="true" /><h2 className="mt-3 font-heading text-lg font-bold tracking-[-0.02em] text-foreground sm:mt-4 sm:text-xl">Helper wilayah</h2><div className="mt-3 grid grid-cols-2 gap-2.5 text-xs sm:mt-4 sm:gap-3 sm:text-sm"><p><span className="block text-xl font-bold tabular-nums text-foreground sm:text-2xl">{verifiedHelperCount}</span><span className="text-muted-foreground">Helper terverifikasi</span></p><p><span className="block text-xl font-bold tabular-nums text-foreground sm:text-2xl">{activeHelperCount}</span><span className="text-muted-foreground">Sedang bertugas</span></p><p><span className="block text-xl font-bold tabular-nums text-foreground sm:text-2xl">{availableHelperCount}</span><span className="text-muted-foreground">Tersedia</span></p><p><span className="block text-xl font-bold tabular-nums text-foreground sm:text-2xl">{unavailableHelperCount}</span><span className="text-muted-foreground">Tidak tersedia</span></p></div><Link href="/koordinator/helper" className="mt-4 inline-flex min-h-10 items-center text-xs font-semibold text-primary underline underline-offset-4 sm:mt-5 sm:min-h-11 sm:text-sm">Lihat Helper wilayah</Link></aside>
        </section>
      </>}
    </main>
  </KoordinatorStatusGuard>;
}
