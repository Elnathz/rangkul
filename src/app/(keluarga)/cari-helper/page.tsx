"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Star, Filter, Heart, ArrowUpDown, Info } from "lucide-react";

const MOCK_HELPERS = [
  {
    id: "1",
    name: "Budi Santoso",
    rating: 4.8,
    reviews: 24,
    category: "Layanan Kunjungan",
    distance: "1.2 km",
    verified: true,
    avatar: "/images/helpers/helper-andi.jpg",
    bio: "Pengalaman 2 tahun merawat lansia di sekitar Antapani. Sabar dan ramah.",
  },
  {
    id: "2",
    name: "Siti Aminah",
    rating: 5.0,
    reviews: 12,
    category: "Teman Ngobrol",
    distance: "2.5 km",
    verified: true,
    avatar: "/images/helpers/helper-ayu.jpg",
    bio: "Senang diajak bercerita dan berjalan pagi berkeliling taman.",
  },
  {
    id: "3",
    name: "Ahmad Rizki",
    rating: 4.5,
    reviews: 8,
    category: "Bantuan Kedaruratan",
    distance: "0.8 km",
    verified: true,
    avatar: "/images/helpers/helper-andi.jpg",
    bio: "Memiliki sertifikat P3K dasar. Bersedia dipanggil di malam hari.",
  },
  {
    id: "4",
    name: "Dewi Lestari",
    rating: 4.9,
    reviews: 31,
    category: "Layanan Kunjungan",
    distance: "3.0 km",
    verified: true,
    avatar: "/images/helpers/helper-sarah.jpg",
    bio: "Sangat sabar dan telaten dalam mengurus kebersihan rumah dan merawat lansia.",
  },
];

export default function CariHelperPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("rekomendasi");

  const filteredHelpers = MOCK_HELPERS.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Semua" || h.category.includes(category);
    return matchSearch && matchCategory;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "jarak") return parseFloat(a.distance) - parseFloat(b.distance);
    return 0; // default rekomendasi
  });

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC]">
      {/* Top Banner */}
      <div className="bg-brand-gradient text-white pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 pl-6 md:pl-10">
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold mb-3 tracking-tight">Cari Helper Terbaik di Sekitarmu</h1>
          <p className="text-blue-100 max-w-lg mb-8 leading-relaxed text-sm sm:text-base">
            Pilih pendamping tersertifikasi oleh pengurus komunitas. Semua Helper di bawah terhubung dalam layanan jangkauan terdekat Anda.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-xl p-4 flex gap-4 text-sm items-start max-w-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#90CAF9]"></div>
            <Info size={24} className="text-[#90CAF9] shrink-0 mt-0.5" />
            <p className="text-blue-50 leading-relaxed font-medium">
              <strong className="text-white">Info Verifikasi:</strong> Helper yang telah diverifikasi di 1 RT dapat mengambil dan mengerjakan tugas dari RT atau wilayah kelurahan lain selama masih dalam jangkauan radius pelayanannya!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 -mt-8 relative z-10 grid lg:grid-cols-[280px_1fr] gap-8 pb-20">
        {/* Sidebar Filters */}
        <aside className="bg-white border text-slate-800 border-slate-200 rounded-2xl p-6 shadow-sm h-fit sticky top-10">
          <div className="flex items-center gap-2 mb-6">
            <Filter size={20} />
            <h2 className="font-bold text-lg">Filter Pencarian</h2>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Kategori Layanan</Label>
              <div className="space-y-2">
                {["Semua", "Layanan Kunjungan", "Teman Ngobrol", "Bantuan Kedaruratan"].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg -ml-2 transition-colors">
                    <input 
                      type="radio" 
                      name="cat" 
                      className="w-4 h-4 text-blue-600" 
                      checked={category === cat}
                      onChange={() => setCategory(cat)}
                    />
                    <span className="text-sm font-medium text-slate-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Radius Maksimal</Label>
              <input type="range" className="w-full accent-blue-600" min="1" max="15" defaultValue="5" />
              <div className="flex justify-between text-xs font-medium text-slate-400 mt-1">
                <span>1 km</span>
                <span>15 km</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Search & Sort Bar */}
          <div className="bg-white border text-slate-800 border-slate-200 rounded-2xl p-2 pl-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
            <div className="flex items-center flex-1 w-full gap-2 text-slate-400">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Deskripsikan nama atau spesialisasi helper..."
                className="w-full bg-transparent border-0 focus:ring-0 text-slate-700 placeholder:text-slate-400 h-10 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pl-2 pr-2">
              <ArrowUpDown size={16} className="text-slate-400" />
              <select 
                className="bg-transparent text-sm font-semibold text-slate-700 border-0 outline-none cursor-pointer p-0 pr-6 ring-0"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rekomendasi">Rekomendasi</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="jarak">Jarak Terdekat</option>
              </select>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredHelpers.map((h) => (
              <div key={h.id} className="bg-white text-slate-800 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group hover:-translate-y-1 flex flex-col">
                <div className="relative w-full aspect-[5/4] bg-gradient-to-b from-[#DBEAFE] to-[#BFDBFE] overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.avatar}
                    alt={`Foto ${h.name}`}
                    className="w-full h-full object-cover object-top"
                  />
                  <button className="absolute top-3 right-3 text-white hover:text-red-500 drop-shadow-md transition-colors w-8 h-8 flex items-center justify-center bg-black/20 rounded-full backdrop-blur-sm">
                    <Heart size={18} />
                  </button>
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-green-700 border border-green-200 backdrop-blur-sm">
                   Tersertifikasi
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  
                  <div className="mb-2">
                    <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                      {h.name}
                      {h.verified && (
                        <span className="inline-block align-middle ml-1" title="Terverifikasi RT/RW">
                          <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-4">
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
                      <Star size={14} className="fill-amber-500" />
                      <span>{h.rating} ({h.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{h.distance}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 h-10 leading-relaxed mb-4">
                    {h.bio}
                  </p>

                  <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold rounded-full mt-auto w-fit">
                    {h.category}
                  </span>
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Tarif Layanan</span>
                    <span className="font-bold text-slate-900">Rp 50.000 <span className="font-normal text-xs text-slate-500">/ 2 jam</span></span>
                  </div>
                  <Button size="sm" asChild className="bg-[#0D47A1] hover:bg-blue-800 text-white rounded-lg font-semibold">
                    <Link href={`/booking/${h.id}`}>
                      Tanya Ketersediaan
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredHelpers.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
              <h3 className="font-bold text-slate-500 text-lg">Tidak ada Helper yang ditemukan</h3>
              <p className="text-sm text-slate-400 mt-2">Coba ganti kata kunci atau ubah filter pencarian Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}