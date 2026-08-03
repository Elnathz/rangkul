import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import {
  ALLOWED_FILE_TYPES,
  DOC_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/validations/storage';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const docType = formData.get('docType') as string | null;

    if (!file) {
      return createApiError('validation_error', 'File wajib diisi', 400);
    }

    if (!docType || !(DOC_TYPES as readonly string[]).includes(docType)) {
      return createApiError('validation_error', 'Tipe dokumen tidak valid', 400);
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return createApiError('invalid_file_type', 'Hanya PDF, JPG, atau PNG yang diperbolehkan', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return createApiError('file_too_large', 'File maksimal 5MB', 413);
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${authUser.id}/${docType}/${Date.now()}-${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('dokumen')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return createApiError('upload_failed', uploadError.message, 500);
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from('dokumen')
      .createSignedUrl(filePath, 3600);

    if (signedError || !signedData) {
      return createApiError('signed_url_failed', 'Gagal membuat signed URL', 500);
    }

    return apiResponse({ url: signedData.signedUrl }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
