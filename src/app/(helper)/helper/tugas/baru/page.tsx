import React from "react";
import { redirect } from "next/navigation";

import { projectHelperTaskPrivacy } from "@/lib/helper/task-privacy";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import CariPekerjaanClient, { type JobData } from "./CariPekerjaanClient";

type RawJob = {
  id: string;
  helper_id: string | null;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  catatan: string | null;
  lansia_profiles: {
    id: string;
    nama: string;
    alamat: string;
    kelurahan: string | null;
    kecamatan: string | null;
    kabupaten_kota: string | null;
    lat: number | null;
    lng: number | null;
    catatan_kondisi: string | null;
  } | null;
  service_categories: {
    id: string;
    nama: string;
    deskripsi: string;
    estimasi_durasi_menit: number;
    tingkat: string;
    is_high_risk: boolean;
  } | null;
};

function getDistanceKm(
  originLat: number,
  originLng: number,
  targetLat: number,
  targetLng: number,
) {
  const radiusKm = 6371;
  const latitudeDelta = (targetLat - originLat) * (Math.PI / 180);
  const longitudeDelta = (targetLng - originLng) * (Math.PI / 180);
  const originLatitude = originLat * (Math.PI / 180);
  const targetLatitude = targetLat * (Math.PI / 180);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(targetLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return radiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function isCompleteJob(job: RawJob): job is RawJob & {
  lansia_profiles: NonNullable<RawJob["lansia_profiles"]>;
  service_categories: NonNullable<RawJob["service_categories"]>;
} {
  return Boolean(
    job.jadwal_waktu &&
      job.lansia_profiles?.id &&
      job.lansia_profiles.nama &&
      job.lansia_profiles.alamat &&
      Number.isFinite(Number(job.lansia_profiles.lat)) &&
      Number.isFinite(Number(job.lansia_profiles.lng)) &&
      job.service_categories?.id &&
      job.service_categories.nama &&
      job.service_categories.deskripsi &&
      job.service_categories.estimasi_durasi_menit > 0 &&
      job.service_categories.tingkat,
  );
}

export default async function CariPekerjaanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("helper_profiles")
    .select("id, status, domisili_lat, domisili_lng, radius_layanan_km")
    .eq("user_id", user.id)
    .maybeSingle();

  const radius = Number(profile?.radius_layanan_km);
  const originLat = Number(profile?.domisili_lat);
  const originLng = Number(profile?.domisili_lng);
  const canBrowse = profile?.status === "verified" && Number.isFinite(radius) && radius > 0;

  let jobs: JobData[] = [];
  let loadError = "";

  if (canBrowse && Number.isFinite(originLat) && Number.isFinite(originLng)) {
    const taskReader = await createAdminClient();
    const { data: taskRows, error: taskError } = await taskReader
      .from("tasks")
      .select(`
        id,
        helper_id,
        jadwal_waktu,
        harga_dasar,
        harga_final,
        catatan,
        lansia_profiles!inner ( id, nama, alamat, kelurahan, kecamatan, kabupaten_kota, lat, lng, catatan_kondisi ),
        service_categories!inner ( id, nama, deskripsi, estimasi_durasi_menit, tingkat, is_high_risk )
      `)
      .eq("status", "diajukan")
      .is("helper_id", null)
      .gt("expires_at", new Date().toISOString())
      .gte("jadwal_waktu", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (taskError) {
      loadError = "Daftar tugas belum bisa dimuat. Coba refresh setelah koneksi database siap.";
    } else {
      jobs = (taskRows as unknown as RawJob[])
        .filter(isCompleteJob)
        .map((job) => {
          const distanceKm = getDistanceKm(
            originLat,
            originLng,
            Number(job.lansia_profiles.lat),
            Number(job.lansia_profiles.lng),
          );
          const privacy = projectHelperTaskPrivacy({ helper_id: job.helper_id, catatan: job.catatan, lansia: job.lansia_profiles }, profile.id);

          return {
            id: job.id,
            jadwal_waktu: job.jadwal_waktu,
            harga_dasar: Number(job.harga_dasar),
            harga_final: Number(job.harga_final),
            lansia_nama: privacy.lansia_nama,
            lansia_alamat: privacy.lansia_alamat,
            catatan_tugas: privacy.catatan_tugas || "Detail catatan tersedia setelah tugas diterima.",
            catatan_kondisi: privacy.catatan_kondisi || "Detail kondisi tersedia setelah tugas diterima.",
            kategori_nama: job.service_categories.nama,
            kategori_deskripsi: job.service_categories.deskripsi,
            kategori_tingkat: job.service_categories.tingkat,
            estimasi_durasi_menit: job.service_categories.estimasi_durasi_menit,
            is_high_risk: job.service_categories.is_high_risk,
            distanceKm,
            distanceStr: `${distanceKm.toFixed(1)} km`,
          };
        })
        .filter((job) => job.distanceKm <= radius);
    }
  }

  return (
    <CariPekerjaanClient
      initialJobs={jobs}
      radius={Number.isFinite(radius) ? radius : 0}
      isVerified={profile?.status === "verified"}
      helperStatus={profile?.status}
      loadError={loadError}
    />
  );
}
