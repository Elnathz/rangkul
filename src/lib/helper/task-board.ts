export type TaskBoardBucket = "tersedia" | "aktif" | "riwayat";

export type TaskBoardStatus =
  | "diajukan"
  | "menunggu_persetujuan_koordinator"
  | "dikonfirmasi"
  | "dikerjakan"
  | "menunggu_persetujuan_keluarga"
  | "selesai"
  | "dibatalkan";

export function getTaskBoardBucket(
  status: TaskBoardStatus,
  assignedHelperId: string | null,
  helperId: string,
): TaskBoardBucket | null {
  if (status === "diajukan" && (assignedHelperId === null || assignedHelperId === helperId)) {
    return assignedHelperId === null ? "tersedia" : "aktif";
  }

  if (
    assignedHelperId === helperId &&
    ["menunggu_persetujuan_koordinator", "dikonfirmasi", "dikerjakan", "menunggu_persetujuan_keluarga"].includes(status)
  ) {
    return "aktif";
  }

  if (assignedHelperId === helperId && ["selesai", "dibatalkan"].includes(status)) {
    return "riwayat";
  }

  return null;
}
