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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [categories, setCategories] = useState<{id: string, nama: string}[]>([]);
  const [kategoriIds, setKategoriIds] = useState<string[]>([]);
  const [ktpFileName, setKtpFileName] = useState<string | null>(null);

  const [form, setForm] = useState({
    bio: "",
    alamat: "",
    region: { provinsi: "", kota: "", kecamatan: "", kelurahan: "" },
    domisili_lat: null as number | null,
    domisili_lng: null as number | null,
    radius_layanan_km: 5,
  });

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
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
                required
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

            <div>
              <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 mt-2">
                Bio Singkat & Pengalaman
              </Label>
              <Textarea
                id="bio"
                rows={3}
                placeholder="Ceritakan pengalaman Anda dalam mendampingi lansia..."
                value={form.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, bio: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="radius" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Radius Maksimal Jangkauan Layanan
              </Label>
              <div className="relative">
                <Input
                  id="radius"
                  type="number"
                  min={1}
                  max={25}
                  required
                  value={form.radius_layanan_km}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, radius_layanan_km: Number(e.target.value) })}
                  className="h-11 rounded-xl pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">KM</span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
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
              <div 
                onClick={() => ktpInputRef.current?.click()}
                className="relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors border-gray-300 bg-gray-50 hover:bg-[#F5F8FC] hover:border-[#0D47A1]/40 h-32 sm:h-40 group"
              >
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg"
                  ref={ktpInputRef} 
                  className="hidden" 
                  onChange={handleKtpUpload}
                />
                <div className="text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0D47A1] flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#0D47A1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  {ktpFileName ? (
                    <p className="text-sm font-semibold text-[#0D47A1]">{ktpFileName}</p>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-[#0D47A1]">Ketuk untuk unggah foto KTP</p>
                      <p className="text-xs text-gray-500 mt-1">Maksimal ukuran 5MB (JPG/PNG)</p>
                    </>
                  )}
                </div>
              </div>
              {fieldErrors.ktp_url && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.ktp_url[0]}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-95 shadow-sm mt-4"
            >
              {loading ? "Menyimpan Profil..." : "Kirim Verifikasi Profil"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}