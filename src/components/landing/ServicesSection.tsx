import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const services = [
  {
    emoji: "💊",
    name: "Antar Obat",
    duration: "30 mnt",
    price: "Rp35.000",
    desc: "Helper mengambil dan mengantarkan obat ke rumah lansia.",
    highRisk: false,
  },
  {
    emoji: "⏰",
    name: "Pengingat Obat",
    duration: "30 mnt",
    price: "Rp25.000",
    desc: "Pengingat minum obat sesuai jadwal dan dosis yang tepat.",
    highRisk: false,
  },
  {
    emoji: "🛒",
    name: "Belanja Kebutuhan",
    duration: "60 mnt",
    price: "Rp40.000",
    desc: "Belanja bahan makanan & kebutuhan sehari-hari untuk lansia.",
    highRisk: false,
  },
  {
    emoji: "💬",
    name: "Menemani Mengobrol",
    duration: "60 mnt",
    price: "Rp50.000",
    desc: "Teman ngobrol hangat agar lansia tidak merasa kesepian.",
    highRisk: false,
  },
  {
    emoji: "🧹",
    name: "Bersih Rumah Ringan",
    duration: "90 mnt",
    price: "Rp70.000",
    desc: "Membantu membersihkan dan merapikan rumah lansia.",
    highRisk: false,
  },
  {
    emoji: "📱",
    name: "Bantuan Teknologi",
    duration: "45 mnt",
    price: "Rp30.000",
    desc: "Video call dengan keluarga, setup hp, atau bantuan digital lainnya.",
    highRisk: false,
  },
  {
    emoji: "🏥",
    name: "Kontrol Kesehatan",
    duration: "90 mnt",
    price: "Rp120.000",
    desc: "Antar lansia ke fasilitas kesehatan terdekat dengan aman.",
    highRisk: true,
  },
];

export default function ServicesSection() {
  return (
    <section id="layanan" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 text-xs font-semibold bg-[#0D47A1]/08 text-[#0D47A1] border border-[#0D47A1]/20 py-1.5 px-3"
          >
            7 Kategori Jasa
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Layanan Apa Saja yang Tersedia?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Semua dengan <strong>fix price</strong> yang transparan — tidak ada biaya kejutan. Helper terverifikasi siap
            membantu sesuai kebutuhan lansia.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((svc) => (
            <Link
              key={svc.name}
              href={`/cari-helper?kategori=${encodeURIComponent(svc.name)}`}
              className="group relative bg-[#F5F8FC] hover:bg-white rounded-2xl p-5 border border-border hover:border-[#0D47A1]/30 hover:shadow-[0_8px_32px_rgba(13,71,161,0.10)] transition-all duration-250 hover-lift"
            >
              {svc.highRisk && (
                <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                  Perlu Koordinator
                </span>
              )}
              <div className="text-3xl mb-3">{svc.emoji}</div>
              <h3 className="font-display font-bold text-sm text-foreground mb-1">
                {svc.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {svc.desc}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="font-display font-extrabold text-[#0D47A1] text-base">
                    {svc.price}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{svc.duration}</p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-muted-foreground group-hover:text-[#0D47A1] group-hover:translate-x-1 transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
