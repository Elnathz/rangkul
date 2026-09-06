"use client";

import * as React from "react";
import { Loader2, Users, Check, X, Clock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ApplyTaskButtonProps = {
  taskId: string;
  initialApplied: boolean;
  initialStatus?: "pending" | "selected" | "rejected" | "withdrawn" | "expired" | null;
};

export function ApplyTaskButton({
  taskId,
  initialApplied,
  initialStatus = null,
}: ApplyTaskButtonProps) {
  const router = useRouter();
  const [applied, setApplied] = React.useState(initialApplied);
  const [status, setStatus] = React.useState(initialStatus);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleApply() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/tasks/${taskId}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Gagal mengajukan diri untuk tugas ini.");
      }

      setApplied(true);
      setStatus("pending");
      setMessage("Pengajuan diri berhasil dikirim! Menunggu pilihan dari keluarga.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/tasks/${taskId}/applications/me`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Gagal membatalkan pengajuan diri.");
      }

      setApplied(false);
      setStatus("withdrawn");
      setMessage("Pengajuan diri telah dibatalkan.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }

  if (applied && status === "selected") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="h-5 w-5" />
        </div>
        <p className="mt-2 text-sm font-bold text-emerald-950">
          Anda Terpilih!
        </p>
        <p className="mt-1 text-xs text-emerald-800">
          Keluarga telah memilih Anda untuk tugas ini.
        </p>
      </div>
    );
  }

  if (applied && status === "rejected") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs font-medium text-slate-600">
        Keluarga telah memilih Helper lain untuk tugas ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p>{message}</p>
        </div>
      )}

      {applied && status === "pending" ? (
        <div className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-900">
            <Clock className="h-4 w-4 text-violet-600" />
            <span>Pengajuan Terkirim</span>
          </div>
          <p className="text-xs text-violet-700 leading-relaxed">
            Profil Anda sedang ditinjau oleh pihak keluarga. Anda akan diberitahu jika terpilih.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleWithdraw}
            className="min-h-[44px] w-full rounded-xl border-red-200 bg-white text-xs font-bold text-red-700 hover:bg-red-50"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-1.5 h-4 w-4" />
            )}
            Batalkan Pengajuan
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          disabled={loading}
          onClick={handleApply}
          className="min-h-[48px] w-full rounded-xl bg-violet-700 font-bold text-white shadow-md transition hover:bg-violet-800 active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim Pengajuan...
            </>
          ) : (
            <>
              <Users className="mr-2 h-4 w-4" />
              Ajukan Diri untuk Tugas Ini
            </>
          )}
        </Button>
      )}
    </div>
  );
}
