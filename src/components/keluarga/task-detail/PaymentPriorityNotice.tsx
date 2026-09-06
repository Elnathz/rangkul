import Link from "next/link";
import { AlertCircle, ArrowRight, CreditCard } from "lucide-react";

import type { TaskStatus } from "@/lib/constants/task-status";
import { formatPaymentDeadline, getPaymentPresentation, paymentRequiresCompletion } from "./task-detail-presentation";

export function PaymentPriorityNotice({
  taskId,
  paymentStatus,
  taskStatus,
  jadwalWaktu,
}: {
  taskId: string;
  paymentStatus: string | null | undefined;
  taskStatus: TaskStatus;
  jadwalWaktu: string | null | undefined;
}) {
  const payment = getPaymentPresentation(paymentStatus, taskStatus, jadwalWaktu);
  const needsCompletion = paymentRequiresCompletion(paymentStatus, taskStatus, jadwalWaktu);

  if (!needsCompletion && payment.tone !== "danger") return null;

  return (
    <section
      className="border-b border-amber-200 bg-[linear-gradient(90deg,#fff8e6_0%,#fffdf7_55%,#fff_100%)] px-4 py-4 sm:px-6 lg:px-7"
      aria-labelledby="payment-priority-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-amber-800">
              <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
              Pembayaran
            </p>
            <h2 id="payment-priority-title" className="mt-0.5 font-display text-base font-extrabold text-ink">
              {payment.label}
            </h2>
            <p className="mt-1 text-sm leading-5 text-ink-muted">{payment.description}</p>
            {paymentRequiresCompletion(paymentStatus, taskStatus, jadwalWaktu) && formatPaymentDeadline(jadwalWaktu) ? (
              <p className="mt-2 text-sm font-bold text-amber-900">
                Bayar paling lambat <time dateTime={jadwalWaktu ?? undefined}>{formatPaymentDeadline(jadwalWaktu)}</time>
              </p>
            ) : null}
          </div>
        </div>
        {needsCompletion && payment.actionLabel ? (
          <Link
            href={`/pembayaran/${taskId}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#083578] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {payment.actionLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
