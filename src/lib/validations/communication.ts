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
  helper_status: z.enum(["verified", "suspended"]).optional(),
  decision_reason: z.string().trim().min(10).max(500).optional(),
}).superRefine((value, context) => {
  if (value.helper_status && !value.decision_reason) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["decision_reason"], message: "Alasan keputusan wajib diisi" });
  }
  if (value.helper_status === "verified" && value.status !== "selesai") {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["status"], message: "Pemulihan Helper hanya dapat dilakukan saat laporan selesai" });
  }
});

export const emergencySchema = z.object({
  task_id: z.string().uuid(),
});
