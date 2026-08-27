import Link from "next/link";
import { Calendar, Clock3, MapPin, ReceiptText } from "lucide-react";
import { redirect } from "next/navigation";

import { RegionAddress } from "@/components/ui/RegionAddress";
import { TaskStatusBadge } from "@/components/ui/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/lib/constants/task-status";

type Relation<T> = T | T[] | null;
type TaskRow = {
  id: string;
  status: TaskStatus;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  lansia_profiles: Relation<{ nama: string; alamat: string; rt: number | null; rw: number | null; kelurahan: string | null; kecamatan: string | null; kabupaten_kota: string | null; provinsi: string | null; foto_url: string | null }>;
  service_categories: Relation<{ nama: string; estimasi_durasi_menit: number }>;
  helper_profiles: Relation<{ foto_wajah_url: string | null; users: Relation<{ full_name: string }> }>;
};

function relation<T>(value: Relation<T>) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default async function KunjunganPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("tasks")
    .select("id, status, jadwal_waktu, harga_dasar, harga_final, lansia_profiles!inner ( nama, alamat, rt, rw, kelurahan, kecamatan, kabupaten_kota, provinsi, foto_url ), service_categories!inner ( nama, estimasi_durasi_menit ), helper_profiles ( foto_wajah_url, users ( full_name ) )")
    .eq("keluarga_id", user.id)
    .order("jadwal_waktu", { ascending: false });

  const tasks = (error ? [] : (data ?? [])) as unknown as TaskRow[];
  const upcoming = tasks.filter((task) => ["diajukan", "menunggu_persetujuan_koordinator", "dikonfirmasi", "dikerjakan", "menunggu_persetujuan_keluarga"].includes(task.status));
  const history = tasks.filter((task) => ["selesai", "dibatalkan"].includes(task.status));

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">Perjalanan pendampingan</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Daftar kunjungan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Pantau status, jadwal, biaya, dan laporan kunjungan lansia dari satu tempat.</p>
          </div>
          <Button asChild className="rounded-xl bg-[#0D47A1] font-bold hover:bg-blue-800"><Link href="/cari-helper">Pesan Helper</Link></Button>
        </header>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">Mendatang dan aktif</p><p className="mt-1 text-2xl font-black text-blue-950">{upcoming.length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Riwayat</p><p className="mt-1 text-2xl font-black text-slate-950">{history.length}</p></div>
        </section>

        <section className="space-y-4" aria-label="Kunjungan mendatang dan aktif">
          <div className="flex items-center justify-between"><h2 className="text-lg font-black text-slate-950">Mendatang dan aktif</h2><span className="text-sm font-semibold text-slate-500">{upcoming.length} tugas</span></div>
          {upcoming.length === 0 ? <EmptyState /> : upcoming.map((task) => <TaskCard key={task.id} task={task} />)}
        </section>

        <section className="space-y-4" aria-label="Riwayat kunjungan">
          <div className="flex items-center justify-between"><h2 className="text-lg font-black text-slate-950">Riwayat kunjungan</h2><span className="text-sm font-semibold text-slate-500">{history.length} tugas</span></div>
          {history.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Belum ada kunjungan yang selesai atau dibatalkan.</p> : history.map((task) => <TaskCard key={task.id} task={task} />)}
        </section>
      </div>
    </main>
  );
}

function EmptyState() {
  return <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center"><ReceiptText className="mx-auto h-9 w-9 text-blue-300" /><p className="mt-3 font-bold text-slate-900">Belum ada kunjungan aktif</p><p className="mt-1 text-sm text-slate-500">Pesan Helper untuk memulai pendampingan.</p><Button asChild variant="outline" className="mt-5 rounded-xl"><Link href="/cari-helper">Cari Helper</Link></Button></div>;
}

function TaskCard({ task }: { task: TaskRow }) {
  const lansia = relation(task.lansia_profiles);
  const category = relation(task.service_categories);
  const helper = relation(task.helper_profiles);
  const helperUsers = helper ? relation(helper.users) : null;
  if (!lansia || !category) return null;

  return (
    <Card className="overflow-hidden border-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">ID {task.id.slice(0, 8)}</span><TaskStatusBadge status={task.status} /></div><h3 className="mt-2 text-xl font-black text-slate-950">{category.nama}</h3><p className="mt-1 text-sm text-slate-600">Untuk {lansia.nama}</p></div>
          <div className="shrink-0 rounded-xl bg-emerald-50 px-4 py-3 sm:text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Total pembayaran</p><p className="mt-1 text-lg font-black text-emerald-800">Rp {Number(task.harga_final || task.harga_dasar).toLocaleString("id-ID")}</p></div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"><div className="flex gap-3"><Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#0D47A1]" /><div><p className="text-xs font-bold uppercase tracking-wider text-blue-900">Jadwal</p><p className="mt-1 text-sm font-bold text-blue-950">{formatDate(task.jadwal_waktu)}</p><p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0D47A1]"><Clock3 className="h-3.5 w-3.5" />{category.estimasi_durasi_menit} menit</p></div></div></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#0D47A1]" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-slate-700">Lokasi lansia</p><RegionAddress value={lansia.alamat} compact /></div></div></div>
        </div>
         <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-sm font-black text-[#0D47A1]">{helper?.foto_wajah_url ? <img src={helper.foto_wajah_url} alt="" className="h-full w-full object-cover" /> : helperUsers?.full_name?.slice(0, 1) || "H"}</div><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-slate-700">Helper</p><p className="truncate text-sm font-bold text-slate-950">{helperUsers?.full_name || "Belum ditugaskan"}</p></div></div>
      </CardContent>
      <CardFooter className="justify-end border-t border-slate-100 bg-slate-50 px-5 py-4"><Button asChild className="rounded-xl bg-[#0D47A1] font-bold hover:bg-blue-800"><Link href={`/kunjungan/${task.id}`}>Lihat detail</Link></Button></CardFooter>
    </Card>
  );
}
