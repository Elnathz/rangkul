"use client";

import { CheckCircle2, ShieldCheck, UsersRound } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { title: "Helper", description: "Melengkapi identitas, layanan, radius, dan ketersediaan sebelum dapat mendampingi.", detail: "Diverifikasi di komunitas domisili", icon: UsersRound, tone: "from-blue-50 to-white", iconTone: "bg-blue-100 text-primary" },
  { title: "Koordinator", description: "Meninjau kelayakan Helper dan antrean kunjungan yang memang membutuhkan keputusan.", detail: "Menjaga proses di wilayahnya", icon: ShieldCheck, tone: "from-sky-50 to-white", iconTone: "bg-sky-100 text-sky-800" },
  { title: "Keluarga", description: "Memilih pendampingan, mengikuti laporan, serta menyetujui layanan tambahan bila diperlukan.", detail: "Tetap memegang keputusan penting", icon: CheckCircle2, tone: "from-indigo-50 to-white", iconTone: "bg-indigo-100 text-indigo-800" },
] as const;

export default function CommunityTrustSection() {
  return <section className="bg-[linear-gradient(180deg,#fff_0%,#f7fbff_52%,#fff_100%)] py-16 sm:py-20 lg:py-24"><div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-extrabold tracking-[.14em] text-primary">KEPERCAYAAN KOMUNITAS</p><h2 className="mt-3 font-heading text-3xl font-bold tracking-[-.035em] text-foreground sm:text-4xl">Kepercayaan tidak hanya datang dari profil.</h2><p className="mt-4 text-base leading-7 text-muted-foreground">Setiap pihak memiliki peran yang jelas. Proses tidak membebankan semua keputusan kepada satu orang.</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{steps.map(({ title, description, detail, icon: Icon, tone, iconTone }, index) => <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ delay: index * .1, duration: .5, ease: [0.16, 1, 0.3, 1] }} className={`group flex min-h-72 flex-col rounded-[22px] border border-blue-100 bg-gradient-to-br ${tone} p-6 shadow-[0_12px_28px_rgba(13,71,161,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(13,71,161,.12)]`}><span className={`flex size-11 items-center justify-center rounded-xl ${iconTone}`}><Icon className="size-5" aria-hidden="true" /></span><p className="mt-8 text-xs font-extrabold tracking-[.14em] text-primary">{detail}</p><h3 className="mt-3 font-heading text-2xl font-bold text-foreground">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p><span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-primary"><CheckCircle2 className="size-4" aria-hidden="true" />Peran yang dapat ditelusuri</span></motion.article>)}</div></div></section>;
}
