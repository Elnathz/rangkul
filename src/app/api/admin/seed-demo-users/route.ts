import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
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
};

const DEMO_PASSWORD = 'Rangkul2026*';
const DEMO_LOCATION = {
  kelurahan: 'Pleburan',
  kecamatan: 'Semarang Selatan',
  kabupaten_kota: 'Kota Semarang',
  provinsi: 'Jawa Tengah',
} as const;

const demoUsers = [
  {
    email: 'demokeluarga@rangkul.id',
    username: 'demokeluarga',
    full_name: 'Keluarga Demo Satu',
    role: 'keluarga',
    phone: '081234567801',
    alamat_detail: 'Jl. Pleburan Barat No. 10',
    rt: 2,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demokeluarga2@rangkul.id',
    username: 'demokeluarga2',
    full_name: 'Keluarga Demo Dua',
    role: 'keluarga',
    phone: '081234567802',
    alamat_detail: 'Jl. Pleburan Barat No. 11',
    rt: 3,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demokeluarga3@rangkul.id',
    username: 'demokeluarga3',
    full_name: 'Keluarga Demo Tiga',
    role: 'keluarga',
    phone: '081234567803',
    alamat_detail: 'Jl. Pleburan Timur No. 12',
    rt: 4,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demokeluarga4@rangkul.id',
    username: 'demokeluarga4',
    full_name: 'Keluarga Demo Empat',
    role: 'keluarga',
    phone: '081234567804',
    alamat_detail: 'Jl. Pleburan Timur No. 13',
    rt: 5,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'mbahburgas@gmail.com',
    username: 'mbahburgas',
    full_name: 'Mbah Burgas',
    role: 'koordinator',
    phone: '081234567811',
    alamat_detail: null,
    rt: null,
    rw: null,
    kelurahan: null,
    kecamatan: null,
    kabupaten_kota: null,
    provinsi: null,
  },
  {
    email: 'masburgas@gmail.com',
    username: 'masburgas',
    full_name: 'Mas Burgas',
    role: 'helper',
    phone: '081234567821',
    alamat_detail: null,
    rt: null,
    rw: null,
    kelurahan: null,
    kecamatan: null,
    kabupaten_kota: null,
    provinsi: null,
  },
  {
    email: 'demokoordinator2@rangkul.id',
    username: 'demokoordinator2',
    full_name: 'Koordinator Demo RT Dua',
    role: 'koordinator',
    phone: '081234567812',
    alamat_detail: 'Jl. Pleburan Barat No. 20',
    rt: 2,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demokoordinator3@rangkul.id',
    username: 'demokoordinator3',
    full_name: 'Koordinator Demo RT Tiga',
    role: 'koordinator',
    phone: '081234567813',
    alamat_detail: 'Jl. Pleburan Barat No. 21',
    rt: 3,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demokoordinator4@rangkul.id',
    username: 'demokoordinator4',
    full_name: 'Koordinator Demo RW',
    role: 'koordinator',
    phone: '081234567814',
    alamat_detail: 'Jl. Pleburan Barat No. 22',
    rt: 4,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demohelper2@rangkul.id',
    username: 'demohelper2',
    full_name: 'Helper Demo Terpercaya Dua',
    role: 'helper',
    phone: '081234567822',
    alamat_detail: 'Jl. Pleburan Barat No. 30',
    rt: 2,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demohelper3@rangkul.id',
    username: 'demohelper3',
    full_name: 'Helper Demo Terpercaya Tiga',
    role: 'helper',
    phone: '081234567823',
    alamat_detail: 'Jl. Pleburan Barat No. 31',
    rt: 3,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demohelper4@rangkul.id',
    username: 'demohelper4',
    full_name: 'Helper Demo Terpercaya Empat',
    role: 'helper',
    phone: '081234567824',
    alamat_detail: 'Jl. Pleburan Barat No. 32',
    rt: 4,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demohelper5@rangkul.id',
    username: 'demohelper5',
    full_name: 'Helper Demo Fallback Admin',
    role: 'helper',
    phone: '081234567825',
    alamat_detail: 'Jl. Pleburan Barat No. 33',
    rt: 5,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demohelper6@rangkul.id',
    username: 'demohelper6',
    full_name: 'Helper Demo Probation Satu',
    role: 'helper',
    phone: '081234567826',
    alamat_detail: 'Jl. Pleburan Timur No. 34',
    rt: 2,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demohelper7@rangkul.id',
    username: 'demohelper7',
    full_name: 'Helper Demo Probation Dua',
    role: 'helper',
    phone: '081234567827',
    alamat_detail: 'Jl. Pleburan Timur No. 35',
    rt: 3,
    rw: 5,
    ...DEMO_LOCATION,
  },
  {
    email: 'demohelper8@rangkul.id',
    username: 'demohelper8',
    full_name: 'Helper Demo Under Review',
    role: 'helper',
    phone: '081234567828',
    alamat_detail: 'Jl. Pleburan Timur No. 36',
    rt: 4,
    rw: 5,
    ...DEMO_LOCATION,
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
};

const coordinatorProfiles: CoordinatorProfileSeed[] = [
  {
    username: 'mbahburgas',
    wilayah: 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    tingkat: 'rt',
    status: 'pending_verification',
    dokumen_url: null,
    domisili_lat: -7.0051,
    domisili_lng: 110.4381,
    diverifikasi_oleh: null,
    diverifikasi_at: null,
  },
  {
    username: 'demokoordinator2',
    wilayah: 'RT 02 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    tingkat: 'rt',
    status: 'verified',
    dokumen_url: 'demo://koordinator-rt2',
    domisili_lat: -7.0048,
    domisili_lng: 110.4378,
    diverifikasi_oleh: 'demoadmin',
    diverifikasi_at: 'now',
  },
  {
    username: 'demokoordinator3',
    wilayah: 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    tingkat: 'rt',
    status: 'verified',
    dokumen_url: 'demo://koordinator-rt3',
    domisili_lat: -7.0051,
    domisili_lng: 110.4381,
    diverifikasi_oleh: 'demoadmin',
    diverifikasi_at: 'now',
  },
  {
    username: 'demokoordinator4',
    wilayah: 'RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    tingkat: 'rw',
    status: 'verified',
    dokumen_url: 'demo://koordinator-rw',
    domisili_lat: -7.005,
    domisili_lng: 110.438,
    diverifikasi_oleh: 'demoadmin',
    diverifikasi_at: 'now',
  },
];

const helperProfiles = [
  {
    username: 'masburgas',
    bio: 'Helper demo utama Mas Burgas.',
    wilayah_domisili: 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0051,
    domisili_lng: 110.4381,
    is_available: false,
    radius_layanan_km: 5,
    koordinator_username: 'mbahburgas',
    verified_by_admin_fallback: false,
    status: 'pending_verification',
    tingkat_kepercayaan: 'probation',
    tugas_selesai_berturut: 0,
    total_tugas_selesai: 0,
  },
  {
    username: 'demohelper2',
    bio: 'Helper terpercaya wilayah RT 02.',
    wilayah_domisili: 'RT 02 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0041,
    domisili_lng: 110.4371,
    is_available: true,
    radius_layanan_km: 2,
    koordinator_username: 'demokoordinator2',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'terpercaya',
    tugas_selesai_berturut: 7,
    total_tugas_selesai: 7,
  },
  {
    username: 'demohelper3',
    bio: 'Helper terpercaya wilayah RT 03.',
    wilayah_domisili: 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0052,
    domisili_lng: 110.4382,
    is_available: true,
    radius_layanan_km: 3,
    koordinator_username: 'demokoordinator3',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'terpercaya',
    tugas_selesai_berturut: 6,
    total_tugas_selesai: 6,
  },
  {
    username: 'demohelper4',
    bio: 'Helper terpercaya wilayah RT 04.',
    wilayah_domisili: 'RT 04 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0062,
    domisili_lng: 110.4392,
    is_available: true,
    radius_layanan_km: 4,
    koordinator_username: 'demokoordinator3',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'terpercaya',
    tugas_selesai_berturut: 8,
    total_tugas_selesai: 8,
  },
  {
    username: 'demohelper5',
    bio: 'Helper verified dengan fallback Admin untuk wilayah baru.',
    wilayah_domisili: 'RT 06 / RW 06, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
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
  },
  {
    username: 'demohelper6',
    bio: 'Helper baru yang masih probation.',
    wilayah_domisili: 'RT 02 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0043,
    domisili_lng: 110.4373,
    is_available: true,
    radius_layanan_km: 2,
    koordinator_username: 'demokoordinator2',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'probation',
    tugas_selesai_berturut: 1,
    total_tugas_selesai: 1,
  },
  {
    username: 'demohelper7',
    bio: 'Helper baru probation untuk demo approval.',
    wilayah_domisili: 'RT 03 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0053,
    domisili_lng: 110.4383,
    is_available: true,
    radius_layanan_km: 3,
    koordinator_username: 'demokoordinator3',
    verified_by_admin_fallback: false,
    status: 'verified',
    tingkat_kepercayaan: 'probation',
    tugas_selesai_berturut: 0,
    total_tugas_selesai: 0,
  },
  {
    username: 'demohelper8',
    bio: 'Helper dengan dua laporan aktif untuk demo moderasi.',
    wilayah_domisili: 'RT 04 / RW 05, Kelurahan Pleburan, Kecamatan Semarang Selatan, Kota Semarang, Jawa Tengah',
    domisili_lat: -7.0063,
    domisili_lng: 110.4393,
    is_available: false,
    radius_layanan_km: 4,
    koordinator_username: 'demokoordinator3',
    verified_by_admin_fallback: false,
    status: 'under_review',
    tingkat_kepercayaan: 'probation',
    tugas_selesai_berturut: 0,
    total_tugas_selesai: 0,
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
    },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Auth user ${demo.email} tidak berhasil dibuat`);
  }

  return { user: data.user, action: 'created' as const };
}

export async function GET() {
  try {
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
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal menjalankan seed akun demo' },
      { status: 500 },
    );
  }
}
