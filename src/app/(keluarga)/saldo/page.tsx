"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Wallet, Plus, CheckCircle2, AlertCircle, Loader2, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export default function SaldoPage() {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSaldo = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet/topup", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Gagal memuat saldo");
      setSaldo(body.saldo ?? 0);
      setUpdatedAt(body.updated_at ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat saldo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      await fetchSaldo();
    }
    load();
  }, [fetchSaldo]);

  const topup = async (overrideAmount?: number) => {
    const parsed = overrideAmount ?? parseInt(amount.replace(/\D/g, ""), 10);
    if (!parsed || parsed <= 0) { setError("Masukkan jumlah yang valid"); return; }
    if (parsed > 10_000_000) { setError("Maksimal top up Rp 10.000.000 per transaksi"); return; }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsed }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Top up gagal");
      setSuccess(body.message ?? "Saldo berhasil ditambahkan");
      setAmount("");
      await fetchSaldo();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Top up gagal");
    } finally {
      setSaving(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/\D/g, "");
    setAmount(numeric);
    setError(null);
    setSuccess(null);
  };

  const formattedInput = amount
    ? parseInt(amount, 10).toLocaleString("id-ID")
    : "";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Back */}
        <Link
          href="/beranda"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0D47A1] hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Beranda
        </Link>

        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">Demo Wallet</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Isi Saldo</h1>
          <p className="mt-2 text-sm text-slate-600">
            Tambahkan saldo demo untuk membayar layanan pendampingan.
          </p>
        </div>

        {/* Saldo Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D47A1] to-blue-700 p-6 text-white shadow-lg">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                  <Wallet className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-blue-200">Saldo Tersedia</p>
              </div>
              <button
                onClick={fetchSaldo}
                disabled={loading}
                className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition"
                aria-label="Refresh saldo"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="mt-4">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-300" />
                  <span className="text-blue-200 text-sm">Memuat...</span>
                </div>
              ) : (
                <p className="text-4xl font-black tracking-tight">
                  {formatRupiah(saldo ?? 0)}
                </p>
              )}
              {updatedAt && !loading && (
                <p className="mt-2 text-xs text-blue-300">
                  Diperbarui {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(updatedAt))}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">{success}</p>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        )}

        {/* Quick Top Up */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-black text-amber-900">Top Up Cepat</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                disabled={saving}
                onClick={() => topup(amt)}
                className="rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-center text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100 hover:border-amber-300 active:scale-95 disabled:opacity-50"
              >
                {formatRupiah(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Top Up */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <p className="text-sm font-black text-slate-900">Jumlah Lainnya</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">Rp</span>
            <input
              id="topup-amount"
              type="text"
              inputMode="numeric"
              value={formattedInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-right text-lg font-black text-slate-950 placeholder:text-slate-300 focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
            />
          </div>
          <p className="text-xs text-slate-500">Minimal Rp 1 · Maksimal Rp 10.000.000 per transaksi</p>
          <Button
            onClick={() => topup()}
            disabled={saving || !amount}
            className="w-full rounded-xl bg-[#0D47A1] py-3 font-black text-white hover:bg-blue-800"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Tambah Saldo
              </span>
            )}
          </Button>
        </div>

        {/* Info note */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
          <p className="text-xs text-blue-800">
            <strong>Mode Demo:</strong> Saldo ini adalah saldo simulasi untuk keperluan demo aplikasi Rangkul. Tidak ada transaksi uang nyata yang terjadi.
          </p>
        </div>
      </div>
    </main>
  );
}
