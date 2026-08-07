import Link from "next/link";
import { Button } from "@/components/ui/button";

const roles = [
  {
    id: "keluarga",
    title: "Keluarga",
    subtitle: "Untuk anggota keluarga lansia",
    description:
      "Daftarkan orang tua atau anggota keluarga lansia, pilih helper terdekat, dan pantau kondisi mereka lewat laporan kunjungan yang terstruktur.",
    features: [
      "Booking helper dengan jadwal fleksibel",
      "Terima laporan kondisi setelah setiap kunjungan",
      "Pantau riwayat kunjungan dari mana saja",
    ],
    cta: { label: "Daftar sebagai Keluarga", href: "/register?role=keluarga" },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    // Teal/hijau — mewakili keluarga & kehangatan
    iconBg: "from-[#00897B] to-[#26A69A]",
    checkColor: "text-[#00897B]",
    btnClass: "bg-[#00897B] hover:bg-[#00796B] text-white",
    badgeClass: "bg-[#00897B]/10 text-[#00796B] border-[#00897B]/20",
    highlight: false,
  },
  {
    id: "helper",
    title: "Helper",
    subtitle: "Untuk pendamping lokal",
    description:
      "Jadilah helper terverifikasi di lingkungan RT/RW kamu. Terima tugas dari keluarga sekitar dan tingkatkan pendapatanmu dengan jadwal kerja fleksibel.",
    features: [
      "Estimasi penghasilan Rp 500rb - 3jt per bulan",
      "Harga fix per kategori, tanpa tawar-menawar",
      "Diverifikasi Koordinator RT/RW domisili",
      "Bisa terima tugas lintas RT dalam radius layanan",
    ],
    cta: { label: "Daftar sebagai Helper", href: "/register?role=helper" },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    // Amber/oranye — semangat & kerja keras
    iconBg: "from-[#F57C00] to-[#FF9800]",
    checkColor: "text-[#F57C00]",
    btnClass: "bg-[#F57C00] hover:bg-[#E65100] text-white",
    badgeClass: "bg-[#F57C00]/10 text-[#E65100] border-[#F57C00]/20",
    highlight: false,
    badgeText: "Bantu Sesama",
  },
  {
    id: "koordinator",
    title: "Koordinator RT/RW",
    subtitle: "Untuk pengurus komunitas",
    description:
      "Sebagai Ketua RT atau RW, kamu memiliki peran kunci. Verifikasi helper, pantau pelayanan di wilayahmu, dan dapatkan komisi 3% dari setiap layanan yang selesai.",
    features: [
      "Komisi 3% dari setiap tugas helper yang selesai",
      "Verifikasi helper di wilayah RT/RW dengan mudah",
      "Pantau seluruh aktivitas kunjungan secara real-time",
      "Laporan transaksi operasional untuk arsip bulanan",
    ],
    cta: {
      label: "Daftar sebagai Koordinator",
      href: "/register?role=koordinator",
    },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    // Indigo/biru tua — wibawa & kepercayaan
    iconBg: "from-[#5C6BC0] to-[#3949AB]",
    checkColor: "text-[#5C6BC0]",
    btnClass: "bg-[#3949AB] hover:bg-[#283593] text-white",
    badgeClass: "bg-[#5C6BC0]/10 text-[#3949AB] border-[#5C6BC0]/20",
    highlight: false,
  },
];

export default function RolesSection() {
  return (
    <section id="peran" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Bergabung Sesuai Peranmu
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Rangkul dirancang untuk tiga peran yang saling melengkapi dalam
            ekosistem pendampingan lansia berbasis komunitas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-2xl border border-border bg-[#F5F8FC] hover:bg-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.09)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5 p-7"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.iconBg} flex items-center justify-center shadow-sm shrink-0`}
                >
                  {role.icon}
                </div>
                {role.id === "helper" && (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${role.badgeClass}`}>
                    {role.badgeText}
                  </span>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {role.subtitle}
                </p>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">
                  {role.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
              </div>

              <ul className="flex flex-col gap-2">
                {role.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 mt-0.5 shrink-0 ${role.checkColor}`}>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Button
                  asChild
                  size="sm"
                  className={`w-full font-semibold ${role.btnClass}`}
                >
                  <Link href={role.cta.href}>{role.cta.label}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
