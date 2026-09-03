import { createClient } from "@/lib/supabase/server";
import KoordinatorStatusGuard from "@/components/koordinator/KoordinatorStatusGuard";
import { KoordinatorEmergencyClient } from "@/components/koordinator/KoordinatorEmergencyClient";
import { ShieldAlert, TriangleAlert } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DaruratPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ambil profil koordinator untuk memverifikasi status
  const { data: koordinator } = await supabase
    .from("koordinator_profiles")
    .select("status")
    .eq("user_id", user.id)
    .single();

  if (!koordinator || koordinator.status !== 'verified') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <KoordinatorStatusGuard koordinator={koordinator as any}><></></KoordinatorStatusGuard>;
  }

  // Fetch alerts using the authenticated client. RLS policy ensures Koordinator only sees alerts for their Helpers' tasks.
  const { data: alerts, error } = await supabase
    .from('emergency_alerts')
    .select(`
      id,
      status,
      created_at,
      task_id,
      triggered_by,
      acknowledged_at,
      tasks (
        service_categories ( nama ),
        helper:helper_profiles(
          user:users(full_name, phone)
        )
      ),
      trigger:users!emergency_alerts_triggered_by_fkey(
        full_name,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  const mappedAlerts = alerts?.map(alert => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taskData = alert.tasks as any;
    const category = Array.isArray(taskData?.service_categories) 
      ? taskData?.service_categories[0] 
      : taskData?.service_categories;

    return {
      ...alert,
      tasks: taskData ? {
        judul: category?.nama || "Tugas",
        lokasi_koordinat: null,
        helper: taskData.helper ? {
          user: Array.isArray(taskData.helper) 
            ? taskData.helper[0]?.user 
            : taskData.helper.user
        } : null
      } : null
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any[];

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Status Darurat</h1>
            <p className="text-sm text-slate-500 mt-1">
              Pantau dan tangani sinyal darurat (SOS) dari Helper di wilayah Anda
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <TriangleAlert className="w-9 h-9 text-red-600 mx-auto mb-3" />
          <h2 className="font-semibold text-red-700">Gagal memuat data darurat</h2>
          <p className="text-sm text-red-600/80 mt-1">
            Data tidak dapat dimuat saat ini. Periksa koneksi Anda lalu coba muat ulang halaman.
          </p>
          <Link
            href="/koordinator/darurat"
            className="inline-flex items-center justify-center h-11 min-w-11 rounded-xl bg-red-600 text-white text-sm font-medium mt-4 px-5"
          >
            Muat ulang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Status Darurat</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau dan tangani sinyal darurat (SOS) dari Helper di wilayah Anda
          </p>
        </div>
      </div>

      <KoordinatorEmergencyClient initialAlerts={mappedAlerts || []} />
    </div>
  );
}