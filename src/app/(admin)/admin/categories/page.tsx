"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, Edit3, FolderTree, Plus, Trash2, X } from "lucide-react";
import { AdminLoadingRows, AdminModal, formatRupiah } from "@/components/admin/AdminPrimitives";
import { serviceCategorySchema } from "@/lib/validations/admin";
import { sortServiceCategoriesHierarchy } from "@/lib/service-category-tree";

type Category = { id: string; nama: string; deskripsi: string; estimasi_durasi_menit: number; harga_dasar: number; is_high_risk: boolean; is_active: boolean; tingkat: "ringan" | "sedang" | "berat"; parent_id: string | null; jarak_min_km: number | null; jarak_max_km: number | null };
type CategoryForm = { nama: string; deskripsi: string; estimasi_durasi_menit: string; harga_dasar: string; is_high_risk: boolean; is_active: boolean; tingkat: Category["tingkat"]; parent_id: string; jarak_min_km: string; jarak_max_km: string };
type CategoryFilter = "semua" | Category["tingkat"];

const emptyForm: CategoryForm = { nama: "", deskripsi: "", estimasi_durasi_menit: "30", harga_dasar: "", is_high_risk: false, is_active: true, tingkat: "ringan", parent_id: "", jarak_min_km: "", jarak_max_km: "" };
const filterTabs: { value: CategoryFilter; label: string }[] = [{ value: "semua", label: "Semua" }, { value: "ringan", label: "Ringan" }, { value: "sedang", label: "Sedang" }, { value: "berat", label: "Berat" }];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterTingkat, setFilterTingkat] = useState<CategoryFilter>("semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const editSnapshot = useRef<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/service-categories", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Kategori gagal dimuat");
      setCategories(payload.data ?? []);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Kategori gagal dimuat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadCategories(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredCategories = filterTingkat === "semua" ? categories : categories.filter((category) => category.tingkat === filterTingkat);
  const parentIds = new Set(categories.flatMap((category) => category.parent_id ? [category.parent_id] : []));
  const visibleIds = new Set(filteredCategories.map((category) => category.id));
  for (const category of filteredCategories) if (category.parent_id) visibleIds.add(category.parent_id);
  const visibleCategories = sortServiceCategoriesHierarchy(categories.filter((category) => visibleIds.has(category.id)));
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const openCreate = () => { setSelected(null); setForm(emptyForm); editSnapshot.current = null; setModal("create"); setError(""); };
  const openEdit = (category: Category) => { setSelected(category); const nextForm = { nama: category.nama, deskripsi: category.deskripsi, estimasi_durasi_menit: String(category.estimasi_durasi_menit), harga_dasar: String(category.harga_dasar), is_high_risk: category.is_high_risk, is_active: category.is_active, tingkat: category.tingkat, parent_id: category.parent_id ?? "", jarak_min_km: category.jarak_min_km?.toString() ?? "", jarak_max_km: category.jarak_max_km?.toString() ?? "" }; setForm(nextForm); editSnapshot.current = JSON.stringify({ nama: nextForm.nama, deskripsi: nextForm.deskripsi, estimasi_durasi_menit: Number(nextForm.estimasi_durasi_menit), harga_dasar: Number(nextForm.harga_dasar), is_high_risk: nextForm.is_high_risk, is_active: nextForm.is_active, tingkat: nextForm.tingkat, parent_id: nextForm.parent_id || null, jarak_min_km: nextForm.jarak_min_km ? Number(nextForm.jarak_min_km) : null, jarak_max_km: nextForm.jarak_max_km ? Number(nextForm.jarak_max_km) : null }); setModal("edit"); setError(""); };
  const setField = (field: keyof CategoryForm, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const body = { nama: form.nama, deskripsi: form.deskripsi, estimasi_durasi_menit: Number(form.estimasi_durasi_menit), harga_dasar: Number(form.harga_dasar), is_high_risk: form.is_high_risk, is_active: form.is_active, tingkat: form.tingkat, parent_id: form.parent_id || null, jarak_min_km: form.jarak_min_km ? Number(form.jarak_min_km) : null, jarak_max_km: form.jarak_max_km ? Number(form.jarak_max_km) : null };
    const validation = serviceCategorySchema.safeParse(body);
    if (!validation.success) { setError(validation.error.issues[0]?.message ?? "Data kategori tidak valid"); setSaving(false); return; }
    if (modal === "edit" && editSnapshot.current === JSON.stringify(body)) { setNotice("Tidak ada perubahan."); setModal(null); setSaving(false); return; }
    try {
      const response = await fetch(modal === "create" ? "/api/admin/service-categories" : `/api/admin/service-categories/${selected?.id}`, { method: modal === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Kategori gagal disimpan");
      setModal(null);
      setNotice(modal === "create" ? "Kategori berhasil ditambahkan." : "Kategori berhasil diperbarui.");
      await loadCategories();
    } catch (value) { setError(value instanceof Error ? value.message : "Kategori gagal disimpan"); } finally { setSaving(false); }
  };

  const remove = async (category: Category) => {
    if (!window.confirm(`Nonaktifkan kategori ${category.nama}?`)) return;
    const response = await fetch(`/api/admin/service-categories/${category.id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) { setError(payload.message ?? "Kategori gagal dinonaktifkan"); return; }
    setNotice("Kategori dinonaktifkan.");
    await loadCategories();
  };

  return <div className="mx-auto max-w-7xl space-y-5">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Catalog governance</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Kategori layanan</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Atur harga dasar, tingkat layanan, radius, dan penanda risiko yang dipakai saat booking.</p></div><button type="button" onClick={openCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800"><Plus className="h-4 w-4" /> Tambah kategori</button></header>
    {notice ? <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><Check className="h-4 w-4" />{notice}<button type="button" onClick={() => setNotice("")} className="ml-auto" aria-label="Tutup notifikasi"><X className="h-4 w-4" /></button></div> : null}
    {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div> : null}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3 sm:px-6"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-slate-700">{filteredCategories.length} dari {categories.length} kategori tercatat</p><p className="text-xs text-slate-500">{filterTingkat === "semua" ? "Semua tingkat layanan" : `Tingkat ${filterTingkat}`}</p></div><div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter tingkat layanan">{filterTabs.map((tab) => { const count = tab.value === "semua" ? categories.length : categories.filter((category) => category.tingkat === tab.value).length; const active = filterTingkat === tab.value; return <button key={tab.value} type="button" role="tab" aria-selected={active} onClick={() => setFilterTingkat(tab.value)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${active ? "bg-blue-700 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-800"}`}>{tab.label}<span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span></button>; })}</div></div>
      {loading ? <AdminLoadingRows columns={5} /> : visibleCategories.length === 0 ? <div className="px-4 py-14 text-center"><FolderTree className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-semibold text-slate-800">Belum ada kategori pada tingkat ini.</p><p className="mt-1 text-sm text-slate-500">Pilih tabs lain untuk melihat kategori yang tersedia.</p></div> : <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3 font-bold">Kategori</th><th className="px-6 py-3 font-bold">Harga dasar</th><th className="px-6 py-3 font-bold">Durasi / level</th><th className="px-6 py-3 font-bold">Status</th><th className="px-6 py-3 text-right font-bold">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleCategories.map((category) => <tr key={category.id} className="hover:bg-slate-50/80"><td className="px-6 py-4"><CategoryIdentity category={category} parentName={category.parent_id ? categoryById.get(category.parent_id)?.nama ?? null : null} isParent={parentIds.has(category.id)} /></td><td className="px-6 py-4 font-semibold tabular-nums text-slate-800">{parentIds.has(category.id) ? "Kelompok" : formatRupiah(category.harga_dasar)}</td><td className="px-6 py-4">{parentIds.has(category.id) ? <p className="text-xs text-slate-500">Lihat subkategori</p> : <><p className="text-slate-700">{category.estimasi_durasi_menit} menit</p><p className="mt-1 text-xs capitalize text-slate-500">Tingkat {category.tingkat}</p></>}</td><td className="px-6 py-4"><div className="flex flex-wrap gap-1.5">{parentIds.has(category.id) ? <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">Parent, tidak dipilih</span> : category.is_active ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Aktif</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">Nonaktif</span>}{category.is_high_risk ? <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">Risiko tinggi</span> : null}</div></td><td className="px-6 py-4"><CategoryActions category={category} onEdit={openEdit} onDelete={remove} /></td></tr>)}</tbody></table></div><div className="divide-y divide-slate-100 md:hidden">{visibleCategories.map((category) => <article key={category.id} className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><CategoryIdentity category={category} parentName={category.parent_id ? categoryById.get(category.parent_id)?.nama ?? null : null} isParent={parentIds.has(category.id)} />{category.is_high_risk ? <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">Risiko tinggi</span> : null}</div><div className="grid grid-cols-2 gap-2 text-xs text-slate-500"><span>Harga <b className="text-slate-800">{parentIds.has(category.id) ? "Kelompok" : formatRupiah(category.harga_dasar)}</b></span><span>Durasi <b className="text-slate-800">{parentIds.has(category.id) ? "Subkategori" : `${category.estimasi_durasi_menit} menit`}</b></span></div><CategoryActions category={category} onEdit={openEdit} onDelete={remove} /></article>)}</div></>}</section>
    {modal ? <AdminModal title={modal === "create" ? "Tambah kategori" : "Edit kategori"} description="Perubahan kategori memengaruhi harga dan pilihan layanan pada booking baru." onClose={() => setModal(null)}><form onSubmit={save} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Nama kategori" value={form.nama} onChange={(value) => setField("nama", value)} required /><Field label="Durasi (menit)" type="number" value={form.estimasi_durasi_menit} onChange={(value) => setField("estimasi_durasi_menit", value)} required /><Field label="Harga dasar" type="number" value={form.harga_dasar} onChange={(value) => setField("harga_dasar", value)} required /><label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700">Tingkat layanan</span><select value={form.tingkat} onChange={(event) => setField("tingkat", event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm capitalize"><option value="ringan">Ringan</option><option value="sedang">Sedang</option><option value="berat">Berat</option></select></label></div><label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700">Deskripsi</span><textarea value={form.deskripsi} onChange={(event) => setField("deskripsi", event.target.value)} required minLength={10} rows={4} className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" /></label><div className="grid gap-4 sm:grid-cols-3"><Field label="Jarak minimum (km)" type="number" value={form.jarak_min_km} onChange={(value) => setField("jarak_min_km", value)} /><Field label="Jarak maksimum (km)" type="number" value={form.jarak_max_km} onChange={(value) => setField("jarak_max_km", value)} /><label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700">Parent</span><select value={form.parent_id} onChange={(event) => setField("parent_id", event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="">Kategori utama</option>{categories.filter((category) => category.id !== selected?.id).map((category) => <option key={category.id} value={category.id}>{category.nama}</option>)}</select></label></div><div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4"><p className="text-sm font-semibold text-amber-950">Risiko layanan</p><p className="mt-1 text-xs leading-5 text-amber-900/80">Aktifkan jika kategori wajib mendapat persetujuan Koordinator sebelum Helper menjalankannya.</p><div className="mt-3"><CheckField label="Risiko tinggi, wajib approval Koordinator" checked={form.is_high_risk} onChange={(value) => setField("is_high_risk", value)} /></div></div><div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={() => setModal(null)} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold">Batal</button><button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan kategori"}</button></div></form></AdminModal> : null}
  </div>;
}

function CategoryActions({ category, onEdit, onDelete }: { category: Category; onEdit: (category: Category) => void; onDelete: (category: Category) => void }) { return <div className="flex gap-2"><button type="button" onClick={() => onEdit(category)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-800"><Edit3 className="h-3.5 w-3.5" /> Edit</button>{category.is_active ? <button type="button" onClick={() => onDelete(category)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Nonaktifkan</button> : null}</div>; }
function CategoryIdentity({ category, parentName, isParent }: { category: Category; parentName: string | null; isParent: boolean }) { return <div className={category.parent_id ? "border-l-2 border-blue-100 pl-3" : ""}><div className="flex items-center gap-2"><p className="font-semibold text-slate-950">{category.nama}</p>{isParent ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">Parent</span> : null}</div>{isParent ? <p className="mt-1 text-xs text-slate-500">Kelompok layanan, tidak dipilih langsung.</p> : parentName ? <p className="mt-1 text-xs text-slate-500">Subkategori dari {parentName}</p> : null}<p className="mt-1 max-w-sm truncate text-xs text-slate-500">{category.deskripsi}</p></div>; }
function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" /></label>; }
function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600" />{label}</label>; }
