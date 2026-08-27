"use client";

/* The page loads remote appeal state on mount and mirrors that response into local state. */
/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Clock3, FileText, Loader2, Send } from "lucide-react";

type Appeal = { id: string; alasan: string; status: "menunggu" | "disetujui" | "ditolak"; direview_at: string | null; created_at: string };

const statusCopy = { menunggu: "Menunggu review Admin", disetujui: "Banding disetujui", ditolak: "Banding ditolak" } as const;

export default function FamilyAppealPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [accountStatus, setAccountStatus] = useState("active");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await fetch("/api/appeals", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Riwayat banding gagal dimuat");
      setAppeals(body.data ?? []);
      setAccountStatus(body.account_status ?? "active");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Riwayat banding gagal dimuat");
    } finally {
      setLoading(false);
    }
  };

  // Loader mengambil data dari API eksternal sebelum mengisi state halaman.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/appeals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alasan: reason }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Banding belum dapat dikirim");
      setReason("");
      setMessage(body.message ?? "Banding berhasil dikirim ke Admin");
      await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Banding belum dapat dikirim");
    } finally {
      setSaving(false);
    }
  };

  const hasPending = appeals.some((appeal) => appeal.status === "menunggu");

  return <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 sm:px-6"><div className="mx-auto max-w-3xl space-y-6"><header><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Pemulihan akun</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Ajukan banding</h1><p className="mt-2 text-sm leading-6 text-slate-600">Jelaskan kondisi sebenarnya agar Admin dapat meninjau pembatasan akun dengan konteks yang cukup.</p></header>{message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" role="status">{message}</div>}{error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{error}</div>}<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /><div><p className="font-bold text-slate-950">Status akun: <span className="capitalize">{accountStatus}</span></p><p className="mt-1 text-sm text-slate-500">Banding digunakan untuk meminta pemulihan setelah akun dibatasi karena pembatalan berulang.</p></div></div><form onSubmit={submit} className="mt-5 space-y-3"><label htmlFor="alasan-banding" className="text-sm font-bold text-slate-800">Alasan banding</label><textarea id="alasan-banding" value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} maxLength={2000} rows={6} required className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" placeholder="Tuliskan kronologi dan alasan pemulihan akun." /><button type="submit" disabled={saving || loading || hasPending} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50 sm:w-auto">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {hasPending ? "Menunggu review Admin" : "Kirim banding"}</button></form></section><section className="space-y-3"><h2 className="text-lg font-black text-slate-950">Riwayat pengajuan</h2>{loading ? <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-12"><Loader2 className="h-5 w-5 animate-spin text-blue-700" /></div> : appeals.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Belum ada pengajuan banding.</div> : appeals.map((appeal) => <article key={appeal.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-slate-500">{new Date(appeal.created_at).toLocaleString("id-ID")}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{appeal.alasan}</p></div><span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{appeal.status === "menunggu" ? <Clock3 className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{statusCopy[appeal.status]}</span><span className="sm:hidden">{appeal.status}</span></span></div></article>)}</section></div></main>;
}
