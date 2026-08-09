"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationPicker from "@/components/ui/LocationPicker";
import RegionSelect from "@/components/ui/RegionSelect";

export default function KoordinatorPengajuanPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [tingkat, setTingkat] = useState("rt");
  const [rt, setRt] = useState("");
  const [rw, setRw] = useState("");
  
  const [region, setRegion] = useState({ provinsi: "", kota: "", kecamatan: "", kelurahan: "" });
  const [alamat, setAlamat] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [skFile, setSkFile] = useState<File | null>(null);
  
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (lat === null || lng === null) {
      setErrorMsg("Harap tentukan titik koordinat wilayah pembinaan pada peta sebelum mengajukan.");
      return;
    }
    if (!region.provinsi || !region.kota || !region.kecamatan || !region.kelurahan) {
      setErrorMsg("Harap melengkapi pilihan wilayah administrasi Provinsi hingga Kelurahan.");
      return;
    }
    if (!skFile) {
      setErrorMsg("Harap mengunggah SK Jabatan / Bukti Kepengurusan.");
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Upload files
      let uploadedSkUrl = "";
      let uploadedKtpUrl = null;

      const skFormData = new FormData();
      skFormData.append('file', skFile);
      skFormData.append('docType', 'dokumen_koordinator');
      
      const uploadSkRes = await fetch('/api/storage/upload', {
        method: 'POST',
        body: skFormData,
      });
      
      const uploadSkData = await uploadSkRes.json();
      if (!uploadSkRes.ok) {
        throw new Error(uploadSkData.message || 'Gagal mengunggah SK Jabatan.');
      }
      uploadedSkUrl = uploadSkData.data?.url || uploadSkData.url;

      if (ktpFile) {
        const ktpFormData = new FormData();
        ktpFormData.append('file', ktpFile);
        ktpFormData.append('docType', 'ktp');
        
        const uploadKtpRes = await fetch('/api/storage/upload', {
          method: 'POST',
          body: ktpFormData,
        });
        
        const uploadKtpData = await uploadKtpRes.json();
        if (!uploadKtpRes.ok) {
          throw new Error(uploadKtpData.message || 'Gagal mengunggah KTP.');
        }
        uploadedKtpUrl = uploadKtpData.data?.url || uploadKtpData.url;
      }

      // 2. Compose "wilayah" from inputs
      const wilayahString = `${region.kelurahan}, ${region.kecamatan}, ${region.kota}, ${region.provinsi} | RT ${rt}/RW ${rw} | ${alamat}`;
      
      // 3. Submit application
      const res = await fetch('/api/koordinator/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wilayah: wilayahString,
          tingkat: tingkat,
          dokumen_url: uploadedSkUrl,
          ...(uploadedKtpUrl ? { ktp_url: uploadedKtpUrl } : {})
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat mengajukan data.');
      }
      
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-12 bg-white border border-green-200 rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Berkas Jabatan Diajukan!</h2>
        <p className="text-slate-500 mb-6">
          Admin Rangkul akan memverifikasi SK Jabatan Anda dalam 1x24 jam kerja. Setelah aktif, Anda dapat mulai mengawasi dan menyetujui Helper di wilayah Anda.
        </p>
        <Button onClick={() => window.location.href = "/koordinator/dashboard"}>
          Kembali ke Dashboard Sementara
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 mb-20 bg-white rounded-2xl border border-slate-200 shadow-sm mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold block text-[#0D47A1]">
          Pengajuan Akses Koordinator
        </h1>
        <p className="text-slate-500 mt-2">
          Verifikasi status Anda sebagai pengurus RT atau RW aktif. Pastikan data wilayah yang Anda bina tertulis lengkap sesuai SK.
        </p>
      </div>
      
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Jabatan & Wilayah */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Informasi Kepengurusan & Wilayah</h2>
          
          <div className="space-y-2 mb-4">
            <Label>Jabatan Kepengurusan</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 w-full">
                <input 
                  type="radio" 
                  name="tingkat" 
                  value="rt" 
                  checked={tingkat === "rt"}
                  onChange={() => setTingkat("rt")}
                  className="w-4 h-4 text-[#0D47A1]" 
                />
                <span className="text-sm font-medium">Ketua / Pengurus RT</span>
              </label>
              <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 w-full">
                <input 
                  type="radio" 
                  name="tingkat" 
                  value="rw" 
                  checked={tingkat === "rw"}
                  onChange={() => setTingkat("rw")}
                  className="w-4 h-4 text-[#0D47A1]" 
                />
                <span className="text-sm font-medium">Ketua / Pengurus RW</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Wilayah Administrasi Utama <span className="text-red-500">*</span>
            </Label>
            <RegionSelect onRegionChange={(newRegion, coords) => {
              setRegion(newRegion);
              if (coords) {
                setLat(coords.lat);
                setLng(coords.lng);
                if (coords.address) setAlamat(coords.address);
              }
            }} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2 lg:col-span-2">
              <Label>Wilayah RT</Label>
              <Input type="number" min={1} max={999} required placeholder="Contoh: 1" value={rt} onChange={e => setRt(e.target.value)} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>Wilayah RW</Label>
              <Input type="number" min={1} max={999} required placeholder="Contoh: 5" value={rw} onChange={e => setRw(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alamat Lengkap Sekretariat / Rumah</Label>
            <Textarea 
              required 
              placeholder="Nama Jalan, Nomor Rumah, Patokan Sekretariat RT/RW" 
              className="min-h-[80px]"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Titik Koordinat Sekretariat / Pusat Area Bina <span className="text-red-500">*</span></span>
              {lat && lng && (
                <span className="text-[10px] text-green-600 font-mono bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
              )}
            </Label>
            <p className="text-xs text-slate-500 mb-2">Penanda wilayah akan digunakan sebagai jangkar (*anchor*) titik tengah penyebaran Helper binaan Anda.</p>
            <LocationPicker 
              position={lat && lng ? { lat, lng } : null}
              onPositionChange={(pos, targetAddress) => { 
                setLat(pos.lat); 
                setLng(pos.lng); 
                if (targetAddress) setAlamat(targetAddress);
              }}
            />
          </div>
        </section>

        {/* Section 2: Upload Dokumen */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Dokumen Validasi SK</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Label 
              htmlFor="ktp_upload"
              className="relative border border-dashed border-slate-300 rounded-xl p-6 text-center flex flex-col justify-center space-y-3 bg-slate-50 hover:bg-[#F5F8FC] hover:border-[#0D47A1]/40 transition-colors cursor-pointer group overflow-hidden"
            >
              <input type="file" accept="image/jpeg,image/png,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => e.target.files && setKtpFile(e.target.files[0])} />
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:bg-[#0D47A1] group-hover:text-white transition-colors relative z-10">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-700">{ktpFile ? ktpFile.name : 'Upload KTP (Opsional)'}</p>
                <p className="text-xs text-slate-500">Maks. 2MB (JPG, PNG)</p>
              </div>
            </Label>
            
            <Label 
              htmlFor="sk_upload"
              className="relative border border-dashed border-slate-300 rounded-xl flex flex-col justify-center p-6 text-center space-y-3 bg-slate-50 hover:bg-[#F5F8FC] hover:border-[#0D47A1]/40 transition-colors cursor-pointer group overflow-hidden"
            >
              <input type="file" accept="image/jpeg,image/png,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => e.target.files && setSkFile(e.target.files[0])} />
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:bg-[#0D47A1] group-hover:text-white transition-colors relative z-10">
                 <svg className={`w-5 h-5 ${skFile ? 'text-green-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {skFile ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                 </svg>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-700">{skFile ? skFile.name : 'SK Jabatan / Bukti Kepengurusan'} <span className="text-red-500">*</span></p>
                <p className="text-xs text-slate-500">Foto SK Kelurahan atau Sertifikat Resmi</p>
              </div>
            </Label>
          </div>
        </section>

        <Button type="submit" disabled={loading} className="w-full my-4 h-12 bg-brand-gradient shadow-md text-white font-bold text-md rounded-xl hover:opacity-90">
          {loading ? "Menyimpan Data Pengurus..." : "Kirim Pengajuan SK Koordinator"}
        </Button>
      </form>
    </div>
  );
}