import { createClient, createAdminClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

type CoordinatorInfo = {
  wilayah: string;
  tingkat: 'rt' | 'rw';
  kelurahan: string | null;
  kecamatan: string | null;
  kabupaten_kota: string | null;
  provinsi: string | null;
  rt: number | null;
  rw: number | null;
};

type LansiaRecord = {
  id: string;
  nama: string;
  alamat: string;
  rt: number | null;
  rw: number | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kabupaten_kota: string | null;
  provinsi: string | null;
  catatan_kondisi: string | null;
  kebutuhan_khusus?: string | null;
  tingkat_mobilitas?: string | null;
  umur?: number | null;
  foto_url: string | null;
  dokumen_identitas_lansia_url: string | null;
  dokumen_hubungan_keluarga_url: string | null;
  created_at: string;
  keluarga?: {
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
};

function matchLansiaToCoordinator(lansia: LansiaRecord, coord: CoordinatorInfo): boolean {
  const lKel = (lansia.kelurahan || '').trim().toLowerCase();
  const lKec = (lansia.kecamatan || '').trim().toLowerCase();
  const cKel = (coord.kelurahan || '').trim().toLowerCase();
  const cKec = (coord.kecamatan || '').trim().toLowerCase();

  // 1. Structured administrative match
  if (lKel && cKel) {
    if (lKel !== cKel) return false;
    if (lKec && cKec && lKec !== cKec) return false;
    if (coord.rw !== null && lansia.rw !== coord.rw) return false;
    if (coord.tingkat === 'rt' && coord.rt !== null && lansia.rt !== coord.rt) return false;
    return true;
  }

  // 2. Alamat string fallback (for historical or legacy records without separate columns)
  const alamat = (lansia.alamat || '').toLowerCase();
  if (cKel && !alamat.includes(cKel)) {
    if (cKec && !alamat.includes(cKec)) return false;
  }

  if (coord.rw !== null) {
    const rwPatterns = [
      `rw ${coord.rw}`,
      `rw 0${coord.rw}`,
      `rw/${coord.rw}`,
      `rw/0${coord.rw}`,
      `rw${coord.rw}`,
    ];
    const hasRw = rwPatterns.some((pattern) => alamat.includes(pattern));
    if (!hasRw) return false;
  }

  if (coord.tingkat === 'rt' && coord.rt !== null) {
    const rtPatterns = [
      `rt ${coord.rt}`,
      `rt 0${coord.rt}`,
      `rt/${coord.rt}`,
      `rt/0${coord.rt}`,
      `rt${coord.rt}`,
    ];
    const hasRt = rtPatterns.some((pattern) => alamat.includes(pattern));
    if (!hasRt) return false;
  }

  return true;
}

// GET /api/koordinator/lansia — daftar lansia di wilayah tugas Koordinator
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login terlebih dahulu', 401);
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role, kelurahan, kecamatan, kabupaten_kota, provinsi, rt, rw, full_name')
      .eq('id', user.id)
      .maybeSingle();

    const role = userProfile?.role || user.user_metadata?.role;
    if (role !== 'koordinator' && role !== 'admin') {
      return createApiError('forbidden', 'Hanya Koordinator atau Admin yang dapat mengakses halaman ini', 403);
    }

    const admin = await createAdminClient();

    // If role is admin, return all lansia
    if (role === 'admin') {
      const { data: profiles, error } = await admin
        .from('lansia_profiles')
        .select('*, keluarga:users!lansia_profiles_keluarga_id_fkey(full_name, phone, email)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        return createApiError('server_error', error.message, 500);
      }

      const formatted = (profiles ?? []).map((p) => ({
        ...p,
        nama_keluarga: p.keluarga?.full_name || 'Keluarga Rangkul',
        telepon_keluarga: p.keluarga?.phone || null,
        email_keluarga: p.keluarga?.email || null,
      }));

      return apiResponse({
        profiles: formatted,
        scope: 'admin_all',
        wilayah_label: 'Seluruh Wilayah (Admin)',
      }, 200);
    }

    // Role is Koordinator
    const { data: kp } = await admin
      .from('koordinator_profiles')
      .select('id, wilayah, tingkat, status')
      .eq('user_id', user.id)
      .maybeSingle();

    const coordInfo: CoordinatorInfo = {
      wilayah: kp?.wilayah || 'Wilayah Koordinator',
      tingkat: (kp?.tingkat as 'rt' | 'rw') || 'rt',
      kelurahan: userProfile?.kelurahan || null,
      kecamatan: userProfile?.kecamatan || null,
      kabupaten_kota: userProfile?.kabupaten_kota || null,
      provinsi: userProfile?.provinsi || null,
      rt: typeof userProfile?.rt === 'number' ? userProfile.rt : null,
      rw: typeof userProfile?.rw === 'number' ? userProfile.rw : null,
    };

    // Construct human-readable label
    let wilayahLabel = kp?.wilayah || '';
    if (!wilayahLabel && coordInfo.kelurahan) {
      const rtRw = coordInfo.tingkat === 'rt' && coordInfo.rt
        ? `RT ${String(coordInfo.rt).padStart(2, '0')} / RW ${String(coordInfo.rw || 0).padStart(2, '0')}`
        : `RW ${String(coordInfo.rw || 0).padStart(2, '0')}`;
      wilayahLabel = `${rtRw}, Kel. ${coordInfo.kelurahan}, ${coordInfo.kecamatan || ''}`;
    }

    const { data: allProfiles, error } = await admin
      .from('lansia_profiles')
      .select('*, keluarga:users!lansia_profiles_keluarga_id_fkey(full_name, phone, email)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return createApiError('server_error', error.message, 500);
    }

    const matchedProfiles = (allProfiles ?? []).filter((p) =>
      matchLansiaToCoordinator(p as unknown as LansiaRecord, coordInfo)
    );

    const formatted = matchedProfiles.map((p) => ({
      ...p,
      nama_keluarga: p.keluarga?.full_name || 'Keluarga Rangkul',
      telepon_keluarga: p.keluarga?.phone || null,
      email_keluarga: p.keluarga?.email || null,
    }));

    return apiResponse({
      profiles: formatted,
      scope: coordInfo.tingkat,
      wilayah_label: wilayahLabel,
      total: formatted.length,
    }, 200);

  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
