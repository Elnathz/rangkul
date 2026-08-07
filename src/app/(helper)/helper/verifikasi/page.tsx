"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function HelperVerifikasiPage() {
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
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Berkas Berhasil Diajukan!</h2>
        <p className="text-slate-500 mb-6">
          Koordinator RT/RW Anda akan segera memverifikasi data ini. Pengawasan langsung ini dilakukan untuk mencegah adanya calo dan memastikan identitas Helper valid.
        </p>
        <Button onClick={() => window.location.href = "/helper/dashboard"}>
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 mb-20 bg-white rounded-2xl border border-slate-200 shadow-sm mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold block bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
          Verifikasi Data Helper
        </h1>
        <p className="text-slate-500 mt-2">
          Lengkapi data alamat dan dokumen pendukung sesuai e-KTP. Nantinya 1 Helper terverifikasi di RT domisilinya dapat mengambil tugas lintas wilayah!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Alamat Lengkap */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Informasi Alamat Lengkap</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kecamatan / Kelurahan</Label>
              <Input required placeholder="Contoh: Kec. Antapani, Kel. Antapani Wetan" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RT</Label>
                <Input required placeholder="001" maxLength={3} />
              </div>
              <div className="space-y-2">
                <Label>RW</Label>
                <Input required placeholder="005" maxLength={3} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alamat Lengkap</Label>
            <Textarea required placeholder="Nama Jalan, Nomor Rumah, Patokan (Contoh: Dekat Masjid Kuning)" className="min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <Label>Radius Pelayanan (km)</Label>
            <Input required type="number" min={1} max={15} defaultValue={5} className="md:max-w-[200px]" />
            <p className="text-xs text-slate-500">Maksimal jarak antar tugas yang bersedia Anda layani.</p>
          </div>
        </section>

        {/* Section 2: Layanan & Bio */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Kapasitas & Layanan</h2>
          
          <div className="space-y-2">
            <Label>Kategori Layanan Utama</Label>
            <select required className="flex h-10 w-full md:max-w-md items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="">-- Pilih Layanan Utama Anda --</option>
              <option value="kunjungan">Layanan Kunjungan & Teman Ngobrol</option>
              <option value="kesehatan">Kontrol Kesehatan Ringan</option>
              <option value="darurat">Bantuan Kedaruratan</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Biografi Singkat (Bio)</Label>
            <Textarea required placeholder="Ceritakan pengalaman Anda merawat lansia atau alasan ingin menjadi Helper." className="min-h-[100px]" />
          </div>
        </section>

        {/* Section 3: Upload Dokumen */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Dokumen Validasi</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3 bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Upload KTP</p>
                <p className="text-xs text-slate-500">Maks. 2MB (JPG, PNG)</p>
              </div>
            </div>
            
            <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3 bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                 <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Surat Pengantar RT (Opsional)</p>
                <p className="text-xs text-slate-500">Jika domisili beda dengan KTP</p>
              </div>
            </div>
          </div>
        </section>

        <Button type="submit" disabled={loading} className="w-full my-4 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-md rounded-xl">
          {loading ? "Menyimpan Data..." : "Kirim Pengajuan Verifikasi"}
        </Button>
      </form>
    </div>
  );
}