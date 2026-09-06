import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/app/api/wallet/topup/route.ts", "utf8");

test("top-up Keluarga hanya memakai RPC atomik actor-scoped", () => {
  assert.match(route, /demoWalletTopupSchema/);
  assert.match(route, /\.rpc\("keluarga_self_topup_demo_wallet"/);
  assert.doesNotMatch(route, /createClient as createAdminClient/);
  assert.doesNotMatch(route, /\.from\("demo_wallets"\)\.(upsert|select|update)/);
  assert.doesNotMatch(route, /\.from\("demo_wallet_ledger"\)\.insert/);
  assert.doesNotMatch(route, /SUPABASE_SERVICE_ROLE_KEY/);
});
