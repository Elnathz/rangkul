import { apiResponse, createApiError } from "@/lib/api-response";
import {
  selectEligibleCoordinatorCandidates,
  toPublicCoordinatorCandidate,
  type CoordinatorCandidate,
} from "@/lib/coordinator-region";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk mengakses data ini", 401);
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return createApiError("server_error", "Gagal memeriksa akses akun", 500);
    }

    if (!userProfile || userProfile.role !== "helper") {
      return createApiError("forbidden", "Hanya Helper yang dapat mencari Koordinator wilayah", 403);
    }

    const { searchParams } = new URL(request.url);
    const kelurahan = searchParams.get("kelurahan")?.trim() || "";
    const kecamatan = searchParams.get("kecamatan")?.trim() || "";
    const kota = searchParams.get("kota")?.trim() || searchParams.get("kabupaten_kota")?.trim() || "";
    const provinsi = searchParams.get("provinsi")?.trim() || "";
    const rt = Number(searchParams.get("rt"));
    const rw = Number(searchParams.get("rw"));

    if (!kelurahan || !kecamatan || !kota || !provinsi || !Number.isInteger(rt) || rt < 1 || !Number.isInteger(rw) || rw < 1) {
      return createApiError("validation_error", "Wilayah, RT, dan RW wajib diisi lengkap", 422);
    }

    const admin = await createAdminClient();
    const { data: coordinators, error } = await admin
      .from("koordinator_profiles")
      .select(`
        id,
        wilayah,
        tingkat,
        users!koordinator_profiles_user_id_fkey!inner(
          full_name,
          kelurahan,
          kecamatan,
          kabupaten_kota,
          provinsi,
          rt,
          rw
        )
      `)
      .eq("status", "verified")
      .ilike("users.kelurahan", kelurahan)
      .ilike("users.kecamatan", kecamatan)
      .ilike("users.kabupaten_kota", kota)
      .ilike("users.provinsi", provinsi)
      .eq("users.rw", rw);

    if (error) {
      return createApiError("server_error", "Gagal mencari koordinator wilayah", 500);
    }

    const region = { kelurahan, kecamatan, kabupaten_kota: kota, provinsi, rt, rw };
    const eligible = selectEligibleCoordinatorCandidates(
      (coordinators ?? []) as unknown as CoordinatorCandidate[],
      region,
    );

    return apiResponse(
      { koordinators: eligible.map(toPublicCoordinatorCandidate) },
      200,
    );
  } catch (error: unknown) {
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}
