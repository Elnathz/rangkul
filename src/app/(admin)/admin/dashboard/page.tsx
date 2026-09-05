"use client";

import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, ClipboardList, FileWarning, Scale, ShieldCheck, Users, UserRoundCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminLoadingRows, formatDate, formatRupiah } from "@/components/admin/AdminPrimitives";

type DashboardData = {
  counts: {
    users: number;
    activeUsers: number;
    helpers: number;
    verifiedHelpers: number;
    pendingCoordinators: number;
    underReviewHelpers: number;
    tasks: number;
    pendingReports: number;
    pendingAppeals: number;
  };
  taskBreakdown: Record<string, number>;
  gmv: number;
  recentAuditLogs: Array<{ id: string; action: string; entity_type: string; entity_id: string | null; created_at: string; actor?: { full_name?: string | null } | null }>;
};

const metricCards = [
  { key: "users", label: "Total pengguna", icon: Users },
  { key: "activeUsers", label: "Akun aktif", icon: Activity },
  { key: "verifiedHelpers", label: "Helper terverifikasi", icon: ShieldCheck },
] as const;

const auditActionLabels: Record<string, string> = {
  approve_koordinator: "Menyetujui Koordinator",
  reject_koordinator: "Menolak Koordinator",
  review_report: "Meninjau laporan",
  restore_helper: "Memulihkan Helper",
  suspend_helper: "Menangguhkan Helper",
  resolve_appeal: "Menyelesaikan banding",
  assign_admin_fallback: "Menetapkan fallback Admin",
  topup_demo_wallet: "Menambah saldo demo",
  charge_demo_wallet: "Membayar dengan saldo demo",
};

function humanizeAuditAction(action: string) {
  return auditActionLabels[action] ?? action.replaceAll("_", " ");
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Ringkasan gagal dimuat");
        return payload.data as DashboardData;
      })
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) return <AdminError message={error} />;

  const actionItems = data ? [
    { label: "Koordinator menunggu verifikasi", detail: "Tinjau dokumen dan wilayah sebelum akun dapat aktif.", count: data.counts.pendingCoordinators, href: "/admin/koordinator/pengajuan", icon: UserRoundCheck, danger: false },
    { label: "Helper perlu ditinjau", detail: "Tindak lanjut status under review yang memerlukan keputusan.", count: data.counts.underReviewHelpers, href: "/admin/helpers", icon: ShieldCheck, danger: false },
    { label: "Laporan belum ditangani", detail: "Periksa laporan keselamatan dan keputusan yang masih tertunda.", count: data.counts.pendingReports, href: "/admin/reports", icon: FileWarning, danger: data.counts.pendingReports > 0 },
    { label: "Banding menunggu keputusan", detail: "Putuskan banding akun restricted dengan alasan yang tercatat.", count: data.counts.pendingAppeals, href: "/admin/banding", icon: Scale, danger: false },
  ] : [];

  return (
    <main className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="flex flex-col gap-4 border-b border-border py-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">Ringkasan platform</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Mulai dari keputusan yang menunggu, lalu pantau aktivitas platform yang sudah tercatat.</p></div>
        <Link href="/admin/audit-logs" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Buka audit log</Link>
      </header>

      {!data ? <AdminLoadingRows columns={4} /> : <>
        <section aria-label="Antrean tindakan"><div className="mb-3"><h2 className="font-heading text-xl font-bold text-foreground">Perlu Tindakan</h2><p className="mt-1 text-sm text-muted-foreground">Prioritas yang membutuhkan keputusan Admin.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{actionItems.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="group flex min-h-40 flex-col rounded-md border border-border bg-card p-5 transition-colors hover:border-primary/35 hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><div className="flex items-start justify-between gap-3"><span className={item.danger ? "flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive" : "flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"}><Icon className="size-5" aria-hidden="true" /></span><span className={item.danger && item.count > 0 ? "text-2xl font-bold tabular-nums text-destructive" : "text-2xl font-bold tabular-nums text-foreground"}>{item.count.toLocaleString("id-ID")}</span></div><h3 className="mt-5 text-sm font-bold text-foreground">{item.label}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{item.detail}</p><span className="mt-auto inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">Tinjau <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" /></span></Link>; })}</div></section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan platform">{metricCards.map(({ key, label, icon: Icon }) => <div key={key} className="rounded-md border border-border bg-card p-4 sm:p-5"><Icon className="size-5 text-primary" aria-hidden="true" /><p className="mt-4 text-sm font-semibold text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{data.counts[key].toLocaleString("id-ID")}</p></div>)}<div className="rounded-md border border-border bg-card p-4 sm:p-5"><AlertTriangle className="size-5 text-amber-800" aria-hidden="true" /><p className="mt-4 text-sm font-semibold text-muted-foreground">Laporan menunggu</p><p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{data.counts.pendingReports.toLocaleString("id-ID")}</p></div></section>

        <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-md border border-border bg-card"><div className="flex items-center justify-between border-b border-border bg-[var(--surface-subtle)] px-4 py-4 sm:px-5"><div><h2 className="font-heading font-bold text-foreground">Aktivitas sensitif terbaru</h2><p className="mt-1 text-sm text-muted-foreground">Aksi Admin dan sistem yang tercatat.</p></div><ClipboardList className="size-5 text-muted-foreground" aria-hidden="true" /></div>{data.recentAuditLogs.length === 0 ? <div className="px-4 py-12 text-center text-sm text-muted-foreground">Tidak ada aktivitas sensitif yang tercatat.</div> : <div className="divide-y divide-border">{data.recentAuditLogs.map((log) => <div key={log.id} className="flex gap-3 px-4 py-4 sm:px-5"><div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{humanizeAuditAction(log.action)}</p><p className="mt-1 text-sm text-muted-foreground">{log.actor?.full_name ?? "Sistem Rangkul"} pada {log.entity_type.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(log.created_at)}</p></div></div>)}</div>}</div>
          <div className="rounded-md border border-border bg-[var(--surface-subtle)] p-5"><Activity className="size-5 text-primary" aria-hidden="true" /><h2 className="mt-4 font-heading text-xl font-bold text-foreground">Pembayaran released</h2><p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{formatRupiah(data.gmv)}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Hanya pembayaran yang telah berstatus released.</p><div className="mt-5 border-t border-border pt-4"><p className="text-sm font-semibold text-foreground">Status kunjungan</p><div className="mt-3 space-y-2">{Object.entries(data.taskBreakdown).length === 0 ? <p className="text-sm text-muted-foreground">Belum ada kunjungan.</p> : Object.entries(data.taskBreakdown).map(([status, count]) => <div key={status} className="flex items-center justify-between gap-4 text-sm"><span className="text-muted-foreground">{status.replaceAll("_", " ")}</span><span className="font-bold tabular-nums text-foreground">{count}</span></div>)}</div></div></div>
        </section>
      </>}
    </main>
  );
}

function AdminError({ message }: { message: string }) {
  return <main className="mx-auto min-h-[60vh] max-w-2xl px-4 py-12 sm:px-6"><section role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive"><p className="font-bold">Dashboard gagal dimuat</p><p className="mt-1">{message}</p><button type="button" onClick={() => location.reload()} className="mt-4 min-h-11 rounded-md bg-destructive px-4 font-semibold text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Coba lagi</button></section></main>;
}
