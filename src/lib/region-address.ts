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

  if (sections.length === 1) {
    const commaParts = raw.split(",").map((part) => part.trim()).filter(Boolean);
    const rtRwIndex = commaParts.findIndex((part) => /(?:RT\s*\d+\s*\/\s*RW\s*\d+|RW\s*\d+)/i.test(part));
    if (rtRwIndex >= 0) {
      const rtRwPart = commaParts[rtRwIndex];
      const labelledParts = commaParts.slice(rtRwIndex + 1);
      const readLabel = (part: string, label: string) => part.replace(new RegExp(`^${label}\\s+`, "i"), "").trim();
      const legacyRtRwMatch = rtRwPart.match(/RT\s*([0-9]+)\s*\/\s*RW\s*([0-9]+)/i);
      const legacyRwMatch = rtRwPart.match(/RW\s*([0-9]+)/i);
      return {
        kelurahan: readLabel(labelledParts[0] ?? "", "(?:Kelurahan|Desa)"),
        kecamatan: readLabel(labelledParts[1] ?? "", "Kecamatan"),
        kotaKabupaten: labelledParts[2] ?? "",
        provinsi: labelledParts[3] ?? "",
        rt: legacyRtRwMatch?.[1] ?? "",
        rw: legacyRtRwMatch?.[2] ?? legacyRwMatch?.[1] ?? "",
        detail: commaParts.slice(0, rtRwIndex).join(", "),
      };
    }
  }

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
