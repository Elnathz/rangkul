import Link from "next/link";
import { ArrowDown, FileCheck, HeartPulse, ShieldCheck } from "lucide-react";

import HeroProductStack from "@/components/landing/HeroProductStack";
import { Button } from "@/components/ui/button";

const trustItems = [
  { icon: ShieldCheck, label: "Diverifikasi komunitas lokal" },
  { icon: FileCheck, label: "Harga transparan sejak awal" },
  { icon: HeartPulse, label: "Laporan setiap kunjungan" },
];

export default function HeroSection() {
  return (
    <>
      <section className="relative isolate w-full max-w-full overflow-hidden bg-[var(--surface-subtle)] pb-12 pt-28 sm:pb-16 sm:pt-32">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(144,202,249,0.44),transparent_58%)] lg:block" aria-hidden="true" />
        <div className="relative mx-auto grid w-full min-w-0 max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:gap-16 lg:px-8">
          <div className="min-w-0">
            <h1 className="w-full max-w-xl break-words font-heading text-4xl font-bold leading-[1.1] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[3.5rem]">
              Merangkul Jarak, Menjaga yang Tersayang
            </h1>
            <p className="mt-5 max-w-xl break-words text-base leading-7 text-[var(--ink-secondary)] sm:text-lg">
              Rangkul menghubungkan keluarga dengan pendamping lokal terverifikasi, lalu menyimpan setiap kunjungan sebagai catatan yang dapat dipantau bersama.
            </p>
            <div className="mt-7 flex w-full min-w-0 flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-h-12 w-full rounded-md px-6 text-base font-semibold sm:w-auto">
                <Link href="/booking/new">Buat Kunjungan</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-12 w-full rounded-md border-border bg-white px-6 text-base font-semibold text-foreground hover:bg-[var(--surface-muted)] sm:w-auto">
                <Link href="#cara-kerja" className="inline-flex items-center gap-2">
                  Lihat Cara Kerja
                  <ArrowDown className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <HeroProductStack />
        </div>
      </section>

      <section className="border-y border-border bg-white" aria-label="Dasar kepercayaan Rangkul">
        <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-4 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex min-h-11 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--info-bg)] text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
