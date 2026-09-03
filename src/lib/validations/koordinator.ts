import { z } from 'zod';
import { privateStorageReferenceSchema } from '@/lib/validations/storage';

export const koordinatorApplySchema = z.object({
  wilayah: z.string().min(3, 'Nama wilayah minimal 3 karakter'),
  tingkat: z.enum(['rt', 'rw'], {
    error: 'Tingkat harus rt atau rw',
  }),
  dokumen_url: privateStorageReferenceSchema,
  ktp_url: privateStorageReferenceSchema.optional().nullable(),
  foto_url: privateStorageReferenceSchema.optional().nullable(),
  provinsi: z.string().min(1, 'Provinsi wajib diisi'),
  kabupaten_kota: z.string().min(1, 'Kabupaten/Kota wajib diisi'),
  kecamatan: z.string().min(1, 'Kecamatan wajib diisi'),
  kelurahan: z.string().min(1, 'Kelurahan wajib diisi'),
  rt: z.number().int().min(1, 'RT wajib diisi'),
  rw: z.number().int().min(1, 'RW wajib diisi'),
});

export type KoordinatorApplyInput = z.infer<typeof koordinatorApplySchema>;

export const koordinatorActionSchema = z.object({
  catatan: z.string().max(500).optional(),
});

export const koordinatorRejectSchema = z.object({
  alasan: z.string().min(5, 'Alasan penolakan wajib diisi minimal 5 karakter'),
  foto_url: privateStorageReferenceSchema.optional().nullable(),
});

export type KoordinatorRejectInput = z.infer<typeof koordinatorRejectSchema>;

export const koordinatorStatusSchema = z
  .object({
    status: z.enum(['verified', 'rejected'], {
      error: 'Status harus verified atau rejected',
    }),
    alasan: z.string().min(5).optional(),
    catatan: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'rejected' && (!data.alasan || data.alasan.trim().length < 5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alasan'],
        message: 'Alasan penolakan wajib diisi minimal 5 karakter',
      });
    }
  });

export type KoordinatorStatusInput = z.infer<typeof koordinatorStatusSchema>;

export const promoteHelperSchema = z.object({
  identitas_valid: z.literal(true, {
    message: 'Identitas harus divalidasi'
  }),
  dikenal_warga: z.literal(true, {
    message: 'Harus dikenal warga sekitar'
  }),
  wawancara_dilakukan: z.literal(true, {
    message: 'Wawancara wajib dilakukan'
  }),
  catatan_koordinator: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
});

export type PromoteHelperInput = z.infer<typeof promoteHelperSchema>;
