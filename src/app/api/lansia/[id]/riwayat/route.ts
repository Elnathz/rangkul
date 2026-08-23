import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { calculateRiwayatTrend } from '@/lib/riwayat-rangkul';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError('unauthorized', 'Anda harus login', 401);

    const { data: lansia, error: lansiaError } = await supabase
      .from('lansia_profiles')
      .select('id, nama, keluarga_id')
      .eq('id', id)
      .eq('keluarga_id', user.id)
      .is('deleted_at', null)
      .single();
    if (lansiaError || !lansia) return createApiError('not_found', 'Profil lansia tidak ditemukan', 404);

    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select(`id, jadwal_waktu, completed_at, status, task_evidence ( foto_bukti_url, catatan_kondisi, created_at ), health_snapshots ( energi, mobilitas, mood, nafsu_makan, kualitas_tidur, cerita_hari_ini, created_at )`)
      .eq('lansia_id', id)
      .eq('keluarga_id', user.id)
      .eq('status', 'selesai')
      .order('completed_at', { ascending: true });
    if (taskError) return createApiError('server_error', taskError.message, 500);

    const kunjungan = (tasks ?? []).map((task) => {
      const evidence = Array.isArray(task.task_evidence) ? task.task_evidence[0] : task.task_evidence;
      const snapshot = Array.isArray(task.health_snapshots) ? task.health_snapshots[0] : task.health_snapshots;
      return { task_id: task.id, waktu: task.completed_at ?? task.jadwal_waktu, foto_bukti_url: evidence?.foto_bukti_url ?? null, catatan_kondisi: evidence?.catatan_kondisi ?? null, health_snapshot: snapshot ?? null };
    });
    const snapshots = kunjungan.flatMap((item) => item.health_snapshot ? [{ energi: item.health_snapshot.energi, mobilitas: item.health_snapshot.mobilitas, mood: item.health_snapshot.mood, nafsu_makan: item.health_snapshot.nafsu_makan, kualitas_tidur: item.health_snapshot.kualitas_tidur }] : []);

    return apiResponse({ lansia, kunjungan, tren: calculateRiwayatTrend(snapshots), disclaimer: 'Riwayat Rangkul adalah catatan pendampingan, bukan diagnosis medis.' }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', error instanceof Error ? error.message : 'Terjadi kesalahan server', 500);
  }
}
