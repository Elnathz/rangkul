import { createClient, createAdminClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";

// GET /api/chat/start-target — mengambil daftar Helper & Keluarga di wilayah Koordinator untuk Obrolan Baru
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login", 401);
    }

    const admin = await createAdminClient();

    // Dapatkan data profil koordinator yang login
    const { data: koordinator } = await admin
      .from("koordinator_profiles")
      .select("id, wilayah")
      .eq("user_id", user.id)
      .maybeSingle();

    const wilayahFilter = koordinator?.wilayah || "";

    // 1. Ambil daftar Helper di wilayah
    let helperQuery = admin
      .from("helper_profiles")
      .select("id, user_id, foto_wajah_url, users:user_id(id, full_name, phone, kelurahan, kecamatan)")
      .eq("status", "verified");

    if (wilayahFilter) {
      helperQuery = helperQuery.ilike("wilayah_domisili", `%${wilayahFilter}%`);
    }

    const { data: rawHelpers } = await helperQuery;

    const helpers = (rawHelpers ?? []).map((h: any) => {
      const u = Array.isArray(h.users) ? h.users[0] : h.users;
      return {
        id: h.id,
        user_id: h.user_id,
        nama: u?.full_name || "Helper Rangkul",
        role: "helper",
        foto_url: h.foto_wajah_url || null,
        info: u?.kecamatan ? `Kec. ${u.kecamatan}` : "Helper Wilayah",
      };
    });

    // 2. Ambil daftar Keluarga di wilayah (atau yang pernah membuat pesanan/lansia)
    let keluargaQuery = admin
      .from("users")
      .select("id, full_name, phone, kelurahan, kecamatan")
      .eq("role", "keluarga");

    if (wilayahFilter) {
      keluargaQuery = keluargaQuery.ilike("kecamatan", `%${wilayahFilter}%`);
    }

    const { data: rawKeluarga } = await keluargaQuery.limit(20);

    const keluarga = (rawKeluarga ?? []).map((k: any) => ({
      id: k.id,
      user_id: k.id,
      nama: k.full_name || "Keluarga Rangkul",
      role: "keluarga",
      foto_url: null,
      info: k.kecamatan ? `Kec. ${k.kecamatan}` : "Keluarga Wilayah",
    }));

    return apiResponse({ helpers, keluarga }, 200);
  } catch (error: unknown) {
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}

// POST /api/chat/start-target — membuat atau mengambil rute obrolan tugas antara Koordinator dan Helper/Keluarga
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login", 401);
    }

    const body = await request.json();
    const { target_user_id, role } = body;

    if (!target_user_id) {
      return createApiError("validation_error", "target_user_id wajib diisi", 400);
    }

    const admin = await createAdminClient();

    // 1. Cari tugas eksisting antara kedua pihak, atau buatkan dummy task channel khusus komunikasi langsung
    const { data: existingTask } = await admin
      .from("tasks")
      .select("id")
      .or(`keluarga_id.eq.${target_user_id},keluarga_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingTask) {
      return apiResponse({ taskId: existingTask.id }, 200);
    }

    // 2. Jika tidak ada tugas eksisting, ambil tugas paling baru di database atau buatkan entry tugas komunikasi
    const { data: latestTask } = await admin
      .from("tasks")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestTask) {
      return apiResponse({ taskId: latestTask.id }, 200);
    }

    // Jika belum ada tugas sama sekali di platform, gunakan target_user_id sebagai channel obrolan langsung
    return apiResponse({ taskId: target_user_id }, 200);
  } catch (error: unknown) {
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}
