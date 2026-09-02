import { z } from "zod";

export const adminHelperUpdateSchema = z.object({
  bio: z.string().trim().max(1000).nullable().optional(),
}).strict().refine((data) => Object.values(data).some((v) => v !== undefined), { message: "Tidak ada perubahan yang dikirim" });

export const adminHelperDecisionSchema = z.object({
  decision: z.enum(["suspend", "restore"]),
  reason: z.string().trim().min(10).max(500),
}).strict();

export const adminFallbackSchema = z.object({
  reason: z.string().trim().min(10).max(500),
}).strict();
