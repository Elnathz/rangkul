import {
  createRiwayatRangkulHandler,
  RiwayatDataAccessError,
  type RawRiwayatTask,
} from "@/lib/riwayat-rangkul";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { resolvePrivatePhotoUrl } from "@/lib/storage/private-object";

const PRIVATE_BUCKET = "dokumen";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  let userClientPromise: ReturnType<typeof createClient> | null = null;
  let adminClientPromise: ReturnType<typeof createAdminClient> | null = null;
  const getUserClient = () => {
    userClientPromise ??= createClient();
    return userClientPromise;
  };
  const getAdminClient = () => {
    adminClientPromise ??= createAdminClient();
    return adminClientPromise;
  };

  const handler = createRiwayatRangkulHandler({
    authenticate: async () => {
      const supabase = await getUserClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      return error || !user ? null : { id: user.id };
    },
    findOwnedLansia: async (lansiaId, keluargaId) => {
      const supabase = await getUserClient();
      const { data, error } = await supabase
        .from("lansia_profiles")
        .select("id, nama")
        .eq("id", lansiaId)
        .eq("keluarga_id", keluargaId)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw new RiwayatDataAccessError("ownership", error.code);
      return data;
    },
    findTasks: async (lansiaId, keluargaId) => {
      const supabase = await getUserClient();
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          id,
          status,
          lansia_id,
          keluarga_id,
          jadwal_waktu,
          completed_at,
          task_evidence (foto_bukti_url, catatan_kondisi),
          health_snapshots (energi, mobilitas, mood, nafsu_makan, kualitas_tidur, cerita_hari_ini)
        `)
        .eq("lansia_id", lansiaId)
        .eq("keluarga_id", keluargaId)
        .eq("status", "selesai")
        .order("completed_at", { ascending: true });
      if (error) throw new RiwayatDataAccessError("timeline", error.code);
      return (data ?? []) as RawRiwayatTask[];
    },
    signEvidence: async (value) => resolvePrivatePhotoUrl(value, async (path, expiresIn) => {
      const adminSupabase = await getAdminClient();
      const { data, error } = await adminSupabase.storage
        .from(PRIVATE_BUCKET)
        .createSignedUrl(path, expiresIn);
      if (error) return null;
      return data.signedUrl;
    }),
    reportError: (event) => {
      console.error("Riwayat request failed", event);
    },
  });

  return handler(request, context);
}
