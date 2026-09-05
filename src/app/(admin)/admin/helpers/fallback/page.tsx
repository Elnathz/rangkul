"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MapPin, ShieldCheck } from "lucide-react";

type PendingHelper = { id: string; wilayah_domisili: string; user?: { full_name: string } | null };

export default function AdminHelperFallbackPage() {
  const [helpers, setHelpers] = useState<PendingHelper[]>([]);
  const [selected, setSelected] = useState<PendingHelper | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/helpers?status=pending_verification&page=1&pageSize=100", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Kandidat fallback gagal dimuat");
      setHelpers(body.data ?? []);
      setMessage("");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Kandidat fallback gagal dimuat");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  async function assign() {
    if (!selected || reason.trim().length < 10) return;
    setSaving(true);
    const response = await fetch(`/api/admin/helpers/${selected.id}/assign-fallback`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
    const body = await response.json();
    if (!response.ok) setMessage(body.message || "Fallback belum dapat ditetapkan");
    else {
      setMessage("Fallback Admin berhasil ditetapkan dan tercatat di audit.");
      setSelected(null);
      setReason("");
      await load();
    }
    setSaving(false);
  }

  return <main className="mx-auto max-w-5xl space-y-5"><header><h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Fallback verifikasi Helper</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Fallback hanya untuk wilayah tanpa Koordinator RT verified dan tanpa Koordinator RW verified. Database memeriksa wilayah canonical sebelum assignment.</p></header>{message && <div role="status" className="rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-900">{message}</div>}<section className="rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">{loading ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600"><Loader2 className="h-5 w-5 animate-spin" />Memuat kandidat</div> : helpers.length === 0 ? <div className="p-12 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-bold text-slate-900">Tidak ada kandidat fallback.</p></div> : <div className="divide-y divide-slate-100">{helpers.map((helper) => <article key={helper.id} className="p-4 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-950">{helper.user?.full_name || "Helper Rangkul"}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4 text-blue-700" />{helper.wilayah_domisili}</p></div><button type="button" onClick={() => { setSelected(helper); setReason(""); }} className="min-h-11 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white">Periksa fallback</button></div>{selected?.id === helper.id && <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-700">Jika Koordinator tersedia, server akan menolak permintaan ini dengan conflict.</p><label className="mt-3 block text-sm font-bold text-slate-800">Alasan assignment<textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} maxLength={500} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-base font-normal" /></label><div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setSelected(null)} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Batal</button><button type="button" onClick={() => void assign()} disabled={saving || reason.trim().length < 10} className="min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white disabled:opacity-40">{saving ? "Memeriksa..." : "Tetapkan fallback"}</button></div></div>}</article>)}</div>}</section></main>;
}
