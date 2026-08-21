"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AcceptTaskButton({ taskId, disabled = false }: { taskId: string; disabled?: boolean }) {
  const router = useRouter();
  const [state, setState] = React.useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = React.useState("");

  async function handleAccept() {
    setState("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/tasks/${taskId}/accept`, { method: "PATCH" });
      const payload = await response.json() as { message?: string };

      if (!response.ok) {
        setState("error");
        setMessage(payload.message || "Tugas tidak dapat diterima.");
        return;
      }

      router.push("/helper/dashboard");
      router.refresh();
    } catch {
      setState("error");
      setMessage("Koneksi bermasalah. Coba terima tugas lagi.");
    }
  }

  return (
    <div className="space-y-3">
      {message && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">
          {message}
        </p>
      )}
      <Button
        onClick={() => void handleAccept()}
        disabled={disabled || state === "loading"}
        className="h-12 w-full rounded-xl bg-brand-gradient font-bold text-white shadow-md hover:opacity-90"
      >
        {state === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {state === "loading" ? "Memproses penerimaan..." : disabled ? "Tugas tidak tersedia" : "Terima & Konfirmasi Pekerjaan"}
      </Button>
    </div>
  );
}
