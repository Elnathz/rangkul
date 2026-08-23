"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, Phone, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SOSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: "helper" | "keluarga" | "koordinator" | "admin" | null;
  taskId?: string;
}

export default function SOSDialog({ isOpen, onClose, userRole, taskId: initialTaskId }: SOSDialogProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [taskId, setTaskId] = useState(initialTaskId || "");
  const [taskLoading, setTaskLoading] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Resetting transient dialog state belongs to opening the dialog, not render calculation.
    /* eslint-disable react-hooks/set-state-in-effect */
    setCountdown(initialTaskId ? 5 : null);
    setTaskId(initialTaskId || "");
    setTaskLoading(userRole === "helper" && !initialTaskId);
    setIsAlerting(false);
    setIsSent(false);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    if (userRole !== "helper" || initialTaskId) {
      setTaskLoading(false);
      return;
    }

    let cancelled = false;
    void fetch("/api/tasks/active", { cache: "no-store" })
      .then(async (response) => response.json().then((body: { task?: { id: string } | null }) => {
        if (cancelled) return;
        if (response.ok && body.task?.id) {
          setTaskId(body.task.id);
          setCountdown(5);
        } else {
          setError(response.ok ? "Belum ada tugas yang sedang dikerjakan. Mulai tugas dan check-in terlebih dahulu." : "Tugas aktif tidak dapat dimuat.");
        }
      }))
      .catch(() => {
        if (!cancelled) setError("Tugas aktif tidak dapat dimuat.");
      })
      .finally(() => {
        if (!cancelled) setTaskLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialTaskId, isOpen, userRole]);

  useEffect(() => {
    if (!taskId) return;
    if (!isOpen || countdown === null || countdown <= 0 || isAlerting || isSent) return;
    const timer = window.setTimeout(() => setCountdown((value) => value === null ? null : value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, isAlerting, isOpen, isSent, taskId]);

  const handleSendAlert = useCallback(async () => {
    if (!taskId) {
      setError("SOS harus terkait tugas aktif.");
      return;
    }
    setIsAlerting(true);
    setError(null);
    try {
      const response = await fetch("/api/emergency", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task_id: taskId }) });
      const body = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(body?.message || "Sinyal darurat belum dapat dikirim");
      setIsSent(true);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Sinyal darurat belum dapat dikirim");
    } finally {
      setIsAlerting(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isOpen && countdown === 0 && !isAlerting && !isSent && taskId) {
      // The countdown completion is an intentional event-driven API submission.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void handleSendAlert();
    }
  }, [countdown, handleSendAlert, isAlerting, isOpen, isSent, taskId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 z-20 rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Tutup"><X className="h-5 w-5" /></button>
        {isSent ? (
          <div className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100"><ShieldAlert className="h-12 w-12 text-red-600" /></div>
            <div><h2 className="text-2xl font-black text-slate-900">Sinyal Darurat Tersimpan</h2><p className="mt-2 font-medium text-slate-500">Keluarga dan Koordinator sudah menerima notifikasi in-app. Hubungi 112 jika membutuhkan bantuan segera.</p></div>
            <a href="tel:112" className="block"><Button className="h-14 w-full rounded-2xl bg-red-600 text-lg font-bold text-white"><Phone className="mr-2 h-5 w-5" />Hubungi 112</Button></a>
            <Button variant="outline" onClick={onClose} className="w-full">Tutup</Button>
          </div>
        ) : (
          <><div className="relative overflow-hidden bg-red-600 p-8 text-center"><AlertTriangle className="relative z-10 mx-auto h-20 w-20 text-white" /><h2 className="relative z-10 mt-4 text-3xl font-black text-white">DARURAT</h2></div><div className="space-y-6 p-8 text-center"><p className="font-medium text-slate-600">Sinyal darurat akan dikirim ke pihak yang terkait tugas aktif.</p>{taskLoading && <p className="rounded-xl bg-blue-50 p-3 text-sm leading-6 text-blue-800">Mencari tugas aktif...</p>}<div className="my-4 flex min-h-20 items-center justify-center text-6xl font-black tabular-nums text-red-600">{taskLoading ? <Loader2 className="h-10 w-10 animate-spin" aria-label="Memuat tugas aktif" /> : countdown ?? "-"}</div>{error && <p className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}{!taskLoading && !taskId && !error && <p className="rounded-xl bg-slate-100 p-3 text-sm leading-6 text-slate-600">Belum ada tugas yang sedang dikerjakan.</p>}<div className="space-y-3"><Button onClick={handleSendAlert} disabled={isAlerting || taskLoading || !taskId} className="h-14 w-full rounded-2xl bg-red-600 text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{isAlerting ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : "Kirim Sekarang"}</Button><Button variant="outline" onClick={onClose} disabled={isAlerting} className="h-14 w-full rounded-2xl">Batalkan</Button></div></div></>
        )}
      </div>
    </div>
  );
}
