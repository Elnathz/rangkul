import { MarketplaceTask } from "./assignment-types";

export type RawMarketplaceRow = {
  task_id: string;
  mode_penugasan: string;
  kategori_id: string;
  kategori_nama: string;
  estimasi_durasi_menit: number;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number | null;
  kelurahan: string;
  kecamatan: string;
  jarak_km: number;
  expires_at: string | null;
  application_status?: string | null;
};

export function mapMarketplaceRow(row: RawMarketplaceRow): MarketplaceTask {
  return {
    task_id: row.task_id,
    mode_penugasan:
      row.mode_penugasan === "pelamar" || row.mode_penugasan === "cepat"
        ? row.mode_penugasan
        : "langsung",
    kategori: {
      id: row.kategori_id,
      nama: row.kategori_nama,
      estimasi_durasi_menit: row.estimasi_durasi_menit,
    },
    jadwal_waktu: row.jadwal_waktu,
    harga_dasar: Number(row.harga_dasar),
    lokasi_ringkas: {
      kelurahan: row.kelurahan,
      kecamatan: row.kecamatan,
      jarak_km: Number(row.jarak_km),
    },
    expires_at: row.expires_at,
    application_status: (row.application_status as MarketplaceTask["application_status"]) ?? null,
  };
}

export function mapMarketplaceRows(rows: RawMarketplaceRow[]): MarketplaceTask[] {
  return rows.map(mapMarketplaceRow);
}

export function formatJarak(km: number): string {
  const rounded = Math.round(km * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} km`;
}

export function isTaskExpired(task: MarketplaceTask): boolean {
  if (!task.expires_at) return false;
  return new Date(task.expires_at).getTime() <= Date.now();
}
