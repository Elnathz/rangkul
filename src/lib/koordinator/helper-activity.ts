import type { TaskStatus } from '@/lib/constants/task-status';

export type HelperActivityStatus = 'sedang_bertugas' | 'memiliki_jadwal' | 'siap_menerima_tugas' | 'tidak_tersedia';

export type HelperActivityTask = {
  id: string;
  status: TaskStatus;
  jadwal_waktu: string;
  checkin_time: string | null;
  service_categories?: unknown;
};

export const ACTIVE_TASK_STATUSES: TaskStatus[] = [
  'menunggu_persetujuan_koordinator',
  'dikonfirmasi',
  'dikerjakan',
  'menunggu_persetujuan_keluarga',
];

const TASK_PRIORITY: Record<TaskStatus, number> = {
  dikerjakan: 4,
  menunggu_persetujuan_keluarga: 3,
  menunggu_persetujuan_koordinator: 2,
  dikonfirmasi: 1,
  diajukan: 0,
  selesai: 0,
  dibatalkan: 0,
};

export function selectCurrentTask(tasks: HelperActivityTask[]) {
  return [...tasks].sort((left, right) => {
    const priorityDifference = TASK_PRIORITY[right.status] - TASK_PRIORITY[left.status];
    return priorityDifference || new Date(left.jadwal_waktu).getTime() - new Date(right.jadwal_waktu).getTime();
  })[0] ?? null;
}

export function getHelperActivityStatus(task: HelperActivityTask | null, isAvailable: boolean): HelperActivityStatus {
  if (task?.status === 'dikerjakan') return 'sedang_bertugas';
  if (task) return 'memiliki_jadwal';
  return isAvailable ? 'siap_menerima_tugas' : 'tidak_tersedia';
}
