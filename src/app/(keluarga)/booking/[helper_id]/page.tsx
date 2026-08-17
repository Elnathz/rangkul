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
  tingkat?: 'ringan' | 'sedang' | 'berat';
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
    tambahan_waktu_menit: 0,
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
          .select("id, nama, harga_dasar, tingkat")
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
          <Button variant="outline" size="sm" asChild className="rounded-xl px-4 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
            <Link href="/cari-helper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
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
                  <optgroup label="Tingkat Ringan (Batas Waktu: ≤30 Menit)">
                    {categories.filter(c => c.tingkat === 'ringan' || !c.tingkat).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama} - Rp {c.harga_dasar.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tingkat Sedang (Batas Waktu: 31-60 Menit)">
                    {categories.filter(c => c.tingkat === 'sedang').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama} - Rp {c.harga_dasar.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tingkat Berat (Batas Waktu: ≥61 Menit)">
                    {categories.filter(c => c.tingkat === 'berat').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama} - Rp {c.harga_dasar.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="mt-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 space-y-1.5 shadow-sm">
                  <p className="font-bold flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    Informasi Batasan Waktu
                  </p>
                  <ul className="list-disc list-inside text-xs ml-1 space-y-0.5">
                    <li><strong>Ringan:</strong> Maksimal 30 Menit</li>
                    <li><strong>Sedang:</strong> 31 - 60 Menit</li>
                    <li><strong>Berat:</strong> Lebih dari 60 Menit</li>
                  </ul>
                  <p className="text-xs pt-1 opacity-90">Jika butuh waktu lebih lama, silakan gunakan form <strong>Tambahan Waktu</strong> di bawah (Rp 1.000 / Menit).</p>
                </div>
              </div>

              <div>
                <Label htmlFor="waktu_tambahan" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Tambahan Waktu (Rp 1.000 / Menit)
                </Label>
                <div className="relative">
                  <Input
                    id="waktu_tambahan"
                    type="number"
                    min="0"
                    value={form.tambahan_waktu_menit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, tambahan_waktu_menit: parseInt(e.target.value) || 0 })}
                    className="h-11 rounded-xl pl-4 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">Menit</span>
                </div>
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

              {form.service_category_id && (() => {
                const selectedCat = categories.find(c => c.id === form.service_category_id);
                const basePrice = selectedCat?.harga_dasar || 0;
                const extraTimePrice = (form.tambahan_waktu_menit || 0) * 1000;
                const serviceFee = 2500;
                const tax = Math.round((basePrice + extraTimePrice + serviceFee) * 0.11);
                const total = basePrice + extraTimePrice + serviceFee + tax;

                return (
                  <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 mt-6 space-y-4">
                    <p className="text-base font-bold text-foreground border-b border-primary/10 pb-3">Rincian Biaya</p>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Harga Dasar Layanan (Best Price)</span>
                        <span className="font-medium text-foreground">Rp {basePrice.toLocaleString("id-ID")}</span>
                      </div>
                      {extraTimePrice > 0 && (
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>Tambahan Waktu ({form.tambahan_waktu_menit} mnt)</span>
                          <span className="font-medium text-foreground">Rp {extraTimePrice.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Biaya Layanan Aplikasi</span>
                        <span className="font-medium text-foreground">Rp {serviceFee.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Pajak (11%)</span>
                        <span className="font-medium text-foreground">Rp {tax.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    <div className="border-t border-primary/20 pt-4 flex justify-between items-center mt-4">
                      <p className="text-base font-bold text-foreground">Total Pembayaran</p>
                      <p className="text-2xl font-black text-primary">Rp {total.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 text-xs mt-4">
                <strong>Perhatian:</strong> Tugas yang diajukan akan otomatis dibatalkan jika tidak diterima oleh Helper dalam waktu <strong>1 jam</strong>.
              </div>

              <Button
                type="submit"
                disabled={loading || lansiaList.length === 0}
                className="w-full h-12 bg-brand-gradient text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity mt-4"
              >
                {loading ? "Memproses..." : "Pesan Sekarang"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
