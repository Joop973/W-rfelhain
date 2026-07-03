import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  effektiverWert,
  vollmondPruefwert,
  gleichklangMult,
  wendePoolModifikatoren,
  resolveZug,
} from '../engine.js';

test('Rechenbeispiel 02 §4.1 ergibt 34', () => {
  // Eichwart spielt eine Schaden-Seite, gefallener Wert 5, Wetzung 1 → effektiver Wert 6.
  const wert = effektiverWert(5, { wetzung: 1 });
  assert.equal(wert, 6);

  // +Eichwart-Passiv(2) +Kraft(1) = 9, ×Wucht(2,0) = 18.
  const basis = wert + 1 /* Kraft */ + 2 /* Passiv */;
  const nachMult = basis * 2.0 /* Wucht Stufe 2 */;
  assert.equal(nachMult, 18);

  // ×Gleichklang(1,5) ×Morsch(1,4) ×Welk(0,9), floor.
  const ergebnis = wendePoolModifikatoren(nachMult, {
    gleichklangAnzahl: 3,
    morschStapel: 2,
    welkStapel: 1,
  });
  assert.equal(ergebnis, 34);
});

test('Mult auf leeren Pool bleibt 0 (erlaubter Lernfehler, 02 §3)', () => {
  const paket = [
    { typ: 'schaden', effektiverWert: 0, hoechstwert: 6, kraft: 0, passiv: 0, mult: 2.0 },
  ];
  const { schaden } = resolveZug(paket);
  assert.equal(schaden, 0);
});

test('Gleichklang ist additiv gestaffelt und hart auf ×1,75 gedeckelt (03 §3)', () => {
  assert.equal(gleichklangMult(1), 1);
  assert.equal(gleichklangMult(2), 1.25);
  assert.equal(gleichklangMult(3), 1.5);
  assert.equal(gleichklangMult(4), 1.75);
  assert.equal(gleichklangMult(5), 1.75); // Cap, kein weiteres Wachstum
});

test('Echo kopiert Quellbeitrag hart gedeckelt, eigene Mults ignoriert (02 §10.2)', () => {
  const quelle = { typ: 'schaden', effektiverWert: 4, hoechstwert: 6, kraft: 1, passiv: 2 }; // Basis 7
  const echo = {
    typ: 'schaden',
    istEcho: true,
    effektiverWert: 4, // zählt für Gleichklang mit der Quelle
    hoechstwert: 6,
    kraft: 999,
    passiv: 999,
    mult: 999, // müssen ignoriert werden — Echo bringt nie mehr als 1× Quellbeitrag
  };

  // Quelle 7 + Echo (gedeckelt auf 7) = 14, ×Gleichklang(2 gleiche Werte, ×1,25) = 17,5 → floor 17.
  const { schaden } = resolveZug([quelle, echo]);
  assert.equal(schaden, 17);

  // Echo an Position 1 (nichts links) = 0.
  const { schaden: schadenPosition1 } = resolveZug([echo]);
  assert.equal(schadenPosition1, 0);
});

test('Vollmond: permanenter Klassen-Sockel (Schliff) speist Vollmond nicht, Wetzung-Status schon (02 §10.3)', () => {
  // Schliff +1 hebt den effektiven Wert auf den Höchstwert, der Vollmond-Prüfwert bleibt darunter.
  const mitSockelAllein = {
    typ: 'schaden',
    effektiverWert: effektiverWert(5, { klassenSockel: 1 }), // 6
    vollmondWert: vollmondPruefwert(5, {}), // 5 — ohne Sockel
    hoechstwert: 6,
  };
  const { schaden: ohneVollmond } = resolveZug([mitSockelAllein], { region: 1 });
  assert.equal(ohneVollmond, 6); // kein +8-Burst, da Vollmond-Bedingung nicht erfüllt

  // Wetzung-Status (temporär) hebt sowohl effektiven Wert als auch Vollmond-Prüfwert.
  const mitWetzung = {
    typ: 'schaden',
    effektiverWert: effektiverWert(5, { wetzung: 1 }), // 6
    vollmondWert: vollmondPruefwert(5, { wetzung: 1 }), // 6
    hoechstwert: 6,
  };
  const { schaden: mitVollmond } = resolveZug([mitWetzung], { region: 1 });
  assert.equal(mitVollmond, 14); // 6 + Vollmond-Burst Region 1 (8)
});

test('Scharte drückt den effektiven Wert nie unter 1 (02 §4.2)', () => {
  assert.equal(effektiverWert(1, { scharte: 3 }), 1);
  assert.equal(effektiverWert(2, { scharte: 5 }), 1);
  assert.equal(effektiverWert(4, { scharte: 1 }), 3); // normale Subtraktion bleibt unangetastet
});
