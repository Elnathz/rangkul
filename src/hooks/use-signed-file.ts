"use client";

import { useEffect, useState } from "react";

type SignedFileState = {
  url: string | null;
  status: "loading" | "ready" | "forbidden" | "error";
};

export function useSignedFile(path: string | null | undefined): SignedFileState {
  const [state, setState] = useState<SignedFileState>(() =>
    path ? { url: null, status: "loading" } : { url: null, status: "error" }
  );

  useEffect(() => {
    if (!path) return;

    let cancelled = false;
    const params = new URLSearchParams({ path });
    fetch(`/api/storage/read?${params.toString()}`, { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 403) {
          setState({ url: null, status: "forbidden" });
          return;
        }
        const body = (await res.json().catch(() => null)) as { url?: string } | null;
        if (!res.ok || !body?.url) {
          setState({ url: null, status: "error" });
          return;
        }
        setState({ url: body.url, status: "ready" });
      })
      .catch(() => {
        if (!cancelled) setState({ url: null, status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}