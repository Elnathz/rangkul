import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const helpers = [
  {
    name: "Andi Permana",
    area: "Kelurahan Beji, RT 03 / RW 05",
    rating: 4.9,
    tasks: 47,
    trust: "Terpercaya",
    radius: "3 km",
    specialties: ["Menemani Mengobrol", "Antar Obat"],
    imagePath: "/images/helpers/helper-andi.jpg",
    color: "from-[#90CAF9] to-[#0D47A1]",
  },
  {
    name: "Rina Sari",
    area: "Kelurahan Kemiri Muka, RT 05 / RW 02",
    rating: 4.7,
    tasks: 21,
    trust: "Terpercaya",
    radius: "2 km",
    specialties: ["Belanja", "Bantuan Teknologi"],
    imagePath: "/images/helpers/helper-ayu.jpg",
    color: "from-[#a5d6a7] to-[#2e7d32]",
  },
  {
    name: "Budi Hartono",
    area: "Kelurahan Pondok Cina, RT 03 / RW 01",
    rating: 4.8,
    tasks: 63,
    trust: "Terpercaya",
    radius: "5 km",
    specialties: ["Bersih Rumah Ringan", "Antar Obat"],
    imagePath: "/images/helpers/helper-andi.jpg", // Kehabisan foto untuk Budi
    color: "from-[#ce93d8] to-[#6a1b9a]",
  },
  {
    name: "Sari Wulandari",
    area: "Kelurahan Kukusan, RT 07 / RW 03",
    rating: 4.6,
    tasks: 9,
    trust: "Probation",
    radius: "2 km",
    specialties: ["Menemani Mengobrol", "Bantuan Teknologi"],
    imagePath: "/images/helpers/helper-sarah.jpg",
    color: "from-[#ffcc80] to-[#e65100]",
  },
];

const trustColor: Record<string, string> = {
  Terpercaya: "bg-green-50 text-green-700 border-green-200",
  Probation: "bg-amber-50 text-amber-700 border-amber-200",
};

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-amber-400">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-3 h-3">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function TopHelpersSection() {
  return (
    <section id="helper" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              Helper Terpercaya di Komunitasmu
            </h2>
            <p className="text-muted-foreground">
              Semua sudah diverifikasi Koordinator RT/RW domisilinya. Transparan, aman, lokal.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0 gap-2 border-[#0D47A1] text-[#0D47A1] font-semibold">
            <Link href="/cari-helper">
              Lihat semua Helper
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {helpers.map((h) => (
            <Link
              key={h.name}
              href="/cari-helper"
              className="group bg-[#F5F8FC] hover:bg-white rounded-2xl border border-border hover:border-[#0D47A1]/25 p-5 shadow-none hover:shadow-[0_8px_32px_rgba(13,71,161,0.10)] transition-all duration-250 hover-lift flex flex-col gap-4"
            >
              {/* Avatar face + trust badge */}
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-border">
                  <Image
                    src={h.imagePath}
                    alt={`Foto ${h.name}`}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${trustColor[h.trust]}`}
                >
                  {h.trust}
                </Badge>
              </div>

              {/* Info */}
              <div>
                <p className="font-display font-bold text-sm text-foreground mb-0.5">
                  {h.name}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPinIcon />
                  {h.area}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 font-semibold text-amber-500">
                  <StarIcon />
                  {h.rating}
                </div>
                <span className="text-muted-foreground">
                  {h.tasks} tugas selesai
                </span>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {h.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-border text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-border text-muted-foreground">
                  Radius {h.radius}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
