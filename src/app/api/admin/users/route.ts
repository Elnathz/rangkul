import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/server";
import { createAdminUserSchema, normalizeIndonesianPhone } from "@/lib/validations/admin-users";

const roles = new Set(["keluarga", "helper", "koordinator", "admin"]);
const statuses = new Set(["active", "restricted", "suspended"]);

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const url = new URL(request.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? "1"), 1);
    const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? "25"), 1), 100);
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("q")?.trim().replace(/[%,()]/g, " ");
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("users")
      .select("id, email, phone, full_name, username, role, account_status, rt, rw, kelurahan, kecamatan, kabupaten_kota, provinsi, created_at, updated_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (role && roles.has(role)) query = query.eq("role", role as "keluarga" | "helper" | "koordinator" | "admin");
    if (status && statuses.has(status)) query = query.eq("account_status", status as "active" | "restricted" | "suspended");
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);

    const { data, count, error } = await query;
    if (error) return createApiError("server_error", "Gagal mengambil data pengguna", 500);
    return apiResponse({ data: data ?? [], total: count ?? 0, page, pageSize });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    return authResponse ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAdmin();
    const validation = createAdminUserSchema.safeParse(await request.json().catch(() => null));
    if (!validation.success) {
      return apiResponse({ error: "validation_error", message: "Data pengguna tidak valid", fieldErrors: validation.error.flatten().fieldErrors }, 422);
    }

    const input = validation.data;
    const admin = await createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      phone: normalizeIndonesianPhone(input.phone) ?? undefined,
      phone_confirm: Boolean(input.phone),
      user_metadata: {
        full_name: input.full_name,
        username: input.username,
        role: input.role,
      },
    });

    if (error || !data.user) return createApiError("conflict", error?.message ?? "Akun gagal dibuat", 409);
    await writeAuditLog({ actor_id: user.id, action: "admin_user_created", entity_type: "user", entity_id: data.user.id, metadata: { role: input.role } });
    return apiResponse({ data: { id: data.user.id, email: data.user.email, role: input.role }, message: "Akun berhasil dibuat" }, 201);
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    return authResponse ?? createApiError("server_error", "Terjadi kesalahan server", 500);
  }
}
