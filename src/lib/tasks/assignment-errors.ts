export type AssignmentConflictCode =
  | "helper_not_verified"
  | "helper_not_available"
  | "trust_tier_not_allowed"
  | "category_not_served"
  | "outside_radius"
  | "location_incomplete"
  | "schedule_conflict"
  | "task_not_available"
  | "mode_not_allowed"
  | "task_already_assigned"
  | "task_expired"
  | "race_condition_lost"
  | "application_not_pending"
  | "duplicate_application"
  | "task_not_found"
  | "application_not_found"
  | "helper_no_longer_eligible";

const HTTP_STATUS_BY_CODE: Record<AssignmentConflictCode, number> = {
  helper_not_verified: 403,
  helper_not_available: 403,
  trust_tier_not_allowed: 403,
  category_not_served: 403,
  outside_radius: 403,
  location_incomplete: 403,
  schedule_conflict: 409,
  task_not_available: 409,
  mode_not_allowed: 403,
  task_already_assigned: 409,
  task_expired: 409,
  race_condition_lost: 409,
  application_not_pending: 409,
  duplicate_application: 409,
  task_not_found: 404,
  application_not_found: 404,
  helper_no_longer_eligible: 409,
};

const CONFLICT_CODES = new Set<AssignmentConflictCode>([
  "schedule_conflict",
  "task_not_available",
  "task_already_assigned",
  "task_expired",
  "race_condition_lost",
  "application_not_pending",
  "duplicate_application",
  "helper_no_longer_eligible",
]);

export function getAssignmentHttpStatus(code: AssignmentConflictCode): number {
  return HTTP_STATUS_BY_CODE[code] ?? 409;
}

export function isAssignmentConflict(code: string): code is AssignmentConflictCode {
  return code in HTTP_STATUS_BY_CODE;
}

export function isConflictStatus(code: AssignmentConflictCode): boolean {
  return CONFLICT_CODES.has(code);
}
