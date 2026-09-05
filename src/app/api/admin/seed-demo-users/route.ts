import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { adminAuthErrorResponse, requireAdmin } from '@/lib/admin/auth';
import type { Database } from '@/types/database';

type DemoRole = Database['public']['Enums']['user_role'];

type DemoUser = {
  email: string;
  username: string;
  full_name: string;
  role: DemoRole;
  phone: string;
  alamat_detail: string | null;
  rt: number | null;
  rw: number | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kabupaten_kota: string | null;
  provinsi: string | null;
  avatar_url?: string | null;
};

const DEMO_PASSWORD = 'Rangkul2026*';
const DEMO_LOCATION = {
  kelurahan: 'Pleburan',
  kecamatan: 'Semarang Selatan',
  kabupaten_kota: 'Kota Semarang',
  provinsi: 'Jawa Tengah',
} as const;
const KEDUNGPANE_LOCATION = {
  kelurahan: 'Kedungpane',
  kecamatan: 'Mijen',
  kabupaten_kota: 'Kota Semarang',
  provinsi: 'Jawa Tengah',
} as const;

const demoUsers = [
  {
    email: 'ratnakeluarga@rangkul.id',
    username: 'ratnakeluarga',
    full_name: 'Ratna Wulandari',
    role: 'keluarga',
    phone: '081234567801',
    alamat_detail: 'Jl. Pleburan Barat No. 10',
    rt: 2,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/avatars/avatar-ratna.jpg',
  },
  {
    email: 'mayakeluarga@rangkul.id',
    username: 'mayakeluarga',
    full_name: 'Maya Lestari',
    role: 'keluarga',
    phone: '081234567802',
    alamat_detail: 'Jl. Pleburan Barat No. 11',
    rt: 3,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/helper-ayu.jpg',
  },
  {
    email: 'rintokeluarga@rangkul.id',
    username: 'rintokeluarga',
    full_name: 'Rinto Prabowo',
    role: 'keluarga',
    phone: '081234567803',
    alamat_detail: 'Jl. Pleburan Timur No. 12',
    rt: 4,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang2.jpg',
  },
  {
    email: 'dewikeluarga@rangkul.id',
    username: 'dewikeluarga',
    full_name: 'Dewi Kartika',
    role: 'keluarga',
    phone: '081234567804',
    alamat_detail: 'Jl. Pleburan Timur No. 13',
    rt: 5,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang4.jpeg',
  },
  {
    email: 'suryakeluarga@rangkul.id',
    username: 'suryakeluarga',
    full_name: 'Surya Wijaya',
    role: 'keluarga',
    phone: '081234567805',
    alamat_detail: 'Jl. Kedungpane Raya No. 8',
    rt: 1,
    rw: 2,
    ...KEDUNGPANE_LOCATION,
    avatar_url: '/images/helpers/orang3.jpg',
  },
  {
    email: 'wagimankoordinator@rangkul.id',
    username: 'wagimankoordinator',
    full_name: 'Wagiman Popo',
    role: 'koordinator',
    phone: '081234567811',
    alamat_detail: null,
    rt: null,
    rw: null,
    kelurahan: null,
    kecamatan: null,
    kabupaten_kota: null,
    provinsi: null,
    avatar_url: '/images/avatars/avatar-wagiman.jpg',
  },
  {
    email: 'andihelper@rangkul.id',
    username: 'andihelper',
    full_name: 'Andi Sudarto',
    role: 'helper',
    phone: '081234567821',
    alamat_detail: null,
    rt: null,
    rw: null,
    kelurahan: null,
    kecamatan: null,
    kabupaten_kota: null,
    provinsi: null,
    avatar_url: '/images/avatars/avatar-andi.jpg',
  },
  {
    email: 'budikoordinator@rangkul.id',
    username: 'budikoordinator',
    full_name: 'Budi Santoso',
    role: 'koordinator',
    phone: '081234567815',
    alamat_detail: 'Jl. Pleburan Barat No. 19',
    rt: 1,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang5.jpeg',
  },
  {
    email: 'sulikoordinator@rangkul.id',
    username: 'sulikoordinator',
    full_name: 'Suli Hartini',
    role: 'koordinator',
    phone: '081234567812',
    alamat_detail: 'Jl. Pleburan Barat No. 20',
    rt: 2,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/helper-sarah.jpg',
  },
  {
    email: 'aguskoordinator@rangkul.id',
    username: 'aguskoordinator',
    full_name: 'Agus Salim',
    role: 'koordinator',
    phone: '081234567814',
    alamat_detail: 'Jl. Pleburan Barat No. 22',
    rt: 4,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang3.jpg',
  },
  {
    email: 'rahmatkoordinator@rangkul.id',
    username: 'rahmatkoordinator',
    full_name: 'Rahmat Hidayat',
    role: 'koordinator',
    phone: '081234567813',
    alamat_detail: 'Jl. Pleburan Barat No. 21',
    rt: 5,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang2.jpg',
  },
  {
    email: 'darmokoordinator@rangkul.id',
    username: 'darmokoordinator',
    full_name: 'Darmo Prasetyo',
    role: 'koordinator',
    phone: '081234567816',
    alamat_detail: 'Jl. Kedungpane Raya No. 6',
    rt: 1,
    rw: 2,
    ...KEDUNGPANE_LOCATION,
    avatar_url: '/images/helpers/orang5.jpeg',
  },
  {
    email: 'rinihelper@rangkul.id',
    username: 'rinihelper',
    full_name: 'Rini Kurniasih',
    role: 'helper',
    phone: '081234567822',
    alamat_detail: 'Jl. Pleburan Barat No. 30',
    rt: 2,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/helper-ayu.jpg',
  },
  {
    email: 'dedihelper@rangkul.id',
    username: 'dedihelper',
    full_name: 'Dedi Setiawan',
    role: 'helper',
    phone: '081234567823',
    alamat_detail: 'Jl. Pleburan Barat No. 31',
    rt: 3,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang2.jpg',
  },
  {
    email: 'sarihelper@rangkul.id',
    username: 'sarihelper',
    full_name: 'Sari Wulandari',
    role: 'helper',
    phone: '081234567824',
    alamat_detail: 'Jl. Pleburan Barat No. 32',
    rt: 4,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/helper-sarah.jpg',
  },
  {
    email: 'yusufhelper@rangkul.id',
    username: 'yusufhelper',
    full_name: 'Yusuf Maulana',
    role: 'helper',
    phone: '081234567825',
    alamat_detail: 'Jl. Pleburan Barat No. 33',
    rt: 5,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang3.jpg',
  },
  {
    email: 'dewihelper@rangkul.id',
    username: 'dewihelper',
    full_name: 'Dewi Anggraini',
    role: 'helper',
    phone: '081234567826',
    alamat_detail: 'Jl. Pleburan Timur No. 34',
    rt: 2,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang4.jpeg',
  },
  {
    email: 'arifhelper@rangkul.id',
    username: 'arifhelper',
    full_name: 'Arif Pratama',
    role: 'helper',
    phone: '081234567827',
    alamat_detail: 'Jl. Pleburan Timur No. 35',
    rt: 3,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang5.jpeg',
  },
  {
    email: 'linahelper@rangkul.id',
    username: 'linahelper',
    full_name: 'Lina Kurniawan',
    role: 'helper',
    phone: '081234567828',
    alamat_detail: 'Jl. Pleburan Timur No. 36',
    rt: 4,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang6.jpeg',
  },
  {
    email: 'fajarhelper@rangkul.id',
    username: 'fajarhelper',
    full_name: 'Fajar Nugroho',
    role: 'helper',
    phone: '081234567829',
    alamat_detail: 'Jl. Pleburan Barat No. 37',
    rt: 1,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/helpers/orang1.jpeg',
  },
  {
    email: 'bagushelper@rangkul.id',
    username: 'bagushelper',
    full_name: 'Bagus Santoso',
    role: 'helper',
    phone: '081234567830',
    alamat_detail: 'Jl. Kedungpane Raya No. 10',
    rt: 1,
    rw: 2,
    ...KEDUNGPANE_LOCATION,
    avatar_url: '/images/helpers/orang2.jpg',
  },
  {
    email: 'demoadmin@rangkul.id',
    username: 'demoadmin',
    full_name: 'Admin Demo Rangkul',
    role: 'admin',
    phone: '081234567899',
    alamat_detail: 'Jl. Pleburan Tengah No. 99',
    rt: 9,
    rw: 5,
    ...DEMO_LOCATION,
    avatar_url: '/images/avatars/avatar-admin.jpg',
  },
] satisfies DemoUser[];

