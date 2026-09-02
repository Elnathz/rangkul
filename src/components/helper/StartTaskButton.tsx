"use client";

import * as React from "react";
import { CheckCircle2, Clock, Loader2, MapPinCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function StartTaskButton({ taskId, jadwalWaktu }: { taskId: string; jadwalWaktu?: string }) {
  const router = useRouter();
  const [state, setState] = React.useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const checkTooEarly = React.useCallback(() => {
    if (!jadwalWaktu) return false;
    const scheduledTime = new Date(jadwalWaktu).getTime();
    if (isNaN(scheduledTime)) return false;
    const thirtyMinutesMs = 30 * 60 * 1000;
    return scheduledTime - Date.now() > thirtyMinutesMs;
  }, [jadwalWaktu]);

  const [isTooEarly, setIsTooEarly] = React.useState(checkTooEarly);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIsTooEarly(checkTooEarly());
    }, 15000);
    return () => clearInterval(timer);
  }, [checkTooEarly]);

  const formattedSchedule = React.useMemo(() => {
    if (!jadwalWaktu) return "";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(jadwalWaktu));
    } catch {
      return "";
    }
  }, [jadwalWaktu]);

  async function handleStart() {
    setState("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/tasks/${taskId}/start`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const payload = await response.json() as { message?: string };

      if (!response.ok) {
        setState("error");
        setMessage(payload.message || "Tugas belum dapat dimulai.");
        return;
      }

      router.refresh();
    } catch {
      setState("error");
      setMessage("Koneksi bermasalah. Status check-in belum dapat dipastikan.");
    }
  }

  return (
    <div className="space-y-3">
      {isTooEarly && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
            <div>
              <p className="font-bold">Belum waktu pelaksanaan ({formattedSchedule})</p>
              <p className="mt-1 leading-relaxed text-amber-800">
                Check-in baru dibuka 30 menit sebelum jadwal. Jika ingin memulai lebih awal, minta Keluarga memajukan jadwal melalui fitur Jadwal Ulang.
              </p>
            </div>
          </div>
        </div>
      )}

      {message && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{message}</p>}

      <Button
        type="button"
        onClick={() => void handleStart()}
        disabled={state === "loading" || isTooEarly}
        className="h-12 w-full rounded-xl bg-[#0D47A1] font-bold text-white shadow-md hover:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-500"
      >
        {state === "loading" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isTooEarly ? (
          <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
        ) : (
          <MapPinCheck className="mr-2 h-4 w-4" aria-hidden="true" />
        )}
        {state === "loading"
          ? "Memproses check-in..."
          : isTooEarly
          ? "Belum masuk waktu check-in"
          : "Mulai tugas dan check-in"}
      </Button>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
        Status berubah menjadi Sedang Dikerjakan setelah server mengonfirmasi check-in.
      </p>
    </div>
  );
}
