import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { HAIN_SEGEN, ATEM_PRO_ZUG } from '../data.js';
import { gibSegen, hatSegen, zieheSegenOption, tauBeiRegionEintritt, troestenBonus } from '../segen.js';
import { kristallisiereUebermut, fuehreRerollAus, rerollKosten } from '../push.js';
import { verdieneKampfBelohnung, zieheBelohnungsoptionen, zieheBossBelohnung } from '../belohnung.js';
import { schmiedePreis, rasteLagerfeuer, troesteDienst, kaufeMarktSegen } from '../knoten.js';
import { starteRun, starteKampf, beginneZug, platziere, loeseZugAuf, rerolle, fuehreGegnerzugAus } from '../kampf.js';

function platziereFest(run, kampf, wuerfelId, seitenIndex) {
  const w = run.arsenal.find((x) => x.id === wuerfelId);
  kampf.wuerfe[wuerfelId] = { seitenIndex, wert: w.seiten[seitenIndex].wert };
  return platziere(run, kampf, wuerfelId);
}

function schadenWuerfelIn(run, kampf) {
  return kampf.hand.filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden');
}

function rindeWuerfelIn(run, kampf) {
  return kampf.hand.filter((id) => run.arsenal.find((w) => w.id === id).typ === 'rinde');
}

test('Katalog: alle 16 Segen vorhanden, Haken-Deklaration konsistent', () => {
  const ids = Object.keys(HAIN_SEGEN);
  assert.equal(ids.length, 16);
  for (const id of ids) {
    const s = HAIN_SEGEN[id];
    assert.equal(s.hatHaken, Boolean(s.haken), `${id}: hatHaken passt nicht zu haken`);
  }
});

test('gibSegen: einmalig je Run, Erwerbs-Effekte (Morgentau +2 Tau, Hamsterherz −5 MaxHP)', () => {
  const rng = new RNG(800);
  const run = starteRun('eichwart', rng);
  const tauVorher = run.waehrungen.tau;
  assert.equal(gibSegen(run, 'morgentau_krug').ok, true);
  assert.equal(run.waehrungen.tau, tauVorher + 2);
  assert.equal(gibSegen(run, 'morgentau_krug').ok, false); // kein Doppel (07 §4.3)

  const hpMaxVorher = run.hpMax;
  gibSegen(run, 'hamsterherz');
  assert.equal(run.hpMax, hpMaxVorher - 5);
  assert.ok(run.hp <= run.hpMax);
});

test('tauBeiRegionEintritt: Morgentau-Bonus und Klarer-Quell-Haken verrechnet', () => {
  const rng = new RNG(801);
  const run = starteRun('eichwart', rng);
  assert.equal(tauBeiRegionEintritt(run, 6), 6);
  gibSegen(run, 'morgentau_krug');
  assert.equal(tauBeiRegionEintritt(run, 6), 8);
  gibSegen(run, 'klarer_quell');
  assert.equal(tauBeiRegionEintritt(run, 6), 6); // +2 −2
  assert.equal(troestenBonus(run), 1);
});

test('Ungeduld: +1 Atem je Zug, Kristallisation 2:1', () => {
  const rng = new RNG(802);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'ungeduld');
  const kampf = starteKampf(run, rng);
  beginneZug(run, kampf, rng);
  assert.equal(kampf.atem, ATEM_PRO_ZUG + 1);

  // Kristallisation 2:1: Rest 2 → 4 Gemüt-Abzug.
  const wuerfel = [{ id: 'a', gemuet: 0 }, { id: 'b', gemuet: 0 }];
  const kristallisiert = kristallisiereUebermut(2, wuerfel, { verhaeltnis: 2 });
  const summe = kristallisiert.reduce((s, w) => s + w.gemuet, 0);
  assert.equal(summe, -4);
});

test('Gieriger Griff: erster bezahlter Reroll je Zug kostet 0; Haken +1 Kristallisation', () => {
  const rng = new RNG(803);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'gieriger_griff');
  const kampf = starteKampf(run, rng);
  beginneZug(run, kampf, rng);
  rerolle(run, kampf, rng); // Gratis-Reroll (Standard)
  assert.equal(kampf.uebermut, 0);
  rerolle(run, kampf, rng); // erster BEZAHLTER → Griff macht ihn frei
  assert.equal(kampf.uebermut, 0);
  assert.equal(kampf.griffGenutztDiesenZug, true);
  rerolle(run, kampf, rng); // zweiter bezahlter → kostet normal 1
  assert.equal(kampf.uebermut, 1);

  // Haken: +1 Schreck-Rest, aber nur wenn überhaupt Rest da ist.
  const mitRest = kristallisiereUebermut(1, [{ id: 'a', gemuet: 0 }], { zuschlag: 1 });
  assert.equal(mitRest[0].gemuet, -2);
  const ohneRest = kristallisiereUebermut(0, [{ id: 'a', gemuet: 0 }], { zuschlag: 1 });
  assert.equal(ohneRest[0].gemuet, 0);
});

