"use client";

import { useEffect, useState } from "react";

type SignedFileState = {
  url: string | null;
  status: "loading" | "ready" | "forbidden" | "error";
};

export function useSignedFile(path: string | null | undefined): SignedFileState {
  const isDirect = Boolean(
    path && (
      path.startsWith("/") ||
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("data:")
    )
  );

  const [remoteState, setRemoteState] = useState<SignedFileState>({
    url: null,
    status: "loading",
  });

  useEffect(() => {
    if (!path || isDirect) return;

    let cancelled = false;
    const params = new URLSearchParams({ path });
    fetch(`/api/storage/read?${params.toString()}`, { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 403) {
          setRemoteState({ url: null, status: "forbidden" });
          return;
        }
        const body = (await res.json().catch(() => null)) as { url?: string } | null;
        if (!res.ok || !body?.url) {
          setRemoteState({ url: null, status: "error" });
          return;
        }
        setRemoteState({ url: body.url, status: "ready" });
      })
      .catch(() => {
        if (!cancelled) setRemoteState({ url: null, status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [path, isDirect]);

  if (!path) return { url: null, status: "error" };
  if (isDirect) return { url: path, status: "ready" };
  return remoteState;
}