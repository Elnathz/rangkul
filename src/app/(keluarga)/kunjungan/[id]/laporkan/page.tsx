"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const categories = ["Tidak Datang Tanpa Kabar", "Datang Terlambat Signifikan", "Sikap atau Perilaku Buruk", "Pekerjaan Tidak Sesuai", "Keamanan atau Darurat", "Lainnya"];

export default function LaporHelperPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!category || description.trim().length < 10) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task_id: id, alasan: `${category}: ${description.trim()}` }) });
      const body = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(body?.message || "Laporan belum dapat dikirim");
      setSuccess(true);
    } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "Laporan belum dapat dikirim"); }
    finally { setSubmitting(false); }
  };

  if (success) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-[#0D47A1]"><AlertTriangle className="h-12 w-12" /></div><h1 className="mb-2 text-3xl font-black text-slate-900">Laporan Diterima</h1><p className="mb-8 font-medium text-slate-500">Laporan sudah tersimpan dan akan ditinjau. Laporan memulai proses review, bukan berarti Helper langsung dinyatakan bersalah.</p><div className="mb-8 flex gap-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-left text-sm font-medium text-yellow-800"><Info className="h-5 w-5 shrink-0" />Jika ini kondisi darurat, gunakan SOS atau hubungi layanan darurat.</div><Button onClick={() => router.push(`/kunjungan/${id}`)} className="h-14 w-full rounded-xl bg-brand-gradient font-bold text-white">Kembali ke Detail Kunjungan</Button></div>;

  return <div className="mx-auto max-w-2xl px-4 py-8"><Link href={`/kunjungan/${id}`} className="mb-8 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft className="mr-2 h-4 w-4" />Batal dan Kembali</Link><div className="mb-8"><h1 className="mb-2 text-3xl font-black tracking-tight text-red-600">Laporkan Helper</h1><p className="font-medium text-slate-500">Jelaskan kejadian secara faktual. Laporan akan ditinjau oleh Koordinator atau Admin.</p></div><form onSubmit={handleSubmit} className="space-y-6"><div><label className="text-sm font-bold text-slate-900">Kategori Masalah</label><div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-xl border p-4 text-left text-sm font-medium transition ${category === item ? "border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{item}</button>)}</div></div><div><label htmlFor="report-description" className="text-sm font-bold text-slate-900">Kronologi</label><textarea id="report-description" value={description} onChange={(event) => setDescription(event.target.value)} minLength={10} required className="mt-2 h-32 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" placeholder="Jelaskan apa yang terjadi, kapan, dan dampaknya..." /></div>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" disabled={submitting || !category || description.trim().length < 10} className="h-14 w-full rounded-2xl bg-red-600 text-lg font-bold text-white">{submitting ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" />Mengirim Laporan...</> : "Kirim Laporan Resmi"}</Button><p className="text-center text-xs font-medium text-slate-400">Jangan mengirim laporan berulang atau bersifat balasan.</p></form></div>;
}