type CoordinatorProfileSeed = {
  username: string;
  wilayah: string;
  tingkat: Database['public']['Enums']['koordinator_tingkat'];
  status: Database['public']['Enums']['koordinator_status'];
  dokumen_url: string | null;
  domisili_lat: number;
  domisili_lng: number;
  diverifikasi_oleh: 'demoadmin' | null;
  diverifikasi_at: 'now' | null;
  foto_url?: string | null;
};

const coordinatorProfiles: CoordinatorProfileSeed[] = [
  {
    username: 'wagimankoordinator',
    wilayah: 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    tingkat: 'rt',
    status: 'verified',
    dokumen_url: 'demo/dokumen_koordinator/dokumen-koordinator-demo.pdf',
    domisili_lat: -7.0051,
    domisili_lng: 110.4381,
    diverifikasi_oleh: 'demoadmin',
    diverifikasi_at: 'now',
    foto_url: '/images/avatars/avatar-wagiman.jpg',
  },
  {
    username: 'budikoordinator',
    wilayah: 'RT 01 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    tingkat: 'rt',
    status: 'verified',
    dokumen_url: 'demo://koordinator-rt2',
    domisili_lat: -7.0045,
    domisili_lng: 110.4375,
    diverifikasi_oleh: 'demoadmin',
    diverifikasi_at: 'now',
    foto_url: '/images/helpers/orang5.jpeg',
  },
  {
    username: 'sulikoordinator',
    wilayah: 'RT 02 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    tingkat: 'rt',
    status: 'verified',
    dokumen_url: 'demo://koordinator-rt3',
    domisili_lat: -7.0048,
    domisili_lng: 110.4378,
    diverifikasi_oleh: 'demoadmin',
    diverifikasi_at: 'now',
    foto_url: '/images/helpers/helper-sarah.jpg',
  },
  {
    username: 'aguskoordinator',
    wilayah: 'RT 04 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    tingkat: 'rt',
    status: 'verified',
    dokumen_url: 'demo://koordinator-rt4',
    domisili_lat: -7.0061,
    domisili_lng: 110.4391,
    diverifikasi_oleh: 'demoadmin',
    diverifikasi_at: 'now',
    foto_url: '/images/helpers/orang3.jpg',
  },
  {
    username: 'rahmatkoordinator',
    wilayah: 'RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    tingkat: 'rw',
    status: 'verified',
    dokumen_url: 'demo://koordinator-rw05',
    domisili_lat: -7.005,
    domisili_lng: 110.438,
    diverifikasi_oleh: 'demoadmin',
    diverifikasi_at: 'now',
    foto_url: '/images/helpers/orang2.jpg',
  },
  {
    username: 'darmokoordinator',
    wilayah: 'RT 01 / RW 02, Kelurahan Kedungpane, Kecamatan Mijen, Kota Semarang, Jawa Tengah',
    tingkat: 'rt',
    status: 'verified',
    dokumen_url: 'demo://koordinator-kedungpane',
    domisili_lat: -7.0762,
    domisili_lng: 110.3273,
    diverifikasi_oleh: 'demoadmin',
    diverifikasi_at: 'now',
    foto_url: '/images/helpers/orang5.jpeg',
  },
];

