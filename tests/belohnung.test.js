import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { erstelleWuerfel, BLAUPAUSEN, GRAVUREN } from '../data.js';
import {
  verdieneKampfBelohnung,
  zieheBelohnungsoptionen,
  wendeBlaupauseAn,
  graviereSeite,
  BLAUPAUSE_PITY_N,
} from '../belohnung.js';
import { starteRun, starteKampf, beginneZug, platziere, loeseZugAuf } from '../kampf.js';

function leererRun() {
  return { waehrungen: { muenzen: 0, eicheln: 0, tau: 0 }, belohnungenOhneBlaupause: 0 };
}

test('Einkommen liegt im gesperrten Band (Münzen 14–16, Eicheln 8; Elite ×1,8)', () => {
  const rng = new RNG(11);
  for (let i = 0; i < 200; i += 1) {
    const run = leererRun();
    const { muenzen, eicheln } = verdieneKampfBelohnung(run, rng);
    assert.ok(muenzen >= 14 && muenzen <= 16, `muenzen ${muenzen}`);
    assert.equal(eicheln, 8);
    assert.equal(run.waehrungen.muenzen, muenzen);
  }
  const eliteRun = leererRun();
  const elite = verdieneKampfBelohnung(eliteRun, rng, { elite: true });
  assert.ok(elite.muenzen >= 25 && elite.muenzen <= 29, `elite ${elite.muenzen}`);
  assert.equal(elite.eicheln, 14); // 8 × 1,8 gerundet
});

test('Ziehung liefert immer 3 Optionen aus dem Slice-Katalog', () => {
  const rng = new RNG(12);
  for (let i = 0; i < 100; i += 1) {
    const run = leererRun();
    const optionen = zieheBelohnungsoptionen(run, rng);
    assert.equal(optionen.length, 3);
    for (const o of optionen) {
      assert.ok(['blaupause', 'gravur', 'muenzen'].includes(o.typ));
      if (o.typ === 'blaupause') assert.ok(BLAUPAUSEN[o.blaupauseId]);
      if (o.typ === 'gravur') assert.ok(GRAVUREN[o.gravurId]);
    }
  }
});

test('Blaupause-Pity: spätestens die N-te Ziehung ohne Blaupause bietet garantiert eine an', () => {
  const rng = new RNG(13);
  const run = leererRun();
  let ziehungenOhne = 0;
  for (let i = 0; i < 200; i += 1) {
    const optionen = zieheBelohnungsoptionen(run, rng);
    if (optionen.some((o) => o.typ === 'blaupause')) {
      ziehungenOhne = 0;
    } else {
      ziehungenOhne += 1;
      assert.ok(ziehungenOhne < BLAUPAUSE_PITY_N, `Pity verletzt nach ${ziehungenOhne} Ziehungen`);
    }
  }
});

test('Blaupause überschreibt alle 6 Seiten und setzt alle Stufen zurück', () => {
  const w = erstelleWuerfel('astschneide', 'test');
  w.stufen = [3, 2, 1, 0, 0, 0];
  w.gemuet = -2; // Gemüt haftet am Würfel, Blaupause rührt es nicht an

  wendeBlaupauseAn(w, 'eichenwall');

  assert.deepEqual(w.stufen, [0, 0, 0, 0, 0, 0]);
  assert.deepEqual(w.seiten.map((s) => s.wert), [3, 3, 4, 4, 5, 5]);
  assert.equal(w.typ, 'rinde');
  assert.equal(w.blaupause.id, 'eichenwall');
  assert.equal(w.gemuet, -2);
});

test('Gravur: gleiche Gravur stuft auf bis Cap 3, Typ-Wechsel resettet auf Stufe 1', () => {
  const w = erstelleWuerfel('astschneide', 'test');

  graviereSeite(w, 'wucht', 5); // Seite mit Wert 6 → Wucht St. 1
  assert.equal(w.stufen[5], 1);
  assert.deepEqual(w.seiten[5].effekt, [{ typ: 'schaden_mult', wert: 1.5 }]);

  graviereSeite(w, 'wucht', 5); // St. 2
  graviereSeite(w, 'wucht', 5); // St. 3
  graviereSeite(w, 'wucht', 5); // Cap — bleibt 3
  assert.equal(w.stufen[5], 3);
  assert.deepEqual(w.seiten[5].effekt, [{ typ: 'schaden_mult', wert: 2.5 }]);

  graviereSeite(w, 'schaerfe', 5); // Typ-Wechsel → Stufe 1 der neuen Gravur
  assert.equal(w.stufen[5], 1);
  assert.deepEqual(w.seiten[5].effekt, [{ typ: 'schaden', wert: 6 + 2 }]); // Basiswert 6 + Aufschlag 2
});

test('Wucht-gravierte Seite multipliziert den Schaden-Pool im echten Zug', () => {
  const rng = new RNG(14);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  beginneZug(run, kampf, rng);

  // Deterministisch: einen Schaden-Würfel als Basis (min. 1 garantiert in der
  // Hand, da nur 4 Rinde-Würfel existieren), ein anderer Hand-Würfel trägt Wucht ×2,0.
  const schadenId = kampf.hand.find((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden');
  const wuchtId = kampf.hand.find((id) => id !== schadenId);
  const schadenWuerfel = run.arsenal.find((w) => w.id === schadenId);
  const wuchtWuerfel = run.arsenal.find((w) => w.id === wuchtId);
  graviereSeite(wuchtWuerfel, 'wucht', 0);
  graviereSeite(wuchtWuerfel, 'wucht', 0); // Stufe 2 = ×2,0
  kampf.wuerfe[schadenId] = { seitenIndex: 3, wert: schadenWuerfel.seiten[3].wert };
  kampf.wuerfe[wuchtId] = { seitenIndex: 0, wert: 0 };

  platziere(run, kampf, schadenId); // links: Schaden-Basis
  platziere(run, kampf, wuchtId); // rechts: Wucht multipliziert den Pool

  const basis = schadenWuerfel.seiten[3].wert; // Astschneide Seite 4 = Wert 4
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, Math.floor((basis + 2) * 2.0)); // (+2 Passiv) × Wucht
});

test('Sieg liefert Einkommen + 3 Belohnungs-Optionen am Kampf-Objekt', () => {
  const rng = new RNG(15);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = 1;
  beginneZug(run, kampf, rng);
  kampf.hand
    .filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden')
    .slice(0, 3)
    .forEach((id) => platziere(run, kampf, id));
  loeseZugAuf(run, kampf, rng);

  assert.equal(kampf.phase, 'sieg');
  assert.ok(kampf.belohnung.einkommen.muenzen >= 14);
  assert.equal(kampf.belohnung.optionen.length, 3);
  assert.ok(run.waehrungen.muenzen >= 14);
});
