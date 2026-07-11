import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { erstelleWuerfel } from '../data.js';
import { schreck } from '../push.js';
import {
  schmiedePreis,
  kaufeGravur,
  erstelleMarktAngebot,
  kaufeWuerfel,
  entferneWuerfel,
  entfernenPreis,
  troesteDienst,
  zieheEvent,
  waehleEventOption,
  rasteLagerfeuer,
  SLICE_EVENTS,
} from '../knoten.js';

function testRun(muenzen = 200, eicheln = 100, tau = 10) {
  const arsenal = [];
  for (let i = 0; i < 8; i += 1) arsenal.push(erstelleWuerfel('astschneide', `a${i}`));
  return {
    arsenal,
    hp: 60,
    hpMax: 80,
    waehrungen: { muenzen, eicheln, tau },
    entfernteWuerfel: 0,
    troestenZahl: 0,
  };
}

test('Schmiede: Preise 40/60/80 je Stufe, Typ-Wechsel mit +50 % Aufpreis, Cap blockt', () => {
  const run = testRun();
  const w = run.arsenal[0];

  assert.deepEqual(schmiedePreis(w, 'wucht', 0), { zielStufe: 1, preis: 40, typWechsel: false });
  assert.ok(kaufeGravur(run, 'wucht', 'a0', 0).ok);
  assert.deepEqual(schmiedePreis(w, 'wucht', 0), { zielStufe: 2, preis: 60, typWechsel: false });
  assert.ok(kaufeGravur(run, 'wucht', 'a0', 0).ok);
  assert.ok(kaufeGravur(run, 'wucht', 'a0', 0).ok); // Stufe 3
  assert.equal(schmiedePreis(w, 'wucht', 0), null); // Cap erreicht
  assert.equal(kaufeGravur(run, 'wucht', 'a0', 0).grund, 'cap');

  // Typ-Wechsel auf gravierter Seite: Stufe-1-Preis der neuen Gravur ×1,5.
  const wechsel = schmiedePreis(w, 'schaerfe', 0);
  assert.deepEqual(wechsel, { zielStufe: 1, preis: Math.ceil(25 * 1.5), typWechsel: true });
  assert.equal(run.waehrungen.muenzen, 200 - 40 - 60 - 80);
});

test('Schmiede verweigert bei zu wenig Münzen', () => {
  const run = testRun(10);
  assert.equal(kaufeGravur(run, 'wucht', 'a0', 0).grund, 'muenzen');
  assert.equal(run.waehrungen.muenzen, 10); // nichts abgebucht
});

test('Markt: Kauf legt Würfel ins Arsenal, Entfernen-Preis eskaliert 25→40→55', () => {
  const rng = new RNG(7);
  const run = testRun();
  const angebot = erstelleMarktAngebot(rng);
  assert.ok(angebot.wuerfel.length >= 1 && angebot.wuerfel.length <= 2);
  for (const a of angebot.wuerfel) assert.ok(a.preisEicheln >= 35 && a.preisEicheln <= 45);

  const vorher = run.arsenal.length;
  assert.ok(kaufeWuerfel(run, 'borkenschild', 40).ok);
  assert.equal(run.arsenal.length, vorher + 1);

  assert.equal(entfernenPreis(run), 25);
  assert.ok(entferneWuerfel(run, 'a0').ok);
  assert.equal(entfernenPreis(run), 40);
  assert.ok(entferneWuerfel(run, 'a1').ok);
  assert.equal(entfernenPreis(run), 55);
  assert.equal(run.arsenal.length, vorher - 1);
});

test('Entfernen stoppt am Arsenal-Minimum (Handgröße bleibt füllbar)', () => {
  const run = testRun(999);
  run.arsenal = run.arsenal.slice(0, 5);
  assert.equal(entferneWuerfel(run, 'a0').grund, 'arsenal_minimum');
});

test('Trösten-Dienst: 3 Tau je +2 Gemüt, zählt auf die Trösten-Zahl', () => {
  const run = testRun(0, 0, 7);
  run.arsenal[0].gemuet = -3;
  assert.ok(troesteDienst(run, 'a0').ok);
  assert.equal(run.arsenal[0].gemuet, -1);
  assert.equal(run.waehrungen.tau, 4);
  assert.equal(run.troestenZahl, 1);
  troesteDienst(run, 'a0');
  assert.equal(troesteDienst(run, 'a0').grund, 'tau'); // 1 Tau übrig < 3
});

test('Event: Brunnen-Optionen wirken (Münzen+Gemüt-Abzug bzw. Tau+Trösten)', () => {
  const rng = new RNG(9);
  const event = zieheEvent(rng);
  assert.ok(SLICE_EVENTS.includes(event.id));

  const runA = testRun(0, 0, 0);
  const brunnen = { optionen: [{ effekt: { muenzen: 20, gemuet: { wuerfel: 1, wert: -1 } } }] };
  waehleEventOption(runA, brunnen, 0, rng);
  assert.equal(runA.waehrungen.muenzen, 20);
  assert.equal(runA.arsenal.reduce((s, w) => s + w.gemuet, 0), -1);

  const runB = testRun(0, 0, 0);
  runB.arsenal[3].gemuet = -4; // ängstlichster Würfel bekommt das Trösten
  waehleEventOption(runB, { optionen: [{ effekt: { tau: 4, troesten: 1 } }] }, 0, rng);
  assert.equal(runB.waehrungen.tau, 4);
  assert.equal(runB.arsenal[3].gemuet, -2);
  assert.equal(runB.troestenZahl, 1);
});

test('Lagerfeuer: genau eine Aktion — Heilen +30 %, Trösten +2, Vollenden −1 Atem (min 0)', () => {
  const run = testRun();
  rasteLagerfeuer(run, 'heilen');
  assert.equal(run.hp, 80); // 60 + 24 (30 % von 80), gedeckelt auf hpMax

  run.arsenal[0].gemuet = -1;
  rasteLagerfeuer(run, 'troesten', 'a0');
  assert.equal(schreck(run.arsenal[0].gemuet), 0);

  rasteLagerfeuer(run, 'vollenden', 'a1');
  assert.equal(run.arsenal[1].atem, 0);
  rasteLagerfeuer(run, 'vollenden', 'a1');
  assert.equal(run.arsenal[1].atem, 0); // Untergrenze
});
