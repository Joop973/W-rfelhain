import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { VOLLMOND_BURST } from '../engine.js';
import {
  starteRun,
  starteKampf,
  beginneZug,
  rerolle,
  platziere,
  loeseZugAuf,
} from '../kampf.js';

// Legt einen Hand-Würfel deterministisch auf eine gewünschte Seite fest.
function platziereFest(run, kampf, wuerfelId, seitenIndex) {
  const w = run.arsenal.find((x) => x.id === wuerfelId);
  kampf.wuerfe[wuerfelId] = { seitenIndex, wert: w.seiten[seitenIndex].wert };
  return platziere(run, kampf, wuerfelId);
}

function schadenWuerfelIn(run, kampf) {
  return kampf.hand.filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden');
}

test('Wetzung hebt den effektiven Wert jeder Schaden-Seite (+Stapel), unter Höchstwert kein Vollmond', () => {
  const rng = new RNG(201);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  kampf.spielerStatus.wetzung = 1;
  beginneZug(run, kampf, rng);

  const id = schadenWuerfelIn(run, kampf)[0];
  platziereFest(run, kampf, id, 2); // Astschneide-Seite Wert 3 → 3+1 = 4 < Höchstwert 6
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, 3 + 1 + 2); // (Wert 3 + Wetzung 1) + Passiv 2, kein Burst
});

test('Scharte senkt den effektiven Wert, Untergrenze 1', () => {
  const rng = new RNG(202);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  kampf.spielerStatus.scharte = 3;
  beginneZug(run, kampf, rng);

  const id = schadenWuerfelIn(run, kampf)[0];
  platziereFest(run, kampf, id, 0); // Astschneide-Seite Wert 1 → max(1, 1−3) = 1
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, 1 + 2); // Untergrenze 1 + Passiv 2
});

test('Wetzung ermöglicht Vollmond (effektiver Wert ≥ Höchstwert)', () => {
  const rng = new RNG(203);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 400;
  kampf.spielerStatus.wetzung = 1;
  beginneZug(run, kampf, rng);

  // Eine einzelne Astschneide-Seite Wert 6 (= Höchstwert), Wetzung 1 → 7 ≥ 6 → Vollmond.
  const id = schadenWuerfelIn(run, kampf)[0];
  platziereFest(run, kampf, id, 5); // Wert 6
  const pools = loeseZugAuf(run, kampf, rng);
  // (6 + Wetzung 1) + Passiv 2 = 9, + Vollmond-Burst Region 1 (8) = 17
  assert.equal(pools.schaden, 9 + VOLLMOND_BURST[0]);
});

test('Scharte bricht Vollmond (drückt einen Würfel unter seinen Höchstwert)', () => {
  const rng = new RNG(204);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 400;
  kampf.spielerStatus.scharte = 1;
  beginneZug(run, kampf, rng);

  const id = schadenWuerfelIn(run, kampf)[0];
  platziereFest(run, kampf, id, 5); // Wert 6 → 5 < 6 → kein Vollmond
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, 5 + 2); // kein Burst
});

test('Freilauf gewährt zusätzliche übermut-freie Rerolls', () => {
  const rng = new RNG(205);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.spielerStatus.freilauf = 2; // Standard-Gratis (1) + 2 = 3 freie Rerolls
  beginneZug(run, kampf, rng);

  rerolle(run, kampf, rng); // 1
  rerolle(run, kampf, rng); // 2
  rerolle(run, kampf, rng); // 3 — alle frei
  assert.equal(kampf.uebermut, 0);
  rerolle(run, kampf, rng); // 4 — jetzt +1 Übermut
  assert.equal(kampf.uebermut, 1);
});

test('Klemme verteuert schon den ersten Reroll (Gratis-Reroll zuerst verteuert)', () => {
  const rng = new RNG(206);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.spielerStatus.klemme = 1;
  beginneZug(run, kampf, rng);

  rerolle(run, kampf, rng); // erster Reroll kostet mit Klemme 1 bereits 1 Übermut
  assert.equal(kampf.uebermut, 1);
});
