export function extractKelurahan(wilayah: string | null | undefined) {
  const normalized = wilayah?.trim().toLocaleLowerCase('id-ID') ?? '';
  const labeled = normalized.match(/(?:^|[,|])\s*(?:kelurahan|desa)\s+([^,|]+)/i);
  const candidate = labeled?.[1] ?? normalized.split('|')[0]?.split(',')[0] ?? '';

  return candidate.replace(/\s+/g, ' ').trim();
}
