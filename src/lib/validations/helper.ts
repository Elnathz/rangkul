import { z } from 'zod';

export const helperProfileSchema = z.object({
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional().or(z.literal('')),
  wilayah_domisili: z.string().min(3, 'Wilayah domisili wajib diisi minimal 3 karakter'),
  domisili_lat: z.number({ message: 'Koordinat latitude wajib diisi' }),
  domisili_lng: z.number({ message: 'Koordinat longitude wajib diisi' }),
  radius_layanan_km: z.number().min(1, 'Radius minimal 1 km').max(25, 'Radius maksimal 25 km').default(5),
  ktp_url: z.string().url('URL KTP tidak valid'),
  kategori_ids: z
    .array(z.string({ message: 'ID kategori tidak valid' }))
    .min(1, 'Pilih minimal 1 kategori layanan'),
  provinsi: z.string().min(1, 'Provinsi wajib diisi'),
  kabupaten_kota: z.string().min(1, 'Kabupaten/Kota wajib diisi'),
  kecamatan: z.string().min(1, 'Kecamatan wajib diisi'),
  kelurahan: z.string().min(1, 'Kelurahan wajib diisi'),
  rt: z.number().int().min(1, 'RT wajib diisi'),
  rw: z.number().int().min(1, 'RW wajib diisi'),
});

export type HelperProfileInput = z.infer<typeof helperProfileSchema>;

export const helperApproveSchema = z.object({
  catatan: z.string().max(500).optional(),
});

export type HelperApproveInput = z.infer<typeof helperApproveSchema>;

export const helperRejectSchema = z.object({
  alasan: z.string().min(5, 'Alasan penolakan wajib diisi minimal 5 karakter'),
});

export type HelperRejectInput = z.infer<typeof helperRejectSchema>;

