import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dewi Rahayu",
    role: "Keluarga — anak rantau di Jakarta",
    text: "Sejak pakai Rangkul, saya bisa tenang kerja di Jakarta. Setiap kunjungan ada laporan lengkap, bahkan ada cerita Ibu hari ini. Riwayat Rangkul literally bikin saya nangis baca laporannya.",
    rating: 5,
    initials: "DR",
    gradient: "from-[#90CAF9] to-[#0D47A1]",
  },
  {
    name: "Pak RT Bambang",
    role: "Koordinator Komunitas — RT 03",
    text: "Sebagai Ketua RT, saya senang bisa turut membantu warga saya. Prosesnya mudah — saya verifikasi Helper yang saya kenal, dan notifikasi setiap transaksi biar saya tetap update.",
    rating: 5,
    initials: "PB",
    gradient: "from-[#a5d6a7] to-[#2e7d32]",
  },
  {
    name: "Andi Permana",
    role: "Helper — RT 03, 47 tugas selesai",
    text: "Penghasilan saya bertambah, dan lebih osah penting saya bisa bantu warga lansia di sekitar saya. Harga fix-nya adil dan aman — tidak ada drama tawar-menawar.",
    rating: 5,
    initials: "AP",
    gradient: "from-[#ffcc80] to-[#e65100]",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#F5F8FC]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 text-xs font-semibold bg-[#0D47A1]/08 text-[#0D47A1] border border-[#0D47A1]/20 py-1.5 px-3"
          >
            Dipercaya Komunitas
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Cerita dari Keluarga, Helper & RT
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Rangkul dipercaya karena verifikasi berbasis komunitas nyata —
            bukan sekadar KTP + selfie.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-[0_8px_32px_rgba(13,71,161,0.09)] transition-all duration-300 hover-lift flex flex-col gap-5"
            >
              {/* Quote icon */}
              <Quote size={20} className="text-[#90CAF9]" />

              {/* Text */}
              <p className="text-sm text-foreground leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-1 border-t border-border">
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center shrink-0`}
                >
                  <span className="text-white font-display font-bold text-xs">
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-foreground">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
                <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#0D47A1]/08 text-[#0D47A1] border border-[#0D47A1]/15">
                  Verified ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
