import { createClient, createAdminClient } from '@/lib/supabase/server';
import { lansiaProfileSchema } from '@/lib/validations/lansia';
import { apiResponse, createApiError } from '@/lib/api-response';
import { resolvePrivatePhotoUrl } from '@/lib/storage/private-object';
import type { Database } from '@/types/database';

// GET /api/lansia/[id] — detail satu lansia milik keluarga yang login
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { id } = await params;

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = userProfile?.role || user.user_metadata?.role || 'keluarga';

    let query = supabase
      .from('lansia_profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null);

    // Jika keluarga, pastikan hanya milik lansia miliknya
    if (role === 'keluarga') {
      query = query.eq('keluarga_id', user.id);
    }

    const { data: profile, error } = await query.maybeSingle();

    if (error || !profile) {
      return createApiError('not_found', 'Profil lansia tidak ditemukan', 404);
    }

    const admin = await createAdminClient();
    const sign = (val: string | null) =>
      resolvePrivatePhotoUrl(val, async (path, exp) => {
        const { data, error: signError } = await admin.storage
          .from('dokumen')
          .createSignedUrl(path, exp);
        return signError ? null : data.signedUrl;
      });

    const [foto_url, dokumen_identitas_lansia_url, dokumen_hubungan_keluarga_url] =
      await Promise.all([
        sign(profile.foto_url),
        sign(profile.dokumen_identitas_lansia_url),
        sign(profile.dokumen_hubungan_keluarga_url),
      ]);

    return apiResponse(
      {
        profile: {
          ...profile,
          foto_url,
          dokumen_identitas_lansia_url,
          dokumen_hubungan_keluarga_url,
        },
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

// PUT /api/lansia/[id] — update profil lansia milik keluarga yang login
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

    const { id } = await params;

    // Verifikasi kepemilikan sebelum update
    const { data: existing } = await supabase
      .from('lansia_profiles')
      .select('id')
      .eq('id', id)
      .eq('keluarga_id', user.id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return createApiError('not_found', 'Profil lansia tidak ditemukan', 404);
    }

    const body = await request.json();
    const validation = lansiaProfileSchema.partial().safeParse(body);

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

    const { data: updated, error: updateError } = await supabase
      .from('lansia_profiles')
      .update({ ...validation.data, updated_at: new Date().toISOString() } as unknown as Database['public']['Tables']['lansia_profiles']['Update'])
      .eq('id', id)
      .eq('keluarga_id', user.id)
      .select('*')
      .single();

    if (updateError) {
      return createApiError('server_error', 'Gagal memperbarui profil lansia', 500);
    }

    return apiResponse({ message: 'Profil lansia berhasil diperbarui', profile: updated }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

// DELETE /api/lansia/[id] — soft delete profil lansia milik keluarga yang login
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { id } = await params;

    const { data: existing } = await supabase
      .from('lansia_profiles')
      .select('id')
      .eq('id', id)
      .eq('keluarga_id', user.id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return createApiError('not_found', 'Profil lansia tidak ditemukan', 404);
    }

    const { error: deleteError } = await supabase
      .from('lansia_profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('keluarga_id', user.id);

    if (deleteError) {
      return createApiError('server_error', 'Gagal menghapus profil lansia', 500);
    }

    return apiResponse({ message: 'Profil lansia berhasil dihapus' }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
