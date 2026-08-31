"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Calendar, CreditCard, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type CommissionSummary = {
  total_commission: number;
  total_transactions: number;
};

type CommissionItem = {
  id: string;
  task_id: string;
  layanan: string;
  jumlah_total: number;
  koordinator_share: number;
  released_at: string;
};

const formatRupiah = (amount: number) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

export default function KoordinatorKomisiPage() {
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [items, setItems] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCommissions = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/koordinator/commissions?page=${currentPage}&limit=10`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Gagal memuat data komisi");
      }
      setSummary(payload.data?.summary || { total_commission: 0, total_transactions: 0 });
      setItems(payload.data?.items || []);
      setTotalPages(payload.data?.pagination?.total_pages || 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data komisi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCommissions(page);
  }, [page]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/koordinator/dashboard"
          className="mb-4 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Komisi Koordinator</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Ringkasan hak komisi (3%) dari pembayaran tugas yang telah dicairkan (released).
            </p>
          </div>
          <Button
            onClick={() => void fetchCommissions(page)}
            variant="outline"
            size="sm"
            className="w-fit rounded-xl border-slate-200"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D47A1] to-blue-800 p-6 text-white shadow-lg">
          <DollarSign className="absolute right-6 top-6 h-20 w-20 opacity-10" />
          <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Total Komisi Diterima</p>
          <h2 className="mt-2 text-3xl font-black tabular-nums">
            {loading ? "..." : formatRupiah(summary?.total_commission || 0)}
          </h2>
          <p className="mt-2 text-xs text-blue-100/80">3% dari transaksi yang disetujui & dicairkan</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <TrendingUp className="absolute right-6 top-6 h-20 w-20 text-slate-100" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transaksi Released</p>
          <h2 className="mt-2 text-3xl font-black tabular-nums text-slate-900">
            {loading ? "..." : (summary?.total_transactions || 0)}
          </h2>
          <p className="mt-2 text-xs text-slate-500">Tugas selesai di wilayah pengawasan Anda</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100 flex justify-between items-center">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => void fetchCommissions(page)}>
            Coba lagi
          </Button>
        </div>
      )}

      {/* Table / List */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900">Riwayat Pembagian Komisi</h3>
        </div>

        {loading ? (
          <div className="flex py-16 items-center justify-center text-slate-400 text-sm font-medium">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#0D47A1]" /> Memuat riwayat komisi...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-semibold text-slate-700">Belum ada transaksi komisi</p>
            <p className="mt-1 text-xs text-slate-400">
              Komisi akan otomatis tercatat ketika pembayaran tugas di wilayah Anda dicairkan.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/50 transition">
                <div className="space-y-1 mb-3 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.layanan}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0D47A1]">
                      ID: {item.task_id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.released_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400">Komisi Anda (3%)</p>
                  <p className="text-lg font-black text-emerald-600 tabular-nums">
                    +{formatRupiah(item.koordinator_share)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Total Tugas: {formatRupiah(item.jumlah_total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Sebelumnya
            </Button>
            <span className="text-xs text-slate-500 font-semibold">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}