"use client";

import * as React from "react";
import {
  deleteEvidenceDraft,
  getEvidenceDraft,
  saveEvidenceDraft,
  type OfflineEvidenceDraft,
} from "@/lib/offline/evidence-store";

type SyncDraft = (draft: OfflineEvidenceDraft) => Promise<void>;

export function useOfflineEvidence(taskId: string, syncDraft: SyncDraft) {
  const [draft, setDraft] = React.useState<OfflineEvidenceDraft | null>(null);
  const [isOnline, setIsOnline] = React.useState(() => typeof navigator === "undefined" || navigator.onLine);
  const [isLoading, setIsLoading] = React.useState(true);
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const syncDraftRef = React.useRef(syncDraft);
  const draftRef = React.useRef<OfflineEvidenceDraft | null>(null);
  React.useEffect(() => {
    syncDraftRef.current = syncDraft;
  }, [syncDraft]);

  React.useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const sync = React.useCallback(async (candidate: OfflineEvidenceDraft | null = draftRef.current) => {
    if (!candidate || !navigator.onLine) return;
    setSyncError(null);
    setDraft((current) => current ? { ...current, status: "syncing" } : current);
    const syncing = { ...candidate, status: "syncing" as const };
    try {
      await saveEvidenceDraft(syncing);
      await syncDraftRef.current(syncing);
      await deleteEvidenceDraft(syncing.id);
      setDraft(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Draf belum dapat disinkronkan";
      const failed = { ...syncing, status: "failed" as const, retry_count: syncing.retry_count + 1, error_message: message, updated_at: new Date().toISOString() };
      await saveEvidenceDraft(failed).catch(() => undefined);
      setDraft(failed);
      setSyncError(message);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    getEvidenceDraft(taskId)
      .then((stored) => {
        if (active) setDraft(stored);
      })
      .catch(() => undefined)
      .finally(() => active && setIsLoading(false));

    const handleOnline = () => {
      setIsOnline(true);
      void getEvidenceDraft(taskId).then((stored) => sync(stored)).catch(() => undefined);
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      active = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [taskId, sync]);

  const save = React.useCallback(async (nextDraft: OfflineEvidenceDraft) => {
    await saveEvidenceDraft(nextDraft);
    setDraft(nextDraft);
    setSyncError(null);
  }, []);

  const clear = React.useCallback(async () => {
    if (draftRef.current) await deleteEvidenceDraft(draftRef.current.id);
    setDraft(null);
    setSyncError(null);
  }, []);

  return { draft, isOnline, isLoading, syncError, save, sync, clear };
}