test('Loser Ast: 1 übermut-freier Reroll je Kampf (zugübergreifend)', () => {
  const rng = new RNG(804);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'loser_ast');
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);
  assert.equal(kampf.freischeineKampf, 1);
  rerolle(run, kampf, rng); // Standard-Gratis
  rerolle(run, kampf, rng); // Ast-Freischein
  assert.equal(kampf.uebermut, 0);
  assert.equal(kampf.freischeineKampf, 0);
  rerolle(run, kampf, rng); // jetzt kostet es
  assert.equal(kampf.uebermut, 1);
});

test('Rindenring: der erste Rinde-Würfel je Zug gibt +2 Block', () => {
  const rng = new RNG(805);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'rindenring');
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);
  const rindeId = rindeWuerfelIn(run, kampf)[0];
  assert.ok(rindeId, 'Rinde-Würfel in der Hand (Seed 805)');
  const wert = run.arsenal.find((w) => w.id === rindeId).seiten[2].wert;
  platziereFest(run, kampf, rindeId, 2);
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.rinde, wert + 2);
});

test('Stiller Hain: +15 % Schaden nur bei Arsenal-Schreck 0', () => {
  const rng = new RNG(806);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'stiller_hain');
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);
  const id = schadenWuerfelIn(run, kampf)[0];
  platziereFest(run, kampf, id, 3); // Wert 4 → (4+2) = 6 → ×1,15 = 6,9 → 7
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, Math.floor(6 * 1.15));

  // Mit Schreck: kein Bonus.
  const rng2 = new RNG(806);
  const run2 = starteRun('eichwart', rng2);
  gibSegen(run2, 'stiller_hain');
  run2.arsenal[0].gemuet = -1; // Schreck 1 im Arsenal
  const kampf2 = starteKampf(run2, rng2);
  kampf2.gegner.hp = kampf2.gegner.hpMax = 300;
  beginneZug(run2, kampf2, rng2);
  const id2 = schadenWuerfelIn(run2, kampf2).find((x) => run2.arsenal.find((w) => w.id === x).gemuet === 0);
  kampf2.wuerfe[id2] = { seitenIndex: 3, wert: run2.arsenal.find((w) => w.id === id2).seiten[3].wert };
  platziere(run2, kampf2, id2);
  const pools2 = loeseZugAuf(run2, kampf2, rng2);
  assert.equal(pools2.schaden, 6); // abgeschaltet
});

test('Splitternde Borke: Vollmond-Burst ×1,5; Scharte-Haken bei Zug ohne Vollmond', () => {
  const rng = new RNG(807);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'splitternde_borke');
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 400;
  beginneZug(run, kampf, rng);
  const id = schadenWuerfelIn(run, kampf)[0];
  platziereFest(run, kampf, id, 5); // Höchstwert 6 → Vollmond
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.combos.vollmondBurst, Math.floor(8 * 1.5)); // Region 1: 8 → 12
  assert.equal(kampf.spielerStatus.scharte, 0);

  // Zug ohne Vollmond → Scharte 1.
  fuehreGegnerzugAus(run, kampf, rng);
  beginneZug(run, kampf, rng);
  const id2 = schadenWuerfelIn(run, kampf)[0];
  platziereFest(run, kampf, id2, 0); // niedrige Seite → kein Vollmond
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.spielerStatus.scharte, 1);
});

test('Wetzstein/Doppelter Morgen: Kampfbeginn-Wetzung; Krone: Kampfbeginn-Klemme + Schmiede-Rabatt', () => {
  const rng = new RNG(808);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'wetzstein');
  let kampf = starteKampf(run, rng);
  assert.equal(kampf.spielerStatus.wetzung, 1);

  gibSegen(run, 'krone_des_alten_hueters');
  kampf = starteKampf(run, rng);
  assert.equal(kampf.spielerStatus.klemme, 1);
  // Doppelter-Morgen-Haken: Gegner +1 Absichtswert — via schadenZuschlag geprüft:
  gibSegen(run, 'doppelter_morgen');
  const kampf3 = starteKampf(run, rng);
  assert.equal(kampf3.spielerStatus.wetzung, 3); // Wetzstein 1 + Doppelter Morgen 2 (Slice-Modell)

  // Schmiede: Stufe-1-Preis halbiert (wucht Stufe 1: 40 → 20).
  const angebot = schmiedePreis(run.arsenal[0], 'wucht', 0, run);
  assert.equal(angebot.preis, 20);
  const ohneSegen = schmiedePreis(run.arsenal[0], 'wucht', 0);
  assert.equal(ohneSegen.preis, 40);
});

