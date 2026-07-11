import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SAVE_VERSION,
  SAVE_KEY,
  erstelleNeuenSave,
  validiereSave,
  migriere,
  pruefeMigrationsKette,
  SaveVersionsFehler,
  speichere,
  lade,
  loesche,
} from '../save.js';

// Minimaler LocalStorage-Ersatz für Node-headless-Tests.
function mockStorage() {
  const daten = new Map();
  return {
    getItem: (k) => (daten.has(k) ? daten.get(k) : null),
    setItem: (k, v) => daten.set(k, String(v)),
    removeItem: (k) => daten.delete(k),
  };
}

test('neuer Save ist schema-gültig: 12er-Arsenal, Übermut 0, Version aktuell', () => {
  const save = erstelleNeuenSave('eichwart', () => '2026-07-04T00:00:00Z');
  assert.equal(save.saveVersion, SAVE_VERSION);
  assert.equal(save.runState.arsenal.length, 12);
  assert.equal(save.runState.uebermut, 0);
  assert.deepEqual(validiereSave(save), []);
});

test('Speichern/Laden ist ein verlustfreier Round-Trip (fester Key)', () => {
  const storage = mockStorage();
  const save = erstelleNeuenSave('eichwart', () => '2026-07-04T00:00:00Z');
  save.runState.waehrungen.muenzen = 42;
  save.runState.arsenal[0].gemuet = -3; // kristallisierter Schreck haftet am Würfel

  speichere(save, storage, () => '2026-07-04T01:00:00Z');
  const geladen = lade(storage);

  assert.equal(geladen.zuletztGespeichertAm, '2026-07-04T01:00:00Z');
  assert.equal(geladen.runState.waehrungen.muenzen, 42);
  assert.equal(geladen.runState.arsenal[0].gemuet, -3);
  assert.equal(storage.getItem(SAVE_KEY) !== null, true);

  loesche(storage);
  assert.equal(lade(storage), null);
});

test('Validierung fängt Regel-Verstöße: Stufen-Cap, Übermut zwischen Knoten', () => {
  const save = erstelleNeuenSave();
  save.runState.arsenal[0].stufen[2] = 4; // über hartem Cap 3
  save.runState.uebermut = 2; // müsste zwischen Knoten 0 sein
  const fehler = validiereSave(save);
  assert.ok(fehler.some((f) => f.includes('stufen')));
  assert.ok(fehler.some((f) => f.includes('uebermut')));
  assert.throws(() => speichere(save, mockStorage()), /Save ungültig/);
});

test('Migration: zu hohe Version wird abgelehnt, nicht stillschweigend geladen', () => {
  assert.throws(() => migriere({ saveVersion: SAVE_VERSION + 1 }), SaveVersionsFehler);
  assert.throws(() => migriere({ kaputt: true }), SaveVersionsFehler); // ohne saveVersion
});

test('Migration: fehlende Kette wirft Fehler statt kaputtem Save', () => {
  // Version 0 existiert nie regulär — simuliert eine Lücke vor SAVE_VERSION.
  assert.throws(() => migriere({ saveVersion: 0 }), /Migrationslücke/);
});

test('Migration v1→v2 ergänzt Karten-Run-Felder ohne Datenverlust', () => {
  const v1 = {
    saveVersion: 1,
    erstelltAm: '2026-07-03T00:00:00Z',
    zuletztGespeichertAm: '2026-07-03T00:00:00Z',
    runState: {
      klasse: 'eichwart',
      arsenal: erstelleNeuenSave().runState.arsenal,
      region: 1,
      knotenIndex: 4,
      waehrungen: { muenzen: 33, eicheln: 12, tau: 2 },
      hainSegen: [],
      reifegrad: 0,
      uebermut: 0,
      aktiveFluechte: [],
      sauberSiegStreak: 0,
    },
    metaState: { jahresringe: 0, stammbaum: [], freigeschalteteKlassen: ['eichwart'] },
    einstellungen: { sprache: 'de', audioAn: true },
  };
  const v2 = migriere(v1);
  assert.equal(v2.saveVersion, SAVE_VERSION);
  assert.equal(v2.runState.waehrungen.muenzen, 33); // Bestand bleibt
  assert.equal(v2.runState.karte, null); // kein laufender Karten-Run
  assert.equal(v2.runState.entfernteWuerfel, 0);
  assert.deepEqual(validiereSave(v2), []);
});

test('Migrationskette ist lückenlos für alle Versionen bis SAVE_VERSION', () => {
  assert.deepEqual(pruefeMigrationsKette(), []); // Build-Fehler-Kriterium (09 §3.2)
});

test('aktuelle Version passiert die Migration unverändert', () => {
  const save = erstelleNeuenSave();
  assert.equal(migriere(save), save);
});
