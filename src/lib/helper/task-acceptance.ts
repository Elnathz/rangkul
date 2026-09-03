export type TaskAcceptanceStatus =
  | "dikonfirmasi"
  | "menunggu_persetujuan_koordinator";

export type TaskAcceptanceInput = {
  helperStatus: string;
  tingkatKepercayaan: "probation" | "terpercaya";
  totalTugasSelesai: number;
  suspendReason: string | null;
  isHighRisk: boolean;
};

const URGENT_BOOKING_WINDOW_MS = 3 * 60 * 60 * 1000;

export function canHelperAcceptTask(
  taskStatus: string,
  assignedHelperId: string | null,
  helperId: string,
) {
  return (
    taskStatus === "diajukan" &&
    (assignedHelperId === null || assignedHelperId === helperId)
  );
}

export function getTaskAcceptanceStatus({
  helperStatus,
  tingkatKepercayaan,
  totalTugasSelesai,
  suspendReason,
  isHighRisk,
}: TaskAcceptanceInput): TaskAcceptanceStatus | null {
  if (helperStatus !== "verified") return null;

  const requiresCoordinatorApproval =
    tingkatKepercayaan === "probation" ||
    totalTugasSelesai === 0 ||
    Boolean(suspendReason) ||
    isHighRisk;

  return requiresCoordinatorApproval
    ? "menunggu_persetujuan_koordinator"
    : "dikonfirmasi";
}

export function isUrgentProbationBooking(
  tingkatKepercayaan: TaskAcceptanceInput["tingkatKepercayaan"],
  jadwalWaktu: string,
  now = new Date(),
) {
  if (tingkatKepercayaan !== "probation") return false;

  const scheduledAt = new Date(jadwalWaktu).getTime();
  if (!Number.isFinite(scheduledAt)) return false;

  return scheduledAt - now.getTime() < URGENT_BOOKING_WINDOW_MS;
}

export function getTaskApprovalReasons({
  tingkatKepercayaan,
  totalTugasSelesai,
  suspendReason,
  isHighRisk,
}: TaskAcceptanceInput) {
  const reasons: string[] = [];

  if (tingkatKepercayaan === "probation") reasons.push("Helper masih dalam masa probation");
  if (totalTugasSelesai === 0) reasons.push("Ini tugas pertama Helper");
  if (suspendReason) reasons.push("Helper pernah mendapat sanksi");
  if (isHighRisk) reasons.push("Kategori layanan berisiko tinggi");

  return reasons;
}
