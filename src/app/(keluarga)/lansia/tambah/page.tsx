"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Image as ImageIcon, UploadCloud } from "lucide-react";
import LocationPicker from "@/components/ui/LocationPicker";
import RegionSelect from "@/components/ui/RegionSelect";
import { AlertCircle } from "lucide-react";

export default function TambahLansiaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const identitasInputRef = useRef<HTMLInputElement>(null);
  const hubunganInputRef = useRef<HTMLInputElement>(null);
  
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const [identitasFileName, setIdentitasFileName] = useState<string | null>(null);
  const [hubunganFileName, setHubunganFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  
  // Local state for photo preview mock
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Core form fields
  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    catatan_kondisi: "",
    hubungan_keluarga: "", // Main dropdown selection
    hubungan_keluarga_lainnya: "", // Custom typed text if "Lainnya" chosen
    region: { provinsi: "", kota: "", kecamatan: "", kelurahan: "" },
    rt: "",
    rw: "",
    lat: null as number | null,
    lng: null as number | null,
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentitasUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setIdentitasFileName(file.name);
  };

  const handleHubunganUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setHubunganFileName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);
    setFieldErrors({});

    const finalHubungan = form.hubungan_keluarga === "Lainnya" 
      ? form.hubungan_keluarga_lainnya 
      : form.hubungan_keluarga;

    if (!photoPreview) {
      showToast("Harap unggah foto lansia terlebih dahulu.");
      setFieldErrors({ foto: ["Foto lansia wajib diunggah"] });
      setLoading(false);
      return;
    }

    if (!finalHubungan) {
      setFieldErrors({ hubungan_keluarga: ["Harap pilih atau isi hubungan keluarga."] });
      setLoading(false);
      return;
    }

    if (!form.region.provinsi || !form.region.kota || !form.region.kecamatan || !form.region.kelurahan || !form.rt || !form.rw) {
      showToast("Harap melengkapi pilihan wilayah administrasi (termasuk RT/RW).");
      setLoading(false);
      return;
    }

    if (form.lat === null || form.lng === null) {
      showToast("Harap tentukan titik koordinat domisili di peta.");
      setLoading(false);
      return;
    }

    try {
      let fotoUrl = null;
      let identitasUrl = null;
      let hubunganUrl = null;
      
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", "foto_lansia");
        
        const uploadRes = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          showToast(uploadData.message || "Gagal mengunggah foto lansia.");
          setLoading(false);
          return;
        }
        fotoUrl = uploadData.data?.url || uploadData.url;
      }

      const identitasFile = identitasInputRef.current?.files?.[0];
      if (identitasFile) {
        const formData = new FormData();
        formData.append("file", identitasFile);
        formData.append("docType", "identitas_lansia");
        
        const uploadRes = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          showToast(uploadData.message || "Gagal mengunggah dokumen identitas lansia.");
          setLoading(false);
          return;
        }
        identitasUrl = uploadData.data?.url || uploadData.url;
      }

      const hubunganFile = hubunganInputRef.current?.files?.[0];
      if (hubunganFile) {
        const formData = new FormData();
        formData.append("file", hubunganFile);
        formData.append("docType", "hubungan_keluarga");
        
        const uploadRes = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          showToast(uploadData.message || "Gagal mengunggah dokumen hubungan keluarga.");
          setLoading(false);
          return;
        }
        hubunganUrl = uploadData.data?.url || uploadData.url;
      }

      // Data to send to API
      const payload = {
        nama: form.nama,
        alamat: form.alamat,
        catatan_kondisi: form.catatan_kondisi,
        lat: form.lat,
        lng: form.lng,
        foto_url: fotoUrl,
        hubungan_keluarga: finalHubungan,
        provinsi: form.region.provinsi,
        kabupaten_kota: form.region.kota,
        kecamatan: form.region.kecamatan,
        kelurahan: form.region.kelurahan,
        rt: parseInt(form.rt, 10),
        rw: parseInt(form.rw, 10),
        ...(identitasUrl ? { dokumen_identitas_lansia_url: identitasUrl } : {}),
        ...(hubunganUrl ? { dokumen_hubungan_keluarga_url: hubunganUrl } : {}),
      };

      const res = await fetch("/api/lansia/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        showToast(data.message || "Gagal menyimpan data lansia.");
        setLoading(false);
        return;
      }

      router.push("/beranda");
    } catch {
      showToast("Terjadi kesalahan koneksi jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 relative">
      {/* Toast Notification */}
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link href="/beranda">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Tambah Profil Lansia</h1>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 sm:p-7 shadow-sm space-y-6">

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field: Foto Lansia (Photo Upload Feature) */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Foto Lansia <span className="text-red-500">*</span>
              </Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors ${photoPreview ? 'border-[#0D47A1]/40 bg-[#F5F8FC]' : 'border-gray-300 bg-gray-50 hover:bg-[#F5F8FC] hover:border-[#0D47A1]/40'} h-32 sm:h-40 group`}
              >
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg"
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        showToast("Ukuran foto lansia tidak boleh lebih dari 5MB", "error");
                        setFieldErrors(prev => ({...prev, foto: ["File terlalu besar (Maksimal 5MB)"]}));
                        e.target.value = '';
                        setPhotoPreview(null);
                        return;
                      }
                      setFieldErrors(prev => ({...prev, foto: []}));
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPhotoPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {photoPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Preview Foto" className="w-full h-full object-cover transition-opacity group-hover:opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/60 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Ganti Foto
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0D47A1] flex items-center justify-center mx-auto mb-2">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-[#0D47A1]">Ketuk untuk unggah foto</p>
                    <p className="text-xs text-gray-500 mt-1">Maksimal ukuran 5MB (JPG/PNG)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Field: Nama */}
              <div>
                <Label htmlFor="nama" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Nama Lengkap Lansia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama"
                  required
                  placeholder="Bapak Haryono"
                  value={form.nama}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, nama: e.target.value })}
                  className="h-11 rounded-xl border-border focus-visible:border-[#0D47A1] focus-visible:ring-[#0D47A1]/20"
                />
                {fieldErrors.nama && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.nama[0]}</p>
                )}
              </div>

              {/* Field: Hubungan Keluarga Dropdown */}
              <div>
                <Label htmlFor="hubungan" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Hubungan Keluarga <span className="text-red-500">*</span>
                </Label>
                <select
                  id="hubungan"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0D47A1]/50 focus-visible:border-[#0D47A1] disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.hubungan_keluarga}
                  onChange={(e) => setForm({ ...form, hubungan_keluarga: e.target.value })}
                >
                  <option value="" disabled>-- Pilih hubungan --</option>
                  <option value="Ayah">Ayah</option>
                  <option value="Ibu">Ibu</option>
                  <option value="Kakek">Kakek</option>
                  <option value="Nenek">Nenek</option>
                  <option value="Mertua">Mertua</option>
                  <option value="Paman/Bibi">Paman / Bibi</option>
                  <option value="Lainnya">Lainnya (Isi Sendiri)</option>
                </select>
                {fieldErrors.hubungan_keluarga && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.hubungan_keluarga[0]}</p>
                )}
              </div>
            </div>

            {/* Field: Hubungan Keluarga Custom (Only if 'Lainnya' selected) */}
            {form.hubungan_keluarga === "Lainnya" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="hubungan_lainnya" className="text-xs font-bold uppercase tracking-wider text-[#0D47A1] block mb-1.5">
                  Spesifikkan Hubungan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hubungan_lainnya"
                  required
                  placeholder="Contoh: Om, Kakak, Sepupu"
                  value={form.hubungan_keluarga_lainnya}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, hubungan_keluarga_lainnya: e.target.value })}
                  className="h-11 rounded-xl border-border focus-visible:border-[#0D47A1] focus-visible:ring-[#0D47A1]/20 bg-[#F5F8FC]"
                />
              </div>
            )}
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
                      lat: coords.lat, 
                      lng: coords.lng,
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
                placeholder="Jl. Sudirman No. 12, Kel. Sukamaju, RT 02 / RW 05"
                value={form.alamat}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, alamat: e.target.value })}
                className="rounded-xl border-border focus-visible:border-[#0D47A1]"
              />
              {fieldErrors.alamat && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.alamat[0]}</p>
              )}
            </div>

            {/* Field: Peta Koordinat (Leaflet) */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 flex items-center justify-between">
                <span>Titik Koordinat Domisili <span className="text-red-500">*</span></span>
                {form.lat && form.lng && (
                  <span className="text-[10px] text-green-600 font-mono bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                  </span>
                )}
              </Label>
              <p className="text-xs text-slate-500 mb-3">Ketuk area peta untuk menjatuhkan pin lokasi radius lansia. Navigasi peta digunakan untuk algoritma jarak pencarian Helper.</p>
              <LocationPicker 
                position={form.lat && form.lng ? { lat: form.lat, lng: form.lng } : null}
                onPositionChange={(pos, targetAddress) => {
                   setForm(f => ({ ...f, lat: pos.lat, lng: pos.lng, ...(targetAddress ? { alamat: targetAddress } : {}) }));
                }}
              />
            </div>

            {/* Field: Catatan Kondisi */}
            <div>
              <Label htmlFor="catatan_kondisi" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Catatan Kondisi Kesehatan / Khusus
              </Label>
              <Textarea
                id="catatan_kondisi"
                rows={3}
                placeholder="Contoh: Menggunakan kursi roda, memiliki riwayat hipertensi ringan, dan pendengaran sedikit berkurang."
                value={form.catatan_kondisi}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, catatan_kondisi: e.target.value })}
                className="rounded-xl border-border focus-visible:border-[#0D47A1]"
              />
            </div>

            {/* Field: Dokumen Validasi */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Dokumen Validasi (Opsional / Jika Diminta Koordinator)
              </Label>
              <div className="grid sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => identitasInputRef.current?.click()}
                  className="border border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-[#F5F8FC] transition-colors"
                >
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,application/pdf"
                    ref={identitasInputRef} 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          showToast("Ukuran KTP/Identitas tidak boleh lebih dari 5MB", "error");
                          setFieldErrors(prev => ({...prev, identitas: ["File terlalu besar (Maksimal 5MB)"]}));
                          e.target.value = '';
                          setIdentitasFileName(null);
                          return;
                        }
                        setFieldErrors(prev => ({...prev, identitas: []}));
                        setIdentitasFileName(file.name);
                      }
                    }}
                  />
                  <div className="mx-auto w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                    <svg className={`w-4 h-4 ${identitasFileName ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 truncate px-2">{identitasFileName || "KTP/Identitas Lansia"}</p>
                </div>
                
                <div 
                  onClick={() => hubunganInputRef.current?.click()}
                  className="border border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-[#F5F8FC] transition-colors"
                >
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,application/pdf"
                    ref={hubunganInputRef} 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          showToast("Ukuran Dokumen Hubungan tidak boleh lebih dari 5MB", "error");
                          setFieldErrors(prev => ({...prev, hubungan: ["File terlalu besar (Maksimal 5MB)"]}));
                          e.target.value = '';
                          setHubunganFileName(null);
                          return;
                        }
                        setFieldErrors(prev => ({...prev, hubungan: []}));
                        setHubunganFileName(file.name);
                      }
                    }}
                  />
                  <div className="mx-auto w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                    <svg className={`w-4 h-4 ${hubunganFileName ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 truncate px-2">{hubunganFileName || "Bukti Hubungan Keluarga"}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                {loading ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Simpan Profil Lansia
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}