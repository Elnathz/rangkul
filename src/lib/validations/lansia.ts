import { z } from 'zod';

export const lansiaProfileSchema = z.object({
  nama: z.string().min(2, 'Nama lansia minimal 2 karakter'),
  alamat: z.string().min(5, 'Alamat lengkap minimal 5 karakter'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  catatan_kondisi: z.string().optional(),
  dokumen_identitas_lansia_url: z.string().url('URL dokumen identitas tidak valid').optional(),
  dokumen_hubungan_keluarga_url: z.string().url('URL dokumen hubungan keluarga tidak valid').optional(),
});

export type LansiaProfileInput = z.infer<typeof lansiaProfileSchema>;
