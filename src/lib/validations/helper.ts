import { z } from 'zod';

export const helperProfileSchema = z.object({
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional(),
  wilayah_domisili: z.string().min(3, 'Wilayah domisili wajib diisi'),
  domisili_lat: z.number(),
  domisili_lng: z.number(),
  radius_layanan_km: z.number().min(1).max(25).default(5),
  ktp_url: z.string().url('URL KTP tidak valid'),
});

export type HelperProfileInput = z.infer<typeof helperProfileSchema>;
