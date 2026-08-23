import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { test } from "node:test";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const familyAEmail = process.env.RLS_TEST_FAMILY_A_EMAIL;
const familyAPassword = process.env.RLS_TEST_FAMILY_A_PASSWORD;
const familyBEmail = process.env.RLS_TEST_FAMILY_B_EMAIL;
const familyBPassword = process.env.RLS_TEST_FAMILY_B_PASSWORD;
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
