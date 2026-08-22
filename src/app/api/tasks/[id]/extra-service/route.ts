import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { extraServiceRequestSchema } from "@/lib/validations/extra-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk mengajukan layanan tambahan", 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "helper") {
      return createApiError("forbidden", "Hanya Helper yang dapat mengajukan layanan tambahan", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createApiError("validation_error", "Data layanan tambahan tidak valid", 400);
    }

    const validation = extraServiceRequestSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse({
        error: "validation_error",
        message: "Periksa nama dan biaya layanan tambahan",
        fieldErrors: validation.error.flatten().fieldErrors,
      }, 422);
    }

    const { data: service, error: serviceError } = await supabase.rpc("create_extra_service", {
      p_task_id: taskId,
      p_nama_layanan: validation.data.nama_layanan,
      p_biaya: validation.data.biaya,
    });

    if (serviceError) {
      const isConflict = serviceError.code === "P0001";
      return createApiError(
        isConflict ? "conflict" : "server_error",
        isConflict ? serviceError.message : "Layanan tambahan belum dapat diajukan",
        isConflict ? 409 : 500,
      );
    }

    return apiResponse({
      message: "Layanan tambahan diajukan dan menunggu persetujuan Keluarga",
      service,
      status: "menunggu_persetujuan_keluarga",
    }, 201);
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Layanan tambahan belum dapat diajukan",
      500,
    );
  }
}
