import { z } from "zod";
import { privateStorageReferenceSchema } from "@/lib/validations/storage";

const score = z.coerce.number().int().min(1).max(5);

export const taskEvidenceSchema = z.object({
  foto_bukti_url: privateStorageReferenceSchema,
  catatan_kondisi: z.string().trim().min(10, "Catatan kondisi minimal 10 karakter").max(2000),
  skor_energi: score,
  skor_mobilitas: score,
  skor_mood: score,
  skor_nafsu_makan: score,
  skor_tidur: score,
  cerita_hari_ini: z.string().trim().min(10, "Cerita Hari Ini (Memory Capsule) minimal 10 karakter").max(2000),
  client_submission_id: z.string().uuid("ID pengiriman tidak valid"),
});

export type TaskEvidenceInput = z.infer<typeof taskEvidenceSchema>;
