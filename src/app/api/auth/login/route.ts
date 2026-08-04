import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth';
import { apiResponse, createApiError } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

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

    const { identifier, password } = validation.data;
    const supabase = await createClient();

    let loginEmail = identifier;

    // Check if identifier is username (not email)
    if (!identifier.includes('@')) {
      // Find user by username
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', identifier.toLowerCase())
        .single();

      if (userError || !user) {
        return createApiError('invalid_credentials', 'Username atau password salah', 401);
      }
      loginEmail = user.email;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      return createApiError('invalid_credentials', 'Username atau password salah', 401);
    }

    // Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      return createApiError('user_not_found', 'Profil pengguna tidak ditemukan', 404);
    }

    // Check account status
    if (userProfile.account_status === 'suspended') {
      return createApiError('account_suspended', 'Akun sedang ditangguhkan', 403);
    }

    return apiResponse(
      {
        message: 'Login berhasil',
        user: {
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          role: userProfile.role,
          username: userProfile.username,
        },
        session: authData.session,
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
