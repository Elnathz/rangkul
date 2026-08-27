import { spawnSync } from "node:child_process";

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

process.exit(checkResult.status ?? 1);
