import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import type { TaskStatus } from '@/lib/constants/task-status';
import {
  ACTIVE_TASK_STATUSES,
  getHelperActivityStatus,
  selectCurrentTask,
} from '@/lib/koordinator/helper-activity';

function getRelationName(value: unknown) {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === 'object' && first !== null && 'nama' in first && typeof first.nama === 'string'
      ? first.nama
      : null;
  }

  return value && typeof value === 'object' && 'nama' in value && typeof value.nama === 'string'
    ? value.nama
    : null;
}

function getUserName(value: unknown) {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === 'object' && first !== null && 'full_name' in first && typeof first.full_name === 'string'
      ? first.full_name
      : 'Helper';
  }

  return value && typeof value === 'object' && 'full_name' in value && typeof value.full_name === 'string'
    ? value.full_name
    : 'Helper';
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userProfile?.role !== 'koordinator') {
      return createApiError('forbidden', 'Hanya Koordinator yang dapat melihat directory Helper', 403);
    }

    const { data: koordinator, error: koordinatorError } = await supabase
      .from('koordinator_profiles')
      .select('id, wilayah, status')
      .eq('user_id', user.id)
      .single();

    if (koordinatorError || !koordinator) {
      return createApiError('not_found', 'Profil Koordinator tidak ditemukan', 404);
    }

    if (koordinator.status !== 'verified') {
      return createApiError('forbidden', 'Akun Koordinator belum diverifikasi Admin', 403);
    }

    const { data: helperRows, error: helperError } = await supabase
      .from('helper_profiles')
      .select(`
        id, status, tingkat_kepercayaan, is_available, wilayah_domisili,
        rating_avg, total_tugas_selesai, created_at, foto_url, foto_wajah_url,
        users!inner ( id, full_name )
      `)
      .eq('koordinator_id', koordinator.id)
      .eq('status', 'verified')
      .order('created_at', { ascending: false });

    if (helperError) {
      return createApiError('server_error', helperError.message, 500);
    }

    const helperIds = (helperRows ?? []).map((helper) => helper.id);
    let taskRows: Array<{
      id: string;
      helper_id: string | null;
      status: TaskStatus;
      jadwal_waktu: string;
      checkin_time: string | null;
      service_categories: unknown;
    }> = [];

    if (helperIds.length > 0) {
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('id, helper_id, status, jadwal_waktu, checkin_time, service_categories ( nama )')
        .in('helper_id', helperIds)
        .in('status', ACTIVE_TASK_STATUSES)
        .order('jadwal_waktu', { ascending: true });

      if (taskError) {
        return createApiError('server_error', taskError.message, 500);
      }

      taskRows = (tasks ?? []) as typeof taskRows;
    }

    const helpers = (helperRows ?? []).map((helper) => {
      const activeTasks = taskRows
        .filter((task) => task.helper_id === helper.id)
      const activeTask = selectCurrentTask(activeTasks);

      return {
        id: helper.id,
        nama: getUserName(helper.users),
        status: helper.status,
        tingkat_kepercayaan: helper.tingkat_kepercayaan,
        is_available: helper.is_available,
        wilayah_domisili: helper.wilayah_domisili,
        foto_url: helper.foto_wajah_url || helper.foto_url || null,
        rating_avg: Number(helper.rating_avg ?? 0),
        total_tugas_selesai: helper.total_tugas_selesai,
        status_aktivitas: getHelperActivityStatus(activeTask, helper.is_available),
        tugas_aktif: activeTask
          ? {
              id: activeTask.id,
              status: activeTask.status,
              nama_layanan: getRelationName(activeTask.service_categories),
              jadwal_waktu: activeTask.jadwal_waktu,
              checkin_time: activeTask.checkin_time,
            }
          : null,
      };
    });

    return apiResponse({
      koordinator_wilayah: koordinator.wilayah,
      total: helpers.length,
      helpers,
    }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', error instanceof Error ? error.message : 'Terjadi kesalahan server', 500);
  }
}
