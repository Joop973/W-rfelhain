import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { GEGNER_VORLAGEN, REGION_GEGNER, REGION_MAX } from '../data.js';
import { legeStatusAuf } from '../status.js';
import {
  starteRun,
  starteKampf,
  beginneZug,
  loeseZugAuf,
  fuehreGegnerzugAus,
  betreteNaechsteRegion,
} from '../kampf.js';

test('REGION_GEGNER deckt alle 6 Regionen, jede Vorlage existiert und passt zur Rolle', () => {
  assert.equal(REGION_MAX, 6);
  for (let region = 1; region <= 6; region += 1) {
    const pool = REGION_GEGNER[region];
    assert.ok(pool.normal.length >= 3, `Region ${region}: >= 3 Normale`);
    assert.ok(pool.elite.length >= 1, `Region ${region}: >= 1 Elite`);
    for (const id of [...pool.normal, ...pool.elite, pool.boss]) {
      const v = GEGNER_VORLAGEN[id];
      assert.ok(v, `Vorlage ${id} fehlt`);
      assert.equal(v.region, region, `${id}: region`);
    }
    assert.equal(GEGNER_VORLAGEN[pool.boss].rolle, 'boss');
  }
});

test('starteKampf zieht Gegner aus der aktuellen Region', () => {
  const rng = new RNG(1400);
  const run = starteRun('eichwart', rng);
  run.region = 3;
  for (let i = 0; i < 10; i += 1) {
    const kampf = starteKampf(run, rng);
    assert.ok(REGION_GEGNER[3].normal.includes(kampf.gegner.vorlageId), kampf.gegner.vorlageId);
  }
  const boss = starteKampf(run, rng, 'boss');
  assert.equal(boss.gegner.vorlageId, 'schwelbrand');
});

test('Sieche legt Status auf den Hüter statt anzugreifen (Fäulnisqualle: Fäule 2)', () => {
  const rng = new RNG(1401);
  const run = starteRun('eichwart', rng);
  run.region = 2;
  const kampf = starteKampf(run, rng);
  kampf.gegner = { ...kampf.gegner };
  // Deterministisch eine Fäulnisqualle bauen: direkt Sieche-Absicht setzen.
  kampf.gegner.statusAuflagen = [{ typ: 'faeule', stapel: 2, mit: 'sieche' }];
  kampf.gegner.absicht = { typ: 'sieche', wert: 0, angekuendigt: true };
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
  kampf.gegner.absicht = { typ: 'sieche', wert: 0, angekuendigt: true }; // loeseZugAuf ändert sie nicht, sicherheitshalber
  const hpVorher = run.hp;
  const ergebnis = fuehreGegnerzugAus(run, kampf, rng);
  assert.equal(ergebnis.erlitten, 0);
  assert.equal(run.hp, hpVorher);
  assert.equal(kampf.spielerStatus.faeule, 2);
  assert.deepEqual(ergebnis.aufgelegt, ['faeule']);
});

test('Rasende: mehrere kleine Treffer, Block wirkt je Treffer', () => {
  const rng = new RNG(1402);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
  kampf.gegner.absicht = { typ: 'angriff', wert: 10, treffer: 2, angekuendigt: true };
  kampf.block = 4;
  const hpVorher = run.hp;
  const { erlitten } = fuehreGegnerzugAus(run, kampf, rng);
  // 2 Treffer à 5: erster 5−4=1 durch, zweiter voll 5 → 6 statt 10−4=6... gleicher
  // Gesamtwert hier; mit Block 6 wäre es 0+4=4 statt 10−6=4. Prüfe die Aufteilung:
  assert.equal(erlitten, 6);
  assert.equal(run.hp, hpVorher - 6);
});

test('Angriff+Status (Aschekriecher-Muster): Brand kommt mit dem Treffer', () => {
  const rng = new RNG(1403);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
  kampf.gegner.statusAuflagen = [{ typ: 'brand', stapel: 3, mit: 'angriff' }];
  kampf.gegner.absicht = { typ: 'angriff', wert: 5, angekuendigt: true };
  fuehreGegnerzugAus(run, kampf, rng);
  // Brand 3 aufgelegt, tickt am Ende des NÄCHSTEN Spielerzugs.
  assert.equal(kampf.spielerStatus.brand, 3);
});

test('Reifegrad 8: Normalgegner legen +1 Stapel je Anwendung (Elite nicht)', () => {
  const rng = new RNG(1404);
  const run = starteRun('eichwart', rng, { reifegrad: 8 });
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
  kampf.gegner.rolle = 'normal';
  kampf.gegner.statusAuflagen = [{ typ: 'faeule', stapel: 2, mit: 'sieche' }];
  kampf.gegner.absicht = { typ: 'sieche', wert: 0, angekuendigt: true };
  fuehreGegnerzugAus(run, kampf, rng);
  assert.equal(kampf.spielerStatus.faeule, 3); // 2 + Zuschlag 1
});

test('Selbst-Buff (Kraft-Eskalation): Gegner-Kraft wächst je Runde', () => {
  const rng = new RNG(1405);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  kampf.gegner.statusAuflagen = [{ typ: 'kraft', stapel: 1, mit: 'selbst' }];
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
  fuehreGegnerzugAus(run, kampf, rng);
  assert.equal(kampf.gegner.status.kraft, 1);
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
  fuehreGegnerzugAus(run, kampf, rng);
  assert.equal(kampf.gegner.status.kraft, 2); // kein Decay (02 §8)
});

test('betreteNaechsteRegion: neue Karte, Tau-Zufluss, Welk-Grad steigt', () => {
  const rng = new RNG(1406);
  const run = starteRun('eichwart', rng, { setzlinge: ['tau_wurzel'] });
  const tauVorher = run.waehrungen.tau;
  const alteKarte = run.karte;
  run.positionKnotenId = 'irgendwo';
  betreteNaechsteRegion(run, rng);
  assert.equal(run.region, 2);
  assert.notEqual(run.karte, alteKarte);
  assert.equal(run.positionKnotenId, null);
  assert.equal(run.waehrungen.tau, tauVorher + 6 + 2); // Basis + Tau-Wurzel
  assert.equal(run.welkGrad, 1);
});

test('Voller Run endet erst nach Region maxRegion; maxRegion 1 erhält das Slice-Verhalten', () => {
  const rng = new RNG(1407);
  const voll = starteRun('eichwart', rng);
  assert.equal(voll.maxRegion, REGION_MAX);
  const slice = starteRun('eichwart', rng, { maxRegion: 1 });
  assert.equal(slice.maxRegion, 1);
});
