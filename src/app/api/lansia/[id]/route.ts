import { createClient, createAdminClient } from '@/lib/supabase/server';
import { lansiaProfileSchema } from '@/lib/validations/lansia';
import { apiResponse, createApiError } from '@/lib/api-response';
import { resolvePrivatePhotoUrl } from '@/lib/storage/private-object';
import type { Database } from '@/types/database';

// GET /api/lansia/[id] — detail satu lansia milik keluarga yang login
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { id } = await params;

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = userProfile?.role || user.user_metadata?.role || 'keluarga';

    const dbClient = (role === 'admin' || role === 'koordinator') ? await createAdminClient() : supabase;

    let query = dbClient
      .from('lansia_profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null);

    // Jika keluarga, pastikan hanya milik lansia miliknya
    if (role === 'keluarga') {
      query = query.eq('keluarga_id', user.id);
    }

    const { data: profile, error } = await query.maybeSingle();

    if (error || !profile) {
      return createApiError('not_found', 'Profil lansia tidak ditemukan', 404);
    }

    let nama_keluarga: string | null = null;
    let email_keluarga: string | null = null;
    let telepon_keluarga: string | null = null;

    const admin = await createAdminClient();
    if (profile.keluarga_id) {
      const { data: familyUser } = await admin
        .from('users')
        .select('full_name, email, phone')
        .eq('id', profile.keluarga_id)
        .maybeSingle();
      if (familyUser) {
        nama_keluarga = familyUser.full_name || null;
        email_keluarga = familyUser.email || null;
        telepon_keluarga = familyUser.phone || null;
      }
    }

    const sign = (val: string | null) =>
      resolvePrivatePhotoUrl(val, async (path, exp) => {
        const { data, error: signError } = await admin.storage
          .from('dokumen')
          .createSignedUrl(path, exp);
        return signError ? null : data.signedUrl;
      });

    const [foto_url, dokumen_identitas_lansia_url, dokumen_hubungan_keluarga_url] =
      await Promise.all([
        sign(profile.foto_url),
        sign(profile.dokumen_identitas_lansia_url),
        sign(profile.dokumen_hubungan_keluarga_url),
      ]);

    // Query next upcoming task for this lansia
    const { data: upcomingTasks } = await admin
      .from('tasks')
      .select(`
        id,
        status,
        jadwal_waktu,
        harga_final,
        harga_dasar,
        service_categories ( nama, estimasi_durasi_menit ),
        helper_profiles ( id, foto_wajah_url, users ( full_name ) )
      `)
      .eq('lansia_id', id)
      .in('status', ['dikerjakan', 'dikonfirmasi', 'diajukan', 'menunggu_persetujuan_koordinator'])
      .order('jadwal_waktu', { ascending: true })
      .limit(1);

    let next_task = null;
    if (upcomingTasks && upcomingTasks.length > 0) {
      const t = upcomingTasks[0] as unknown as {
        id: string;
        status: string;
        jadwal_waktu: string;
        harga_final: number;
        harga_dasar: number;
        service_categories: { nama: string; estimasi_durasi_menit: number } | Array<{ nama: string; estimasi_durasi_menit: number }> | null;
        helper_profiles: { id: string; foto_wajah_url: string | null; users: { full_name: string } | Array<{ full_name: string }> | null } | Array<{ id: string; foto_wajah_url: string | null; users: { full_name: string } | Array<{ full_name: string }> | null }> | null;
      };
      const helper = Array.isArray(t.helper_profiles) ? t.helper_profiles[0] : t.helper_profiles;
      const helperUser = helper?.users ? (Array.isArray(helper.users) ? helper.users[0] : helper.users) : null;
      const category = Array.isArray(t.service_categories) ? t.service_categories[0] : t.service_categories;
      const helperPhoto = helper?.foto_wajah_url ? await sign(helper.foto_wajah_url) : null;

      next_task = {
        id: t.id,
        status: t.status,
        jadwal_waktu: t.jadwal_waktu,
        harga_final: t.harga_final || t.harga_dasar || 0,
        service_name: category?.nama || 'Layanan Pendampingan',
        duration_minutes: category?.estimasi_durasi_menit || 60,
        helper_name: helperUser?.full_name || null,
        helper_photo: helperPhoto,
      };
    }

    // Query latest health snapshot and completed visit stats
    const { data: completedTasks, count: totalCompleted } = await admin
      .from('tasks')
      .select(`
        id,
        completed_at,
        jadwal_waktu,
        health_snapshots ( energi, mobilitas, mood, nafsu_makan, kualitas_tidur, cerita_hari_ini, created_at ),
        helper_profiles ( id, users ( full_name ) )
      `, { count: 'exact' })
      .eq('lansia_id', id)
      .eq('status', 'selesai')
      .order('completed_at', { ascending: false })
      .limit(5);

    let latest_snapshot: {
      energi: string;
      mobilitas: string;
      mood: string;
      cerita_hari_ini: string;
      date: string;
    } | null = null;
    let last_visit_date: string | null = null;
    let last_helper_name: string | null = null;

    if (completedTasks && completedTasks.length > 0) {
      type CompletedTaskRow = {
        id: string;
        completed_at: string | null;
        jadwal_waktu: string;
        health_snapshots: Array<{ energi: string; mobilitas: string; mood: string; cerita_hari_ini: string; created_at: string }> | null;
        helper_profiles: { id: string; users: { full_name: string } | Array<{ full_name: string }> | null } | Array<{ id: string; users: { full_name: string } | Array<{ full_name: string }> | null }> | null;
      };

      const rows = completedTasks as unknown as CompletedTaskRow[];
      const lastTask = rows[0];
      last_visit_date = lastTask.completed_at || lastTask.jadwal_waktu;
      const helper = Array.isArray(lastTask.helper_profiles) ? lastTask.helper_profiles[0] : lastTask.helper_profiles;
      const helperUser = helper?.users ? (Array.isArray(helper.users) ? helper.users[0] : helper.users) : null;
      last_helper_name = helperUser?.full_name || null;

      for (const t of rows) {
        const snapshots = Array.isArray(t.health_snapshots) ? t.health_snapshots : (t.health_snapshots ? [t.health_snapshots] : []);
        if (snapshots.length > 0 && snapshots[0]?.cerita_hari_ini) {
          const s = snapshots[0];
          latest_snapshot = {
            energi: s.energi,
            mobilitas: s.mobilitas,
            mood: s.mood,
            cerita_hari_ini: s.cerita_hari_ini,
            date: s.created_at || t.completed_at || t.jadwal_waktu,
          };
          break;
        }
      }
    }

    const stats = {
      total_kunjungan: totalCompleted || 0,
      kunjungan_terakhir: last_visit_date,
      helper_terakhir: last_helper_name,
    };

    return apiResponse(
      {
        profile: {
          ...profile,
          nama_keluarga,
          email_keluarga,
          telepon_keluarga,
          foto_url,
          dokumen_identitas_lansia_url,
          dokumen_hubungan_keluarga_url,
        },
        next_task,
        latest_snapshot,
        stats,
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

// PUT /api/lansia/[id] — update profil lansia milik keluarga yang login
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { id } = await params;

    // Verifikasi kepemilikan sebelum update
    const { data: existing } = await supabase
      .from('lansia_profiles')
      .select('id')
      .eq('id', id)
      .eq('keluarga_id', user.id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return createApiError('not_found', 'Profil lansia tidak ditemukan', 404);
    }

    const body = await request.json();
    const validation = lansiaProfileSchema.partial().safeParse(body);

    if (!validation.success) {
      return apiResponse(
        {
          error: 'validation_error',
          message: 'Data input tidak valid',
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        400
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('lansia_profiles')
      .update({ ...validation.data, updated_at: new Date().toISOString() } as unknown as Database['public']['Tables']['lansia_profiles']['Update'])
      .eq('id', id)
      .eq('keluarga_id', user.id)
      .select('*')
      .single();

    if (updateError) {
      return createApiError('server_error', 'Gagal memperbarui profil lansia', 500);
    }

    return apiResponse({ message: 'Profil lansia berhasil diperbarui', profile: updated }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

// DELETE /api/lansia/[id] — soft delete profil lansia milik keluarga yang login
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { id } = await params;

    const { data: existing } = await supabase
      .from('lansia_profiles')
      .select('id')
      .eq('id', id)
      .eq('keluarga_id', user.id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return createApiError('not_found', 'Profil lansia tidak ditemukan', 404);
    }

    const { error: deleteError } = await supabase
      .from('lansia_profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('keluarga_id', user.id);

    if (deleteError) {
      return createApiError('server_error', 'Gagal menghapus profil lansia', 500);
    }

    return apiResponse({ message: 'Profil lansia berhasil dihapus' }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
