"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, FileText, Loader2, X } from "lucide-react";

type Appeal = {
  id: string;
  alasan: string;
  status: "menunggu" | "disetujui" | "ditolak";
  review_reason: string | null;
  direview_at: string | null;
  created_at: string;
  user?: { full_name: string; email: string; account_status: string } | null;
  reviewer?: { full_name: string } | null;
};

export default function AdminBandingPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [selected, setSelected] = useState<Appeal | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/appeals", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Banding gagal dimuat");
      setAppeals(body.data ?? []);
      setError("");
    } catch (value: unknown) {
      setError(value instanceof Error ? value.message : "Banding gagal dimuat");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  async function review(status: "disetujui" | "ditolak") {
    if (!selected || reason.trim().length < 10) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/appeals/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, alasan: reason }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Keputusan gagal disimpan");
      setSelected(null);
      setReason("");
      setNotice("Keputusan banding dan perubahan status akun tersimpan dalam satu transaksi.");
      await load();
    } catch (value: unknown) {
      setError(value instanceof Error ? value.message : "Keputusan gagal disimpan");
    } finally {
      setSaving(false);
    }
  }

  return <main className="mx-auto max-w-5xl space-y-5"><header><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Banding Keluarga</h1><p className="mt-1 text-sm leading-6 text-slate-600">Satu banding menunggu per akun. Keputusan kedua pada row yang sama akan ditolak sebagai conflict.</p></header>{notice && <div role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{notice}</div>}{error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">{error}</div>}<section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">{loading ? <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-slate-600"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />Memuat banding</div> : appeals.length === 0 ? <div className="px-4 py-16 text-center"><FileText className="mx-auto h-9 w-9 text-slate-400" /><p className="mt-3 font-semibold text-slate-800">Belum ada banding.</p></div> : <div className="divide-y divide-slate-100">{appeals.map((appeal) => <article key={appeal.id} className="space-y-4 p-4 sm:p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-bold text-slate-950">{appeal.user?.full_name || "Pengguna"}</p><p className="text-xs text-slate-500">{appeal.user?.email || "Email tidak tersedia"} · {new Date(appeal.created_at).toLocaleString("id-ID")}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${appeal.status === "menunggu" ? "bg-amber-50 text-amber-800" : appeal.status === "disetujui" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{appeal.status === "menunggu" ? "Menunggu review" : appeal.status === "disetujui" ? "Disetujui" : "Ditolak"}</span></div><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{appeal.alasan}</p>{appeal.review_reason && <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-950"><p className="font-bold">Alasan keputusan</p><p className="mt-1 leading-relaxed">{appeal.review_reason}</p><p className="mt-2 text-xs font-semibold text-blue-800">{appeal.reviewer?.full_name || "Admin"}{appeal.direview_at ? ` · ${new Date(appeal.direview_at).toLocaleString("id-ID")}` : ""}</p></div>}{appeal.status === "menunggu" && <button type="button" onClick={() => { setSelected(appeal); setReason(""); }} className="inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-bold text-white">Tinjau banding</button>}</article>)}</div>}</section>{selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"><section role="dialog" aria-modal="true" aria-labelledby="review-title" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 id="review-title" className="text-lg font-bold text-slate-950">Keputusan banding</h2><p className="mt-1 text-sm text-slate-600">Alasan minimal 10 karakter wajib untuk audit.</p></div><button type="button" onClick={() => setSelected(null)} className="flex h-11 w-11 items-center justify-center rounded-lg" aria-label="Tutup dialog"><X className="h-5 w-5" /></button></div><label className="mt-5 block text-sm font-bold text-slate-800">Alasan keputusan<textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} maxLength={2000} rows={5} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" /></label><div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => void review("ditolak")} disabled={saving || reason.trim().length < 10} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-800 disabled:opacity-40"><X className="h-4 w-4" />Tolak</button><button type="button" onClick={() => void review("disetujui")} disabled={saving || reason.trim().length < 10} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-40"><Check className="h-4 w-4" />Setujui</button></div></section></div>}</main>;
}
