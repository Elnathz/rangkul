"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowLeft, Camera, FileText, Loader2, UploadCloud } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackDialog } from "@/components/ui/FeedbackDialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOfflineEvidence } from "@/hooks/use-offline-evidence";
import type { OfflineEvidenceDraft } from "@/lib/offline/evidence-store";
import { createClient } from "@/lib/supabase/client";

type TaskSummary = {
  id: string;
  status: string;
  lansia_profiles: { nama: string; foto_url: string | null; catatan_kondisi: string | null } | null;
  service_categories: { nama: string; deskripsi: string; estimasi_durasi_menit: number } | null;
};

type ScoreKey = "skor_energi" | "skor_mobilitas" | "skor_mood" | "skor_nafsu_makan" | "skor_tidur";

const scoreLabels: Array<{ key: ScoreKey; label: string }> = [
  { key: "skor_energi", label: "Energi dan semangat" },
  { key: "skor_mobilitas", label: "Pergerakan fisik" },
  { key: "skor_mood", label: "Suasana hati" },
  { key: "skor_nafsu_makan", label: "Nafsu makan" },
  { key: "skor_tidur", label: "Kualitas tidur" },
];

export default function LaporanHelperPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const reduceMotion = useReducedMotion();
  const [task, setTask] = React.useState<TaskSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [form, setForm] = React.useState({
    catatan_kondisi: "",
    skor_energi: 3,
    skor_mobilitas: 3,
    skor_mood: 3,
    skor_nafsu_makan: 3,
    skor_tidur: 3,
    cerita_hari_ini: "",
  });
  const [feedback, setFeedback] = React.useState<{ title: string; description: string; tone: "danger" | "info" } | null>(null);

  const syncDraft = React.useCallback(async (draft: OfflineEvidenceDraft) => {
    const uploadForm = new FormData();
    uploadForm.set("file", draft.photo);
    uploadForm.set("docType", "foto_bukti");
    const uploadResponse = await fetch("/api/storage/upload", { method: "POST", body: uploadForm });
    const uploadPayload = await uploadResponse.json();
    if (!uploadResponse.ok) throw new Error(uploadPayload.message || "Foto bukti belum dapat diunggah");

    const reportResponse = await fetch(`/api/tasks/${taskId}/evidence`, {
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
  }, [taskId]);

  const [userId, setUserId] = React.useState<string>("");

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const { draft, isOnline, isLoading: isDraftLoading, syncError, save: saveDraft, sync } = useOfflineEvidence(taskId, userId, syncDraft);

  React.useEffect(() => {
    let active = true;
    fetch(`/api/tasks/${taskId}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Tugas belum dapat dimuat");
        if (active) setTask(payload.task as TaskSummary);
      })
      .catch((error: unknown) => {
        if (active) setFeedback({ title: "Tugas belum tersedia", description: error instanceof Error ? error.message : "Coba muat ulang halaman.", tone: "danger" });
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [taskId]);

  React.useEffect(() => {
    if (!draft || isDraftLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      catatan_kondisi: draft.catatan_kondisi,
      skor_energi: draft.skor_energi ?? 3,
      skor_mobilitas: draft.skor_mobilitas ?? 3,
      skor_mood: draft.skor_mood ?? 3,
      skor_nafsu_makan: draft.skor_nafsu_makan ?? 3,
      skor_tidur: draft.skor_tidur ?? 3,
      cerita_hari_ini: draft.cerita_hari_ini,
    });
    setPhoto(new File([draft.photo], "bukti-kunjungan.jpg", { type: draft.photo.type || "image/jpeg" }));
  }, [draft, isDraftLoading]);

  const updateScore = (key: ScoreKey, value: number) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!photo) {
      setFeedback({ title: "Foto bukti belum dipilih", description: "Tambahkan foto kunjungan sebelum mengirim laporan.", tone: "info" });
      return;
    }

    const draftPayload = (): OfflineEvidenceDraft => ({
      id: draft?.id ?? crypto.randomUUID(),
      owner_user_id: userId,
      task_id: taskId,
      client_submission_id: draft?.client_submission_id ?? crypto.randomUUID(),
      photo,
      ...form,
      status: "pending_sync",
      retry_count: draft?.retry_count ?? 0,
      last_error: null,
      created_at: draft?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (!navigator.onLine) {
      await saveDraft(draftPayload());
      setFeedback({ title: "Draf tersimpan", description: "Laporan disimpan di perangkat dan akan dikirim otomatis saat koneksi kembali.", tone: "info" });
      return;
    }

    setIsSubmitting(true);
    try {
      await sync(draftPayload());
      router.push(`/tugas/${taskId}`);
    } catch (error: unknown) {
      await saveDraft(draftPayload());
      setFeedback({ title: "Laporan belum terkirim", description: error instanceof Error ? error.message : "Periksa koneksi lalu coba lagi.", tone: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F5F8FC] text-sm font-semibold text-slate-600"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Memuat detail tugas...</div>;
  }

  if (!task) {
    return <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center bg-[#F5F8FC] px-6 text-center"><p className="text-sm font-semibold text-slate-600">Detail tugas belum dapat dimuat.</p><FeedbackDialog open={Boolean(feedback)} onOpenChange={() => setFeedback(null)} title={feedback?.title ?? "Tugas belum tersedia"} description={feedback?.description ?? "Coba lagi."} tone={feedback?.tone ?? "danger"} /></div>;
  }

  const reveal = reduceMotion ? { initial: false, animate: {} } : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${isOnline ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`} role="status">
          {isOnline ? "Online. Laporan akan dikirim ke server." : "Offline. Laporan akan disimpan sebagai Pending Sync."}
          {draft?.status === "failed" && <button type="button" className="ml-2 underline" onClick={() => void sync()}>Coba sinkronkan lagi</button>}
          {syncError && <span className="mt-1 block text-xs font-normal">{syncError}</span>}
        </div>
        <motion.div {...reveal} transition={{ duration: 0.35, ease: "easeOut" }} className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full border border-slate-200 bg-white shadow-sm">
            <Link href={`/tugas/${taskId}`} aria-label="Kembali ke detail tugas"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Laporan kunjungan</p>
            <h1 className="text-2xl font-black text-slate-950">{task.service_categories?.nama ?? "Tugas pendampingan"}</h1>
            <p className="text-sm text-slate-600">Lansia: {task.lansia_profiles?.nama ?? "Profil lansia"}</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div {...reveal} transition={{ delay: 0.04, duration: 0.35, ease: "easeOut" }}>
            <Card className="overflow-hidden border-slate-100 shadow-sm">
              <CardHeader className="border-b border-blue-100 bg-blue-50/70">
                <CardTitle className="flex items-center gap-2 text-lg"><Camera className="h-5 w-5 text-[#0D47A1]" /> Bukti kunjungan</CardTitle>
                <CardDescription>Foto disimpan sebagai bukti privat untuk keluarga dan pihak yang berwenang.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <label htmlFor="foto-bukti" className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-6 text-center transition hover:border-blue-400 hover:bg-blue-50">
                  <UploadCloud className="mb-3 h-9 w-9 text-[#0D47A1]" />
                  <span className="text-sm font-bold text-slate-900">{photo ? photo.name : "Pilih foto bukti kunjungan"}</span>
                  <span className="mt-1 text-xs text-slate-500">JPG atau PNG, maksimal 5MB</span>
                  <input id="foto-bukti" type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} required />
                </label>
                <div className="space-y-2">
                  <Label htmlFor="catatan-kondisi">Catatan kondisi lansia</Label>
                  <Textarea id="catatan-kondisi" value={form.catatan_kondisi} onChange={(event) => setForm((current) => ({ ...current, catatan_kondisi: event.target.value }))} placeholder="Jelaskan kondisi, aktivitas, dan hal penting selama kunjungan." minLength={10} required rows={5} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...reveal} transition={{ delay: 0.08, duration: 0.35, ease: "easeOut" }}>
            <Card className="overflow-hidden border-emerald-100 shadow-sm">
              <CardHeader className="border-b border-emerald-100 bg-emerald-50/70">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-950"><Activity className="h-5 w-5 text-emerald-700" /> Health Snapshot</CardTitle>
                <CardDescription>Catatan pemantauan non-diagnostik. Nilai 1 berarti rendah, nilai 5 berarti sangat baik.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {scoreLabels.map(({ key, label }) => (
                  <fieldset key={key} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <legend className="px-1 text-sm font-bold text-slate-900">{label}: {form[key]} / 5</legend>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button key={value} type="button" aria-pressed={form[key] === value} onClick={() => updateScore(key, value)} className={`min-h-11 rounded-xl text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] ${form[key] === value ? "bg-[#0D47A1] text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-[#0D47A1]"}`}>{value}</button>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <div className="space-y-2 pt-2">
                  <Label htmlFor="cerita-hari-ini" className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#0D47A1]" />Memory Capsule</Label>
                  <Textarea id="cerita-hari-ini" value={form.cerita_hari_ini} onChange={(event) => setForm((current) => ({ ...current, cerita_hari_ini: event.target.value }))} placeholder="Tuliskan momen atau cerita yang ingin dibaca keluarga." rows={4} />
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-100 bg-slate-50 p-6">
                <Button type="submit" className="min-h-12 w-full rounded-xl bg-[#0D47A1] font-bold text-white hover:bg-blue-800" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Mengirim laporan..." : "Kirim laporan kunjungan"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </form>
      </div>
      <FeedbackDialog open={Boolean(feedback)} onOpenChange={() => setFeedback(null)} title={feedback?.title ?? "Informasi"} description={feedback?.description ?? ""} tone={feedback?.tone ?? "info"} />
    </main>
  );
}
