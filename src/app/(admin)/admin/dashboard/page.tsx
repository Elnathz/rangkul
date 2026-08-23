"use client";

import Link from "next/link";
import { Activity, AlertTriangle, ClipboardList, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLoadingRows, formatDate, formatRupiah } from "@/components/admin/AdminPrimitives";

type DashboardData = {
  counts: { users: number; activeUsers: number; helpers: number; verifiedHelpers: number; tasks: number; pendingReports: number };
  taskBreakdown: Record<string, number>;
  gmv: number;
  recentAuditLogs: Array<{ id: string; action: string; entity_type: string; entity_id: string | null; created_at: string; actor?: { full_name?: string | null } | null }>;
};

const cards = [
  { key: "users", label: "Total pengguna", icon: Users, tone: "blue" },
  { key: "activeUsers", label: "Akun aktif", icon: Activity, tone: "emerald" },
  { key: "verifiedHelpers", label: "Helper terverifikasi", icon: ShieldCheck, tone: "violet" },
  { key: "pendingReports", label: "Laporan menunggu", icon: AlertTriangle, tone: "amber" },
] as const;

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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Operasional hari ini</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Dashboard Admin</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Pantau akun, layanan, dan aktivitas yang benar-benar tercatat di platform.</p>
        </div>
        <Link href="/admin/audit-logs" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">Buka audit log</Link>
      </header>

      {!data ? <AdminLoadingRows columns={4} /> : <>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan platform">
          {cards.map(({ key, label, icon: Icon, tone }) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "emerald" ? "bg-emerald-50 text-emerald-700" : tone === "violet" ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-700"}`}><Icon className="h-5 w-5" /></div>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">{data.counts[key].toLocaleString("id-ID")}</p>
          </div>)}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6"><div><h2 className="font-bold text-slate-950">Aktivitas sensitif terbaru</h2><p className="mt-1 text-xs text-slate-500">Audit log dari aksi Admin dan sistem.</p></div><ClipboardList className="h-5 w-5 text-slate-400" /></div>
            {data.recentAuditLogs.length === 0 ? <div className="px-4 py-12 text-center text-sm text-slate-500">Belum ada aktivitas yang tercatat.</div> : <div className="divide-y divide-slate-100">{data.recentAuditLogs.map((log) => <div key={log.id} className="flex gap-3 px-4 py-4 sm:px-6"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{log.action.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-slate-500">{log.entity_type} · {log.entity_id ?? "tanpa ID"} · oleh {log.actor?.full_name ?? "sistem"}</p><p className="mt-1 text-[11px] text-slate-400">{formatDate(log.created_at)}</p></div></div>)}</div>}
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Transaksi selesai</p><p className="mt-2 text-3xl font-bold tabular-nums text-slate-950">{formatRupiah(data.gmv)}</p><p className="mt-1 text-sm text-slate-600">GMV dari task berstatus selesai.</p></div><Activity className="h-5 w-5 text-blue-700" /></div><div className="mt-8 border-t border-blue-200/70 pt-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Status task</p><div className="mt-3 space-y-2">{Object.entries(data.taskBreakdown).length === 0 ? <p className="text-sm text-slate-500">Belum ada task.</p> : Object.entries(data.taskBreakdown).map(([status, count]) => <div key={status} className="flex items-center justify-between text-sm"><span className="text-slate-600">{status.replaceAll("_", " ")}</span><span className="font-bold tabular-nums text-slate-950">{count}</span></div>)}</div></div></div>
        </section>
      </>}
    </div>
  );
}

function AdminError({ message }: { message: string }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800"><p className="font-bold">Dashboard gagal dimuat</p><p className="mt-1">{message}</p><button type="button" onClick={() => location.reload()} className="mt-4 min-h-11 rounded-lg bg-red-700 px-4 font-semibold text-white">Coba lagi</button></div>;
}
