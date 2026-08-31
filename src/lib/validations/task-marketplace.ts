import { z } from "zod";

export const marketplaceQuerySchema = z.object({
  mode: z.enum(["pelamar", "cepat"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const quickBookingSchema = z.object({
  lansia_id: z.string().uuid("Lansia harus dipilih"),
  service_category_id: z.string().uuid("Kategori layanan harus dipilih"),
  jadwal_waktu: z.string().datetime("Jadwal waktu tidak valid"),
  catatan: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const acceptQuickTaskSchema = z.object({
  task_id: z.string().uuid("ID tugas tidak valid"),
});

export type QuickBookingInput = z.infer<typeof quickBookingSchema>;
export type AcceptQuickTaskInput = z.infer<typeof acceptQuickTaskSchema>;
