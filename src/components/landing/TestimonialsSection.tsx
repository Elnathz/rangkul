import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dewi Rahayu",
    role: "Keluarga",
    subrole: "Anak rantau di Jakarta",
    text: "Sejak pakai Rangkul, saya bisa tenang kerja di Jakarta. Setiap kunjungan ada laporan lengkap, bahkan ada cerita Ibu hari ini. Riwayat Rangkul sangat membantu dan bikin saya terharu baca laporannya.",
    rating: 5,
    avatarSeed: "DewiRahayu",
  },
  {
    name: "Pak RT Bambang",
    role: "Koordinator RT",
    subrole: "RT 03 / RW 05",
    text: "Sebagai Ketua RT, saya senang bisa turut membantu warga saya. Prosesnya mudah. Saya verifikasi Helper yang saya kenal, dan ada notifikasi setiap transaksi biar saya tetap update.",
    rating: 5,
    avatarSeed: "Bambang",
  },
  {
    name: "Andi Permana",
    role: "Helper",
    subrole: "47 tugas selesai",
    text: "Penghasilan saya bertambah, dan lebih penting lagi saya bisa bantu warga lansia di sekitar saya. Harga layanannya adil dan aman tanpa drama tawar-menawar.",
    rating: 5,
    avatarSeed: "AndiPermana",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#F5F8FC]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Cerita dari Keluarga, Helper & RT
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Rangkul dipercaya karena verifikasi berbasis komunitas nyata,
            bukan sekadar KTP dan foto diri.
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
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-border shadow-sm shrink-0 bg-[#F5F8FC]">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <p className="font-display font-bold text-sm text-foreground">
                      {t.name}
                    </p>
                    <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-[#0D47A1]/08 text-[#0D47A1]">
                      {t.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.subrole}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
