import type { RiwayatIndicatorTrend } from "@/lib/riwayat-rangkul";

const INDICATOR_LABELS: Record<RiwayatIndicatorTrend["indikator"], string> = {
  energi: "Energi",
  mobilitas: "Mobilitas",
  mood: "Suasana hati",
  nafsu_makan: "Nafsu makan",
  kualitas_tidur: "Kualitas tidur",
};

const LINE_STYLES = ["", "7 4", "2 4", "10 3 2 3", "4 2"];

function pointPosition(index: number, count: number, value: number) {
  const x = count <= 1 ? 50 : 8 + (index / (count - 1)) * 84;
  const y = 92 - ((value - 1) / 4) * 80;
  return { x, y };
}

export function HealthTrendChart({ trends }: { trends: RiwayatIndicatorTrend[] }) {
  return (
    <section aria-labelledby="health-trend-title">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 id="health-trend-title" className="text-xl font-black text-slate-950">Tren lima indikator</h2><p className="mt-1 text-sm text-slate-600">Skala 1 sampai 5 dari laporan setiap kunjungan.</p></div>
        <p className="text-xs font-semibold text-slate-500">Garis dan ringkasan teks menunjukkan arah yang sama.</p>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {trends.map((trend, trendIndex) => {
          const positions = trend.points.map((point, index) => pointPosition(index, trend.points.length, point.nilai));
          const polyline = positions.map(({ x, y }) => `${x},${y}`).join(" ");
          const titleId = `trend-${trend.indikator}`;
          return (
            <figure key={trend.indikator} className="min-w-0 rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-5" aria-labelledby={titleId}>
              <figcaption id={titleId} className="flex flex-wrap items-center justify-between gap-2"><span className="font-bold text-slate-950">{INDICATOR_LABELS[trend.indikator]}</span><span className="text-xs font-semibold text-slate-500">1 rendah, 5 tinggi</span></figcaption>
              {trend.points.length > 1 ? (
                <svg viewBox="0 0 100 104" className="mt-4 h-40 w-full overflow-visible" role="img" aria-label={`${INDICATOR_LABELS[trend.indikator]}. ${trend.ringkasan || "Belum ada ringkasan."}`}>
                  {[1, 2, 3, 4, 5].map((value) => {
                    const y = pointPosition(0, 1, value).y;
                    return <g key={value}><line x1="8" x2="92" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="0.6" /><text x="1" y={y + 1.5} fontSize="4" fill="#475569">{value}</text></g>;
                  })}
                  <polyline points={polyline} fill="none" stroke="#0D47A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={LINE_STYLES[trendIndex]} />
                  {positions.map(({ x, y }, index) => <circle key={`${trend.points[index]?.tanggal}-${trend.points[index]?.nilai}`} cx={x} cy={y} r="2.5" fill="white" stroke="#0D47A1" strokeWidth="1.5" />)}
                </svg>
              ) : <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Belum cukup data untuk menggambar tren.</p>}
              <p className="mt-3 text-sm font-semibold text-slate-700">{trend.ringkasan || "Belum cukup data untuk melihat perubahan."}</p>
              <ol className="mt-3 grid gap-2 text-xs text-slate-600" aria-label={`Nilai ${INDICATOR_LABELS[trend.indikator]} per kunjungan`}>
                {trend.points.map((point) => <li key={`${point.tanggal}-${point.nilai}`} className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2"><time dateTime={point.tanggal}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(point.tanggal))}</time><strong className="tabular-nums text-slate-900">{point.nilai}/5</strong></li>)}
              </ol>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
