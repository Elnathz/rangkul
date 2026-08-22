import { z } from 'zod';

export const lansiaProfileSchema = z.object({
  nama: z.string().min(2, 'Nama lansia minimal 2 karakter'),
  alamat: z.string().min(5, 'Alamat lengkap minimal 5 karakter'),
  lat: z.number(),
  lng: z.number(),
  catatan_kondisi: z.string().optional().or(z.literal('')),
  dokumen_identitas_lansia_url: z.string().url('URL dokumen identitas tidak valid').optional().or(z.literal('')),
  dokumen_hubungan_keluarga_url: z.string().url('URL dokumen hubungan keluarga tidak valid').optional().or(z.literal('')),
  foto_url: z.string().url('URL foto tidak valid').optional().or(z.literal('')),
  hubungan_keluarga: z.string().min(1, 'Hubungan keluarga wajib diisi'),
  provinsi: z.string().min(1, 'Provinsi wajib diisi'),
  kabupaten_kota: z.string().min(1, 'Kabupaten/Kota wajib diisi'),
  kecamatan: z.string().min(1, 'Kecamatan wajib diisi'),
  kelurahan: z.string().min(1, 'Kelurahan wajib diisi'),
  rt: z.number().int().min(1, 'RT wajib diisi'),
  rw: z.number().int().min(1, 'RW wajib diisi'),
  umur: z.number().int().min(50, 'Lansia minimal berumur 50 tahun'),
  tingkat_mobilitas: z.string().min(1, 'Tingkat mobilitas wajib diisi'),
  kebutuhan_khusus: z.string().optional().or(z.literal('')),
});

export type LansiaProfileInput = z.infer<typeof lansiaProfileSchema>;
