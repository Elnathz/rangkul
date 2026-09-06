export type CoordinatorRegionInput = {
  kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  rt: number;
  rw: number;
};

export type CoordinatorRegionUser = {
  full_name: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kabupaten_kota: string | null;
  provinsi: string | null;
  rt: number | null;
  rw: number | null;
};

export type CoordinatorCandidate = {
  id: string;
  wilayah: string;
  tingkat: "rt" | "rw";
  users: CoordinatorRegionUser | CoordinatorRegionUser[] | null;
};

function normalizeRegionPart(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("id-ID").replace(/\s+/g, " ") ?? "";
}

function getCoordinatorUser(candidate: CoordinatorCandidate) {
  return Array.isArray(candidate.users) ? candidate.users[0] ?? null : candidate.users;
}

function isSameAdministrativeArea(user: CoordinatorRegionUser, region: CoordinatorRegionInput) {
  return (
    normalizeRegionPart(user.kelurahan) === normalizeRegionPart(region.kelurahan) &&
    normalizeRegionPart(user.kecamatan) === normalizeRegionPart(region.kecamatan) &&
    normalizeRegionPart(user.kabupaten_kota) === normalizeRegionPart(region.kabupaten_kota) &&
    normalizeRegionPart(user.provinsi) === normalizeRegionPart(region.provinsi) &&
    user.rw === region.rw
  );
}

export function selectEligibleCoordinatorCandidates(
  candidates: CoordinatorCandidate[],
  region: CoordinatorRegionInput,
) {
  const scoped = candidates.filter((candidate) => {
    const user = getCoordinatorUser(candidate);
    return user ? isSameAdministrativeArea(user, region) : false;
  });

  const rtCandidates = scoped.filter((candidate) => {
    const user = getCoordinatorUser(candidate);
    return candidate.tingkat === "rt" && user?.rt === region.rt;
  });

  if (rtCandidates.length > 0) return rtCandidates;
  return scoped.filter((candidate) => candidate.tingkat === "rw");
}

export function validateSelectedCoordinator(
  candidates: CoordinatorCandidate[],
  region: CoordinatorRegionInput,
  coordinatorId: string,
) {
  return selectEligibleCoordinatorCandidates(candidates, region).some(
    (candidate) => candidate.id === coordinatorId,
  );
}

export function toPublicCoordinatorCandidate(candidate: CoordinatorCandidate) {
  const user = getCoordinatorUser(candidate);
  return {
    id: candidate.id,
    wilayah: candidate.wilayah,
    tingkat: candidate.tingkat,
    users: { full_name: user?.full_name ?? null },
  };
}
