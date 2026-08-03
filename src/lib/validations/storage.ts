import { z } from 'zod';

export const DOC_TYPES = ['ktp', 'identitas_lansia', 'hubungan_keluarga', 'dokumen_koordinator'] as const;

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadSchema = z.object({
  docType: z.enum(DOC_TYPES, {
    error: 'Tipe dokumen tidak valid',
  }),
});

export type UploadInput = z.infer<typeof uploadSchema>;
