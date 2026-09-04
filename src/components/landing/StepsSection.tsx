import { CalendarPlus, FileText, UserRoundCheck } from "lucide-react";

const steps = [
  {
    icon: CalendarPlus,
    title: "Ceritakan kebutuhan kunjungan",
    description: "Pilih profil lansia, layanan, dan jadwal yang sesuai. Harga dasar terlihat sejak awal agar keluarga dapat mengambil keputusan dengan tenang.",
  },
  {
    icon: UserRoundCheck,
    title: "Pendamping yang sesuai mengambil tugas",
    description: "Helper yang sudah terverifikasi menerima tugas sesuai layanan, ketersediaan, dan jangkauan layanan yang ditetapkan.",
  },
  {
    icon: FileText,
    title: "Ikuti kabar setelah kunjungan",
    description: "Laporan kunjungan dan Riwayat Rangkul membantu keluarga memahami aktivitas serta perubahan keseharian dari waktu ke waktu.",
  },
];

export default function StepsSection() {
  return (
    <section id="cara-kerja" className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-[#0D47A1]">CARA KERJA</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Dari rasa khawatir menjadi langkah yang jelas.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Rangkul membuat pendampingan tetap terasa dekat, tanpa menghilangkan kendali keluarga atas kunjungan dan informasi yang dibagikan.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="relative rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0D47A1]" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">LANGKAH {index + 1}</p>
                  <h3 className="mt-1 text-lg font-bold leading-snug text-foreground">{title}</h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
