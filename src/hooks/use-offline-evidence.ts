"use client";

import * as React from "react";
import {
  deleteEvidenceDraft,
  getPendingDrafts,
  getEvidenceDraft,
  saveEvidenceDraft,
  type OfflineEvidenceDraft,
} from "@/lib/offline/evidence-store";
import { createClient } from "@/lib/supabase/client";

type SyncDraft = (draft: OfflineEvidenceDraft) => Promise<void>;

export function useOfflineEvidence(taskId: string, ownerId: string, syncDraft: SyncDraft) {
  const [draft, setDraft] = React.useState<OfflineEvidenceDraft | null>(null);
  const [isOnline, setIsOnline] = React.useState(() => typeof navigator === "undefined" || navigator.onLine);
  const [isLoading, setIsLoading] = React.useState(true);
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const syncDraftRef = React.useRef(syncDraft);
  const draftRef = React.useRef<OfflineEvidenceDraft | null>(null);

  React.useEffect(() => {
    syncDraftRef.current = syncDraft;
  }, [syncDraft]);

  React.useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const sync = React.useCallback(async (candidate: OfflineEvidenceDraft | null = draftRef.current): Promise<boolean> => {
    if (!candidate || !navigator.onLine) return false;
    setSyncError(null);
    setDraft((current) => current ? { ...current, status: "syncing" } : current);
    const syncing: OfflineEvidenceDraft = { ...candidate, status: "syncing" };
    try {
      await saveEvidenceDraft(syncing);
      await syncDraftRef.current(syncing);
      await deleteEvidenceDraft(syncing.id);
      setDraft(null);
      setSyncError(null);
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Draf belum dapat disinkronkan";
      const failed: OfflineEvidenceDraft = {
        ...syncing,
        status: "failed",
        retry_count: syncing.retry_count + 1,
        last_error: message,
        updated_at: new Date().toISOString(),
      };
      await saveEvidenceDraft(failed).catch(() => undefined);
      setDraft(failed);
      setSyncError(message);
      return false;
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    getEvidenceDraft(ownerId, taskId)
      .then((stored) => {
        if (active) setDraft(stored);
      })
      .catch(() => undefined)
      .finally(() => active && setIsLoading(false));

    const handleOnline = () => {
      setIsOnline(true);
      void getEvidenceDraft(ownerId, taskId).then((stored) => sync(stored)).catch(() => undefined);
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      active = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [taskId, ownerId, sync]);

  const save = React.useCallback(async (nextDraft: OfflineEvidenceDraft) => {
    await saveEvidenceDraft(nextDraft);
    setDraft(nextDraft);
    setSyncError(null);
    setLastSaved(new Date());
  }, []);

  const clear = React.useCallback(async () => {
    if (draftRef.current) await deleteEvidenceDraft(draftRef.current.id);
    setDraft(null);
    setSyncError(null);
    setLastSaved(null);
  }, []);

  return { draft, isOnline, isLoading, syncError, lastSaved, save, sync, clear };
}

/**
 * Hook for EvidenceSyncManager - syncs all pending drafts for the current user.
 */
export function useGlobalEvidenceSync(syncFn: SyncDraft) {
  const syncFnRef = React.useRef(syncFn);
  React.useEffect(() => {
    syncFnRef.current = syncFn;
  }, [syncFn]);

  React.useEffect(() => {
    let isMounted = true;

    const syncAll = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        const pendingDrafts = await getPendingDrafts(user.id);
        for (const draft of pendingDrafts) {
          if (!isMounted || !navigator.onLine) break;
          try {
            await syncFnRef.current(draft);
            await deleteEvidenceDraft(draft.id);
          } catch {
            // Non-fatal: update status to failed but continue other drafts
            const failed: OfflineEvidenceDraft = {
              ...draft,
              status: "failed",
              retry_count: draft.retry_count + 1,
              updated_at: new Date().toISOString(),
            };
            await saveEvidenceDraft(failed).catch(() => undefined);
          }
        }
      } catch {
        // Silent - global sync failure should not crash the app
      }
    };

    const handleOnline = () => {
      void syncAll();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      isMounted = false;
      window.removeEventListener("online", handleOnline);
    };
  }, []);
}
