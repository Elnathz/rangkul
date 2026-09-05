import { apiResponse, createApiError } from "@/lib/api-response";
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

    const { searchParams } = new URL(request.url);
    const kelurahan = searchParams.get("kelurahan")?.trim() || "";
    const kecamatan = searchParams.get("kecamatan")?.trim() || "";
    const kota = searchParams.get("kota")?.trim() || searchParams.get("kabupaten_kota")?.trim() || "";
    const provinsi = searchParams.get("provinsi")?.trim() || "";

    if (!kelurahan) {
      return apiResponse({ koordinators: [] }, 200);
    }

    // Menggunakan fileReader / admin client agar pembacaan nama & wilayah koordinator terverifikasi
    // tidak terblokir RLS saat diakses calon Helper di tahap registrasi.
    const admin = await createAdminClient();
    let query = admin
      .from("koordinator_profiles")
      .select(`
        id,
        wilayah,
        tingkat,
        users!koordinator_profiles_user_id_fkey!inner(full_name)
      `)
      .eq("status", "verified");

    for (const part of [kelurahan, kecamatan, kota, provinsi].filter(Boolean)) {
      query = query.ilike("wilayah", `%${part}%`);
    }

    const { data: koordinators, error } = await query;

    if (error) {
      return createApiError("server_error", "Gagal mencari koordinator wilayah", 500);
    }

    return apiResponse({ koordinators: koordinators ?? [] }, 200);
  } catch (error: unknown) {
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}
