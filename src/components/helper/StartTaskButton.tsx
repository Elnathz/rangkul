"use client";

import * as React from "react";
import { CheckCircle2, Loader2, MapPinCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function StartTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [state, setState] = React.useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = React.useState("");

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
      {message && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{message}</p>}
      <Button
        type="button"
        onClick={() => void handleStart()}
        disabled={state === "loading"}
        className="h-12 w-full rounded-xl bg-[#0D47A1] font-bold text-white shadow-md hover:bg-blue-800"
      >
        {state === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <MapPinCheck className="mr-2 h-4 w-4" aria-hidden="true" />}
        {state === "loading" ? "Memproses check-in..." : "Mulai tugas dan check-in"}
      </Button>
      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />Status berubah menjadi Sedang Dikerjakan setelah server mengonfirmasi check-in.</p>
    </div>
  );
}
