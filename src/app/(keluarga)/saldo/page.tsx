"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Wallet, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Zap, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Lock,
  Check,
  Clock,
  Info,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PRESET_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000];

type LedgerTransaction = {
  id: string;
  amount: number;
  saldo_setelah: number;
  alasan: string;
  entry_type: "topup" | "charge";
  created_at: string;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR", 
    maximumFractionDigits: 0 
  }).format(value);
}

export default function SaldoPage() {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSaldo = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet/topup", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Gagal memuat data saldo");
      setSaldo(Number(body.saldo ?? 0));
      setUpdatedAt(body.updated_at ?? null);
      setTransactions(body.transactions ?? []);
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
    void load();
  }, [fetchSaldo]);

  const topup = async (overrideAmount?: number) => {
    const rawVal = overrideAmount ?? parseInt(amount.replace(/\D/g, ""), 10);
    if (!rawVal || rawVal <= 0) { 
      setError("Pilih atau masukkan nominal top up yang valid"); 
      return; 
    }
    if (rawVal < 10_000) {
      setError("Nominal minimal top up adalah Rp 10.000");
      return;
    }
    if (rawVal > 10_000_000) { 
      setError("Maksimal top up Rp 10.000.000 per transaksi"); 
      return; 
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: rawVal }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Top up saldo gagal diproses");
      setSuccess(`Berhasil menambahkan saldo sebesar ${formatRupiah(rawVal)}.`);
      setAmount("");
      await fetchSaldo();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Top up saldo gagal");
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

  const handleSelectPreset = (val: number) => {
    setAmount(String(val));
    setError(null);
    setSuccess(null);
  };

  const currentNumericAmount = amount ? parseInt(amount, 10) : 0;
  const formattedInput = currentNumericAmount > 0 
    ? currentNumericAmount.toLocaleString("id-ID") 
    : "";

  return (
    <main className="min-h-screen bg-slate-50/70 pb-32 pt-4 px-3 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/beranda"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4 text-slate-500" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
              Jaminan Escrow 100%
            </span>
          </div>
        </div>

        {/* Page Title Header */}
        <div className="border-b border-slate-200/60 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Keuangan Keluarga</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Kelola Saldo Rangkul
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Dompet digital keluarga untuk pembayaran jasa pendampingan lansia secara praktis dan aman.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Transaksi Terenkripsi & Aman</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Balance Card & Top Up Actions (7 Cols on LG) */}
          <div className="space-y-6 lg:col-span-7">
            {/* The Premium FinTech Saldo Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#093170] via-[#0D47A1] to-[#1565C0] p-6 text-white shadow-xl">
              {/* Subtle background decoration */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-400/20 blur-xl" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                      <Wallet className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Saldo Dompet Rangkul</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-semibold text-emerald-200">Siap Digunakan</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void fetchSaldo()}
                    disabled={loading}
                    className="inline-flex size-9 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-blue-100 transition hover:bg-white/20 hover:text-white active:scale-95 disabled:opacity-50"
                    title="Segarkan Saldo"
                    aria-label="Segarkan saldo"
                  >
                    <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div className="py-2">
                  <span className="text-xs font-medium text-blue-200 block mb-1">Total Saldo Aktif</span>
                  {loading ? (
                    <div className="flex items-center gap-3 py-1">
                      <Loader2 className="size-7 animate-spin text-blue-300" />
                      <span className="text-xl font-bold text-blue-100">Memuat saldo...</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-white tabular-nums">
                        {formatRupiah(saldo ?? 0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4 text-[11px] text-blue-200/90">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-blue-300 shrink-0" />
                    <span>
                      {updatedAt && !loading
                        ? `Diperbarui ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(updatedAt))}`
                        : "Pembaruan otomatis real-time"}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide">
                    Sistem Escrow Terlindungi
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Alerts */}
            {success ? (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-xs animate-in fade-in">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-sm text-emerald-900">Top Up Berhasil Diproses</p>
                  <p className="mt-0.5 text-emerald-800">{success}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSuccess(null)}
                  className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : null}

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-xs animate-in fade-in">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600" />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-sm text-rose-900">Perhatian</p>
                  <p className="mt-0.5 text-rose-800">{error}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setError(null)}
                  className="rounded-lg p-1 text-rose-700 hover:bg-rose-100"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : null}

            {/* Top Up Form Section */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Zap className="size-3.5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Pilih Nominal Top Up</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Pilih opsi cepat atau ketik nominal kustom yang Anda butuhkan.
                </p>
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = currentNumericAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      disabled={saving}
                      onClick={() => handleSelectPreset(amt)}
                      className={`relative flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all active:scale-95 disabled:opacity-50 min-h-[58px] ${
                        isSelected
                          ? "border-2 border-blue-700 bg-blue-50/70 text-blue-900 shadow-xs ring-2 ring-blue-700/10 font-black"
                          : "border border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-white font-bold"
                      }`}
                    >
                      <span className="text-xs sm:text-sm tabular-nums">
                        {formatRupiah(amt)}
                      </span>
                      {isSelected ? (
                        <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-blue-700 text-white flex items-center justify-center">
                          <Check className="size-2.5 stroke-[3]" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label htmlFor="topup-amount" className="block text-xs font-bold text-slate-700">
                  Atau Masukkan Nominal Kustom
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-400">Rp</span>
                  </div>
                  <input
                    id="topup-amount"
                    type="text"
                    inputMode="numeric"
                    value={formattedInput}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/40 py-3.5 pl-12 pr-10 text-right text-xl sm:text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:border-blue-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-700/10 transition"
                  />
                  {amount ? (
                    <button
                      type="button"
                      onClick={() => setAmount("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                      title="Hapus"
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Minimal: Rp 10.000</span>
                  <span>Maksimal: Rp 10.000.000</span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <Button
                type="button"
                onClick={() => void topup()}
                disabled={saving || !currentNumericAmount}
                className="w-full min-h-12 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Memproses Saldo...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Plus className="size-4 stroke-[3]" />
                    <span>
                      {currentNumericAmount > 0 
                        ? `Tambah Saldo ${formatRupiah(currentNumericAmount)} Sekarang`
                        : "Tambah Saldo"}
                    </span>
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Transaction Ledger & Escrow Guarantees (5 Cols on LG) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Riwayat Mutasi Saldo */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                    <Clock className="size-3.5" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">Riwayat Mutasi Saldo</h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {transactions.length} Aktivitas
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-xs">
                  <Loader2 className="size-5 animate-spin text-blue-700 mb-2" />
                  <span>Memuat mutasi saldo...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                    <Wallet className="size-6 text-slate-300" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Belum Ada Riwayat Transaksi</p>
                  <p className="mt-1 text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Saldo yang Anda tambahkan atau gunakan untuk pesanan kunjungan akan tercatat transparan di sini.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
                  {transactions.map((t) => {
                    const isTopup = t.entry_type === "topup" || t.amount > 0;
                    return (
                      <div key={t.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isTopup 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                              : "bg-blue-50 text-blue-700 border border-blue-200/60"
                          }`}>
                            {isTopup ? (
                              <ArrowDownLeft className="size-4" />
                            ) : (
                              <ArrowUpRight className="size-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {isTopup ? "Top Up Saldo" : "Pembayaran Tugas"}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {new Intl.DateTimeFormat("id-ID", {
                                dateStyle: "short",
                                timeStyle: "short",
                              }).format(new Date(t.created_at))}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className={`font-black tabular-nums ${
                            isTopup ? "text-emerald-700" : "text-slate-900"
                          }`}>
                            {isTopup ? "+" : "-"} {formatRupiah(Math.abs(t.amount))}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Sisa: {formatRupiah(t.saldo_setelah)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Escrow & Security Assurance Card */}
            <div className="rounded-3xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-900">
                <ShieldCheck className="size-4 text-blue-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Perlindungan Escrow Rangkul</h3>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <div className="size-1.5 rounded-full bg-blue-700 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-slate-800">Dana Aman Tertahan:</strong> Pembayaran ditahan di rekening penampung (escrow) dan baru dicairkan ke Helper setelah tugas pendampingan selesai diverifikasi.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="size-1.5 rounded-full bg-blue-700 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-slate-800">100% Bebas Biaya Layanan:</strong> Seluruh saldo yang Anda isi dapat digunakan sepenuhnya untuk pendampingan keluarga Anda tanpa potongan liar.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="size-1.5 rounded-full bg-blue-700 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-slate-800">Kebijakan Pengembalian:</strong> Pembatalan tugas sebelum jadwal berjalan akan mengembalikan saldo Anda secara otomatis sesuai aturan TDD §3.8.
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Simulation Notice */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Info className="size-3.5 text-blue-700 shrink-0" />
                <span>Mode Simulasi Demo Terhubung</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Saldo ini adalah saldo simulasi aktif untuk menguji alur transaksi dan jaminan escrow Rangkul. Tidak ada biaya atau pemotongan uang riil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
