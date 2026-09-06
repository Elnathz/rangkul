"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
  MapPin,
  NotebookTabs,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const serviceCatalog = [
  { name: "Antar Obat", harga_dasar: 35000, duration: "30 menit" },
  { name: "Pengingat Obat", harga_dasar: 25000, duration: "30 menit" },
  { name: "Belanja Kebutuhan", harga_dasar: 40000, duration: "60 menit" },
  { name: "Menemani Mengobrol", harga_dasar: 50000, duration: "60 menit" },
  { name: "Membersihkan Rumah Ringan", harga_dasar: 70000, duration: "90 menit" },
  { name: "Bantuan Teknologi", harga_dasar: 30000, duration: "45 menit" },
  { name: "Kontrol Kesehatan", harga_dasar: 120000, duration: "90 menit" },
] as const;

const visitOptions = [1, 4, 8] as const;

type EarningConfig = {
  rate: number;
  rateLabel: string;
  title: string;
  description: string;
  eyebrow: string;
  resultLabel: string;
  supportingLabel: string;
  tone: string;
  accent: string;
};

type RoleConfig = {
  title: string;
  description: string;
  detail: string;
  features: readonly string[];
  href: string;
  action: string;
  icon: typeof UsersRound;
  tone: string;
  panel: string;
  earning?: EarningConfig;
};

const roles: readonly RoleConfig[] = [
  {
    title: "Keluarga",
    description: "Atur kunjungan untuk orang tersayang dan ikuti kabarnya dari laporan yang tersusun rapi.",
    detail: "Satu tempat untuk membuat kunjungan, memantau status, dan membaca Riwayat Rangkul.",
    features: ["Tentukan kebutuhan kunjungan", "Pilih Helper yang tersedia", "Terima cerita setiap kunjungan"],
    href: "/register?role=keluarga",
    action: "Daftar sebagai Keluarga",
    icon: UsersRound,
    tone: "bg-blue-50 text-primary",
    panel: "from-blue-50 via-white to-white",
  },
  {
    title: "Helper",
    description: "Dampingi lansia di sekitar domisili setelah profil dan layanan Anda diverifikasi komunitas.",
    detail: "Atur layanan dan jangkauan sendiri. Tugas yang sesuai baru ditampilkan saat Anda siap menerima kunjungan.",
    features: ["Atur radius dan ketersediaan", "Pilih tugas sesuai layanan aktif", "Catat hasil kunjungan dengan jelas"],
    href: "/register?role=helper",
    action: "Daftar sebagai Helper",
    icon: BriefcaseBusiness,
    tone: "bg-sky-50 text-sky-800",
    panel: "from-sky-50 via-white to-white",
    earning: {
      rate: 0.9,
      rateLabel: "90%",
      title: "Potensi hasil Helper",
      description: "Lihat gambaran bagian Helper dari kunjungan yang selesai.",
      eyebrow: "CONTOH SIMULASI",
      resultLabel: "Perkiraan bagian Helper",
      supportingLabel: "dari total layanan",
      tone: "from-[#0D47A1] via-[#1769C0] to-[#4EA5E8]",
      accent: "bg-sky-50 text-sky-800",
    },
  },
  {
    title: "Koordinator",
    description: "Jaga kepercayaan komunitas dengan meninjau Helper dan tindakan penting di wilayah Anda.",
    detail: "Fokus pada keputusan yang memang membutuhkan pengawasan agar pendampingan tetap bertanggung jawab.",
    features: ["Verifikasi Helper di wilayah domisili", "Tinjau antrean yang butuh keputusan", "Pantau layanan bertanggung jawab"],
    href: "/register?role=koordinator",
    action: "Daftar sebagai Koordinator",
    icon: ShieldCheck,
    tone: "bg-indigo-50 text-indigo-800",
    panel: "from-indigo-50 via-white to-white",
    earning: {
      rate: 0.03,
      rateLabel: "3%",
      title: "Komisi dari layanan selesai",
      description: "Komisi Koordinator berasal dari transaksi yang selesai di wilayah Anda.",
      eyebrow: "CONTOH SIMULASI",
      resultLabel: "Perkiraan komisi Koordinator",
      supportingLabel: "dari total layanan",
      tone: "from-[#243B9B] via-[#4F63C7] to-[#90CAF9]",
      accent: "bg-indigo-50 text-indigo-800",
    },
  },
];

