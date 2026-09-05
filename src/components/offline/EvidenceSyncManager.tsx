"use client";

import * as React from "react";
import { CheckCircle2, CloudUpload, DownloadCloud, Loader2, RotateCw, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  getAllDrafts,
  saveEvidenceDraft,
  deleteEvidenceDraft,
  type OfflineEvidenceDraft,
} from "@/lib/offline/evidence-store";
import { createClient } from "@/lib/supabase/client";

type SyncFn = (draft: OfflineEvidenceDraft) => Promise<void>;

interface EvidenceSyncManagerProps {
  syncFn: SyncFn;
}

const SUBMITTED_VISIBLE_MS = 8000;

/**
 * EvidenceSyncManager dipasang di layout Helper agar sinkronisasi berlanjut
 * walau user berpindah dari halaman laporan. Menampilkan daftar draf pending,
 * gagal, dan baru terkirim lengkap dengan tombol retry serta cancel berkonfirmasi
 * karena cancel menghapus Blob foto lokal.
 */
export default function EvidenceSyncManager({ syncFn }: EvidenceSyncManagerProps) {
  const syncFnRef = React.useRef(syncFn);
  const [drafts, setDrafts] = React.useState<OfflineEvidenceDraft[]>([]);
  const [open, setOpen] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = React.useState<OfflineEvidenceDraft | null>(null);

  React.useEffect(() => {
    syncFnRef.current = syncFn;
  }, [syncFn]);

  const refresh = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const all = await getAllDrafts(user.id);
      const now = Date.now();
      const visible: OfflineEvidenceDraft[] = [];
      for (const draft of all) {
        const isSubmittedRecently = draft.status === "submitted" && now - new Date(draft.updated_at).getTime() < SUBMITTED_VISIBLE_MS;
        if (draft.status === "submitted" && !isSubmittedRecently) {
          await deleteEvidenceDraft(draft.id).catch(() => undefined);
          continue;
        }
        visible.push(draft);
      }
      setDrafts(visible);
    } catch {
      // Tidak crash saat IndexedDB atau sesi tidak tersedia.
    }
  }, []);

  const syncAll = React.useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const pendingDrafts = await getAllDrafts(user.id);
      for (const draft of pendingDrafts) {
        if (!navigator.onLine) break;
        if (draft.status === "submitted" || draft.status === "syncing") continue;
        setBusyId(draft.id);
        const syncing: OfflineEvidenceDraft = { ...draft, status: "syncing", updated_at: new Date().toISOString() };
        await saveEvidenceDraft(syncing).catch(() => undefined);
        try {
          await syncFnRef.current(syncing);
          await saveEvidenceDraft({ ...syncing, status: "submitted", updated_at: new Date().toISOString() }).catch(() => undefined);
        } catch (error: unknown) {
          const failed: OfflineEvidenceDraft = {
            ...syncing,
            status: "failed",
            retry_count: syncing.retry_count + 1,
            last_error: error instanceof Error ? error.message : "Laporan belum dapat disinkronkan",
            updated_at: new Date().toISOString(),
          };
          await saveEvidenceDraft(failed).catch(() => undefined);
        }
      }
      setBusyId(null);
      await refresh();
    } catch {
      setBusyId(null);
    }
  }, [refresh]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const handleOnline = () => void syncAll();
    window.addEventListener("online", handleOnline);
    if (navigator.onLine) void syncAll();
    const interval = window.setInterval(() => void refresh(), SUBMITTED_VISIBLE_MS);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.clearInterval(interval);
    };
  }, [refresh, syncAll]);

  const retry = React.useCallback(async (draft: OfflineEvidenceDraft) => {
    if (busyId || !navigator.onLine) return;
    setBusyId(draft.id);
    try {
      await syncFnRef.current({ ...draft, status: "syncing" });
      await saveEvidenceDraft({ ...draft, status: "submitted", updated_at: new Date().toISOString() }).catch(() => undefined);
    } catch (error: unknown) {
      const failed: OfflineEvidenceDraft = {
        ...draft,
        status: "failed",
        retry_count: draft.retry_count + 1,
        last_error: error instanceof Error ? error.message : "Laporan belum dapat disinkronkan",
        updated_at: new Date().toISOString(),
      };
      await saveEvidenceDraft(failed).catch(() => undefined);
    } finally {
      setBusyId(null);
      await refresh();
    }
  }, [busyId, refresh]);

  const cancelDraft = React.useCallback(async () => {
    if (!cancelTarget) return;
    await deleteEvidenceDraft(cancelTarget.id).catch(() => undefined);
    setCancelTarget(null);
    await refresh();
  }, [cancelTarget, refresh]);

  const pendingCount = drafts.filter((d) => d.status === "pending_sync" || d.status === "failed" || d.status === "syncing").length;
  if (pendingCount === 0 && drafts.length === 0) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-50 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900 shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1] focus-visible:ring-offset-2"
          aria-label={pendingCount > 0 ? `${pendingCount} laporan menunggu sinkronisasi` : "Draf laporan kunjungan"}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
          {pendingCount > 0 ? `${pendingCount} menunggu kirim` : "Draf laporan"}
        </button>
      )}

      {open && (
        <section
          aria-label="Daftar draf laporan kunjungan"
          className="fixed bottom-4 right-4 left-4 z-50 max-h-[70vh] overflow-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl sm:left-auto sm:w-[380px] sm:max-w-[calc(100vw-2rem)]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-slate-950">Draf laporan kunjungan</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]"
              aria-label="Tutup daftar draf"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-1 text-xs text-slate-500">Laporan tersimpan di perangkat dan dikirim otomatis saat koneksi kembali.</p>

          <ul className="mt-4 space-y-3">
            {drafts.map((draft) => {
              const busy = busyId === draft.id;
              const label = draft.kategori_nama ?? "Laporan kunjungan";
              return (
                <li key={draft.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-500">Untuk {draft.lansia_nama ?? "lansia"}</p>
                    </div>
                    <StatusPill status={draft.status} />
                  </div>
                  {draft.status === "failed" && draft.last_error && (
                    <p className="mt-2 text-xs font-medium text-amber-800">{draft.last_error}</p>
                  )}
                  {draft.status === "submitted" && (
                    <p className="mt-2 text-xs font-semibold text-emerald-700">Terkirim. Keluarga akan melihat laporanmu.</p>
                  )}
                  {(draft.status === "pending_sync" || draft.status === "failed") && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void retry(draft)}
                        disabled={busy || !navigator.onLine}
                        className="flex-1 rounded-xl text-xs font-bold"
                      >
                        {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCw className="mr-1.5 h-3.5 w-3.5" />}
                        Kirim ulang
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setCancelTarget(draft)}
                        disabled={busy}
                        className="rounded-xl text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Hapus
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={() => setCancelTarget(null)}
        title="Hapus draf laporan?"
        description="Draf beserta foto bukti di perangkat ini akan dihapus permanen dan tidak dapat dikirim lagi. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus draf"
        tone="danger"
        onConfirm={cancelDraft}
      />
    </>
  );
}

function StatusPill({ status }: { status: OfflineEvidenceDraft["status"] }) {
  if (status === "syncing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
        <Loader2 className="h-3 w-3 animate-spin" /> Mengunggah
      </span>
    );
  }
  if (status === "submitted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Terkirim
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">
        <DownloadCloud className="h-3 w-3" /> Gagal
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
      <CloudUpload className="h-3 w-3" /> Menunggu
    </span>
  );
}