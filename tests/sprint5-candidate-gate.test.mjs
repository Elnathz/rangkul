import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("Sprint 6 matching default off dan route mutasinya berhenti sebelum side effect", () => {
  const flag = read("src/lib/features/sprint6-matching.ts");
  const booking = read("src/app/api/booking/task/route.ts");
  const marketplace = read("src/app/api/tasks/marketplace/route.ts");
  const accept = read("src/app/api/tasks/[id]/accept/route.ts");
  const envExample = read(".env.example");

  assert.match(flag, /return value === "true"/);
  assert.match(envExample, /^SPRINT6_MATCHING_ENABLED=false$/m);

  for (const route of [booking, marketplace, accept]) {
    assert.match(route, /isSprint6MatchingEnabled/);
    assert.match(route, /createApiError\(['"]not_found['"], ['"]Fitur belum tersedia['"], 404\)/);
  }

  assert.ok(
    booking.indexOf("!isSprint6MatchingEnabled()") < booking.indexOf("from('tasks')"),
    "booking harus menolak mode Sprint 6 sebelum insert task",
  );
  assert.ok(
    marketplace.indexOf("isSprint6MatchingEnabled") < marketplace.indexOf(".rpc(\"get_task_marketplace\""),
    "marketplace harus menolak request sebelum RPC",
  );
  assert.match(accept, /mode_penugasan !== "langsung" && !isSprint6MatchingEnabled\(\)/);
  assert.ok(accept.indexOf("!isSprint6MatchingEnabled()") < accept.indexOf("accept_quick_task"), "quick accept harus menolak request sebelum RPC");
});
