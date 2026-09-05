import { Database } from "@/types/database";

export type TaskAssignmentMode =
  Database["public"]["Enums"]["task_assignment_mode"];

export type TaskApplicationStatus =
  | "pending"
  | "selected"
  | "withdrawn"
  | "rejected"
  | "expired";

export type MarketplaceTask = {
  task_id: string;
  mode_penugasan: TaskAssignmentMode;
  kategori: {
    id: string;
    nama: string;
    estimasi_durasi_menit: number;
  };
  jadwal_waktu: string;
  harga_dasar: number;
  lokasi_ringkas: {
    kelurahan: string;
    kecamatan: string;
    jarak_km: number;
  };
  expires_at: string | null;
  application_status: TaskApplicationStatus | null;
};

export type PublicApplicant = {
  application_id: string;
  status: TaskApplicationStatus;
  diajukan_at: string;
  helper: {
    id: string;
    full_name: string;
    foto_wajah_url: string | null;
    rating_avg: number;
    total_tugas_selesai: number;
    tingkat_kepercayaan: "probation" | "terpercaya";
    sumber_verifikasi: "koordinator" | "admin_fallback";
    jarak_km: number;
  };
};

export function isTaskAssignmentMode(value: string): value is TaskAssignmentMode {
  return value === "langsung" || value === "pelamar" || value === "cepat";
}
