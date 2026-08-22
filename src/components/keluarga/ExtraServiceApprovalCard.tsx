"use client";

import * as React from "react";
import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FeedbackDialog } from "@/components/ui/FeedbackDialog";

type ExtraService = {
  id: string;
  nama_layanan: string;
  biaya: number;
  status: "menunggu_persetujuan_keluarga" | "disetujui" | "ditolak";
};

export function ExtraServiceApprovalCard({
  taskId,
  service,
}: {
  taskId: string;
  service: ExtraService;
}) {
  const router = useRouter();
  const [decision, setDecision] = React.useState<"disetujui" | "ditolak" | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ title: string; description: string; tone: "success" | "danger" } | null>(null);

  async function handleDecision() {
    if (!decision) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tasks/" + taskId + "/extra-service/" + service.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const result = await response.json() as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Keputusan belum dapat disimpan.");
      }

      setDecision(null);
      setFeedback({
        title: decision === "disetujui" ? "Layanan tambahan disetujui" : "Layanan tambahan ditolak",
        description: result.message || "Status tugas telah diperbarui.",
        tone: "success",
      });
      router.refresh();
    } catch (error) {
      setDecision(null);
      setFeedback({
        title: "Keputusan belum tersimpan",
        description: error instanceof Error ? error.message : "Coba lagi setelah memuat ulang halaman.",
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const confirmationDescription = decision === "disetujui"
    ? "Total pembayaran akan bertambah Rp " + Number(service.biaya).toLocaleString("id-ID") + "."
    : "Helper akan menerima keputusan ini dan tugas dapat dilanjutkan tanpa biaya tambahan ini.";

  return (
    <>
      <ConfirmDialog
        open={decision !== null}
        onOpenChange={(open) => !open && !isSubmitting && setDecision(null)}
        title={decision === "disetujui" ? "Setujui layanan tambahan?" : "Tolak layanan tambahan?"}
        description={confirmationDescription}
        confirmLabel={decision === "disetujui" ? "Ya, Setujui" : "Ya, Tolak"}
        tone={decision === "disetujui" ? "primary" : "danger"}
        loading={isSubmitting}
        onConfirm={handleDecision}
        icon={decision === "disetujui" ? <Check className="h-6 w-6" aria-hidden="true" /> : <AlertTriangle className="h-6 w-6" aria-hidden="true" />}
      />
      <FeedbackDialog
        open={feedback !== null}
        onOpenChange={(open) => !open && setFeedback(null)}
        title={feedback?.title || ""}
        description={feedback?.description || ""}
        tone={feedback?.tone || "success"}
      />
      <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Menunggu keputusan kamu</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">{service.nama_layanan}</h2>
            <p className="mt-1 text-sm text-slate-600">Helper mengajukan perubahan biaya sebelum melanjutkan tugas.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500">Tambahan</p>
            <p className="mt-1 text-lg font-black text-[#0D47A1]">Rp {Number(service.biaya).toLocaleString("id-ID")}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setDecision("ditolak")} className="min-h-11 rounded-xl border-red-200 bg-white font-bold text-red-700 hover:bg-red-50">
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            Tolak
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={() => setDecision("disetujui")} className="min-h-11 rounded-xl bg-[#0D47A1] font-bold hover:bg-blue-800">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="mr-2 h-4 w-4" aria-hidden="true" />}
            Setujui
          </Button>
        </div>
      </section>
    </>
  );
}
