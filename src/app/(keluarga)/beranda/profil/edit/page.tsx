"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertCircle, MapPin, User, Phone, Users } from "lucide-react";
import LocationPicker from "@/components/ui/LocationPicker";
import RegionSelect from "@/components/ui/RegionSelect";
import React from "react";
import type { Database } from "@/types/database";
import { parseRegionAddress } from "@/lib/region-address";

type LansiaProfile = Database["public"]["Tables"]["lansia_profiles"]["Row"];

export default function KeluargaEditProfilPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  
  const [activeTab, setActiveTab] = useState<'mandiri' | 'operasional' | 'lansia'>('mandiri');
  const [lansias, setLansias] = useState<LansiaProfile[]>([]);
  const initialSnapshot = React.useRef<string | null>(null);

  const [form, setForm] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    foto_url: "",
    alamat: "",
    rt: "",
    rw: "",
    region: { provinsi: "", kota: "", kecamatan: "", kelurahan: "" },
    domisili_lat: null as number | null,
    domisili_lng: null as number | null,
  });

  const fotoInputRef = React.useRef<HTMLInputElement>(null);
  const [fotoFileName, setFotoFileName] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data: profile } = await supabase
        .from('users')
        .select('id, full_name, username, phone, alamat_detail, rt, rw, kelurahan, kecamatan, kabupaten_kota, provinsi')
        .eq('id', user.id)
        .maybeSingle();

      const { data: lansiaData } = await supabase
        .from('lansia_profiles')
        .select('*')
        .eq('keluarga_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (lansiaData) {
        setLansias(lansiaData);
      }

      if (profile) {
        const parsed = parseRegionAddress(profile.alamat_detail);
        const nextForm = {
          ...form,
          username: profile.full_name || profile.username || user.email?.split('@')[0] || "",
          phone: profile.phone?.replace(/^\+62/, "0") || "",
          foto_url: user.user_metadata?.avatar_url || "",
          alamat: profile.alamat_detail?.includes("|") ? parsed.detail : profile.alamat_detail || "",
          rt: profile.rt?.toString() || parsed.rt || "",
          rw: profile.rw?.toString() || parsed.rw || "",
          region: {
            provinsi: profile.provinsi || parsed.provinsi || "",
            kota: profile.kabupaten_kota || parsed.kotaKabupaten || "",
            kecamatan: profile.kecamatan || parsed.kecamatan || "",
            kelurahan: profile.kelurahan || parsed.kelurahan || "",
          },
        };

        setForm(nextForm);
        initialSnapshot.current = JSON.stringify({ ...nextForm, password: "", confirmPassword: "", foto_url: "" });
      }
    };
    fetchData();
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    if (form.password && form.password !== form.confirmPassword) {
      showToast("Password dan Konfirmasi Password tidak cocok.");
      setLoading(false);
      return;
    }

    const currentSnapshot = JSON.stringify({ ...form, password: "", confirmPassword: "", foto_url: "" });
    if (initialSnapshot.current === currentSnapshot && !form.password && !fotoFile) {
      showToast("Tidak ada perubahan.", "success");
      setLoading(false);
      return;
    }

    try {
      const regionParts = [form.region.kelurahan, form.region.kecamatan, form.region.kota, form.region.provinsi].filter(Boolean);
      const regionStr = regionParts.length > 0 ? regionParts.join(", ") : "";
      const rtrwStr = form.rt && form.rw ? `RT ${form.rt}/RW ${form.rw}` : (form.rt ? `RT ${form.rt}` : (form.rw ? `RW ${form.rw}` : ""));
      const alamat_detail = [regionStr, rtrwStr, form.alamat].filter(Boolean).join(" | ");

      let avatarPath = form.foto_url;
      if (fotoFile) {
        const uploadData = new FormData();
        uploadData.append("file", fotoFile);
        uploadData.append("docType", "foto_keluarga");
        const uploadRes = await fetch("/api/storage/upload", { method: "POST", body: uploadData });
        const uploaded = await uploadRes.json();
        if (uploadRes.ok && (uploaded.data?.path || uploaded.path)) {
          avatarPath = uploaded.data?.path || uploaded.path;
        }
      }

      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.username,
          phone: form.phone,
          alamat_detail,
          rt: form.rt ? Number(form.rt) : undefined,
          rw: form.rw ? Number(form.rw) : undefined,
          kelurahan: form.region.kelurahan || undefined,
          kecamatan: form.region.kecamatan || undefined,
          kabupaten_kota: form.region.kota || undefined,
          provinsi: form.region.provinsi || undefined,
        }),
      });

      const body = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(body?.message || "Profil gagal diperbarui");

      if (form.password) {
        const { error } = await createClient().auth.updateUser({ password: form.password });
        if (error) throw new Error(error.message);
      }

      showToast("Profil keluarga berhasil diperbarui!", "success");
      setTimeout(() => router.push("/beranda/profil"), 1000);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Terjadi kesalahan.");
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Profil Keluarga</h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl leading-relaxed">
            Perbarui informasi akun, kontak, dan alamat rumah Anda.
          </p>
        </div>

        {/* Tabs - Glassmorphism */}
        <div className="relative p-1.5 bg-white/50 backdrop-blur-md rounded-2xl flex border border-white/60 shadow-sm overflow-hidden mb-6">
          <div 
            className={`absolute inset-y-1.5 w-[calc(33.333%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${
              activeTab === 'mandiri' ? 'translate-x-0' : 
              activeTab === 'operasional' ? 'translate-x-[calc(100%+6px)]' : 
              'translate-x-[calc(200%+12px)]'
            }`}
          />
          <button 
            type="button"
            onClick={() => setActiveTab('mandiri')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === 'mandiri' ? 'text-[#0D47A1]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User className="w-4 h-4" /> Data Akun
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('operasional')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === 'operasional' ? 'text-[#0D47A1]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <MapPin className="w-4 h-4" /> Alamat Rumah
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('lansia')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors relative z-10 ${activeTab === 'lansia' ? 'text-[#0D47A1]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-4 h-4" /> Profil Lansia
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
                <h2 className="text-lg font-bold text-gray-900">Data Personal</h2>
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
                        setFotoFile(file);
                      }
                    }}
                  />
                  
                  {form.foto_url ? (
                    <>
                      <div className="absolute inset-0 w-full h-full z-0 opacity-20 group-hover:opacity-10 transition-opacity">
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
                  <Phone className="w-3.5 h-3.5" /> Nomor Telepon / WhatsApp
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
          </div>

          <div className={`transition-all duration-500 ${activeTab === 'operasional' ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
            {/* Alamat */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b pb-4 border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#0D47A1]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Alamat Rumah & Titik Peta</h2>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Wilayah Administrasi Domisili <span className="text-red-500">*</span>
                </Label>
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
                <div className="grid grid-cols-2 gap-4 mt-4 mb-2">
                  <div>
                    <Label htmlFor="rt" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      RT <span className="text-red-500">*</span>
                    </Label>
                    <Input id="rt" type="number" min={1} required placeholder="Contoh: 1" value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value })} className="rounded-xl border-border focus-visible:border-[#0D47A1]" />
                  </div>
                  <div>
                     <Label htmlFor="rw" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      RW <span className="text-red-500">*</span>
                    </Label>
                    <Input id="rw" type="number" min={1} required placeholder="Contoh: 5" value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value })} className="rounded-xl border-border focus-visible:border-[#0D47A1]" />
                  </div>
                </div>
                <Label htmlFor="alamat" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 mt-2">
                  Alamat Spesifik Tempat Tinggal / Detail Patokan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="alamat"
                  required
                  rows={3}
                  placeholder="Contoh: Jl. Merdeka No.1..."
                  value={form.alamat}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, alamat: e.target.value })}
                  className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus-visible:border-[#0D47A1]"
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Titik Peta Koordinat (Untuk Helper)</Label>
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

          <div className={`transition-all duration-500 ${activeTab === 'lansia' ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
            {/* Profil Lansia */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b pb-4 border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#0D47A1]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Profil Lansia Tersimpan</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lansias.map((lansia) => (
                  <div key={lansia.id} className="bg-[#F5F8FC] p-4 rounded-xl border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                      <Users className="w-16 h-16 text-[#0D47A1]" />
                    </div>
                    <div>
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-blue-100 text-blue-700 mb-2 inline-block">
                        {lansia.hubungan_keluarga || 'Keluarga'}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mb-1">{lansia.nama}</h3>
                      <p className="text-xs font-medium text-gray-500 line-clamp-2 mb-4">
                        {lansia.catatan_kondisi || 'Tidak ada catatan khusus'}
                      </p>
                    </div>
                    <div className="flex gap-2 relative z-10 w-full">
                      <Button asChild variant="outline" size="sm" className="flex-1 text-xs font-semibold rounded-lg h-8 bg-white">
                        <Link href={`/lansia/${lansia.id}/edit`}>Edit Profil</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Link href="/lansia/tambah" className="bg-transparent border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 text-gray-500 hover:text-[#0D47A1] hover:border-[#0D47A1] hover:bg-blue-50/50 transition-all min-h-[140px]">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <span className="font-semibold text-xs">Tambah Lansia</span>
                </Link>
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
    </div>
  );
}
