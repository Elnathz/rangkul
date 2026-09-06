"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RouteError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Illustration */}
        <div className="relative mx-auto mb-8 w-36 h-36">
          <div className="absolute inset-0 rounded-full bg-amber-50 animate-pulse" />
          <div className="relative flex h-full items-center justify-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-inner">
              <AlertTriangle className="size-10 text-amber-600" aria-hidden="true" />
            </div>
          </div>
        </div>

        <p className="text-sm font-bold uppercase tracking-widest text-amber-600 mb-3">
          Terjadi Kesalahan
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-4">
          Halaman Tidak Dapat Dimuat
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Terjadi kendala tak terduga saat memproses halaman ini.
          Silakan coba muat ulang atau kembali ke beranda.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl bg-[#0D47A1] text-white font-bold text-sm hover:bg-blue-800 transition-colors shadow-sm w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Coba Lagi
          </button>
          <Link
            href="/beranda"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-sm hover:border-[#0D47A1] hover:text-[#0D47A1] transition-colors w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]"
          >
            <Home className="size-4" aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-slate-400">
            ID Kesalahan: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
