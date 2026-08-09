"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from "@/components/ui/LocationPicker";
import RegionSelect from "@/components/ui/RegionSelect";
import { createClient } from "@/lib/supabase/client";

export default function HelperVerifikasiPage() {
  const router = useRouter();
  const ktpInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('tier1');
  const [modalOpenTier, setModalOpenTier] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [categories, setCategories] = useState<{id: string, nama: string}[]>([]);
  const [kategoriIds, setKategoriIds] = useState<string[]>([]);
  const [ktpFileName, setKtpFileName] = useState<string | null>(null);

  const tiers = [
    {
      id: "tier1",
      title: "Ringan",
      desc: "Aktivitas harian ringan & non-medis.",
      categories: ["Menemani Mengobrol", "Jalan Pagi / Olahraga Ringan", "Membantu Belanja", "Membacakan Buku / Menemani Hobbi", "Menyiram Tanaman Dasar"]
    },
    {
      id: "tier2",
      title: "Sedang",
      desc: "Bantuan rutinitas harian untuk lansia semi-mandiri.",
      categories: ["Menyiapkan Makanan & Menyuapi", "Mengingatkan Jadwal Obat", "Membantu Mandi & Berpakaian", "Bantuan Toilet Dasar", "Membersihkan Area Tidur", "Menemani Kunjungan Dokter Khusus"]
    },
    {
      id: "tier3",
      title: "Berat",
      desc: "Perawatan khusus dan penanganan medis dasar.",
      categories: ["Penanganan Pasca Operasi", "Perawatan Luka Dasar", "Terapi Fisik Ringan", "Pendampingan Pasien Alzheimer/Demensia", "Pemberian Obat Kompleks / Injeksi Dasar", "Pemasangan / Cek Alat Medis Ringan"]
    }
  ];

  const [form, setForm] = useState({
    bio: "",
    alamat: "",
    region: { provinsi: "", kota: "", kecamatan: "", kelurahan: "" },
    domisili_lat: null as number | null,
    domisili_lng: null as number | null,
    radius_layanan_km: 5,
    selected_categories: [] as string[],
    ktp_url: "",
  });

  const toggleCategory = (cat: string) => {
    setForm(prev => {
      const current = prev.selected_categories || [];
      if (current.includes(cat)) {
        return { ...prev, selected_categories: current.filter(c => c !== cat) };
      }
      return { ...prev, selected_categories: [...current, cat] };
    });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('service_categories')
        .select('id, nama')
        .eq('is_active', true);
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const selectAllInActiveTab = () => {
    const activeCategories = tiers.find(t => t.id === activeTab)?.categories || [];
    setForm(prev => {
      // Create a set to uniquely hold all categories
      const set = new Set([...prev.selected_categories, ...activeCategories]);
      return { ...prev, selected_categories: Array.from(set) };
    });
  };

  const deselectAllInActiveTab = () => {
    const activeCategories = tiers.find(t => t.id === activeTab)?.categories || [];
    setForm(prev => ({
      ...prev,
      selected_categories: prev.selected_categories.filter(c => !activeCategories.includes(c))
    }));
  };
  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKtpFileName(file.name);
    }
  };

  const toggleKategori = (id: string) => {
    setKategoriIds(prev => 
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setFieldErrors({});

    if (form.domisili_lat === null || form.domisili_lng === null) {
      setErrorMsg("Harap tentukan titik koordinat domisili pada peta interaktif.");
      setLoading(false);
      return;
    }

    if (!form.region.provinsi || !form.region.kota || !form.region.kecamatan || !form.region.kelurahan) {
      setErrorMsg("Harap melengkapi kolom wilayah administrasi.");
      setLoading(false);
      return;
    }

    if (kategoriIds.length === 0) {
      setFieldErrors({ kategori_ids: ["Harap pilih minimal 1 kategori layanan."] });
      setLoading(false);
      return;
    }

    try {
      let ktpUrl = null;
      const file = ktpInputRef.current?.files?.[0];
      
      if (!file) {
        setErrorMsg("Harap unggah foto KTP/Dokumen Identitas.");
        setLoading(false);
        return;
      }

      // 1. Upload KTP
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", "ktp");
      
      const uploadRes = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });
      
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        setErrorMsg(uploadData.message || "Gagal mengunggah KTP.");
        setLoading(false);
        return;
      }
      
      ktpUrl = uploadData.url;

      // 2. Submit Profile
      const payload = {
        bio: form.bio,
        wilayah_domisili: form.alamat,
        domisili_lat: form.domisili_lat,
        domisili_lng: form.domisili_lng,
        radius_layanan_km: form.radius_layanan_km,
        ktp_url: ktpUrl,
        kategori_ids: kategoriIds
      };

      const res = await fetch("/api/helper/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setErrorMsg(data.message || "Gagal menyimpan profil helper.");
        setLoading(false);
        return;
      }

      router.push("/helper/dashboard");
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link href="/helper/dashboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Verifikasi & Profil Helper</h1>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-[#0D47A1]' : 'bg-gray-100'}`} />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={step === 1 ? "block" : "hidden"}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 1: Domisili Wilayah</h2>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Wilayah Administrasi Domisili <span className="text-red-500">*</span>
              </Label>
              <RegionSelect 
                onRegionChange={(region, coords) => {
                  setForm(f => ({
                    ...f,
                    region,
                    ...(coords ? { 
                      domisili_lat: coords.lat, 
                      domisili_lng: coords.lng,
                      ...(coords.address ? { alamat: coords.address } : {})
                    } : {})
                  }));
                }}
              />

              <Label htmlFor="alamat" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 mt-4">
                Alamat Spesifik Tempat Tinggal / Detail Patokan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="alamat"
                rows={3}
                placeholder="Jl. Sudirman No. 12, Kel. Sukamaju, RT 02 / RW 05"
                value={form.alamat}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, alamat: e.target.value })}
                className="rounded-xl mt-2 mb-4"
              />
              
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2 mt-4 flex items-center justify-between">
                <span>Titik Koordinat Pusat Domisili <span className="text-red-500">*</span></span>
                {form.domisili_lat && form.domisili_lng && (
                  <span className="text-[10px] text-green-600 font-mono bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    {form.domisili_lat.toFixed(5)}, {form.domisili_lng.toFixed(5)}
                  </span>
                )}
              </Label>
              <p className="text-xs text-slate-500 mb-3">Ketuk map di bawah untuk mengatur titik pusat domisili Anda. Ini digunakan untuk kalkulasi jarak radius pelayanan (maksimal {form.radius_layanan_km || 5} km) bagi keluarga terdekat.</p>
              <LocationPicker 
                position={form.domisili_lat && form.domisili_lng ? { lat: form.domisili_lat, lng: form.domisili_lng } : null}
                onPositionChange={(pos, targetAddress) => {
                   setForm(f => ({ ...f, domisili_lat: pos.lat, domisili_lng: pos.lng, ...(targetAddress ? { alamat: targetAddress } : {}) }));
                }}
              />
            </div>

            <div className={step === 2 ? "block" : "hidden"}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 2: Profil & Spesialisasi Layanan</h2>
              
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2 mt-2">
                Pilih Kapasitas Layanan Anda <span className="text-red-500">*</span>
              </Label>
              
              {/* Navbar / Tabs */}
              <div className="flex justify-center overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide border-b border-gray-100">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tier.id);
                    }}
                    className={`whitespace-nowrap px-6 py-2 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
                      activeTab === tier.id 
                        ? 'border-[#0D47A1] text-[#0D47A1] bg-blue-50/50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tier.title}
                  </button>
                ))}
              </div>

              {/* Active Tab Content (Checklists) */}
              <div className="bg-white border text-sm border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 mb-3 gap-3">
                   <div>
                     <p className="font-bold text-gray-900">{tiers.find(t => t.id === activeTab)?.desc}</p>
                     <p className="text-xs text-gray-500">Anda dapat memilih lintas batas tingkatan kapasitas ini.</p>
                   </div>
                   <div className="shrink-0 flex gap-2">
                     <Button 
                       type="button" 
                       variant="outline" 
                       size="sm" 
                       onClick={deselectAllInActiveTab}
                       className="text-xs border-gray-200"
                     >
                       Hapus Semua
                     </Button>
                     <Button 
                       type="button" 
                       size="sm" 
                       onClick={selectAllInActiveTab}
                       className="bg-[#0D47A1] text-white hover:bg-blue-800 text-xs"
                     >
                       Pilih Semua
                     </Button>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(() => {
                       const activeCats = tiers.find(t => t.id === activeTab)?.categories || [];
                       const displayedCats = activeCats.slice(0, 4);
                       
                       return (
                         <>
                           {displayedCats.map((cat, idx) => {
                             const isSelected = form.selected_categories.includes(cat);
                             return (
                               <label key={idx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50 border-blue-400' : 'bg-white border-gray-200 hover:border-blue-200'}`}>
                                 <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-[#0D47A1] border-[#0D47A1]' : 'border-gray-300'}`}>
                                   {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                 </div>
                                 <span className={`text-sm font-medium ${isSelected ? 'text-[#0D47A1]' : 'text-gray-700'}`}>{cat}</span>
                                 <input 
                                   type="checkbox" 
                                   checked={isSelected}
                                   onChange={() => toggleCategory(cat)}
                                   className="hidden" 
                                 />
                               </label>
                             );
                           })}
                           
                           {/* Show All toggler button if there are more than 4 items */}
                           {activeCats.length > 4 && (
                             <button
                               type="button"
                               onClick={() => setModalOpenTier(activeTab)}
                               className="col-span-1 sm:col-span-2 mt-1 py-2 text-sm font-bold text-[#0D47A1] hover:text-blue-800 hover:underline flex justify-center items-center gap-1"
                             >
                               Buka Semua Kategori (+{activeCats.length - 4}) <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                             </button>
                           )}
                         </>
                       );
                    })()}
                 </div>
              </div>

              <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 mt-2">
                Bio Singkat & Pengalaman
              </Label>
              <Textarea
                id="bio"
                rows={3}
                placeholder="Ceritakan pengalaman Anda dalam mendampingi lansia..."
                value={form.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, bio: e.target.value })}
                className="rounded-xl mb-4"
              />
              
              <Label htmlFor="radius" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 mt-4">
                Radius Maksimal Jangkauan Layanan
              </Label>
              <p className="text-xs text-slate-500 mb-3">Seberapa jauh maksimal Anda bersedia bepergian menjangkau rumah Lansia? (dalam KM)</p>
              <div className="relative">
                <Input
                  id="radius"
                  type="number"
                  min={1}
                  max={25}
                  value={form.radius_layanan_km}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, radius_layanan_km: Number(e.target.value) })}
                  className="h-11 rounded-xl pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">KM</span>
              </div>
            </div>

            <div className={step === 3 ? "block" : "hidden"}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 3: Unggah Identitas</h2>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                URL Foto KTP / Dokumen Identitas <span className="text-red-500">*</span>
                Kategori Layanan yang Disediakan <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center space-x-2 border p-3 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input 
                      type="checkbox"
                      checked={kategoriIds.includes(cat.id)}
                      onChange={() => toggleKategori(cat.id)}
                      className="rounded text-[#0D47A1] focus:ring-[#0D47A1]"
                    />
                    <span className="text-sm font-medium">{cat.nama}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.kategori_ids && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.kategori_ids[0]}</p>
              )}
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 mt-4">
                URL Foto KTP / Dokumen Identitas *
              </Label>
              <p className="text-xs text-slate-500 mb-3">Mohon perhatikan tulisan KTP harus jelas dan tidak terpotong silau cahaya.</p>
              <Label 
                htmlFor="ktp_upload"
                className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors h-32 sm:h-40 group ${
                  form.ktp_url ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-[#F5F8FC] hover:border-[#0D47A1]/40'
                }`}
              >
                <input 
                  type="file" 
                  id="ktp_upload" 
                  className="hidden" 
                  accept="image/jpeg, image/png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setForm({ ...form, ktp_url: URL.createObjectURL(e.target.files[0]) });
                    }
                  }}
                />
                
                {form.ktp_url ? (
                  <div className="text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-2">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm font-bold text-green-700">Foto KTP Disimpan</p>
                    <p className="text-xs text-green-600/80 mt-1">Ketuk lagi untuk mengganti foto</p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0D47A1] flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-[#0D47A1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-[#0D47A1]">Ketuk untuk unggah foto KTP</p>
                    <p className="text-xs text-gray-500 mt-1">Maksimal ukuran 5MB (JPG/PNG)</p>
                  </div>
                )}
              </Label>
              {fieldErrors.ktp_url && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.ktp_url[0]}</p>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100 mt-8">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                     setErrorMsg("");
                     setStep(s => s - 1);
                  }} 
                  className="font-semibold rounded-xl flex-1 border-gray-200 h-11"
                >
                  Sebelumnya
                </Button>
              )}
              
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    if (step === 1 && (!form.region.kelurahan || !form.alamat || form.domisili_lat === null)) {
                       setErrorMsg("Harap lengkapi wilayah domisili, alamat spesifik, dan koordinat sebelum melanjutkan.");
                       return;
                    }
                    if (step === 2 && !form.radius_layanan_km) {
                       setErrorMsg("Radius layanan wajib diisi.");
                       return;
                    }
                    setStep(s => s + 1);
                  }}
                  className="w-full flex-[2] h-11 bg-[#0D47A1] hover:bg-blue-800 text-white font-semibold rounded-xl"
                >
                  Selanjutnya
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex-[2] h-11 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-95 shadow-sm"
                >
                  {loading ? "Mendaftar..." : "Kirim Verifikasi Profil"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Expanded Categories Modal */}
      {modalOpenTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="bg-brand-gradient p-5 flex justify-between items-center text-white">
               <h3 className="font-bold text-lg">Semua Kategori (Tier {tiers.find(t => t.id === modalOpenTier)?.title})</h3>
               <button onClick={() => setModalOpenTier(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             
             <div className="p-6">
                <p className="text-xs text-gray-500 mb-4">Centang tugas spesifik yang benar-benar Anda kuasai pada tingkat batas ini:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {tiers.find(t => t.id === modalOpenTier)?.categories.map((cat, idx) => {
                    const isSelected = form.selected_categories.includes(cat);
                    return (
                      <label key={idx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50 border-blue-400' : 'bg-white border-gray-200 hover:border-blue-200'}`}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-[#0D47A1] border-[#0D47A1]' : 'border-gray-300'}`}>
                          {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-[#0D47A1]' : 'text-gray-700'}`}>{cat}</span>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleCategory(cat)}
                          className="hidden" 
                        />
                      </label>
                    );
                  })}
                </div>
             </div>

             <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
               <Button onClick={() => setModalOpenTier(null)} className="w-full h-11 bg-[#0D47A1] text-white hover:bg-blue-800 font-semibold rounded-xl">
                 Selesai & Tutup
               </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}