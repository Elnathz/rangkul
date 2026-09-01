import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ServiceCategoryInput } from "@/lib/validations/admin";

type AppSupabaseClient = SupabaseClient<Database>;

export class ServiceCategoryError extends Error {
  constructor(
    public readonly code: "not_found" | "conflict" | "validation_error" | "server_error",
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ServiceCategoryError";
  }
}

const TERMINAL_TASK_STATUSES = ["selesai", "dibatalkan"];

async function getCategory(
  supabase: AppSupabaseClient,
  id: string,
): Promise<Pick<Database["public"]["Tables"]["service_categories"]["Row"], "id" | "parent_id" | "is_active">> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("id, parent_id, is_active")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ServiceCategoryError("server_error", "Gagal membaca kategori", 500);
  if (!data) throw new ServiceCategoryError("not_found", "Kategori tidak ditemukan", 404);
  return data;
}

async function hasActiveChildren(supabase: AppSupabaseClient, id: string): Promise<boolean> {
  const { data } = await supabase
    .from("service_categories")
    .select("id")
    .eq("parent_id", id)
    .eq("is_active", true)
    .limit(1);
  return Boolean(data?.length);
}

async function hasActiveTaskReferences(supabase: AppSupabaseClient, id: string): Promise<boolean> {
  const { data } = await supabase
    .from("tasks")
    .select("id")
    .eq("service_category_id", id)
    .not("status", "in", `(${TERMINAL_TASK_STATUSES.join(",")})`)
    .limit(1);
  return Boolean(data?.length);
}

/**
 * Catatan: pemeriksaan parent/leaf bersifat pencegahan cepat di tingkat API.
 * Depth dan integritas subtree tetap ditegakkan pemeriksaan mounting tersebut.
 */
export async function updateServiceCategory(supabase: AppSupabaseClient, id: string, updates: Partial<ServiceCategoryInput>) {
  const current = await getCategory(supabase, id);

  if (updates.parent_id !== undefined && updates.parent_id !== null) {
    if (updates.parent_id === id) {
      throw new ServiceCategoryError("validation_error", "Kategori tidak dapat menjadi induk dari dirinya sendiri", 422);
    }

    if (current.parent_id === null && (await hasActiveChildren(supabase, id))) {
      throw new ServiceCategoryError("validation_error", "Kategori yang memiliki subkategori aktif tidak dapat dijadikan subkategori", 422);
    }

    const parent = await getCategory(supabase, updates.parent_id);
    let ancestorId: string | null = parent.parent_id;
    while (ancestorId) {
      if (ancestorId === id) {
        throw new ServiceCategoryError("validation_error", "Pemindahan menciptakan siklus pada hierarki kategori", 422);
      }
      const ancestor = await getCategory(supabase, ancestorId);
      ancestorId = ancestor.parent_id;
    }
  }

  if (updates.is_active === false) {
    if (await hasActiveChildren(supabase, id)) {
      throw new ServiceCategoryError("conflict", "Kategori masih memiliki subkategori aktif", 409);
    }
    if (await hasActiveTaskReferences(supabase, id)) {
      throw new ServiceCategoryError("conflict", "Kategori masih dipakai pada tugas yang belum selesai", 409);
    }
  }

  const { data, error } = await supabase
    .from("service_categories")
    .update({ ...updates } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new ServiceCategoryError("server_error", "Gagal memperbarui kategori", 500);
  return data;
}

export async function setServiceCategoryInactive(supabase: AppSupabaseClient, id: string) {
  if (await hasActiveChildren(supabase, id)) {
    throw new ServiceCategoryError("conflict", "Kategori masih memiliki subkategori aktif", 409);
  }
  if (await hasActiveTaskReferences(supabase, id)) {
    throw new ServiceCategoryError("conflict", "Kategori masih dipakai pada tugas yang belum selesai", 409);
  }

  const { data, error } = await supabase
    .from("service_categories")
    .update({ is_active: false } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new ServiceCategoryError("server_error", "Gagal menonaktifkan kategori", 500);
  return data;
}