import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { legeStatusAuf } from '../status.js';
import { schreck } from '../push.js';
import {
  starteRun,
  starteKampf,
  beginneZug,
  loeseZugAuf,
  fuehreGegnerzugAus,
  naechsteAbsicht,
  aktivePhase,
} from '../kampf.js';

function bossKampf(region, seed) {
  const rng = new RNG(seed);
  const run = starteRun('eichwart', rng);
  run.region = region;
  const kampf = starteKampf(run, rng, 'boss');
  return { rng, run, kampf };
}

// Leerer Spielerzug, um in den Gegnerzug zu kommen.
function leererZug(run, kampf, rng) {
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
}

test('Phasen wechseln Muster und Status-Auflagen mit der HP-Schwelle', () => {
  const { kampf } = bossKampf(4, 1500); // Auszehrer-Fürst
  assert.equal(aktivePhase(kampf.gegner).absichtsMuster, 'schlaeger_sieche');
  kampf.gegner.hp = Math.floor(kampf.gegner.hpMax * 0.4); // < 50 %
  const phase = aktivePhase(kampf.gegner);
  assert.equal(phase.absichtsMuster, 'sieche');
  assert.ok(phase.statusAuflagen.some((a) => a.typ === 'morsch')); // Morsch-Spitze in Phase 2
});

test('Ausbreitung (Boss 2): Fäule decayt nicht, solange der Boss > 30 % HP hat', () => {
  const { rng, run, kampf } = bossKampf(2, 1501);
  legeStatusAuf(kampf.spielerStatus, 'faeule', 3);
  const hpVorher = run.hp;
  beginneZug(run, kampf, rng); // Tick: 3 Schaden, aber KEIN Decay
  assert.equal(run.hp, hpVorher - 3);
  assert.equal(kampf.spielerStatus.faeule, 3); // eingefroren

  kampf.gegner.hp = Math.floor(kampf.gegner.hpMax * 0.2); // unter 30 %
  loeseZugAuf(run, kampf, rng);
  kampf.gegner.absicht = { typ: 'block', wert: 0, angekuendigt: true }; // keine neue Fäule dazwischen
  fuehreGegnerzugAus(run, kampf, rng);
  beginneZug(run, kampf, rng);
  assert.equal(kampf.spielerStatus.faeule, 2); // Decay greift wieder
});

test('Eskalation (Boss 2 Phase 2): Fäule-Auflage wächst mit den Boss-Zyklen', () => {
  const { rng, run, kampf } = bossKampf(2, 1502);
  kampf.gegner.hp = Math.floor(kampf.gegner.hpMax * 0.5); // Phase 2
  kampf.gegner.eskalation = 2; // als wären 2 Runden vergangen
  kampf.gegner.absicht = { typ: 'sieche', wert: 0, angekuendigt: true };
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
  kampf.gegner.absicht = { typ: 'sieche', wert: 0, angekuendigt: true };
  fuehreGegnerzugAus(run, kampf, rng);
  // Basis 3 + Eskalation 2 = 5 (kein Cap auf Fäule).
  assert.equal(kampf.spielerStatus.faeule, 5);
});

test('Auflodern (Boss 3): +1 Grundschaden je Rundenende, Brand auf ihm zündet doppelt', () => {
  const { rng, run, kampf } = bossKampf(3, 1503);
  const schadenVorher = kampf.gegner.schaden;
  legeStatusAuf(kampf.gegner.status, 'brand', 4);
  const bossHpVorher = kampf.gegner.hp;
  leererZug(run, kampf, rng);
  fuehreGegnerzugAus(run, kampf, rng);
  assert.equal(kampf.gegner.schaden, schadenVorher + 1); // Auflodern
  // Brand 4 × 2 = 8 Schaden am Boss (Gegengewicht).
  assert.equal(kampf.gegner.hp, bossHpVorher - 8);
});

test('Auszehrung (Boss 4): passives Welk 1 je Rundenbeginn, Cap 4', () => {
  const { rng, run, kampf } = bossKampf(4, 1504);
  for (let i = 0; i < 6; i += 1) {
    beginneZug(run, kampf, rng);
    if (kampf.phase !== 'zug') break;
    loeseZugAuf(run, kampf, rng);
    if (kampf.phase === 'gegnerzug') fuehreGegnerzugAus(run, kampf, rng);
  }
  // Jede Runde +1, Rundenende-Decay −1, aber der Rundenbeginn füllt nach → > 0, nie > 4.
  assert.ok(kampf.spielerStatus.welk >= 1);
  assert.ok(kampf.spielerStatus.welk <= 4);
});

test('Enge Pforte (Boss 5): Übermut > 0 ins Rundenende → +1 Schreck auf einen Würfel', () => {
  const { rng, run, kampf } = bossKampf(5, 1505);
  leererZug(run, kampf, rng);
  kampf.uebermut = 2; // Gier ins Rundenende getragen
  const schreckVorher = run.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0);
  fuehreGegnerzugAus(run, kampf, rng);
  const schreckNachher = run.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0);
  assert.equal(schreckNachher, schreckVorher + 1);
  assert.ok(kampf.engePforteZuletzt);

  // Ohne Übermut: keine Strafe (Anti-Brick — rein spieler-erzeugt).
  const zweiter = bossKampf(5, 1506);
  leererZug(zweiter.run, zweiter.kampf, zweiter.rng);
  zweiter.kampf.uebermut = 0;
  const vorher2 = zweiter.run.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0);
  fuehreGegnerzugAus(zweiter.run, zweiter.kampf, zweiter.rng);
  assert.equal(zweiter.run.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0), vorher2);
});

test('Saumhüter Phase 2 (waechter_mehrfach): Angriffe kommen als Doppel-Treffer', () => {
  const { kampf } = bossKampf(1, 1507);
  kampf.gegner.hp = Math.floor(kampf.gegner.hpMax * 0.4); // Phase 2
  kampf.gegner.zyklus = 1; // Angriffs-Zyklus (erste_geduld greift erst bei Zyklus 2)
  const absicht = naechsteAbsicht(kampf.gegner);
  assert.equal(absicht.typ, 'angriff');
  assert.equal(absicht.treffer, 2);
});
