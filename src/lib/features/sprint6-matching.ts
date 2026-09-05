export function isSprint6MatchingEnabled(
  value: string | undefined = process.env.SPRINT6_MATCHING_ENABLED,
): boolean {
  return value === "true";
}
