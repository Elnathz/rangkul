import { z } from 'zod';

export const createTaskSchema = z.object({
  lansia_id: z.string().uuid('ID Lansia tidak valid'),
  service_category_id: z.string().uuid('ID Kategori layanan tidak valid'),
  jadwal_waktu: z.string().datetime({ message: 'Format jadwal waktu ISO 8601 tidak valid' }),
  catatan: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
