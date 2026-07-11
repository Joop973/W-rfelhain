import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { eingehendMult } from '../engine.js';
import { legeStatusAuf } from '../status.js';
import { starteRun, starteKampf, beginneZug, loeseZugAuf, fuehreGegnerzugAus } from '../kampf.js';

test('eingehendMult: +20 %/Stapel, Cap 4 — parallel zur Pool-Regel (05 §2.1 Option A)', () => {
  assert.equal(eingehendMult(0), 1);
  assert.equal(eingehendMult(1), 1.2);
  assert.equal(eingehendMult(4), 1.8);
  assert.equal(eingehendMult(9), 1.8); // Cap
});

test('Gegner-Morsch auf dem Hüter verstärkt eingehenden Angriff vor Block', () => {
  const rng = new RNG(900);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng); // leeres Paket → in den Gegnerzug

  legeStatusAuf(kampf.spielerStatus, 'morsch', 2); // Gegner hat Morsch 2 aufgedrückt
  kampf.gegner.absicht = { typ: 'angriff', wert: 10, angekuendigt: true };
  kampf.block = 3;
  const hpVorher = run.hp;
  const { erlitten } = fuehreGegnerzugAus(run, kampf, rng);
  // floor(10 × 1,4) = 14, −3 Block = 11.
  assert.equal(erlitten, 11);
  assert.equal(run.hp, hpVorher - 11);
});

test('Hüter-Morsch decayt am Rundenende (kein Dauerschaden-Schneeball)', () => {
  const rng = new RNG(901);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
  legeStatusAuf(kampf.spielerStatus, 'morsch', 2);
  kampf.gegner.absicht = { typ: 'block', wert: 0, angekuendigt: true }; // kein Angriff
  fuehreGegnerzugAus(run, kampf, rng);
  assert.equal(kampf.spielerStatus.morsch, 1); // −1 durch decayRundenende
});
