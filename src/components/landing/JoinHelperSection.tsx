import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Clock,
  Star,
  ArrowRight,
  MapPin,
} from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Potensi Rp 3jt/bulan",
    desc: "Penghasilan tambahan nyata sesuai jumlah dan kategori tugas harianmu.",
    color: "text-emerald-400 bg-emerald-400/10",
  },
  {
    icon: Clock,
    title: "Atur jadwal sendiri",
    desc: "Pilih status aktif atau tidak. Kerja kapan pun kamu luang.",
    color: "text-amber-400 bg-amber-400/10",
  },
  {
    icon: MapPin,
    title: "Lokal & Lintas Wilayah",
    desc: "Terverifikasi 1 kali di RT domisili, bisa ambil tugas dalam radius layananmu.",
    color: "text-sky-400 bg-sky-400/10",
  },
  {
    icon: Star,
    title: "Reputasi Profesional",
    desc: "Kumpulkan rating bagus dan jadilah Helper andalan para keluarga.",
    color: "text-purple-400 bg-purple-400/10",
  },
];

const steps = [
  {
    num: "1",
    title: "Daftar & Lengkapi Data Diri",
    desc: "Isi data diri dan layanan apa saja yang bisa kamu kerjakan (contoh: antar obat, teman ngobrol, bersih rumah).",
  },
  {
    num: "2",
    title: "Verifikasi Koordinator RT",
    desc: "Akunmu dikonfirmasi Koordinator RT/RW domisilimu, cukup 1 kali. Setelah itu kamu bisa ambil tugas dari RT sendiri maupun wilayah lain dalam radius layananmu.",
  },
  {
    num: "3",
    title: "Siap Terima Booking",
    desc: "Profilmu otomatis muncul saat warga sekitar mencari Helper sesuai kategori layananmu. Langsung terima orderan!",
  },
];

export default function JoinHelperSection() {
  return (
    <section className="py-24 bg-[#F5F8FC] relative overflow-hidden min-h-[100dvh] flex flex-col justify-center">
      {/* Decorative overlay */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 lg:items-start w-full">
          {/* Left Column: Hooks and Features */}
          <div className="max-w-xl">
            <h2 className="font-display text-4xl md:text-[3rem] font-extrabold text-[#0D47A1] leading-[1.1] mb-6">
              Mulai Jadi Helper, Bangun Penghasilan Sesuai Waktumu.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Gunakan waktu luangmu untuk membantu tetangga lansia di lingkungan sekitar. Mulai dari menemani ngobrol, mengantar obat, hingga membersihkan rumah. Terverifikasi sekali, bebas bertugas dalam radius layananmu.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-0 lg:mb-10">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white border border-border rounded-2xl p-5 hover:bg-blue-50/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${b.color}`}>
                    <b.icon size={16} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1.5">{b.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            <Button
              asChild
              size="lg"
              className="bg-brand-gradient text-white hover:bg-blue-600 font-display font-bold px-8 shadow-xl shadow-[#0D47A1]/20 w-fit h-12 hidden lg:inline-flex"
            >
              <Link href="/register?role=helper">
                Mulai Daftar Helper <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
          </div>

          {/* Right Column: Steps and Calculator */}
          <div className="flex flex-col gap-6 lg:pl-10">
            {/* Main Estimator Card */}
            <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Potensi Penghasilan
                </span>
                <span className="text-[9px] px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold border border-blue-200">
                  ESTIMASI
                </span>
              </div>
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D47A1] mb-2">
                Rp 500.000<span className="text-muted-foreground font-medium text-lg"> - Rp 3.000.000+</span>
              </p>
              <p className="text-xs text-muted-foreground mt-3 font-medium">Berdasarkan dedikasi bulan ini</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1.5">
              *Penghasilan dihitung berdasarkan jumlah booking, kategori layanan (mis: antar obat vs kontrol kesehatan), serta durasi. Pembagian: 90% untuk Helper.
              </p>
            </div>

            {/* Sub Steps Card */}
            <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
              <h3 className="font-display font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                Mulai dalam 3 langkah
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4 text-emerald-600">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </h3>
              
              <div className="flex flex-col gap-6">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0D47A1]/10 text-[#0D47A1] border border-[#0D47A1]/20 flex items-center justify-center font-bold text-sm shrink-0">
                      {s.num}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">{s.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Status Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="relative flex items-center justify-center w-3 h-3">
                <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
                <span className="relative w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-emerald-900 leading-none mb-1">Pendaftaran Terbuka</h4>
                <p className="text-[10px] text-emerald-700">Warga sekitarmu sedang mencari Helper saat ini.</p>
              </div>
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                <Link href="/register?role=helper">Gabung</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Button */}
        <div className="lg:hidden mt-8 flex w-full">
          <Button
            asChild
            size="lg"
            className="bg-brand-gradient text-white font-display font-bold w-full h-13 shadow-xl"
          >
            <Link href="/register?role=helper">
              Mulai Daftar Helper <ArrowRight className="ml-2" size={16} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
