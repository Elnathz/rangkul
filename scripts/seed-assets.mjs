import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const supabaseUrlValue = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrlValue || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia untuk seed asset.");
}

let supabaseUrl;
try {
  supabaseUrl = new URL(supabaseUrlValue);
} catch {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL bukan URL yang valid.");
}

if (!['http:', 'https:'].includes(supabaseUrl.protocol)) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL wajib memakai HTTP atau HTTPS.");
}

const bucket = "dokumen";
const assets = [
  {
    source: "identitas-lansia-demo.png",
    objectPath: "demo/identitas_lansia/identitas-lansia-demo.png",
    contentType: "image/png",
  },
  {
    source: "hubungan-keluarga-demo.pdf",
    objectPath: "demo/hubungan_keluarga/hubungan-keluarga-demo.pdf",
    contentType: "application/pdf",
  },
  {
    source: "dokumen-koordinator-demo.pdf",
    objectPath: "demo/dokumen_koordinator/dokumen-koordinator-demo.pdf",
    contentType: "application/pdf",
  },
  {
    source: "bukti-kunjungan-demo.jpg",
    objectPath: "demo/foto_bukti/bukti-kunjungan-demo.jpg",
    contentType: "image/jpeg",
  },
];

const supabase = createClient(supabaseUrl.toString(), serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket);
if (bucketError || !bucketData) {
  throw new Error("Bucket private dokumen belum tersedia. Jalankan migration sebelum seed asset.");
}
if (bucketData.public) {
  throw new Error("Seed dibatalkan karena bucket dokumen terkonfigurasi public.");
}

for (const asset of assets) {
  const bytes = await readFile(join(process.cwd(), "scripts", "seed-assets", asset.source));
  const { error } = await supabase.storage.from(bucket).upload(asset.objectPath, bytes, {
    contentType: asset.contentType,
    cacheControl: "3600",
    upsert: true,
  });
  if (error) {
    throw new Error(`Gagal mengunggah asset demo ${asset.source}: ${error.message}`);
  }
}

console.log(`${assets.length} asset demo private berhasil disinkronkan.`);
