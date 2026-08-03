import { Badge } from "@/components/ui/badge";
import { UserCheck, CalendarCheck, FileHeart } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    num: "01",
    title: "Daftar & Verifikasi",
    desc: "Buat akun Keluarga, tambah profil lansia, dan pilih Helper yang sudah diverifikasi Koordinator RT/RW domisilinya.",
    tag: "Kepercayaan Komunitas",
  },
  {
    icon: CalendarCheck,
    num: "02",
    title: "Booking Helper",
    desc: "Pilih kategori jasa, tentukan jadwal, dan bayar dengan harga fix yang transparan. Proses booking selesai dalam hitungan menit.",
    tag: "Fix Price",
  },
  {
    icon: FileHeart,
    num: "03",
    title: "Terima Laporan & Pantau",
    desc: "Setelah kunjungan, terima laporan foto + catatan kondisi + skor kesehatan. Semuanya terkumpul jadi Riwayat Rangkul.",
    tag: "Riwayat Rangkul ⭐",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="py-20 bg-[#F5F8FC]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 text-xs font-semibold bg-[#0D47A1]/08 text-[#0D47A1] border border-[#0D47A1]/20 py-1.5 px-3"
          >
            Cara Kerja
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Mudah Dipakai, Aman Dipercaya
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Tiga langkah sederhana untuk menjaga lansia yang kamu sayangi
            tetap terawat dan terpantau.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[calc(33.33%-1rem)] right-[calc(33.33%-1rem)] h-px bg-gradient-to-r from-border via-[#0D47A1]/30 to-border" />

          {steps.map(({ icon: Icon, num, title, desc, tag }) => (
            <div
              key={num}
              className="relative bg-white rounded-2xl p-7 border border-border shadow-sm hover:shadow-[0_8px_32px_rgba(13,71,161,0.09)] transition-all duration-300 hover-lift"
            >
              {/* Step number */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-sm shrink-0">
                  <Icon size={20} className="text-white" />
                </div>
                <span className="font-display font-black text-3xl text-border">
                  {num}
                </span>
              </div>

              <h3 className="font-display font-bold text-base text-foreground mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {desc}
              </p>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0D47A1]/08 text-[#0D47A1] border border-[#0D47A1]/15">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