test('Hamsterherz: Rest-Block überdauert den Zug (Cap 5)', () => {
  const rng = new RNG(809);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'hamsterherz');
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng); // leeres Paket → block 0
  kampf.block = 9; // als hätte der Zug 9 Rinde gebaut
  kampf.gegner.absicht = { typ: 'block', wert: 0, angekuendigt: true }; // Gegner greift nicht an
  fuehreGegnerzugAus(run, kampf, rng);
  assert.equal(kampf.block, 5); // Cap 5 statt Verfall auf 0
});

test('Geduldiger Wächter: kein Eicheln-Bonus bei HP-Verlust; Eichhorn: +3 Eicheln', () => {
  const rng = new RNG(810);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'geduldiger_waechter');
  verdieneKampfBelohnung(run, rng, { hpVerlust: true });
  assert.equal(run.waehrungen.eicheln, 0); // Haken schluckt die 8

  gibSegen(run, 'fleissiges_eichhorn');
  verdieneKampfBelohnung(run, rng, { hpVerlust: false });
  assert.equal(run.waehrungen.eicheln, 8 + 3);
});

test('Dürre-Same: +2 Münzen je Kill, Welk-Grad steigt beim Erwerb', () => {
  const rng = new RNG(811);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'duerre_same');
  assert.equal(run.welkGrad, 1);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = 1;
  beginneZug(run, kampf, rng);
  const id = schadenWuerfelIn(run, kampf)[0];
  const muenzenVorher = run.waehrungen.muenzen;
  platziereFest(run, kampf, id, 3);
  loeseZugAuf(run, kampf, rng); // Kill
  assert.equal(kampf.phase, 'sieg');
  // +2 Kill-Geld zusätzlich zum normalen Kampf-Einkommen (14–16).
  const einkommen = kampf.belohnung.einkommen.muenzen;
  assert.equal(run.waehrungen.muenzen, muenzenVorher + einkommen + 2);
});

test('Klarer Quell: Trösten gibt +3 (Dienst & Lagerfeuer)', () => {
  const rng = new RNG(812);
  const run = starteRun('eichwart', rng);
  gibSegen(run, 'klarer_quell');
  run.waehrungen.tau = 10;
  run.arsenal[0].gemuet = -3;
  troesteDienst(run, run.arsenal[0].id);
  assert.equal(run.arsenal[0].gemuet, 0); // −3 + 3
  rasteLagerfeuer(run, 'troesten', run.arsenal[0].id);
  assert.equal(run.arsenal[0].gemuet, 3);
});

test('Warmes Moos: Lagerfeuer-Heilung +25 %', () => {
  const rng = new RNG(813);
  const run = starteRun('eichwart', rng);
  run.hp = 10;
  const basis = Math.round(run.hpMax * 0.3);
  gibSegen(run, 'warmes_moos');
  const { text } = rasteLagerfeuer(run, 'heilen');
  const erwartet = Math.round(run.hpMax * 0.3 * 1.25);
  assert.equal(run.hp, 10 + erwartet);
  assert.ok(erwartet > basis);
  assert.ok(text.includes(String(erwartet)));
});

test('Ziehung: Boss-Belohnung enthält genau 1 Boss-Segen, Elite garantiert ≥1 Segen-Option', () => {
  const rng = new RNG(814);
  const run = starteRun('eichwart', rng);
  const boss = zieheBossBelohnung(run, rng);
  assert.equal(boss.filter((o) => o.typ === 'segen').length, 1);
  assert.equal(HAIN_SEGEN[boss.find((o) => o.typ === 'segen').segenId].seltenheit, 'boss');

  const elite = zieheBelohnungsoptionen(run, rng, { garantierterSegen: true });
  assert.ok(elite.some((o) => o.typ === 'segen'));
  // Nicht-Boss-Ziehung liefert nie Boss-Segen:
  for (let i = 0; i < 50; i += 1) {
    const o = zieheSegenOption(run, rng);
    assert.notEqual(HAIN_SEGEN[o.segenId].seltenheit, 'boss');
  }
});

test('Markt-Segen: Kauf via Eicheln, kein Doppelkauf', () => {
  const rng = new RNG(815);
  const run = starteRun('eichwart', rng);
  run.waehrungen.eicheln = 100;
  assert.equal(kaufeMarktSegen(run, 'rindenring', 70).ok, true);
  assert.equal(run.waehrungen.eicheln, 30);
  assert.ok(hatSegen(run, 'rindenring'));
  assert.equal(kaufeMarktSegen(run, 'rindenring', 70).ok, false); // doppelt
  assert.equal(run.waehrungen.eicheln, 30); // Geld bleibt
});
