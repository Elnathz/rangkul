import { createClient } from "@/lib/supabase/server";

/**
 * Memeriksa apakah actor yang sedang login berhak melihat file privat.
 * Aturan Sprint 4 Task 1: pemilik file, participant, Koordinator wilayah terkait,
 * atau Admin. Role diambil dari tabel users, bukan user_metadata yang bisa hilang.
 */
export async function canAccessPrivateFile(filePath: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return false;

  const fallbackRole = user.user_metadata?.role;
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profile?.role ?? fallbackRole) as string | undefined;

  if (!filePath || filePath.startsWith("http")) return false;

  // Admin selalu berhak atas dokumen privat.
  if (role === "admin") return true;

  // Pemilik file selalu berhak. Format path: [user_id]/[doc_type]/[filename].
  const pathParts = filePath.split("/");
  const fileOwnerId = pathParts[0];
  const docType = pathParts[1];
  if (user.id === fileOwnerId) return true;

  // Participant authorization untuk bukti kunjungan (foto_bukti)
  if (docType === "foto_bukti") {
    const { data: evidenceTask } = await supabase
      .from("task_evidence")
      .select("task_id, tasks!inner(keluarga_id, helper_id)")
      .eq("foto_bukti_url", filePath)
      .maybeSingle();

    if (evidenceTask) {
      const taskObj = evidenceTask.tasks as { keluarga_id?: string; helper_id?: string } | null;
      if (taskObj?.keluarga_id === user.id) {
        return true;
      }
      // Helper yang ditugaskan juga berhak
      const { data: helperProfile } = await supabase
        .from("helper_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (helperProfile && taskObj?.helper_id === helperProfile.id) {
        return true;
      }
    }
  }

  if (role === "koordinator") {
    const { data: koordProfile } = await supabase
      .from("koordinator_profiles")
      .select("id, wilayah, status")
      .eq("user_id", user.id)
      .eq("status", "verified")
      .maybeSingle();

    if (!koordProfile) return false;

    // Koordinator berhak melihat evidence tugas di wilayahnya
    if (docType === "foto_bukti") {
      const { data: evidenceRow } = await supabase
        .from("task_evidence")
        .select("tasks!inner(helper_profiles!inner(koordinator_id, wilayah_domisili))")
        .eq("foto_bukti_url", filePath)
        .maybeSingle();

      const helperData = (evidenceRow?.tasks as { helper_profiles?: { koordinator_id?: string; wilayah_domisili?: string } })?.helper_profiles;
      if (helperData?.koordinator_id === koordProfile.id || helperData?.wilayah_domisili === koordProfile.wilayah) {
        return true;
      }
    }

    const { data: targetHelper } = await supabase
      .from("helper_profiles")
      .select("id, koordinator_id, wilayah_domisili")
      .eq("user_id", fileOwnerId)
      .maybeSingle();

    if (targetHelper) {
      if (targetHelper.koordinator_id === koordProfile.id || targetHelper.wilayah_domisili === koordProfile.wilayah) {
        return true;
      }
    }

    const { data: targetKoord } = await supabase
      .from("koordinator_profiles")
      .select("id, wilayah")
      .eq("user_id", fileOwnerId)
      .maybeSingle();

    if (targetKoord && targetKoord.wilayah === koordProfile.wilayah) {
      return true;
    }
  }

  return false;
}