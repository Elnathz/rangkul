import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, Radio, ShieldCheck } from "lucide-react";

import type { TaskDetailPresentation } from "./task-detail-presentation";

const toneStyle: Record<TaskDetailPresentation["tone"], { panel: string; icon: string }> = {
  brand: { panel: "border-blue-200 bg-[linear-gradient(135deg,#eef5ff_0%,#f8fbff_100%)]", icon: "bg-primary text-primary-foreground" },
  warning: { panel: "border-amber-200 bg-[linear-gradient(135deg,#fff7e8_0%,#fffdf8_100%)]", icon: "bg-amber-100 text-amber-800" },
  live: { panel: "border-blue-300 bg-[linear-gradient(135deg,#e8f2ff_0%,#f8fbff_100%)]", icon: "bg-primary text-primary-foreground" },
  success: { panel: "border-emerald-200 bg-[linear-gradient(135deg,#ecf8f0_0%,#fbfefc_100%)]", icon: "bg-emerald-700 text-white" },
  danger: { panel: "border-red-200 bg-[linear-gradient(135deg,#fff0f0_0%,#fffafa_100%)]", icon: "bg-red-700 text-white" },
};

function StateIcon({ tone }: { tone: TaskDetailPresentation["tone"] }) {
  if (tone === "warning") return <Clock3 className="h-5 w-5" aria-hidden="true" />;
  if (tone === "live") return <Radio className="h-5 w-5" aria-hidden="true" />;
  if (tone === "success") return <CheckCircle2 className="h-5 w-5" aria-hidden="true" />;
  if (tone === "danger") return <CircleAlert className="h-5 w-5" aria-hidden="true" />;
  return <ShieldCheck className="h-5 w-5" aria-hidden="true" />;
}
export function TaskNextActionPanel({
  presentation,
  taskId,
  lansiaId,
  scheduleSummary,
}: {
  presentation: TaskDetailPresentation;
  taskId: string;
  lansiaId: string;
  scheduleSummary?: string;
}) {
  const style = toneStyle[presentation.tone];
  const actionHref = presentation.primaryAction?.kind === "applicants"
    ? `/kunjungan/${taskId}/pelamar`
    : presentation.primaryAction?.kind === "history"
      ? `/lansia/${lansiaId}/riwayat`
      : null;

  return (
    <section className={`rounded-[18px] border p-4 sm:p-5 ${style.panel}`} aria-labelledby="current-state-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${style.icon}`}>
            <StateIcon tone={presentation.tone} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-ink-muted">Yang terjadi sekarang</p>
            <h2 id="current-state-title" className="mt-1 font-display text-lg font-extrabold leading-snug text-ink">
              {presentation.headline}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-muted">{presentation.explanation}</p>
            {presentation.supportingText ? <p className="mt-2 text-sm font-semibold leading-6 text-ink">{presentation.supportingText}</p> : null}
            {scheduleSummary ? <p className="mt-3 inline-flex rounded-lg bg-white/75 px-3 py-2 text-xs font-bold text-ink">Jadwal: {scheduleSummary}</p> : null}
          </div>
        </div>

        {presentation.primaryAction && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_8px_20px_rgba(13,71,161,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#083578] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px"
          >
            {presentation.primaryAction.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
