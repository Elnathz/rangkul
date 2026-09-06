"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickBookingForm from "@/components/keluarga/booking/QuickBookingForm";
import CustomModeSelect, { type BookingMode } from "@/components/keluarga/booking/CustomModeSelect";
import CustomServiceTierSelect from "@/components/keluarga/booking/CustomServiceTierSelect";
import LansiaSelect from "@/components/keluarga/booking/LansiaSelect";
import DateTimePicker from "@/components/keluarga/booking/DateTimePicker";

export type BookingLansia = { id: string; nama: string; alamat: string };
export type BookingCategory = {
  id: string;
  nama: string;
  tingkat: string;
  harga_dasar: number;
  estimasi_durasi_menit: number;
  is_high_risk: boolean;
  jarak_min_km: number | null;
  jarak_max_km: number | null;
};

type Mode = "pelamar" | "cepat";

export default function BookingNewClient({
  lansias,
  categories,
  initialMode = "pelamar",
}: {
  lansias: BookingLansia[];
  categories: BookingCategory[];
  initialMode?: Mode;
}) {
  const router = useRouter();
  const availableModes: Mode[] = ["pelamar", "cepat"];

  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({ lansia_id: "", service_category_id: "", jadwal_waktu: "", catatan: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPelamar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!availableModes.includes("pelamar")) return;
    if (!form.lansia_id || !form.service_category_id) {
      setError("Pilih lansia dan kategori layanan terlebih dahulu.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/booking/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jadwal_waktu: new Date(form.jadwal_waktu).toISOString(),
          mode_penugasan: "pelamar",
          catatan: form.catatan || "Pilih dari Pelamar",
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || "Permintaan booking gagal dibuat");
      const taskId = body?.task?.id || body?.data?.id || body?.id;
      if (!taskId) throw new Error("ID tugas tidak ditemukan pada respons");
      router.push(`/kunjungan/${taskId}`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Permintaan booking gagal dibuat");
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/cari-helper" className="inline-flex items-center gap-2 text-sm font-bold text-[#0D47A1]">
          <ChevronLeft className="h-4 w-4" /> Cari Helper
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Buat permintaan pendampingan</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">Pilih lansia tersayang, kategori layanan per tingkatan, dan mode penugasan.</p>
        </div>

        {/* Banner Opsi Booking Biasa (Pilih Helper Langsung) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0D47A1] text-white">
              <UserCheck className="size-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Ingin memilih Helper tertentu secara langsung?</p>
              <p className="text-[11px] text-slate-500">Pilih profil Helper favorit langsung dari katalog untuk booking terjadwal.</p>
            </div>
          </div>
          <Link
            href="/cari-helper"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0D47A1] shadow-2xs transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]"
          >
            Pilih dari Katalog Helper
          </Link>
        </div>

        {/* Custom Dropdown Metode Penugasan */}
        <CustomModeSelect
          value={mode}
          onChange={(newMode: BookingMode) => {
            if (newMode !== "langsung") setMode(newMode);
          }}
          availableModes={availableModes}
        />

        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        {mode === "cepat" ? (
          <QuickBookingForm lansiaList={lansias} categories={categories} />
        ) : (
          <form onSubmit={submitPelamar} className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            {/* Lansia Selection */}
            <LansiaSelect
              lansiaList={lansias}
              selectedId={form.lansia_id}
              onSelect={(id) => setForm({ ...form, lansia_id: id })}
              label="Pilih Lansia"
              required
              helperText="Pilih anggota keluarga lansia yang akan menerima pendampingan."
            />

            {/* Kategori Layanan dibedakan per tingkatan */}
            <CustomServiceTierSelect
              categories={categories}
              selectedId={form.service_category_id}
              onSelect={(id) => setForm({ ...form, service_category_id: id })}
              label="Kategori Layanan"
              required
              allowHighRisk={true}
              helperText="Layanan dikelompokkan berdasarkan tingkatan durasi dan kebutuhan pendampingan."
            />

            {/* Custom DateTimePicker */}
            <DateTimePicker
              value={form.jadwal_waktu}
              onChange={(newVal) => setForm({ ...form, jadwal_waktu: newVal })}
              label="Jadwal Kunjungan"
              required
              helperText="Tentukan tanggal dan waktu Helper tiba di lokasi lansia."
            />

            <label className="block text-sm font-bold text-slate-800">
              Catatan keluarga
              <textarea value={form.catatan} onChange={(event) => setForm({ ...form, catatan: event.target.value })} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal" placeholder="Kebutuhan khusus lansia atau detail lokasi" />
            </label>
            <Button type="submit" disabled={saving || !form.lansia_id || !form.service_category_id || !form.jadwal_waktu} className="w-full h-12 rounded-xl bg-[#0D47A1] hover:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all min-h-[44px]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buka permintaan untuk pelamar"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
