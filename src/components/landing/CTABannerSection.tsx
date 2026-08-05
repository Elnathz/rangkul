import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

export default function CTABannerSection() {
  return (
    <section className="py-20 bg-[#0D47A1] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <div className="flex items-center justify-center gap-2 mb-5">
          <Heart size={18} className="text-[#90CAF9] fill-[#90CAF9]" />
          <span className="text-[#90CAF9] text-sm font-semibold">
            Untuk lansia Indonesia
          </span>
        </div>

        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
          Siap Merangkul?
        </h2>
        <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto">
          Daftar sekarang dan pastikan orang tua yang kamu sayangi selalu
          terjaga — dari mana pun kamu berada.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-white text-[#0D47A1] hover:bg-[#90CAF9] font-display font-bold px-8 gap-2 shadow-[0_4px_14px_0_rgba(255,255,255,0.39)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.23)] hover:-translate-y-1 transition-all duration-300"
          >
            <Link href="/register?role=keluarga">
              Keluarga
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-white/60 text-[#0D47A1] hover:bg-[#90CAF9] hover:text-[#0D47A1] font-semibold px-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <Link href="/register?role=helper">
              Helper
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-white/60 text-[#0D47A1] hover:bg-[#90CAF9] hover:text-[#0D47A1] hover:border-[#90CAF9] font-semibold px-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <Link href="/register?role=koordinator">
              Koordinator RT/RW
            </Link>
          </Button>
        </div>

        <p className="text-white/40 text-xs mt-8">
          Gratis mendaftar · Terverifikasi komunitas · Harga transparan
        </p>
      </div>
    </section>
  );
}
