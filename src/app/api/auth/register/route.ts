import { createAdminClient } from '@/lib/supabase/server';
import { registerSchema } from '@/lib/validations/auth';
import { apiResponse, createApiError } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

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

    const { email, password, full_name, phone, role, username } = validation.data;
    const supabaseAdmin = await createAdminClient();

    // Check if username is already taken (case-insensitive)
    const { data: existingUsername } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('username', username.trim())
      .maybeSingle();

    if (existingUsername) {
      return createApiError('username_taken', 'Username sudah digunakan oleh pengguna lain', 409);
    }

    // Check if email is already taken
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingEmail) {
      return createApiError('email_taken', 'Email sudah terdaftar. Silakan login.', 409);
    }

    // Create User via Supabase Auth Admin API
    const formattedPhone = phone ? (phone.startsWith('08') ? phone : `08${phone}`) : null;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        username: username.toLowerCase().trim(),
        role,
      },
    });

    if (authError) {
      return createApiError('registration_failed', authError.message, 400);
    }

    // Update username and phone in public.users table
    if (authData.user) {
      await supabaseAdmin
        .from('users')
        .update({
          username: username.toLowerCase().trim(),
          ...(formattedPhone ? { phone: formattedPhone } : {}),
        })
        .eq('id', authData.user.id);
    }

    return apiResponse(
      {
        message: 'Registrasi berhasil. Silakan login.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name,
          username: username.toLowerCase().trim(),
          role,
        },
      },
      201
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
