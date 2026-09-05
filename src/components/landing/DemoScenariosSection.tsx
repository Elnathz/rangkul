import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, HeartHandshake, ShieldCheck } from "lucide-react";

const scenarios = [
  {
    title: "Keluarga yang berjauhan",
    description: "Mulai dari satu kebutuhan kunjungan, lalu membaca kabar yang tersimpan setelah pendampingan selesai.",
    action: "Buat kunjungan",
    href: "/booking/new",
    icon: HeartHandshake,
  },
  {
    title: "Helper di sekitar domisili",
    description: "Menentukan layanan, radius, dan ketersediaan sebelum mengambil kunjungan yang sesuai.",
    action: "Lengkapi profil Helper",
    href: "/register?role=helper",
    icon: BriefcaseBusiness,
  },
  {
    title: "Koordinator komunitas",
    description: "Menjaga proses verifikasi dan meninjau antrean penting agar kepercayaan tetap terawat.",
    action: "Daftar sebagai Koordinator",
    href: "/register?role=koordinator",
    icon: ShieldCheck,
  },
];

export default function DemoScenariosSection() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-[#0D47A1]">Contoh skenario demo</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">Rangkul bergerak bersama orang-orang di sekitarnya.</h2>
          <p className="mt-4 text-base leading-7 text-[var(--ink-secondary)]">Tiga gambaran ini memperlihatkan alur produk. Bukan klaim pengalaman pengguna atau ukuran performa layanan.</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {scenarios.map(({ title, description, action, href, icon: Icon }) => (
            <article key={title} className="group flex min-h-full flex-col rounded-[18px] border border-border bg-[var(--surface-subtle)] p-5 transition duration-200 hover:border-[#90CAF9] hover:bg-white hover:shadow-[0_10px_28px_rgba(13,71,161,0.08)] sm:p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white text-[#0D47A1] shadow-[var(--shadow-card)]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-secondary)]">{description}</p>
              <Link href={href} className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-[#0D47A1] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2">
                {action}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
