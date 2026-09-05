"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronDown, Filter, Heart, Loader2, MapPin, Search, ShieldCheck, Star } from "lucide-react";
import DateTimePicker from "@/components/keluarga/booking/DateTimePicker";
import LansiaSelect from "@/components/keluarga/booking/LansiaSelect";
import CustomServiceTierSelect from "@/components/keluarga/booking/CustomServiceTierSelect";
import CatalogModeSwitcher from "@/components/keluarga/booking/CatalogModeSwitcher";

type Lansia = { id: string; nama: string; alamat: string; lat: number | null; lng: number | null };
type Category = { id: string; nama: string; tingkat: string; harga_dasar: number; is_high_risk: boolean };
type Helper = {
  id: string;
  bio: string | null;
  rating_avg: number;
  total_tugas_selesai: number;
  radius_layanan_km: number;
  jarak_km: number | null;
  foto_url: string | null;
  tingkat_kepercayaan: "probation" | "terpercaya";
  users: { full_name: string | null } | null;
  kategori: Category[];
};

const fallbackPhoto = "/images/helpers/orang1.jpeg";

export default function CariHelperPage() {
  const [lansias, setLansias] = useState<Lansia[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [selectedLansia, setSelectedLansia] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [radius, setRadius] = useState(5);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rekomendasi");
  const [jadwalWaktu, setJadwalWaktu] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/lansia").then((response) => response.json()),
      fetch("/api/categories").then((response) => response.json()),
    ])
      .then(([lansiaData, categoryData]) => {
        setLansias(lansiaData.profiles ?? []);
        setCategories(categoryData.categories ?? []);
      })
      .catch(() => setError("Filter katalog tidak dapat dimuat. Muat ulang halaman untuk mencoba lagi."));
  }, []);

  const selected = lansias.find((item) => item.id === selectedLansia);

  useEffect(() => {
    const controller = new AbortController();
    async function loadHelpers() {
      const params = new URLSearchParams({ radius_km: String(radius) });
      if (search.trim()) params.set("q", search.trim());
      if (categoryId) params.set("category_id", categoryId);
      if (tingkat) params.set("tingkat", tingkat);
      if (jadwalWaktu) params.set("jadwal_waktu", new Date(jadwalWaktu).toISOString());
      if (selected?.lat != null && selected?.lng != null) {
        params.set("lat", String(selected.lat));
        params.set("lng", String(selected.lng));
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/helpers?${params.toString()}`, { signal: controller.signal });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || "Katalog Helper tidak dapat dimuat.");
        setHelpers(body.helpers ?? body.data?.helpers ?? []);
        setError(null);
      } catch (reason: unknown) {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Katalog Helper tidak dapat dimuat.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadHelpers();
    return () => controller.abort();
  }, [categoryId, jadwalWaktu, radius, search, selected?.lat, selected?.lng, tingkat]);

  const sortedHelpers = useMemo(
    () => [...helpers].sort((a, b) => sort === "rating" ? b.rating_avg - a.rating_avg : (a.jarak_km ?? 999) - (b.jarak_km ?? 999)),
    [helpers, sort],
  );
  const bookingQuery = jadwalWaktu ? `?jadwal_waktu=${encodeURIComponent(jadwalWaktu)}` : "";

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-gradient-to-br from-[#0D47A1] to-[#1976D2] px-4 py-10 text-white sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Marketplace Rangkul</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Cari Helper di sekitar lansia</h1>
          <p className="mt-3 max-w-2xl text-blue-100">Pilih jadwal agar Helper probation otomatis disaring dari kebutuhan mendesak.</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Filter className="h-5 w-5 text-[#0D47A1]" aria-hidden="true" />
            <h2 className="font-bold text-slate-900">Filter Pencarian</h2>
          </div>

          {/* 1. Jadwal Kunjungan (Custom DateTimePicker) */}
          <DateTimePicker
            value={jadwalWaktu}
            onChange={setJadwalWaktu}
            label="Jadwal Kunjungan"
            helperText="Helper probation tidak muncul bila jadwal kurang dari tiga jam."
          />

          {/* 2. Pilih Lansia (Custom LansiaSelect with allowEmpty) */}
          <LansiaSelect
            lansiaList={lansias}
            selectedId={selectedLansia}
            onSelect={setSelectedLansia}
            label="Pilih Lansia"
            allowEmpty={true}
            emptyLabel="Semua lokasi"
            emptyDescription="Cari tanpa membatasi lokasi lansia"
          />

          {/* 3. Tingkat Layanan (Segmented Pill Buttons) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Tingkat Layanan
            </label>
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100/90 p-1.5">
              {[
                { key: "", label: "Semua Tingkat", dot: null, activeClass: "bg-[#0D47A1] text-white shadow-xs" },
                { key: "ringan", label: "Ringan", dot: "bg-emerald-500", activeClass: "bg-emerald-700 text-white shadow-xs" },
                { key: "sedang", label: "Sedang", dot: "bg-[#0D47A1]", activeClass: "bg-[#0D47A1] text-white shadow-xs" },
                { key: "berat", label: "Berat", dot: "bg-amber-600", activeClass: "bg-amber-700 text-white shadow-xs" },
              ].map((tier) => {
                const isActive = tingkat === tier.key;
                return (
                  <button
                    key={tier.key || "all"}
                    type="button"
                    onClick={() => setTingkat(tier.key)}
                    className={`flex h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold transition-all ${
                      isActive
                        ? tier.activeClass
                        : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80 shadow-2xs"
                    }`}
                  >
                    {tier.dot && (
                      <span
                        className={`size-2 rounded-full shrink-0 ${
                          isActive ? "bg-white" : tier.dot
                        }`}
                      />
                    )}
                    <span>{tier.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Kategori Layanan (Custom ServiceTierSelect with allowEmpty) */}
          <CustomServiceTierSelect
            categories={categories}
            selectedId={categoryId}
            onSelect={setCategoryId}
            label="Kategori Layanan"
            allowEmpty={true}
            emptyLabel="Semua Kategori"
            emptyDescription="Tampilkan seluruh ragam layanan"
            helperText="Pilih keahlian khusus untuk mempersempit kualifikasi Helper."
          />
        </aside>

        <section className="min-w-0 space-y-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-2 px-2">
              <span className="sr-only">Cari nama atau layanan Helper</span>
              <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama atau layanan Helper"
                className="min-h-11 min-w-0 w-full text-base outline-none"
              />
            </label>
            <div className="flex min-h-11 items-center gap-2 border-t border-slate-100 px-2 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
              <span className="sr-only">Urutkan Helper</span>
              <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl pl-3 pr-8 py-2 text-xs sm:text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#0D47A1]/20 cursor-pointer transition-colors"
                >
                  <option value="rekomendasi">Rekomendasi</option>
                  <option value="rating">Rating tertinggi</option>
                  <option value="jarak">Jarak terdekat</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Toggle Ganti Mode Penugasan di sebelah filter search bar */}
            <div className="flex min-h-11 items-center gap-2 border-t border-slate-100 px-2 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
              <span className="sr-only">Mode Penugasan</span>
              <CatalogModeSwitcher />
            </div>
          </div>

          {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
          {loading ? (
            <div className="flex min-h-64 items-center justify-center" aria-live="polite"><Loader2 className="h-8 w-8 animate-spin text-[#0D47A1]" aria-hidden="true" /><span className="sr-only">Memuat Helper</span></div>
          ) : sortedHelpers.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0D47A1]">
                <Search className="h-7 w-7 text-[#0D47A1]" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg sm:text-xl font-black text-slate-900">
                Tidak ada Helper yang sesuai filter saat ini
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm leading-relaxed text-slate-600">
                Belum menemukan Helper langsung di sekitar lansia? Anda tidak perlu menunggu. Buka lowongan agar Helper di sekitar mengajukan diri, atau gunakan pencarian cepat 15 menit.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-xl mx-auto">
                <Link
                  href="/booking/new?mode=pelamar"
                  className="group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-4 text-center transition hover:border-violet-500 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 min-h-[56px]"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Rekomendasi Utama</span>
                  <span className="text-sm font-black text-slate-900 group-hover:text-violet-900">Buka Lowongan (Pilih dari Pelamar)</span>
                  <span className="text-xs text-slate-500">Helper di sekitar akan melamar untuk Anda pilih</span>
                </Link>

                <Link
                  href="/booking/new?mode=cepat"
                  className="group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4 text-center transition hover:border-amber-500 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 min-h-[56px]"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Kebutuhan Hari Ini</span>
                  <span className="text-sm font-black text-slate-900 group-hover:text-amber-900">Cari Cepat 15 Menit</span>
                  <span className="text-xs text-slate-500">Sistem otomatis mencocokkan ke Helper aktif</span>
                </Link>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                Atau coba ubah filter jadwal, perluas radius pencarian, atau pilih kategori lain di panel filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sortedHelpers.map((helper) => <HelperCard key={helper.id} helper={helper} bookingQuery={bookingQuery} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function HelperCard({ helper, bookingQuery }: { helper: Helper; bookingQuery: string }) {
  const helperName = helper.users?.full_name || "Helper Rangkul";
  const trusted = helper.tingkat_kepercayaan === "terpercaya";

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[5/4] bg-blue-100">
        <img src={helper.foto_url || fallbackPhoto} alt={`Foto ${helperName}`} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full border border-emerald-200 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><ShieldCheck className="mr-1 inline h-3 w-3" aria-hidden="true" />Terverifikasi</span>
        <button type="button" aria-label={`Simpan ${helperName} sebagai favorit`} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/55 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><Heart className="h-4 w-4" aria-hidden="true" /></button>
      </div>
      <div className="space-y-4 p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><h2 className="min-w-0 break-words font-black text-slate-900">{helperName}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${trusted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{trusted ? "Terpercaya" : "Probation"}</span></div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500"><span className="inline-flex items-center gap-1 font-bold text-amber-700"><Star className="h-3 w-3 fill-current" aria-hidden="true" />{Number(helper.rating_avg || 0).toFixed(1)}</span><span>{helper.total_tugas_selesai} tugas selesai</span><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" />{helper.jarak_km !== null ? `${helper.jarak_km} km` : "Jarak belum tersedia"}</span></p>
        </div>
        <p className="line-clamp-2 break-words text-sm leading-relaxed text-slate-600">{helper.bio || "Siap membantu mendampingi lansia."}</p>
        <div className="flex flex-wrap gap-1.5">{helper.kategori.slice(0, 3).map((item) => <span key={item.id} className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{item.nama}</span>)}</div>
        {!trusted && <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Booking Helper probation membutuhkan persetujuan Koordinator.</p>}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3"><div><p className="text-[10px] text-slate-500">Mulai dari</p><p className="font-black text-slate-900">Rp {Number(helper.kategori[0]?.harga_dasar || 0).toLocaleString("id-ID")}</p></div><Link href={`/booking/${helper.id}${bookingQuery}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0D47A1] px-3 text-center text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Tanya ketersediaan</Link></div>
      </div>
    </article>
  );
}
