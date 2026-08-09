"use client";

import { useState } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Filter, ArrowUpDown, Clock, ChevronRight } from "lucide-react";

type JobData = {
  id: string;
  jadwal_waktu: string;
  harga_dasar: number;
  lansia_nama: string;
  lansia_alamat: string;
  catatan_kondisi: string;
  kategori_nama: string;
  kategori_tingkat: string;
  distanceKm: number | null;
  distanceStr: string;
};

export default function CariPekerjaanClient({ initialJobs, radius }: { initialJobs: JobData[], radius: number }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("terbaru");

  const filteredJobs = initialJobs.filter((job) => {
    const matchSearch = job.lansia_nama.toLowerCase().includes(search.toLowerCase()) || 
                        job.kategori_nama.toLowerCase().includes(search.toLowerCase());
    
    // Convert DB 'tingkat' to match the filter option if needed, 
    // or we can filter by exact category name. Let's filter by tingkat.
    let matchCategory = true;
    if (category !== "Semua") {
      matchCategory = job.kategori_tingkat.toLowerCase() === category.toLowerCase();
    }
    
    // Filter by radius
    const withinRadius = job.distanceKm !== null ? job.distanceKm <= radius : true;

    return matchSearch && matchCategory && withinRadius;
  }).sort((a, b) => {
    if (sortBy === "jarak" && a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }
    if (sortBy === "waktu") {
      return new Date(a.jadwal_waktu).getTime() - new Date(b.jadwal_waktu).getTime();
    }
    // default terbaru (by id desc or assumed order)
    return 0;
  });

  const formatTaskDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cari Pekerjaan (Tugas DIAJUKAN)</h1>
        <p className="text-gray-500 mt-1">Menampilkan pekerjaan dalam radius &lt; {radius} KM dari domisili Anda.</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar Filters */}
        <aside className="bg-white border text-slate-800 border-slate-200 rounded-2xl p-6 shadow-sm h-fit sticky top-10">
          <div className="flex items-center gap-2 mb-6">
            <Filter size={20} />
            <h2 className="font-bold text-lg">Filter Pencarian</h2>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Tingkat Kesulitan</Label>
              <div className="space-y-2">
                {["Semua", "Ringan", "Sedang", "Berat"].map((cat) => (
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
                placeholder="Cari nama klien atau layanan..."
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
                <option value="terbaru">Terbaru Ditambahkan</option>
                <option value="waktu">Jadwal Terdekat</option>
                <option value="jarak">Jarak Terdekat</option>
              </select>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid sm:grid-cols-2 gap-5">
            {filteredJobs.map((job) => {
              const tags = [job.kategori_nama];
              if (job.kategori_tingkat) tags.push(`Tingkat ${job.kategori_tingkat.charAt(0).toUpperCase() + job.kategori_tingkat.slice(1)}`);
              if (job.catatan_kondisi) tags.push('Perhatian Khusus');

              return (
                <div key={job.id} className="bg-white text-slate-800 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group hover:-translate-y-1 flex flex-col">
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                        {job.lansia_nama}
                      </h3>
                      <span className="font-bold text-[#0D47A1] bg-blue-50 px-2.5 py-1 rounded-full text-xs shrink-0 whitespace-nowrap">
                        {job.distanceStr}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-slate-500 mb-4 mt-auto">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span>{formatTaskDate(job.jadwal_waktu)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{job.lansia_alamat}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Fee Dasar</span>
                      <span className="font-bold text-slate-900">{formatIDR(job.harga_dasar * 0.9)}</span>
                    </div>
                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                      <Link href={`/helper/pekerjaan/${job.id}`}>
                        Lihat Detail <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
              <h3 className="font-bold text-slate-500 text-lg">Tidak ada Pekerjaan ditemukan</h3>
              <p className="text-sm text-slate-400 mt-2">Coba ganti kata kunci atau perluas filter pencarian Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
