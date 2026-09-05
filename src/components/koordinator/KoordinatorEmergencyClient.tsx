"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Clock, PhoneCall, ShieldAlert, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FeedbackDialog } from "@/components/ui/FeedbackDialog";

type EmergencyAlert = {
  id: string;
  status: "active" | "acknowledged" | "resolved";
  created_at: string;
  task_id: string;
  triggered_by: string;
  acknowledged_at: string | null;
  tasks?: {
    judul: string;
    lokasi_koordinat: string | null;
    helper: {
      user: {
        full_name: string;
        phone: string;
      }
    }
  } | null;
  trigger?: {
    full_name: string;
    phone: string | null;
  } | null;
};

export function KoordinatorEmergencyClient({ initialAlerts }: { initialAlerts: EmergencyAlert[] }) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(initialAlerts);
  const supabase = createClient();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ title: string; description: string; tone: "success" | "danger" } | null>(null);

  useEffect(() => {
    // Realtime subscription for new emergencies
    const channel = supabase
      .channel('koordinator-emergencies')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emergency_alerts' },
        () => {
          router.refresh(); // Refresh server data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  useEffect(() => {
    // Avoid calling setAlerts in useEffect unless initialAlerts actually changes structure 
    // Since this is a server-rendered prop, it will be recreated. To prevent unnecessary re-renders, 
    // we only update if JSON stringified value changes (or simply remove this effect if we depend on key)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAlerts(prev => JSON.stringify(prev) === JSON.stringify(initialAlerts) ? prev : initialAlerts);
  }, [initialAlerts]);

  const handleAcknowledge = async (alertId: string) => {
    setIsProcessing(alertId);
    try {
      const response = await fetch(`/api/emergency/${alertId}/acknowledge`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengakui status darurat');
      }
      setFeedback({
        title: "Status Darurat Diperbarui",
        description: "Anda telah mengetahui dan menangani status darurat ini.",
        tone: "success"
      });
      
      router.refresh();
    } catch (error: unknown) {
      setFeedback({
        title: "Terjadi Kesalahan",
        description: error instanceof Error ? error.message : "Gagal mengakui status darurat.",
        tone: "danger"
      });
      // In case of conflict, we still want to refresh
      router.refresh();
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full animate-pulse"><AlertTriangle className="w-3.5 h-3.5" /> Aktif</span>;
      case 'acknowledged':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full"><Clock className="w-3.5 h-3.5" /> Ditangani</span>;
      case 'resolved':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai</span>;
      default:
        return null;
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-xs mt-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-3 sm:mb-4">
          <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Tidak ada keadaan darurat</h3>
        <p className="text-slate-500 text-xs sm:text-sm max-w-sm">Wilayah Anda aman. Tidak ada laporan SOS aktif dari Helper yang sedang bertugas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border shadow-xs transition-all relative overflow-hidden ${
            alert.status === 'active' 
              ? 'bg-red-50/30 border-red-200' 
              : 'bg-white border-slate-200'
          }`}
        >
          {alert.status === 'active' && (
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2.5">
                {getStatusBadge(alert.status)}
                <span className="text-[11px] sm:text-xs font-medium text-slate-500">
                  {format(new Date(alert.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                </span>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Sinyal Darurat (SOS) dari Helper
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-700 mt-0.5 sm:mt-1">
                  Tugas: {alert.tasks?.judul || "Pekerjaan tidak diketahui"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100/50">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">Pengirim Sinyal (Helper)</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{alert.trigger?.full_name || "Unknown"}</span>
                    {alert.trigger?.phone && (
                      <a href={`tel:${alert.trigger.phone}`} className="text-blue-600 hover:text-blue-700 p-1" title="Hubungi">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0 shrink-0">
              {alert.status === 'active' && (
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={isProcessing === alert.id}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs shadow-red-200"
                >
                  {isProcessing === alert.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Tandai Diketahui
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      <FeedbackDialog
        open={Boolean(feedback)}
        onOpenChange={(open) => !open && setFeedback(null)}
        title={feedback?.title ?? ""}
        description={feedback?.description ?? ""}
        tone={feedback?.tone ?? "success"}
      />
    </div>
  );
}
