"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TambahLansiaPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mocking API delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-12 bg-white border border-teal-200 rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Profil Lansia Berhasil Ditambahkan!</h2>
        <p className="text-slate-500 mb-6">
          Kini Anda dapat langsung mencari Helper dan menjadwalkan kunjungan pertama untuk anggota keluarga Anda.
        </p>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/beranda">
            Kembali ke Beranda
          </Link>
        </Button>
        <Button asChild variant="outline" className="ml-3 border-teal-200 text-teal-700 hover:bg-teal-50">
          <Link href="/cari-helper">
            Cari Helper Sekarang
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 mb-20 bg-white rounded-2xl border border-slate-200 shadow-sm mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold block bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
          Tambah Profil Lansia
        </h1>
        <p className="text-slate-500 mt-2">
          Daftarkan anggota keluarga Anda agar Helper dapat memahami kondisi serta kebutuhan prioritas mereka sebelumnya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Data Diri */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Informasi Dasar</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Lengkap Lansia</Label>
              <Input required placeholder="Masukkan nama..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Umur (Tahun)</Label>
                <Input required type="number" placeholder="Contoh: 75" />
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <select required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Pilih</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hubungan Keluarga</Label>
            <Input required placeholder="Contoh: Ayah Kandung, Ibu Mertua" />
          </div>
        </section>

        {/* Section 2: Kondisi Medis & Catatan */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Kondisi Medis & Catatan Perawatan</h2>
          
          <div className="space-y-2">
            <Label>Riwayat Penyakit (Opsional)</Label>
            <Textarea placeholder="Contoh: Hipertensi, Diabetes, mudah lelah..." className="min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <Label>Catatan Khusus untuk Helper</Label>
            <Textarea required placeholder="Deskripsikan pantangan makanan, kepribadian, atau instruksi khusus saat merawat..." className="min-h-[100px]" />
          </div>
        </section>

        <Button type="submit" disabled={loading} className="w-full my-4 h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold text-md rounded-xl">
          {loading ? "Menyimpan Profil..." : "Simpan Profil Lansia"}
        </Button>
      </form>
    </div>
  );
}