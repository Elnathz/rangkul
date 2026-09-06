import { CalendarDays, Clock3, ExternalLink, MapPinned, MessageSquareText } from "lucide-react";

import { RegionAddress } from "@/components/ui/RegionAddress";

function formatFullSchedule(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}
export function ScheduleLocationSection({
  schedule,
  durationMinutes,
  address,
  mapUrl,
  note,
  archived = false,
}: {
  schedule: string;
  durationMinutes: number;
  address: string;
  mapUrl: string | null;
  note: string;
  archived?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-border bg-surface" aria-labelledby="task-essentials-title">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <h2 id="task-essentials-title" className="font-display text-lg font-extrabold text-ink">
          {archived ? "Rincian kunjungan sebelumnya" : "Jadwal dan lokasi"}
        </h2>
      </div>

      <div className="grid sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-3 border-b border-border p-4 sm:border-b-0 sm:border-r sm:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-primary">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink-muted">{archived ? "Jadwal sebelumnya" : "Jadwal"}</p>
            <p className="mt-1 text-sm font-extrabold leading-6 text-ink">{formatFullSchedule(schedule)}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {durationMinutes} menit
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-3 p-4 sm:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-700">
            <MapPinned className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink-muted">Lokasi</p>
            <div className="mt-1.5"><RegionAddress value={address} /></div>
            {mapUrl && !archived ? (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Buka Maps
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 border-t border-border bg-[var(--surface-subtle)] p-4 sm:p-5">
        <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold text-ink-muted">Catatan untuk Helper</p>
          <p className="mt-1 text-sm leading-6 text-ink">{note || "Tidak ada catatan tambahan."}</p>
        </div>
      </div>
    </section>
  );
}
