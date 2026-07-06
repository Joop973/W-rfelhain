import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { graviereSeite } from '../belohnung.js';
import { migriere } from '../save.js';
import { starteRun, starteKampf, beginneZug, platziere, loeseZugAuf } from '../kampf.js';

function platziereFest(run, kampf, wuerfelId, seitenIndex) {
  const w = run.arsenal.find((x) => x.id === wuerfelId);
  kampf.wuerfe[wuerfelId] = { seitenIndex, wert: w.seiten[seitenIndex].wert };
  return platziere(run, kampf, wuerfelId);
}

// Richtet einen Kampf her, in dem der erste Hand-Würfel eine Pflege-Gravur trägt.
function baueKampfMitGravur(seed, gravurId) {
  const rng = new RNG(seed);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);
  const traegerId = kampf.hand[0];
  graviereSeite(run.arsenal.find((w) => w.id === traegerId), gravurId, 0);
  return { rng, run, kampf, traegerId };
}

test('Ermutigung wirkt immer: +2 Gemüt auf den ängstlichsten Hand-Würfel', () => {
  const { rng, run, kampf, traegerId } = baueKampfMitGravur(700, 'ermutigungs_gravur');
  const zielId = kampf.hand.find((id) => id !== traegerId);
  run.arsenal.find((w) => w.id === zielId).gemuet = -1; // ängstlichster Kandidat
  platziereFest(run, kampf, traegerId, 0);
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.getroestet, 1);
  assert.equal(run.arsenal.find((w) => w.id === zielId).gemuet, 1); // −1 + 2
});

test('Ermutigung zählt für pflegeZahl (Labung), NICHT für troestenZahl (Frühling)', () => {
  const { rng, run, kampf, traegerId } = baueKampfMitGravur(701, 'ermutigungs_gravur');
  platziereFest(run, kampf, traegerId, 0);
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.getroestet, 1); // wirkt auch ohne Schreck (proaktiv)
  assert.equal(run.pflegeZahl, 1);
  assert.equal(run.troestenZahl, 0); // 01 §5: Ermutigung zählt nicht
});

test('Beruhigung verpufft ohne Schreck-Ziel (reaktiv, 02 §6.3)', () => {
  const { rng, run, kampf, traegerId } = baueKampfMitGravur(702, 'beruhigungs_gravur');
  // frisches Arsenal: alle Gemüt 0, kein Schreck → kein gültiges Ziel
  platziereFest(run, kampf, traegerId, 0);
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.getroestet, 0);
  assert.equal(run.troestenZahl, 0);
  assert.equal(run.pflegeZahl, 0);
});

test('Beruhigung greift bei Schreck > 0 und zählt für BEIDE Zähler', () => {
  const { rng, run, kampf, traegerId } = baueKampfMitGravur(703, 'beruhigungs_gravur');
  const zielId = kampf.hand.find((id) => id !== traegerId);
  run.arsenal.find((w) => w.id === zielId).gemuet = -3; // Schreck 3
  platziereFest(run, kampf, traegerId, 0);
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.getroestet, 1);
  assert.equal(run.arsenal.find((w) => w.id === zielId).gemuet, -1); // −3 + 2
  assert.equal(run.troestenZahl, 1);
  assert.equal(run.pflegeZahl, 1);
});

test('Pflege-Seiten brechen Vollmond (Nicht-Schaden-Seite, 02 §10.3)', () => {
  const { rng, run, kampf, traegerId } = baueKampfMitGravur(704, 'ermutigungs_gravur');
  // Höchstwert-Schaden-Seite + Ermutigung im selben Paket → kein Vollmond.
  const schadenId = kampf.hand.find(
    (id) => id !== traegerId && run.arsenal.find((w) => w.id === id).typ === 'schaden'
  );
  const schadenWuerfel = run.arsenal.find((w) => w.id === schadenId);
  const topIndex = schadenWuerfel.seiten.reduce((best, s, i, arr) => (s.wert > arr[best].wert ? i : best), 0);
  platziereFest(run, kampf, schadenId, topIndex);
  platziereFest(run, kampf, traegerId, 0);
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.combos.vollmond, false);
});

test('Save-Migration v2→v3 ergänzt pflegeZahl aus troestenZahl', () => {
  const rng = new RNG(705);
  const runState = { ...starteRun('eichwart', rng), troestenZahl: 4 };
  delete runState.pflegeZahl; // echter v2-Save kennt das Feld nicht
  const v2 = { saveVersion: 2, runState };
  const migriert = migriere(v2); // Kette läuft bis zur aktuellen SAVE_VERSION durch
  assert.ok(migriert.saveVersion >= 3);
  assert.equal(migriert.runState.pflegeZahl, 4);
  assert.equal(migriert.runState.troestenZahl, 4);
});
