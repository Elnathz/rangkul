import Link from "next/link";
import { ArrowRight, BookHeart, ChartNoAxesCombined, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

const indicators = [
  { label: "Energi", value: "Membaik", tone: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { label: "Mood", value: "Stabil", tone: "bg-blue-50 text-blue-800 border-blue-200" },
  { label: "Mobilitas", value: "Perlu diperhatikan", tone: "bg-amber-50 text-amber-900 border-amber-200" },
];

export default function RiwayatRangkulPreview() {
  return (
    <section className="border-y border-blue-100 bg-[#EAF4FF] py-14 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          <p className="text-sm font-bold text-[#0D47A1]">RIWAYAT RANGKUL</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Bukan sekadar kunjungan. Lihat perubahan dari waktu ke waktu.</h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Setelah setiap kunjungan, keluarga dapat membaca catatan kegiatan dan observasi keseharian yang tersimpan rapi pada profil lansia. Ini membantu percakapan keluarga tetap terhubung, walau berjauhan.
          </p>

          <div className="mt-7 space-y-4">
            <div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D47A1] shadow-sm" aria-hidden="true"><HeartPulse className="h-5 w-5" /></span><div><h3 className="font-bold text-foreground">Observasi yang mudah dipahami</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Energi, mobilitas, mood, nafsu makan, dan tidur dicatat sebagai observasi keseharian, bukan diagnosis medis.</p></div></div>
            <div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D47A1] shadow-sm" aria-hidden="true"><BookHeart className="h-5 w-5" /></span><div><h3 className="font-bold text-foreground">Cerita kecil yang tidak terlewat</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Memory Capsule menyimpan cerita singkat dari kunjungan untuk dibaca kembali oleh keluarga.</p></div></div>
            <div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D47A1] shadow-sm" aria-hidden="true"><ChartNoAxesCombined className="h-5 w-5" /></span><div><h3 className="font-bold text-foreground">Perubahan terlihat dalam konteks</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Keluarga dapat membandingkan catatan antar kunjungan dan menentukan tindak lanjut bersama.</p></div></div>
          </div>

          <Button asChild className="mt-8 min-h-11 rounded-xl bg-[#0D47A1] px-5 font-bold text-white hover:bg-[#083578]"><Link href="/register?role=keluarga">Mulai pantau orang tersayang <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-white p-5 shadow-[0_16px_48px_rgba(13,71,161,0.12)] sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">Contoh tampilan</p><h3 className="mt-1 text-xl font-bold text-foreground">Riwayat setelah kunjungan</h3></div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0D47A1]">Catatan terakhir</span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {indicators.map((indicator) => <div key={indicator.label} className="rounded-xl border border-border bg-surface-subtle p-3"><p className="text-xs font-semibold text-muted-foreground">{indicator.label}</p><p className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-bold ${indicator.tone}`}>{indicator.value}</p></div>)}
          </div>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-[#F0F6FF] p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">Cerita hari ini</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">“Hari ini menikmati waktu mengobrol di teras dan mengikuti aktivitas ringan sesuai kenyamanan.”</p>
          </div>

          <p className="mt-5 text-xs leading-5 text-muted-foreground">Contoh data untuk memperlihatkan bentuk Riwayat Rangkul. Catatan ini bersifat observasi keseharian, bukan diagnosis atau rekomendasi medis.</p>
        </div>
      </div>
    </section>
  );
}
