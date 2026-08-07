"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function KoordinatorPengajuanPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mocking API delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
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
        <h1 className="text-3xl font-display font-bold block bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
          Pengajuan Akses Koordinator
        </h1>
        <p className="text-slate-500 mt-2">
          Verifikasi status Anda sebagai pengurus RT atau RW aktif. Pastikan data wilayah yang Anda bina tertulis lengkap sesuai SK.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Jabatan & Wilayah */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Informasi Kepengurusan & Wilayah</h2>
          
          <div className="space-y-2 mb-4">
            <Label>Jabatan Kepengurusan</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 w-full">
                <input type="radio" name="tingkat" value="rt" defaultChecked className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium">Ketua / Pengurus RT</span>
              </label>
              <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 w-full">
                <input type="radio" name="tingkat" value="rw" className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium">Ketua / Pengurus RW</span>
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kecamatan / Kelurahan Domisili</Label>
              <Input required placeholder="Contoh: Kec. Antapani, Kel. Antapani Wetan" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wilayah Bina RT</Label>
                <Input required placeholder="001" maxLength={3} />
              </div>
              <div className="space-y-2">
                <Label>Wilayah Bina RW</Label>
                <Input required placeholder="005" maxLength={3} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alamat Lengkap Sekretariat / Rumah</Label>
            <Textarea required placeholder="Nama Jalan, Nomor Rumah, Patokan Sekretariat RT/RW" className="min-h-[80px]" />
          </div>
        </section>

        {/* Section 2: Upload Dokumen */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Dokumen Validasi SK</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3 bg-slate-50 hover:bg-indigo-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Upload KTP</p>
                <p className="text-xs text-slate-500">Maks. 2MB (JPG, PNG)</p>
              </div>
            </div>
            
            <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3 bg-slate-50 hover:bg-indigo-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                 <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">SK Jabatan / Bukti Kepengurusan</p>
                <p className="text-xs text-slate-500">Foto SK Kelurahan atau Sertifikat Resmi</p>
              </div>
            </div>
          </div>
        </section>

        <Button type="submit" disabled={loading} className="w-full my-4 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-md rounded-xl">
          {loading ? "Menyimpan Data Pengurus..." : "Kirim Pengajuan SK Koordinator"}
        </Button>
      </form>
    </div>
  );
}