import { z } from 'zod';

export const createTaskSchema = z.object({
  lansia_id: z.string().min(1, 'ID Lansia tidak valid'),
  service_category_id: z.string().min(1, 'ID Kategori layanan tidak valid'),
  helper_id: z.string().optional().nullable(),
  jadwal_waktu: z.string().datetime({ message: 'Format jadwal waktu ISO 8601 tidak valid' }),
  catatan: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().or(z.literal('')),
  mode_penugasan: z.enum(['langsung', 'pelamar', 'cepat']).optional(),
  expires_at: z.string().datetime({ message: 'Format expires_at tidak valid' }).optional(),
}).superRefine((value, context) => {
  const mode = value.mode_penugasan ?? 'langsung';
  const hasHelper = typeof value.helper_id === 'string' && value.helper_id.trim().length > 0;

  if (mode === 'langsung' && !hasHelper) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['helper_id'],
      message: 'Pilih Helper untuk booking langsung',
    });
  }

  if (mode !== 'langsung' && hasHelper) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['helper_id'],
      message: 'Mode penugasan ini tidak menerima Helper tertentu',
    });
  }
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
