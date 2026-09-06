import { z } from 'zod';
import { extractPrivateObjectPath } from '@/lib/storage/private-object';

export const DOC_TYPES = ['ktp', 'identitas_lansia', 'hubungan_keluarga', 'dokumen_koordinator', 'foto_lansia', 'foto_keluarga', 'foto_helper', 'foto_koordinator', 'foto_bukti'] as const;

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const privateStorageReferenceSchema = z.string().trim().min(1).refine(
  (value) => extractPrivateObjectPath(value) !== null,
  'Referensi file private tidak valid',
);

export const uploadSchema = z.object({
  docType: z.enum(DOC_TYPES, {
    error: 'Tipe dokumen tidak valid',
  }),
});

export type UploadInput = z.infer<typeof uploadSchema>;

const ROLE_UPLOADS: Record<string, readonly UploadInput['docType'][]> = {
  keluarga: ['foto_lansia', 'identitas_lansia', 'hubungan_keluarga', 'foto_keluarga'],
  helper: ['ktp', 'foto_helper', 'foto_bukti'],
  koordinator: ['ktp', 'dokumen_koordinator', 'foto_koordinator'],
  admin: [...DOC_TYPES],
};

export function canUploadDocumentType(role: string | null | undefined, docType: UploadInput['docType']) {
  return Boolean(role && ROLE_UPLOADS[role]?.includes(docType));
}
