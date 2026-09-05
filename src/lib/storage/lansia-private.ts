import { extractOwnedPrivateObjectPath } from "@/lib/storage/private-object";

type LansiaPrivateReferences = {
  foto_url?: string | null;
  dokumen_identitas_lansia_url?: string | null;
  dokumen_hubungan_keluarga_url?: string | null;
};

const fields = [
  ["foto_url", "foto_lansia"],
  ["dokumen_identitas_lansia_url", "identitas_lansia"],
  ["dokumen_hubungan_keluarga_url", "hubungan_keluarga"],
] as const;

export function normalizeOwnedLansiaPrivateReferences<T extends LansiaPrivateReferences>(
  input: T,
  userId: string,
): T | null {
  const normalized = { ...input };

  for (const [field, documentType] of fields) {
    const value = normalized[field];
    if (value === undefined || value === null || value === "") continue;
    const objectPath = extractOwnedPrivateObjectPath(value, userId, documentType);
    if (!objectPath) return null;
    normalized[field] = objectPath;
  }

  return normalized;
}
