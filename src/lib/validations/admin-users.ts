import { z } from "zod";

export const adminUserRoleSchema = z.enum(["keluarga", "helper", "koordinator"]);
export const accountStatusSchema = z.enum(["active", "restricted", "suspended"]);

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+62|08)\d{8,13}$/, "Nomor telepon harus diawali 08 atau +62");

export const createAdminUserSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  full_name: z.string().trim().min(2).max(120),
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh berisi huruf, angka, dan underscore"),
  phone: phoneSchema.optional(),
  role: adminUserRoleSchema,
});

export const updateAdminUserSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_]+$/).optional(),
  phone: phoneSchema.nullable().optional(),
  rt: z.number().int().min(0).max(999).nullable().optional(),
  rw: z.number().int().min(0).max(999).nullable().optional(),
  kelurahan: z.string().trim().max(120).nullable().optional(),
  kecamatan: z.string().trim().max(120).nullable().optional(),
  kabupaten_kota: z.string().trim().max(120).nullable().optional(),
  provinsi: z.string().trim().max(120).nullable().optional(),
  account_status: accountStatusSchema.optional(),
});

export function normalizeIndonesianPhone(phone: string | null | undefined) {
  if (!phone) return phone ?? null;
  const trimmed = phone.trim();
  if (trimmed.startsWith("+62")) return trimmed;
  if (trimmed.startsWith("08")) return `+62${trimmed.slice(1)}`;
  return trimmed;
}
