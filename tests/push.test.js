import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  schreck,
  gesperrteSeitenAnzahl,
  bestimmeGesperrteSeitenIndizes,
  beruhige,
  ermutige,
  fuehreRerollAus,
  rerollKosten,
  kristallisiereUebermut,
} from '../push.js';

function wuerfel(id, gemuet, werte = [1, 2, 3, 4, 5, 6]) {
  return { id, gemuet, seiten: werte.map((wert) => ({ wert, effekt: [] })) };
}

test('Kristallisation: Rest 0 lässt Würfel unverändert', () => {
  const gespielte = [wuerfel('a', 0), wuerfel('b', 2)];
  const ergebnis = kristallisiereUebermut(0, gespielte);
  assert.deepEqual(ergebnis.map((w) => w.gemuet), [0, 2]);
});

test('Kristallisation: positiver Rest wird 1:1 auf zuletzt gespielte Würfel verteilt', () => {
  const gespielte = [wuerfel('a', 0), wuerfel('b', 0)];
  const ergebnis = kristallisiereUebermut(5, gespielte);
  const summeAbzug = ergebnis.reduce((sum, w) => sum + (0 - w.gemuet), 0);
  assert.equal(summeAbzug, 5); // Gesamt-Abzug entspricht exakt dem Rest-Übermut (1:1)
  assert.deepEqual(ergebnis.map((w) => w.gemuet), [-3, -2]); // round-robin: 'a' bekommt den Überhang
});

test('Kristallisation nach Tischsturz: Sofort-Reset lässt keinen Rest übrig', () => {
  // Übermut so weit treiben, dass ein Reroll den Kipp-Punkt (6) überschreitet.
  let state = { uebermut: 6, rerollsDiesenZug: 6 };
  const { state: nachTischsturz, tischsturz } = fuehreRerollAus(state);
  assert.equal(tischsturz, true);
  assert.equal(nachTischsturz.uebermut, 0); // Sofort-Reset (02 §7)

  const gespielte = [wuerfel('a', 0)];
  const ergebnis = kristallisiereUebermut(nachTischsturz.uebermut, gespielte);
  assert.equal(ergebnis[0].gemuet, 0); // nichts zu kristallisieren — schließt sich aus (02 §7.3)
});

test('Freilauf/Klemme-Verrechnung beim Reroll (02 §7.5)', () => {
  // Klemme 1 ohne Freilauf: schon der erste Reroll kostet 1 Übermut.
  assert.equal(rerollKosten(1, { klemme: 1 }), 1);
  // Gleich hohe Freilauf/Klemme heben sich am ersten Reroll auf: übermut-frei.
  assert.equal(rerollKosten(1, { freilauf: 1, klemme: 1 }), 0);
  // Freilauf-Überschuss gibt einen echten zusätzlichen Gratis-Reroll.
  assert.equal(rerollKosten(2, { freilauf: 2, klemme: 1 }), 0);
});

test('Schreck-Sperr-Kurve "mittel": 0/1/2/3 gesperrte Seiten ab 0/3/6/9', () => {
  assert.equal(gesperrteSeitenAnzahl(schreck(0)), 0);
  assert.equal(gesperrteSeitenAnzahl(schreck(-2)), 0);
  assert.equal(gesperrteSeitenAnzahl(schreck(-3)), 1);
  assert.equal(gesperrteSeitenAnzahl(schreck(-5)), 1);
  assert.equal(gesperrteSeitenAnzahl(schreck(-6)), 2);
  assert.equal(gesperrteSeitenAnzahl(schreck(-9)), 3);
});

test('Sperrung trifft höchste freie Seiten, Tiebreak über niedrigeren Index', () => {
  const w = wuerfel('a', -3, [4, 6, 2, 6, 1, 3]); // Schreck 3 → 1 gesperrte Seite
  const gesperrt = bestimmeGesperrteSeitenIndizes(w);
  assert.deepEqual(gesperrt, [1]); // Wert 6 kommt zweimal vor (Index 1 und 3) — Index 1 gewinnt

  const w2 = { ...w, gemuet: -6 }; // Schreck 6 → 2 gesperrte Seiten
  assert.deepEqual(bestimmeGesperrteSeitenIndizes(w2), [1, 3]); // beide 6er, dann fertig
});

test('Beruhigung nur bei Schreck > 0, Ermutigung wirkt universell', () => {
  const ruhig = wuerfel('a', 0);
  const aengstlich = wuerfel('b', -1);

  const beruhigungRuhig = beruhige(ruhig);
  assert.equal(beruhigungRuhig.angewendet, false);
  assert.equal(beruhigungRuhig.wuerfel.gemuet, 0);

  const beruhigungAengstlich = beruhige(aengstlich);
  assert.equal(beruhigungAengstlich.angewendet, true);
  assert.equal(beruhigungAengstlich.wuerfel.gemuet, 1);

  const ermutigungRuhig = ermutige(ruhig);
  assert.equal(ermutigungRuhig.angewendet, true);
  assert.equal(ermutigungRuhig.wuerfel.gemuet, 2); // wirkt auch bei Gemüt ≥ 0

  const ermutigungAengstlich = ermutige(aengstlich);
  assert.equal(ermutigungAengstlich.angewendet, true);
  assert.equal(ermutigungAengstlich.wuerfel.gemuet, 1); // gleiche Wirkung wie Beruhigung
});
