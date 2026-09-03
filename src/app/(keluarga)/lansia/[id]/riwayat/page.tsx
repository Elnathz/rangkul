"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { AttentionBadge } from "@/components/keluarga/riwayat/AttentionBadge";
import { HealthTrendChart } from "@/components/keluarga/riwayat/HealthTrendChart";
import { RiwayatState } from "@/components/keluarga/riwayat/RiwayatState";
import { RiwayatTimeline, type RiwayatTimelineItem } from "@/components/keluarga/riwayat/RiwayatTimeline";
import type { RiwayatIndicatorTrend, RiwayatTrend } from "@/lib/riwayat-rangkul";

type HistoryResponse = {
  lansia: { id: string; nama: string };
  timeline: RiwayatTimelineItem[];
  tren: RiwayatIndicatorTrend[];
  ringkasan: RiwayatTrend;
  perlu_perhatian: boolean;
  disclaimer: string;
};

type FailureState =
  | { kind: "not_found" }
  | { kind: "error"; message: string };

export default function RiwayatRangkulPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [failure, setFailure] = useState<FailureState | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setFailure(null);
    setData(null);
    setRetryCount((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadRiwayat() {
      try {
        const response = await fetch(`/api/lansia/${id}/riwayat`, { signal: controller.signal, cache: "no-store" });
        const body = await response.json().catch(() => null) as { data?: HistoryResponse; message?: string } | null;
        if (response.status === 403 || response.status === 404) {
          setFailure({ kind: "not_found" });
          return;
        }
        if (!response.ok || !body?.data) throw new Error(body?.message || "Periksa koneksi lalu coba lagi.");
        setData(body.data);
        setFailure(null);
      } catch (reason: unknown) {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setFailure({
          kind: "error",
          message: reason instanceof Error ? reason.message : "Periksa koneksi lalu coba lagi.",
        });
      }
    }

    void loadRiwayat();
    return () => controller.abort();
  }, [id, retryCount]);

  if (failure?.kind === "not_found") return <RiwayatState kind="not_found" />;
  if (failure?.kind === "error") return <RiwayatState kind="error" message={failure.message} onRetry={retry} />;
  if (!data) return <RiwayatState kind="loading" />;

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-7">
        <Link href={`/lansia/${id}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-[#0D47A1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke profil lansia
        </Link>

        <header className="rounded-2xl bg-[#0D47A1] p-5 text-white shadow-[0_12px_30px_rgba(13,71,161,0.18)] sm:p-7">
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Riwayat kunjungan {data.lansia.nama}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100 sm:text-base">Lihat Cerita Hari Ini dan perubahan lima indikator dari laporan kunjungan yang sudah selesai.</p>
        </header>

        {data.perlu_perhatian && <AttentionBadge reason={data.ringkasan.alasan} />}

        {data.timeline.length === 0 ? (
          <RiwayatState kind="empty" />
        ) : (
          <>
            <HealthTrendChart trends={data.tren} />
            <RiwayatTimeline timeline={data.timeline} />
          </>
        )}

        <aside className="flex items-start gap-3 rounded-2xl bg-slate-900 p-4 text-slate-100 sm:p-5" aria-label="Batas penggunaan Riwayat Rangkul">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />
          <p className="text-sm leading-relaxed">{data.disclaimer} Bila ada kekhawatiran, gunakan informasi ini sebagai bahan percakapan dengan lansia dan tenaga kesehatan yang berwenang.</p>
        </aside>
      </div>
    </main>
  );
}
