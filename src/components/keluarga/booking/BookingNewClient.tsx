"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
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

type Mode = "langsung" | "pelamar" | "cepat";

export default function BookingNewClient({
  lansias,
  categories,
  allowsPelamar,
}: {
  lansias: BookingLansia[];
  categories: BookingCategory[];
  allowsPelamar: boolean;
}) {
  const router = useRouter();
  const availableModes: Mode[] = ["langsung", "cepat"];
  if (allowsPelamar) availableModes.splice(1, 0, "pelamar");

  const [mode, setMode] = useState<Mode>(availableModes[0] ?? "langsung");
  const [form, setForm] = useState({ lansia_id: "", service_category_id: "", jadwal_waktu: "", catatan: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const directCategories = categories.filter((c) => c.jarak_min_km == null && c.jarak_max_km == null);

  const submitDirect = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.lansia_id || !form.service_category_id) {
      setError("Pilih lansia dan kategori layanan terlebih dahulu.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, mode_penugasan: "langsung", jadwal_waktu: new Date(form.jadwal_waktu).toISOString() }),
      });
      const body = (await response.json().catch(() => null)) as { task?: { id: string }; message?: string } | null;
      if (!response.ok || !body?.task) throw new Error(body?.message || "Permintaan booking gagal dibuat");
      router.push(`/kunjungan/${body.task.id}`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Permintaan booking gagal dibuat");
      setSaving(false);
    }
  };

  const submitPelamar = async (event: React.FormEvent) => {
    event.preventDefault();
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

        {/* Custom Dropdown Metode Penugasan */}
        <CustomModeSelect
          value={mode as BookingMode}
          onChange={(newMode) => setMode(newMode)}
          availableModes={availableModes as BookingMode[]}
        />

        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        {mode === "cepat" ? (
          <QuickBookingForm lansiaList={lansias} categories={categories} />
        ) : (
          <form onSubmit={mode === "pelamar" ? submitPelamar : submitDirect} className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
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
              categories={directCategories}
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
            <Button type="submit" disabled={saving || !form.lansia_id || !form.service_category_id || !form.jadwal_waktu} className="w-full h-12 rounded-xl bg-[#0D47A1] hover:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buat permintaan pendampingan"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
