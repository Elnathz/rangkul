import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { updateProfileSchema } from '@/lib/validations/auth';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return createApiError('unauthorized', 'Anda belum login', 401);
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !userProfile) {
      return createApiError('user_not_found', 'Profil pengguna tidak ditemukan', 404);
    }

    return apiResponse({ user: userProfile }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return createApiError('unauthorized', 'Anda belum login', 401);
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

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

    const updates = validation.data;

    // Cek status akun + ambil username saat ini
    const { data: current, error: currentError } = await supabase
      .from('users')
      .select('account_status, username')
      .eq('id', authUser.id)
      .single();

    if (currentError || !current) {
      return createApiError('user_not_found', 'Profil pengguna tidak ditemukan', 404);
    }

    if (current.account_status === 'suspended') {
      return createApiError('account_suspended', 'Akun sedang ditangguhkan', 403);
    }

    // Cek unik username jika diubah (case-insensitive)
    if (updates.username && updates.username.toLowerCase() !== current.username.toLowerCase()) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .ilike('username', updates.username)
        .neq('id', authUser.id)
        .single();

      if (existing) {
        return createApiError('username_taken', 'Username sudah dipakai', 409);
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', authUser.id)
      .select('*')
      .single();

    if (updateError) {
      interface DbError { code?: string; message?: string; details?: string; }
      const err = updateError as unknown as DbError;
      if (err.code === '23505') {
        return createApiError('username_taken', 'Username sudah dipakai', 409);
      }
      return createApiError('server_error', updateError.message, 500);
    }

    return apiResponse({ user: updated }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
