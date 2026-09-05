"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Edit3, Plus, Search, ShieldAlert, Trash2, UserRound, X } from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import { AdminLoadingRows, AdminModal, AdminStatusBadge } from "@/components/admin/AdminPrimitives";
import { createAdminUserSchema, updateAdminUserSchema } from "@/lib/validations/admin-users";

type Role = "all" | "keluarga" | "helper" | "koordinator" | "admin";
type User = { id: string; email: string; phone: string | null; full_name: string; username: string; role: Exclude<Role, "all">; account_status: "active" | "restricted" | "suspended"; rt: number | null; rw: number | null; kelurahan: string | null; kecamatan: string | null; kabupaten_kota: string | null; provinsi: string | null; created_at: string };
type UserForm = { email: string; password: string; full_name: string; username: string; phone: string; role: "keluarga" | "helper" | "koordinator"; account_status: "active" | "restricted" | "suspended"; rt: string; rw: string; kelurahan: string; kecamatan: string; kabupaten_kota: string; provinsi: string };

const emptyForm: UserForm = { email: "", password: "", full_name: "", username: "", phone: "", role: "keluarga", account_status: "active", rt: "", rw: "", kelurahan: "", kecamatan: "", kabupaten_kota: "", provinsi: "" };
const roleTabs: Array<{ value: Role; label: string }> = [{ value: "all", label: "Semua" }, { value: "keluarga", label: "Keluarga" }, { value: "helper", label: "Helper" }, { value: "koordinator", label: "Koordinator" }, { value: "admin", label: "Admin" }];

