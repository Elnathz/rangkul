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
import { Loader2 } from "lucide-react";

export default function HelperVerifikasiPage() {
  const router = useRouter();
  const ktpInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('ringan'); // used in Step 2 preview
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState('ringan'); // used in Modal
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const [dbCategories, setDbCategories] = useState<{id: string, nama: string}[]>([]);
  const [kategoriIds, setKategoriIds] = useState<string[]>([]);
  const [ktpFileName, setKtpFileName] = useState<string | null>(null);
  const [koordinators, setKoordinators] = useState<any[]>([]);

  const tiers = [
    {
      id: "ringan",
      title: "Ringan",
      desc: "Aktivitas harian ringan & non-medis.",
      catNames: [
        "Pengingat Obat", 
        "Menemani Mengobrol (singkat)", 
        "Bantuan Teknologi (singkat)", 
        "Bersih-bersih Ringan", 
        "Antar Obat (dekat, ≤1 km)"
      ]
    },
    {
      id: "sedang",
      title: "Sedang",
      desc: "Bantuan rutinitas harian untuk lansia semi-mandiri.",
      catNames: [
        "Menemani Mengobrol (lama)", 
        "Bantuan Teknologi (lama)", 
        "Antar Obat (sedang, 1–3 km)", 
        "Belanja Kebutuhan (standar)"
      ]
    },
    {
      id: "berat",
      title: "Berat",
      desc: "Perawatan khusus dan penanganan medis dasar.",
      catNames: [
        "Antar Obat (jauh, >3 km)", 
        "Bersih-bersih Menyeluruh", 
        "Kontrol Kesehatan (antar ke faskes)", 
        "Belanja Kebutuhan (besar/jauh)"
      ]
    }
  ];

  const [form, setForm] = useState({
    bio: "",
    alamat: "",
    rt: "",
    rw: "",
    region: { provinsi: "", kota: "", kecamatan: "", kelurahan: "" },
    domisili_lat: null as number | null,
    domisili_lng: null as number | null,
    radius_layanan_km: 1, // Minimum 1 KM
    ktp_url: "",
    koordinator_id: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('service_categories')
        .select('id, nama')
        .eq('is_active', true);
      if (data) setDbCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (form.region.kelurahan) {
      const fetchKoords = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('koordinator_profiles')
          .select(`
            id, 
            wilayah, 
            users!inner(full_name, provinsi, kabupaten_kota, kecamatan, kelurahan)
          `)
          .eq('status', 'verified')
          .eq('users.provinsi', form.region.provinsi)
          .eq('users.kabupaten_kota', form.region.kota)
          .eq('users.kecamatan', form.region.kecamatan)
          .eq('users.kelurahan', form.region.kelurahan);
          
        if (data) setKoordinators(data);
      };
      fetchKoords();
    } else {
      setKoordinators([]);
    }
  }, [form.region.kelurahan]);

  // Helper to toggle by ID
  const toggleKategori = (catId: string) => {
    setKategoriIds(prev => 
      prev.includes(catId) ? prev.filter(k => k !== catId) : [...prev, catId]
    );
  };

  const selectAllInTab = (tabId: string) => {
    const tier = tiers.find(t => t.id === tabId);
    if (!tier) return;
    const idsToAdd = dbCategories
      .filter(c => tier.catNames.includes(c.nama))
      .map(c => c.id);
    setKategoriIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const deselectAllInTab = (tabId: string) => {
    const tier = tiers.find(t => t.id === tabId);
    if (!tier) return;
    const idsToRemove = dbCategories
      .filter(c => tier.catNames.includes(c.nama))
      .map(c => c.id);
    setKategoriIds(prev => prev.filter(id => !idsToRemove.includes(id)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setFieldErrors({});

    if (kategoriIds.length === 0) {
      setErrorMsg("Harap pilih minimal 1 kategori layanan sebelum menyimpan profil Anda.");
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

      const payload = {
        bio: form.bio,
        wilayah_domisili: `${form.region.kelurahan}, ${form.region.kecamatan}, ${form.region.kota}, ${form.region.provinsi} | RT ${form.rt}/RW ${form.rw} | ${form.alamat}`,
        domisili_lat: form.domisili_lat,
        domisili_lng: form.domisili_lng,
        radius_layanan_km: form.radius_layanan_km,
        ktp_url: ktpUrl,
        kategori_ids: kategoriIds,
        koordinator_id: form.koordinator_id || null,
        provinsi: form.region.provinsi,
        kabupaten_kota: form.region.kota,
        kecamatan: form.region.kecamatan,
        kelurahan: form.region.kelurahan,
        rt: parseInt(form.rt, 10),
        rw: parseInt(form.rw, 10),
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
            <div className={step === 1 ? "block animate-in fade-in" : "hidden"}>
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

              <div className="grid grid-cols-2 gap-4 mt-4 mb-2">
                <div>
                  <Label htmlFor="rt" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    RT <span className="text-red-500">*</span>
                  </Label>
                  <Input id="rt" type="number" min={1} required placeholder="Contoh: 1" value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                   <Label htmlFor="rw" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    RW <span className="text-red-500">*</span>
                  </Label>
                  <Input id="rw" type="number" min={1} required placeholder="Contoh: 5" value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value })} className="rounded-xl" />
                </div>
              </div>

              {form.region.kelurahan && koordinators.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <Label className="text-xs font-bold uppercase tracking-wider text-[#0D47A1] block mb-2">
                    Pilih Koordinator RT/RW (Opsional)
                  </Label>
                  <p className="text-xs text-blue-700/80 mb-3">Terdapat {koordinators.length} Koordinator Rangkul yang aktif di kelurahan {form.region.kelurahan}. Memilih koordinator akan mempercepat verifikasi akun Anda.</p>
                  <select 
                    className="w-full text-sm border-gray-300 rounded-xl p-2.5 bg-white shadow-sm focus:ring-[#0D47A1] focus:border-[#0D47A1]"
                    value={form.koordinator_id}
                    onChange={(e) => setForm({ ...form, koordinator_id: e.target.value })}
                  >
                    <option value="">-- Saya tidak mengetahui Koordinator saya --</option>
                    {koordinators.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.users?.full_name} ({k.wilayah.split('|')[1]?.trim() || 'Data wilayah'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
              <p className="text-xs text-slate-500 mb-3">Ketuk map di bawah untuk mengatur titik pusat domisili Anda. Ini digunakan untuk kalkulasi jarak radius pelayanan (maksimal {form.radius_layanan_km || 1} km).</p>
              <LocationPicker 
                position={form.domisili_lat && form.domisili_lng ? { lat: form.domisili_lat, lng: form.domisili_lng } : null}
                onPositionChange={(pos, targetAddress) => {
                   setForm(f => ({ ...f, domisili_lat: pos.lat, domisili_lng: pos.lng, ...(targetAddress ? { alamat: targetAddress } : {}) }));
                }}
              />
            </div>

            <div className={step === 2 ? "block animate-in fade-in" : "hidden"}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 2: Profil & Spesialisasi Layanan</h2>
              
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4 mt-2">
                Kategori Layanan yang Disediakan <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-slate-500 mb-4">Tentukan tugas apa saja yang siap Anda tangani. Pilihlah sesuai dengan kapasitas fisik dan kompetensi Anda.</p>

              {/* Preview Tabs */}
              <div className="flex gap-2 mb-4 border-b border-gray-100 overflow-x-auto hide-scrollbar">
                 {tiers.map((tier) => (
                   <button
                     key={tier.id}
                     type="button"
                     onClick={() => setActiveTab(tier.id)}
                     className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
                       activeTab === tier.id 
                         ? 'border-[#0D47A1] text-[#0D47A1] bg-blue-50/40' 
                         : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                     }`}
                   >
                     {tier.title}
                   </button>
                 ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                {(() => {
                  const activeTier = tiers.find(t => t.id === activeTab);
                  if (!activeTier) return null;
                  const filteredDbCats = dbCategories.filter(c => activeTier.catNames.includes(c.nama));
                  
                  return filteredDbCats.slice(0, 4).map(cat => {
                    const isSelected = kategoriIds.includes(cat.id);
                    return (
                      <label 
                        key={cat.id} 
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-50/50 border-[#0D47A1]' 
                            : 'bg-white border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex justify-center items-center shrink-0 border transition-colors ${
                          isSelected ? 'bg-[#0D47A1] border-[#0D47A1]' : 'bg-white border-gray-300'
                        }`}>
                          {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={`text-sm font-semibold leading-tight ${isSelected ? 'text-[#0D47A1]' : 'text-gray-700'}`}>
                          {cat.nama}
                        </span>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleKategori(cat.id)}
                          className="hidden" 
                        />
                      </label>
                    );
                  });
                })()}
              </div>

              <div className="mb-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setModalOpen(true);
                    setModalActiveTab(activeTab); // Langsung buka tab yang sedang dilihat
                  }} 
                  className="text-[#0D47A1] text-sm font-semibold hover:underline flex items-center gap-1 mt-3 transition-colors hover:text-blue-800 focus:outline-none"
                >
                  {(() => {
                    const activeTier = tiers.find(t => t.id === activeTab);
                    const filteredCount = activeTier ? dbCategories.filter(c => activeTier.catNames.includes(c.nama)).length : 0;
                    const rem = Math.max(0, filteredCount - 4);
                    return `Tampilkan Semua Kategori ${activeTier?.title} (+${rem} lainnya)`;
                  })()}
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {kategoriIds.length > 0 && (
                <div className="mb-6 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Kategori Terpilih ({kategoriIds.length}):</span>
                  <div className="flex flex-wrap gap-2">
                    {dbCategories.filter(c => kategoriIds.includes(c.id)).map(c => (
                      <span key={c.id} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-[#0D47A1] border border-blue-200 shadow-sm">
                        {c.nama}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
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
                Radius Maksimal Jangkauan Layanan <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-slate-500 mb-3">Seberapa jauh maksimal Anda bersedia bepergian menjangkau rumah Lansia? (minimal 1 KM)</p>
              <div className="relative max-w-32">
                <Input
                  id="radius"
                  type="number"
                  min={1}
                  max={25}
                  value={form.radius_layanan_km || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                     const val = parseInt(e.target.value);
                     setForm({ ...form, radius_layanan_km: isNaN(val) ? 0 : Math.max(1, val) });
                  }}
                  className="h-11 rounded-xl pr-12 text-center font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">KM</span>
              </div>
            </div>

            <div className={step === 3 ? "block animate-in fade-in" : "hidden"}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 3: Unggah Identitas</h2>
              
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                URL Foto KTP / Dokumen Identitas <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-slate-500 mb-4">Mohon perhatikan tulisan KTP harus jelas dan tidak terpotong atau tertutup silau cahaya.</p>
              
              <Label 
                htmlFor="ktp_upload"
                className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors h-40 group ${
                  form.ktp_url ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-[#F5F8FC] hover:border-[#0D47A1]/40'
                }`}
              >
                <input 
                  type="file" 
                  id="ktp_upload" 
                  ref={ktpInputRef}
                  className="hidden" 
                  accept="image/jpeg, image/png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setForm({ ...form, ktp_url: URL.createObjectURL(e.target.files[0]) });
                      setKtpFileName(e.target.files[0].name);
                    }
                  }}
                />
                
                {form.ktp_url ? (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm font-bold text-green-700">{ktpFileName || 'Foto KTP Disimpan'}</p>
                    <p className="text-xs text-green-600/80 mt-1">Ketuk lagi untuk mengganti foto dokumen</p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0D47A1] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-[#0D47A1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-[#0D47A1]">Ketuk Area Ini untuk Unggah Foto KTP</p>
                    <p className="text-xs text-gray-500 mt-1">Maksimal ukuran 5MB (Format JPG/PNG)</p>
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
                    // Validasi khusus tiap langkah sebelum lanjut!
                    if (step === 1 && (!form.region.kelurahan || !form.alamat || !form.rt || !form.rw || form.domisili_lat === null)) {
                       setErrorMsg("Harap lengkapi wilayah domisili, (termasuk RT/RW), alamat spesifik, dan koordinat sebelum melanjutkan.");
                       return;
                    }
                    if (step === 2) {
                       if (form.radius_layanan_km < 1) {
                         setErrorMsg("Radius minimal adalah 1 KM.");
                         return;
                       }
                       if (kategoriIds.length === 0) {
                         setErrorMsg("Anda harus memilih minimal satu kategori layanan!");
                         return;
                       }
                    }
                    setStep(s => s + 1);
                  }}
                  className="flex-1 h-11 bg-[#0D47A1] hover:bg-blue-800 text-white font-semibold rounded-xl"
                >
                  Selanjutnya
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] h-11 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-95 shadow-md flex items-center justify-center transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sedang Verifikasi...
                    </>
                  ) : (
                    "Kirim Verifikasi Profil"
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Modern Fresh Wide Categories Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 hide-scrollbar">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl min-h-[50vh] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             
             {/* Modal Header */}
             <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <div>
                  <h3 className="font-bold text-xl text-gray-900">Kategori Layanan yang Disediakan</h3>
                  <p className="text-xs text-gray-500 mt-1">Pilih tugas yang sesuai dengan kemampuan dan pengalaman Anda.</p>
               </div>
               <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             
             {/* Modal Navbar Tabs */}
             <div className="px-6 pt-4 border-b border-gray-100">
               <div className="flex overflow-x-auto hide-scrollbar gap-2">
                 {tiers.map((tier) => (
                   <button
                     key={tier.id}
                     onClick={() => setModalActiveTab(tier.id)}
                     className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex-1 text-center ${
                       modalActiveTab === tier.id 
                         ? 'border-[#0D47A1] text-[#0D47A1] bg-blue-50/40' 
                         : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                     }`}
                   >
                     {tier.title}
                   </button>
                 ))}
               </div>
             </div>
             
             {/* Modal Content - 3 Column Grid */}
             <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1">
                <div className="flex justify-between items-center mb-4">
                  <div className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-xs font-bold">
                    {tiers.find(t => t.id === modalActiveTab)?.desc}
                  </div>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="sm" onClick={() => deselectAllInTab(modalActiveTab)} className="text-xs h-8 text-gray-500">Hapus Semua</Button>
                     <Button variant="outline" size="sm" onClick={() => selectAllInTab(modalActiveTab)} className="text-xs h-8 border-blue-200 text-blue-700 hover:bg-blue-50">Pilih Semua di Tab Ini</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(() => {
                    const activeTier = tiers.find(t => t.id === modalActiveTab);
                    if (!activeTier) return null;
                    
                    const filteredDbCats = dbCategories.filter(c => activeTier.catNames.includes(c.nama));
                    
                    return filteredDbCats.map((cat) => {
                      const isSelected = kategoriIds.includes(cat.id);
                      return (
                        <label 
                          key={cat.id} 
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-sm ${
                            isSelected 
                              ? 'bg-blue-50/50 border-[#0D47A1] shadow-sm' 
                              : 'bg-white border-gray-100 hover:border-blue-200'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex justify-center items-center shrink-0 border transition-colors ${
                            isSelected ? 'bg-[#0D47A1] border-[#0D47A1]' : 'bg-white border-gray-300'
                          }`}>
                            {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={`text-sm font-semibold leading-tight ${isSelected ? 'text-[#0D47A1]' : 'text-gray-700'}`}>
                            {cat.nama}
                          </span>
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleKategori(cat.id)}
                            className="hidden" 
                          />
                        </label>
                      );
                    });
                  })()}
                </div>
             </div>

             {/* Modal Footer */}
             <div className="p-5 border-t border-gray-100 bg-white">
               <Button onClick={() => setModalOpen(false)} className="w-full h-12 bg-[#0D47A1] hover:bg-blue-800 text-white text-[15px] font-bold rounded-xl shadow-md">
                 Selesai Memilih Kategori
               </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}