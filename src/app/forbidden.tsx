import Link from "next/link";
import { ShieldAlert, Home, LogIn } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Illustration */}
        <div className="relative mx-auto mb-8 w-36 h-36">
          <div className="absolute inset-0 rounded-full bg-amber-50 animate-pulse" />
          <div className="relative flex h-full items-center justify-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-inner">
              <ShieldAlert className="size-10 text-amber-600" aria-hidden="true" />
            </div>
          </div>
        </div>

        <p className="text-sm font-bold uppercase tracking-widest text-amber-600 mb-3">
          Error 403
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
          Akses Dibatasi
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-sm mx-auto">
          Anda tidak memiliki izin untuk membuka sumber daya ini.
          Pastikan Anda telah masuk dengan peran akun yang terotorisasi.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/beranda"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl bg-[#0D47A1] text-white font-bold text-sm hover:bg-blue-800 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Home className="size-4" aria-hidden="true" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-sm hover:border-[#0D47A1] hover:text-[#0D47A1] transition-colors w-full sm:w-auto"
          >
            <LogIn className="size-4" aria-hidden="true" />
            Masuk Kembali
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Kode: 403 &middot; Akses Dibatasi
        </p>
      </div>
    </div>
  );
}
