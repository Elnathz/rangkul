"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Plus, ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type ExtraService = {
  id: string;
  nama_layanan: string;
  biaya: number;
  status: "menunggu_persetujuan_keluarga" | "disetujui" | "ditolak";
};

export function ExtraServiceRequestForm({
  taskId,
  status,
  services,
}: {
  taskId: string;
  status: string;
  services: ExtraService[];
}) {
  const router = useRouter();
  const [namaLayanan, setNamaLayanan] = React.useState("");
  const [biaya, setBiaya] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pendingService = services.find((service) => service.status === "menunggu_persetujuan_keluarga");
  const canRequest = status === "dikerjakan" && !pendingService;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tasks/" + taskId + "/extra-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_layanan: namaLayanan, biaya: Number(biaya) }),
      });
      const result = await response.json() as { message?: string; fieldErrors?: Record<string, string[]> };

      if (!response.ok) {
        const firstFieldError = result.fieldErrors ? Object.values(result.fieldErrors).flat()[0] : null;
        throw new Error(firstFieldError || result.message || "Layanan tambahan belum dapat diajukan.");
      }

      setNamaLayanan("");
      setBiaya("");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Layanan tambahan belum dapat diajukan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D47A1] shadow-sm">
          <ReceiptText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">Layanan tambahan</p>
          <h2 className="mt-1 text-base font-black text-slate-950">Ajukan biaya hanya jika diperlukan</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Tugas akan berhenti sementara sampai Keluarga menyetujui atau menolak pengajuan ini.
          </p>
        </div>
      </div>

      {pendingService ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div>
            <p className="font-bold">Menunggu keputusan Keluarga</p>
            <p className="mt-1">{pendingService.nama_layanan} · Rp {Number(pendingService.biaya).toLocaleString("id-ID")}</p>
          </div>
        </div>
      ) : canRequest ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            Nama layanan
            <input
              value={namaLayanan}
              onChange={(event) => setNamaLayanan(event.target.value)}
              placeholder="Contoh: beli obat tambahan"
              minLength={3}
              maxLength={120}
              required
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0D47A1] focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Biaya tambahan
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-slate-400">Rp</span>
              <input
                type="number"
                value={biaya}
                onChange={(event) => setBiaya(event.target.value)}
                placeholder="0"
                min="1"
                step="1000"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0D47A1] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </label>
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting} className="min-h-11 w-full rounded-xl bg-[#0D47A1] font-bold hover:bg-blue-800">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {isSubmitting ? "Mengajukan..." : "Ajukan untuk persetujuan"}
          </Button>
        </form>
      ) : status === "menunggu_persetujuan_keluarga" ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          <CheckCircle2 className="h-5 w-5 text-amber-600" aria-hidden="true" />
          Tugas dijeda sampai Keluarga memberi keputusan.
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
          Pengajuan layanan tambahan tersedia setelah kamu memulai tugas.
        </p>
      )}
    </section>
  );
}