const featureIcons = [MapPin, ShieldCheck, NotebookTabs];
const formatRupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

function EarningSimulator({ config }: { config: EarningConfig }) {
  const [serviceIndex, setServiceIndex] = useState(0);
  const [visits, setVisits] = useState<(typeof visitOptions)[number]>(4);
  const service = serviceCatalog[serviceIndex] ?? serviceCatalog[0];
  const total = service.harga_dasar * visits;
  const result = Math.round(total * config.rate);

  const summary = useMemo(() => `${formatRupiah(result)} untuk ${visits} kunjungan`, [result, visits]);

  return (
    <aside className="relative overflow-hidden rounded-[26px] border border-blue-100 bg-white/95 p-5 shadow-[0_18px_40px_rgba(13,71,161,.14)] sm:p-6" aria-label={config.title}>
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${config.tone}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <p className="text-[10px] font-extrabold tracking-[.16em] text-primary">{config.eyebrow}</p>
          <h4 className="mt-2 font-heading text-xl font-bold tracking-[-.02em] text-foreground">{config.title}</h4>
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${config.accent}`}>
          <CircleDollarSign className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.description}</p>

      <div className="mt-6 space-y-5">
        <label className="block text-sm font-bold text-foreground" htmlFor="earning-service">
          Contoh layanan
          <select id="earning-service" value={serviceIndex} onChange={(event) => setServiceIndex(Number(event.target.value))} className="mt-2 min-h-12 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-semibold text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20">
            {serviceCatalog.map((item, index) => <option key={item.name} value={index}>{item.name} · {formatRupiah(item.harga_dasar)} · {item.duration}</option>)}
          </select>
        </label>

        <fieldset>
          <legend className="text-sm font-bold text-foreground">Jumlah kunjungan</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {visitOptions.map((option) => <button key={option} type="button" aria-pressed={visits === option} onClick={() => setVisits(option)} className={`flex min-h-12 flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${visits === option ? "border-primary bg-primary text-white shadow-[0_8px_16px_rgba(13,71,161,.2)]" : "border-blue-100 bg-white text-muted-foreground hover:border-primary/50 hover:text-primary"}`}><span className="text-base font-extrabold leading-5 tabular-nums">{option}</span><span className="text-[11px] font-bold leading-4">kunjungan</span></button>)}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 ring-1 ring-inset ring-blue-100 sm:p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>Total harga dasar</span><span className="font-bold tabular-nums text-foreground">{formatRupiah(total)}</span></div>
        <div className="mt-4"><p className="text-xs font-bold text-primary">{config.resultLabel}</p><div className="mt-1 flex items-center justify-between gap-3"><AnimatePresence mode="wait" initial={false}><motion.p key={summary} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .24 }} className="font-heading text-2xl font-extrabold tracking-[-.03em] text-foreground" aria-live="polite">{formatRupiah(result)}</motion.p></AnimatePresence><span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-primary ring-1 ring-blue-100">{config.rateLabel}</span></div></div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{config.rateLabel} {config.supportingLabel}. Harga tambahan belum termasuk.</p>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs leading-5 text-blue-950"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><p><strong>Simulasi, bukan jaminan.</strong> Nominal mengikuti kunjungan yang selesai dan pembayaran dirilis.</p></div>
      <div className="mt-4 flex items-start gap-2 text-xs font-semibold leading-5 text-muted-foreground"><Clock3 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><span>Pembayaran online diproses setelah status kunjungan selesai.</span></div>
    </aside>
  );
}

export default function RolesSection() {
  const [active, setActive] = useState(0);
  const role = roles[active] ?? roles[0];
  const Icon = role.icon;

  return <section id="peran" className="overflow-hidden bg-[radial-gradient(circle_at_8%_45%,rgba(144,202,249,.34),transparent_22%),linear-gradient(150deg,#f8fbff_0%,#e9f5ff_52%,#fff_100%)] py-16 sm:py-20 lg:py-24"><div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-extrabold tracking-[.14em] text-primary">PILIH PERAN</p><h2 className="mt-3 font-heading text-3xl font-bold tracking-[-.035em] text-foreground sm:text-4xl">Tiga peran yang saling menjaga.</h2><p className="mt-4 text-base leading-7 text-muted-foreground">Pilih peran untuk melihat cara Rangkul mendukung aktivitasnya.</p></div><div className="mt-9 overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-[0_20px_54px_rgba(13,71,161,.12)] lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]"><div role="tablist" aria-label="Peran di ekosistem Rangkul" className="flex gap-2 overflow-x-auto border-b border-blue-100 bg-white/80 p-3 lg:block lg:border-b-0 lg:border-r lg:p-4">{roles.map((item, index) => <button key={item.title} id={`role-tab-${index}`} role="tab" type="button" onClick={() => setActive(index)} aria-selected={active === index} aria-controls={`role-panel-${index}`} tabIndex={active === index ? 0 : -1} className={`relative flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition lg:mb-2 lg:w-full ${active === index ? "text-white" : "text-muted-foreground hover:bg-blue-50 hover:text-primary"}`}>{active === index ? <motion.span layoutId="role-active" className="absolute inset-0 rounded-xl bg-primary shadow-[0_10px_20px_rgba(13,71,161,.20)]" transition={{ type: "spring", stiffness: 380, damping: 30 }} /> : null}<item.icon className="relative size-4" aria-hidden="true" /><span className="relative">{item.title}</span></button>)}</div><motion.div id={`role-panel-${active}`} role="tabpanel" aria-labelledby={`role-tab-${active}`} key={role.title} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .34, ease: [0.16, 1, 0.3, 1] }} className={`bg-gradient-to-br ${role.panel} p-5 sm:p-8 lg:p-10 xl:p-12`}><div className={`${role.earning ? "grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(25rem,.92fr)] lg:items-start" : "max-w-3xl"}`}><div><span className={`flex size-12 items-center justify-center rounded-2xl ${role.tone}`}><Icon className="size-6" aria-hidden="true" /></span><p className="mt-7 text-xs font-extrabold tracking-[.14em] text-primary">UNTUK {role.title.toUpperCase()}</p><h3 className="mt-3 max-w-[38rem] font-heading text-2xl font-bold leading-[1.12] tracking-[-.02em] text-foreground sm:text-3xl">{role.description}</h3><p className="mt-4 max-w-[40rem] text-base leading-7 text-muted-foreground">{role.detail}</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{role.features.map((feature, index) => { const FeatureIcon = featureIcons[index]; return <div key={feature} className="min-h-[108px] rounded-2xl border border-blue-100 bg-white/85 p-4 shadow-[0_8px_18px_rgba(13,71,161,.05)]"><FeatureIcon className="size-4 text-primary" aria-hidden="true" /><p className="mt-3 text-sm font-bold leading-5 text-foreground">{feature}</p></div>; })}</div><Link href={role.href} className="mt-8 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-bold text-white transition hover:bg-[#083578] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">{role.action}<ArrowRight className="ml-2 size-4" aria-hidden="true" /></Link></div>{role.earning ? <div className="w-full lg:justify-self-end"><EarningSimulator config={role.earning} /></div> : null}</div></motion.div></div></div></section>;
}
