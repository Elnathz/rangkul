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

    // Create User via Supabase Auth Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        username,
      },
    });

    if (authError) {
      return createApiError('registration_failed', authError.message, 400);
    }

    // Update phone if provided
    if (phone && authData.user) {
      await supabaseAdmin
        .from('users')
        .update({ phone })
        .eq('id', authData.user.id);
    }

    return apiResponse(
      {
        message: 'Registrasi berhasil',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name,
          role,
        },
      },
      201
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
