import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, ArrowRight } from "lucide-react";

const helpers = [
  {
    initials: "AP",
    name: "Andi Permana",
    area: "RT 03 / RW 05",
    rating: 4.9,
    tasks: 47,
    trust: "Terpercaya",
    radius: "3 km",
    specialties: ["Mengobrol", "Antar Obat"],
    gradient: "from-[#90CAF9] to-[#0D47A1]",
  },
  {
    initials: "RS",
    name: "Rina Sari",
    area: "RT 05 / RW 02",
    rating: 4.7,
    tasks: 21,
    trust: "Terpercaya",
    radius: "2 km",
    specialties: ["Belanja", "Teknologi"],
    gradient: "from-[#a5d6a7] to-[#2e7d32]",
  },
  {
    initials: "BH",
    name: "Budi Hartono",
    area: "RT 03 / RW 01",
    rating: 4.8,
    tasks: 63,
    trust: "Terpercaya",
    radius: "5 km",
    specialties: ["Bersih Rumah", "Antar Obat"],
    gradient: "from-[#ce93d8] to-[#6a1b9a]",
  },
  {
    initials: "SW",
    name: "Sari Wulandari",
    area: "RT 07 / RW 03",
    rating: 4.6,
    tasks: 9,
    trust: "Probation",
    radius: "2 km",
    specialties: ["Mengobrol", "Teknologi"],
    gradient: "from-[#ffcc80] to-[#e65100]",
  },
];

const trustColor: Record<string, string> = {
  Terpercaya: "bg-green-50 text-green-700 border-green-200",
  Probation: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function TopHelpersSection() {
  return (
    <section id="helper" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <Badge
              variant="secondary"
              className="mb-4 text-xs font-semibold bg-[#0D47A1]/08 text-[#0D47A1] border border-[#0D47A1]/20 py-1.5 px-3"
            >
              Helper Terbaik
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              Helper Terpercaya di Komunitasmu
            </h2>
            <p className="text-muted-foreground">
              Semua sudah diverifikasi Koordinator RT/RW domisilinya. Transparan, aman, lokal.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0 gap-2 border-[#0D47A1] text-[#0D47A1] font-semibold">
            <Link href="/cari-helper">
              Lihat semua Helper <ArrowRight size={14} />
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {helpers.map((h) => (
            <Link
              key={h.name}
              href={`/cari-helper`}
              className="group bg-[#F5F8FC] hover:bg-white rounded-2xl border border-border hover:border-[#0D47A1]/25 p-5 shadow-none hover:shadow-[0_8px_32px_rgba(13,71,161,0.10)] transition-all duration-250 hover-lift flex flex-col gap-4"
            >
              {/* Avatar + trust badge */}
              <div className="flex items-start justify-between">
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarFallback
                    className={`bg-gradient-to-br ${h.gradient} text-white font-display font-bold text-sm`}
                  >
                    {h.initials}
                  </AvatarFallback>
                </Avatar>
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
                  <MapPin size={11} />
                  {h.area}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 font-semibold text-amber-500">
                  <Star size={11} fill="currentColor" />
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