const helperProfiles = [
  {
    username: 'andihelper',
    bio: 'Helper utama untuk skenario demo.',
    wilayah_domisili: 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0051,
    domisili_lng: 110.4381,
    is_available: true,
    radius_layanan_km: 5,
    koordinator_username: 'wagimankoordinator',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'probation',
    tugas_selesai_berturut: 0,
    total_tugas_selesai: 0,
    foto_wajah_url: '/images/avatars/avatar-andi.jpg',
  },
  {
    username: 'rinihelper',
    bio: 'Helper terpercaya wilayah RT 02.',
    wilayah_domisili: 'RT 02 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0041,
    domisili_lng: 110.4371,
    is_available: true,
    radius_layanan_km: 2,
    koordinator_username: 'sulikoordinator',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'terpercaya',
    tugas_selesai_berturut: 7,
    total_tugas_selesai: 7,
    foto_wajah_url: '/images/helpers/helper-ayu.jpg',
  },
  {
    username: 'dedihelper',
    bio: 'Helper terpercaya wilayah RT 03.',
    wilayah_domisili: 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0052,
    domisili_lng: 110.4382,
    is_available: true,
    radius_layanan_km: 3,
    koordinator_username: 'wagimankoordinator',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'terpercaya',
    tugas_selesai_berturut: 6,
    total_tugas_selesai: 6,
    foto_wajah_url: '/images/helpers/orang2.jpg',
  },
  {
    username: 'sarihelper',
    bio: 'Helper terpercaya wilayah RT 04.',
    wilayah_domisili: 'RT 04 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0062,
    domisili_lng: 110.4392,
    is_available: true,
    radius_layanan_km: 4,
    koordinator_username: 'aguskoordinator',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'terpercaya',
    tugas_selesai_berturut: 8,
    total_tugas_selesai: 8,
    foto_wajah_url: '/images/helpers/helper-sarah.jpg',
  },
  {
    username: 'yusufhelper',
    bio: 'Helper terpercaya dengan fallback Admin untuk wilayah baru.',
    wilayah_domisili: 'RT 05 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0072,
    domisili_lng: 110.4402,
    is_available: true,
    radius_layanan_km: 5,
    koordinator_username: null,
    verified_by_admin_fallback: true,
    status: 'verified',
    tingkat_kepercayaan: 'terpercaya',
    tugas_selesai_berturut: 5,
    total_tugas_selesai: 5,
    foto_wajah_url: '/images/helpers/orang3.jpg',
  },
  {
    username: 'dewihelper',
    bio: 'Helper baru yang masih probation.',
    wilayah_domisili: 'RT 02 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0043,
    domisili_lng: 110.4373,
    is_available: true,
    radius_layanan_km: 2,
    koordinator_username: 'sulikoordinator',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'probation',
    tugas_selesai_berturut: 1,
    total_tugas_selesai: 1,
    foto_wajah_url: '/images/helpers/orang4.jpeg',
  },
  {
    username: 'arifhelper',
    bio: 'Helper baru probation untuk demo approval.',
    wilayah_domisili: 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0053,
    domisili_lng: 110.4383,
    is_available: true,
    radius_layanan_km: 3,
    koordinator_username: 'wagimankoordinator',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'probation',
    tugas_selesai_berturut: 0,
    total_tugas_selesai: 0,
    foto_wajah_url: '/images/helpers/orang5.jpeg',
  },
  {
    username: 'linahelper',
    bio: 'Helper dengan dua laporan aktif untuk demo moderasi.',
    wilayah_domisili: 'RT 04 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0063,
    domisili_lng: 110.4393,
    is_available: false,
    radius_layanan_km: 4,
    koordinator_username: 'aguskoordinator',
    verified_by_admin_fallback: false,
    status: 'under_review',
    tingkat_kepercayaan: 'probation',
    tugas_selesai_berturut: 0,
    total_tugas_selesai: 0,
    foto_wajah_url: '/images/helpers/orang6.jpeg',
  },
  {
    username: 'fajarhelper',
    bio: 'Helper terpercaya wilayah RT 01.',
    wilayah_domisili: 'RT 01 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0046,
    domisili_lng: 110.4376,
    is_available: true,
    radius_layanan_km: 2,
    koordinator_username: 'budikoordinator',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'terpercaya',
    tugas_selesai_berturut: 5,
    total_tugas_selesai: 5,
    foto_wajah_url: '/images/helpers/orang1.jpeg',
  },
  {
    username: 'bagushelper',
    bio: 'Helper terpercaya wilayah Kedungpane.',
    wilayah_domisili: 'RT 01 / RW 02, Kelurahan Kedungpane, Kecamatan Mijen, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0765,
    domisili_lng: 110.3276,
    is_available: true,
    radius_layanan_km: 5,
    koordinator_username: 'darmokoordinator',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'terpercaya',
    tugas_selesai_berturut: 6,
    total_tugas_selesai: 6,
    foto_wajah_url: '/images/helpers/orang2.jpg',
  },
] as const;

