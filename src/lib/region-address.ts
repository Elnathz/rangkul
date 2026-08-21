export type ParsedRegionAddress = {
  kelurahan: string;
  kecamatan: string;
  kotaKabupaten: string;
  provinsi: string;
  rt: string;
  rw: string;
  detail: string;
};

export function parseRegionAddress(value: string | null | undefined): ParsedRegionAddress {
  const raw = value?.trim() ?? "";
  const sections = raw.split("|").map((part) => part.trim()).filter(Boolean);
  const regionParts = (sections[0] ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  const rtRwMatch = (sections[1] ?? "").match(/RT\s*([0-9]+)\s*\/\s*RW\s*([0-9]+)/i);

  return {
    kelurahan: regionParts[0] ?? "",
    kecamatan: regionParts[1] ?? "",
    kotaKabupaten: regionParts[2] ?? "",
    provinsi: regionParts[3] ?? "",
    rt: rtRwMatch?.[1] ?? "",
    rw: rtRwMatch?.[2] ?? "",
    detail: sections[2] ?? (sections.length === 1 ? raw : ""),
  };
}

export function getRegionParts(value: string | null | undefined) {
  const parsed = parseRegionAddress(value);
  return [
    parsed.rt && parsed.rw ? `RT ${parsed.rt}/RW ${parsed.rw}` : "",
    parsed.kelurahan,
    parsed.kecamatan,
    parsed.kotaKabupaten,
    parsed.provinsi,
  ].filter(Boolean);
}
