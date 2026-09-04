"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Filter, ArrowUpDown, Clock, ChevronRight, AlertCircle, X, Map, ExternalLink, HeartHandshake, ShieldCheck } from "lucide-react";

export type JobData = {
  id: string;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  lansia_nama: string;
  lansia_alamat: string;
  catatan_tugas: string;
  catatan_kondisi: string;
  kategori_nama: string;
  kategori_deskripsi: string;
  kategori_tingkat: string;
  estimasi_durasi_menit: number;
  is_high_risk: boolean;
  distanceKm: number;
  distanceStr: string;
};

export default function CariPekerjaanClient({
  initialJobs,
  radius,
  isVerified,
  helperStatus,
  loadError,
}: {
  initialJobs: JobData[];
  radius: number;
  isVerified: boolean;
  helperStatus?: string;
  loadError: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("terbaru");
  
  // Job modal state
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  
  // Warning Modal state based on helperStatus is no longer shown on mount
  const [warningAction, setWarningAction] = useState<"unverified" | "pending" | "rejected" | null>(null);

  const filteredJobs = initialJobs.filter((job) => {
    const matchSearch = job.lansia_nama.toLowerCase().includes(search.toLowerCase()) || 
                        job.kategori_nama.toLowerCase().includes(search.toLowerCase()) ||
                        job.lansia_alamat.toLowerCase().includes(search.toLowerCase());
    
    let matchCategory = true;
    if (category !== "Semua") {
      matchCategory = job.kategori_tingkat.toLowerCase() === category.toLowerCase();
    }
    
    const withinRadius = job.distanceKm !== null ? job.distanceKm <= radius : true;

    return matchSearch && matchCategory && withinRadius;
  }).sort((a, b) => {
    if (sortBy === "jarak" && a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }
    if (sortBy === "waktu") {
      return new Date(a.jadwal_waktu).getTime() - new Date(b.jadwal_waktu).getTime();
    }
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

  const handleApplyClick = () => {
    if (helperStatus === "verified" && selectedJob) {
      router.push(`/tugas/${selectedJob.id}`);
    } else {
      if (!helperStatus || helperStatus === "unregistered") {
        setWarningAction("unverified");
      } else if (helperStatus === "rejected") {
        setWarningAction("rejected");
      } else {
        setWarningAction("pending");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cari Pekerjaan</h1>
            <p className="text-gray-500 mt-1">Menampilkan booking keluarga dalam radius {radius > 0 ? `maksimal ${radius} KM` : "yang tersedia"} dari domisili Anda.</p>
          </div>

          {!isVerified && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <p>Profil Helper harus berstatus verified dan memiliki koordinat domisili sebelum dapat menerima tugas.</p>
            </div>
          )}

          {loadError && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
              <p>{loadError}</p>
            </div>
          )}

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
            
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">Pekerjaan difilter berdasarkan max {radius} KM dari titik domisili Anda.</p>
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

          {/* Grid Cards (Marketplace Size) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => {
              const tags = [job.kategori_nama];
              if (job.kategori_tingkat) tags.push(`Tingkat ${job.kategori_tingkat.charAt(0).toUpperCase() + job.kategori_tingkat.slice(1)}`);
              if (job.is_high_risk) tags.push("Approval Koordinator");

              return (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job)}
                  className="bg-white text-slate-800 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all group flex flex-col cursor-pointer"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-brand-gradient shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.24),transparent_35%)]" aria-hidden="true" />
                    <div className="relative flex h-full flex-col justify-between p-5 text-white">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                        <HeartHandshake className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">Booking keluarga</p>
                        <p className="mt-1 text-sm font-semibold text-white/90">{job.kategori_deskripsi}</p>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-white flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#0D47A1]" />
                      <span className="font-bold text-[#0D47A1] text-[11px] uppercase tracking-wider">
                        {job.distanceStr}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col z-10 bg-white relative">
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {job.lansia_nama}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-slate-500 mb-4 mt-auto">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span>{formatTaskDate(job.jadwal_waktu)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{job.lansia_alamat}</span>
                      </div>
                    </div>

                    {job.catatan_kondisi && (
                       <div className="bg-yellow-50/50 p-2.5 rounded-lg border border-yellow-100/50 mt-1">
                         <p className="text-[11px] font-medium text-yellow-800 line-clamp-1"><strong className="text-yellow-900">Perhatian:</strong> {job.catatan_kondisi}</p>
                       </div>
                    )}
                  </div>
                  
                  <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between group-hover:bg-blue-50/50 transition-colors">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Harga kunjungan</span>
                      <span className="font-black text-lg text-[#0D47A1]">{formatIDR(job.harga_final)}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:bg-white group-hover:border-blue-200 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-600 text-lg">Tidak ada Pekerjaan ditemukan</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">Coba lebarkan cakupan filter pencarian Anda, atau periksa kembali keesokan harinya.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Detail Modal --- */}
      {selectedJob && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-20 shrink-0">
               <h3 className="font-bold text-lg text-slate-800">Detail Layanan</h3>
               <button 
                 onClick={() => setSelectedJob(null)}
                 className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
               >
                 <X size={20} />
               </button>
            </div>
            
            <div className="overflow-y-auto bg-slate-50 flex-1 relative">
               <div className="relative h-48 w-full shrink-0 overflow-hidden bg-brand-gradient">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.24),transparent_35%)]" aria-hidden="true" />
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                     <HeartHandshake className="mb-3 h-8 w-8" aria-hidden="true" />
                     <h2 className="text-2xl font-bold font-display">{selectedJob.lansia_nama}</h2>
                     <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-white/90">
                        <MapPin size={16} />
                        {selectedJob.distanceStr} dari lokasimu
                     </div>
                  </div>
               </div>

               <div className="p-6 space-y-6">
                 {/* Kategori Card */}
                 <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <span className="text-xs font-bold uppercase text-slate-400 mb-1 block">Rincian Tugas</span>
                    <p className="font-bold text-slate-800">{selectedJob.kategori_nama}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{selectedJob.kategori_deskripsi}</p>
                    <span className="inline-block mt-2 text-[11px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-600 rounded">
                       Tingkat {selectedJob.kategori_tingkat}
                    </span>
                 </div>
                 
                 {/* Time & Place */}
                 <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Jadwal Penugasan</span>
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <Clock size={16} className="text-blue-500" />
                        {formatTaskDate(selectedJob.jadwal_waktu)} · {selectedJob.estimasi_durasi_menit} menit
                      </div>
                    </div>
                    <div className="w-full">
                      <span className="text-xs font-bold uppercase text-slate-400 mb-2 block">Rincian Lokasi Pertemuan</span>
                      <div className="flex items-start gap-3 text-sm text-slate-600 bg-white border border-slate-100 p-3.5 rounded-xl">
                        <Map size={18} className="text-blue-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-3 w-full">
                           {selectedJob.lansia_alamat.split(',').map((part, i) => {
                             const p = part.trim();
                             let label = "Wilayah Tambahan";
                             if (i === 0) label = "Jalan Utama / Patokan";
                             else if (p.toUpperCase().includes('RT') || p.toUpperCase().includes('RW')) label = "Blok RT / RW";
                             else if (i === 2) label = "Kelurahan / Desa";
                             else if (i === 3) label = "Kecamatan / Kota";
                             else if (i === 4) label = "Provinsi";

                             return (
                               <div key={i} className="flex flex-col border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                                 <span className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">{label}</span>
                                 <span className={i === 0 ? "font-bold text-slate-900" : "font-semibold text-slate-700 leading-snug"}>{p}</span>
                               </div>
                             );
                           })}
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Catatan dari keluarga</span>
                    <p className="text-sm leading-relaxed text-slate-700">{selectedJob.catatan_tugas}</p>
                 </div>

                 {/* Catatan Area */}
                 {selectedJob.catatan_kondisi && (
                   <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                         <AlertCircle size={16} className="text-red-500" />
                         <span className="text-sm font-bold text-red-800">Kondisi Khusus Lansia</span>
                      </div>
                      <p className="text-sm text-red-700 leading-relaxed font-medium">
                        {selectedJob.catatan_kondisi}
                      </p>
                   </div>
                 )}
               </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-white border-t border-gray-100 flex items-center justify-between shrink-0 z-20 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
               <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">Harga kunjungan</span>
                  <span className="text-2xl font-black text-[#0D47A1]">{formatIDR(selectedJob.harga_final)}</span>
               </div>
               <Button onClick={handleApplyClick} className="bg-brand-gradient hover:opacity-90 text-white shadow-md font-bold px-8 h-12 rounded-xl transition-transform active:scale-95">
                 Ambil Tugas
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- Warning Action Modal --- */}
      {warningAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in transition-all">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden text-center p-8 animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setWarningAction(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-orange-200 animate-ping rounded-full opacity-20"></div>
              <AlertCircle className="w-10 h-10 text-orange-500 relative z-10" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {warningAction === "unverified" ? "Lengkapi Profil Utama" : warningAction === "rejected" ? "Pendaftaran Ditolak" : "Sedang Ditinjau"}
            </h3>
            
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
              {warningAction === "unverified" 
                ? "Anda belum melengkapi formulir verifikasi Helper Rangkul. Harap lengkapi dan serahkan dokumen KTP Anda sebelum dapat mengambil pekerjaan."
                : warningAction === "rejected"
                ? "Mohon maaf, pendaftaran Anda sebelumnya ditolak. Silakan perbaiki dan ajukan ulang dokumen Anda pada halaman verifikasi."
                : "Akun Anda saat ini masih dalam proses peninjauan oleh Koordinator setempat. Anda baru bisa mengambil pekerjaan setelah status berpindah diverifikasi."}
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => {
                   if (warningAction === "unverified" || warningAction === "rejected") router.push("/helper/verifikasi");
                   else router.push("/helper/dashboard");
                }} 
                className="w-full bg-[#0D47A1] hover:bg-blue-800 h-12 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {warningAction === "unverified" ? "Lengkapi Profil" : warningAction === "rejected" ? "Perbaiki Dokumen" : "Kembali ke Dashboard"}
                <ExternalLink size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
