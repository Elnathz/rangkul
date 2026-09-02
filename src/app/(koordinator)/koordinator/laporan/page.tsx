import { createClient } from "@/lib/supabase/server";
import KoordinatorStatusGuard from "@/components/koordinator/KoordinatorStatusGuard";
import { ReportListClient } from "@/components/reports/ReportListClient";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function KoordinatorLaporanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: koordinator } = await supabase
    .from("koordinator_profiles")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (!koordinator || koordinator.status !== 'verified') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <KoordinatorStatusGuard koordinator={koordinator as any}><></></KoordinatorStatusGuard>;
  }

  // 2. Ambil helper yang berada di bawah pengawasan koordinator ini
  const { data: helpers } = await supabase
    .from("helper_profiles")
    .select("user_id")
    .eq("koordinator_id", koordinator.id);

  const helperIds = helpers?.map(h => h.user_id) || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mappedReports: any[] = [];

  if (helperIds.length > 0) {
    const { data: reports } = await supabase
      .from("reports")
      .select(`
        id,
        alasan,
        status,
        created_at,
        updated_at,
        reported_helper_id,
        reporter_id,
        ditindak_oleh,
        decision_reason,
        helper:users!reports_reported_helper_id_fkey(
          full_name,
          helper_profiles(status)
        ),
        reporter:users!reports_reporter_id_fkey(
          full_name
        ),
        reviewer:users!reports_ditindak_oleh_fkey(full_name)
      `)
      .in("reported_helper_id", helperIds)
      .order("created_at", { ascending: false });

    const counts = new Map<string, number>();
    for (const report of reports || []) counts.set(report.reported_helper_id, (counts.get(report.reported_helper_id) ?? 0) + 1);
    mappedReports = (reports || []).map(r => ({
      ...r,
      helper: r.helper ? { user: Array.isArray(r.helper) ? r.helper[0] : r.helper } : null,
      reporter: Array.isArray(r.reporter) ? r.reporter[0] : r.reporter,
      reviewer: Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer,
      report_count: counts.get(r.reported_helper_id) ?? 1,
    }));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan & Pelanggaran</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau dan tindaklanjuti laporan dari Keluarga terhadap Helper di wilayah Anda
          </p>
        </div>
      </div>

      <ReportListClient initialReports={mappedReports} isAdmin={false} />
    </div>
  );
}
