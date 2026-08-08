import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { promoteHelperSchema } from '@/lib/validations/koordinator';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const helperId = params.id;
    if (!helperId) {
      return createApiError('validation_error', 'ID Helper tidak valid', 400);
    }

    const supabase = await createClient();

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login untuk mengakses resource ini', 401);
    }

    // Verify Koordinator Profile
    const { data: koordinator, error: koordinatorError } = await supabase
      .from('koordinator_profiles')
      .select('id, status, wilayah')
      .eq('user_id', user.id)
      .single();

    if (koordinatorError || !koordinator) {
      return createApiError('forbidden', 'Hanya koordinator yang dapat melakukan promosi', 403);
    }

    if (koordinator.status !== 'verified') {
      return createApiError('forbidden', 'Profil koordinator Anda belum diverifikasi', 403);
    }

    // Validate body
    const body = await request.json();
    const validation = promoteHelperSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse(
        {
          error: 'validation_error',
          message: 'Data input tidak valid',
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        400
      );
    }

    const { identitas_valid, dikenal_warga, wawancara_dilakukan, catatan_koordinator } = validation.data;

    // Verify Helper
    const { data: helper, error: helperError } = await supabase
      .from('helper_profiles')
      .select('id, status, tingkat_kepercayaan, wilayah_domisili')
      .eq('id', helperId)
      .single();

    if (helperError || !helper) {
      return createApiError('not_found', 'Helper tidak ditemukan', 404);
    }

    if (helper.wilayah_domisili !== koordinator.wilayah) {
      return createApiError('forbidden', 'Anda hanya dapat mempromosikan helper di wilayah Anda', 403);
    }

    if (helper.status !== 'verified') {
      return createApiError('validation_error', 'Hanya helper terverifikasi (probation) yang bisa dipromosikan', 400);
    }

    if (helper.tingkat_kepercayaan === 'terpercaya') {
      return createApiError('validation_error', 'Helper sudah berstatus terpercaya', 400);
    }

    // Perform the promotion in a transaction (simulated with consecutive awaits due to Supabase JS client limitations, or via RPC. We use sequential updates here as it's safe enough for this case)
    
    // 1. Insert checklist
    const { error: checklistError } = await supabase
      .from('promotion_checklist')
      .insert({
        helper_id: helper.id,
        koordinator_id: koordinator.id,
        identitas_valid,
        dikenal_warga,
        wawancara_dilakukan,
        catatan_koordinator: catatan_koordinator || null,
        completed_at: new Date().toISOString()
      });

    if (checklistError) {
      return createApiError('server_error', 'Gagal menyimpan checklist promosi: ' + checklistError.message, 500);
    }

    // 2. Update helper profile
    const { data: updatedHelper, error: updateError } = await supabase
      .from('helper_profiles')
      .update({
        tingkat_kepercayaan: 'terpercaya',
        promoted_at: new Date().toISOString(),
        promoted_by: koordinator.id
      })
      .eq('id', helper.id)
      .select()
      .single();

    if (updateError) {
      return createApiError('server_error', 'Gagal mempromosikan helper: ' + updateError.message, 500);
    }

    return apiResponse(
      {
        message: 'Helper berhasil dipromosikan menjadi terpercaya',
        helper: updatedHelper
      },
      200
    );

  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
