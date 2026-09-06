import { z } from 'zod';
import { apiResponse, createApiError } from '@/lib/api-response';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { removePrivateObjectsForUser } from '@/lib/storage/private-user-cleanup';

const deleteAccountSchema = z.object({ confirmation: z.literal('HAPUS AKUN') });

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError('unauthorized', 'Anda harus login', 401);

    const validation = deleteAccountSchema.safeParse(await request.json().catch(() => null));
    if (!validation.success) {
      return apiResponse({
        error: 'validation_error',
        message: 'Ketik HAPUS AKUN untuk mengonfirmasi penghapusan akun',
        fieldErrors: validation.error.flatten().fieldErrors,
      }, 422);
    }

    const { error: anonymizeError } = await supabase.rpc('anonymize_own_account');
    if (anonymizeError) return createApiError('conflict', 'Akun belum dapat dianonimkan', 409);

    const admin = await createAdminClient();
    await removePrivateObjectsForUser(admin, user.id);
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id, true);
    if (deleteError) return createApiError('server_error', 'Data sudah dianonimkan, tetapi sesi Auth belum dapat ditutup', 500);

    await supabase.auth.signOut();
    return apiResponse({ message: 'Akun berhasil dianonimkan dan ditutup' });
  } catch {
    return createApiError('server_error', 'Penghapusan akun gagal diproses', 500);
  }
}
