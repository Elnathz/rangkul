"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Star,
  User,
  Users,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export type ApplicantItem = {
  application_id: string;
  status: "pending" | "selected" | "rejected" | "withdrawn" | "expired";
  diajukan_at: string;
  helper: {
    id: string;
    full_name: string;
    foto_wajah_url: string | null;
    rating_avg: number;
    total_tugas_selesai: number;
    tingkat_kepercayaan: string;
    jarak_km: number;
  };
};

type TaskApplicantsClientProps = {
  taskId: string;
  taskTitle: string;
  taskStatus: string;
  lansiaName: string;
  jadwalWaktu: string;
  hargaFinal: number;
  initialApplicants: ApplicantItem[];
};

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function formatRelativeTime(isoString: string) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return formatDateTime(isoString);
}

export default function TaskApplicantsClient({
  taskId,
  taskTitle,
  taskStatus,
  lansiaName,
  jadwalWaktu,
  hargaFinal,
  initialApplicants,
}: TaskApplicantsClientProps) {
  const router = useRouter();
  const [applicants, setApplicants] = React.useState<ApplicantItem[]>(initialApplicants);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectingId, setSelectingId] = React.useState<string | null>(null);
  const [confirmModalApplicant, setConfirmModalApplicant] = React.useState<ApplicantItem | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const fetchApplicants = React.useCallback(async () => {
    setIsRefreshing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/applications`);
      const body = await res.json().catch(() => null);
      if (res.ok && body?.data) {
        setApplicants(body.data);
      } else {
        setErrorMsg(body?.message || "Gagal memperbarui daftar pelamar.");
      }
    } catch {
      setErrorMsg("Koneksi bermasalah saat memperbarui data.");
    } finally {
      setIsRefreshing(false);
    }
  }, [taskId]);

  // Polling interval 5 detik selama status tugas masih 'diajukan'
  React.useEffect(() => {
    if (taskStatus !== "diajukan") return;
    const timer = setInterval(() => {
      fetchApplicants();
    }, 5000);
    return () => clearInterval(timer);
  }, [taskStatus, fetchApplicants]);

  const handleSelectApplicant = async (applicant: ApplicantItem) => {
    setSelectingId(applicant.application_id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/applications/${applicant.application_id}/select`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || "Gagal memilih Helper.");
      }

      setConfirmModalApplicant(null);
      setSuccessMsg(`Berhasil memilih ${applicant.helper.full_name}! Mengalihkan ke detail kunjungan...`);
      setTimeout(() => {
        router.push(`/kunjungan/${taskId}`);
      }, 1200);
    } catch (err) {
      setErrorMsg((err as Error).message || "Terjadi kesalahan server saat memilih Helper.");
    } finally {
      setSelectingId(null);
    }
  };

  const isSelected = applicants.some((a) => a.status === "selected");

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/kunjungan/${taskId}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-[#0D47A1]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Detail Kunjungan
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={fetchApplicants}
            disabled={isRefreshing}
            className="min-h-[44px] rounded-full border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Perbarui
          </Button>
        </div>

        {/* Task Context Card */}
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">
                <Users className="h-3.5 w-3.5" />
                Mode: Pilih dari Pelamar
              </div>
              <h1 className="text-xl font-black text-slate-950 sm:text-2xl">{taskTitle}</h1>
              <p className="mt-1 text-sm text-slate-600">Untuk {lansiaName}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#0D47A1]">Biaya Layanan</p>
              <p className="text-lg font-black text-[#0D47A1]">Rp {hargaFinal.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {formatDateTime(jadwalWaktu)}
            </span>
          </div>
        </section>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* Applicants List Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              Pelamar Masuk ({applicants.length})
            </h2>
            {taskStatus === "diajukan" && !isSelected && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Menerima pelamar
              </span>
            )}
          </div>

          {applicants.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center sm:p-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Belum ada pelamar</h3>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 sm:text-sm">
                Tugas ini telah disiarkan ke Helper terdekat di sekitar lokasi lansia. Pelamar akan muncul di sini segera setelah mengajukan diri.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={fetchApplicants}
                disabled={isRefreshing}
                className="mt-5 min-h-[44px] rounded-xl border-slate-200 font-bold text-slate-700"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Cek Ulang Pelamar
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {applicants.map((item) => {
                const isItemSelected = item.status === "selected";
                const isItemRejected = item.status === "rejected";
                const isItemWithdrawn = item.status === "withdrawn";

                return (
                  <article
                    key={item.application_id}
                    className={`rounded-2xl border p-5 transition sm:p-6 ${
                      isItemSelected
                        ? "border-emerald-300 bg-emerald-50/50 shadow-sm"
                        : isItemRejected || isItemWithdrawn
                        ? "border-slate-100 bg-slate-50 opacity-70"
                        : "border-slate-100 bg-white shadow-sm hover:border-violet-100"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      {/* Helper Info */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 text-lg font-black text-[#0D47A1]">
                          {item.helper.foto_wajah_url ? (
                            <img
                              src={item.helper.foto_wajah_url}
                              alt={item.helper.full_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            item.helper.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {item.helper.full_name}
                            </h3>
                            {item.helper.tingkat_kepercayaan === "probation" ? (
                              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                                Probation
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                                <ShieldCheck className="h-3 w-3" />
                                Terverifikasi
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                            <span className="inline-flex items-center gap-1 text-amber-700">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                              {item.helper.rating_avg.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                              {item.helper.total_tugas_selesai} tugas
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {item.helper.jarak_km} km dari lansia
                            </span>
                          </div>

                          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            Melamar {formatRelativeTime(item.diajukan_at)}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-2 shrink-0 sm:mt-0">
                        {isItemSelected ? (
                          <div className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm">
                            <Check className="h-4 w-4" />
                            Helper Terpilih
                          </div>
                        ) : isItemRejected ? (
                          <span className="inline-flex min-h-[44px] items-center text-xs font-bold text-slate-400">
                            Tidak Terpilih
                          </span>
                        ) : isItemWithdrawn ? (
                          <span className="inline-flex min-h-[44px] items-center text-xs font-bold text-slate-400">
                            Dibatalkan oleh Helper
                          </span>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => setConfirmModalApplicant(item)}
                            disabled={selectingId !== null || isSelected}
                            className="min-h-[44px] w-full rounded-xl bg-violet-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800 sm:w-auto"
                          >
                            Pilih Helper Ini
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Confirmation Modal */}
        <ConfirmDialog
          open={Boolean(confirmModalApplicant)}
          onOpenChange={(open) => !open && !selectingId && setConfirmModalApplicant(null)}
          title="Konfirmasi Pilihan Helper"
          description={`Apakah Anda yakin ingin menugaskan ${confirmModalApplicant?.helper.full_name || "Helper ini"} untuk kunjungan pendampingan ini?`}
          confirmLabel="Terima & Pilih Helper"
          tone="primary"
          loading={selectingId !== null}
          onConfirm={() => {
            if (confirmModalApplicant) {
              void handleSelectApplicant(confirmModalApplicant);
            }
          }}
          icon={<User className="h-6 w-6 text-[#0D47A1]" aria-hidden="true" />}
        >
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
            Pelamar lain yang sedang menunggu akan ditolak secara otomatis dan status tugas akan dikonfirmasi.
          </div>
        </ConfirmDialog>
      </div>
    </main>
  );
}
