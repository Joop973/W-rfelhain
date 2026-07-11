// E6-Restposten: Doppelschlag/Bruchstelle-Gravuren + Fluch-System (07 §5.4).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { GRAVUREN, SLICE_GRAVUREN, EVENTS } from '../data.js';
import { graviereSeite, wendeBlaupauseAn } from '../belohnung.js';
import { FLUECHE, drueckeFluchAuf, aktiveFluechte } from '../fluch.js';
import { starteRun, starteKampf, beginneZug, platziere, loeseZugAuf, fuehreGegnerzugAus } from '../kampf.js';
import { RISS_DAUER } from '../status.js';
import { schmiedePreis, entferneWuerfel, waehleEventOption, SLICE_EVENTS } from '../knoten.js';

function platziereFest(run, kampf, wuerfelId, seitenIndex) {
  const w = run.arsenal.find((x) => x.id === wuerfelId);
  kampf.wuerfe[wuerfelId] = { seitenIndex, wert: w.seiten[seitenIndex].wert };
  return platziere(run, kampf, wuerfelId);
}

// Kampf-Aufbau mit fest verdrahtetem Gegner (viel HP, Angriff — kein Block-Halbierer).
function baueKampf(seed = 42) {
  const rng = new RNG(seed);
  const run = starteRun('eichwart', rng); // Passiv: +2 je Schaden-Seite
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 500;
  kampf.gegner.absicht = { typ: 'angriff', wert: 5 };
  beginneZug(run, kampf, rng);
  return { rng, run, kampf };
}

test('Doppelschlag/Bruchstelle sind im Schmiede-Slice freigegeben', () => {
  assert.ok(SLICE_GRAVUREN.includes('doppelschlag'));
  assert.ok(SLICE_GRAVUREN.includes('bruchstelle'));
  assert.equal(GRAVUREN.bruchstelle.ueberschreibtZu, 'gegner_riss'); // getrennt vom Eigen-Riss
});

test('Doppelschlag: zwei volle Schaden-Seiten (beide Passiv, Gleichklang) für eine Atemzahlung', () => {
  const { rng, run, kampf } = baueKampf(43);
  const id = kampf.hand[0];
  const w = run.arsenal.find((x) => x.id === id);
  graviereSeite(w, 'doppelschlag', 0); // Stufe 1: Teilwerte [1, 1]
  assert.deepEqual(w.seiten[0].effekt, [{ typ: 'schaden_doppel', wert: [1, 1] }]);

  const atemVorher = kampf.atem;
  platziereFest(run, kampf, id, 0);
  assert.equal(atemVorher - kampf.atem, w.atem); // EINE Atemzahlung
  const hpVorher = kampf.gegner.hp;
  const pools = loeseZugAuf(run, kampf, rng);
  // Zwei Teil-Seiten à (1 + Passiv 2) = 6 Pool, Gleichklang 2× ⇒ ×1,25 ⇒ 7.
  assert.equal(pools.combos.gleichklangAnzahl, 2, 'beide Teilwerte zählen für Gleichklang');
  assert.equal(hpVorher - kampf.gegner.hp, 7);
  assert.equal(pools.combos.vollmond, false); // Teilwerte < Höchstwert — bricht Vollmond
});

test('Bruchstelle: legt Riss auf den GEGNER, nicht auf den Spieler', () => {
  const { rng, run, kampf } = baueKampf(44);
  const id = kampf.hand[0];
  graviereSeite(run.arsenal.find((x) => x.id === id), 'bruchstelle', 0);
  platziereFest(run, kampf, id, 0);
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.gegner.status.riss, RISS_DAUER);
  assert.equal(kampf.spielerStatus.riss, 0);
});

test('Gegner-Riss: 25-%-Aussetzer lässt die Gegner-Aktion verpuffen (2 Runden, dann Decay)', () => {
  const { rng, run, kampf } = baueKampf(45);
  const id = kampf.hand[0];
  graviereSeite(run.arsenal.find((x) => x.id === id), 'bruchstelle', 0);
  platziereFest(run, kampf, id, 0);
  loeseZugAuf(run, kampf, rng);

  // Aussetzer-Wurf < 0,25 ⇒ Aktion verpufft: kein Schaden trotz Angriff.
  const hpVorher = run.hp;
  const e1 = fuehreGegnerzugAus(run, kampf, { naechsteZahl: () => 0.1 });
  assert.equal(e1.ausgesetzt, true);
  assert.equal(e1.erlitten, 0);
  assert.equal(run.hp, hpVorher);
  assert.equal(kampf.gegner.status.riss, RISS_DAUER - 1); // Rundenende-Decay

  // Wurf ≥ 0,25 ⇒ der Angriff trifft normal.
  kampf.phase = 'gegnerzug';
  kampf.gegner.absicht = { typ: 'angriff', wert: 5 };
  const e2 = fuehreGegnerzugAus(run, kampf, { naechsteZahl: () => 0.9 });
  assert.equal(e2.ausgesetzt, false);
  assert.ok(e2.erlitten > 0);
  assert.equal(kampf.gegner.status.riss, 0); // Fenster abgelaufen
});

