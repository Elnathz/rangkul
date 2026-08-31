"use client";

import EvidenceSyncManager from "@/components/offline/EvidenceSyncManager";
import type { OfflineEvidenceDraft } from "@/lib/offline/evidence-store";

async function globalSyncDraft(draft: OfflineEvidenceDraft) {
  const uploadForm = new FormData();
  uploadForm.set("file", draft.photo);
  uploadForm.set("docType", "foto_bukti");
  const uploadResponse = await fetch("/api/storage/upload", { method: "POST", body: uploadForm });
  const uploadPayload = await uploadResponse.json();
  if (!uploadResponse.ok) throw new Error(uploadPayload.message || "Foto bukti belum dapat diunggah");

  const reportResponse = await fetch(`/api/tasks/${draft.task_id}/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      foto_bukti_url: uploadPayload.data?.path || uploadPayload.path,
      catatan_kondisi: draft.catatan_kondisi,
      skor_energi: draft.skor_energi,
      skor_mobilitas: draft.skor_mobilitas,
      skor_mood: draft.skor_mood,
      skor_nafsu_makan: draft.skor_nafsu_makan,
      skor_tidur: draft.skor_tidur,
      cerita_hari_ini: draft.cerita_hari_ini,
      client_submission_id: draft.client_submission_id,
    }),
  });
  const reportPayload = await reportResponse.json();
  if (!reportResponse.ok) throw new Error(reportPayload.message || "Laporan belum dapat disimpan");
}

export default function HelperLayoutClient() {
  return <EvidenceSyncManager syncFn={globalSyncDraft} />;
}
