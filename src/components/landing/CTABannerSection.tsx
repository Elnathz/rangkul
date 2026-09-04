import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTABannerSection() {
  return (
    <section className="bg-[#0D47A1] py-14 text-white sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#90CAF9]" aria-hidden="true"><HeartHandshake className="h-5 w-5" /></span>
        <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Mulai dari satu kunjungan yang lebih tenang.</h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100">Pilih layanan, atur kunjungan, dan tetap ikuti kabar orang tersayang melalui Rangkul.</p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild className="min-h-11 rounded-xl bg-white px-5 font-bold text-[#0D47A1] hover:bg-blue-50"><Link href="/booking/new">Buat Kunjungan <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button>
          <Link href="/register?role=helper" className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D47A1]">Daftar sebagai Helper</Link>
        </div>
      </div>
    </section>
  );
}
