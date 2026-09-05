"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowDown, FileCheck, HeartPulse, ShieldCheck } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroProductStack from "@/components/landing/HeroProductStack";
import { Button } from "@/components/ui/button";

const trustItems = [{ icon: ShieldCheck, label: "Diverifikasi komunitas lokal" }, { icon: FileCheck, label: "Harga transparan sejak awal" }, { icon: HeartPulse, label: "Laporan setiap kunjungan" }];

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const figureY = useTransform(scrollYProgress, [0, 1], [0, 54]);
  const snapshotY = useTransform(scrollYProgress, [0, 1], [0, -38]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);

  return <><section ref={heroRef} className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_78%_34%,rgba(144,202,249,.58),transparent_24%),radial-gradient(circle_at_18%_12%,rgba(227,243,255,.95),transparent_32%),linear-gradient(145deg,#fff_0%,#f2f9ff_52%,#fff_100%)] pb-14 pt-28 sm:pb-18 sm:pt-32 lg:min-h-[650px] lg:pb-24">
    <div className="mx-auto grid max-w-[1220px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-8 lg:px-8"><motion.div initial={{ opacity: 1, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}><p className="text-xs font-extrabold tracking-[.14em] text-primary">PENDAMPINGAN LOKAL UNTUK KELUARGA</p><h1 className="mt-4 max-w-[650px] font-heading text-[2.45rem] font-bold leading-[1.06] tracking-[-.045em] text-foreground sm:text-5xl lg:text-[4rem]">Merangkul Jarak, Menjaga yang Tersayang</h1><p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Pendamping lokal terverifikasi untuk membantu keluarga tetap dekat, mengikuti kabar, dan menjaga orang tersayang dari mana saja.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg" className="min-h-12 rounded-md px-6 text-base font-bold"><Link href="/booking/new">Buat Kunjungan</Link></Button><Button asChild size="lg" variant="outline" className="min-h-12 rounded-md border-border bg-white/80 px-6 text-base font-bold"><Link href="#cara-kerja">Lihat Cara Kerja <ArrowDown className="ml-2 size-4" aria-hidden="true" /></Link></Button></div></motion.div>
      <motion.div initial={{ opacity: 1, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .6, delay: .08 }} className="relative mx-auto min-h-[450px] w-full max-w-[580px] sm:min-h-[500px] lg:min-h-[560px]"><motion.div style={{ scale: glowScale }} className="absolute inset-x-12 bottom-5 h-24 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" /><motion.div style={{ y: snapshotY, willChange: "transform" }} className="absolute left-0 top-8 z-30 w-[80%] rounded-[28px] bg-white/45 p-2 backdrop-blur-[2px] sm:top-16 sm:w-[68%] lg:top-20 lg:w-[61%]"><HeroProductStack /></motion.div><motion.div style={{ y: figureY, willChange: "transform" }} className="absolute bottom-0 right-0 z-20 h-[405px] sm:h-[490px] lg:h-[555px]"><Image src="/images/landing/ibu-ratna-hero-v1.png" alt="Ilustrasi Ibu Ratna, contoh orang tersayang dalam Rangkul" width={1024} height={1536} priority className="h-full w-auto object-contain" /></motion.div></motion.div>
    </div></section><section className="border-y border-blue-100 bg-white" aria-label="Dasar kepercayaan Rangkul"><div className="mx-auto grid max-w-[1220px] gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">{trustItems.map(({ icon: Icon, label }) => <div key={label} className="flex min-h-11 items-center gap-3 px-2"><Icon className="size-[18px] shrink-0 text-primary" aria-hidden="true" /><p className="text-sm font-bold text-foreground">{label}</p></div>)}</div></section></>;
}
