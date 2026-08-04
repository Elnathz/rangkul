/**
 * Task status constants based on TDD §3.1-3.2
 */
export type TaskStatus =
  | 'tersedia'
  | 'dipesan'
  | 'diterima'
  | 'dikerjakan'
  | 'selesai_dikerjakan'
  | 'diverifikasi_lansia'
  | 'diverifikasi_keluarga'
  | 'selesai'
  | 'dibatalkan'
  | 'kadaluarsa'
  | 'ditolak';

export const TASK_STATUS: Record<string, TaskStatus> = {
  TERSEDIA: 'tersedia',
  DIPESAN: 'dipesan',
  DITERIMA: 'diterima',
  DIKERJAKAN: 'dikerjakan',
  SELESAI_DIKERJAKAN: 'selesai_dikerjakan',
  DIVERIFIKASI_LANSIA: 'diverifikasi_lansia',
  DIVERIFIKASI_KELUARGA: 'diverifikasi_keluarga',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan',
  KADALUARSA: 'kadaluarsa',
  DITOLAK: 'ditolak',
};