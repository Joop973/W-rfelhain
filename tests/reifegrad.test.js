import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { reifegradMods, REIFEGRAD_MAX, REIFEGRAD_WERTE } from '../reifegrad.js';
import { leeresMeta, verdieneJahresringe } from '../meta.js';
import { schmiedePreis, rasteLagerfeuer } from '../knoten.js';
import { schreck } from '../push.js';
import { starteRun, starteKampf } from '../kampf.js';
import { aktiveFluechte } from '../fluch.js';

test('reifegradMods sind kumulativ und deckeln bei 10', () => {
  const s0 = reifegradMods(0);
  assert.equal(s0.eliteHpMult, 1);
  assert.equal(s0.heilungMult, 1);
  const s3 = reifegradMods(3);
  assert.equal(s3.eliteHpMult, 1 + REIFEGRAD_WERTE.eliteHp); // Stufe 1 enthalten
  assert.equal(s3.eliteBossSchadenMult, 1.1); // nachgeeicht: nur Elite/Boss
  assert.equal(s3.schmiedePreisMult, 1); // Stufe 4 noch nicht
  const s10 = reifegradMods(99); // über Cap
  assert.equal(s10.gegnerHpMult, 1 + REIFEGRAD_WERTE.gegnerHp); // nachgeeichter Wert
  assert.equal(s10.tischsturzZuschlag, 2);
});

test('Stufe 2: Start-Schreck · Stufe 9: echter Start-Fluch statt Schreck-Näherung (E6)', () => {
  const rng = new RNG(1100);
  const r0 = starteRun('eichwart', rng, { reifegrad: 0 });
  assert.equal(r0.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0), 0);
  assert.equal(aktiveFluechte(r0).length, 0);
  const r2 = starteRun('eichwart', rng, { reifegrad: 2 });
  assert.equal(r2.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0), REIFEGRAD_WERTE.startSchreck);
  const r9 = starteRun('eichwart', rng, { reifegrad: 9 });
  assert.equal(r9.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0), REIFEGRAD_WERTE.startSchreck); // nur Stufe 2
  assert.equal(aktiveFluechte(r9).length, 1); // Stufe 9: aufgedrückte Fluch-Seite
  assert.equal(aktiveFluechte(r9)[0].fluchId, 'fluch_seite');
});

test('Stufe 1/5/10: Gegner-HP-Mults nach Rolle', () => {
  const messe = (reifegrad, typ) => {
    // Mittelwert über Seeds, um die HP-Spanne herauszumitteln.
    let summe = 0;
    for (let i = 0; i < 200; i += 1) {
      const rng = new RNG(2000 + i);
      const run = starteRun('eichwart', rng, { reifegrad });
      summe += starteKampf(run, rng, typ).gegner.hpMax;
    }
    return summe / 200;
  };
  assert.ok(messe(1, 'elite') > messe(0, 'elite') * 1.05, 'Elite-HP steigen ab Stufe 1');
  assert.ok(messe(5, 'boss') > messe(4, 'boss') * (1 + REIFEGRAD_WERTE.bossHp / 2), 'Boss-HP steigen ab Stufe 5');
  assert.ok(messe(10, 'kampf') > messe(9, 'kampf') * (1 + REIFEGRAD_WERTE.gegnerHp / 2), 'Normal-HP steigen ab Stufe 10');
});

test('Stufe 4: Schmiede-Preise +20 % (Wucht Stufe 1: 40 → 48)', () => {
  const rng = new RNG(1101);
  const run = starteRun('eichwart', rng, { reifegrad: 4 });
  const angebot = schmiedePreis(run.arsenal[0], 'wucht', 0, run);
  assert.equal(angebot.preis, Math.ceil(40 * 1.2));
});

test('Stufe 6: Lagerfeuer-Heilung reduziert (nachgeeichter Malus)', () => {
  const rng = new RNG(1102);
  const run = starteRun('eichwart', rng, { reifegrad: 6 });
  run.hp = 10;
  rasteLagerfeuer(run, 'heilen');
  assert.equal(run.hp, 10 + Math.round(run.hpMax * 0.3 * (1 - REIFEGRAD_WERTE.heilung)));
});

test('Ascension-Kette: Sieg auf Stufe N schaltet N+1 frei (Cap 10)', () => {
  const meta = leeresMeta();
  verdieneJahresringe(meta, { sieg: true, kaempfe: 5, reifegrad: 0 });
  assert.equal(meta.maxReifegrad, 1);
  verdieneJahresringe(meta, { sieg: false, kaempfe: 5, reifegrad: 1 });
  assert.equal(meta.maxReifegrad, 1); // Niederlage schaltet nichts frei
  verdieneJahresringe(meta, { sieg: true, kaempfe: 5, reifegrad: REIFEGRAD_MAX });
  assert.equal(meta.maxReifegrad, REIFEGRAD_MAX); // Cap
});
