import { z } from "zod";

export const adminHelperUpdateSchema = z.object({
  status: z.enum(["pending_verification", "verified", "under_review", "rejected", "suspended"]).optional(),
  suspend_reason: z.string().trim().min(5).max(500).nullable().optional(),
  assign_fallback: z.boolean().optional(),
});
