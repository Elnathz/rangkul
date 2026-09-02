import { ShieldAlert } from "lucide-react";

export function AttentionBadge({ reason }: { reason: string | null }) {
  return (
    <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:p-5" role="status" aria-label="Pola kunjungan perlu diperhatikan">
      <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" aria-hidden="true" />
      <div>
        <h2 className="font-bold">Perlu diperhatikan bersama</h2>
        <p className="mt-1 text-sm leading-relaxed">{reason || "Rata-rata lima indikator menurun ketat pada tiga kunjungan terbaru."}</p>
        <p className="mt-2 text-xs leading-relaxed text-amber-900">Perhatikan catatan kunjungan berikutnya dan bicarakan dengan lansia. Badge ini menunjukkan pola data, bukan diagnosis atau alarm medis.</p>
      </div>
    </section>
  );
}
