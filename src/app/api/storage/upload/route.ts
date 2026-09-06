import { createClient, createAdminClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import {
  ALLOWED_FILE_TYPES,
  canUploadDocumentType,
  MAX_FILE_SIZE,
  uploadSchema,
} from '@/lib/validations/storage';
import { extractOwnedPrivateObjectPath } from '@/lib/storage/private-object';

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

    const docTypeValidation = uploadSchema.safeParse({ docType });
    if (!docTypeValidation.success) {
      return createApiError('validation_error', 'Tipe dokumen tidak valid', 400);
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', authUser.id).maybeSingle();
    const role = profile?.role ?? (authUser.user_metadata?.role as string | undefined);
    if (!canUploadDocumentType(role, docTypeValidation.data.docType)) {
      return createApiError('forbidden', 'Role Anda tidak dapat mengunggah tipe file ini', 403);
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return createApiError('invalid_file_type', 'Hanya PDF, JPG, atau PNG yang diperbolehkan', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return createApiError('file_too_large', 'File maksimal 5MB', 413);
    }

    const buffer = await file.arrayBuffer();
    const magicBytes = new Uint8Array(buffer.slice(0, 8));
    const isValidMagicBytes =
      (magicBytes[0] === 0x25 && magicBytes[1] === 0x50 && magicBytes[2] === 0x44 && magicBytes[3] === 0x46) ||
      (magicBytes[0] === 0xff && magicBytes[1] === 0xd8 && magicBytes[2] === 0xff) ||
      (magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4e && magicBytes[3] === 0x47);

    if (!isValidMagicBytes) {
      return createApiError('invalid_file_type', 'Hanya PDF, JPG, atau PNG yang diperbolehkan', 400);
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${authUser.id}/${docTypeValidation.data.docType}/${Date.now()}-${sanitizedFileName}`;
    if (!extractOwnedPrivateObjectPath(filePath, authUser.id, docTypeValidation.data.docType)) {
      return createApiError('validation_error', 'Lokasi file privat tidak valid', 422);
    }

    const adminSupabase = await createAdminClient();

    const { error: uploadError } = await adminSupabase.storage
      .from('dokumen')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage Upload Error:", uploadError);
      return createApiError('upload_failed', 'Upload file gagal', 500);
    }

    const { data: signedData, error: signedError } = await adminSupabase.storage
      .from('dokumen')
      .createSignedUrl(filePath, 3600); // 1 hour expiration for security

    if (signedError || !signedData) {
      return createApiError('signed_url_failed', 'Gagal membuat signed URL', 500);
    }

    const result = {
      url: signedData.signedUrl,
      path: filePath,
      preview_url: signedData.signedUrl,
    };

    return apiResponse({
      ...result,
      data: result,
    }, 200);
  } catch {
    return createApiError('server_error', 'Upload file gagal', 500);
  }
}
