import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { graviereSeite } from '../belohnung.js';
import { starteRun, starteKampf, beginneZug, platziere, loeseZugAuf } from '../kampf.js';

function platziereFest(run, kampf, wuerfelId, seitenIndex) {
  const w = run.arsenal.find((x) => x.id === wuerfelId);
  kampf.wuerfe[wuerfelId] = { seitenIndex, wert: w.seiten[seitenIndex].wert };
  return platziere(run, kampf, wuerfelId);
}

function schadenWuerfelIn(run, kampf) {
  return kampf.hand.filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden');
}

test('Echo kopiert den Beitrag der linken Schaden-Seite (Cap 1× Quelle)', () => {
  const rng = new RNG(301);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);

  const [quelleId, echoId] = schadenWuerfelIn(run, kampf);
  graviereSeite(run.arsenal.find((w) => w.id === echoId), 'echo_gravur', 0);
  platziereFest(run, kampf, quelleId, 3); // Wert 4 → Beitrag 4 + Passiv 2 = 6
  platziereFest(run, kampf, echoId, 0); // Echo → +6 (Kopie)
  const pools = loeseZugAuf(run, kampf, rng);
  // Die Echo-Seite erbt den effektiven Wert der Quelle (4) und bildet damit
  // ein Gleichklang-Paar mit ihr: (6 + 6) × 1,25 = 15 (02 §10.2).
  assert.equal(pools.combos.gleichklangAnzahl, 2);
  assert.equal(pools.schaden, Math.floor((6 + 6) * 1.25));
});

test('Echo an Position 1 (nichts links) trägt 0 bei', () => {
  const rng = new RNG(302);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);

  const echoId = schadenWuerfelIn(run, kampf)[0];
  graviereSeite(run.arsenal.find((w) => w.id === echoId), 'echo_gravur', 0);
  platziereFest(run, kampf, echoId, 0); // Echo ganz links
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, 0);
});

test('Gleichklang-Metadaten: zwei gleiche effektive Werte melden ×1,25', () => {
  const rng = new RNG(303);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);

  const [a, b] = schadenWuerfelIn(run, kampf);
  platziereFest(run, kampf, a, 3); // Wert 4
  platziereFest(run, kampf, b, 3); // Wert 4 → Gleichklang 2
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.combos.gleichklangAnzahl, 2);
  assert.equal(pools.combos.gleichklangMult, 1.25);
  // (4+2)+(4+2) = 12, ×1,25 = 15
  assert.equal(pools.schaden, Math.floor(12 * 1.25));
});

test('Vollmond-Metadaten: alle Seiten auf Höchstwert melden Burst', () => {
  const rng = new RNG(304);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 400;
  beginneZug(run, kampf, rng);

  const id = schadenWuerfelIn(run, kampf)[0];
  platziereFest(run, kampf, id, 5); // Wert 6 = Höchstwert
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.combos.vollmond, true);
  assert.equal(pools.combos.vollmondBurst, 8); // Region 1
});
