"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ExtraServiceApprovalCard } from "@/components/keluarga/ExtraServiceApprovalCard";
import { TaskScheduleActions } from "@/components/keluarga/TaskScheduleActions";
import QuickMatchStatus from "@/components/keluarga/booking/QuickMatchStatus";
import { CancellationSummary } from "@/components/keluarga/task-detail/CancellationSummary";
import { CompletionReportSection } from "@/components/keluarga/task-detail/CompletionReportSection";
import { PaymentSummary } from "@/components/keluarga/task-detail/PaymentSummary";
import { PaymentPriorityNotice } from "@/components/keluarga/task-detail/PaymentPriorityNotice";
import { ScheduleLocationSection } from "@/components/keluarga/task-detail/ScheduleLocationSection";
import { TaskContextRail } from "@/components/keluarga/task-detail/TaskContextRail";
import { TaskDetailHeader } from "@/components/keluarga/task-detail/TaskDetailHeader";
import { TaskLifecycleStepper } from "@/components/keluarga/task-detail/TaskLifecycleStepper";
import { TaskNextActionPanel } from "@/components/keluarga/task-detail/TaskNextActionPanel";
import {
  getPaymentPresentation,
  getTaskDetailPresentation,
  paymentRequiresCompletion,
  sanitizeUserFacingText,
  shortTaskReference,
} from "@/components/keluarga/task-detail/task-detail-presentation";
import type { TaskStatus } from "@/lib/constants/task-status";

type ExtraServiceStatus = "menunggu_persetujuan_keluarga" | "disetujui" | "ditolak";
type ExtraService = {
  id: string;
  nama_layanan: string;
  biaya: number;
  status: ExtraServiceStatus;
};

export type RealTaskDetail = {
  id: string;
  status: TaskStatus;
  lansia_id: string;
  jadwal_waktu: string;
  jadwal_waktu_asli: string | null;
  created_at: string;
  confirmed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  harga_dasar: number;
  harga_final: number;
  catatan: string | null;
  mode_penugasan?: string | null;
  expires_at?: string | null;
  applicant_count: number;
  lansia: {
    nama: string;
    alamat: string;
    lat: number | null;
    lng: number | null;
    foto_url: string | null;
    catatan_kondisi: string | null;
    umur: number | null;
    tingkat_mobilitas: string | null;
  };
  category: {
    nama: string;
    deskripsi: string;
    estimasi_durasi_menit: number;
    is_high_risk: boolean;
  };
  helper: {
    id: string;
    user_id: string;
    foto_wajah_url: string | null;
    rating_avg: number;
    total_tugas_selesai: number;
    users: { full_name: string } | { full_name: string }[] | null;
  } | null;
  extraServices: ExtraService[];
  evidence: {
    foto_bukti_url: string | null;
    catatan_kondisi: string;
    created_at: string;
  } | null;
  payment: {
    status: string;
    payment_method: string | null;
    jumlah_total: number;
    held_at: string | null;
    released_at: string | null;
  } | null;
  healthSnapshot: {
    energi: number;
    mobilitas: number;
    mood: number;
    nafsu_makan: number;
    kualitas_tidur: number;
    cerita_hari_ini: string | null;
    created_at: string;
  } | null;
};

type HelperDetail = NonNullable<RealTaskDetail["helper"]>;

function getUserName(users: HelperDetail["users"]) {
  if (!users) return "Helper";
  return Array.isArray(users) ? users[0]?.full_name || "Helper" : users.full_name;
}

function getMapUrl(lansia: RealTaskDetail["lansia"]) {
  if (lansia.lat == null || lansia.lng == null) return null;
  return `https://www.google.com/maps/search/?api=1&query=${lansia.lat},${lansia.lng}`;
}

