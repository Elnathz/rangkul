export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png";
export const DOCUMENT_ACCEPT = "image/jpeg,image/png,application/pdf,.pdf";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const DOCUMENT_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);

type UploadKind = "image" | "document";

type UploadValidationOptions = {
  kind: UploadKind;
  label: string;
};

type FileLike = {
  name: string;
  type: string;
  size: number;
};

function extensionOf(fileName: string) {
  return fileName.trim().toLowerCase().split(".").pop() ?? "";
}

export function validateUploadFile(file: FileLike, options: UploadValidationOptions): string | null {
  if (file.size > MAX_UPLOAD_BYTES) return `${options.label} maksimal 5MB.`;

  const extension = extensionOf(file.name);
  const isImageExtension = extension === "jpg" || extension === "jpeg" || extension === "png";
  const isPdfExtension = extension === "pdf";
  const allowedTypes = options.kind === "image" ? IMAGE_TYPES : DOCUMENT_TYPES;
  const hasKnownMime = Boolean(file.type);
  const mimeAllowed = allowedTypes.has(file.type);
  const extensionAllowed = options.kind === "image" ? isImageExtension : isImageExtension || isPdfExtension;

  if ((hasKnownMime && !mimeAllowed) || (!hasKnownMime && !extensionAllowed)) {
    return options.kind === "image"
      ? `${options.label} harus berupa JPG atau PNG.`
      : `${options.label} harus berupa JPG, PNG, atau PDF.`;
  }

  if (options.kind === "image" && isPdfExtension) {
    return `${options.label} harus berupa JPG atau PNG.`;
  }

  return null;
}
