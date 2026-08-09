import Link from "next/link";
import { ArrowRight } from "lucide-react";

const serviceIcons: Record<string, React.ReactNode> = {
  "Antar Obat": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="M8.5 8.5 16 16" />
    </svg>
  ),
  "Pengingat Obat": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  "Belanja Kebutuhan": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  "Menemani Mengobrol": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  "Bersih Rumah Ringan": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  "Bantuan Teknologi": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  "Kontrol Kesehatan": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
};

const services = [
  {
    name: "Antar Obat",
    duration: "30 mnt",
    price: "Rp35.000",
    desc: "Helper mengambil dan mengantarkan obat ke rumah lansia.",
    highRisk: false,
  },
  {
    name: "Pengingat Obat",
    duration: "30 mnt",
    price: "Rp25.000",
    desc: "Pengingat minum obat sesuai jadwal dan dosis yang tepat.",
    highRisk: false,
  },
  {
    name: "Belanja Kebutuhan",
    duration: "60 mnt",
    price: "Rp40.000",
    desc: "Belanja bahan makanan dan kebutuhan sehari-hari untuk lansia.",
    highRisk: false,
  },
  {
    name: "Menemani Mengobrol",
    duration: "60 mnt",
    price: "Rp50.000",
    desc: "Teman ngobrol hangat agar lansia tidak merasa kesepian.",
    highRisk: false,
  },
  {
    name: "Bersih Rumah Ringan",
    duration: "90 mnt",
    price: "Rp70.000",
    desc: "Membantu membersihkan dan merapikan rumah lansia.",
    highRisk: false,
  },
  {
    name: "Bantuan Teknologi",
    duration: "45 mnt",
    price: "Rp30.000",
    desc: "Video call dengan keluarga, setup HP, atau bantuan digital lainnya.",
    highRisk: false,
  },
  {
    name: "Kontrol Kesehatan",
    duration: "90 mnt",
    price: "Rp120.000",
    desc: "Antar lansia ke fasilitas kesehatan terdekat dengan aman.",
    highRisk: true,
  },
];

export default function ServicesSection() {
  return (
    <section id="layanan" className="py-20 bg-white min-h-[100dvh] flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Layanan Apa Saja yang Tersedia?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Semua dengan <strong>harga fix</strong> yang transparan. Helper terverifikasi siap
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
              <div className="text-[#0D47A1] mb-3">{serviceIcons[svc.name]}</div>
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
