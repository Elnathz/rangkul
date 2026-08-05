import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MapPin, Building2, BarChart3, CheckCircle, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Building2,
    title: "100% Gratis Selamanya",
    desc: "Tidak ada biaya platform atau potongan apapun bagi pengurus RT/RW.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: ShieldCheck,
    title: "Sistem Transparan",
    desc: "Cegah pendampingan ilegal. Kamu yang verifikasi siapa saja Helper di wilayahmu.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: MapPin,
    title: "Pantau Jangkauan Lokal",
    desc: "Lihat dashboard ringkas tentang siapa melayani siapa di wilayahmu.",
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: BarChart3,
    title: "Arsip Komunitas",
    desc: "Layanan tercatat rapi untuk arsip keamanan bulanan RT/RW.",
    color: "text-amber-600 bg-amber-50",
  },
];

const steps = [
  {
    num: "1",
    title: "Registrasi RT/RW",
    desc: "Daftar sebagai Koordinator menggunakan data asli kepengurusan.",
  },
  {
    num: "2",
    title: "Terima Notifikasi Helper",
    desc: "Jika ada warga yang daftar jadi Helper di wilayahmu, kamu akan dapat notifikasi.",
  },
  {
    num: "3",
    title: "Verifikasi & Pantau",
    desc: "Lakukan wawancara singkat atau approve profilnya jika kamu mengenali warga tersebut. Dashboardmu kini aktif!",
  },
];

export default function JoinKoordinatorSection() {
  return (
    <section className="py-24 bg-[#F5F8FC] relative overflow-hidden text-foreground min-h-[100dvh] flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 lg:items-start w-full">
          {/* Left Column: Hooks and Features */}
          <div className="max-w-xl lg:pr-10">
            <h2 className="font-display text-4xl md:text-[3rem] font-extrabold text-[#0D47A1] leading-[1.1] mb-6">
              Jadilah Pahlawan Keamanan di Komunitasmu.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Ciptakan ekosistem perawatan lansia yang aman dan terpercaya dengan menjaga kualitas helper yang bertugas langsung di lingkungan koordinator wilayahmu.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-0 lg:mb-10">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white border border-border rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${b.color}`}>
                    <b.icon size={16} />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5">{b.title}</h3>
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

          {/* Right Column: Steps and Panel */}
          <div className="flex flex-col gap-6">
            {/* Status Panel - Hero Focus */}
            <div className="bg-white border text-foreground border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Keuntungan Utama Koordinator
                </span>
                <span className="text-[9px] px-2 py-1 bg-green-100 text-green-700 rounded font-semibold border border-green-200">
                  SOSIAL
                </span>
              </div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold mb-2 text-[#0D47A1]">
                Majukan Kesejahteraan <br />Lansia di Wilayahmu
              </p>
              <p className="text-xs text-muted-foreground mt-3 font-medium">Platform 100% didesain untuk kolaborasi.</p>
              
              <ul className="mt-5 space-y-3">
                {[
                  "Ketenangan pikiran keluarga perantau terjamin",
                  "Meningkatnya lapangan kerja Helper untuk wargamu",
                  "Transparansi harga layanan hindari konflik di RT",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 items-start text-sm">
                    <CheckCircle className="text-green-600 w-4 h-4 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sub Steps Card */}
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

        {/* Mobile Button - Placed at the very bottom */}
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
