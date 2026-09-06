export function isFlexibleAssignmentEnabled(
  value: string | undefined = process.env.FLEXIBLE_ASSIGNMENT_ENABLED,
): boolean {
  return value === "true";
}
