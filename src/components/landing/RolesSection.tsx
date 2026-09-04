import Link from "next/link";
import { BriefcaseBusiness, Check, ShieldCheck, UsersRound, Waypoints } from "lucide-react";

import { Button } from "@/components/ui/button";

const roles = [
  {
    title: "Keluarga",
    description: "Atur kunjungan untuk orang tersayang dan ikuti perkembangannya dari laporan yang tersusun rapi.",
    features: ["Buat kunjungan sesuai kebutuhan", "Pantau laporan dan Riwayat Rangkul", "Tetap memegang kendali atas persetujuan layanan"],
    href: "/register?role=keluarga",
    action: "Daftar sebagai Keluarga",
    icon: UsersRound,
  },
  {
    title: "Helper",
    description: "Dampingi lansia di sekitar domisili Anda setelah profil dan layanan Anda diverifikasi komunitas.",
    features: ["Atur radius dan ketersediaan layanan", "Pilih tugas sesuai layanan yang aktif", "Catat hasil kunjungan dengan jelas"],
    href: "/register?role=helper",
    action: "Daftar sebagai Helper",
    icon: BriefcaseBusiness,
  },
  {
    title: "Koordinator",
    description: "Jaga kepercayaan komunitas dengan meninjau Helper dan tindakan penting dalam wilayah Anda.",
    features: ["Verifikasi Helper di wilayah domisili", "Tinjau antrean yang membutuhkan keputusan", "Pantau layanan secara bertanggung jawab"],
    href: "/register?role=koordinator",
    action: "Daftar sebagai Koordinator",
    icon: ShieldCheck,
  },
  {
    title: "Admin",
    description: "Menjaga tata kelola platform melalui moderasi, banding, dan jejak audit yang dapat ditinjau.",
    features: ["Tinjau laporan serta banding yang masuk", "Pantau pengajuan dan kondisi platform", "Catat keputusan penting secara akuntabel"],
    href: "/login",
    action: "Masuk sebagai Admin",
    icon: Waypoints,
  },
];

export default function RolesSection() {
  return (
    <section id="peran" className="bg-[var(--surface-subtle)] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">Satu ekosistem, empat peran yang saling menjaga</h2>
          <p className="mt-4 text-base leading-7 text-[var(--ink-secondary)]">Setiap peran memiliki tanggung jawab yang jelas agar pendampingan tetap hangat, transparan, dan dapat dipercaya.</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roles.map(({ title, description, features, href, action, icon: Icon }) => (
            <article key={title} className="flex min-h-full flex-col rounded-lg border border-border bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
              <span className="flex size-11 items-center justify-center rounded-md bg-[var(--info-bg)] text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-secondary)]">{description}</p>
              <ul className="mt-5 space-y-3" aria-label={`Manfaat untuk ${title}`}>
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm leading-6 text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-6 min-h-11 w-full rounded-md border-primary/25 font-semibold text-primary hover:bg-[var(--info-bg)]">
                <Link href={href}>{action}</Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
