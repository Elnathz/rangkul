"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Loader2, MapPin, Search, ShieldCheck, UserRound, X } from "lucide-react";

type Helper = {
  id: string;
  wilayah_domisili: string;
  radius_layanan_km: number;
  verified_by_admin_fallback: boolean;
  status: string;
  tingkat_kepercayaan: string;
  suspend_reason: string | null;
  total_tugas_selesai: number;
  user?: { full_name: string; email: string } | null;
};

type ActionKind = "suspend" | "restore" | "fallback";
type ActionState = { helper: Helper; kind: ActionKind };

const filters = [
  ["all", "Semua"],
  ["pending_verification", "Menunggu"],
  ["verified", "Terverifikasi"],
  ["under_review", "Dalam review"],
  ["suspended", "Ditangguhkan"],
] as const;

export default function AdminHelpersPage() {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [action, setAction] = useState<ActionState | null>(null);
  const [reason, setReason] = useState("");

  const loadHelpers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", pageSize: "100" });
      if (status !== "all") params.set("status", status);
      if (search.trim()) params.set("q", search.trim());
      const response = await fetch(`/api/admin/helpers?${params}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Data Helper gagal dimuat");
      setHelpers(payload.data ?? []);
      setError("");
    } catch (value: unknown) {
      setError(value instanceof Error ? value.message : "Data Helper gagal dimuat");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadHelpers(), 250);
    return () => window.clearTimeout(timer);
  }, [loadHelpers]);

  function openAction(helper: Helper, kind: ActionKind) {
    setAction({ helper, kind });
    setReason("");
    setError("");
  }

  async function submitAction(event: FormEvent) {
    event.preventDefault();
    if (!action || reason.trim().length < 10) return;
    setSaving(true);
    setError("");
    const fallback = action.kind === "fallback";
    const endpoint = fallback
      ? `/api/admin/helpers/${action.helper.id}/assign-fallback`
      : `/api/admin/helpers/${action.helper.id}/suspend`;
    const body = fallback ? { reason } : { decision: action.kind, reason };
    try {
      const response = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Keputusan Helper gagal disimpan");
      setNotice(action.kind === "fallback" ? "Fallback Admin berhasil ditetapkan." : action.kind === "suspend" ? "Helper berhasil ditangguhkan." : "Helper berhasil dipulihkan ke probation.");
      setAction(null);
      setReason("");
      await loadHelpers();
    } catch (value: unknown) {
      setError(value instanceof Error ? value.message : "Keputusan Helper gagal disimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-5">
      <header><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Pengawasan Helper</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Status sensitif hanya berubah lewat keputusan beralasan dengan state guard dan audit.</p></header>
      {notice && <div role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"><Check className="h-4 w-4" aria-hidden="true" />{notice}<button type="button" onClick={() => setNotice("")} className="ml-auto flex h-11 w-11 items-center justify-center" aria-label="Tutup pemberitahuan"><X className="h-4 w-4" /></button></div>}
      {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">{error}</div>}

      <section className="space-y-3 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-4">
        <div className="flex gap-1 overflow-x-auto pb-1" aria-label="Filter status Helper">{filters.map(([value, label]) => <button key={value} type="button" onClick={() => setStatus(value)} className={`min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold ${status === value ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-blue-50"}`}>{label}</button>)}</div>
        <label className="relative block"><span className="sr-only">Cari wilayah Helper</span><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari wilayah Helper" className="min-h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" /></label>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        {loading ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />Memuat Helper</div> : helpers.length === 0 ? <div className="py-16 text-center"><UserRound className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-800">Tidak ada Helper pada filter ini.</p></div> : <div className="divide-y divide-slate-100">{helpers.map((helper) => <HelperRow key={helper.id} helper={helper} onAction={openAction} />)}</div>}
      </section>

      {action && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"><section role="dialog" aria-modal="true" aria-labelledby="helper-decision-title" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 id="helper-decision-title" className="text-lg font-bold text-slate-950">{action.kind === "fallback" ? "Tetapkan fallback Admin" : action.kind === "suspend" ? "Tangguhkan Helper" : "Pulihkan Helper"}</h2><p className="mt-1 text-sm text-slate-600">{action.helper.user?.full_name || "Helper Rangkul"}. Alasan minimal 10 karakter akan dicatat di audit.</p></div><button type="button" onClick={() => setAction(null)} className="flex h-11 w-11 items-center justify-center rounded-lg" aria-label="Tutup dialog"><X className="h-5 w-5" /></button></div>{action.kind === "fallback" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Database akan menolak fallback jika Koordinator RT atau RW verified tersedia di wilayah Helper.</p>}<form onSubmit={submitAction} className="mt-4 space-y-4"><label className="block text-sm font-bold text-slate-800">Alasan keputusan<textarea required minLength={10} maxLength={500} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" /></label><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setAction(null)} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Batal</button><button type="submit" disabled={saving || reason.trim().length < 10} className={`min-h-11 rounded-lg px-4 text-sm font-bold text-white disabled:opacity-40 ${action.kind === "suspend" ? "bg-red-700" : "bg-blue-700"}`}>{saving ? "Menyimpan..." : "Konfirmasi keputusan"}</button></div></form></section></div>}
    </main>
  );
}

function HelperRow({ helper, onAction }: { helper: Helper; onAction: (helper: Helper, kind: ActionKind) => void }) {
  return <article className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:items-center"><div className="min-w-0"><p className="truncate font-bold text-slate-950">{helper.user?.full_name || "Profil tanpa nama"}</p><p className="truncate text-xs text-slate-500">{helper.user?.email || helper.id}</p><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4 text-blue-700" aria-hidden="true" />{helper.wilayah_domisili} · {helper.radius_layanan_km} km</p></div><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-slate-100 px-3 py-1 capitalize text-slate-700">{helper.status.replace("_", " ")}</span><span className="rounded-full bg-blue-50 px-3 py-1 capitalize text-blue-800">{helper.tingkat_kepercayaan}</span>{helper.verified_by_admin_fallback && <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-800">Fallback Admin</span>}<span className="px-1 py-1 text-slate-500">{helper.total_tugas_selesai} tugas</span></div><div className="flex flex-wrap gap-2 lg:justify-end">{helper.status === "pending_verification" && <button type="button" onClick={() => onAction(helper, "fallback")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-blue-200 px-3 text-xs font-bold text-blue-800"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Fallback</button>}{helper.status === "verified" && <button type="button" onClick={() => onAction(helper, "suspend")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-800"><AlertTriangle className="h-4 w-4" aria-hidden="true" />Tangguhkan</button>}{helper.status === "suspended" && <button type="button" onClick={() => onAction(helper, "restore")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-200 px-3 text-xs font-bold text-emerald-800"><Check className="h-4 w-4" aria-hidden="true" />Pulihkan</button>}{helper.status === "under_review" && <Link href="/admin/reports" className="inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-3 text-xs font-bold text-white">Tinjau laporan</Link>}</div></article>;
}
