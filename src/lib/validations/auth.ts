import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string()
    .min(6, 'Username minimal 6 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username hanya boleh mengandung huruf, angka, titik, underscore, dan dash'),
  email: z.string().email('Email tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .max(128, 'Password maksimal 128 karakter')
    .regex(/[^A-Za-z0-9]/, 'Password harus mengandung minimal 1 simbol'),
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phone: z.string().optional(),
  role: z.enum(['keluarga', 'helper', 'koordinator'], {
    error: 'Peran tidak valid',
  }),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username atau email wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
