"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, Filter, Heart, Loader2, MapPin, Search, ShieldCheck } from 'lucide-react';

type Lansia = { id: string; nama: string; alamat: string; lat: number | null; lng: number | null };
type Category = { id: string; nama: string; tingkat: string; harga_dasar: number; is_high_risk: boolean };
type Helper = { id: string; bio: string | null; rating_avg: number; total_tugas_selesai: number; radius_layanan_km: number; jarak_km: number | null; foto_url: string | null; users: { full_name: string | null } | null; kategori: Category[] };

const fallbackPhoto = '/images/helpers/orang1.jpeg';

export default function CariHelperPage() {
  const [lansias, setLansias] = useState<Lansia[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [selectedLansia, setSelectedLansia] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tingkat, setTingkat] = useState('');
  const [radius, setRadius] = useState(5);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rekomendasi');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/lansia').then((response) => response.json()),
      fetch('/api/categories').then((response) => response.json()),
    ]).then(([lansiaData, categoryData]) => {
      setLansias(lansiaData.profiles ?? []);
      setCategories(categoryData.categories ?? []);
    }).catch(() => setError('Filter katalog tidak dapat dimuat.'));
  }, []);

  const selected = lansias.find((item) => item.id === selectedLansia);
  useEffect(() => {
    async function loadHelpers() {
      const params = new URLSearchParams({ radius_km: String(radius) });
      if (search.trim()) params.set('q', search.trim());
      if (categoryId) params.set('category_id', categoryId);
      if (tingkat) params.set('tingkat', tingkat);
      if (selected?.lat !== null && selected?.lng !== null && selected?.lat !== undefined && selected?.lng !== undefined) {
        params.set('lat', String(selected.lat));
        params.set('lng', String(selected.lng));
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/helpers?${params.toString()}`);
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Katalog Helper tidak dapat dimuat.');
        setHelpers(body.helpers ?? []);
        setError(null);
      } catch (reason: unknown) {
        setError(reason instanceof Error ? reason.message : 'Katalog Helper tidak dapat dimuat.');
      } finally {
        setLoading(false);
      }
    }

    void loadHelpers();
  }, [categoryId, radius, search, selected?.lat, selected?.lng, tingkat]);

  const sortedHelpers = useMemo(() => [...helpers].sort((a, b) => sort === 'rating' ? b.rating_avg - a.rating_avg : (a.jarak_km ?? 999) - (b.jarak_km ?? 999)), [helpers, sort]);

  return <main className="min-h-screen bg-[#F8FAFC] pb-20"><header className="bg-gradient-to-br from-[#0D47A1] to-[#1976D2] px-6 py-12 text-white"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Marketplace Rangkul</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">Cari Helper di sekitar lansia</h1><p className="mt-3 max-w-2xl text-blue-100">Kategori, jarak, dan harga berasal dari data layanan yang sudah diverifikasi.</p></div></header><div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[280px_1fr]"><aside className="h-fit space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6"><div className="flex items-center gap-2"><Filter className="h-5 w-5 text-[#0D47A1]" /><h2 className="font-bold text-slate-900">Filter pencarian</h2></div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Pilih lansia<select value={selectedLansia} onChange={(event) => setSelectedLansia(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-800"><option value="">Semua lokasi</option>{lansias.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></label><fieldset><legend className="text-xs font-bold uppercase tracking-wider text-slate-500">Tingkat layanan</legend><div className="mt-2 space-y-2">{['', 'ringan', 'sedang', 'berat'].map((item) => <label key={item || 'semua'} className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" checked={tingkat === item} onChange={() => setTingkat(item)} />{item || 'Semua tingkat'}</label>)}</div></fieldset><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Radius maksimal: {radius} km<input type="range" min="1" max="15" value={radius} onChange={(event) => setRadius(Number(event.target.value))} className="mt-3 w-full accent-blue-600" /></label><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Kategori layanan<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-800"><option value="">Semua kategori</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></label></aside><section className="space-y-6"><div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"><div className="flex flex-1 items-center gap-2 px-2"><Search className="h-5 w-5 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau layanan Helper" className="h-10 w-full outline-none" /></div><div className="flex items-center gap-2 border-t border-slate-100 px-2 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"><ArrowUpDown className="h-4 w-4 text-slate-400" /><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none"><option value="rekomendasi">Rekomendasi</option><option value="rating">Rating tertinggi</option><option value="jarak">Jarak terdekat</option></select></div></div>{error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}{loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#0D47A1]" /></div> : sortedHelpers.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Tidak ada Helper yang sesuai dengan filter ini.</div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{sortedHelpers.map((helper) => <article key={helper.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="relative aspect-[5/4] bg-blue-100"><img src={helper.foto_url || fallbackPhoto} alt={`Foto ${helper.users?.full_name || 'Helper'}`} className="h-full w-full object-cover" /><span className="absolute left-3 top-3 rounded-full border border-emerald-200 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><ShieldCheck className="mr-1 inline h-3 w-3" />Terverifikasi</span><button type="button" className="absolute right-3 top-3 rounded-full bg-black/20 p-2 text-white"><Heart className="h-4 w-4" /></button></div><div className="space-y-4 p-4"><div><h2 className="font-black text-slate-900">{helper.users?.full_name || 'Helper Rangkul'}</h2><p className="mt-1 text-xs text-slate-500"><span className="font-bold text-amber-600">★ {Number(helper.rating_avg || 0).toFixed(1)}</span> · {helper.total_tugas_selesai} tugas selesai · <MapPin className="inline h-3 w-3" /> {helper.jarak_km !== null ? `${helper.jarak_km} km` : 'Jarak belum tersedia'}</p></div><p className="line-clamp-2 text-sm text-slate-600">{helper.bio || 'Siap membantu mendampingi lansia.'}</p><div className="flex flex-wrap gap-1.5">{helper.kategori.slice(0, 3).map((item) => <span key={item.id} className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{item.nama}</span>)}</div><div className="flex items-center justify-between border-t border-slate-100 pt-3"><div><p className="text-[10px] text-slate-500">Mulai dari</p><p className="font-black text-slate-900">Rp {Number(helper.kategori[0]?.harga_dasar || 0).toLocaleString('id-ID')}</p></div><Link href={`/booking/${helper.id}`} className="rounded-xl bg-[#0D47A1] px-3 py-2 text-xs font-bold text-white">Tanya ketersediaan</Link></div></div></article>)}</div>}</section></div></main>;
}
