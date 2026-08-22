"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertCircle, MapPin, User, List, Phone, ShieldCheck, X } from "lucide-react";
import LocationPicker from "@/components/ui/LocationPicker";
import RegionSelect from "@/components/ui/RegionSelect";

export default function HelperEditProfilPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  
  const [activeTab, setActiveTab] = useState<'mandiri' | 'operasional'>('mandiri');

  const [form, setForm] = useState({
    username: "",
    phone: "",
    foto_url: "",
    password: "",
    confirmPassword: "",
    alamat: "",
    rt: "",
    rw: "",
    region: { provinsi: "", kota: "", kecamatan: "", kelurahan: "" },
    domisili_lat: null as number | null,
    domisili_lng: null as number | null,
  });

  const [dbCategories, setDbCategories] = useState<{id: string, nama: string}[]>([]);
  const [kategoriIds, setKategoriIds] = useState<string[]>([]);
  const [helperProfileId, setHelperProfileId] = useState<string | null>(null);
  
  const [catTab, setCatTab] = useState<string>("ringan");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<string>("ringan");

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [fotoFileName, setFotoFileName] = useState<string | null>(null);

  const tiers = [
    {
      id: "ringan",
      title: "Ringan",
      desc: "Aktivitas harian ringan & non-medis.",
      catNames: ["Pengingat Obat", "Menemani Mengobrol (singkat)", "Bantuan Teknologi (singkat)", "Bersih-bersih Ringan", "Antar Obat (dekat, ≤1 km)"]
    },
    {
      id: "sedang",
      title: "Sedang",
      desc: "Bantuan rutinitas harian untuk lansia semi-mandiri.",
      catNames: ["Menemani Mengobrol (lama)", "Bantuan Teknologi (lama)", "Antar Obat (sedang, 1–3 km)", "Belanja Kebutuhan (standar)"]
    },
    {
      id: "berat",
      title: "Berat",
      desc: "Perawatan khusus dan penanganan medis dasar.",
      catNames: ["Antar Obat (jauh, >3 km)", "Bersih-bersih Menyeluruh", "Kontrol Kesehatan (antar ke faskes)", "Belanja Kebutuhan (besar/jauh)"]
    }
  ];

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      // Set username
      const name = user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || "";
      const phone = user.user_metadata?.phone || "";
      
      const { data: profile } = await supabase
        .from('helper_profiles')
        .select('id, wilayah_domisili, domisili_lat, domisili_lng')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setHelperProfileId(profile.id);
        
        const region = { provinsi: "", kota: "", kecamatan: "", kelurahan: "" };
        let rt = "", rw = "", alamat = "";
        
        if (profile.wilayah_domisili) {
          const parts = profile.wilayah_domisili.split(' | ');
          if (parts.length >= 3) {
             const adminParts = parts[0].split(', ');
             if (adminParts.length >= 4) {
                region.kelurahan = adminParts[0];
                region.kecamatan = adminParts[1];
                region.kota = adminParts[2];
                region.provinsi = adminParts[3];
             }
             const rtrw = parts[1].match(/RT (\d+)\/RW (\d+)/);
             if (rtrw) {
                rt = rtrw[1];
                rw = rtrw[2];
             }
             alamat = parts[2];
          } else {
             alamat = profile.wilayah_domisili;
          }
        }

        setForm(prev => ({
          ...prev,
          username: name,
          phone: phone,
          alamat,
          rt,
          rw,
          region,
          domisili_lat: profile.domisili_lat,
          domisili_lng: profile.domisili_lng,
        }));

        const { data: cats } = await supabase
          .from('helper_service_categories')
          .select('service_category_id')
          .eq('helper_id', profile.id);
          
        if (cats) {
          setKategoriIds(cats.map(c => c.service_category_id));
        }
      }

      const { data: allCats } = await supabase.from('service_categories').select('id, nama').eq('is_active', true);
      if (allCats) setDbCategories(allCats);
    };
    fetchData();
  }, [router]);

  const toggleKategori = (catId: string) => {
    setKategoriIds(prev => prev.includes(catId) ? prev.filter(k => k !== catId) : [...prev, catId]);
  };

  const selectAllInTab = (tabId: string) => {
    const tier = tiers.find(t => t.id === tabId);
    if (!tier) return;
    const idsToAdd = dbCategories.filter(c => tier.catNames.includes(c.nama)).map(c => c.id);
    setKategoriIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const deselectAllInTab = (tabId: string) => {
    const tier = tiers.find(t => t.id === tabId);
    if (!tier) return;
    const idsToRemove = dbCategories.filter(c => tier.catNames.includes(c.nama)).map(c => c.id);
    setKategoriIds(prev => prev.filter(id => !idsToRemove.includes(id)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    if (form.password && form.password !== form.confirmPassword) {
      showToast("Password dan Konfirmasi Password tidak cocok.");
      setLoading(false);
      return;
    }

    if (kategoriIds.length === 0) {
      showToast("Harap pilih minimal 1 kategori layanan.");
      setLoading(false);
      return;
    }

    try {
      // MOCKUP API UPDATE
      // In a real app, this would call Supabase to update auth.users, public.users, helper_profiles, and helper_service_categories
      // Since we are mocking the backend, we simulate a successful update delay.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast("Profil berhasil diperbarui!", "success");
      setTimeout(() => router.push("/helper/dashboard"), 2000);
    } catch {
      showToast("Terjadi kesalahan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6 relative pb-24">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] max-w-sm w-full p-4 rounded-xl shadow-lg border animate-in slide-in-from-top-4 fade-in duration-300 ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${toast.type === 'error' ? 'text-red-500' : 'text-green-500'}`} />
            <div>
              <p className="font-semibold text-sm mb-0.5">{toast.type === 'error' ? 'Peringatan' : 'Berhasil'}</p>
              <p className="text-xs opacity-90">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Profil</h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl leading-relaxed">
            Perbarui informasi akun, keamanan, dan layanan Anda.
          </p>
        </div>

        {/* Tabs - Glassmorphism */}
        <div className="relative p-1.5 bg-white/50 backdrop-blur-md rounded-2xl flex border border-white/60 shadow-sm overflow-hidden mb-6">
          <div 
            className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${activeTab === 'mandiri' ? 'translate-x-0' : 'translate-x-full ml-1.5'}`}
          />
          <button 
            type="button"
            onClick={() => setActiveTab('mandiri')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === 'mandiri' ? 'text-[#0D47A1]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User className="w-4 h-4" /> Data Mandiri
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('operasional')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === 'operasional' ? 'text-[#0D47A1]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Data Operasional
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className={`transition-all duration-500 ${activeTab === 'mandiri' ? 'block animate-in fade-in slide-in-from-left-4' : 'hidden'}`}>
            {/* Akun & Keamanan */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b pb-4 border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#0D47A1]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Akun & Keamanan</h2>
              </div>
              
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Foto Profil Anda</Label>
                <Label 
                  htmlFor="foto_upload"
                  className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors h-32 group ${
                    form.foto_url ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-[#F5F8FC] hover:border-[#0D47A1]/40'
                  }`}
                >
                  <input 
                    type="file" 
                    id="foto_upload" 
                    ref={fotoInputRef}
                    className="hidden" 
                    accept="image/jpeg, image/png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        if (!['image/jpeg', 'image/png'].includes(file.type)) {
                          showToast("Format file salah. Harus berupa JPG atau PNG.", "error");
                          e.target.value = '';
                          setForm({ ...form, foto_url: "" });
                          setFotoFileName(null);
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          showToast("Ukuran file terlalu besar. Maksimal 5MB.", "error");
                          e.target.value = '';
                          setForm({ ...form, foto_url: "" });
                          setFotoFileName(null);
                          return;
                        }
                        setForm({ ...form, foto_url: URL.createObjectURL(file) });
                        setFotoFileName(file.name);
                      }
                    }}
                  />
                  
                  {form.foto_url ? (
                    <>
                      <div className="absolute inset-0 w-full h-full z-0 opacity-20 group-hover:opacity-10 transition-opacity">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img src={form.foto_url} alt="Preview Foto" className="w-full h-full object-cover" />
                      </div>
                      <div className="relative z-10 text-center p-4">
                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-2 shadow-md ring-4 ring-white">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-xs font-bold text-slate-800 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm inline-block">{fotoFileName || 'Foto Profil Disimpan'}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0D47A1] flex items-center justify-center mx-auto mb-2">
                        <User className="w-5 h-5 text-[#0D47A1]" />
                      </div>
                      <p className="text-sm font-bold text-[#0D47A1]">Ketuk untuk Unggah Foto</p>
                      <p className="text-xs text-gray-500 mt-1">Maksimal 5MB (Format JPG/PNG)</p>
                    </div>
                  )}
                </Label>
              </div>
              
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Username / Nama Lengkap</Label>
                <Input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Nama Anda" className="rounded-xl h-11" />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Nomor WhatsApp
                </Label>
                <Input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Contoh: 08123456789" className="rounded-xl h-11" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Password Baru (Opsional)</Label>
                  <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Ketik password baru" className="rounded-xl h-11" />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Konfirmasi Password</Label>
                  <Input type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} placeholder="Ulangi password baru" className="rounded-xl h-11" />
                </div>
              </div>
            </div>

            {/* Kategori Layanan */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6 mt-6">
              <div className="flex items-center gap-2 border-b pb-4 border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <List className="w-5 h-5 text-[#0D47A1]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Kategori Layanan</h2>
              </div>

              <div className="space-y-6">
                <p className="text-xs text-slate-500 mb-4">Tentukan tugas apa saja yang siap Anda tangani. Pilihlah sesuai dengan kapasitas fisik dan kompetensi Anda.</p>
                {/* Preview Tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-100 overflow-x-auto hide-scrollbar">
                   {tiers.map((tier) => (
                     <button
                       key={tier.id}
                       type="button"
                       onClick={() => setCatTab(tier.id)}
                       className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
                         catTab === tier.id 
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
                    const activeTier = tiers.find(t => t.id === catTab);
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
                      setModalActiveTab(catTab);
                    }} 
                    className="text-[#0D47A1] text-sm font-semibold hover:underline flex items-center gap-1 mt-3 transition-colors hover:text-blue-800 focus:outline-none"
                  >
                    {(() => {
                      const activeTier = tiers.find(t => t.id === catTab);
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
              </div>
            </div>
          </div>

          <div className={`transition-all duration-500 ${activeTab === 'operasional' ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
            {/* Alamat */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b pb-4 border-slate-100">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Data Operasional (Butuh Verifikasi)</h2>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-orange-800">Peringatan Mengubah Alamat</h3>
                  <p className="text-sm text-orange-700 mt-1 leading-relaxed">
                    Jika Anda mengubah alamat domisili atau titik lokasi operasional, Anda diwajibkan untuk <b>menghadap dan memverifikasi ulang</b> data Anda ke Koordinator setempat.
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Wilayah Administrasi Domisili</Label>
                <RegionSelect 
                  initialRegion={form.region}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">RT</Label>
                  <Input type="number" min={1} placeholder="Contoh: 1" value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">RW</Label>
                  <Input type="number" min={1} placeholder="Contoh: 5" value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value })} className="rounded-xl" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Detail Alamat Lengkap / Patokan</Label>
                <Textarea value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} placeholder="Jl. Merdeka No.1..." className="rounded-xl min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white" />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Titik Peta Koordinat (Domisili)</Label>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <LocationPicker 
                    position={form.domisili_lat && form.domisili_lng ? { lat: form.domisili_lat, lng: form.domisili_lng } : null}
                    onPositionChange={(pos, targetAddress) => {
                       setForm(f => ({ ...f, domisili_lat: pos.lat, domisili_lng: pos.lng, ...(targetAddress ? { alamat: targetAddress } : {}) }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 sticky bottom-6 z-20">
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#0D47A1] to-[#1976D2] hover:opacity-90 text-white font-bold h-14 rounded-xl text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98]">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Simpan Perubahan Profil"}
            </Button>
          </div>
        </form>
      </div>
      
      {/* --- Modal Kategori --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Pilih Kategori Layanan</h2>
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex px-6 border-b border-gray-100 shrink-0 bg-white">
              {tiers.map(tier => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setModalActiveTab(tier.id)}
                  className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                    modalActiveTab === tier.id 
                      ? 'border-[#0D47A1] text-[#0D47A1]' 
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tier.title}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {(() => {
                const activeTier = tiers.find(t => t.id === modalActiveTab);
                if (!activeTier) return null;
                const filteredDbCats = dbCategories.filter(c => activeTier.catNames.includes(c.nama));
                
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold">{filteredDbCats.length} kategori dalam kelompok ini.</p>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => selectAllInTab(modalActiveTab)}>Pilih Semua</Button>
                        <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] text-red-500" onClick={() => deselectAllInTab(modalActiveTab)}>Hapus Semua</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredDbCats.map(cat => {
                        const isSelected = kategoriIds.includes(cat.id);
                        return (
                          <label 
                            key={cat.id} 
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected ? 'bg-blue-50/50 border-[#0D47A1]' : 'bg-white border-gray-200 hover:border-blue-200 shadow-sm'
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded flex justify-center items-center shrink-0 border transition-colors ${
                              isSelected ? 'bg-[#0D47A1] border-[#0D47A1]' : 'bg-white border-gray-300'
                            }`}>
                              {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className={`text-sm font-semibold leading-snug ${isSelected ? 'text-[#0D47A1]' : 'text-gray-700'}`}>
                              {cat.nama}
                            </span>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleKategori(cat.id)} className="hidden" />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end shrink-0">
              <Button type="button" onClick={() => setModalOpen(false)} className="bg-[#0D47A1] hover:bg-blue-800 text-white rounded-xl font-bold px-8">
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
