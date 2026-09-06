"use client";

import * as React from "react";
import { BookHeart, Camera, CheckCircle2, HeartPulse } from "lucide-react";

import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";
import { getHealthScorePresentation } from "./task-detail-presentation";

type Snapshot = {
  energi: number;
  mobilitas: number;
  mood: number;
  nafsu_makan: number;
  kualitas_tidur: number;
  cerita_hari_ini: string | null;
};

const scoreTone = {
  "Perlu perhatian": "text-amber-800 bg-amber-50 border-amber-100",
  "Perlu dipantau": "text-primary bg-blue-50 border-blue-100",
  "Terpantau baik": "text-emerald-800 bg-emerald-50 border-emerald-100",
};

export function CompletionReportSection({
  helperName,
  evidence,
  snapshot,
}: {
  helperName: string | null;
  evidence: { foto_bukti_url: string | null; catatan_kondisi: string } | null;
  snapshot: Snapshot | null;
}) {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const metrics = snapshot ? [
    ["Energi", snapshot.energi],
    ["Mobilitas", snapshot.mobilitas],
    ["Mood", snapshot.mood],
    ["Nafsu makan", snapshot.nafsu_makan],
    ["Kualitas tidur", snapshot.kualitas_tidur],
  ] as const : [];

  return (
    <section className="overflow-hidden rounded-[18px] border border-emerald-200 bg-surface" aria-labelledby="completion-report-title">
      <div className="flex items-start gap-3 bg-[linear-gradient(135deg,#ecf8f0_0%,#f8fcfa_100%)] p-4 sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-700 text-white">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold text-emerald-800">Hasil kunjungan</p>
          <h2 id="completion-report-title" className="mt-1 font-display text-xl font-extrabold text-ink">Laporan dari {helperName || "Helper"}</h2>
          <p className="mt-1 text-sm text-ink-muted">Catatan dan observasi non-diagnostik dari pendampingan.</p>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-5">
        <div>
          <p className="text-xs font-bold text-ink-muted">Catatan kunjungan</p>
          <p className="mt-2 text-sm leading-7 text-ink">{evidence?.catatan_kondisi || "Helper belum menambahkan catatan kunjungan."}</p>
        </div>

        {evidence?.foto_bukti_url ? (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-xs font-bold text-ink-muted">Dokumentasi kunjungan</p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="group relative block max-h-[360px] w-full overflow-hidden rounded-[16px] border border-border bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Buka dokumentasi kunjungan"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={evidence.foto_bukti_url} alt="Dokumentasi hasil kunjungan" className="max-h-[360px] w-full object-cover transition-transform duration-200 group-hover:scale-[1.015]" />
            </button>
            <ImagePreviewModal
              open={previewOpen}
              onOpenChange={setPreviewOpen}
              src={evidence.foto_bukti_url}
              alt="Dokumentasi hasil kunjungan"
              title="Dokumentasi kunjungan"
              description="Foto ini dilampirkan Helper bersama laporan kunjungan."
            />
          </div>
        ) : null}

        {snapshot ? (
          <div className="border-t border-border pt-5">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="font-display text-base font-extrabold text-ink">Health Snapshot</h3>
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-muted">Ringkasan pengamatan harian, bukan diagnosis medis.</p>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {metrics.map(([label, value]) => {
                const metric = getHealthScorePresentation(value);
                return (
                  <div key={label} className={`flex items-center justify-between gap-3 rounded-[14px] border px-3 py-3 ${scoreTone[metric.label as keyof typeof scoreTone]}`}>
                    <dt className="text-sm font-bold">{label}</dt>
                    <dd className="text-right text-xs font-semibold"><span className="text-sm font-extrabold">{metric.score}</span><span className="ml-1">{metric.label}</span></dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ) : null}

        {snapshot?.cerita_hari_ini ? (
          <div className="rounded-[16px] border border-blue-100 bg-[linear-gradient(135deg,#eef5ff_0%,#f9fcff_100%)] p-4">
            <div className="flex items-center gap-2 text-primary">
              <BookHeart className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-display text-base font-extrabold">Memory Capsule</h3>
            </div>
            <p className="mt-2 text-sm leading-7 text-ink">{snapshot.cerita_hari_ini}</p>
          </div>
        ) : null}

      </div>
    </section>
  );
}
