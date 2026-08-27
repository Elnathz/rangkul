import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationSource = await readFile(
  'supabase/migrations/20260823173000_authenticated_task_marketplace_grants.sql',
  'utf8',
);

test('authenticated dapat membaca relasi lansia pada marketplace Helper', () => {
  assert.match(migrationSource, /GRANT SELECT ON public\.lansia_profiles TO authenticated;/);
});
