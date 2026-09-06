import { z } from 'zod';
import { privateStorageReferenceSchema } from '@/lib/validations/storage';

export const lansiaProfileSchema = z.object({
  nama: z.string().min(2, 'Nama lansia minimal 2 karakter').max(100, 'Nama lansia maksimal 100 karakter'),
  alamat: z.string().min(5, 'Alamat lengkap minimal 5 karakter').max(255, 'Alamat lengkap maksimal 255 karakter'),
  lat: z.number(),
  lng: z.number(),
  catatan_kondisi: z.string().max(1000, 'Catatan kondisi maksimal 1000 karakter').optional().or(z.literal('')),
  dokumen_identitas_lansia_url: privateStorageReferenceSchema,
  dokumen_hubungan_keluarga_url: privateStorageReferenceSchema,
  foto_url: privateStorageReferenceSchema.optional().or(z.literal('')).nullable(),
  hubungan_keluarga: z.string().min(1, 'Hubungan keluarga wajib diisi').max(50, 'Hubungan keluarga maksimal 50 karakter'),
  provinsi: z.string().min(1, 'Provinsi wajib diisi').max(100, 'Provinsi maksimal 100 karakter'),
  kabupaten_kota: z.string().min(1, 'Kabupaten/Kota wajib diisi').max(100, 'Kabupaten/Kota maksimal 100 karakter'),
  kecamatan: z.string().min(1, 'Kecamatan wajib diisi').max(100, 'Kecamatan maksimal 100 karakter'),
  kelurahan: z.string().min(1, 'Kelurahan wajib diisi').max(100, 'Kelurahan maksimal 100 karakter'),
  rt: z.number().int().min(1, 'RT wajib diisi').max(999, 'Nomor RT maksimal 3 digit'),
  rw: z.number().int().min(1, 'RW wajib diisi').max(999, 'Nomor RW maksimal 3 digit'),
  umur: z.number().int().min(50, 'Lansia minimal berumur 50 tahun').max(130, 'Umur lansia maksimal 130 tahun'),
  tingkat_mobilitas: z.string().min(1, 'Tingkat mobilitas wajib diisi').max(100, 'Tingkat mobilitas maksimal 100 karakter'),
  kebutuhan_khusus: z.string().max(1000, 'Kebutuhan khusus maksimal 1000 karakter').optional().or(z.literal('')),
});

export type LansiaProfileInput = z.infer<typeof lansiaProfileSchema>;
