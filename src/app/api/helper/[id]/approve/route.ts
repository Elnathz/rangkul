import { createClient, createAdminClient } from '@/lib/supabase/server';
import { helperApproveSchema } from '@/lib/validations/helper';
import { apiResponse, createApiError } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit';
import { extractKelurahan } from '@/lib/region';

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

    const body = await request.json().catch(() => ({}));
    const validation = helperApproveSchema.safeParse(body);
    if (!validation.success) {
      return createApiError('validation_error', 'Data tidak valid', 400);
    }

    if (role === 'admin') {
      const { error: fallbackError } = await supabase.rpc('assign_admin_fallback', {
        p_helper_id: helperId,
        p_reason: validation.data.catatan || 'Verifikasi fallback Admin',
      });
      if (fallbackError) {
        const status = fallbackError.code === 'P0002' ? 404 : fallbackError.code === 'P0001' ? 409 : fallbackError.code === '42501' ? 403 : fallbackError.code === '22023' ? 422 : 500;
        const code = status === 404 ? 'not_found' : status === 409 ? 'conflict' : status === 403 ? 'forbidden' : status === 422 ? 'validation_error' : 'server_error';
        const message = status === 409 ? 'Fallback ditolak karena Koordinator RT/RW aktif tersedia atau status Helper sudah berubah' : status === 404 ? 'Helper tidak ditemukan' : status === 422 ? 'Wilayah Helper atau alasan fallback belum valid' : status === 403 ? 'Aksi ini hanya untuk Admin' : 'Fallback belum dapat ditetapkan';
        return createApiError(code, message, status);
      }
      return apiResponse(
        {
          message: 'Helper disetujui oleh Admin (fallback). Ditandai sebagai verifikasi sementara.',
        },
        200
      );
    }

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

    // Format alamat Helper dan Koordinator berbeda, jadi batas approval hanya kelurahan.
    const kelurahanKoord = extractKelurahan(koordProfile.wilayah);
    const kelurahanHelper = extractKelurahan(helperProfile.wilayah_domisili);

    if (!kelurahanKoord || !kelurahanHelper || kelurahanKoord !== kelurahanHelper) {
      return createApiError(
        'forbidden',
        'Anda hanya dapat menyetujui helper yang berdomisili di kelurahan/wilayah Anda',
        403
      );
    }

    const adminSupabase = await createAdminClient();

    // Update helper_profiles
    const { error: updateError } = await adminSupabase
      .from('helper_profiles')
      .update({
        status: 'verified',
        tingkat_kepercayaan: 'probation',
        koordinator_id: koordProfile.id,
        verified_by_admin_fallback: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', helperId);

    if (updateError) {
      return createApiError('server_error', updateError.message, 500);
    }

    // Audit log
    await writeAuditLog({
      actor_id: user.id,
      action: 'helper_approved',
      entity_type: 'helper_profiles',
      entity_id: helperId,
      metadata: {
        catatan: validation.data.catatan ?? null,
        is_admin_fallback: false,
      } as import('@/types/database').Json,
    });

    return apiResponse(
      {
        message: 'Helper berhasil disetujui. Status: verified, tingkat: probation.',
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

export const POST = PUT;