function StatusSelectPopover({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", handlePointer);
    return () => window.removeEventListener("pointerdown", handlePointer);
  }, [open]);

  const options = [
    { value: "all", label: "Semua status" },
    { value: "active", label: "Aktif" },
    { value: "restricted", label: "Dibatasi" },
    { value: "suspended", label: "Ditangguhkan" },
  ];

  const currentOption = options.find((opt) => opt.value === value) ?? options[0];

  return (
    <div ref={containerRef} className="relative w-full sm:w-[180px]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 active:scale-95 transition-all"
      >
        <span className="truncate">{currentOption.label}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-full min-w-[180px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all active:scale-95 ${
                  isSelected ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<Role>("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const editSnapshot = useRef<string | null>(null);
  const pageSize = 20;

  const loadUsers = async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (role !== "all") params.set("role", role);
    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("q", search.trim());
    try {
      const response = await fetch(`/api/admin/users?${params}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Pengguna gagal dimuat");
      setUsers(payload.data ?? []); setTotal(payload.total ?? 0);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Pengguna gagal dimuat"); } finally { setLoading(false); }
  };

  useEffect(() => { const timer = window.setTimeout(() => { void loadUsers(); }, 0); return () => window.clearTimeout(timer); }, [role, status, search, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setSelected(null); setForm(emptyForm); editSnapshot.current = null; setModal("create"); setError(""); };
  const openEdit = (user: User) => { setSelected(user); const nextForm = { ...emptyForm, email: user.email, full_name: user.full_name, username: user.username, phone: user.phone?.replace(/^\+62/, "0") ?? "", account_status: user.account_status, rt: user.rt?.toString() ?? "", rw: user.rw?.toString() ?? "", kelurahan: user.kelurahan ?? "", kecamatan: user.kecamatan ?? "", kabupaten_kota: user.kabupaten_kota ?? "", provinsi: user.provinsi ?? "" }; setForm(nextForm); editSnapshot.current = JSON.stringify({ full_name: nextForm.full_name, username: nextForm.username, phone: nextForm.phone || null, account_status: nextForm.account_status, rt: Number(nextForm.rt) || null, rw: Number(nextForm.rw) || null, kelurahan: nextForm.kelurahan || null, kecamatan: nextForm.kecamatan || null, kabupaten_kota: nextForm.kabupaten_kota || null, provinsi: nextForm.provinsi || null }); setModal("edit"); setError(""); };
  const changeField = (field: keyof UserForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const isCreate = modal === "create";
    const body = isCreate ? { email: form.email, password: form.password, full_name: form.full_name, username: form.username, phone: form.phone || undefined, role: form.role } : { full_name: form.full_name, username: form.username, phone: form.phone || null, account_status: form.account_status, rt: form.rt ? Number(form.rt) : null, rw: form.rw ? Number(form.rw) : null, kelurahan: form.kelurahan || null, kecamatan: form.kecamatan || null, kabupaten_kota: form.kabupaten_kota || null, provinsi: form.provinsi || null };
    const validation = isCreate ? createAdminUserSchema.safeParse(body) : updateAdminUserSchema.safeParse(body);
    if (!validation.success) { setError(validation.error.issues[0]?.message ?? "Data pengguna tidak valid"); setSaving(false); return; }
    if (!isCreate && editSnapshot.current === JSON.stringify(body)) { setNotice("Tidak ada perubahan."); setModal(null); setSaving(false); return; }
    try {
      const response = await fetch(isCreate ? "/api/admin/users" : `/api/admin/users/${selected?.id}`, { method: isCreate ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Perubahan gagal disimpan");
      setModal(null); setNotice(isCreate ? "Akun berhasil dibuat." : "Data pengguna berhasil diperbarui."); await loadUsers();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Perubahan gagal disimpan"); } finally { setSaving(false); }
  };

  const deleteUser = async (user: User) => {
    if (!window.confirm(`Hapus akun ${user.full_name}? Data Auth dan profil publiknya ikut dihapus.`)) return;
    setError(""); setNotice("");
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) { setError(payload.message ?? "Akun gagal dihapus"); return; }
    setNotice("Akun berhasil dihapus."); await loadUsers();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Direktori akses</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Pengguna</h1><p className="mt-1 text-sm leading-6 text-slate-500">Kelola akun, status akses, dan alamat dasar tanpa mengubah role atau email akun yang sudah ada.</p></div><button type="button" onClick={openCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white shadow-xs transition hover:bg-blue-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"><Plus className="h-4 w-4" /> Tambah pengguna</button></header>

      {notice ? <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><Check className="h-4 w-4" />{notice}<button type="button" onClick={() => setNotice("")} className="ml-auto" aria-label="Tutup notifikasi"><X className="h-4 w-4" /></button></div> : null}
      {error ? <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"><ShieldAlert className="h-4 w-4" />{error}<button type="button" onClick={() => setError("")} className="ml-auto" aria-label="Tutup error"><X className="h-4 w-4" /></button></div> : null}

      <section className="space-y-3 rounded-2xl border border-blue-100 bg-white/75 p-3 shadow-xs backdrop-blur-sm sm:p-4">
        <LayoutGroup id="admin-user-roles">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter role pengguna">
            {roleTabs.map((tab) => {
              const active = role === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setRole(tab.value);
                    setPage(1);
                  }}
                  className={`relative min-h-11 shrink-0 rounded-xl px-4 text-sm font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                    active ? "text-white shadow-xs" : "text-slate-600 hover:bg-blue-50/70 hover:text-blue-800"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="active-role-tab"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-blue-700"
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <span className="sr-only">Cari pengguna</span>
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Cari nama, username, atau email"
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
            />
          </label>
          <StatusSelectPopover
            value={status}
            onChange={(nextStatus) => {
              setStatus(nextStatus);
              setPage(1);
            }}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6"><p className="text-sm font-semibold text-slate-600">{total.toLocaleString("id-ID")} pengguna ditemukan</p><p className="text-xs text-slate-400">Halaman {page}</p></div>{loading ? <AdminLoadingRows columns={5} /> : users.length === 0 ? <EmptyState onCreate={openCreate} /> : <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3 font-bold">Pengguna</th><th className="px-6 py-3 font-bold">Role</th><th className="px-6 py-3 font-bold">Kontak</th><th className="px-6 py-3 font-bold">Status</th><th className="px-6 py-3 text-right font-bold">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id} className="transition hover:bg-slate-50/80"><td className="px-6 py-4"><p className="font-semibold text-slate-950">{user.full_name}</p><p className="mt-1 text-xs text-slate-500">@{user.username}</p></td><td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-700">{user.role}</span></td><td className="px-6 py-4"><p className="max-w-[220px] truncate text-slate-700">{user.email}</p><p className="mt-1 text-xs text-slate-500">{user.phone ?? "Tanpa nomor"}</p></td><td className="px-6 py-4"><AdminStatusBadge status={user.account_status} /></td><td className="px-6 py-4"><Actions user={user} onEdit={openEdit} onDelete={deleteUser} /></td></tr>)}</tbody></table></div><div className="divide-y divide-slate-100 md:hidden">{users.map((user) => <article key={user.id} className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><UserRound className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate font-semibold text-slate-950">{user.full_name}</p><p className="truncate text-xs text-slate-500">@{user.username}</p></div></div><AdminStatusBadge status={user.account_status} /></div><div className="grid grid-cols-2 gap-2 text-xs text-slate-500"><span className="capitalize">Role: <b className="text-slate-800">{user.role}</b></span><span className="truncate">{user.phone ?? "Tanpa nomor"}</span></div><Actions user={user} onEdit={openEdit} onDelete={deleteUser} /></article>)}</div></>}</section>
      <div className="flex justify-end gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-40">Sebelumnya</button><button type="button" disabled={page * pageSize >= total || loading} onClick={() => setPage((current) => current + 1)} className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-40">Berikutnya</button></div>

      {modal ? <AdminModal title={modal === "create" ? "Tambah pengguna" : "Edit pengguna"} description={modal === "create" ? "Akun dibuat melalui Supabase Auth dan langsung dikonfirmasi untuk kebutuhan operasional Admin." : "Role dan email dikunci agar perubahan identitas tidak melewati kontrol akun."} onClose={() => setModal(null)}><form onSubmit={saveUser} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Nama lengkap" value={form.full_name} onChange={(value) => changeField("full_name", value)} required /><Field label="Username" value={form.username} onChange={(value) => changeField("username", value)} required /><Field label="Email" type="email" value={form.email} onChange={(value) => changeField("email", value)} required disabled={modal === "edit"} /><Field label="Nomor WhatsApp" value={form.phone} onChange={(value) => changeField("phone", value)} placeholder="08xxxxxxxxxx" /></div>{modal === "create" ? <div className="grid gap-4 sm:grid-cols-2"><Field label="Password awal" type="password" value={form.password} onChange={(value) => changeField("password", value)} required /><SelectField label="Role" value={form.role} onChange={(value) => changeField("role", value)} options={["keluarga", "helper", "koordinator"]} /></div> : <SelectField label="Status akun" value={form.account_status} onChange={(value) => changeField("account_status", value)} options={["active", "restricted", "suspended"]} />}{modal === "edit" ? <div className="grid gap-4 sm:grid-cols-2"><Field label="RT" type="number" value={form.rt} onChange={(value) => changeField("rt", value)} /><Field label="RW" type="number" value={form.rw} onChange={(value) => changeField("rw", value)} /><Field label="Kelurahan" value={form.kelurahan} onChange={(value) => changeField("kelurahan", value)} /><Field label="Kecamatan" value={form.kecamatan} onChange={(value) => changeField("kecamatan", value)} /><Field label="Kabupaten/Kota" value={form.kabupaten_kota} onChange={(value) => changeField("kabupaten_kota", value)} /><Field label="Provinsi" value={form.provinsi} onChange={(value) => changeField("provinsi", value)} /></div> : null}<div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={() => setModal(null)} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Batal</button><button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan perubahan"}</button></div></form></AdminModal> : null}
    </div>
  );
}

function Actions({ user, onEdit, onDelete }: { user: User; onEdit: (user: User) => void; onDelete: (user: User) => void }) { return <div className="flex gap-2"><button type="button" onClick={() => onEdit(user)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-800"><Edit3 className="h-3.5 w-3.5" /> Edit</button><button type="button" onClick={() => onDelete(user)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Hapus</button></div>; }
function Field({ label, value, onChange, type = "text", placeholder, required, disabled }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean; disabled?: boolean }) { return <label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} disabled={disabled} className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100 disabled:text-slate-400" /></label>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm capitalize outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function EmptyState({ onCreate }: { onCreate: () => void }) { return <div className="px-4 py-14 text-center"><UserRound className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-semibold text-slate-800">Tidak ada pengguna pada filter ini.</p><button type="button" onClick={onCreate} className="mt-4 min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white">Tambah pengguna</button></div>; }
