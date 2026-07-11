import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  leererStatus,
  tickeFaeule,
  tickeBrand,
  decayRundenende,
  legeStatusAuf,
  STATUS_CAP,
  RISS_DAUER,
} from '../status.js';

test('leererStatus hat alle Slots auf 0', () => {
  const s = leererStatus();
  for (const wert of Object.values(s)) assert.equal(wert, 0);
  assert.ok('faeule' in s && 'morsch' in s && 'kraft' in s && 'wetzung' in s);
});

test('Fäule tickt `Stapel` Schaden, dann −1', () => {
  const s = leererStatus();
  s.faeule = 3;
  assert.equal(tickeFaeule(s), 3);
  assert.equal(s.faeule, 2);
  assert.equal(tickeFaeule(s), 2);
  assert.equal(s.faeule, 1);
  assert.equal(tickeFaeule(s), 1);
  assert.equal(s.faeule, 0);
  assert.equal(tickeFaeule(s), 0); // erloschen
});

test('Brand tickt `Stapel` Schaden, dann −2', () => {
  const s = leererStatus();
  s.brand = 5;
  assert.equal(tickeBrand(s), 5);
  assert.equal(s.brand, 3);
  assert.equal(tickeBrand(s), 3);
  assert.equal(s.brand, 1);
  assert.equal(tickeBrand(s), 1);
  assert.equal(s.brand, 0); // −2 unter 0 gekappt
});

test('Rundenende-Decay senkt Morsch/Welk/Riss/Eigen-Status, nicht Kraft/Fäule/Brand', () => {
  const s = leererStatus();
  Object.assign(s, { morsch: 3, welk: 2, riss: 2, kraft: 3, faeule: 4, brand: 4, scharte: 2 });
  decayRundenende(s);
  assert.equal(s.morsch, 2);
  assert.equal(s.welk, 1);
  assert.equal(s.riss, 1);
  assert.equal(s.scharte, 1);
  assert.equal(s.kraft, 3); // kein Decay
  assert.equal(s.faeule, 4); // eigener Tick
  assert.equal(s.brand, 4);
});

test('legeStatusAuf ist additiv und hart am Cap (Morsch/Welk 4), Kraft ungedeckelt', () => {
  const s = leererStatus();
  legeStatusAuf(s, 'morsch', 2);
  legeStatusAuf(s, 'morsch', 3);
  assert.equal(s.morsch, STATUS_CAP.morsch); // 5 → Cap 4
  legeStatusAuf(s, 'kraft', 3);
  legeStatusAuf(s, 'kraft', 4);
  assert.equal(s.kraft, 7); // kein Cap
  legeStatusAuf(s, 'welk', 9);
  assert.equal(s.welk, 4);
});

test('Riss setzt die volle Dauer und wird durch Neubelegung erneuert, nicht gestapelt', () => {
  const s = leererStatus();
  legeStatusAuf(s, 'riss', 1);
  assert.equal(s.riss, RISS_DAUER);
  decayRundenende(s);
  assert.equal(s.riss, RISS_DAUER - 1);
  legeStatusAuf(s, 'riss', 1); // erneuert das Fenster
  assert.equal(s.riss, RISS_DAUER);
});
