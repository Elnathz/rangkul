import { createClient } from '@/lib/supabase/server';
import { helperRejectSchema } from '@/lib/validations/helper';
import { apiResponse, createApiError } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit';

// PUT /api/helper/[id]/reject — Koordinator atau Admin reject Helper
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = userProfile?.role;

    if (role !== 'koordinator' && role !== 'admin') {
      return createApiError('forbidden', 'Hanya koordinator atau admin yang dapat menolak helper', 403);
    }

    const { id: helperId } = await params;

    const { data: helperProfile, error: helperError } = await supabase
      .from('helper_profiles')
      .select('id, wilayah_domisili, status')
      .eq('id', helperId)
      .single();

    if (helperError || !helperProfile) {
      return createApiError('not_found', 'Profil helper tidak ditemukan', 404);
    }

    if (helperProfile.status !== 'pending_verification') {
      return createApiError('conflict', `Helper sudah berstatus: ${helperProfile.status}`, 409);
    }

    if (role === 'koordinator') {
      const { data: koordProfile } = await supabase
        .from('koordinator_profiles')
        .select('wilayah, status')
        .eq('user_id', user.id)
        .single();

      if (!koordProfile || koordProfile.status !== 'verified') {
        return createApiError('forbidden', 'Akun koordinator belum diverifikasi admin', 403);
      }

      const wilayahKoord = koordProfile.wilayah.toLowerCase();
      const wilayahHelper = helperProfile.wilayah_domisili.toLowerCase();

      if (!wilayahHelper.includes(wilayahKoord) && !wilayahKoord.includes(wilayahHelper)) {
        return createApiError(
          'forbidden',
          'Anda hanya dapat menolak helper yang berdomisili di wilayah Anda',
          403
        );
      }
    }

    const body = await request.json();
    const validation = helperRejectSchema.safeParse(body);

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

    // Status kembali ke suspended agar tidak bisa re-apply (harus hubungi admin)
    const { error: updateError } = await supabase
      .from('helper_profiles')
      .update({
        status: 'suspended',
        suspend_reason: validation.data.alasan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', helperId);

    if (updateError) {
      return createApiError('server_error', updateError.message, 500);
    }

    await writeAuditLog({
      actor_id: user.id,
      action: 'helper_rejected',
      entity_type: 'helper_profiles',
      entity_id: helperId,
      metadata: { alasan: validation.data.alasan },
    });

    return apiResponse({ message: 'Helper berhasil ditolak.' }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
