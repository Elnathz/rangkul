"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldCheck, CheckCircle2, FileCheck } from "lucide-react";

const categories = [
  "Menemani Mengobrol",
  "Antar Obat",
  "Belanja",
  "Bantuan Teknologi",
  "Kontrol Kesehatan",
];

const trustItems = [
  { icon: ShieldCheck, text: "Diverifikasi komunitas lokal" },
  { icon: CheckCircle2, text: "Harga transparan sejak awal" },
  { icon: FileCheck, text: "Laporan setiap kunjungan" },
];

export default function HeroSection() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative min-h-[92dvh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-hero-blob pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#90CAF9]/15 blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-[#0D47A1]/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          {/* Left: Copy & Actions */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D47A1]/08 border border-[#0D47A1]/15 text-[#0D47A1] text-xs font-semibold mb-5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pendampingan Lansia Berbasis Komunitas RT/RW</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-foreground leading-[1.15] tracking-tight mb-5">
              Merangkul Jarak,{" "}
              <span className="text-[#0D47A1]">Menjaga</span>{" "}
              yang Tersayang
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              Hubungkan lansia dengan pendamping lokal terverifikasi komunitas.
              Setiap kunjungan menjadi catatan kondisi yang bisa kamu pantau dari mana saja.
            </p>

            {/* Search bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const targetUrl = query.trim()
                  ? `/cari-helper?q=${encodeURIComponent(query.trim())}`
                  : "/cari-helper";
                window.location.href = targetUrl;
              }}
              className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-[0_4px_24px_rgba(13,71,161,0.08)] border border-border mb-4 max-w-xl"
            >
              <div className="flex items-center gap-2 flex-1 pl-3">
                <Search size={16} className="text-muted-foreground shrink-0" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari jasa atau nama helper..."
                  className="border-0 shadow-none focus-visible:ring-0 text-sm bg-transparent p-0 h-auto"
                />
              </div>
              <Button
                type="submit"
                className="bg-[#0D47A1] text-white text-sm font-semibold px-5 rounded-xl hover:bg-[#0D47A1]/90 h-10 shrink-0"
              >
                Cari Helper
              </Button>
            </form>

            {/* Quick category chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/cari-helper?kategori=${encodeURIComponent(cat)}`}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-border text-muted-foreground hover:border-[#0D47A1] hover:text-[#0D47A1] transition-colors shadow-sm"
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* Primary & Secondary CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
              <Button
                asChild
                size="lg"
                className="bg-[#0D47A1] text-white font-heading font-bold px-7 shadow-lg shadow-[#0D47A1]/20 h-12 text-base rounded-xl hover:bg-[#0D47A1]/90"
              >
                <Link href="/cari-helper">Buat Kunjungan</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border text-foreground font-heading font-semibold px-7 h-12 text-base rounded-xl hover:bg-muted/40"
              >
                <Link href="#cara-kerja">Lihat Cara Kerja</Link>
              </Button>
            </div>

            {/* Trust strip */}
            <div className="pt-6 border-t border-border/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {trustItems.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#0D47A1]/10 text-[#0D47A1]">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-medium text-foreground leading-snug">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual Showcase (Truthful Sample Visit Card) */}
          <div className="hidden lg:flex flex-col gap-4 relative">
            <div className="bg-white rounded-3xl border border-border shadow-[0_12px_40px_rgba(13,71,161,0.08)] p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Contoh Catatan Kunjungan
                </span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold">
                  Selesai Dikerjakan
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-[#0D47A1]/10 text-[#0D47A1] font-bold font-heading flex items-center justify-center text-sm border border-[#0D47A1]/20 shrink-0">
                  AP
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-foreground">Andi Pratama</p>
                  <p className="text-xs text-muted-foreground">Helper Terverifikasi RT 03 / RW 05</p>
                </div>
                <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  Layanan Teman Ngobrol
                </span>
              </div>

              <div className="space-y-3 mb-5 bg-[#F8FAFD] rounded-2xl p-4 border border-border/50">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Health Snapshot (Non-Diagnostik)
                </p>
                {[
                  { label: "Energi", score: "4/5", pct: 80, text: "Aktif" },
                  { label: "Mood", score: "5/5", pct: 100, text: "Ceria" },
                  { label: "Mobilitas", score: "4/5", pct: 80, text: "Mandiri" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
                      {item.label}
                    </span>
                    <div className="flex-1 h-2 bg-border/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0D47A1] rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground w-12 text-right">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-[#EEF5FF] rounded-2xl p-4 border border-[#0D47A1]/15">
                <p className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-wide mb-1">
                  Memory Capsule
                </p>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &quot;Ibu hari ini bercerita penuh semangat mengenai resep masakan masa mudanya di Semarang dan menikmati jalan santai di teras.&quot;
                </p>
                <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                  Kunjungan 24 Juli 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
