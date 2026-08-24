"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Clock, MapPin, PhoneCall, ShieldAlert, Check } from "lucide-react";
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
        (payload) => {
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
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-6">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Tidak ada keadaan darurat</h3>
        <p className="text-slate-500 text-sm max-w-sm">Wilayah Anda aman. Tidak ada laporan SOS aktif dari Helper yang sedang bertugas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`p-5 rounded-2xl border shadow-sm transition-all relative overflow-hidden ${
            alert.status === 'active' 
              ? 'bg-red-50/30 border-red-200' 
              : 'bg-white border-slate-200'
          }`}
        >
          {alert.status === 'active' && (
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                {getStatusBadge(alert.status)}
                <span className="text-xs font-medium text-slate-500">
                  {format(new Date(alert.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                </span>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  Sinyal Darurat (SOS) dari Helper
                </h3>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  Tugas: {alert.tasks?.judul || "Pekerjaan tidak diketahui"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100/50">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Pengirim Sinyal (Helper)</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{alert.trigger?.full_name || "Unknown"}</span>
                    {alert.trigger?.phone && (
                      <a href={`tel:${alert.trigger.phone}`} className="text-blue-600 hover:text-blue-700" title="Hubungi">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 shrink-0">
              {alert.status === 'active' && (
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={isProcessing === alert.id}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-red-200"
                >
                  {isProcessing === alert.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
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
