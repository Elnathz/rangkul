import Link from "next/link";
import { ArrowRight, Activity, HeartHandshake, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const indicators = [
  { name: "Energi", score: "4/5", trend: "+1", status: "Membaik", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { name: "Mood", score: "5/5", trend: "0", status: "Stabil", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { name: "Mobilitas", score: "3/5", trend: "-1", status: "Perlu dampingan", color: "text-amber-700 bg-amber-50 border-amber-200" },
];

export default function RiwayatRangkulPreview() {
  return (
    <section className="py-20 sm:py-24 bg-[#F5F8FC] border-y border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Emotional differentiation */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D47A1]/08 border border-[#0D47A1]/15 text-[#0D47A1] text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diferensiasi Layanan Rangkul</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-foreground leading-[1.15] tracking-tight mb-5">
              Bukan Sekadar Kunjungan.{" "}
              <span className="text-[#0D47A1]">Lihat Perubahan</span> dari Waktu ke Waktu.
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              Setiap pendampingan menghasilkan catatan terstruktur dan Health Snapshot.
              Keluarga dapat memantau pola kebugaran dan cerita keseharian lansia tanpa rasa cemas, meskipun terpisah jarak.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0D47A1]/10 text-[#0D47A1] mt-0.5">
                  <Activity className="size-4" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">Health Snapshot Lima Dimensi</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Memantau energi, mobilitas, mood, nafsu makan, dan tidur sebagai indikator observasi kebugaran non-medis.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0D47A1]/10 text-[#0D47A1] mt-0.5">
                  <HeartHandshake className="size-4" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">Memory Capsule</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Kutipan cerita otentik dan interaksi hangat lansia yang dicatat langsung oleh Helper di setiap sesi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0D47A1]/10 text-[#0D47A1] mt-0.5">
                  <TrendingUp className="size-4" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">Deteksi Tren Otomatis</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Sistem memberi sinyal atensi bila terjadi penurunan berturut-turut, mempermudah keluarga mengambil langkah antisipatif.
                  </p>
                </div>
              </div>
            </div>

            <Button asChild size="lg" className="bg-[#0D47A1] text-white font-heading font-bold px-7 rounded-xl shadow-md hover:bg-[#0D47A1]/90">
              <Link href="/register?role=keluarga" className="inline-flex items-center gap-2">
                Mulai Pantau Orang Tersayang <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* Right Column: High-emphasis preview card */}
          <div>
            <div className="rounded-[24px] border border-[#90CAF9]/40 bg-white p-6 sm:p-8 shadow-[0_16px_48px_rgba(13,71,161,0.09)]">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D47A1]">
                    Contoh Tampilan Riwayat
                  </span>
                  <h3 className="font-heading text-lg font-bold text-foreground mt-0.5">
                    Ibu Sulastri (72 tahun)
                  </h3>
                </div>
                <Badge variant="outline" className="bg-[#EEF5FF] text-[#0D47A1] border-[#90CAF9]/50 text-xs font-semibold">
                  Terakhir: 27 Agustus 2026
                </Badge>
              </div>

              {/* Indicator summaries */}
              <div className="space-y-3 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Observasi Kebugaran Terkini
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {indicators.map((ind) => (
                    <div key={ind.name} className="p-3.5 rounded-xl bg-[#F8FAFD] border border-border/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-muted-foreground">{ind.name}</span>
                        <span className="text-xs font-black text-foreground">{ind.score}</span>
                      </div>
                      <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${ind.color}`}>
                        {ind.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Story preview (Memory Capsule) */}
              <div className="rounded-2xl bg-[#F0F6FF] border border-[#0D47A1]/15 p-4 sm:p-5 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">
                    Memory Capsule Kunjungan
                  </span>
                  <span className="text-[11px] text-muted-foreground">Helper: Mas Burgas</span>
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  &quot;Ibu bercerita bahwa hari ini tidur lebih nyenyak dan mau jalan pagi 15 menit keliling teras. Nafsu makan bagus, sepiring bubur ayam habis.&quot;
                </p>
              </div>

              {/* Non-diagnostic notice */}
              <div className="flex items-center justify-between pt-4 border-t border-border/70 text-xs text-muted-foreground">
                <span>Catatan observasi keseharian, bukan diagnosis medis.</span>
                <span className="font-semibold text-[#0D47A1]">3 Kunjungan Terakhir</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
