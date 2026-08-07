import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const helpers = [
  {
    name: "Andi Permana",
    rt: "RT 03 / RW 05",
    kelurahan: "Kel. Beji",
    kecamatan: "Kec. Beji",
    kota: "Depok",
    rating: 4.9,
    tasks: 47,
    trust: "Terpercaya" as const,
    radiusKm: 3,
    specialties: ["Menemani Mengobrol", "Antar Obat"],
    imagePath: "/images/helpers/helper-andi.jpg",
    bisaLintasWilayah: true,
    isAktif: true,
  },
  {
    name: "Rina Sari",
    rt: "RT 05 / RW 02",
    kelurahan: "Kel. Kemiri Muka",
    kecamatan: "Kec. Beji",
    kota: "Depok",
    rating: 4.7,
    tasks: 21,
    trust: "Terpercaya" as const,
    radiusKm: 2,
    specialties: ["Belanja Kebutuhan", "Bantuan Teknologi"],
    imagePath: "/images/helpers/helper-ayu.jpg",
    bisaLintasWilayah: true,
    isAktif: true,
  },
  {
    name: "Budi Hartono",
    rt: "RT 03 / RW 01",
    kelurahan: "Kel. Pondok Cina",
    kecamatan: "Kec. Beji",
    kota: "Depok",
    rating: 4.8,
    tasks: 63,
    trust: "Terpercaya" as const,
    radiusKm: 5,
    specialties: ["Bersih Rumah Ringan", "Antar Obat"],
    imagePath: "/images/helpers/helper-andi.jpg",
    bisaLintasWilayah: true,
    isAktif: true,
  },
  {
    name: "Sari Wulandari",
    rt: "RT 07 / RW 03",
    kelurahan: "Kel. Kukusan",
    kecamatan: "Kec. Beji",
    kota: "Depok",
    rating: 4.6,
    tasks: 9,
    trust: "Probation" as const,
    radiusKm: 2,
    specialties: ["Menemani Mengobrol", "Bantuan Teknologi"],
    imagePath: "/images/helpers/helper-sarah.jpg",
    bisaLintasWilayah: false,
    isAktif: false,
  },
];

const trustColor: Record<string, string> = {
  Terpercaya: "bg-green-50 text-green-700 border-green-200",
  Probation: "bg-amber-50 text-amber-700 border-amber-200",
};

// Estimasi penghasilan berdasarkan jumlah tugas selesai
function estimasiPenghasilan(tasks: number): string {
  const avg = Math.round((tasks * 45000) / 1000) * 1000;
  return `Rp ${avg.toLocaleString("id-ID")}`;
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
    </svg>
  );
}

export default function TopHelpersSection() {
  return (
    <section id="helper" className="py-20 bg-[#F5F8FC]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              Helper Terpercaya di Komunitasmu
            </h2>
            <p className="text-muted-foreground">
              Semua sudah diverifikasi Koordinator RT/RW domisilinya. Transparan, aman, dan lokal.
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="shrink-0 gap-2 border-[#0D47A1] text-[#0D47A1] font-semibold hover:bg-[#0D47A1]/05"
          >
            <Link href="/cari-helper">
              Lihat semua Helper
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </Button>
        </div>

        {/* Cards — marketplace style 4-column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {helpers.map((h) => (
            <Link
              key={h.name}
              href="/cari-helper"
              className="group bg-white rounded-2xl border border-border hover:border-[#0D47A1]/30 hover:shadow-[0_8px_32px_rgba(13,71,161,0.12)] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              {/* Photo area — tall, like marketplace listing */}
              <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-[#DBEAFE] to-[#BFDBFE] overflow-hidden">
                <Image
                  src={h.imagePath}
                  alt={`Foto ${h.name}`}
                  fill
                  className="object-cover object-top scale-110"
                  unoptimized
                />

                {/* Top-left: trust badge (like "Featured") */}
                <span
                  className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border ${
                    h.trust === "Terpercaya"
                      ? "bg-white/90 text-green-700 border-green-200"
                      : "bg-white/90 text-amber-700 border-amber-200"
                  }`}
                >
                  {h.trust}
                </span>

                {/* Top-right: verified checkmark badge */}
                <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#0D47A1] flex items-center justify-center shadow-md">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </span>

                {/* Bottom-left: status badge (like "Available") */}
                <span
                  className={`absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    h.isAktif
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {h.isAktif ? "Aktif" : "Tidak Aktif"}
                </span>
              </div>

              {/* Info area */}
              <div className="flex flex-col gap-3 p-4 flex-1">
                {/* Specialty tag */}
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] w-fit">
                  {h.specialties[0]}
                </span>

                {/* Name */}
                <div>
                  <p className="font-display font-bold text-base text-foreground leading-tight">
                    {h.name}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-3 h-3 shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">{h.rt}, {h.kelurahan}, {h.kota}</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <StarIcon />
                    {h.rating.toFixed(1)}
                  </span>
                  <span>{h.tasks} tugas</span>
                  <span className="ml-auto">±{h.radiusKm} km</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Estimasi penghasilan (analog "Salary from") */}
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Estimasi penghasilan</p>
                  <p className="font-display font-extrabold text-[#0D47A1] text-base">
                    {estimasiPenghasilan(h.tasks)}
                    <span className="text-xs font-normal text-muted-foreground">/bln</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
