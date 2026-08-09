import { z } from 'zod';

export const serviceCategorySchema = z.object({
  nama: z.string().min(3, 'Nama kategori minimal 3 karakter').max(100, 'Nama kategori maksimal 100 karakter'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  estimasi_durasi_menit: z.number().int().positive('Durasi harus berupa angka positif'),
  harga_dasar: z.number().positive('Harga dasar harus berupa angka positif'),
  is_high_risk: z.boolean().default(false),
  is_active: z.boolean().default(true),
  tingkat: z.enum(['ringan', 'sedang', 'berat']),
  parent_id: z.string().uuid().nullable().optional(),
  jarak_min_km: z.number().nullable().optional(),
  jarak_max_km: z.number().nullable().optional(),
});

export type ServiceCategoryInput = z.infer<typeof serviceCategorySchema>;
