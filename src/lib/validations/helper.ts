import { z } from 'zod';

export const helperProfileSchema = z.object({
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional().or(z.literal('')),
  wilayah_domisili: z.string().min(3, 'Wilayah domisili wajib diisi minimal 3 karakter'),
  domisili_lat: z.number({ message: 'Koordinat latitude wajib diisi' }),
  domisili_lng: z.number({ message: 'Koordinat longitude wajib diisi' }),
  radius_layanan_km: z.number().min(1, 'Radius minimal 1 km').max(25, 'Radius maksimal 25 km').default(5),
  ktp_url: z.string().url('URL KTP tidak valid'),
});

export type HelperProfileInput = z.infer<typeof helperProfileSchema>;
