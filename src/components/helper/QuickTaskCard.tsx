"use client";

import { useState } from "react";
import { Zap, Clock, MapPin, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MarketplaceTaskItem = {
  task_id: string;
  mode_penugasan: "pelamar" | "cepat" | "langsung";
  kategori_id: string;
  kategori_nama: string;
  estimasi_durasi_menit: number;
  jadwal_waktu: string;
  harga_dasar: number;
  harga_final: number;
  kelurahan: string;
  kecamatan: string;
  jarak_km: number;
  expires_at: string | null;
};

export default function QuickTaskCard({
  task,
  onAccepted,
}: {
  task: MarketplaceTaskItem;
  onAccepted?: (taskId: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks/${task.task_id}/accept`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Tugas tidak dapat diambil");
      }
      setAccepted(true);
      if (onAccepted) onAccepted(task.task_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengambil tugas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-amber-200 bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              <Zap className="h-3 w-3 text-amber-600" /> Cari Cepat
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {task.estimasi_durasi_menit} mnt
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{task.kategori_nama}</h3>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400 font-semibold">Harga dasar</p>
          <p className="text-lg font-black text-[#0D47A1] tabular-nums">
            Rp {Number(task.harga_final || task.harga_dasar).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs mb-5 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
          <span>{task.kelurahan}, ~{task.jarak_km} km</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          <span>{new Date(task.jadwal_waktu).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {accepted ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-xs font-bold text-emerald-800">
          <Check className="h-4 w-4 text-emerald-600" /> Tugas Berhasil Diterima
        </div>
      ) : (
        <Button
          onClick={handleAccept}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#0D47A1] font-bold text-white hover:bg-blue-800 shadow-sm"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengambil Tugas...</>
          ) : (
            <><Zap className="mr-2 h-4 w-4" /> Terima Tugas Sekarang</>
          )}
        </Button>
      )}
    </div>
  );
}
