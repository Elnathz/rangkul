import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type AppSupabaseClient = SupabaseClient<Database>;

export class KoordinatorReviewError extends Error {
  constructor(
    public readonly code: "not_found" | "conflict" | "forbidden" | "validation_error" | "server_error",
    message: string,
    public readonly status: number,
    public readonly detail?: string,
  ) {
    super(message);
    this.name = "KoordinatorReviewError";
  }
}

type ReviewDecision = { status: "verified" | "rejected"; alasan?: string; catatan?: string };

/**
 * Mutation conditional review Koordinator. Hanya mengubah dari status
 * pending_verification sehingga dua Admin yang memutus bersamaan menghasilkan
 * satu sukses dan satu 409. Pemanggil wajib menulis audit setelah sukses.
 */
export async function reviewKoordinatorStatus(
  supabase: AppSupabaseClient,
  koordinatorId: string,
  reviewerUserId: string,
  decision: ReviewDecision,
) {
  const { data, error } = await supabase
    .from("koordinator_profiles")
    .update({
      status: decision.status,
      diverifikasi_oleh: decision.status === "verified" ? reviewerUserId : undefined,
      diverifikasi_at: decision.status === "verified" ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", koordinatorId)
    .eq("status", "pending_verification")
    .select("id, status")
    .maybeSingle();

  if (error) {
    throw new KoordinatorReviewError("server_error", "Gagal memperbarui status koordinator", 500, error.message);
  }

  if (!data) {
    throw new KoordinatorReviewError("conflict", "Koordinator sudah diputus oleh admin lain atau status tidak lagi pending", 409);
  }

  return data;
}