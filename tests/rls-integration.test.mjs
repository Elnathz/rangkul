import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { test } from "node:test";

async function loadLocalEnv() {
  const content = await readFile(".env.local", "utf8").catch(() => "");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

await loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const familyAEmail = process.env.RLS_TEST_FAMILY_A_EMAIL || "ratnakeluarga@rangkul.id";
const familyAPassword = process.env.RLS_TEST_FAMILY_A_PASSWORD || "Rangkul2026*";
const familyBEmail = process.env.RLS_TEST_FAMILY_B_EMAIL || "mayakeluarga@rangkul.id";
const familyBPassword = process.env.RLS_TEST_FAMILY_B_PASSWORD || "Rangkul2026*";
const integrationEnabled = process.env.RUN_SUPABASE_INTEGRATION === "1";
const credentialsAvailable = [
  supabaseUrl,
  supabaseAnonKey,
  familyAEmail,
  familyAPassword,
  familyBEmail,
  familyBPassword,
].every(Boolean);

test(
  "RLS keluarga hanya mengembalikan lansia miliknya sendiri",
  { skip: !integrationEnabled || !credentialsAvailable },
  async () => {
    const familyA = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const familyB = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [{ error: familyAAuthError }, { error: familyBAuthError }] = await Promise.all([
      familyA.auth.signInWithPassword({ email: familyAEmail, password: familyAPassword }),
      familyB.auth.signInWithPassword({ email: familyBEmail, password: familyBPassword }),
    ]);

    assert.equal(familyAAuthError, null, familyAAuthError?.message);
    assert.equal(familyBAuthError, null, familyBAuthError?.message);

    const { data: ownLansia, error: ownError } = await familyA
      .from("lansia_profiles")
      .select("id")
      .limit(1);
    assert.equal(ownError, null, ownError?.message);
    assert.ok(ownLansia?.length, "Family A harus memiliki minimal satu lansia seed");

    const { data: familyBLansia, error: familyBError } = await familyB
      .from("lansia_profiles")
      .select("id")
      .limit(1);
    assert.equal(familyBError, null, familyBError?.message);
    assert.ok(familyBLansia?.length, "Family B harus memiliki minimal satu lansia seed");

    const { data: crossAccountRows, error: crossAccountError } = await familyA
      .from("lansia_profiles")
      .select("id")
      .eq("id", familyBLansia[0].id);
    assert.equal(crossAccountError, null, crossAccountError?.message);
    assert.deepEqual(crossAccountRows, []);
  },
);
