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

    // MOCK MODE: Bypass Supabase karena server saat ini tidak valid
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validasi mock (jika "salah" -> tester menggunakan kata sandi khusus "error")
    if (password === 'error') {
      return createApiError('invalid_credentials', 'Username atau password salah (Simulasi Error)', 401);
    }

    // Berikan peran acak atau baca dari identifier jika berisi indikator peran
    let role = 'keluarga';
    if (identifier.includes('helper')) role = 'helper';
    if (identifier.includes('koordinator')) role = 'koordinator';

    return apiResponse(
      {
        message: 'Login berhasil (Simulasi Offline)',
        user: {
          id: 'mock-uuid-9999',
          email: identifier.includes('@') ? identifier : `${identifier}@mock.id`,
          full_name: 'Mock User',
          role: role,
          username: identifier.split('@')[0],
        },
        session: { access_token: 'mock_token', refresh_token: 'mock_refresh' },
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
