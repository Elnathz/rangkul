"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomServiceTierSelect from "@/components/keluarga/booking/CustomServiceTierSelect";
import LansiaSelect from "@/components/keluarga/booking/LansiaSelect";

type LansiaOption = { id: string; nama: string };
type CategoryOption = {
  id: string;
  nama: string;
  tingkat?: string;
  harga_dasar: number;
  estimasi_durasi_menit: number;
  is_high_risk: boolean;
};

export default function QuickBookingForm({
  lansiaList,
  categories,
}: {
  lansiaList: LansiaOption[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [selectedLansia, setSelectedLansia] = useState(lansiaList[0]?.id || "");
  const [selectedCategory, setSelectedCategory] = useState(categories.find(c => !c.is_high_risk)?.id || "");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = categories.filter(c => !c.is_high_risk);
  const activeCategoryObj = categories.find(c => c.id === selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLansia || !selectedCategory) {
      setError("Pilih lansia dan kategori layanan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const jadwalWaktu = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

      const response = await fetch("/api/booking/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lansia_id: selectedLansia,
          service_category_id: selectedCategory,
          jadwal_waktu: jadwalWaktu,
          expires_at: expiresAt,
          mode_penugasan: "cepat",
          catatan: catatan || "Pemesanan Cari Cepat",
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Gagal membuat pemesanan Cari Cepat");
      }

      const taskId = payload.data?.id || payload.task?.id;
      router.push(`/kunjungan/${taskId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pemesanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900 border border-amber-100">
        <Zap className="h-6 w-6 text-amber-600 shrink-0" />
        <div className="text-xs">
          <p className="font-bold">Cari Cepat</p>
          <p className="mt-0.5 text-amber-700">
            Sistem akan mencarikan Helper Terpercaya dalam radius Anda dalam waktu 15 menit. Tanpa komitmen pembayaran jika Helper tidak ditemukan.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Select Lansia */}
      <LansiaSelect
        lansiaList={lansiaList}
        selectedId={selectedLansia}
        onSelect={(id) => setSelectedLansia(id)}
        label="Pilih Anggota Keluarga (Lansia)"
        required
        helperText="Pilih lansia yang membutuhkan pendampingan cepat."
      />

      {/* Select Category differentiated by Tingkatan */}
      <CustomServiceTierSelect
        categories={availableCategories}
        selectedId={selectedCategory}
        onSelect={(id) => setSelectedCategory(id)}
        label="Kategori Layanan untuk Cari Cepat"
        required
        allowHighRisk={false}
        helperText="Cari Cepat tersedia untuk layanan tingkat ringan dan sedang. Sistem mencari Helper yang memenuhi syarat selama 15 menit."
      />

      {/* Catatan */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Catatan Khusus (Opsional)</label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={3}
          placeholder="Instruksi khusus untuk Helper..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-900 focus:border-[#0D47A1] focus:outline-none"
        />
      </div>

      {/* Details summary */}
      {activeCategoryObj && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Estimasi Durasi:</span>
            <span className="font-bold text-slate-900">{activeCategoryObj.estimasi_durasi_menit} menit</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Harga Dasar:</span>
            <span className="font-bold text-[#0D47A1]">Rp {activeCategoryObj.harga_dasar.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Batas Waktu Pencarian:</span>
            <span className="font-bold text-amber-600 flex items-center gap-1">
              <Clock className="h-3 w-3" /> 15 Menit
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !selectedLansia || !selectedCategory}
        className="h-13 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-white shadow-md hover:from-amber-600 hover:to-amber-700"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Mencarikan Helper...</>
        ) : (
          <><Zap className="mr-2 h-5 w-5" /> Cari Helper Sekarang</>
        )}
      </Button>
    </form>
  );
}
