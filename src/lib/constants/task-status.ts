import { Database } from '@/types/database';

export type TaskStatus = Database['public']['Enums']['task_status'];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  diajukan: 'Diajukan',
  menunggu_persetujuan_koordinator: 'Menunggu Approval Koordinator',
  dikonfirmasi: 'Dikonfirmasi',
  dikerjakan: 'Sedang Dikerjakan',
  menunggu_persetujuan_keluarga: 'Menunggu Approval Keluarga',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  diajukan: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  menunggu_persetujuan_koordinator: 'bg-amber-100 text-amber-800 border-amber-300',
  dikonfirmasi: 'bg-blue-100 text-blue-800 border-blue-300',
  dikerjakan: 'bg-purple-100 text-purple-800 border-purple-300',
  menunggu_persetujuan_keluarga: 'bg-orange-100 text-orange-800 border-orange-300',
  selesai: 'bg-green-100 text-green-800 border-green-300',
  dibatalkan: 'bg-red-100 text-red-800 border-red-300',
};

export const ALLOWED_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  diajukan: ['menunggu_persetujuan_koordinator', 'dikonfirmasi', 'dibatalkan'],
  menunggu_persetujuan_koordinator: ['dikonfirmasi', 'dibatalkan'],
  dikonfirmasi: ['dikerjakan', 'dibatalkan'],
  dikerjakan: ['menunggu_persetujuan_keluarga', 'dibatalkan'],
  menunggu_persetujuan_keluarga: ['selesai', 'dibatalkan'],
  selesai: [],
  dibatalkan: [],
};
