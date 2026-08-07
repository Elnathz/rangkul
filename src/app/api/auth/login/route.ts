import { createClient, createAdminClient } from '@/lib/supabase/server';
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
    const supabaseAdmin = await createAdminClient();

    let loginEmail = identifier;

    // Check if identifier is username (not email)
    if (!identifier.includes('@')) {
      // Find user by username using Admin Client to bypass RLS for public.users
      const { data: user, error: userError } = await supabaseAdmin
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

    // Failsafe 1: Fetch user profile by ID
    let { data: userProfile } = await adminClient
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    // Failsafe 2: Match by email if ID differed in public.users
    if (!userProfile && authData.user.email) {
      const { data: profileByEmail } = await adminClient
        .from('users')
        .select('*')
        .eq('email', authData.user.email.toLowerCase())
        .maybeSingle();

      if (profileByEmail) {
        userProfile = profileByEmail;
      }
    }

    // Failsafe 3: Auto-create profile if missing in public.users
    if (!userProfile && authData.user.email) {
      const meta = authData.user.user_metadata || {};
      const fallbackUsername = meta.username || `user_${authData.user.id.substring(0, 8)}`;

      const { data: newProfile } = await adminClient
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email.toLowerCase(),
          username: fallbackUsername.toLowerCase(),
          full_name: meta.full_name || 'Pengguna Rangkul',
          role: meta.role || 'keluarga',
          account_status: 'active',
        })
        .select()
        .maybeSingle();

      userProfile = newProfile;
    }

    if (!userProfile) {
      return createApiError('user_not_found', 'Profil pengguna gagal dimuat', 404);
    }

    // Check account status
    if (userProfile.account_status === 'suspended') {
      return createApiError('account_suspended', 'Akun sedang ditangguhkan', 403);
    }

    return apiResponse(
      {
        message: 'Login berhasil',
        user: userProfile,
        session: authData.session,
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
