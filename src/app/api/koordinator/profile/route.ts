import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { z } from 'zod';

const updateSchema = z.object({
  wilayah: z.string().min(3, 'Wilayah minimal 3 karakter'),
  foto_url: z.string().optional().nullable(),
});

// GET /api/koordinator/profile — Koordinator melihat status profilnya sendiri
export async function GET() {
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

    if (!userProfile || userProfile.role !== 'koordinator') {
      return createApiError('forbidden', 'Hanya koordinator yang dapat mengakses endpoint ini', 403);
    }

    const { data: profile, error } = await supabase
      .from('koordinator_profiles')
      .select(`
        id, wilayah, tingkat, status, saldo_komisi, foto_url,
        diverifikasi_at, created_at, updated_at
      `)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return createApiError('server_error', error.message, 500);
    }

    if (!profile) {
      return createApiError(
        'not_found',
        'Profil koordinator belum ada. Daftar dulu via POST /api/koordinator/apply',
        404
      );
    }

    return apiResponse({ profile }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError('unauthorized', 'Anda harus login', 401);
    const { data: userProfile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (userProfile?.role !== 'koordinator') return createApiError('forbidden', 'Hanya koordinator yang dapat mengubah profil ini', 403);
    const validation = updateSchema.safeParse(await request.json());
    if (!validation.success) return apiResponse({ error: 'validation_error', message: 'Data wilayah tidak valid', fieldErrors: validation.error.flatten().fieldErrors }, 400);
    const { data: current } = await supabase.from('koordinator_profiles').select('id, wilayah').eq('user_id', user.id).maybeSingle();
    if (!current) return createApiError('not_found', 'Profil koordinator belum ada', 404);
    const updatePayload: {
      wilayah?: string;
      status?: 'pending_verification';
      updated_at?: string;
      foto_url?: string | null;
    } = {
      wilayah: validation.data.wilayah,
      ...(current.wilayah !== validation.data.wilayah ? { status: 'pending_verification' as const } : {}),
      updated_at: new Date().toISOString(),
    };
    if (validation.data.foto_url !== undefined) {
      updatePayload.foto_url = validation.data.foto_url;
    }
    const { data: profile, error } = await supabase.from('koordinator_profiles').update(updatePayload).eq('id', current.id).select('id, wilayah, tingkat, status, saldo_komisi, foto_url, diverifikasi_at, created_at, updated_at').single();
    if (error) return createApiError('server_error', error.message, 500);
    return apiResponse({ profile }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', error instanceof Error ? error.message : 'Profil koordinator gagal diperbarui', 500);
  }
}
