"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TambahLansiaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    catatan_kondisi: "",
    dokumen_identitas_lansia_url: "",
    dokumen_hubungan_keluarga_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/lansia/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setErrorMsg(data.message || "Gagal menyimpan data lansia.");
        setLoading(false);
        return;
      }

      router.push("/beranda");
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
            <Link href="/beranda">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Tambah Profil Lansia</h1>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nama" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Nama Lengkap Lansia *
              </Label>
              <Input
                id="nama"
                required
                placeholder="Contoh: Opa Haryono"
                value={form.nama}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, nama: e.target.value })}
                className="h-11 rounded-xl"
              />
              {fieldErrors.nama && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.nama[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="alamat" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Alamat Lengkap Tempat Tinggal *
              </Label>
              <Textarea
                id="alamat"
                required
                rows={3}
                placeholder="Jl. Merdeka No. 12, RT 02 / RW 05, Bandung"
                value={form.alamat}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, alamat: e.target.value })}
                className="rounded-xl"
              />
              {fieldErrors.alamat && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.alamat[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="catatan_kondisi" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Catatan Kondisi Kesehatan / Khusus
              </Label>
              <Textarea
                id="catatan_kondisi"
                rows={2}
                placeholder="Contoh: Butuh bantuan berjalan, riwayat hipertensi ringan."
                value={form.catatan_kondisi}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, catatan_kondisi: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="dokumen_identitas" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                URL Dokumen Identitas Lansia (Opsional)
              </Label>
              <Input
                id="dokumen_identitas"
                type="url"
                placeholder="https://..."
                value={form.dokumen_identitas_lansia_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, dokumen_identitas_lansia_url: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-95 shadow-sm mt-2"
            >
              {loading ? "Menyimpan..." : "Simpan Profil Lansia"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}