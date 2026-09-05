import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const npxExecutable = process.platform === "win32" ? "npx.cmd" : "npx";
const demoPhotoAssets = [
  "public/images/helpers/orang1.jpeg",
  "public/images/helpers/orang2.jpg",
  "public/images/helpers/orang3.jpg",
  "public/images/helpers/orang4.jpeg",
  "public/images/helpers/orang5.jpeg",
  "public/images/helpers/orang6.jpeg",
];

function runSupabase(args) {
  if (process.platform === "win32") {
    const command = [npxExecutable, "supabase", ...args].join(" ");

    return spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", command], {
      stdio: "inherit",
    });
  }

  return spawnSync(npxExecutable, ["supabase", ...args], {
    stdio: "inherit",
  });
}

const isLinkedTarget = process.argv.includes("--linked") || process.env.SUPABASE_SEED_TARGET === "linked";
const targetFlag = isLinkedTarget ? "--linked" : "--local";
const targetLabel = isLinkedTarget ? "Supabase Cloud yang sudah di-link" : "Supabase lokal";

if (isLinkedTarget) {
  const expectedProjectRef = process.env.SUPABASE_DEMO_PROJECT_REF;
  if (!expectedProjectRef) {
    console.error("SUPABASE_DEMO_PROJECT_REF wajib diisi untuk mencegah seed ke project yang salah.");
    process.exit(1);
  }

  const linkedProjectRef = readFileSync("supabase/.temp/project-ref", "utf8").trim();
  let urlProjectRef;
  try {
    const configuredUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
    if (!['http:', 'https:'].includes(configuredUrl.protocol)) throw new Error("invalid protocol");
    urlProjectRef = configuredUrl.hostname.split(".")[0];
  } catch {
    console.error("NEXT_PUBLIC_SUPABASE_URL wajib berupa URL HTTP(S) project demo.");
    process.exit(1);
  }

  if (linkedProjectRef !== expectedProjectRef || urlProjectRef !== expectedProjectRef) {
    console.error("Seed dibatalkan karena linked project, URL, dan SUPABASE_DEMO_PROJECT_REF tidak sama.");
    process.exit(1);
  }
  console.log(`Target cloud terverifikasi: ${expectedProjectRef}.`);
}

console.log(`Memeriksa marker data demo di ${targetLabel}...`);
console.log(`Seed foto demo memakai ${demoPhotoAssets.length} aset lokal dari public/images/helpers.`);
const checkResult = runSupabase(["db", "query", targetFlag, "--file", "supabase/seed.sql"]);

if (checkResult.error) {
  console.error(`Gagal menjalankan seed Supabase: ${checkResult.error.message}`);
  process.exit(1);
}

if (checkResult.status !== 0) {
  process.exit(checkResult.status ?? 1);
}

if (isLinkedTarget) {
  const assetResult = spawnSync(process.execPath, ["scripts/seed-assets.mjs"], {
    stdio: "inherit",
    env: process.env,
  });
  if (assetResult.error) {
    console.error(`Gagal menjalankan seed asset private: ${assetResult.error.message}`);
    process.exit(1);
  }
  if (assetResult.status !== 0) process.exit(assetResult.status ?? 1);
}

process.exit(0);
