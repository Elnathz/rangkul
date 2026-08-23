import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const regionSource = await readFile('src/lib/region.ts', 'utf8');
const approvalSource = await readFile('src/app/api/helper/[id]/approve/route.ts', 'utf8');
const queueSource = await readFile('src/app/(koordinator)/koordinator/antrean/page.tsx', 'utf8');

test('approval Helper memakai kelurahan sebagai batas wilayah', () => {
  assert.match(regionSource, /export function extractKelurahan/);
  assert.match(approvalSource, /extractKelurahan\(koordProfile\.wilayah\)/);
  assert.match(approvalSource, /extractKelurahan\(helperProfile\.wilayah_domisili\)/);
  assert.match(approvalSource, /kelurahanKoord !== kelurahanHelper/);
});

test('antrean Koordinator memakai matcher wilayah yang sama dengan endpoint approval', () => {
  assert.match(queueSource, /extractKelurahan\(koordinator\.wilayah\)/);
  assert.match(queueSource, /extractKelurahan\(h\.wilayah_domisili\)/);
});
