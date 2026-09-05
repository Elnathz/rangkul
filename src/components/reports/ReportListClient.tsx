"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, Shield, ShieldAlert, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReportItem = {
  id: string;
  alasan: string;
  status: "menunggu" | "ditindak" | "selesai";
  created_at: string;
  updated_at: string;
  reported_helper_id: string;
  reporter_id: string;
  ditindak_oleh: string | null;
  decision_reason: string | null;
  report_count: number;
  helper?: { user: { full_name: string; helper_profiles?: { status: string } | { status: string }[] | null } } | null;
  reporter?: { full_name: string } | null;
  reviewer?: { full_name: string } | null;
};

type ReviewDraft = {
  reportId: string;
  status: "ditindak" | "selesai";
  helperStatus: "none" | "verified" | "suspended";
  reason: string;
};

const statusLabels = {
  menunggu: "Menunggu peninjauan",
  ditindak: "Sedang ditindak",
  selesai: "Selesai",
};

export function ReportListClient({ initialReports, isAdmin = false }: { initialReports: ReportItem[]; isAdmin?: boolean }) {
  const [reports, setReports] = useState(initialReports);
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const router = useRouter();

  async function submitReview() {
    if (!draft || draft.reason.trim().length < 10) return;
    setProcessing(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/reports/${draft.reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draft.status,
          decision_reason: draft.reason,
          helper_status: draft.helperStatus === "none" ? undefined : draft.helperStatus,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Keputusan laporan belum dapat disimpan.");
      setReports((current) => current.map((report) => report.id === draft.reportId
        ? { ...report, status: draft.status, decision_reason: draft.reason, updated_at: new Date().toISOString() }
        : report));
      setDraft(null);
      setNotice({ tone: "success", message: "Keputusan laporan tersimpan dan audit dibuat dalam transaksi yang sama." });
      router.refresh();
    } catch (error: unknown) {
      setNotice({ tone: "danger", message: error instanceof Error ? error.message : "Keputusan laporan belum dapat disimpan." });
    } finally {
      setProcessing(false);
    }
  }

  if (reports.length === 0) {
    return <div className="mt-6 rounded-2xl bg-white p-10 text-center"><Shield className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" /><h2 className="mt-3 font-bold text-slate-900">Tidak ada laporan</h2><p className="mt-1 text-sm text-slate-600">Belum ada laporan dalam scope {isAdmin ? "Admin" : "wilayah Anda"}.</p></div>;
  }

  return (
    <div className="mt-6 space-y-4">
      {notice && <div role="status" className={`flex items-start justify-between gap-3 rounded-xl p-4 text-sm font-semibold ${notice.tone === "success" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}><span>{notice.message}</span><button type="button" onClick={() => setNotice(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" aria-label="Tutup pemberitahuan"><X className="h-4 w-4" /></button></div>}
      {reports.map((report) => {
        const profileRelation = report.helper?.user.helper_profiles;
        const profile = Array.isArray(profileRelation) ? profileRelation[0] : profileRelation;
        return (
          <article key={report.id} className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-6">
            <header className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={report.status} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{report.report_count} laporan tercatat</span>
                {profile?.status && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-800">Helper {profile.status.replace("_", " ")}</span>}
              </div>
              <time dateTime={report.created_at} className="text-xs font-semibold text-slate-500">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.created_at))}</time>
            </header>

            <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0"><h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Alasan pelaporan</h2><p className="mt-2 break-words rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">{report.alasan}</p></div>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Helper terlapor</dt><dd className="mt-1 flex items-center gap-2 font-semibold text-slate-900"><UserRound className="h-4 w-4 text-red-600" aria-hidden="true" />{report.helper?.user.full_name || "Nama tidak tersedia"}</dd></div>
                <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Pelapor</dt><dd className="mt-1 font-semibold text-slate-900">{report.reporter?.full_name || "Keluarga pelapor"}</dd></div>
              </dl>
            </div>

            {report.decision_reason && <div className="mt-4 rounded-xl bg-blue-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-blue-800">Keputusan reviewer</p><p className="mt-2 text-sm leading-relaxed text-blue-950">{report.decision_reason}</p><p className="mt-2 text-xs font-semibold text-blue-800">Reviewer: {report.reviewer?.full_name || "Koordinator atau Admin"}</p></div>}

            {report.status !== "selesai" && (
              <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                {report.status === "menunggu" && <Button type="button" variant="outline" onClick={() => setDraft({ reportId: report.id, status: "ditindak", helperStatus: "none", reason: "" })} className="min-h-11 rounded-xl border-blue-200 text-blue-800">Mulai tindak lanjut</Button>}
                <Button type="button" onClick={() => setDraft({ reportId: report.id, status: "selesai", helperStatus: "none", reason: "" })} className="min-h-11 rounded-xl bg-[#0D47A1] text-white">Buat keputusan akhir</Button>
              </div>
            )}

            {draft?.reportId === report.id && (
              <section className="mt-5 rounded-2xl bg-slate-50 p-4 sm:p-5" aria-labelledby={`review-${report.id}`}>
                <div className="flex items-start justify-between gap-3"><div><h3 id={`review-${report.id}`} className="font-bold text-slate-950">{draft.status === "ditindak" ? "Mulai tindak lanjut" : "Keputusan akhir laporan"}</h3><p className="mt-1 text-sm text-slate-600">Alasan minimal 10 karakter dan akan dicatat di audit.</p></div><button type="button" onClick={() => setDraft(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" aria-label="Batalkan keputusan"><X className="h-5 w-5" /></button></div>
                {draft.status === "selesai" && <fieldset className="mt-4"><legend className="text-sm font-bold text-slate-800">Dampak pada Helper</legend><div className="mt-2 grid gap-2 sm:grid-cols-3"><DecisionOption label="Tutup laporan saja" description="Status Helper tidak berubah" value="none" selected={draft.helperStatus} onChange={(value) => setDraft({ ...draft, helperStatus: value })} /><DecisionOption label="Pulihkan Helper" description="Kembali verified dan probation" value="verified" selected={draft.helperStatus} onChange={(value) => setDraft({ ...draft, helperStatus: value })} /><DecisionOption label="Tangguhkan Helper" description="Tidak dapat menerima tugas baru" value="suspended" selected={draft.helperStatus} onChange={(value) => setDraft({ ...draft, helperStatus: value })} /></div></fieldset>}
                <label className="mt-4 block text-sm font-bold text-slate-800">Alasan keputusan<textarea value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} minLength={10} maxLength={500} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-base font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" /></label>
                {draft.helperStatus === "suspended" && <p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Tindakan ini memblokir Helper menerima tugas baru. Tugas aktif tidak dibatalkan otomatis.</p>}
                <div className="mt-4 flex justify-end"><Button type="button" onClick={() => void submitReview()} disabled={processing || draft.reason.trim().length < 10} className="min-h-11 rounded-xl bg-slate-900 text-white">{processing ? "Menyimpan..." : "Konfirmasi keputusan"}</Button></div>
              </section>
            )}
          </article>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: ReportItem["status"] }) {
  const Icon = status === "menunggu" ? Clock : status === "ditindak" ? ShieldAlert : CheckCircle2;
  const tone = status === "menunggu" ? "bg-amber-50 text-amber-800" : status === "ditindak" ? "bg-blue-50 text-blue-800" : "bg-emerald-50 text-emerald-800";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${tone}`}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{statusLabels[status]}</span>;
}

function DecisionOption({ label, description, value, selected, onChange }: { label: string; description: string; value: ReviewDraft["helperStatus"]; selected: ReviewDraft["helperStatus"]; onChange: (value: ReviewDraft["helperStatus"]) => void }) {
  return <label className={`flex min-h-20 cursor-pointer gap-3 rounded-xl border p-3 ${selected === value ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"}`}><input type="radio" name="helper-decision" value={value} checked={selected === value} onChange={() => onChange(value)} className="mt-1 h-4 w-4" /><span><span className="block text-sm font-bold text-slate-900">{label}</span><span className="mt-1 block text-xs leading-relaxed text-slate-600">{description}</span></span></label>;
}
