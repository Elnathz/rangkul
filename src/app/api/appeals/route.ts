import { z } from "zod";

import { apiResponse, createApiError } from "@/lib/api-response";
import { writeAuditLog } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";

const appealSchema = z.object({
  alasan: z.string().trim().min(10, "Alasan banding minimal 10 karakter").max(2000),
});

async function getFamilyContext() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("users")
    .select("id, role, account_status")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, profile };
}

export async function GET() {
  try {
    const { supabase, user, profile } = await getFamilyContext();
    if (!user) return createApiError("unauthorized", "Anda harus login", 401);
    if (profile?.role !== "keluarga") return createApiError("forbidden", "Hanya Keluarga yang dapat melihat banding", 403);

    const { data, error } = await supabase
      .from("appeals")
      .select("id, alasan, status, direview_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return createApiError("server_error", "Gagal mengambil riwayat banding", 500);
    return apiResponse({ data: data ?? [], account_status: profile.account_status });
  } catch {
    return createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user, profile } = await getFamilyContext();
    if (!user) return createApiError("unauthorized", "Anda harus login", 401);
    if (profile?.role !== "keluarga") return createApiError("forbidden", "Hanya Keluarga yang dapat mengajukan banding", 403);

    const parsed = appealSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return apiResponse({ error: "validation_error", message: "Alasan banding belum valid", fieldErrors: parsed.error.flatten().fieldErrors }, 422);

    const { data: pendingAppeal } = await supabase
      .from("appeals")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "menunggu")
      .maybeSingle();
    if (pendingAppeal) return createApiError("conflict", "Masih ada banding yang menunggu review", 409);

    const { data, error } = await supabase
      .from("appeals")
      .insert({ user_id: user.id, alasan: parsed.data.alasan })
      .select("id, alasan, status, direview_at, created_at")
      .single();
    if (error) return createApiError("server_error", "Banding belum dapat dikirim", 500);

    await writeAuditLog({ actor_id: user.id, action: "submit_appeal", entity_type: "appeal", entity_id: data.id, metadata: { account_status: profile.account_status } });
    return apiResponse({ data, message: "Banding berhasil dikirim ke Admin" }, 201);
  } catch {
    return createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}
