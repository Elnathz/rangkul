import type { TaskStatus } from "@/lib/constants/task-status";
import type { AppRole } from "@/lib/navigation/role-navigation";

export type TaskAction =
  | "accept"
  | "cancel"
  | "confirm_completion"
  | "review"
  | "reschedule"
  | "start"
  | "submit_report";

export type TaskStatusTone = "neutral" | "info" | "warning" | "success" | "danger";

export type TaskStatusPresentation = {
  label: string;
  description: string;
  tone: TaskStatusTone;
  actions: Partial<Record<AppRole, readonly TaskAction[]>>;
};

export const TASK_STATUS_PRESENTATION: Record<TaskStatus, TaskStatusPresentation> = {
  diajukan: {
    label: "Diajukan",
    description: "Kunjungan menunggu respons Helper atau proses persetujuan.",
    tone: "warning",
    actions: { keluarga: ["cancel", "reschedule"], helper: ["accept"] },
  },
  menunggu_persetujuan_koordinator: {
    label: "Menunggu persetujuan Koordinator",
    description: "Kunjungan memerlukan peninjauan Koordinator sebelum dapat dimulai.",
    tone: "warning",
    actions: { keluarga: ["cancel"], koordinator: ["review"] },
  },
  dikonfirmasi: {
    label: "Dikonfirmasi",
    description: "Helper telah ditetapkan dan kunjungan siap dilaksanakan sesuai jadwal.",
    tone: "info",
    actions: { keluarga: ["cancel", "reschedule"], helper: ["start"] },
  },
  dikerjakan: {
    label: "Sedang dikerjakan",
    description: "Kunjungan sedang berlangsung dan tidak dapat dibatalkan dari aplikasi.",
    tone: "info",
    actions: { helper: ["submit_report"] },
  },
  menunggu_persetujuan_keluarga: {
    label: "Menunggu konfirmasi Keluarga",
    description: "Laporan kunjungan telah dikirim dan menunggu konfirmasi Keluarga.",
    tone: "warning",
    actions: { keluarga: ["confirm_completion"] },
  },
  selesai: {
    label: "Selesai",
    description: "Kunjungan telah selesai dan riwayatnya dapat dilihat.",
    tone: "success",
    actions: {},
  },
  dibatalkan: {
    label: "Dibatalkan",
    description: "Kunjungan telah dibatalkan sesuai aturan pembatalan Rangkul.",
    tone: "danger",
    actions: {},
  },
};

export function getTaskStatusPresentation(status: TaskStatus) {
  return TASK_STATUS_PRESENTATION[status];
}

export function canRolePerformTaskAction(
  status: TaskStatus,
  role: AppRole,
  action: TaskAction,
) {
  return TASK_STATUS_PRESENTATION[status].actions[role]?.includes(action) ?? false;
}
