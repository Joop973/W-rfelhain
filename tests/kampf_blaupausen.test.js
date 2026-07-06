import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { SLICE_BLAUPAUSEN, BLAUPAUSEN } from '../data.js';
import { wendeBlaupauseAn } from '../belohnung.js';
import { starteRun, starteKampf, beginneZug, platziere, loeseZugAuf } from '../kampf.js';

function platziereFest(run, kampf, wuerfelId, seitenIndex) {
  const w = run.arsenal.find((x) => x.id === wuerfelId);
  kampf.wuerfe[wuerfelId] = { seitenIndex, wert: w.seiten[seitenIndex].wert };
  return platziere(run, kampf, wuerfelId);
}

function ersterHandwuerfel(kampf) {
  return kampf.hand[0];
}

test('alle 16 Blaupausen sind im Slice freigegeben', () => {
  assert.equal(SLICE_BLAUPAUSEN.length, 16);
  for (const id of SLICE_BLAUPAUSEN) assert.ok(BLAUPAUSEN[id], `Blaupause ${id} fehlt im Katalog`);
});

test('jede Blaupause ist anwendbar und danach im Zug spielbar (kein Crash)', () => {
  for (const id of SLICE_BLAUPAUSEN) {
    const rng = new RNG(500 + id.length);
    const run = starteRun('eichwart', rng);
    const kampf = starteKampf(run, rng);
    kampf.gegner.hp = kampf.gegner.hpMax = 500;
    // Blaupause auf den ganzen Arsenal-Handbestand anwenden und alle Seiten durchspielen.
    const zielId = run.arsenal[0].id;
    wendeBlaupauseAn(run.arsenal.find((w) => w.id === zielId), id);
    beginneZug(run, kampf, rng);
    if (kampf.hand.includes(zielId)) {
      for (let s = 0; s < 6; s += 1) {
        beginneZug(run, kampf, rng);
        if (!kampf.hand.includes(zielId)) break;
        platziereFest(run, kampf, zielId, s);
        assert.doesNotThrow(() => loeseZugAuf(run, kampf, rng), `Blaupause ${id} Seite ${s}`);
      }
    }
  }
});

test('Labung (Quell) heilt Basis + 1 je Trösten, harter Cap +8', () => {
  const rng = new RNG(600);
  const run = starteRun('eichwart', rng);
  wendeBlaupauseAn(run.arsenal[0], 'quell'); // 6× Labung-Seiten Basis 3
  run.hp = 20; // Raum zum Heilen
  run.pflegeZahl = 2; // → +2 Bonus (Labung liest pflegeZahl, B5)
  const kampf = starteKampf(run, rng);
  beginneZug(run, kampf, rng);
  const id = run.arsenal[0].id;
  // sicherstellen, dass der Quell-Würfel in der Hand ist
  while (!kampf.hand.includes(id)) beginneZug(run, kampf, rng);
  platziereFest(run, kampf, id, 0);
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.geheilt, 3 + 2); // Basis 3 + 2 Trösten
  assert.equal(run.hp, 25);
});

test('Labung-Cap: Bonus deckelt bei +8 (max Heilung 11 bei Basis 3)', () => {
  const rng = new RNG(601);
  const run = starteRun('eichwart', rng);
  wendeBlaupauseAn(run.arsenal[0], 'quell');
  run.hp = 5;
  run.pflegeZahl = 20; // weit über Cap
  const kampf = starteKampf(run, rng);
  const id = run.arsenal[0].id;
  beginneZug(run, kampf, rng);
  while (!kampf.hand.includes(id)) beginneZug(run, kampf, rng);
  platziereFest(run, kampf, id, 0);
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.geheilt, 3 + 8); // Cap greift
});

test('Prägung (Hort) gibt feste Münzen je gespielter Seite', () => {
  const rng = new RNG(602);
  const run = starteRun('eichwart', rng);
  wendeBlaupauseAn(run.arsenal[0], 'hort'); // 6× Prägung-Seiten Wert 3
  const muenzenVorher = run.waehrungen.muenzen;
  const kampf = starteKampf(run, rng);
  const id = run.arsenal[0].id;
  beginneZug(run, kampf, rng);
  while (!kampf.hand.includes(id)) beginneZug(run, kampf, rng);
  platziereFest(run, kampf, id, 0);
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.gepraegt, 3);
  assert.equal(run.waehrungen.muenzen, muenzenVorher + 3);
});

test('Fläche (Weitwurf) trägt im Ein-Gegner-Slice zum Schaden-Pool bei', () => {
  const rng = new RNG(603);
  const run = starteRun('eichwart', rng);
  wendeBlaupauseAn(run.arsenal[0], 'weitwurf'); // Seiten 2,3,4,4,Fl(3),Fl(3)
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  const id = run.arsenal[0].id;
  beginneZug(run, kampf, rng);
  while (!kampf.hand.includes(id)) beginneZug(run, kampf, rng);
  platziereFest(run, kampf, id, 4); // eine Fläche-Seite (Wert 3)
  const pools = loeseZugAuf(run, kampf, rng);
  // Fläche zählt als Schaden-Seite: Wert 3 + Passiv 2 = 5
  assert.equal(pools.schaden, 5);
});

test('Wildwuchs-Riss-Seite legt Riss auf den Spieler selbst', () => {
  const rng = new RNG(604);
  const run = starteRun('eichwart', rng);
  wendeBlaupauseAn(run.arsenal[0], 'wildwuchs'); // Seite 5 = Riss
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  const id = run.arsenal[0].id;
  beginneZug(run, kampf, rng);
  while (!kampf.hand.includes(id)) beginneZug(run, kampf, rng);
  platziereFest(run, kampf, id, 5); // Riss-Seite
  loeseZugAuf(run, kampf, rng);
  assert.ok(kampf.spielerStatus.riss > 0, 'Spieler hat nach Wildwuchs-Riss-Seite Riss');
});
