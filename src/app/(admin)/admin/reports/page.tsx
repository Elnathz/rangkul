import { createClient } from "@/lib/supabase/server";
import { ReportListClient } from "@/components/reports/ReportListClient";
import { Shield, ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifikasi status admin
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold">Akses Ditolak</h1>
        <p className="text-gray-500">Hanya Admin yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

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
      helper:users!reports_reported_helper_id_fkey(
        full_name,
        email,
        phone
      ),
      reporter:users!reports_reporter_id_fkey(
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  // Restructure for the client component
  const mappedReports = (reports || []).map(r => ({
    ...r,
    helper: r.helper ? { user: Array.isArray(r.helper) ? r.helper[0] : r.helper } : null,
    reporter: Array.isArray(r.reporter) ? r.reporter[0] : r.reporter
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Semua Laporan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tinjauan Admin terhadap seluruh laporan dan pelanggaran (Global)
          </p>
        </div>
      </div>

      <ReportListClient initialReports={mappedReports} isAdmin={true} />
    </div>
  );
}
