import Link from "next/link";
import { AlertCircle, ArrowLeft, CalendarDays, RotateCcw, SearchX } from "lucide-react";

type RiwayatStateProps =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "not_found" }
  | { kind: "error"; message: string; onRetry: () => void };

export function RiwayatState(props: RiwayatStateProps) {
  if (props.kind === "loading") {
    return (
      <div className="mx-auto min-h-screen max-w-5xl space-y-7 bg-[#F5F8FC] px-4 py-6 sm:px-6 sm:py-8" aria-live="polite" aria-busy="true">
        <span className="sr-only">Memuat Riwayat Rangkul</span>
        <div className="h-11 w-52 animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none" />
        <div className="h-40 animate-pulse rounded-2xl bg-blue-200 motion-reduce:animate-none" />
        <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-2xl bg-white shadow-sm motion-reduce:animate-none" />
          ))}
        </div>
      </div>
    );
  }

  if (props.kind === "empty") {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
        <CalendarDays className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
        <h2 className="mt-3 font-bold text-slate-900">Belum ada kunjungan selesai</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">Health Snapshot dan Cerita Hari Ini akan muncul setelah Helper mengirim laporan kunjungan yang selesai.</p>
      </div>
    );
  }

  if (props.kind === "not_found") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-8 sm:px-6">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10" role="status">
          <SearchX className="mx-auto h-8 w-8 text-slate-500" aria-hidden="true" />
          <h1 className="mt-3 text-xl font-black text-slate-950">Riwayat tidak ditemukan</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">Profil ini tidak tersedia atau tidak dapat diakses dari akun Anda.</p>
          <Link href="/beranda" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0D47A1] px-4 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900" role="alert">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
        <h1 className="mt-3 font-bold">Riwayat belum dapat dimuat</h1>
        <p className="mt-1 text-sm leading-relaxed">{props.message}</p>
        <button type="button" onClick={props.onRetry} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Coba lagi
        </button>
      </div>
    </div>
  );
}
