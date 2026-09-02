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
      <div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-200 text-emerald-950 flex items-center gap-4">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Helper Terpercaya Telah Ditemukan!</h4>
          <p className="text-xs text-emerald-800 mt-0.5">
            {helperInfo?.full_name ? `Helper ${helperInfo.full_name} telah menerima tugas Anda.` : "Tugas sudah dikonfirmasi."}
          </p>
        </div>
      </div>
    );
  }

  if (status === "dibatalkan") {
    return (
      <div className="rounded-2xl bg-red-50 p-5 border border-red-200 text-red-950 flex items-center justify-between gap-4">
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
    <div className="rounded-2xl bg-amber-50 p-5 border border-amber-200 text-amber-950 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
          <Zap className="h-5 w-5 text-amber-600 animate-bounce" />
          <span>Sedang Mencarikan Helper Terpercaya...</span>
        </div>
        <div className="flex items-center gap-1 bg-amber-200/60 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-900">
          <Clock className="h-3.5 w-3.5" />
          <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
      </div>
      <p className="text-xs text-amber-800">
        Halaman ini akan diperbarui otomatis begitu Helper menerima tugas Anda.
      </p>
    </div>
  );
}
