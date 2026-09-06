import { createClient } from "@/lib/supabase/server";
import { apiResponse, createApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError("unauthorized", "Anda harus login untuk melihat notifikasi", 401);
    }

    const url = new URL(request.url);
    const requestedLimit = Number(url.searchParams.get("limit") || 50);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;

    const [{ data: notifications, error: notificationsError }, { count: unreadCount, error: unreadError }] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, title, body, type, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false),
    ]);

    if (notificationsError || unreadError) {
      return createApiError("server_error", "Notifikasi belum dapat dimuat", 500);
    }

    const badges: Record<string, number> = {};
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
    const role = userProfile?.role;

    // Fetch unread messages for all roles
    const { count: unreadMsgs } = await supabase.from("messages").select("id", { count: "exact", head: true }).eq("receiver_id", user.id).is("read_at", null).not("task_id", "is", null);
    
    if (role === 'helper') {
      const { data: helperProfile } = await supabase.from("helper_profiles").select("id").eq("user_id", user.id).maybeSingle();
      const { count } = helperProfile
        ? await supabase.from("tasks").select("id", { count: "exact", head: true }).eq("helper_id", helperProfile.id).eq("status", "diajukan")
        : { count: 0 };
      if (count) badges['/tugas'] = count;
      if (unreadMsgs) badges['/helper/pesan'] = unreadMsgs;
    } else if (role === 'koordinator') {
      if (unreadMsgs) badges['/koordinator/pesan'] = unreadMsgs;
      
      const { data: prof } = await supabase.from('koordinator_profiles').select('id').eq('user_id', user.id).maybeSingle();
      if (prof) {
        const { count: antrean } = await supabase.from('helper_profiles').select('id', { count: 'exact', head: true }).eq('koordinator_id', prof.id).eq('status', 'pending_verification');
        if (antrean) badges['/koordinator/antrean'] = antrean;
      }
      const { count: laporan } = await supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'menunggu');
      if (laporan) badges['/koordinator/laporan'] = laporan;
    } else if (role === 'admin') {
      const { count: laporan } = await supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'menunggu');
      if (laporan) badges['/admin/reports'] = laporan;
      
      const { count: helpers } = await supabase.from('helper_profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification');
      if (helpers) badges['/admin/helpers'] = helpers;
    } else if (role === 'keluarga') {
      if (unreadMsgs) badges['/beranda/pesan'] = unreadMsgs;
    }

    return apiResponse({
      notifications: notifications || [],
      unread_count: unreadCount || 0,
      badges,
      role: role || null,
    });
  } catch (error: unknown) {
    return createApiError(
      "server_error",
      error instanceof Error ? error.message : "Notifikasi belum dapat dimuat",
      500,
    );
  }
}
