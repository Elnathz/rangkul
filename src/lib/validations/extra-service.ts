import { z } from "zod";

export const extraServiceRequestSchema = z.object({
  nama_layanan: z.string().trim().min(3, "Nama layanan minimal 3 karakter").max(120, "Nama layanan terlalu panjang"),
  biaya: z.coerce.number().finite("Biaya harus berupa angka").positive("Biaya harus lebih dari nol"),
});

export const extraServiceDecisionSchema = z.object({
  decision: z.enum(["disetujui", "ditolak"]),
});

export type ExtraServiceRequestInput = z.infer<typeof extraServiceRequestSchema>;
export type ExtraServiceDecisionInput = z.infer<typeof extraServiceDecisionSchema>;
