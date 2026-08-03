import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth';
import { apiSuccess, apiError } from '@/lib/constants/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        'INVALID_INPUT',
        'Data input tidak valid',
        400,
        validation.error.flatten().fieldErrors
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
        return apiError('UNAUTHORIZED', 'Username atau password salah', 401);
      }
      loginEmail = user.email;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      return apiError('UNAUTHORIZED', 'Username atau password salah', 401);
    }

    // Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      return apiError('NOT_FOUND', 'Profil pengguna tidak ditemukan', 404);
    }

    return apiSuccess(
      {
        user: userProfile,
        session: {
          access_token: authData.session.access_token,
          expires_at: authData.session.expires_at,
        },
      },
      'Login berhasil'
    );
  } catch (error: any) {
    return apiError('INTERNAL_ERROR', error.message || 'Terjadi kesalahan server', 500);
  }
}
