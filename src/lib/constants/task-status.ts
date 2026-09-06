import { Database } from '@/types/database';
import { TASK_STATUS_PRESENTATION, type TaskStatusTone } from "@/lib/tasks/task-status-presentation";

export type TaskStatus = Database['public']['Enums']['task_status'];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = Object.fromEntries(
  Object.entries(TASK_STATUS_PRESENTATION).map(([status, presentation]) => [status, presentation.label]),
) as Record<TaskStatus, string>;

const STATUS_TONE_COLORS: Record<TaskStatusTone, string> = {
  neutral: "bg-slate-100 text-slate-800 border-slate-300",
  info: "bg-blue-100 text-blue-800 border-blue-300",
  warning: "bg-amber-100 text-amber-800 border-amber-300",
  success: "bg-emerald-100 text-emerald-800 border-emerald-300",
  danger: "bg-red-100 text-red-800 border-red-300",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = Object.fromEntries(
  Object.entries(TASK_STATUS_PRESENTATION).map(([status, presentation]) => [status, STATUS_TONE_COLORS[presentation.tone]]),
) as Record<TaskStatus, string>;

export const ALLOWED_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  diajukan: ['menunggu_persetujuan_koordinator', 'dikonfirmasi', 'dibatalkan'],
  menunggu_persetujuan_koordinator: ['dikonfirmasi', 'dibatalkan'],
  dikonfirmasi: ['dikerjakan', 'dibatalkan'],
  dikerjakan: ['menunggu_persetujuan_keluarga'],
  menunggu_persetujuan_keluarga: ['selesai', 'dibatalkan'],
  selesai: [],
  dibatalkan: [],
};
