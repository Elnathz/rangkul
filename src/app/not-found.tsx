import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Illustration */}
        <div className="relative mx-auto mb-8 w-36 h-36">
          <div className="absolute inset-0 rounded-full bg-[#0D47A1]/10 animate-pulse" />
          <div className="relative flex h-full items-center justify-center">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="40" cy="40" r="38" stroke="#0D47A1" strokeWidth="2" strokeDasharray="6 4" opacity="0.3" />
              <text x="40" y="52" textAnchor="middle" fontSize="36" fontWeight="900" fill="#0D47A1" opacity="0.8">
                ?
              </text>
            </svg>
          </div>
        </div>

        <p className="text-sm font-bold uppercase tracking-widest text-[#0D47A1] mb-3">
          Error 404
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-sm mx-auto">
          Halaman yang Anda cari tidak ada atau mungkin sudah dipindahkan.
          Mari kembali ke tempat yang aman.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/beranda"
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl bg-[#0D47A1] text-white font-bold text-sm hover:bg-blue-800 transition-colors shadow-sm w-full sm:w-auto"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-sm hover:border-[#0D47A1] hover:text-[#0D47A1] transition-colors w-full sm:w-auto"
          >
            Halaman Utama
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Kode: 404 &middot; Tidak ditemukan
        </p>
      </div>
    </div>
  );
}
