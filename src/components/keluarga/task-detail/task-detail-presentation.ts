import type { TaskStatus } from "../../../lib/constants/task-status.ts";

export type TaskDetailStepId =
  | "submitted"
  | "choose_helper"
  | "coordinator_review"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TaskDetailStepState = "complete" | "current" | "upcoming" | "cancelled";

export type TaskDetailStep = {
  id: TaskDetailStepId;
  label: string;
  state: TaskDetailStepState;
};

export type TaskDetailPrimaryActionKind = "applicants" | "history";

export type TaskDetailPresentation = {
  label: string;
  headline: string;
  explanation: string;
  supportingText: string | null;
  tone: "brand" | "warning" | "live" | "success" | "danger";
  currentStep: TaskDetailStepId;
  steps: TaskDetailStep[];
  primaryAction: { kind: TaskDetailPrimaryActionKind; label: string } | null;
  showScheduleEditor: boolean;
  showCancel: boolean;
  showContactHelper: boolean;
  showReport: boolean;
  showCancellationSummary: boolean;
  outcomeFirst: boolean;
};

export type PaymentPresentation = {
  label: string;
  description: string;
  actionLabel: string | null;
  tone: "muted" | "warning" | "success" | "danger";
};

export function formatPaymentDeadline(jadwalWaktu?: string | null) {
  if (!jadwalWaktu) return null;
  const timestamp = Date.parse(jadwalWaktu);
  if (!Number.isFinite(timestamp)) return null;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

const PAYMENT_ELIGIBLE_TASK_STATUSES: TaskStatus[] = ["dikonfirmasi", "dikerjakan", "selesai"];

function paymentDeadlineHasPassed(jadwalWaktu?: string | null) {
  if (!jadwalWaktu) return false;
  const timestamp = Date.parse(jadwalWaktu);
  return Number.isFinite(timestamp) && timestamp <= Date.now();
}

export function paymentRequiresCompletion(
  paymentStatus: string | null | undefined,
  taskStatus: TaskStatus,
  jadwalWaktu?: string | null,
) {
  const hasOutstandingPayment = paymentStatus === "pending"
    || (!paymentStatus && PAYMENT_ELIGIBLE_TASK_STATUSES.includes(taskStatus));

  return hasOutstandingPayment && !paymentDeadlineHasPassed(jadwalWaktu);
}

type PresentationInput = {
  status: TaskStatus;
  modePenugasan: string | null | undefined;
  isHighRisk: boolean;
  applicantCount: number;
  hasHelper: boolean;
  confirmedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

const STANDARD_STEPS: Array<{ id: TaskDetailStepId; label: string }> = [
  { id: "submitted", label: "Diajukan" },
  { id: "confirmed", label: "Dikonfirmasi" },
  { id: "in_progress", label: "Dikerjakan" },
  { id: "completed", label: "Selesai" },
];

function getStepTemplate(input: PresentationInput) {
  if (input.isHighRisk || input.status === "menunggu_persetujuan_koordinator") {
    return [
      STANDARD_STEPS[0],
      { id: "coordinator_review" as const, label: "Persetujuan" },
      ...STANDARD_STEPS.slice(1),
    ];
  }

  if (input.modePenugasan === "pelamar") {
    return [
      STANDARD_STEPS[0],
      { id: "choose_helper" as const, label: "Pilih Helper" },
      ...STANDARD_STEPS.slice(1),
    ];
  }

  return STANDARD_STEPS;
}

function resolveCurrentStep(input: PresentationInput): TaskDetailStepId {
  if (input.status === "menunggu_persetujuan_koordinator") return "coordinator_review";
  if (input.status === "dikonfirmasi") return "confirmed";
  if (input.status === "dikerjakan" || input.status === "menunggu_persetujuan_keluarga") return "in_progress";
  if (input.status === "selesai") return "completed";
  if (input.status === "dibatalkan") return "cancelled";
  return "submitted";
}

function getLifecycleSteps(input: PresentationInput): TaskDetailStep[] {
  const template = getStepTemplate(input);
  const currentStep = resolveCurrentStep(input);

  if (currentStep === "cancelled") {
    const lastMilestone: TaskDetailStepId = input.completedAt
      ? "completed"
      : input.startedAt
        ? "in_progress"
        : input.confirmedAt
          ? "confirmed"
          : "submitted";
    const historicalRank = template.findIndex((step) => step.id === lastMilestone);
    const steps = template.map((step, index) => ({
      ...step,
      state: (index <= historicalRank ? "complete" : "upcoming") as TaskDetailStepState,
    }));
    return [...steps, { id: "cancelled", label: "Dibatalkan", state: "cancelled" }];
  }

  const currentIndex = template.findIndex((step) => step.id === currentStep);
  return template.map((step, index) => ({
    ...step,
    state: index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming",
  }));
}

function applicantLabel(count: number) {
  return count > 0 ? `Lihat ${count} Pelamar` : "Lihat Pelamar";
}

export function getTaskDetailPresentation(input: PresentationInput): TaskDetailPresentation {
  const base = {
    currentStep: resolveCurrentStep(input),
    steps: getLifecycleSteps(input),
    showScheduleEditor: input.status === "diajukan" || input.status === "dikonfirmasi",
    showCancel: ["diajukan", "menunggu_persetujuan_koordinator", "dikonfirmasi"].includes(input.status),
    showContactHelper: input.hasHelper && ["menunggu_persetujuan_koordinator", "dikonfirmasi", "dikerjakan", "menunggu_persetujuan_keluarga"].includes(input.status),
    showReport: input.status === "selesai",
    showCancellationSummary: input.status === "dibatalkan",
    outcomeFirst: input.status === "selesai" || input.status === "dibatalkan",
  };

  if (input.status === "menunggu_persetujuan_koordinator") {
    return {
      ...base,
      label: "Menunggu persetujuan Koordinator",
      headline: "Koordinator sedang meninjau kunjungan",
      explanation: "Koordinator wilayah sedang meninjau kebutuhan dan kesiapan kunjungan ini.",
      supportingText: "Saat ini Anda tidak perlu melakukan tindakan. Jadwal dapat diubah setelah keputusan diberikan.",
      tone: "warning",
      primaryAction: null,
    };
  }

  if (input.status === "diajukan" && input.modePenugasan === "pelamar") {
    const hasApplicants = input.applicantCount > 0;
    return {
      ...base,
      label: "Pilih Helper",
      headline: hasApplicants ? `${input.applicantCount} Helper telah mengajukan diri` : "Belum ada Helper yang mengajukan diri",
      explanation: hasApplicants
        ? "Bandingkan profil, jarak layanan, dan tingkat kepercayaan sebelum memilih Helper."
        : "Kunjungan tetap terbuka bagi Helper yang sesuai dengan layanan dan lokasi.",
      supportingText: hasApplicants ? "Pilih Helper yang paling sesuai dengan kebutuhan orang tersayang." : null,
      tone: "brand",
      primaryAction: { kind: "applicants", label: applicantLabel(input.applicantCount) },
    };
  }

  if (input.status === "diajukan") {
    return {
      ...base,
      label: input.modePenugasan === "cepat" ? "Mencari Helper terdekat" : "Kunjungan diajukan",
      headline: input.modePenugasan === "cepat" ? "Rangkul sedang mencari Helper yang sesuai" : "Kunjungan menunggu Helper",
      explanation: "Pencarian mempertimbangkan layanan, ketersediaan, jadwal, dan jangkauan Helper.",
      supportingText: "Anda dapat mengubah jadwal atau membatalkan kunjungan sebelum Helper ditetapkan.",
      tone: "brand",
      primaryAction: null,
    };
  }

  if (input.status === "dikonfirmasi") {
    return {
      ...base,
      label: "Kunjungan terjadwal",
      headline: "Helper telah ditetapkan",
      explanation: "Kunjungan siap dilaksanakan sesuai jadwal dan lokasi yang tercatat.",
      supportingText: "Periksa kembali jadwal dan hubungi Helper bila ada informasi penting.",
      tone: "brand",
      primaryAction: null,
    };
  }

  if (input.status === "dikerjakan") {
    return {
      ...base,
      label: "Sedang berlangsung",
      headline: "Pendampingan sedang berjalan",
      explanation: "Helper sedang mendampingi orang tersayang sesuai layanan yang dipilih.",
      supportingText: "Kunjungan tidak dapat dibatalkan atau dijadwalkan ulang setelah dimulai.",
      tone: "live",
      primaryAction: null,
    };
  }

  if (input.status === "menunggu_persetujuan_keluarga") {
    return {
      ...base,
      label: "Keputusan Anda diperlukan",
      headline: "Tinjau perubahan layanan",
      explanation: "Helper mengirimkan layanan tambahan yang perlu Anda setujui atau tolak.",
      supportingText: "Total kunjungan hanya berubah setelah layanan tambahan disetujui.",
      tone: "warning",
      primaryAction: null,
    };
  }

  if (input.status === "selesai") {
    return {
      ...base,
      label: "Kunjungan selesai",
      headline: "Laporan Helper telah tersedia",
      explanation: "Baca catatan kunjungan, Health Snapshot, dan cerita hari ini dari Helper.",
      supportingText: "Riwayat ini tersimpan pada profil lansia untuk membantu keluarga mengikuti perubahan dari waktu ke waktu.",
      tone: "success",
      primaryAction: { kind: "history", label: "Buka Riwayat Rangkul" },
    };
  }

  return {
    ...base,
    label: "Kunjungan dibatalkan",
    headline: "Kunjungan telah dipindahkan ke riwayat",
    explanation: "Jadwal ini tidak lagi aktif. Alasan pembatalan dan status pembayaran tetap dapat diperiksa.",
    supportingText: null,
    tone: "danger",
    primaryAction: null,
  };
}

export function shortTaskReference(taskId: string) {
  return `#${taskId.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export function sanitizeUserFacingText(value: string | null | undefined) {
  if (!value) return "";
  return value
    .replace(/\[(?:DEMO_MATRIX|DEMO_SPRINT6)\]/gi, "")
    .replace(/\btask\b/gi, "Kunjungan")
    .replace(/\s+/g, " ")
    .trim();
}

export function getHealthScorePresentation(score: number) {
  const normalized = Math.max(1, Math.min(5, Number(score) || 1));
  const label = normalized <= 2 ? "Perlu perhatian" : normalized === 3 ? "Perlu dipantau" : "Terpantau baik";
  return { score: `${normalized}/5`, label };
}

export function getPaymentPresentation(
  paymentStatus: string | null | undefined,
  taskStatus: TaskStatus,
  jadwalWaktu?: string | null,
): PaymentPresentation {
  const hasOutstandingPayment = paymentStatus === "pending"
    || (!paymentStatus && PAYMENT_ELIGIBLE_TASK_STATUSES.includes(taskStatus));

  if (hasOutstandingPayment && paymentDeadlineHasPassed(jadwalWaktu)) {
    const isConfirmedBeforeStart = taskStatus === "dikonfirmasi";
    return {
      label: "Batas pembayaran telah lewat",
      description: isConfirmedBeforeStart
        ? "Jadwal kunjungan telah lewat sebelum pembayaran diterima. Sistem akan membatalkan kunjungan ini secara otomatis."
        : "Jadwal kunjungan sudah lewat dan pembayaran belum tercatat. Status kunjungan perlu ditinjau oleh tim Rangkul.",
      actionLabel: null,
      tone: "danger",
    };
  }

  if (!paymentStatus) {
    if (taskStatus === "dibatalkan") {
      return {
        label: "Tidak ada pembayaran untuk dikembalikan",
        description: "Kunjungan dibatalkan sebelum pembayaran dicatat.",
        actionLabel: null,
        tone: "muted",
      };
    }

    if (taskStatus === "menunggu_persetujuan_keluarga") {
      return {
        label: "Menunggu keputusan layanan",
        description: "Total pembayaran baru dapat diproses setelah keputusan layanan tambahan selesai.",
        actionLabel: null,
        tone: "muted",
      };
    }

    if (PAYMENT_ELIGIBLE_TASK_STATUSES.includes(taskStatus)) {
      return {
        label: "Pembayaran perlu diselesaikan",
        description: "Selesaikan pembayaran untuk mengamankan Kunjungan sesuai jadwal.",
        actionLabel: "Bayar kunjungan",
        tone: "warning",
      };
    }

    return {
      label: "Belum perlu dibayar",
      description: "Pembayaran tersedia setelah Kunjungan dikonfirmasi.",
      actionLabel: null,
      tone: "muted",
    };
  }

  const known: Record<string, PaymentPresentation> = {
    pending: {
      label: "Selesaikan pembayaran",
      description: "Pembayaran sudah dibuat. Lanjutkan agar Kunjungan dapat diproses sesuai ketentuan.",
      actionLabel: "Lanjutkan pembayaran",
      tone: "warning",
    },
    held_escrow: {
      label: "Pembayaran diterima",
      description: "Pembayaran tercatat. Dana akan diteruskan setelah Kunjungan selesai sesuai proses platform.",
      actionLabel: "Lihat pembayaran",
      tone: "success",
    },
    released: {
      label: "Pembayaran selesai",
      description: "Pembayaran untuk Kunjungan ini telah diselesaikan.",
      actionLabel: "Lihat pembayaran",
      tone: "success",
    },
    refunded: {
      label: "Dana telah dikembalikan",
      description: "Pengembalian pembayaran untuk Kunjungan ini telah selesai.",
      actionLabel: "Lihat pembayaran",
      tone: "success",
    },
    disputed: {
      label: "Pembayaran sedang ditinjau",
      description: "Pembayaran sedang melalui peninjauan. Anda akan mendapat pembaruan setelah ada keputusan.",
      actionLabel: "Lihat pembayaran",
      tone: "warning",
    },
    dibatalkan_kompensasi: {
      label: "Pembatalan dengan kompensasi",
      description: "Pembatalan Kunjungan ini diproses mengikuti ketentuan kompensasi yang tercatat.",
      actionLabel: "Lihat pembayaran",
      tone: "danger",
    },
  };

  return known[paymentStatus] ?? {
    label: "Status pembayaran tersedia",
    description: "Buka rincian pembayaran untuk melihat pembaruan terbaru.",
    actionLabel: "Lihat pembayaran",
    tone: "muted",
  };
}
