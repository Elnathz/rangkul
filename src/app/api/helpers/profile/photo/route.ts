import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { z } from 'zod';

const photoRequestSchema = z.object({ foto_wajah_url: z.string().url('URL foto tidak valid') });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError('unauthorized', 'Anda harus login', 401);
    const validation = photoRequestSchema.safeParse(await request.json());
    if (!validation.success) return apiResponse({ error: 'validation_error', message: 'Foto profil tidak valid', fieldErrors: validation.error.flatten().fieldErrors }, 422);

    const { data: helper, error: helperError } = await supabase.from('helper_profiles').select('id').eq('user_id', user.id).single();
    if (helperError || !helper) return createApiError('not_found', 'Profil Helper tidak ditemukan', 404);
    const { data: pending } = await supabase.from('helper_photo_change_requests').select('id').eq('helper_id', helper.id).eq('status', 'pending').maybeSingle();
    if (pending) return createApiError('conflict', 'Masih ada pengajuan foto yang menunggu verifikasi Koordinator', 409);

    const { data: photoRequest, error } = await supabase.from('helper_photo_change_requests').insert({ helper_id: helper.id, foto_wajah_url: validation.data.foto_wajah_url, status: 'pending' }).select('id, status, foto_wajah_url, diajukan_at').single();
    if (error) return createApiError('server_error', error.message, 500);
    return apiResponse({ message: 'Foto baru dikirim untuk verifikasi Koordinator', request: photoRequest }, 201);
  } catch (error: unknown) {
    return createApiError('server_error', error instanceof Error ? error.message : 'Terjadi kesalahan server', 500);
  }
}
