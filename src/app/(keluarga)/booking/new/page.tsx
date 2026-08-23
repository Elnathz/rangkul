"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Lansia = { id: string; nama: string; alamat: string };
type Category = { id: string; nama: string; tingkat: string; harga_dasar: number; jarak_min_km: number | null; jarak_max_km: number | null };

export default function BookingNewPage() {
  const router = useRouter();
  const [lansias, setLansias] = useState<Lansia[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ lansia_id: "", service_category_id: "", jadwal_waktu: "", catatan: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/lansia"), fetch("/api/categories")]).then(async ([lansiaResponse, categoryResponse]) => {
      const lansiaBody = await lansiaResponse.json();
      const categoryBody = await categoryResponse.json();
      if (!lansiaResponse.ok || !categoryResponse.ok) throw new Error("Data booking tidak dapat dimuat");
      const nextLansias = (lansiaBody.profiles || []) as Lansia[];
      const nextCategories = (categoryBody.categories || []) as Category[];
      setLansias(nextLansias);
      setCategories(nextCategories);
      setForm((current) => ({ ...current, lansia_id: nextLansias[0]?.id || "", service_category_id: nextCategories[0]?.id || "" }));
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Data booking tidak dapat dimuat")).finally(() => setLoading(false));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, jadwal_waktu: new Date(form.jadwal_waktu).toISOString() }) });
      const body = await response.json().catch(() => null) as { task?: { id: string }; message?: string } | null;
      if (!response.ok || !body?.task) throw new Error(body?.message || "Permintaan booking gagal dibuat");
      router.push(`/kunjungan/${body.task.id}`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Permintaan booking gagal dibuat");
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Memuat pilihan booking...</div>;

  return <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 sm:px-6"><div className="mx-auto max-w-2xl space-y-6"><Link href="/cari-helper" className="inline-flex items-center gap-2 text-sm font-bold text-[#0D47A1]"><ChevronLeft className="h-4 w-4" />Cari Helper</Link><div><h1 className="text-3xl font-black text-slate-900">Buat permintaan pendampingan</h1><p className="mt-2 text-sm text-slate-600">Pilih lansia, kategori aktif, dan jadwal. Nominal akhir dihitung server.</p></div>{error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}<form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><label className="block text-sm font-bold text-slate-800">Lansia<select required value={form.lansia_id} onChange={(event) => setForm({ ...form, lansia_id: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal"><option value="">Pilih lansia</option>{lansias.map((item) => <option key={item.id} value={item.id}>{item.nama} · {item.alamat}</option>)}</select></label><label className="block text-sm font-bold text-slate-800">Kategori layanan<select required value={form.service_category_id} onChange={(event) => setForm({ ...form, service_category_id: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal"><option value="">Pilih kategori</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.nama} · {item.tingkat} · Rp {Number(item.harga_dasar).toLocaleString("id-ID")}</option>)}</select></label><label className="block text-sm font-bold text-slate-800">Jadwal<input required type="datetime-local" value={form.jadwal_waktu} onChange={(event) => setForm({ ...form, jadwal_waktu: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal" /></label><label className="block text-sm font-bold text-slate-800">Catatan keluarga<textarea value={form.catatan} onChange={(event) => setForm({ ...form, catatan: event.target.value })} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal" placeholder="Kebutuhan khusus lansia atau detail lokasi" /></label><p className="rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">Kategori berbasis jarak seperti Antar Obat wajib dibuat dari halaman Cari Helper agar Helper dan koordinat lansia dapat diverifikasi server.</p><Button type="submit" disabled={saving || !form.lansia_id || !form.service_category_id} className="w-full bg-[#0D47A1]">{saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buat permintaan"}</Button></form></div></main>;
}
