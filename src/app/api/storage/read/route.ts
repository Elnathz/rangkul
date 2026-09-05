import { apiResponse, createApiError } from "@/lib/api-response";
import { canAccessPrivateFile } from "@/lib/storage/private-file-access";
import { signFileUrl } from "@/lib/storage/read-file";

// GET /api/storage/read?path=<object-path>
// Membuat signed URL pendek untuk file privat setelah memeriksa hak actor.
// Actor di luar ownership/scope mendapat 403. Path arbitrary (bukan object path)
// ditolak agar tidak membocorkan metadata.
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get("path");

    if (!path || path.startsWith("http")) {
      return createApiError("validation_error", "Path file tidak valid", 400);
    }

    const allowed = await canAccessPrivateFile(path);
    if (!allowed) {
      return createApiError("forbidden", "Anda tidak memiliki akses ke file ini", 403);
    }

    const signedUrl = await signFileUrl(path);
    if (!signedUrl) {
      return createApiError("not_found", "File tidak ditemukan atau sudah kedaluwarsa", 404);
    }

    return apiResponse({ url: signedUrl }, 200);
  } catch (error: unknown) {
    return createApiError("server_error", (error as Error).message || "Terjadi kesalahan server", 500);
  }
}