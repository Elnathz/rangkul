"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="relative mx-auto mb-8 w-36 h-36">
            <div className="absolute inset-0 rounded-full bg-red-50 animate-pulse" />
            <div className="relative flex h-full items-center justify-center">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="40" cy="40" r="38" stroke="#DC2626" strokeWidth="2" opacity="0.3" />
                <path
                  d="M40 24v24M40 56v2"
                  stroke="#DC2626"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </svg>
            </div>
          </div>

          <p className="text-sm font-bold uppercase tracking-widest text-red-600 mb-3">
            Error 500
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
            Terjadi Kesalahan
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-sm mx-auto">
            Sesuatu yang tidak terduga terjadi pada server kami.
            Tim kami sudah diberitahu. Silakan coba lagi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl bg-[#0D47A1] text-white font-bold text-sm hover:bg-blue-800 transition-colors shadow-sm w-full sm:w-auto"
            >
              Coba Lagi
            </button>
            <a
              href="/beranda"
              className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-sm hover:border-[#0D47A1] hover:text-[#0D47A1] transition-colors w-full sm:w-auto"
            >
              Kembali ke Beranda
            </a>
          </div>

          {error.digest && (
            <p className="mt-8 text-xs text-slate-400">
              ID Kesalahan: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
