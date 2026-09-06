import { CalendarX2, CreditCard, FileText } from "lucide-react";

import { getPaymentPresentation } from "./task-detail-presentation";

function formatCancelledAt(value: string | null) {
  if (!value) return "Waktu pembatalan belum tercatat";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function CancellationSummary({
  cancellationReason,
  cancelledAt,
  paymentStatus,
  finalPrice,
}: {
  cancellationReason: string;
  cancelledAt: string | null;
  paymentStatus: string | null | undefined;
  finalPrice: number;
}) {
  const payment = getPaymentPresentation(paymentStatus, "dibatalkan");
  return (
    <section className="overflow-hidden rounded-[18px] border border-red-200 bg-surface" aria-labelledby="cancellation-title">
      <div className="flex items-start gap-3 bg-red-50 p-4 sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-red-700 text-white">
          <CalendarX2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="cancellation-title" className="font-display text-lg font-extrabold text-ink">Kunjungan dibatalkan</h2>
          <p className="mt-1 text-sm text-ink-muted">{formatCancelledAt(cancelledAt)}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2">
        <div className="flex items-start gap-3 border-b border-border p-4 sm:border-b-0 sm:border-r sm:p-5">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-ink-muted">Alasan pembatalan</p>
            <p className="mt-1 text-sm leading-6 text-ink">{cancellationReason || "Alasan pembatalan tidak dicatat."}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-ink-muted">Pembayaran</p>
            <p className="mt-1 text-sm font-bold leading-6 text-ink">Rp {finalPrice.toLocaleString("id-ID")}</p>
            <p className="mt-0.5 text-xs leading-5 text-ink-muted">{payment.label}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
