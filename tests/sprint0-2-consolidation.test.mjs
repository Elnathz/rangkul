import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { calculateRiwayatTrend } from '../src/lib/riwayat-rangkul.ts';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('canonical API and Riwayat Rangkul routes exist', async () => {
  const paths = [
    'src/app/api/lansia/[id]/riwayat/route.ts',
    'src/app/api/categories/route.ts',
    'src/app/api/helpers/apply/route.ts',
    'src/app/api/helpers/[id]/status/route.ts',
  ];

  await Promise.all(paths.map(async (path) => {
    await read(path);
  }));
});

test('Riwayat Rangkul raises attention after three consecutive declining visits', () => {
  const result = calculateRiwayatTrend([
    { energi: 5, mobilitas: 5, mood: 5, nafsu_makan: 5, kualitas_tidur: 5 },
    { energi: 4, mobilitas: 4, mood: 4, nafsu_makan: 4, kualitas_tidur: 4 },
    { energi: 3, mobilitas: 3, mood: 3, nafsu_makan: 3, kualitas_tidur: 3 },
  ]);

  assert.equal(result.perlu_perhatian, true);
  assert.equal(result.alasan, 'Rata-rata kondisi menurun dalam tiga kunjungan berturut-turut.');
});

test('Riwayat Rangkul does not raise attention for a short or non-declining history', () => {
  const result = calculateRiwayatTrend([
    { energi: 3, mobilitas: 3, mood: 3, nafsu_makan: 3, kualitas_tidur: 3 },
    { energi: 4, mobilitas: 4, mood: 4, nafsu_makan: 4, kualitas_tidur: 4 },
  ]);

  assert.equal(result.perlu_perhatian, false);
  assert.equal(result.alasan, null);
});

test('Helper catalog uses database categories and server radius response', async () => {
  const route = await read('src/app/api/helpers/route.ts');
  assert.match(route, /service_categories/);
  assert.match(route, /radius_layanan_km/);
  assert.match(route, /jarak_km/);
  assert.match(route, /jarak_min_km|jarak_max_km/);
});

test('booking rejects distance-based categories without a selected Helper', async () => {
  const route = await read('src/app/api/booking/task/route.ts');
  assert.match(route, /isDistanceBasedCategory/);
  assert.match(route, /isDistanceBasedCategory && !helper_id/);
  assert.match(route, /Pilih Helper agar jarak dan radius layanan dapat diverifikasi/);
});

test('Helper profile has one canonical verified photo field', async () => {
  const migration = await read('supabase/migrations/20260801121120_initial_schema.sql');
  const databaseTypes = await read('src/types/database.ts');
  assert.match(migration, /foto_wajah_url/);
  assert.doesNotMatch(migration, /helper_profiles[\s\S]{0,500}foto_url/);
  assert.doesNotMatch(databaseTypes.slice(databaseTypes.indexOf('helper_profiles'), databaseTypes.indexOf('helper_profiles') + 900), /foto_url/);
});

test('Helper photo change has a pending verification data path', async () => {
  const routes = await Promise.all([
    read('src/app/api/helpers/profile/photo/route.ts'),
    read('src/app/api/helpers/profile/photo/approve/route.ts'),
  ]);
  assert.match(routes[0], /pending/);
  assert.match(routes[1], /conditional|eq\(['"]status['"], ['"]pending['"]\)/);
});

test('seed uses local helper assets and does not hardcode helper UUIDs', async () => {
  const seed = await read('scripts/seed.mjs');
  const demoSeed = await read('supabase/seed.sql');
  assert.match(seed, /images[\\/]helpers/);
  assert.match(demoSeed, /gen_random_uuid|SELECT.*email|SELECT.*username/is);
  assert.doesNotMatch(seed, /f0000000-0000-0000-0000-000000000001/);
});

test('fresh migration memakai kategori leaf database-generated tanpa legacy table', async () => {
  const categoryMigration = await read('supabase/migrations/20260801121120_initial_schema.sql');
  const categories = [
    'Pengingat Obat',
    'Menemani Mengobrol (singkat)',
    'Bantuan Teknologi (singkat)',
    'Bersih-bersih Ringan',
    'Antar Obat (dekat, <=1 km)',
    'Menemani Mengobrol (lama)',
    'Bantuan Teknologi (lama)',
    'Antar Obat (sedang, 1-3 km)',
    'Belanja Kebutuhan (standar)',
    'Antar Obat (jauh, >3 km)',
    'Bersih-bersih Menyeluruh',
    'Kontrol Kesehatan (antar ke faskes)',
    'Belanja Kebutuhan (besar/jauh)',
  ];

  for (const category of categories) {
    assert.match(categoryMigration, new RegExp(category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(categoryMigration, /gen_random_uuid\(\)/);
  assert.doesNotMatch(categoryMigration, /'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/i);
  assert.match(categoryMigration, /CREATE TABLE public\.helper_service_categories/);
});
