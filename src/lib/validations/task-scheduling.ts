import { z } from "zod";

export const cancelTaskSchema = z.object({
  cancellation_reason: z.string().trim().min(10, "Alasan pembatalan minimal 10 karakter").max(500),
});

export const rescheduleTaskSchema = z.object({
  jadwal_waktu: z.string().datetime({ offset: true }),
});
