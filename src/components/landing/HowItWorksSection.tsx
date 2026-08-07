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
    desc: "Setelah kunjungan, terima laporan foto dan catatan kondisi lengkap. Semuanya terkumpul jadi Riwayat Rangkul.",
    tag: "Riwayat Rangkul",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="py-20 bg-[#F5F8FC]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Penjelasan Rangkul */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#0D47A1]/10 text-[#0D47A1] border-[#0D47A1]/20 text-xs font-semibold px-3 py-1">
            Platform Pendampingan Lansia
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-5">
            Apa itu Rangkul?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed mb-10">
            Rangkul adalah platform pendampingan lansia berbasis kepercayaan komunitas. Kami menghubungkan <strong>keluarga</strong> yang ingin memastikan orang tua mereka terjaga dengan <strong>helper lokal</strong> yang sudah diverifikasi langsung oleh <strong>Koordinator RT/RW</strong> setempat.
          </p>

          {/* Tiga pilar Rangkul */}
          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto mb-16">
            {[
              {
                emoji: "🏠",
                title: "Hyperlocal",
                desc: "Helper berdomisili dan diverifikasi di RT/RW yang sama. Bukan orang asing — melainkan tetangga yang dipercaya Ketua RT.",
                color: "bg-teal-50 border-teal-100",
                textColor: "text-teal-700",
              },
              {
                emoji: "📋",
                title: "Terstruktur",
                desc: "Setiap kunjungan menghasilkan laporan kondisi yang bisa dipantau Keluarga dari mana saja. Bukan hanya \"pokoknya dijaga\".",
                color: "bg-blue-50 border-blue-100",
                textColor: "text-blue-700",
              },
              {
                emoji: "🛡️",
                title: "Terpercaya",
                desc: "Harga fix, verifikasi berjenjang, dan komisi Koordinator yang mendorong pengawasan aktif — bukan sekadar marketplace biasa.",
                color: "bg-indigo-50 border-indigo-100",
                textColor: "text-indigo-700",
              },
            ].map((p) => (
              <div
                key={p.title}
                className={`rounded-2xl border p-5 text-left ${p.color}`}
              >
                <span className="text-2xl mb-3 block">{p.emoji}</span>
                <h3 className={`font-display font-bold text-sm mb-2 ${p.textColor}`}>
                  {p.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Cara kerja */}
          <h3 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mb-3">
            Cara Kerjanya
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-10">
            Tiga langkah sederhana untuk menjaga lansia yang kamu sayangi tetap terawat dan terpantau.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[calc(33.33%-1rem)] right-[calc(33.33%-1rem)] h-px bg-gradient-to-r from-border via-[#0D47A1]/30 to-border" />

          {steps.map(({ icon: Icon, num, title, desc, tag }) => (
            <div
              key={num}
              className="relative bg-white rounded-2xl p-7 border border-border shadow-sm hover:shadow-[0_8px_32px_rgba(13,71,161,0.09)] transition-all duration-300 hover:-translate-y-1"
            >
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