type SupabaseAdmin = Awaited<ReturnType<typeof createAdminClient>>;

function toAuthPhone(phone: string) {
  if (!/^08\d{8,12}$/.test(phone)) {
    throw new Error(`Nomor demo ${phone} harus memakai format 08 dan 10 sampai 14 digit`);
  }

  return `+62${phone.slice(1)}`;
}

async function ensureAuthUser(
  supabaseAdmin: SupabaseAdmin,
  demo: DemoUser,
  existingUserId?: string,
) {
  const authPhone = toAuthPhone(demo.phone);

  if (existingUserId) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existingUserId, {
      email: demo.email,
      password: DEMO_PASSWORD,
      phone: authPhone,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        full_name: demo.full_name,
        role: demo.role,
        username: demo.username,
        avatar_url: demo.avatar_url ?? null,
      },
    });

    if (error || !data.user) {
      throw error ?? new Error(`Auth user ${demo.email} tidak mengembalikan data setelah update`);
    }

    return { user: data.user, action: 'updated' as const };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: demo.email,
    password: DEMO_PASSWORD,
    phone: authPhone,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: {
      full_name: demo.full_name,
      role: demo.role,
      username: demo.username,
      avatar_url: demo.avatar_url ?? null,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Auth user ${demo.email} tidak berhasil dibuat`);
  }

  return { user: data.user, action: 'created' as const };
}

export async function GET() {
  try {
    await requireAdmin();
    const supabaseAdmin = await createAdminClient();
    const { data: existingProfiles, error: existingProfilesError } = await supabaseAdmin
      .from('users')
      .select('id, email, username')
      .in('email', demoUsers.map((demo) => demo.email));

    if (existingProfilesError) {
      throw existingProfilesError;
    }

    const existingUserIdsByEmail = new Map(
      (existingProfiles ?? []).map((profile) => [profile.email.toLowerCase(), profile.id]),
    );
    const userIdsByUsername = new Map<string, string>();
    const results: Array<{ email: string; username: string; action: string; id: string }> = [];

    for (const demo of demoUsers) {
      const { user, action } = await ensureAuthUser(
        supabaseAdmin,
        demo,
        existingUserIdsByEmail.get(demo.email.toLowerCase()),
      );
      userIdsByUsername.set(demo.username, user.id);

      const { error: profileError } = await supabaseAdmin.from('users').upsert(
        {
          id: user.id,
          email: demo.email,
          username: demo.username,
          full_name: demo.full_name,
          role: demo.role,
          phone: demo.phone,
          alamat_detail: demo.alamat_detail,
          rt: demo.rt,
          rw: demo.rw,
          kelurahan: demo.kelurahan,
          kecamatan: demo.kecamatan,
          kabupaten_kota: demo.kabupaten_kota,
          provinsi: demo.provinsi,
          account_status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (profileError) {
        throw profileError;
      }

      results.push({ email: demo.email, username: demo.username, action, id: user.id });
    }

    const adminId = userIdsByUsername.get('demoadmin');
    if (!adminId) {
      throw new Error('Akun admin demo tidak ditemukan setelah proses Auth selesai');
    }

    const coordinatorProfileIds = new Map<string, string>();
    const profileTimestamp = new Date().toISOString();

    for (const profile of coordinatorProfiles) {
      const userId = userIdsByUsername.get(profile.username);
      if (!userId) {
        throw new Error(`Akun Koordinator ${profile.username} tidak ditemukan`);
      }

      const { data, error } = await supabaseAdmin
        .from('koordinator_profiles')
        .upsert(
          {
            user_id: userId,
            wilayah: profile.wilayah,
            tingkat: profile.tingkat,
            status: profile.status,
            dokumen_url: profile.dokumen_url,
            domisili_lat: profile.domisili_lat,
            domisili_lng: profile.domisili_lng,
            diverifikasi_oleh: profile.diverifikasi_oleh === 'demoadmin' ? adminId : null,
            diverifikasi_at: profile.diverifikasi_at === 'now' ? profileTimestamp : null,
            foto_url: profile.foto_url ?? null,
            updated_at: profileTimestamp,
          },
          { onConflict: 'user_id' },
        )
        .select('id')
        .single();

      if (error || !data) {
        throw error ?? new Error(`Profil Koordinator ${profile.username} tidak berhasil disimpan`);
      }

      coordinatorProfileIds.set(profile.username, data.id);
    }

    for (const profile of helperProfiles) {
      const userId = userIdsByUsername.get(profile.username);
      if (!userId) {
        throw new Error(`Akun Helper ${profile.username} tidak ditemukan`);
      }

      const coordinatorId = profile.koordinator_username
        ? coordinatorProfileIds.get(profile.koordinator_username)
        : null;

      const { error } = await supabaseAdmin.from('helper_profiles').upsert(
        {
          user_id: userId,
          bio: profile.bio,
          wilayah_domisili: profile.wilayah_domisili,
          domisili_lat: profile.domisili_lat,
          domisili_lng: profile.domisili_lng,
          is_available: profile.is_available,
          radius_layanan_km: profile.radius_layanan_km,
          koordinator_id: coordinatorId ?? null,
          verified_by_admin_fallback: profile.verified_by_admin_fallback,
          status: profile.status,
          tingkat_kepercayaan: profile.tingkat_kepercayaan,
          tugas_selesai_berturut: profile.tugas_selesai_berturut,
          total_tugas_selesai: profile.total_tugas_selesai,
          foto_wajah_url: profile.foto_wajah_url ?? null,
          updated_at: profileTimestamp,
        },
        { onConflict: 'user_id' },
      );

      if (error) {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo accounts seeded successfully via Supabase Auth Admin API',
      password: DEMO_PASSWORD,
      accounts: demoUsers.map(({ username, email, role }) => ({ username, email, role })),
      results,
    });
  } catch (error: unknown) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal menjalankan seed akun demo' },
      { status: 500 },
    );
  }
}
