"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldCheck, Clock, Star } from "lucide-react";

const categories = [
  "Menemani Mengobrol",
  "Antar Obat",
  "Belanja",
  "Bantuan Teknologi",
  "Kontrol Kesehatan",
];

const stats = [
  { icon: ShieldCheck, label: "Terverifikasi RT/RW", value: "100%" },
  { icon: Star, label: "Rating rata-rata", value: "4.8" },
  { icon: Clock, label: "Respon booking", value: "< 1 jam" },
];

export default function HeroSection() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative min-h-[100dvh] flex items-center pt-24 pb-20 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 bg-hero-blob pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#90CAF9]/10 blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#0D47A1]/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left — Copy */}
          <div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-foreground leading-[1.1] tracking-tight mb-5">
              Merangkul Jarak,{" "}
              <span className="text-[#0D47A1]">Menjaga</span>{" "}
              yang Tersayang
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
              Hubungkan lansia dengan pendamping lokal terverifikasi komunitas.
              Setiap kunjungan menjadi catatan kondisi yang bisa kamu pantau dari mana saja.
            </p>

            {/* Search bar */}
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-[0_4px_24px_rgba(13,71,161,0.10)] border border-border mb-4 max-w-xl">
              <div className="flex items-center gap-2 flex-1 pl-3">
                <Search size={16} className="text-muted-foreground shrink-0" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari jasa atau nama helper…"
                  className="border-0 shadow-none focus-visible:ring-0 text-sm bg-transparent p-0 h-auto"
                />
              </div>
              <Button
                asChild
                className="bg-brand-gradient text-white text-sm font-semibold px-5 rounded-xl hover:opacity-90 h-10"
              >
                <Link href="/cari-helper">Cari Helper</Link>
              </Button>
            </div>

            {/* Quick category chips */}
            <div className="flex flex-wrap gap-2 mb-10">
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

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand-gradient text-white font-display font-bold px-8 shadow-xl shadow-[#0D47A1]/20 w-full sm:w-auto h-12 text-base rounded-xl"
              >
                <Link href="/register?role=keluarga">Daftar sebagai Keluarga</Link>
              </Button>
            </div>
          </div>

          {/* Right — Visual showcase */}
          <div className="hidden lg:flex flex-col gap-4 relative">
            {/* Main card */}
            <div className="glass-card rounded-3xl border border-border shadow-[0_12px_48px_rgba(13,71,161,0.12)] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-border bg-[#F5F8FC] shrink-0">
                  <Image
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=AndiP&backgroundColor=b6e3f4"
                    alt="Andi P"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="font-display font-bold text-sm">Andi P.</p>
                  <p className="text-xs text-muted-foreground">RT 03 · Rating 4.8</p>
                </div>
                <Badge className="ml-auto bg-green-50 text-green-700 border-green-200 text-[10px]">
                  Terpercaya
                </Badge>
              </div>

              <div className="space-y-3 mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Catatan Kunjungan — Ibu Siti
                </p>
                {["Energi", "Mood", "Mobilitas"].map((label, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16 shrink-0">
                      {label}
                    </span>
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0D47A1] rounded-full"
                        style={{ width: `${[65, 80, 50][i]}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#0D47A1]">
                      {[65, 80, 50][i]}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-[#F5F8FC] rounded-xl p-3">
                <p className="text-xs text-muted-foreground italic">
                  "Hari ini Ibu cerita soal masa kecilnya di Solo. Tampak
                  sangat ceria dan bersemangat."
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  24 Jul 2026 — Helper Andi
                </p>
              </div>
            </div>

            {/* Floating stats */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-border p-4 shadow-sm text-center hover-lift"
                >
                  <Icon size={18} className="text-[#0D47A1] mx-auto mb-1.5" />
                  <p className="font-display font-bold text-sm">{value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
