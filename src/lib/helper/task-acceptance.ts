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
