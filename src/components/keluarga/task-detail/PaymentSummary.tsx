import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import type { TaskStatus } from "@/lib/constants/task-status";
import { getPaymentPresentation } from "./task-detail-presentation";

type ExtraService = { id: string; nama_layanan: string; biaya: number };

export function PaymentSummary({
  taskId,
  basePrice,
  finalPrice,
  approvedServices,
  paymentStatus,
  taskStatus,
  jadwalWaktu,
}: {
  taskId: string;
  basePrice: number;
  finalPrice: number;
  approvedServices: ExtraService[];
  paymentStatus: string | null | undefined;
  taskStatus: TaskStatus;
  jadwalWaktu?: string | null;
}) {
  const payment = getPaymentPresentation(paymentStatus, taskStatus, jadwalWaktu);
  const toneClass = payment.tone === "warning"
    ? "border-amber-200 bg-amber-50/70"
    : payment.tone === "success"
      ? "border-emerald-200 bg-emerald-50/60"
      : payment.tone === "danger"
        ? "border-red-200 bg-red-50/60"
        : "border-border bg-surface";

  return (
    <section className={`rounded-[18px] border p-4 sm:p-5 ${toneClass}`} aria-labelledby="payment-summary-title">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-primary">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="payment-summary-title" className="font-display text-base font-extrabold text-ink">Ringkasan pembayaran</h2>
            <p className="mt-0.5 text-sm font-bold text-ink">{payment.label}</p>
          </div>
        </div>
        <p className="text-lg font-extrabold text-ink">Rp {finalPrice.toLocaleString("id-ID")}</p>
      </div>

      <p className="mt-3 text-sm leading-6 text-ink-muted">{payment.description}</p>

      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between gap-4 text-ink-muted">
          <dt>Harga dasar</dt>
          <dd className="font-semibold text-ink">Rp {basePrice.toLocaleString("id-ID")}</dd>
        </div>
        {approvedServices.map((service) => (
          <div key={service.id} className="flex items-center justify-between gap-4 text-ink-muted">
            <dt>{service.nama_layanan}</dt>
            <dd className="font-semibold text-ink">Rp {service.biaya.toLocaleString("id-ID")}</dd>
          </div>
        ))}
      </dl>

      {payment.actionLabel ? (
        <Link
          href={`/pembayaran/${taskId}`}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {payment.actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </section>
  );
}
