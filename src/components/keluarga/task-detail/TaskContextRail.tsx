"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, MessageCircle, ShieldCheck, UserRound } from "lucide-react";

import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";
import { RegionAddress } from "@/components/ui/RegionAddress";
import { getPaymentPresentation } from "./task-detail-presentation";
import type { TaskStatus } from "@/lib/constants/task-status";

type PersonImageProps = {
  src: string | null;
  name: string;
  size: "elder" | "helper";
};

function PersonImage({ src, name, size }: PersonImageProps) {
  const [open, setOpen] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const canPreview = Boolean(src && !failed);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "R";
  const sizeClass = size === "elder" ? "h-[76px] w-[76px] rounded-[18px] text-xl" : "h-14 w-14 rounded-[14px] text-base";

  return (
    <>
      <button
        type="button"
        disabled={!canPreview}
        onClick={() => canPreview && setOpen(true)}
        className={`${sizeClass} relative shrink-0 overflow-hidden border border-blue-100 bg-blue-50 font-extrabold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default`}
        aria-label={canPreview ? `Buka foto ${name}` : `Foto ${name} belum tersedia`}
      >
        {canPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src as string} alt={`Foto ${name}`} onError={() => setFailed(true)} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center">{initials}</span>
        )}
      </button>
      <ImagePreviewModal open={open} onOpenChange={setOpen} src={canPreview ? src : null} alt={`Foto ${name}`} title={`Foto ${name}`} />
    </>
  );
}

export function TaskContextRail({
  taskId,
  lansia,
  helper,
  showContactHelper,
  paymentStatus,
  taskStatus,
}: {
  taskId: string;
  lansia: {
    id: string;
    nama: string;
    alamat: string;
    fotoUrl: string | null;
    umur: number | null;
    tingkatMobilitas: string | null;
  };
  helper: {
    name: string;
    photoUrl: string | null;
    rating: number;
    completedTasks: number;
  } | null;
  showContactHelper: boolean;
  paymentStatus: string | null | undefined;
  taskStatus: TaskStatus;
}) {
  const hasMeaningfulRating = Boolean(helper && helper.rating > 0 && helper.completedTasks > 0);
  const payment = getPaymentPresentation(paymentStatus, taskStatus);

  return (
    <aside className="overflow-hidden rounded-[18px] border border-border bg-surface lg:sticky lg:top-24 lg:self-start" aria-label="Konteks kunjungan">
      <section className="p-4 sm:p-5" aria-labelledby="elder-context-title">
        <p className="text-xs font-bold text-ink-muted">Orang tersayang</p>
        <div className="mt-3 flex items-start gap-3">
          <PersonImage src={lansia.fotoUrl} name={lansia.nama} size="elder" />
          <div className="min-w-0">
            <h2 id="elder-context-title" className="font-display text-base font-extrabold text-ink">{lansia.nama}</h2>
            {lansia.umur || lansia.tingkatMobilitas ? (
              <p className="mt-1 text-xs font-semibold text-ink-muted">
                {[lansia.umur ? `${lansia.umur} tahun` : null, lansia.tingkatMobilitas].filter(Boolean).join(", ")}
              </p>
            ) : null}
            <div className="mt-2"><RegionAddress value={lansia.alamat} compact /></div>
          </div>
        </div>
        <Link
          href={`/lansia/${lansia.id}`}
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Lihat profil lansia
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="border-t border-border p-4 sm:p-5" aria-labelledby="helper-context-title">
        <p className="text-xs font-bold text-ink-muted">Helper</p>
        {helper ? (
          <>
            <div className="mt-3 flex items-center gap-3">
              <PersonImage src={helper.photoUrl} name={helper.name} size="helper" />
              <div className="min-w-0">
                <h2 id="helper-context-title" className="truncate font-display text-base font-extrabold text-ink">{helper.name}</h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  {hasMeaningfulRating
                    ? `${helper.rating.toFixed(1)} dari ${helper.completedTasks} kunjungan`
                    : "Helper terverifikasi"}
                </p>
              </div>
            </div>
            {showContactHelper ? (
              <div className="mt-4 grid gap-2">
                <Link
                  href={`/beranda/pesan/${taskId}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition duration-200 hover:bg-[#083578] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Hubungi Helper
                </Link>
                <Link
                  href={`/kunjungan/${taskId}/laporkan`}
                  className="inline-flex min-h-11 items-center justify-center text-sm font-bold text-ink-muted transition-colors duration-200 hover:text-red-700 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Laporkan masalah
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-3 flex items-start gap-3 rounded-[14px] bg-[var(--surface-subtle)] p-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-white text-primary">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="helper-context-title" className="text-sm font-extrabold text-ink">Belum dipilih</h2>
              <p className="mt-1 text-xs leading-5 text-ink-muted">Helper akan tampil setelah dipilih atau menerima kunjungan.</p>
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-border bg-[var(--surface-subtle)] p-4 sm:p-5" aria-labelledby="rail-payment-title">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 id="rail-payment-title" className="text-sm font-extrabold text-ink">Pembayaran</h2>
            <p className="mt-1 text-xs font-bold text-ink">{payment.label}</p>
          </div>
        </div>
        {payment.actionLabel ? (
          <Link
            href={`/pembayaran/${taskId}`}
            className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {payment.actionLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </section>
    </aside>
  );
}
