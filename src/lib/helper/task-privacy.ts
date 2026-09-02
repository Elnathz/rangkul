type TaskPrivacyLansia = {
  nama: string;
  alamat: string;
  kelurahan?: string | null;
  kecamatan?: string | null;
  kabupaten_kota?: string | null;
  foto_url?: string | null;
  catatan_kondisi?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type TaskPrivacySource = {
  helper_id: string | null;
  catatan?: string | null;
  lansia: TaskPrivacyLansia;
};

export type HelperTaskPrivacyProjection = {
  assigned: boolean;
  lansia_nama: string;
  lansia_alamat: string;
  lansia_foto_url: string | null;
  catatan_kondisi: string | null;
  catatan_tugas: string | null;
  lat: number | null;
  lng: number | null;
};

function publicRegion(lansia: TaskPrivacyLansia) {
  return [lansia.kelurahan, lansia.kecamatan, lansia.kabupaten_kota]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(", ") || "Wilayah tersedia";
}

export function projectHelperTaskPrivacy(
  task: TaskPrivacySource,
  helperId: string,
): HelperTaskPrivacyProjection {
  const assigned = task.helper_id === helperId;

  if (!assigned) {
    return {
      assigned: false,
      lansia_nama: "Penerima layanan",
      lansia_alamat: publicRegion(task.lansia),
      lansia_foto_url: null,
      catatan_kondisi: null,
      catatan_tugas: null,
      lat: null,
      lng: null,
    };
  }

  return {
    assigned: true,
    lansia_nama: task.lansia.nama,
    lansia_alamat: task.lansia.alamat,
    lansia_foto_url: task.lansia.foto_url ?? null,
    catatan_kondisi: task.lansia.catatan_kondisi ?? null,
    catatan_tugas: task.catatan ?? null,
    lat: task.lansia.lat ?? null,
    lng: task.lansia.lng ?? null,
  };
}
