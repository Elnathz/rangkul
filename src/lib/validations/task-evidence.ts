import { z } from "zod";

const score = z.coerce.number().int().min(1).max(5);

export const taskEvidenceSchema = z.object({
  foto_bukti_url: z.string().trim().min(1, "Foto bukti wajib diunggah"),
  catatan_kondisi: z.string().trim().min(10, "Catatan kondisi minimal 10 karakter").max(2000),
  skor_energi: score,
  skor_mobilitas: score,
  skor_mood: score,
  skor_nafsu_makan: score,
  skor_tidur: score,
  cerita_hari_ini: z.string().trim().max(2000).nullable().optional(),
  client_submission_id: z.string().uuid("ID pengiriman tidak valid"),
});

export type TaskEvidenceInput = z.infer<typeof taskEvidenceSchema>;
