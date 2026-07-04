import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { generiereKarte, pruefeKarte, REIHEN_GESAMT } from '../karte.js';

test('Generator hält alle Invarianten über viele Seeds', () => {
  for (let seed = 1; seed <= 500; seed += 1) {
    const karte = generiereKarte(new RNG(seed));
    const fehler = pruefeKarte(karte);
    assert.deepEqual(fehler, [], `Seed ${seed}: ${fehler.join(' · ')}`);
  }
});

test('Struktur: 8 Reihen, Wahl-Reihen 2-3 breit, Zusammenlauf am Ende', () => {
  const karte = generiereKarte(new RNG(42));
  assert.equal(karte.reihen.length, REIHEN_GESAMT);
  for (let i = 0; i < 6; i += 1) {
    assert.ok(karte.reihen[i].length >= 2 && karte.reihen[i].length <= 3, `Reihe ${i + 1}`);
  }
  assert.equal(karte.reihen[6].length, 1);
  assert.equal(karte.reihen[7].length, 1);
});

test('Kanten verbinden nur benachbarte Reihen und decken jede Zielspalte ab', () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const karte = generiereKarte(new RNG(seed * 7));
    for (let i = 0; i < karte.reihen.length - 1; i += 1) {
      const abgedeckt = new Set();
      for (const knoten of karte.reihen[i]) {
        for (const slot of knoten.kanten) {
          assert.ok(slot >= 0 && slot < karte.reihen[i + 1].length);
          abgedeckt.add(slot);
        }
      }
      assert.equal(abgedeckt.size, karte.reihen[i + 1].length, `Seed ${seed * 7}, Reihe ${i + 1}: Zielspalte ohne Eingang`);
    }
  }
});

test('Karten sind seed-deterministisch reproduzierbar', () => {
  const a = generiereKarte(new RNG(123));
  const b = generiereKarte(new RNG(123));
  assert.deepEqual(a, b);
});
