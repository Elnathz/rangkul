import { createClient, createAdminClient } from '@/lib/supabase/server';
import { helperApproveSchema } from '@/lib/validations/helper';
import { apiResponse, createApiError } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit';

// PUT /api/helper/[id]/approve — Koordinator atau Admin approve Helper
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
      return createApiError('forbidden', 'Hanya koordinator atau admin yang dapat menyetujui helper', 403);
    }

    const { id: helperId } = await params;

    // Ambil data helper yang akan di-approve
    const { data: helperProfile, error: helperError } = await supabase
      .from('helper_profiles')
      .select('id, user_id, wilayah_domisili, status')
      .eq('id', helperId)
      .single();

    if (helperError || !helperProfile) {
      return createApiError('not_found', 'Profil helper tidak ditemukan', 404);
    }

    if (helperProfile.status !== 'pending_verification') {
      return createApiError('conflict', `Helper sudah berstatus: ${helperProfile.status}`, 409);
    }

    let koordinatorProfileId: string | null = null;
    let isAdminFallback = false;

    if (role === 'koordinator') {
      // Koordinator hanya bisa approve Helper di wilayahnya
      const { data: koordProfile, error: koordError } = await supabase
        .from('koordinator_profiles')
        .select('id, wilayah, status')
        .eq('user_id', user.id)
        .single();

      if (koordError || !koordProfile) {
        return createApiError('not_found', 'Profil koordinator tidak ditemukan', 404);
      }

      if (koordProfile.status !== 'verified') {
        return createApiError('forbidden', 'Akun koordinator belum diverifikasi admin', 403);
      }

      // Guard: wilayah harus matching (case-insensitive)
      const wilayahKoordFull = koordProfile.wilayah.toLowerCase();
      const wilayahHelperFull = helperProfile.wilayah_domisili.toLowerCase();
      
      const kelurahanKoord = wilayahKoordFull.split('|')[0].trim();
      const kelurahanHelper = wilayahHelperFull.split('|')[0].trim();

      if (kelurahanKoord !== kelurahanHelper && !wilayahHelperFull.includes(wilayahKoordFull) && !wilayahKoordFull.includes(wilayahHelperFull)) {
        return createApiError(
          'forbidden',
          'Anda hanya dapat menyetujui helper yang berdomisili di kelurahan/wilayah Anda',
          403
        );
      }

      koordinatorProfileId = koordProfile.id;
    } else {
      // Admin approve — fallback, tandai verified_by_admin_fallback
      isAdminFallback = true;
    }

    const body = await request.json().catch(() => ({}));
    const validation = helperApproveSchema.safeParse(body);
    if (!validation.success) {
      return createApiError('validation_error', 'Data tidak valid', 400);
    }

    const adminSupabase = await createAdminClient();

    // Update helper_profiles
    const { error: updateError } = await adminSupabase
      .from('helper_profiles')
      .update({
        status: 'verified',
        tingkat_kepercayaan: 'probation',
        koordinator_id: koordinatorProfileId,
        verified_by_admin_fallback: isAdminFallback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', helperId);

    if (updateError) {
      return createApiError('server_error', updateError.message, 500);
    }

    // Audit log
    await writeAuditLog({
      actor_id: user.id,
      action: isAdminFallback ? 'helper_admin_fallback_approved' : 'helper_approved',
      entity_type: 'helper_profiles',
      entity_id: helperId,
      metadata: {
        catatan: validation.data.catatan ?? null,
        is_admin_fallback: isAdminFallback,
      } as import('@/types/database').Json,
    });

    return apiResponse(
      {
        message: isAdminFallback
          ? 'Helper disetujui oleh Admin (fallback). Ditandai sebagai verifikasi sementara.'
          : 'Helper berhasil disetujui. Status: verified, tingkat: probation.',
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
