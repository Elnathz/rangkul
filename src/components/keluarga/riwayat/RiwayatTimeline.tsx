"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpenText, ImageOff } from "lucide-react";
import type { HealthSnapshotScore } from "@/lib/riwayat-rangkul";

export type RiwayatTimelineItem = {
  task_id: string;
  selesai_at: string;
  foto_bukti_url: string | null;
  catatan_kondisi: string | null;
  cerita_hari_ini: string | null;
  scores: HealthSnapshotScore | null;
};

const SCORE_LABELS: Array<[keyof HealthSnapshotScore, string]> = [
  ["energi", "Energi"],
  ["mobilitas", "Mobilitas"],
  ["mood", "Suasana hati"],
  ["nafsu_makan", "Nafsu makan"],
  ["kualitas_tidur", "Kualitas tidur"],
];

export function RiwayatTimeline({ timeline }: { timeline: RiwayatTimelineItem[] }) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section aria-labelledby="timeline-title">
      <h2 id="timeline-title" className="text-xl font-black text-slate-950">Timeline kunjungan</h2>
      <p className="mt-1 text-sm text-slate-600">Urutan dari kunjungan paling lama ke paling baru.</p>
      <ol className="mt-5 space-y-4">
        {timeline.map((visit, index) => (
          <li key={visit.task_id} className="relative rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Kunjungan {index + 1}</span>
              <time dateTime={visit.selesai_at} className="text-xs font-semibold text-slate-500">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(visit.selesai_at))}</time>
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-[180px_1fr]">
              {visit.foto_bukti_url && !failedImages[visit.task_id] ? (
                <Image
                  src={visit.foto_bukti_url}
                  alt={`Bukti kunjungan ${index + 1}`}
                  width={720}
                  height={480}
                  sizes="(min-width: 768px) 180px, calc(100vw - 64px)"
                  unoptimized
                  onError={() => setFailedImages((current) => ({ ...current, [visit.task_id]: true }))}
                  className="h-40 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-40 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-center text-xs font-semibold text-slate-500"><ImageOff className="h-5 w-5" aria-hidden="true" />Foto bukti tidak tersedia</div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900">Catatan kondisi</h3>
                <p className="mt-1 break-words text-sm leading-relaxed text-slate-600">{visit.catatan_kondisi || "Tidak ada catatan kondisi."}</p>
                {visit.scores && <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">{SCORE_LABELS.map(([key, label]) => <div key={key} className="rounded-xl bg-slate-50 p-2.5"><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 font-black tabular-nums text-slate-900">{visit.scores?.[key]}/5</dd></div>)}</dl>}
                <div className="mt-4 rounded-xl bg-blue-50 p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-blue-950"><BookOpenText className="h-4 w-4" aria-hidden="true" />Cerita Hari Ini</h3><p className="mt-2 break-words text-sm leading-relaxed text-blue-950">{visit.cerita_hari_ini || "Belum ada cerita dari kunjungan ini."}</p></div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
