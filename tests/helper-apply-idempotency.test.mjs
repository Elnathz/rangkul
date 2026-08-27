import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const routeSource = await readFile('src/app/api/helper/apply/route.ts', 'utf8');
const migrationSource = await readFile(
  'supabase/migrations/20260823172000_authenticated_helper_service_category_grants.sql',
  'utf8',
);

test('submit verifikasi helper dapat melanjutkan profil pending_verification', () => {
  assert.match(routeSource, /existing\.status === 'pending_verification'/);
  assert.match(routeSource, /\.update\(/);
  assert.doesNotMatch(
    routeSource,
    /existing\.status !== 'suspended' && \(existing\.status as string\) !== 'rejected'/,
  );
});

test('authenticated memiliki privilege untuk menyimpan kategori layanan helper', () => {
  assert.match(
    migrationSource,
    /GRANT SELECT, INSERT, UPDATE, DELETE ON public\.helper_service_categories TO authenticated;/,
  );
});
