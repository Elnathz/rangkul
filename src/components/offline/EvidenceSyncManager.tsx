"use client";

import * as React from "react";
import { getPendingDrafts, saveEvidenceDraft, deleteEvidenceDraft, type OfflineEvidenceDraft } from "@/lib/offline/evidence-store";
import { createClient } from "@/lib/supabase/client";

type SyncFn = (draft: OfflineEvidenceDraft) => Promise<void>;

interface EvidenceSyncManagerProps {
  syncFn: SyncFn;
}

/**
 * EvidenceSyncManager mounts at the Helper layout level so that evidence sync
 * continues even when the user navigates away from the /lapor page.
 */
export default function EvidenceSyncManager({ syncFn }: EvidenceSyncManagerProps) {
  const syncFnRef = React.useRef(syncFn);
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    syncFnRef.current = syncFn;
  }, [syncFn]);

  const syncAll = React.useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const pendingDrafts = await getPendingDrafts(user.id);
      setPendingCount(pendingDrafts.length);

      for (const draft of pendingDrafts) {
        if (!navigator.onLine) break;
        try {
          await syncFnRef.current(draft);
          await deleteEvidenceDraft(draft.id);
          setPendingCount((prev) => Math.max(0, prev - 1));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Sinkronisasi gagal";
          const failed: OfflineEvidenceDraft = {
            ...draft,
            status: "failed",
            retry_count: draft.retry_count + 1,
            last_error: message,
            updated_at: new Date().toISOString(),
          };
          await saveEvidenceDraft(failed).catch(() => undefined);
        }
      }
    } catch {
      // Silent failure - will retry on next online event
    }
  }, []);

  React.useEffect(() => {
    const handleOnline = () => void syncAll();
    window.addEventListener("online", handleOnline);

    // Also sync on mount if already online
    if (navigator.onLine) void syncAll();

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [syncAll]);

  if (pendingCount === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 shadow-lg"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
      {pendingCount} laporan menunggu sinkronisasi
    </div>
  );
}
