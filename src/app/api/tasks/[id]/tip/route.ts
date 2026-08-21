import { apiResponse, createApiError } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { id } = await params;
    const body = await request.json();
    const { nominal } = body;

    if (!nominal || nominal <= 0) {
      return createApiError('bad_request', 'Nominal tip tidak valid', 400);
    }

    // Verifikasi kepemilikan task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, keluarga_id, harga_final')
      .eq('id', id)
      .single();

    if (taskError || !task) {
      return createApiError('not_found', 'Tugas tidak ditemukan', 404);
    }

    if (task.keluarga_id !== user.id) {
      return createApiError('forbidden', 'Anda tidak memiliki akses ke tugas ini', 403);
    }

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Insert tip
    const { error: insertError } = await supabaseAdmin
      .from('task_extra_services')
      .insert({
        task_id: id,
        nama_layanan: 'Tip untuk Helper',
        biaya: nominal,
        status: 'disetujui'
      });

    if (insertError) {
      return createApiError('server_error', 'Gagal menyimpan tip', 500);
    }

    // Update harga_final
    const updatedHargaFinal = task.harga_final + nominal;
    const { error: updateTaskError } = await supabaseAdmin
      .from('tasks')
      .update({ harga_final: updatedHargaFinal })
      .eq('id', id);

    if (updateTaskError) {
      return createApiError('server_error', 'Gagal update harga final', 500);
    }

    return apiResponse({ message: 'Tip berhasil diberikan', harga_final: updatedHargaFinal }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
