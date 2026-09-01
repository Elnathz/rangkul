"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Zap, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickBookingForm from "@/components/keluarga/booking/QuickBookingForm";

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
          mode_penugasan: "pelamar",
          catatan: form.catatan || "Pilih dari Pelamar",
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || "Permintaan booking gagal dibuat");
      const taskId = body?.data?.id || body?.task?.id;
      router.push(`/kunjungan/${taskId}`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Permintaan booking gagal dibuat");
      setSaving(false);
    }
  };

  const modeMeta: Record<Mode, { label: string; short: string; icon: typeof Calendar; active: string; idle: string }> = {
    langsung: {
      label: "Booking Biasa",
      short: "langsung",
      icon: Calendar,
      active: "bg-white text-slate-900 shadow-sm",
      idle: "text-slate-600 hover:text-slate-900",
    },
    pelamar: {
      label: "Pilih dari Pelamar",
      short: "pelamar",
      icon: Users,
      active: "bg-white text-violet-900 shadow-sm",
      idle: "text-slate-600 hover:text-slate-900",
    },
    cepat: {
      label: "Cari Cepat (15 Menit)",
      short: "cepat",
      icon: Zap,
      active: "bg-white text-amber-900 shadow-sm",
      idle: "text-slate-600 hover:text-slate-900",
    },
  };

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/cari-helper" className="inline-flex items-center gap-2 text-sm font-bold text-[#0D47A1]">
          <ChevronLeft className="h-4 w-4" /> Cari Helper
        </Link>

        <div>
          <h1 className="text-3xl font-black text-slate-900">Buat permintaan pendampingan</h1>
          <p className="mt-2 text-sm text-slate-600">Pilih lansia, kategori aktif, dan mode penugasan.</p>
        </div>

        <div className="grid gap-3 rounded-2xl bg-slate-200/60 p-1.5 sm:grid-cols-3">
          {availableModes.map((m) => {
            const meta = modeMeta[m];
            const Icon = meta.icon;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
                  mode === m ? meta.active : meta.idle
                }`}
              >
                <Icon className="h-4 w-4 text-[#0D47A1]" /> {meta.label}
              </button>
            );
          })}
        </div>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

        {mode === "cepat" ? (
          <QuickBookingForm lansiaList={lansias} categories={categories} />
        ) : (
          <form onSubmit={mode === "pelamar" ? submitPelamar : submitDirect} className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <label className="block text-sm font-bold text-slate-800">
              Lansia
              <select required value={form.lansia_id} onChange={(event) => setForm({ ...form, lansia_id: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal">
                <option value="">Pilih lansia</option>
                {lansias.map((item) => (
                  <option key={item.id} value={item.id}>{item.nama} · {item.alamat}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-800">
              Kategori layanan
              <select required value={form.service_category_id} onChange={(event) => setForm({ ...form, service_category_id: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal">
                <option value="">Pilih kategori</option>
                {directCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} · {item.tingkat} · Rp {Number(item.harga_dasar).toLocaleString("id-ID")}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-800">
              Jadwal
              <input required type="datetime-local" value={form.jadwal_waktu} onChange={(event) => setForm({ ...form, jadwal_waktu: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal" />
            </label>
            <label className="block text-sm font-bold text-slate-800">
              Catatan keluarga
              <textarea value={form.catatan} onChange={(event) => setForm({ ...form, catatan: event.target.value })} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal" placeholder="Kebutuhan khusus lansia atau detail lokasi" />
            </label>
            <Button type="submit" disabled={saving || !form.lansia_id || !form.service_category_id} className="w-full bg-[#0D47A1]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buat permintaan"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
