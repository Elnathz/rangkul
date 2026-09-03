const DEFAULT_PRIVATE_BUCKET = "dokumen";
const SIGNED_URL_TTL_SECONDS = 300;

type PrivateUrlSigner = (path: string, expiresIn: number) => Promise<string | null>;

function isSafeObjectPath(path: string) {
  return path.length > 0
    && !path.startsWith("/")
    && !path.includes("\\")
    && path.split("/").every((part) => part.length > 0 && part !== "." && part !== "..");
}

export function extractPrivateObjectPath(
  value: string | null | undefined,
  bucket = DEFAULT_PRIVATE_BUCKET,
) {
  const candidate = value?.trim();
  if (!candidate || candidate.startsWith("/")) return null;

  if (!/^https?:\/\//i.test(candidate)) {
    const withoutBucket = candidate.startsWith(`${bucket}/`)
      ? candidate.slice(bucket.length + 1)
      : candidate;
    return isSafeObjectPath(withoutBucket) ? withoutBucket : null;
  }

  try {
    const parsed = new URL(candidate);
    const prefixes = [
      `/storage/v1/object/sign/${bucket}/`,
      `/storage/v1/object/authenticated/${bucket}/`,
    ];
    const prefix = prefixes.find((item) => parsed.pathname.startsWith(item));
    if (!prefix) return null;
    const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
    return isSafeObjectPath(path) ? path : null;
  } catch {
    return null;
  }
}

export function extractOwnedPrivateObjectPath(
  value: string | null | undefined,
  userId: string,
  documentType: string,
) {
  const objectPath = extractPrivateObjectPath(value);
  if (!objectPath) return null;

  const expectedPrefix = `${userId}/${documentType}/`;
  return objectPath.startsWith(expectedPrefix) ? objectPath : null;
}

export async function resolvePrivatePhotoUrl(
  value: string | null | undefined,
  signer: PrivateUrlSigner,
) {
  const candidate = value?.trim();
  if (!candidate) return null;
  if (candidate.startsWith("/")) return candidate;

  const objectPath = extractPrivateObjectPath(candidate);
  if (!objectPath) return null;

  try {
    return await signer(objectPath, SIGNED_URL_TTL_SECONDS);
  } catch {
    return null;
  }
}
