import { z } from 'zod';

export const koordinatorApplySchema = z.object({
  wilayah: z.string().min(3, 'Nama wilayah minimal 3 karakter'),
  tingkat: z.enum(['rt', 'rw'], {
    error: 'Tingkat harus rt atau rw',
  }),
  dokumen_url: z.string().url('URL dokumen jabatan tidak valid'),
  ktp_url: z.string().url('URL KTP tidak valid').optional(),
  foto_url: z.string().url('URL Foto Wajah tidak valid').optional(),
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
  foto_url: z.string().url('URL Foto tidak valid').optional(),
});

export type KoordinatorRejectInput = z.infer<typeof koordinatorRejectSchema>;

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
