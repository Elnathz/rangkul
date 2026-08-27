"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowDownRight, CalendarDays, HeartPulse, Loader2, ShieldAlert } from "lucide-react";

type Snapshot = { energi: number; mobilitas: number; mood: number; nafsu_makan: number; kualitas_tidur: number; cerita_hari_ini: string | null };
type Visit = { task_id: string; waktu: string; foto_bukti_url: string | null; catatan_kondisi: string | null; health_snapshot: Snapshot | null };
type IndicatorTrend = { indikator: "energi" | "mobilitas" | "mood" | "nafsu_makan" | "kualitas_tidur"; points: Array<{ tanggal: string; nilai: number }>; ringkasan: string | null };
type HistoryResponse = { lansia: { nama: string }; kunjungan: Visit[]; trends?: IndicatorTrend[]; tren: { rata_rata_terakhir: number | null; perubahan: number | null; perlu_perhatian: boolean }; disclaimer: string };

const snapshotLabels: Array<keyof Snapshot> = ["energi", "mobilitas", "mood", "nafsu_makan", "kualitas_tidur"];

export default function RiwayatRangkulPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/lansia/${id}/riwayat`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || "Riwayat tidak dapat dimuat");
        if (active) setData(body);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Riwayat tidak dapat dimuat");
      });
    return () => { active = false; };
  }, [id]);

  if (error) return <div className="mx-auto max-w-3xl p-6"><div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800" role="alert"><AlertCircle className="mb-2 h-5 w-5" />{error}</div></div>;
  if (!data) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#0D47A1]" aria-label="Memuat riwayat" /></div>;

  return <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 sm:px-6"><div className="mx-auto max-w-4xl space-y-6"><header className="rounded-3xl bg-gradient-to-br from-[#0D47A1] to-[#1976D2] p-6 text-white shadow-lg"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Riwayat Rangkul</p><h1 className="mt-2 text-3xl font-black">Catatan kunjungan {data.lansia.nama}</h1><p className="mt-2 text-sm text-blue-100">Pantau perubahan kondisi dari laporan kunjungan yang sudah selesai.</p></header>{data.tren.perlu_perhatian && <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950" role="status"><ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" /><div><p className="font-bold">Perlu perhatian</p><p className="mt-1 text-sm">Rata-rata indikator menurun pada tiga kunjungan berturut-turut. Catatan ini bukan diagnosis medis.</p></div></div>}<section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-100 bg-white p-5"><HeartPulse className="h-5 w-5 text-[#0D47A1]" /><p className="mt-3 text-xs font-bold uppercase text-slate-400">Rata-rata terakhir</p><p className="mt-1 text-3xl font-black text-slate-900">{data.tren.rata_rata_terakhir ?? "-"}</p></div><div className="rounded-2xl border border-slate-100 bg-white p-5"><ArrowDownRight className="h-5 w-5 text-amber-600" /><p className="mt-3 text-xs font-bold uppercase text-slate-400">Perubahan</p><p className="mt-1 text-3xl font-black text-slate-900">{data.tren.perubahan ?? "-"}</p></div><div className="rounded-2xl border border-slate-100 bg-white p-5"><CalendarDays className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-xs font-bold uppercase text-slate-400">Kunjungan selesai</p><p className="mt-1 text-3xl font-black text-slate-900">{data.kunjungan.length}</p></div></section><section className="grid gap-4 sm:grid-cols-2" aria-label="Tren Health Snapshot">{(data.trends ?? []).map((trend) => <article key={trend.indikator} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="font-bold capitalize text-slate-950">{trend.indikator.replace("_", " ")}</h2><span className="text-xs font-semibold text-slate-500">1 sampai 5</span></div><div className="mt-4 flex h-28 items-end gap-2 border-b border-l border-slate-200 px-2 pb-1">{trend.points.length === 0 ? <p className="mb-3 text-xs text-slate-400">Belum ada data</p> : trend.points.map((point) => <div key={`${point.tanggal}-${point.nilai}`} className="flex h-full flex-1 items-end" title={`${point.nilai}/5`}><div className="w-full rounded-t-md bg-blue-600" style={{ height: `${point.nilai * 20}%` }} /></div>)}</div><p className="mt-3 text-xs text-slate-600">{trend.ringkasan ?? "Belum cukup data untuk melihat perubahan."}</p></article>)}</section><section className="space-y-4">{data.kunjungan.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Belum ada kunjungan selesai.</div>}{data.kunjungan.map((visit) => <article key={visit.task_id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{new Date(visit.waktu).toLocaleString("id-ID")}</p><div className="mt-4 grid gap-5 md:grid-cols-[160px_1fr]">{visit.foto_bukti_url ? <img src={visit.foto_bukti_url} alt="Bukti kunjungan" className="h-32 w-full rounded-xl object-cover" /> : <div className="flex h-32 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">Tidak ada foto</div>}<div><p className="font-bold text-slate-900">Catatan kondisi</p><p className="mt-1 text-sm text-slate-600">{visit.catatan_kondisi || "Tidak ada catatan."}</p>{visit.health_snapshot && <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-5">{snapshotLabels.map((label) => <div key={label} className="rounded-lg bg-slate-50 p-2"><span className="block text-[10px] uppercase text-slate-400">{label.replace("_", " ")}</span><b className="text-slate-900">{visit.health_snapshot?.[label]}/5</b></div>)}</div>}{visit.health_snapshot?.cerita_hari_ini && <p className="mt-4 text-sm italic text-slate-600">&quot;{visit.health_snapshot.cerita_hari_ini}&quot;</p>}</div></div></article>)}</section><p className="text-center text-xs text-slate-500">{data.disclaimer}</p></div></main>;
}
