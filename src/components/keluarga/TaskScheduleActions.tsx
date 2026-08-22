"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FeedbackDialog } from "@/components/ui/FeedbackDialog";
import type { TaskStatus } from "@/lib/constants/task-status";

type Props = { taskId: string; status: TaskStatus; jadwalWaktu: string };

function toLocalInput(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function TaskScheduleActions({ taskId, status, jadwalWaktu }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [nextSchedule, setNextSchedule] = React.useState(toLocalInput(jadwalWaktu));
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ title: string; description: string; tone: "success" | "danger" } | null>(null);

  if (!["diajukan", "menunggu_persetujuan_koordinator", "dikonfirmasi"].includes(status)) return null;

  const submitReschedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/reschedule`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jadwal_waktu: new Date(nextSchedule).toISOString() }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Jadwal belum dapat diubah");
      setFeedback({ title: "Jadwal diperbarui", description: "Perubahan jadwal sudah tersimpan di task ini.", tone: "success" });
      router.refresh();
    } catch (error: unknown) {
      setFeedback({ title: "Jadwal belum berubah", description: error instanceof Error ? error.message : "Coba lagi beberapa saat.", tone: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const cancelTask = async () => {
    if (reason.trim().length < 10) {
      setFeedback({ title: "Alasan belum lengkap", description: "Tulis alasan pembatalan minimal 10 karakter.", tone: "danger" });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cancellation_reason: reason }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Tugas belum dapat dibatalkan");
      setCancelOpen(false);
      setFeedback({ title: "Tugas dibatalkan", description: "Tugas ini sudah dipindahkan ke riwayat kunjungan.", tone: "success" });
      router.refresh();
    } catch (error: unknown) {
      setFeedback({ title: "Tugas belum dibatalkan", description: error instanceof Error ? error.message : "Coba lagi beberapa saat.", tone: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const reveal = reduceMotion ? { initial: false, animate: {} } : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
  const canReschedule = status === "diajukan" || status === "dikonfirmasi";
  return (
    <>
      <motion.section {...reveal} transition={{ duration: 0.25, ease: "easeOut" }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3"><CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-[#0D47A1]" /><div><h2 className="text-base font-black text-slate-950">Atur jadwal dan pembatalan</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Reschedule maksimal dua kali. Sistem akan menerapkan batas minimal tiga jam atau dua jam sesuai waktu booking.</p></div></div>
        {canReschedule && <form onSubmit={submitReschedule} className="mt-4 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600" htmlFor="jadwal-baru">Jadwal baru</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id="jadwal-baru" type="datetime-local" value={nextSchedule} onChange={(event) => setNextSchedule(event.target.value)} className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" required />
            <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0D47A1] px-4 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan jadwal
            </button>
          </div>
        </form>}
        {!canReschedule && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">Jadwal tidak dapat diubah selama menunggu persetujuan Koordinator.</p>}
        <button type="button" onClick={() => setCancelOpen(true)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700 hover:bg-red-50"><XCircle className="h-4 w-4" />Batalkan tugas</button>
      </motion.section>
      <ConfirmDialog open={cancelOpen} onOpenChange={setCancelOpen} title="Batalkan tugas ini?" description="Pembatalan hanya dapat dilakukan sebelum tugas dimulai. Isi alasan agar keluarga dan Helper menerima informasi yang jelas." confirmLabel="Batalkan tugas" tone="danger" loading={loading} onConfirm={cancelTask}>
        <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="alasan-pembatalan">Alasan pembatalan</label>
        <textarea id="alasan-pembatalan" value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} maxLength={500} required rows={4} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100" placeholder="Contoh: Lansia harus pergi ke rumah sakit." />
      </ConfirmDialog>
      <FeedbackDialog open={Boolean(feedback)} onOpenChange={() => setFeedback(null)} title={feedback?.title ?? "Informasi"} description={feedback?.description ?? ""} tone={feedback?.tone ?? "success"} />
    </>
  );
}
