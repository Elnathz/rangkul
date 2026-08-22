"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertCircle, MapPin, Heart, ArrowLeft, UserRound, Stethoscope } from "lucide-react";
import LocationPicker from "@/components/ui/LocationPicker";
import RegionSelect from "@/components/ui/RegionSelect";
import Link from "next/link";
import { ImageCropperModal } from "@/components/ui/ImageCropperModal";

export default function LansiaEditProfilPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  
  const [activeTab, setActiveTab] = useState<'biodata' | 'kondisi' | 'alamat'>('biodata');

  const [form, setForm] = useState({
    nama: "",
    umur: "",
    kondisi_medis: "",
    tingkat_mobilitas: "",
    kebutuhan_khusus: "",
    foto_url: "",
    alamat: "",
    rt: "",
    rw: "",
    region: { provinsi: "", kota: "", kecamatan: "", kelurahan: "" },
    domisili_lat: null as number | null,
    domisili_lng: null as number | null,
  });

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [fotoFileName, setFotoFileName] = useState<string | null>(null);
  
  const [cropModalSrc, setCropModalSrc] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data: dbData } = await supabase
        .from('lansia_profiles')
        .select('*')
        .eq('id', id)
        .eq('keluarga_id', user.id)
        .single();
      const data = dbData as { nama?: string; umur?: number; catatan_kondisi?: string; tingkat_mobilitas?: string; kebutuhan_khusus?: string; foto_url?: string; alamat?: string; lat?: number; lng?: number } | null;

      if (data) {
        const region = { provinsi: "", kota: "", kecamatan: "", kelurahan: "" };
        let rt = "", rw = "", baseAlamat = data.alamat || "";
        
        const rtrwMatch = baseAlamat.match(/(.*),\s*RT\s*(\d+)\/RW\s*(\d+)(.*)/i);
        if (rtrwMatch) {
            baseAlamat = (rtrwMatch[1] + rtrwMatch[4]).trim();
            rt = rtrwMatch[2];
            rw = rtrwMatch[3];
        }

        setForm(prev => ({
          ...prev,
          nama: data.nama || "",
          umur: data.umur?.toString() || "",
          kondisi_medis: data.catatan_kondisi || "",
          tingkat_mobilitas: data.tingkat_mobilitas || "",
          kebutuhan_khusus: data.kebutuhan_khusus || "",
          foto_url: data.foto_url || "",
          alamat: baseAlamat,
          rt,
          rw,
          region,
          domisili_lat: data.lat || 0,
          domisili_lng: data.lng || 0,
        }));
      }
      setFetching(false);
    };
    if (id) fetchData();
  }, [id, supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    if (!form.nama || !form.umur || !form.tingkat_mobilitas) {
      showToast("Mohon lengkapi nama, umur, dan tingkat mobilitas.");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      let finalFotoUrl = form.foto_url;
      const file = croppedFile || fotoInputRef.current?.files?.[0];
      
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/lansia/${id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('dokumen')
          .upload(fileName, file, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data: signedUrlData } = await supabase.storage
          .from('dokumen')
          .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10);
          
        if (signedUrlData) {
           finalFotoUrl = signedUrlData.signedUrl;
        }
      }

      // Format alamat lengkap
      let fullAlamat = form.alamat;
      if (form.rt || form.rw) {
         fullAlamat += `, RT ${form.rt}/RW ${form.rw}`;
      }
      if (form.region.kelurahan) {
         fullAlamat += `, ${form.region.kelurahan}, ${form.region.kecamatan}, ${form.region.kota}, ${form.region.provinsi}`;
      }

      const { error: updateError } = await supabase
        .from('lansia_profiles')
        .update({
          nama: form.nama,
          umur: parseInt(form.umur),
          alamat: fullAlamat,
          catatan_kondisi: form.kondisi_medis,
          tingkat_mobilitas: form.tingkat_mobilitas,
          kebutuhan_khusus: form.kebutuhan_khusus,
          foto_url: finalFotoUrl,
          lat: form.domisili_lat,
          lng: form.domisili_lng,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('keluarga_id', user.id);

      if (updateError) throw updateError;
      
      showToast("Profil lansia berhasil diperbarui!", "success");
      setTimeout(() => router.push(`/lansia/${id}`), 2000);
    } catch (err: unknown) {
      console.error(err);
      showToast((err as Error).message || "Terjadi kesalahan koneksi.");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FC] pb-24">
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

      {/* Dynamic Header */}
      <div className="bg-gradient-to-br from-[#0D47A1] to-[#1976D2] pt-8 pb-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-xl mx-auto relative z-10">
          <Link href={`/lansia/${id}`} className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit Profil Lansia</h1>
          <p className="text-blue-100 mt-1.5 opacity-90">Perbarui data kesehatan dan alamat lansia.</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 -mt-24 relative z-20 space-y-6">

        {/* Tabs - Glassmorphism */}
        <div className="relative p-1.5 bg-white/20 backdrop-blur-md rounded-2xl flex border border-white/20 shadow-sm overflow-hidden mb-6">
          <div 
            className={`absolute inset-y-1.5 w-[calc(33.333%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${activeTab === 'biodata' ? 'translate-x-0' : activeTab === 'kondisi' ? 'translate-x-[calc(100%+9px)]' : 'translate-x-[calc(200%+18px)]'}`}
          />
          <button 
            type="button"
            onClick={() => setActiveTab('biodata')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === 'biodata' ? 'text-[#0D47A1]' : 'text-white hover:text-blue-100'}`}
          >
            Biodata
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('kondisi')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === 'kondisi' ? 'text-[#0D47A1]' : 'text-white hover:text-blue-100'}`}
          >
            Kondisi
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('alamat')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === 'alamat' ? 'text-[#0D47A1]' : 'text-white hover:text-blue-100'}`}
          >
            Alamat
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TAB: BIODATA */}
          <div className={`transition-all duration-500 ${activeTab === 'biodata' ? 'block animate-in fade-in slide-in-from-left-4' : 'hidden'}`}>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center gap-2 border-b pb-4 border-slate-50">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <UserRound className="w-5 h-5 text-[#0D47A1]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Data Personal Lansia</h2>
              </div>
              
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">Foto Lansia (Opsional)</Label>
                <Label 
                  htmlFor="foto_upload"
                  className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors h-32 group ${
                    form.foto_url ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50 hover:bg-[#F5F8FC] hover:border-[#0D47A1]/40'
                  }`}
                >
                  <input 
                    type="file" id="foto_upload" ref={fotoInputRef} className="hidden" accept="image/jpeg, image/png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        if (file.size > 5 * 1024 * 1024) {
                          showToast("Ukuran foto maksimal 5MB", "error");
                          e.target.value = '';
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => setCropModalSrc(reader.result as string);
                        reader.readAsDataURL(file);
                        setFotoFileName(file.name);
                        e.target.value = '';
                      }
                    }}
                  />
                  
                  {form.foto_url ? (
                    <>
                      <div className="absolute inset-0 w-full h-full z-0 opacity-20 group-hover:opacity-10 transition-opacity">
                         <img src={form.foto_url} alt="Preview Foto" className="w-full h-full object-cover" />
                      </div>
                      <div className="relative z-10 text-center p-4">
                        <p className="text-xs font-bold text-slate-800 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm inline-block">{fotoFileName || 'Foto Diperbarui'}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0D47A1] flex items-center justify-center mx-auto mb-2">
                        <UserRound className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-[#0D47A1]">Unggah Foto Lansia</p>
                    </div>
                  )}
                </Label>
              </div>
              
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Nama Lengkap Lansia <span className="text-red-500">*</span></Label>
                <Input value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} placeholder="Sesuai KTP" className="rounded-xl h-11" required />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Umur (Tahun) <span className="text-red-500">*</span></Label>
                <Input type="number" min={50} value={form.umur} onChange={e => setForm({...form, umur: e.target.value})} placeholder="Contoh: 65" className="rounded-xl h-11" required />
              </div>
            </div>
          </div>

          {/* TAB: KONDISI MEDIS */}
          <div className={`transition-all duration-500 ${activeTab === 'kondisi' ? 'block animate-in fade-in zoom-in-95' : 'hidden'}`}>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center gap-2 border-b pb-4 border-slate-50">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-rose-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Kesehatan & Mobilitas</h2>
              </div>
              
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Tingkat Mobilitas <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-1 gap-2">
                  {['Mandiri (Bisa jalan sendiri)', 'Bantuan Alat (Tongkat/Walker)', 'Kursi Roda', 'Bedbound (Hanya di kasur)'].map(m => (
                    <label key={m} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.tingkat_mobilitas === m ? 'bg-blue-50 border-[#0D47A1]' : 'hover:bg-slate-50 border-slate-200'}`}>
                      <input type="radio" name="mobilitas" checked={form.tingkat_mobilitas === m} onChange={() => setForm({...form, tingkat_mobilitas: m})} className="hidden" />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.tingkat_mobilitas === m ? 'border-[#0D47A1]' : 'border-slate-300'}`}>
                        {form.tingkat_mobilitas === m && <div className="w-2 h-2 rounded-full bg-[#0D47A1]" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Riwayat Medis (Singkat)</Label>
                <Textarea value={form.kondisi_medis} onChange={e => setForm({...form, kondisi_medis: e.target.value})} placeholder="Contoh: Hipertensi, Diabetes Tipe 2..." className="rounded-xl min-h-[80px]" />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5" /> Kebutuhan Khusus / Pantangan
                </Label>
                <Textarea value={form.kebutuhan_khusus} onChange={e => setForm({...form, kebutuhan_khusus: e.target.value})} placeholder="Contoh: Tidak boleh makan manis, mudah lupa..." className="rounded-xl min-h-[80px]" />
              </div>
            </div>
          </div>

          {/* TAB: ALAMAT */}
          <div className={`transition-all duration-500 ${activeTab === 'alamat' ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center gap-2 border-b pb-4 border-slate-50">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Lokasi Tinggal Lansia</h2>
              </div>
              
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 shadow-sm mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                <p className="text-xs text-orange-800 leading-relaxed">
                  Tentukan alamat domisili lansia dengan presisi. Ini digunakan Helper untuk menghitung jarak.
                </p>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Wilayah Administrasi</Label>
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
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">RT</Label>
                  <Input type="number" min={1} value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">RW</Label>
                  <Input type="number" min={1} value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value })} className="rounded-xl" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Detail Alamat Lengkap</Label>
                <Textarea value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} placeholder="Jl. Bunga Mawar No. 5..." className="rounded-xl min-h-[100px]" />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Titik Peta Koordinat (Opsional)</Label>
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
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#0D47A1] to-[#1976D2] hover:opacity-90 text-white font-bold h-14 rounded-2xl text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98]">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Simpan Profil Lansia"}
            </Button>
          </div>
        </form>
      </div>

      {cropModalSrc && (
        <ImageCropperModal
          imageSrc={cropModalSrc}
          aspectRatio={4/3}
          onCropComplete={(file) => {
            setCroppedFile(file);
            setForm({ ...form, foto_url: URL.createObjectURL(file) });
            setCropModalSrc(null);
          }}
          onCancel={() => {
            setCropModalSrc(null);
            setFotoFileName(null);
          }}
        />
      )}
    </div>
  );
}
