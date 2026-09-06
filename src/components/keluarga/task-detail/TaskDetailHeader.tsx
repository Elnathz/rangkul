"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy } from "lucide-react";

import type { TaskDetailPresentation } from "./task-detail-presentation";

const toneClass: Record<TaskDetailPresentation["tone"], string> = {
  brand: "border-blue-200 bg-blue-50 text-primary",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  live: "border-blue-200 bg-primary text-primary-foreground",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  danger: "border-red-200 bg-red-50 text-red-700",
};

type Props = {
  taskId: string;
  title: string;
  lansiaName: string;
  total: number;
  categoryDescription: string;
  presentation: TaskDetailPresentation;
  taskReference: string;
};

export function TaskDetailHeader({
  taskId,
  title,
  lansiaName,
  total,
  categoryDescription,
  presentation,
  taskReference,
}: Props) {
  const [copied, setCopied] = React.useState(false);

  async function copyReference() {
    await navigator.clipboard.writeText(taskId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <header className="border-b border-border bg-[linear-gradient(135deg,var(--info-bg)_0%,var(--surface)_58%,#f4f9ff_100%)] px-4 py-5 sm:px-6 sm:py-6 lg:px-7">
      <Link
        href="/kunjungan"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink-muted transition-colors duration-200 hover:text-primary focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Kunjungan
      </Link>

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold ${toneClass[presentation.tone]}`}>
            {presentation.label}
          </span>
          <h1 className="mt-3 font-display text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-1 text-sm font-semibold text-ink-muted">Untuk {lansiaName}</p>
          {categoryDescription ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">{categoryDescription}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-end justify-between gap-6 border-t border-border pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0 sm:text-right">
          <button
            type="button"
            onClick={copyReference}
            title={`Salin ID lengkap ${taskId}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-bold text-ink-muted transition-colors duration-200 hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={copied ? "ID kunjungan tersalin" : `Salin ID kunjungan ${taskReference}`}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {taskReference}
          </button>
          <div>
            <p className="text-xs font-semibold text-ink-muted">Total kunjungan</p>
            <p className="mt-0.5 text-xl font-extrabold text-ink">Rp {total.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
