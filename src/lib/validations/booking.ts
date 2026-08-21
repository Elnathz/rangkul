import { z } from 'zod';

export const createTaskSchema = z.object({
  lansia_id: z.string().min(1, 'ID Lansia tidak valid'),
  service_category_id: z.string().min(1, 'ID Kategori layanan tidak valid'),
  helper_id: z.string().optional(),
  jadwal_waktu: z.string().datetime({ message: 'Format jadwal waktu ISO 8601 tidak valid' }),
  tambahan_waktu_menit: z.number().min(0).optional(),
  catatan: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().or(z.literal('')),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