test('drueckeFluchAuf: überschreibt die schwächste ungravierte Seite, Würfel trägt max. einen Fluch', () => {
  const rng = new RNG(46);
  const run = starteRun('eichwart', rng);
  const vorher = run.arsenal.map((w) => w.seiten.map((s) => s.wert));
  const treffer = drueckeFluchAuf(run, 'scharte_fluch', rng);
  const minWert = Math.min(...vorher[run.arsenal.indexOf(treffer.wuerfel)]);
  assert.equal(treffer.wuerfel.seiten[treffer.seitenIndex].fluchId, 'scharte_fluch');
  assert.equal(treffer.wuerfel.seiten[treffer.seitenIndex].basisWert, minWert);
  assert.equal(aktiveFluechte(run).length, 1);
  // Alle Würfel verflucht ⇒ weitere Flüche verpuffen (null).
  for (let i = 0; i < 20; i += 1) drueckeFluchAuf(run, 'fluch_seite', rng);
  assert.equal(aktiveFluechte(run).length, run.arsenal.length);
  assert.equal(drueckeFluchAuf(run, 'fluch_seite', rng), null);
});

test('Fluch-Seite ist nicht überschmiedbar; Blaupause löst sie NICHT; Entfernen schon', () => {
  const rng = new RNG(47);
  const run = starteRun('eichwart', rng);
  const { wuerfel, seitenIndex } = drueckeFluchAuf(run, 'fluch_seite', rng);
  assert.equal(schmiedePreis(wuerfel, 'wucht', seitenIndex, run), null);
  assert.equal(graviereSeite(wuerfel, 'wucht', seitenIndex), null);
  assert.equal(wuerfel.seiten[seitenIndex].fluchId, 'fluch_seite'); // unverändert
  wendeBlaupauseAn(wuerfel, 'hartholz');
  assert.equal(wuerfel.seiten[seitenIndex].fluchId, 'fluch_seite'); // überlebt die Blaupause
  run.waehrungen.muenzen = 100;
  entferneWuerfel(run, wuerfel.id);
  assert.equal(aktiveFluechte(run).length, 0); // Entfernen löst den Fluch (07 §3.3)
});

test('Fluch-Seiten im Kampf: Fäule/Scharte treffen den Hüter, Stumpf tut nichts — alle brechen Vollmond', () => {
  for (const [fluchId, pruefe] of [
    ['faeule_anfaelligkeit', (k) => assert.equal(k.spielerStatus.faeule, FLUECHE.faeule_anfaelligkeit.wert)],
    ['scharte_fluch', (k) => assert.equal(k.spielerStatus.scharte, FLUECHE.scharte_fluch.wert)],
    ['fluch_seite', (k) => assert.equal(k.spielerStatus.faeule + k.spielerStatus.scharte, 0)],
  ]) {
    const { rng, run, kampf } = baueKampf(48);
    const id = kampf.hand[0];
    const w = run.arsenal.find((x) => x.id === id);
    const fluch = FLUECHE[fluchId];
    w.seiten[0] = { wert: 0, basisWert: w.seiten[0].wert, fluchId, effekt: [{ typ: fluch.seitenTyp, wert: fluch.wert }] };
    platziereFest(run, kampf, id, 0);
    const pools = loeseZugAuf(run, kampf, rng);
    pruefe(kampf);
    assert.equal(pools.combos.vollmond, false, `${fluchId} bricht Vollmond`);
  }
});

test('Fluch-Events sind im Slice: Moderpfütze drückt Fluch auf und kann Giftranke finden', () => {
  for (const id of ['moderpfuetze', 'schrein_der_raschen_gaben', 'trockene_quelle']) {
    assert.ok(SLICE_EVENTS.includes(id), `${id} fehlt im Event-Slice`);
  }
  const rng = new RNG(49);
  const run = starteRun('eichwart', rng);
  // rng-Mock: Fund-Wurf < 0,5 ⇒ Giftranke gefunden.
  waehleEventOption(run, EVENTS.moderpfuetze, 0, { naechsteZahl: () => 0.1 });
  assert.equal(aktiveFluechte(run)[0].fluchId, 'faeule_anfaelligkeit');
  assert.deepEqual(run.offeneBelohnungen.map((o) => o.blaupauseId), ['giftranke']);
});

test('Schrein der raschen Gaben: Fluch-Seite gegen epische Blaupause', () => {
  const rng = new RNG(50);
  const run = starteRun('eichwart', rng);
  waehleEventOption(run, EVENTS.schrein_der_raschen_gaben, 0, rng);
  assert.equal(aktiveFluechte(run)[0].fluchId, 'fluch_seite');
  assert.equal(run.offeneBelohnungen.length, 1);
  assert.equal(run.offeneBelohnungen[0].typ, 'blaupause');
});

test('Trockene Quelle: +30 Münzen gegen Scharte-Fluch', () => {
  const rng = new RNG(51);
  const run = starteRun('eichwart', rng);
  waehleEventOption(run, EVENTS.trockene_quelle, 0, rng);
  assert.equal(run.waehrungen.muenzen, 30);
  assert.equal(aktiveFluechte(run)[0].fluchId, 'scharte_fluch');
});
