import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet, Clock, Star, UserCheck, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Potensi Rp 1.5jt/bulan",
    desc: "Penghasilan tambahan pasti sesuaikan dengan jumlah tugas harianmu.",
    color: "text-emerald-400 bg-emerald-400/10",
  },
  {
    icon: Clock,
    title: "Atur jadwal sendiri",
    desc: "Pilih status aktif atau tidak. Kerja kapan pun kamu luang.",
    color: "text-blue-400 bg-blue-400/10",
  },
  {
    icon: UserCheck,
    title: "Aman & Jarak Dekat",
    desc: "Kerja dalam lingkungan RT/RW sendiri jadi gampang dan terpercaya.",
    color: "text-indigo-400 bg-indigo-400/10",
  },
  {
    icon: Star,
    title: "Reputasi Profesional",
    desc: "Kumpulkan rating bagus dan jadilah Helper andalan para keluarga.",
    color: "text-amber-400 bg-amber-400/10",
  },
];

const steps = [
  {
    num: "1",
    title: "Daftar & Lengkapi Profil",
    desc: "Isi data diri dan layanan apa saja yang bisa kamu kerjakan (contoh: antar obat, teman ngobrol).",
  },
  {
    num: "2",
    title: "Verifikasi Koordinator RT",
    desc: "Akunmu bakal dikonfirmasi oleh pengurus RT/RW agar keamanan terjaga.",
  },
  {
    num: "3",
    title: "Siap Terima Booking",
    desc: "Profilmu otomatis muncul saat warga sekitar mencari Helper, langsung terima orderan!",
  },
];

export default function JoinHelperSection() {
  return (
    <section className="py-24 bg-[#0A173B] relative overflow-hidden min-h-[100dvh] flex flex-col justify-center">
      {/* Decorative gradient overlay */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0D47A1] blur-[150px] rounded-full opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#1E88E5] blur-[180px] rounded-full opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 lg:items-start w-full">
          {/* Left Column: Hooks and Features */}
          <div className="max-w-xl">
            <h2 className="font-display text-4xl md:text-[3rem] font-extrabold text-white leading-[1.1] mb-6">
              Mulai Jadi Helper, Bangun Penghasilan Sesuai Waktumu.
            </h2>
            <p className="text-blue-100/70 text-lg leading-relaxed mb-10">
              Gunakan waktu luangmu untuk membantu tetangga lansia di lingkungan sekitar. Mulai dari menemani ngobrol, mengantar obat, hingga membersihkan rumah.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-0 lg:mb-10">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${b.color}`}>
                    <b.icon size={16} />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1.5">{b.title}</h3>
                  <p className="text-xs text-blue-100/60 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            <Button
              asChild
              size="lg"
              className="bg-white text-[#0A173B] hover:bg-blue-50 font-display font-bold px-8 shadow-xl shadow-blue-900/30 w-fit h-12 hidden lg:inline-flex"
            >
              <Link href="/register?role=helper">
                Mulai Daftar Helper <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
          </div>

          {/* Right Column: Steps and Calculator */}
          <div className="flex flex-col gap-6 lg:pl-10">
            {/* Main Estimator Card */}
            <div className="bg-gradient-to-br from-[#1E88E5]/20 to-[#0D47A1]/20 border border-blue-400/30 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">
                  Potensi Penghasilan
                </span>
                <span className="text-[9px] px-2 py-1 bg-blue-500/20 text-blue-200 rounded font-semibold border border-blue-400/20">
                  ESTIMASI
                </span>
              </div>
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-2">
                Rp 500.000<span className="text-blue-300 font-medium text-lg"> - Rp 3.000.000+</span>
              </p>
              <p className="text-xs text-blue-200 mt-3 font-medium">Berdasarkan dedikasi bulan ini</p>
              <p className="text-[10px] text-blue-100/50 mt-1.5">
                *Penghasilan dihitung berdasarkan jumlah booking, kategori layanan pilihanmu (mis: antar obat vs kontrol kesehatan), serta durasi yang diluangkan.
              </p>
            </div>

            {/* Sub Steps Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
                Mulai dalam 3 langkah
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4 text-emerald-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </h3>
              
              <div className="flex flex-col gap-6">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 border border-blue-400/20 shadow-inner flex items-center justify-center font-bold text-sm shrink-0">
                      {s.num}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{s.title}</h4>
                      <p className="text-xs text-blue-100/60 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Status Card */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                <span className="relative w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white leading-none mb-1">Pendaftaran Terbuka</h4>
                <p className="text-[10px] text-emerald-100/70">Warga sekitarmu sedang mencari Helper saat ini.</p>
              </div>
              <Button asChild size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0">
                <Link href="/register?role=helper">Gabung</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Button - Placed at the very bottom */}
        <div className="lg:hidden mt-8 flex w-full">
          <Button
            asChild
            size="lg"
            className="bg-white text-[#0A173B] hover:bg-blue-50 font-display font-bold w-full h-13 shadow-xl shadow-blue-900/30"
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
