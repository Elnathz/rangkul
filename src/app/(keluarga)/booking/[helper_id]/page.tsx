"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface Lansia {
  id: string;
  nama: string;
}

interface ServiceCategory {
  id: string;
  nama: string;
  harga_dasar: number;
}

export default function BookingPage() {
  const router = useRouter();


  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    lansia_id: "",
    service_category_id: "",
    jadwal_waktu: "",
    catatan: "",
  });

  useEffect(() => {
    const supabase = createClient();
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: lansiaData } = await supabase
            .from("lansia_profiles")
            .select("id, nama")
            .eq("keluarga_id", user.id);
          if (lansiaData) setLansiaList(lansiaData);
        }

        const { data: catData } = await supabase
          .from("service_categories")
          .select("id, nama, harga_dasar")
          .eq("is_active", true);
        if (catData) setCategories(catData);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/booking/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jadwal_waktu: new Date(form.jadwal_waktu).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Gagal membuat pemesanan task.");
        setLoading(false);
        return;
      }

      router.push("/kunjungan");
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link href="/cari-helper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pesan Pendampingan Helper</h1>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {fetching ? (
            <p className="text-sm text-muted-foreground text-center py-6">Memuat data lansia dan layanan...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="lansia" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Pilih Lansia yang Didampingi *
                </Label>
                {lansiaList.length === 0 ? (
                  <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    Belum ada profil lansia. Silakan{" "}
                    <Link href="/lansia/tambah" className="underline font-bold">
                      tambah profil lansia
                    </Link>{" "}
                    terlebih dahulu.
                  </div>
                ) : (
                  <select
                    id="lansia"
                    required
                    value={form.lansia_id}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, lansia_id: e.target.value })}
                    className="w-full h-11 px-3 bg-white border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Pilih Lansia --</option>
                    {lansiaList.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nama}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Kategori Layanan *
                </Label>
                <select
                  id="category"
                  required
                  value={form.service_category_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, service_category_id: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Pilih Kategori Layanan --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama} (Rp {c.harga_dasar.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="jadwal" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Jadwal Waktu Kunjungan *
                </Label>
                <Input
                  id="jadwal"
                  type="datetime-local"
                  required
                  value={form.jadwal_waktu}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, jadwal_waktu: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="catatan" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Catatan Tambahan untuk Helper
                </Label>
                <Textarea
                  id="catatan"
                  rows={3}
                  placeholder="Contoh: Tolong dampingi minum obat pukul 10:00 pagi."
                  value={form.catatan}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, catatan: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || lansiaList.length === 0}
                className="w-full h-11 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-95 shadow-sm mt-2"
              >
                {loading ? "Memproses Pemesanan..." : "Ajukan Pemesanan Task"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
