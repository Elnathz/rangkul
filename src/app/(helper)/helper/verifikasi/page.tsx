"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function HelperVerifikasiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    bio: "",
    wilayah_domisili: "",
    domisili_lat: -6.9175,
    domisili_lng: 107.6191,
    radius_layanan_km: 5,
    ktp_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/helper/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
              <Label htmlFor="wilayah" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Wilayah Domisili *
              </Label>
              <Input
                id="wilayah"
                required
                placeholder="Contoh: Kecamatan Lengkong, Bandung"
                value={form.wilayah_domisili}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, wilayah_domisili: e.target.value })}
                className="h-11 rounded-xl"
              />
              {fieldErrors.wilayah_domisili && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.wilayah_domisili[0]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
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
                Radius Maksimal Jangkauan Layanan (KM)
              </Label>
              <Input
                id="radius"
                type="number"
                min={1}
                max={25}
                required
                value={form.radius_layanan_km}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, radius_layanan_km: Number(e.target.value) })}
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="ktp_url" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                URL Foto KTP / Dokumen Identitas *
              </Label>
              <Input
                id="ktp_url"
                type="url"
                required
                placeholder="https://..."
                value={form.ktp_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, ktp_url: e.target.value })}
                className="h-11 rounded-xl"
              />
              {fieldErrors.ktp_url && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.ktp_url[0]}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-95 shadow-sm mt-2"
            >
              {loading ? "Menyimpan Profil..." : "Kirim Verifikasi Profil"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}