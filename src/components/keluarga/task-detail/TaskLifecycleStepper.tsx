import { Check, Circle, X } from "lucide-react";

import type { TaskDetailStep } from "./task-detail-presentation";

const iconClass: Record<TaskDetailStep["state"], string> = {
  complete: "border-emerald-600 bg-emerald-600 text-white",
  current: "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_var(--info-bg)]",
  upcoming: "border-border bg-white text-ink-muted",
  cancelled: "border-red-600 bg-red-600 text-white shadow-[0_0_0_4px_var(--danger-bg)]",
};

function StepIcon({ state }: { state: TaskDetailStep["state"] }) {
  if (state === "complete") return <Check className="h-3.5 w-3.5" aria-hidden="true" />;
  if (state === "cancelled") return <X className="h-3.5 w-3.5" aria-hidden="true" />;
  return <Circle className="h-2.5 w-2.5 fill-current" aria-hidden="true" />;
}

export function TaskLifecycleStepper({ steps }: { steps: TaskDetailStep[] }) {
  return (
    <nav aria-label="Proses kunjungan" className="border-b border-border bg-surface px-4 py-5 sm:px-6 lg:px-7">
      <p className="mb-4 text-sm font-extrabold text-ink">Perjalanan kunjungan</p>
      <ol className="grid gap-0 md:flex md:items-start" role="list">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="relative grid min-h-11 grid-cols-[28px_1fr] items-start gap-3 pb-3 last:pb-0 md:flex md:min-w-0 md:flex-1 md:flex-col md:items-center md:gap-2 md:pb-0 md:text-center"
            aria-current={step.state === "current" || step.state === "cancelled" ? "step" : undefined}
          >
            {index < steps.length - 1 ? (
              <span
                className={`absolute left-[13px] top-7 h-[calc(100%-20px)] w-px md:left-1/2 md:top-[13px] md:h-px md:w-full ${step.state === "complete" ? "bg-emerald-400" : "bg-border"}`}
                aria-hidden="true"
              />
            ) : null}
            <span className={`relative z-[1] flex h-7 w-7 items-center justify-center rounded-full border-2 ${iconClass[step.state]}`}>
              <StepIcon state={step.state} />
            </span>
            <span className={`relative z-[1] pt-1 text-xs font-bold leading-5 md:max-w-28 md:pt-0 ${step.state === "upcoming" ? "text-ink-muted" : "text-ink"}`}>
              {step.label}
              <span className="sr-only">
                {step.state === "complete" ? ", selesai" : step.state === "current" ? ", tahap saat ini" : step.state === "cancelled" ? ", dibatalkan" : ", belum dimulai"}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
