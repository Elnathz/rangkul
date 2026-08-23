import { z } from "zod";

export const messageSchema = z.object({
  task_id: z.string().uuid(),
  message: z.string().trim().min(1, "Pesan wajib diisi").max(2000),
});

export const reportSchema = z.object({
  task_id: z.string().uuid(),
  alasan: z.string().trim().min(10, "Alasan laporan minimal 10 karakter").max(2000),
});

export const reportUpdateSchema = z.object({
  status: z.enum(["ditindak", "selesai"]),
});

export const emergencySchema = z.object({
  task_id: z.string().uuid(),
});
