export const VERIFICATION_UPLOADS = [
  {
    key: "ktp",
    label: "KTP / Dokumen Identitas",
    docType: "ktp",
    field: "ktp_url",
  },
  {
    key: "foto",
    label: "Foto Profil",
    docType: "foto_helper",
    field: "foto_url",
  },
] as const;

export function getUploadFailureMessage(
  label: string,
  message: string,
  fileName?: string,
) {
  const file = fileName ? ` (${fileName})` : "";
  const reason = message.trim() || "Periksa format dan ukuran file lalu coba lagi.";

  return `Gagal mengunggah ${label}${file}: ${reason}`;
}
