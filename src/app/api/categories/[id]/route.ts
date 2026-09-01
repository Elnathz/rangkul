import { apiResponse, createApiError } from "@/lib/api-response";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin/auth";
import {
  setServiceCategoryInactive,
  ServiceCategoryError,
  updateServiceCategory,
} from "@/lib/admin/service-categories";
import { serviceCategorySchema } from "@/lib/validations/admin";
import { writeAuditLog } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

function serviceCategoryErrorResponse(error: unknown) {
  if (error instanceof ServiceCategoryError) {
    return createApiError(error.code, error.message, error.status);
  }
  return null;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;

    const { data, error } = await supabase.from("service_categories").select("*").eq("id", id).maybeSingle();
    if (error) return createApiError("server_error", "Gagal membaca kategori", 500);
    if (!data) return createApiError("not_found", "Kategori tidak ditemukan", 404);

    return apiResponse({ data }, 200);
  } catch (error: unknown) {
    return adminAuthErrorResponse(error) ?? createApiError("server_error", error instanceof Error ? error.message : "Terjadi kesalahan server", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { supabase, user } = await requireAdmin();
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createApiError("validation_error", "Data input tidak valid", 400);
    }

    const validation = serviceCategorySchema.partial().safeParse(body);
    if (!validation.success) {
      return apiResponse({
        error: "validation_error",
        message: "Data input tidak valid",
        fieldErrors: validation.error.flatten().fieldErrors,
      }, 422);
    }

    const data = await updateServiceCategory(supabase, id, validation.data);

    if (validation.data.parent_id !== undefined || validation.data.is_high_risk !== undefined) {
      await writeAuditLog({
        actor_id: user.id,
        action: "admin_service_category_updated",
        entity_type: "service_category",
        entity_id: data.id,
        metadata: {
          fields: Object.keys(validation.data).filter((key) => validation.data[key as keyof typeof validation.data] !== undefined),
        },
      });
    }

    return apiResponse({ data, message: "Kategori berhasil diperbarui" }, 200);
  } catch (error: unknown) {
    return adminAuthErrorResponse(error) ?? serviceCategoryErrorResponse(error) ?? createApiError("server_error", error instanceof Error ? error.message : "Terjadi kesalahan server", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { supabase, user } = await requireAdmin();
    const { id } = await params;

    const data = await setServiceCategoryInactive(supabase, id);

    await writeAuditLog({
      actor_id: user.id,
      action: "admin_service_category_deleted",
      entity_type: "service_category",
      entity_id: data.id,
      metadata: { soft_delete: true },
    });

    return apiResponse({ data, message: "Kategori berhasil dinonaktifkan (soft delete)" }, 200);
  } catch (error: unknown) {
    return adminAuthErrorResponse(error) ?? serviceCategoryErrorResponse(error) ?? createApiError("server_error", error instanceof Error ? error.message : "Terjadi kesalahan server", 500);
  }
}