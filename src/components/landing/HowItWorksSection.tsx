import { MapPinned, ShieldCheck, UserRoundCheck } from "lucide-react";

const principles = [
  { icon: UserRoundCheck, title: "Verifikasi berbasis komunitas", description: "Helper melalui proses verifikasi oleh Koordinator wilayah. Status verifikasi terlihat sebelum keluarga membuat kunjungan." },
  { icon: MapPinned, title: "Jangkauan layanan yang jelas", description: "Ketersediaan Helper mempertimbangkan layanan yang dipilih, jadwal, dan radius layanan yang mereka tetapkan." },
  { icon: ShieldCheck, title: "Persetujuan tetap di tangan keluarga", description: "Layanan tambahan hanya dapat dilanjutkan setelah keluarga meninjau dan menyetujuinya." },
];

export default function HowItWorksSection() {
  return (
    <section id="apa-itu-rangkul" className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-[#0D47A1]">KEPERCAYAAN YANG TERLIHAT</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Pendampingan yang tetap berada dalam kendali keluarga.</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">Rangkul tidak meminta keluarga menyerahkan keputusan penting. Setiap kunjungan dibangun dengan informasi, batas, dan persetujuan yang jelas.</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
          {principles.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-border bg-surface-subtle p-5 sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0D47A1]" aria-hidden="true"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-5 text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
