"use client";

// impeccable-disable gray-on-color -- badges and text live in separate nested surfaces.

import * as React from "react";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

import { ApprovalTaskCard, type ApprovalQueueTask } from "@/components/koordinator/ApprovalTaskCard";
import KoordinatorStatusGuard from "@/components/koordinator/KoordinatorStatusGuard";
import { createClient } from "@/lib/supabase/client";

type KoordinatorProfile = {
  id: string;
  wilayah: string;
  status: string;
};

export default function AntreanPersetujuanPage() {
  const [tasks, setTasks] = React.useState<ApprovalQueueTask[]>([]);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [koordinator, setKoordinator] = React.useState<KoordinatorProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const loadQueue = React.useCallback(async () => {
    const supabase = createClient();
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sesi Anda sudah berakhir. Silakan login kembali.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("koordinator_profiles")
      .select("id, wilayah, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      setError("Status Koordinator belum dapat dimuat.");
      setLoading(false);
      return;
    }

    setKoordinator(profile);

    if (!profile || profile.status !== "verified") {
      setTasks([]);
      setLoading(false);
      return;
    }

    const { data: taskRows, error: taskError } = await supabase
      .from("tasks")
      .select(`
        id,
        status,
        helper_id,
        jadwal_waktu,
        harga_final,
        catatan,
        lansia_profiles!inner ( nama, alamat, catatan_kondisi, foto_url ),
        service_categories!inner ( nama, tingkat, is_high_risk ),
        helper_profiles!inner ( tingkat_kepercayaan, total_tugas_selesai, rating_avg, wilayah_domisili, bio, foto_wajah_url, verified_by_admin_fallback, users!inner ( full_name ) )
      `)
      .eq("status", "menunggu_persetujuan_koordinator")
      .order("jadwal_waktu", { ascending: true });

    if (taskError) {
      setError("Antrean tugas belum dapat dimuat. Periksa migration RLS Koordinator.");
      setLoading(false);
      return;
    }

    setTasks((taskRows || []) as unknown as ApprovalQueueTask[]);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadQueue();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadQueue]);

  async function approveTask(taskId: string) {
    setProcessingId(taskId);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}/koordinator-approve`, { method: "PATCH" });
      const payload = await response.json() as { message?: string };

      if (!response.ok) {
        setError(payload.message || "Tugas belum dapat disetujui.");
        if (response.status === 409) void loadQueue();
        return;
      }

      setTasks((current) => current.filter((task) => task.id !== taskId));
      setNotice(payload.message || "Tugas berhasil disetujui.");
    } catch {
      setError("Koneksi bermasalah. Status tugas belum dapat dipastikan.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm font-semibold text-slate-500"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Memuat antrean tugas...</div>;
  }

  return (
    <KoordinatorStatusGuard koordinator={koordinator}>
      <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">Koordinator wilayah</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Antrean Persetujuan Tugas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Review detail Helper, lansia, jadwal, dan lokasi sebelum tugas yang membutuhkan approval eksplisit diaktifkan.</p>
          </div>

          {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><div className="flex-1"><p className="font-bold">Antrean belum siap</p><p className="mt-1">{error}</p></div><button type="button" onClick={() => { setLoading(true); void loadQueue(); }} className="rounded-lg px-3 py-2 font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700">Coba lagi</button></div>}
          {notice && <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><p className="font-semibold">{notice}</p></div>}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></div>
              <div><h2 className="text-lg font-bold text-slate-950">{tasks.length} tugas menunggu</h2><p className="mt-1 text-sm text-slate-500">Approval eksplisit hanya muncul untuk kondisi yang membutuhkan penilaian Koordinator.</p></div>
            </div>

            {tasks.length === 0 ? (
              <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm"><CheckCircle2 className="h-7 w-7" aria-hidden="true" /></div><h3 className="mt-4 text-base font-bold text-slate-900">Semua aman</h3><p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">Belum ada task nyata yang menunggu persetujuan di wilayahmu.</p></div>
            ) : (
              <div className="mt-5 space-y-5">
                {tasks.map((task) => <ApprovalTaskCard key={task.id} task={task} isProcessing={processingId === task.id} onApprove={(taskId) => void approveTask(taskId)} />)}
              </div>
            )}
          </section>
        </div>
      </main>
    </KoordinatorStatusGuard>
  );
}
