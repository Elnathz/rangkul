"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

const statusLabels: Record<string, string> = {
  active: "Aktif",
  restricted: "Dibatasi",
  suspended: "Ditangguhkan",
  pending_verification: "Menunggu verifikasi",
  verified: "Terverifikasi",
  under_review: "Dalam peninjauan",
  rejected: "Ditolak",
};

const statusClasses: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  restricted: "bg-amber-50 text-amber-700 ring-amber-600/15",
  under_review: "bg-orange-50 text-orange-700 ring-orange-600/15",
  pending_verification: "bg-sky-50 text-sky-700 ring-sky-600/15",
  suspended: "bg-red-50 text-red-700 ring-red-600/15",
  rejected: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

export function AdminStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/15"}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

export function AdminModal({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" role="presentation">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 sm:max-w-2xl sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-6">
          <div>
            <h2 id="admin-modal-title" className="text-base font-bold text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" aria-label="Tutup dialog">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

export function AdminLoadingRows({ columns = 4 }: { columns?: number }) {
  return <div className="space-y-3 p-4 sm:p-6">{Array.from({ length: 4 }).map((_, row) => <div key={row} className="grid animate-pulse gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }).map((__, column) => <div key={column} className="h-10 rounded-lg bg-slate-100" />)}</div>)}</div>;
}

export function formatRupiah(value: number | null | undefined) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value ?? 0);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Belum tersedia";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
