import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MapPin, BarChart3, Coins, CheckCircle, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Coins,
    title: "Komisi 3% Tiap Transaksi",
    desc: "Koordinator mendapatkan 3% setiap helper (sesuai wilayah RT) selesai mengerjakan tugas yang diberikan oleh keluarga.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: ShieldCheck,
    title: "Cegah Praktek Calo",
    desc: "Mencegah adanya calo dengan prosedur pengawasan langsung dari Koordinator Wilayah terhadap helper yang mendaftar.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: MapPin,
    title: "Dashboard Wilayah Lengkap",
    desc: "Lihat siapa melayani siapa di RT/RW-mu secara real-time. Koordinator RW juga bisa pantau lintas-RT.",
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: BarChart3,
    title: "Arsip & Laporan Bulanan",
    desc: "Seluruh aktivitas tercatat rapi: arsip transaksi, riwayat helper, dan laporan keamanan komunitas.",
    color: "text-blue-600 bg-blue-50",
  },
];

const steps = [
  {
    num: "1",
    title: "Registrasi RT/RW",
    desc: "Daftar sebagai Koordinator menggunakan data asli kepengurusan (RT/RW, Kelurahan, Kecamatan) dan unggah dokumen jabatan.",
  },
  {
    num: "2",
    title: "Verifikasi oleh Admin",
    desc: "Tim Rangkul memverifikasi dokumen jabatanmu. Setelah disetujui, kamu bisa mulai memverifikasi Helper di wilayahmu.",
  },
  {
    num: "3",
    title: "Verifikasi Helper & Pantau",
    desc: "Terima notifikasi pendaftaran Helper baru. Review, lakukan wawancara singkat, dan approve jika kamu mengenal warga tersebut. Komisi 3% langsung berjalan tiap transaksi selesai.",
  },
];

export default function JoinKoordinatorSection() {
  return (
    <section className="py-24 bg-[#F5F8FC] relative overflow-hidden text-foreground min-h-[100dvh] flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 lg:items-start w-full">
          {/* Left Column */}
          <div className="max-w-xl lg:pr-10">
            <h2 className="font-display text-4xl md:text-[3rem] font-extrabold text-[#0D47A1] leading-[1.1] mb-6">
              Jadilah Pahlawan Komunitasmu, Sekaligus Dapatkan Komisi.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Ciptakan ekosistem perawatan lansia yang aman di lingkunganmu. Verifikasi helper, pantau aktivitas wilayah, dan raih komisi 3% dari setiap tugas yang berhasil diselesaikan.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-0 lg:mb-10">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white border border-border rounded-2xl p-5 hover:bg-slate-50 transition-colors">
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
              className="bg-brand-gradient text-white font-display font-bold px-8 shadow-xl shadow-[#0D47A1]/20 w-fit h-12 hidden lg:inline-flex"
            >
              <Link href="/register?role=koordinator">
                Daftar Gratis sebagai Koordinator <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Benefit Summary Card */}
            <div className="bg-white border text-foreground border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Keuntungan Koordinator
                </span>
                <span className="text-[9px] px-2 py-1 bg-amber-100 text-amber-700 rounded font-semibold border border-amber-200">
                  KOMISI + SOSIAL
                </span>
              </div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold mb-2 text-[#0D47A1]">
                3% Komisi<br />
                <span className="text-lg font-medium text-muted-foreground">dari setiap tugas selesai</span>
              </p>
              <p className="text-xs text-muted-foreground mt-3 font-medium">
                Dihitung otomatis dari harga transaksi, langsung masuk saldo komisimu.
              </p>
              
              <ul className="mt-5 space-y-3">
                {[
                  "Ketenangan pikiran keluarga perantau terjamin",
                  "Lapangan kerja helper warga meningkat di wilayahmu",
                  "Transparansi harga hindari konflik di komunitas",
                  "Pengawasan aktif mencegah praktik calo atau pendampingan ilegal",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 items-start text-sm">
                    <CheckCircle className="text-green-600 w-4 h-4 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps Card */}
            <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
              <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                Alur Koordinator
              </h3>
              
              <div className="flex flex-col gap-6">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0D47A1]/10 text-[#0D47A1] border border-[#0D47A1]/20 flex items-center justify-center font-bold text-sm shrink-0">
                      {s.num}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-1">{s.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Button */}
        <div className="lg:hidden mt-8 flex w-full">
          <Button
            asChild
            size="lg"
            className="bg-brand-gradient text-white font-display font-bold w-full h-13 shadow-xl shadow-[#0D47A1]/20"
          >
            <Link href="/register?role=koordinator">
              Daftar Gratis sebagai Koordinator <ArrowRight className="ml-2" size={16} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
