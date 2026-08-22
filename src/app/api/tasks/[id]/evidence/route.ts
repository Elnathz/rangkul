import { apiResponse, createApiError } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { taskEvidenceSchema } from "@/lib/validations/task-evidence";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: taskId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk mengirim laporan", 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "helper") {
      return createApiError("forbidden", "Hanya Helper yang dapat mengirim laporan", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createApiError("validation_error", "Data laporan tidak valid", 400);
    }

    const validation = taskEvidenceSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse({
        error: "validation_error",
        message: "Lengkapi foto, catatan, dan lima penilaian kondisi lansia",
        fieldErrors: validation.error.flatten().fieldErrors,
      }, 422);
    }

    const { data: task, error: submitError } = await supabase.rpc("submit_task_evidence", {
      p_task_id: taskId,
      p_foto_bukti_url: validation.data.foto_bukti_url,
      p_catatan_kondisi: validation.data.catatan_kondisi,
      p_energi: validation.data.skor_energi,
      p_mobilitas: validation.data.skor_mobilitas,
      p_mood: validation.data.skor_mood,
      p_nafsu_makan: validation.data.skor_nafsu_makan,
      p_kualitas_tidur: validation.data.skor_tidur,
      p_cerita_hari_ini: validation.data.cerita_hari_ini ?? null,
      p_client_submission_id: validation.data.client_submission_id,
    });

    if (submitError) {
      const isConflict = submitError.code === "P0001" || submitError.code === "23505";
      return createApiError(
        isConflict ? "conflict" : "server_error",
        isConflict ? submitError.message : "Laporan belum dapat disimpan",
        isConflict ? 409 : 500,
      );
    }

    return apiResponse({
      message: "Laporan tersimpan. Keluarga dapat meninjau hasil kunjunganmu.",
      task,
      status: "menunggu_persetujuan_keluarga",
    }, 201);
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Laporan belum dapat disimpan",
      500,
    );
  }
}
