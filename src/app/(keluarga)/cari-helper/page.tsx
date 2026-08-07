"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
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
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
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
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
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
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi",
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
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white pt-10 pb-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-display font-extrabold mb-2">Cari Helper Terbaik di Sekitarmu</h1>
          <p className="text-blue-100 max-w-lg mb-6">
            Pilih pendamping tersertifikasi oleh pengurus komunitas. Semua Helper di bawah terhubung dalam layanan jangkauan terdekat Anda.
          </p>
          
          <div className="bg-blue-800/30 border border-blue-400/30 rounded-lg p-3 flex gap-3 text-sm items-center max-w-2xl">
            <Info size={20} className="text-blue-200 shrink-0" />
            <p className="text-blue-100/90 leading-snug">
              <strong>Info Verifikasi:</strong> Helper yang telah diverifikasi di 1 RT dapat mengambil dan mengerjakan tugas dari RT atau wilayah kelurahan lain selama masih dalam jangkauan radius pelayanannya!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 grid lg:grid-cols-[280px_1fr] gap-8 pb-20">
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
              <div key={h.id} className="bg-white text-slate-800 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group hover:-translate-y-1">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full border border-slate-200 shadow-inner overflow-hidden">
                      <img src={h.avatar} alt={h.name} width={64} height={64} />
                    </div>
                    <button className="text-slate-300 hover:text-red-500 transition-colors">
                      <Heart size={22} />
                    </button>
                  </div>
                  
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

                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full mb-1">
                    {h.category}
                  </span>
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Tarif Layanan</span>
                    <span className="font-bold text-slate-900">Rp 50.000 <span className="font-normal text-xs text-slate-500">/ 2 jam</span></span>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    Tanya Ketersediaan
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