function formatScheduleSummary(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function ExtraServiceHistory({ services }: { services: ExtraService[] }) {
  if (services.length === 0) return null;
  return (
    <section className="rounded-[18px] border border-border bg-surface p-4 sm:p-5" aria-labelledby="extra-service-history-title">
      <h2 id="extra-service-history-title" className="font-display text-base font-extrabold text-ink">Riwayat layanan tambahan</h2>
      <div className="mt-3 grid gap-2">
        {services.map((service) => (
          <div key={service.id} className="flex min-h-14 items-center justify-between gap-4 rounded-[14px] bg-[var(--surface-subtle)] px-3 py-2.5 text-sm">
            <div>
              <p className="font-bold text-ink">{service.nama_layanan}</p>
              <p className={`mt-0.5 text-xs font-semibold ${service.status === "disetujui" ? "text-emerald-700" : "text-red-700"}`}>
                {service.status === "disetujui" ? "Disetujui" : "Ditolak"}
              </p>
            </div>
            <p className="shrink-0 font-extrabold text-ink">Rp {service.biaya.toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RealTaskDetailClient({ task }: { task: RealTaskDetail }) {
  const router = useRouter();

  React.useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 10_000);
    return () => window.clearInterval(interval);
  }, [router]);

  const helperName = task.helper ? getUserName(task.helper.users) : null;
  const note = sanitizeUserFacingText(task.catatan);
  const evidence = task.evidence ? {
    ...task.evidence,
    catatan_kondisi: sanitizeUserFacingText(task.evidence.catatan_kondisi),
  } : null;
  const snapshot = task.healthSnapshot ? {
    ...task.healthSnapshot,
    cerita_hari_ini: sanitizeUserFacingText(task.healthSnapshot.cerita_hari_ini) || null,
  } : null;
  const presentation = getTaskDetailPresentation({
    status: task.status,
    modePenugasan: task.mode_penugasan,
    isHighRisk: task.category.is_high_risk,
    applicantCount: task.applicant_count,
    hasHelper: Boolean(task.helper),
    confirmedAt: task.confirmed_at,
    startedAt: task.started_at,
    completedAt: task.completed_at,
  });
  const pendingServices = task.extraServices.filter((service) => service.status === "menunggu_persetujuan_keluarga");
  const decidedServices = task.extraServices.filter((service) => service.status !== "menunggu_persetujuan_keluarga");
  const approvedServices = task.extraServices.filter((service) => service.status === "disetujui");
  const paymentPresentation = getPaymentPresentation(task.payment?.status, task.status, task.jadwal_waktu);
  const paymentNeedsAction = paymentRequiresCompletion(task.payment?.status, task.status, task.jadwal_waktu);
  const headerPresentation = paymentNeedsAction || paymentPresentation.tone === "danger"
    ? {
        ...presentation,
        label: paymentPresentation.label,
        tone: paymentPresentation.tone === "danger" ? "danger" as const : "warning" as const,
      }
    : presentation;
  const archived = task.status === "dibatalkan";
  const scheduleForDisplay = archived && task.jadwal_waktu_asli ? task.jadwal_waktu_asli : task.jadwal_waktu;
  const contextRail = (
    <TaskContextRail
      taskId={task.id}
      lansia={{
        id: task.lansia_id,
        nama: task.lansia.nama,
        alamat: task.lansia.alamat,
        fotoUrl: task.lansia.foto_url,
        umur: task.lansia.umur,
        tingkatMobilitas: task.lansia.tingkat_mobilitas,
      }}
      helper={task.helper && helperName ? {
        name: helperName,
        photoUrl: task.helper.foto_wajah_url,
        rating: Number(task.helper.rating_avg),
        completedTasks: Number(task.helper.total_tugas_selesai),
      } : null}
      showContactHelper={presentation.showContactHelper}
      paymentStatus={task.payment?.status}
      taskStatus={task.status}
      jadwalWaktu={task.jadwal_waktu}
    />
  );

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[var(--app-bg)] px-4 py-5 pb-28 sm:px-6 sm:py-7 lg:px-8 lg:pb-10">
      <div className="mx-auto max-w-[1220px]">
        <article className="overflow-hidden rounded-[24px] border border-border bg-surface shadow-[0_14px_40px_rgba(22,35,58,0.08)]">
          <TaskDetailHeader
            taskId={task.id}
            title={task.category.nama}
            lansiaName={task.lansia.nama}
            total={Number(task.harga_final)}
            categoryDescription={sanitizeUserFacingText(task.category.deskripsi)}
            presentation={headerPresentation}
            taskReference={shortTaskReference(task.id)}
          />
  <PaymentPriorityNotice
    taskId={task.id}
    paymentStatus={task.payment?.status}
    taskStatus={task.status}
    jadwalWaktu={task.jadwal_waktu}
  />
          <TaskLifecycleStepper steps={presentation.steps} />

          <div className="space-y-5 p-4 sm:p-6 lg:p-7">
            <TaskNextActionPanel
              presentation={presentation}
              taskId={task.id}
              lansiaId={task.lansia_id}
              scheduleSummary={!presentation.outcomeFirst ? formatScheduleSummary(task.jadwal_waktu) : undefined}
            />

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-6">
              <div className="order-1 space-y-5">
                {presentation.showCancellationSummary ? (
                  <CancellationSummary
                    cancellationReason={sanitizeUserFacingText(task.cancellation_reason)}
                    cancelledAt={task.cancelled_at}
                    paymentStatus={task.payment?.status}
                    finalPrice={Number(task.harga_final)}
                  />
                ) : null}

                {presentation.showReport ? (
                  <CompletionReportSection
                    helperName={helperName}
                    evidence={evidence}
                    snapshot={snapshot}
                  />
                ) : null}

                {!presentation.outcomeFirst && task.mode_penugasan === "cepat" && task.status === "diajukan" ? (
                  <QuickMatchStatus
                    status={task.status}
                    expiresAt={task.expires_at || null}
                    helperInfo={task.helper ? { full_name: helperName || "Helper" } : null}
                    onRefresh={() => router.refresh()}
                  />
                ) : null}

                {!presentation.outcomeFirst ? (
                  <ScheduleLocationSection
                    schedule={scheduleForDisplay}
                    durationMinutes={task.category.estimasi_durasi_menit}
                    address={task.lansia.alamat}
                    mapUrl={getMapUrl(task.lansia)}
                    note={note}
                  />
                ) : null}

                {pendingServices.map((service) => (
                  <ExtraServiceApprovalCard key={service.id} taskId={task.id} service={service} />
                ))}

                {!presentation.outcomeFirst && (presentation.showScheduleEditor || presentation.showCancel) ? (
                  <TaskScheduleActions taskId={task.id} status={task.status} jadwalWaktu={task.jadwal_waktu} />
                ) : null}

                <ExtraServiceHistory services={decidedServices} />

                {presentation.outcomeFirst ? (
                  <ScheduleLocationSection
                    schedule={scheduleForDisplay}
                    durationMinutes={task.category.estimasi_durasi_menit}
                    address={task.lansia.alamat}
                    mapUrl={getMapUrl(task.lansia)}
                    note={note}
                    archived={archived}
                  />
                ) : null}

                {!archived ? (
                  <PaymentSummary
                    taskId={task.id}
                    basePrice={Number(task.harga_dasar)}
                    finalPrice={Number(task.harga_final)}
                    approvedServices={approvedServices}
                    paymentStatus={task.payment?.status}
                    taskStatus={task.status}
                    jadwalWaktu={task.jadwal_waktu}
                  />
                ) : null}
              </div>

              <div className="order-2">
                {contextRail}
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
