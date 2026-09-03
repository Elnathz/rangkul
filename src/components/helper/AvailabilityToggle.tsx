"use client";

import { CircleCheck, LoaderCircle, Power } from "lucide-react";
import { useState } from "react";

type AvailabilityToggleProps = {
  initialValue: boolean;
  disabled?: boolean;
};

export function AvailabilityToggle({ initialValue, disabled = false }: AvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const statusLabel = isAvailable ? "Siap menerima tugas" : "Tidak menerima tugas";

  async function toggle() {
    if (pending || disabled) return;
    const nextValue = !isAvailable;
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/helper/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: nextValue }),
      });
      const payload = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(payload?.message ?? "Ketersediaan belum dapat diperbarui.");
      setIsAvailable(nextValue);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ketersediaan belum dapat diperbarui.");
    } finally {
      setPending(false);
    }
  }

  return <div className="space-y-2"><button type="button" role="switch" aria-checked={isAvailable} aria-label={`Ketersediaan menerima tugas: ${statusLabel}`} disabled={disabled || pending} onClick={toggle} className="flex min-h-[76px] w-full items-center gap-3 rounded-md border border-border bg-card p-4 text-left transition-[border-color,box-shadow] duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"><span className={isAvailable ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--success-bg)] text-[var(--success)]" : "flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-muted-foreground"}>{isAvailable ? <CircleCheck className="size-5" aria-hidden="true" /> : <Power className="size-5" aria-hidden="true" />}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">Ketersediaan menerima tugas</span><span className="mt-0.5 block text-sm text-muted-foreground">{disabled ? "Tersedia setelah profil terverifikasi." : isAvailable ? "Peluang yang sesuai dapat muncul untuk Anda." : "Aktifkan saat siap menerima peluang baru."}</span></span><span className="flex shrink-0 flex-col items-end gap-1.5"><span className={isAvailable ? "text-xs font-bold text-[var(--success)]" : "text-xs font-bold text-muted-foreground"}>{pending ? "Menyimpan" : statusLabel}</span><span aria-hidden="true" className={isAvailable ? "relative h-6 w-11 rounded-full bg-[var(--success)] transition-colors" : "relative h-6 w-11 rounded-full bg-[var(--border-strong)] transition-colors"}><span className={isAvailable ? "absolute right-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform" : "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform"}>{pending ? <LoaderCircle className="m-0.5 size-4 animate-spin text-muted-foreground" /> : null}</span></span></span></button>{error ? <p role="alert" className="text-sm text-destructive">{error} <button type="button" onClick={toggle} className="font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Coba lagi</button></p> : null}</div>;
}
