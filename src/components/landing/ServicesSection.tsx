import Link from "next/link";
import { ArrowRight, HeartPulse, House, MessageCircleHeart, PackageCheck, Pill, ShoppingBasket, Smartphone } from "lucide-react";

const services = [
  { name: "Antar Obat", duration: "30 menit", price: "Rp35.000", description: "Mengambil dan mengantarkan obat ke rumah lansia.", icon: Pill },
  { name: "Pengingat Obat", duration: "30 menit", price: "Rp25.000", description: "Mendampingi pengingat minum obat sesuai catatan keluarga.", icon: HeartPulse },
  { name: "Belanja Kebutuhan", duration: "60 menit", price: "Rp40.000", description: "Membantu belanja kebutuhan harian lansia.", icon: ShoppingBasket },
  { name: "Menemani Mengobrol", duration: "60 menit", price: "Rp50.000", description: "Menemani percakapan dan aktivitas ringan di rumah.", icon: MessageCircleHeart },
  { name: "Bersih Rumah Ringan", duration: "90 menit", price: "Rp70.000", description: "Membantu merapikan area rumah yang ringan.", icon: House },
  { name: "Bantuan Teknologi", duration: "45 menit", price: "Rp30.000", description: "Membantu komunikasi digital dengan keluarga.", icon: Smartphone },
  { name: "Kontrol Kesehatan", duration: "90 menit", price: "Rp120.000", description: "Mendampingi perjalanan ke fasilitas kesehatan.", icon: PackageCheck, highRisk: true },
];

export default function ServicesSection() {
  return (
    <section id="layanan" className="bg-[#F5F8FC] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-[#0D47A1]">LAYANAN</p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Bantuan yang jelas untuk kebutuhan sehari-hari.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Setiap layanan memiliki harga dasar dan durasi yang dapat dilihat sebelum kunjungan dibuat.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ name, duration, price, description, icon: Icon, highRisk }) => (
            <Link key={name} href={`/cari-helper?kategori=${encodeURIComponent(name)}`} className="group flex min-h-44 flex-col rounded-2xl border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0D47A1]" aria-hidden="true"><Icon className="h-5 w-5" /></span>
                {highRisk && <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">Perlu persetujuan Koordinator</span>}
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{name}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                <div><p className="text-base font-bold text-[#0D47A1]">{price}</p><p className="mt-0.5 text-xs text-muted-foreground">{duration}</p></div>
                <ArrowRight className="h-5 w-5 text-[#0D47A1] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
