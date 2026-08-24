"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, User, Check, X, Shield, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/ui/FeedbackDialog";

type ReportItem = {
  id: string;
  alasan: string;
  status: "menunggu" | "ditindak" | "selesai";
  created_at: string;
  updated_at: string;
  reported_helper_id: string;
  reporter_id: string;
  ditindak_oleh: string | null;
  helper?: {
    user: { full_name: string; phone: string | null; email: string };
    koordinator?: { user: { full_name: string } } | null;
  } | null;
  reporter?: { full_name: string; email: string } | null;
};

export function ReportListClient({ initialReports, isAdmin = false }: { initialReports: ReportItem[], isAdmin?: boolean }) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ title: string; description: string; tone: "success" | "danger" } | null>(null);
  const router = useRouter();

  const handleUpdateStatus = async (reportId: string, newStatus: "ditindak" | "selesai") => {
    setIsProcessing(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengubah status laporan');
      }
      
      setFeedback({
        title: "Status Berhasil Diperbarui",
        description: `Laporan kini berstatus ${newStatus === 'ditindak' ? 'Sedang Ditindaklanjuti' : 'Selesai'}.`,
        tone: "success"
      });
      
      // Update local state for immediate feedback
      setReports(current => 
        current.map(r => r.id === reportId ? { ...r, status: newStatus } : r)
      );
      
      router.refresh();
    } catch (error: unknown) {
      setFeedback({
        title: "Terjadi Kesalahan",
        description: error instanceof Error ? error.message : "Gagal mengubah status laporan.",
        tone: "danger"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full"><Clock className="w-3.5 h-3.5" /> Menunggu Peninjauan</span>;
      case 'ditindak':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"><ShieldAlert className="w-3.5 h-3.5" /> Sedang Ditindak</span>;
      case 'selesai':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai</span>;
      default:
        return null;
    }
  };

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-6">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Tidak ada laporan</h3>
        <p className="text-slate-500 text-sm max-w-sm">Belum ada laporan pelanggaran dari Keluarga di wilayah Anda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {reports.map((report) => (
        <div 
          key={report.id} 
          className="p-5 md:p-6 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all relative overflow-hidden"
        >
          {report.status === 'menunggu' && (
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          )}
          
          <div className="flex flex-col gap-5">
            {/* Header: Status & Date */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                {getStatusBadge(report.status)}
                <span className="text-xs font-medium text-slate-500">
                  Dilaporkan: {format(new Date(report.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                ID: {report.id.split('-')[0]}
              </span>
            </div>
            
            {/* Content: Reason & Users */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Alasan Pelaporan</h4>
                  <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                    &quot;{report.alasan}&quot;
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Helper Terlapor</h4>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{report.helper?.user?.full_name || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{report.helper?.user?.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pelapor (Keluarga)</h4>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{report.reporter?.full_name || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{report.reporter?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {report.status !== 'selesai' && (
              <div className="flex flex-wrap items-center justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
                {report.status === 'menunggu' && (
                  <Button
                    onClick={() => handleUpdateStatus(report.id, 'ditindak')}
                    disabled={isProcessing === report.id}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
                  >
                    {isProcessing === report.id ? "Memproses..." : "Tandai Sedang Ditindak"}
                  </Button>
                )}
                <Button
                  onClick={() => handleUpdateStatus(report.id, 'selesai')}
                  disabled={isProcessing === report.id}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                >
                  {isProcessing === report.id ? "Memproses..." : "Selesaikan Kasus"}
                </Button>
              </div>
            )}
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
