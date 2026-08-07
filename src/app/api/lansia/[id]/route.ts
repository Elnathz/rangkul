import { createClient } from '@/lib/supabase/server';
import { lansiaProfileSchema } from '@/lib/validations/lansia';
import { apiResponse, createApiError } from '@/lib/api-response';

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

    const { data: profile, error } = await supabase
      .from('lansia_profiles')
      .select('*')
      .eq('id', id)
      .eq('keluarga_id', user.id)
      .is('deleted_at', null)
      .single();

    if (error || !profile) {
      return createApiError('not_found', 'Profil lansia tidak ditemukan', 404);
    }

    return apiResponse({ profile }, 200);
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
      .update({ ...validation.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('keluarga_id', user.id)
      .select('*')
      .single();

    if (updateError) {
      return createApiError('server_error', updateError.message, 500);
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
      return createApiError('server_error', deleteError.message, 500);
    }

    return apiResponse({ message: 'Profil lansia berhasil dihapus' }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
