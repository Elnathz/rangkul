"use client";

import { useEffect, useState } from "react";
import { Clock, Zap, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickMatchStatusProps {
  status: string;
  expiresAt: string | null;
  helperInfo?: { full_name: string } | null;
  onRefresh?: () => void;
}

export default function QuickMatchStatus({
  status,
  expiresAt,
  helperInfo,
  onRefresh,
}: QuickMatchStatusProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!expiresAt || status !== "diajukan") return;

    const updateTimer = () => {
      const remainingMs = new Date(expiresAt).getTime() - Date.now();
      setTimeLeft(Math.max(0, Math.floor(remainingMs / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, status]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (status === "dikonfirmasi" || status === "dikerjakan" || status === "selesai") {
    return (
      <div className="flex items-center gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
        <div>
          <h4 className="text-sm font-bold">Helper telah ditemukan</h4>
          <p className="text-xs text-emerald-800 mt-0.5">
            {helperInfo?.full_name ? `${helperInfo.full_name} telah menerima kunjungan Anda.` : "Kunjungan sudah dikonfirmasi."}
          </p>
        </div>
      </div>
    );
  }

  if (status === "dibatalkan") {
    return (
      <div className="flex flex-col gap-4 rounded-[18px] border border-red-200 bg-red-50 p-4 text-red-950 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <XCircle className="h-8 w-8 text-red-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Pencarian Kedaluwarsa</h4>
            <p className="text-xs text-red-800 mt-0.5">
              Belum ada Helper yang tersedia dalam 15 menit. Anda dapat mencoba lagi atau memilih dari katalog.
            </p>
          </div>
        </div>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} className="shrink-0 border-red-200 text-red-700 bg-white">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Coba Lagi
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[18px] border border-blue-200 bg-blue-50/70 p-4 text-ink">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <Zap className="h-5 w-5" aria-hidden="true" />
          <span>Mencari Helper yang sesuai</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
      </div>
      <p className="text-xs text-ink-muted">
        Status akan diperbarui otomatis ketika Helper menerima kunjungan.
      </p>
    </div>
  );
}
