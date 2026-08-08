import { z } from 'zod';

export const koordinatorApplySchema = z.object({
  wilayah: z.string().min(3, 'Nama wilayah minimal 3 karakter'),
  tingkat: z.enum(['rt', 'rw'], {
    error: 'Tingkat harus rt atau rw',
  }),
  dokumen_url: z.string().url('URL dokumen jabatan tidak valid'),
  ktp_url: z.string().url('URL KTP tidak valid').optional(),
});

export type KoordinatorApplyInput = z.infer<typeof koordinatorApplySchema>;

export const koordinatorActionSchema = z.object({
  catatan: z.string().max(500).optional(),
});

export const koordinatorRejectSchema = z.object({
  alasan: z.string().min(5, 'Alasan penolakan wajib diisi minimal 5 karakter'),
});

export type KoordinatorRejectInput = z.infer<typeof koordinatorRejectSchema>;

export const promoteHelperSchema = z.object({
  identitas_valid: z.literal(true, {
    errorMap: () => ({ message: 'Identitas harus divalidasi' }),
  }),
  dikenal_warga: z.literal(true, {
    errorMap: () => ({ message: 'Harus dikenal warga sekitar' }),
  }),
  wawancara_dilakukan: z.literal(true, {
    errorMap: () => ({ message: 'Wawancara wajib dilakukan' }),
  }),
  catatan_koordinator: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
});

export type PromoteHelperInput = z.infer<typeof promoteHelperSchema>;
