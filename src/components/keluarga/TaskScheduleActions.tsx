"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Loader2, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FeedbackDialog } from "@/components/ui/FeedbackDialog";
import DateTimePicker from "@/components/keluarga/booking/DateTimePicker";
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
      setFeedback({ title: "Jadwal diperbarui", description: "Perubahan jadwal kunjungan sudah tersimpan.", tone: "success" });
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
      if (!response.ok) throw new Error(payload.message || "Kunjungan belum dapat dibatalkan");
      setCancelOpen(false);
      setFeedback({ title: "Kunjungan dibatalkan", description: "Kunjungan ini sudah dipindahkan ke riwayat.", tone: "success" });
      router.refresh();
    } catch (error: unknown) {
      setFeedback({ title: "Kunjungan belum dibatalkan", description: error instanceof Error ? error.message : "Coba lagi beberapa saat.", tone: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const reveal = reduceMotion ? { initial: false, animate: {} } : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
  const canReschedule = status === "diajukan" || status === "dikonfirmasi";
  return (
    <>
      <motion.section {...reveal} transition={{ duration: 0.22, ease: "easeOut" }} className="rounded-[18px] border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-start gap-3"><CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="font-display text-base font-extrabold text-ink">Pengaturan kunjungan</h2><p className="mt-1 text-xs leading-relaxed text-ink-muted">Jadwal dapat diubah maksimal dua kali selama masih memenuhi batas waktu perubahan.</p></div></div>
        {canReschedule && <form onSubmit={submitReschedule} className="mt-4 space-y-3">
          <DateTimePicker
            value={nextSchedule}
            onChange={setNextSchedule}
            label="Jadwal baru"
            required
            helperText="Pilih waktu baru kunjungan sesuai kesepakatan."
          />
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#083578] disabled:cursor-not-allowed disabled:opacity-60">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan jadwal
            </button>
          </div>
        </form>}
        {!canReschedule && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">Jadwal terkunci selama Koordinator melakukan peninjauan.</p>}
        <button type="button" onClick={() => setCancelOpen(true)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"><XCircle className="h-4 w-4" />Batalkan Kunjungan</button>
      </motion.section>
      <ConfirmDialog open={cancelOpen} onOpenChange={setCancelOpen} title="Batalkan kunjungan ini?" description="Pembatalan hanya dapat dilakukan sebelum kunjungan dimulai. Isi alasan agar semua pihak menerima informasi yang jelas." confirmLabel="Batalkan Kunjungan" tone="danger" loading={loading} onConfirm={cancelTask}>
        <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="alasan-pembatalan">Alasan pembatalan</label>
        <textarea id="alasan-pembatalan" value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} maxLength={500} required rows={4} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100" placeholder="Contoh: Lansia harus pergi ke rumah sakit." />
      </ConfirmDialog>
      <FeedbackDialog open={Boolean(feedback)} onOpenChange={() => setFeedback(null)} title={feedback?.title ?? "Informasi"} description={feedback?.description ?? ""} tone={feedback?.tone ?? "success"} />
    </>
  );
}
