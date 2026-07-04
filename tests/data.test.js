import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  WUERFEL_VORLAGEN,
  KLASSEN,
  GRAVUREN,
  BLAUPAUSEN,
  SLICE_BLAUPAUSEN,
  GEGNER_VORLAGEN,
  HAIN_SEGEN,
  EVENTS,
  erstelleWuerfel,
  erstelleStartArsenal,
  ARSENAL_START,
} from '../data.js';
import { DE } from '../i18n/de.js';

test('jede Würfel-Vorlage hat exakt 6 Seiten mit Effekt-Liste', () => {
  for (const vorlage of Object.values(WUERFEL_VORLAGEN)) {
    assert.equal(vorlage.seiten.length, 6, vorlage.id);
    for (const seite of vorlage.seiten) {
      assert.equal(typeof seite.wert, 'number');
      assert.ok(Array.isArray(seite.effekt) && seite.effekt.length > 0);
    }
  }
});

test('Eichwart-Startarsenal: 12 Würfel (8 Schaden + 4 Rinde), Schema-konform', () => {
  const arsenal = erstelleStartArsenal('eichwart');
  assert.equal(arsenal.length, ARSENAL_START);
  assert.equal(arsenal.filter((w) => w.typ === 'schaden').length, 8);
  assert.equal(arsenal.filter((w) => w.typ === 'rinde').length, 4);
  assert.equal(new Set(arsenal.map((w) => w.id)).size, 12); // IDs eindeutig
  for (const w of arsenal) {
    assert.equal(w.gemuet, 0);
    assert.equal(w.blaupause, null);
    assert.deepEqual(w.stufen, [0, 0, 0, 0, 0, 0]);
  }
});

test('alle Klassen-Startarsenale haben 12 Würfel und bekannte Vorlagen', () => {
  for (const klasse of Object.values(KLASSEN)) {
    const summe = klasse.startArsenal.reduce((s, e) => s + e.anzahl, 0);
    assert.equal(summe, 12, klasse.id);
    for (const eintrag of klasse.startArsenal) {
      assert.ok(WUERFEL_VORLAGEN[eintrag.vorlage], `${klasse.id}: ${eintrag.vorlage}`);
    }
  }
});

test('erstelleWuerfel liefert unabhängige Kopien (keine geteilten Seiten-Objekte)', () => {
  const a = erstelleWuerfel('astschneide', 'a');
  const b = erstelleWuerfel('astschneide', 'b');
  a.seiten[0].effekt[0].wert = 99;
  assert.equal(b.seiten[0].effekt[0].wert, 1);
  assert.equal(WUERFEL_VORLAGEN.astschneide.seiten[0].effekt[0].wert, 1); // Vorlage unberührt
});

test('Gravuren: harter Stufen-Cap 3, Ein-Stufen-Seiten korrekt markiert, Wucht gesperrt-konform', () => {
  for (const gravur of Object.values(GRAVUREN)) {
    assert.ok(gravur.maxStufen <= 3, gravur.id);
    assert.equal(gravur.stufen.length, gravur.maxStufen, gravur.id);
    assert.equal(gravur.einStufenSeite, gravur.maxStufen === 1, gravur.id);
  }
  assert.deepEqual(
    GRAVUREN.wucht.stufen.map((s) => [s.effektWert, s.preisMuenzen]),
    [[1.5, 40], [2.0, 60], [2.5, 80]]
  );
});

test('Blaupausen: 16 Stück, je 6 Seiten, verbrauchen sich; Slice-Liste referenziert existierende', () => {
  assert.equal(Object.keys(BLAUPAUSEN).length, 16);
  for (const bp of Object.values(BLAUPAUSEN)) {
    assert.equal(bp.seitenVorlage.length, 6, bp.id);
    assert.equal(bp.verbrauchtSichBeimAnwenden, true, bp.id); // [GESPERRT]
  }
  for (const id of SLICE_BLAUPAUSEN) {
    assert.ok(BLAUPAUSEN[id], id);
  }
});

test('Region-1-Gegner liegen in den kalibrierten Bereichen (05 §1.2)', () => {
  const r1 = Object.values(GEGNER_VORLAGEN).filter((g) => g.region === 1);
  assert.ok(r1.length >= 4);
  for (const g of r1) {
    const [hpMin, hpMax] = g.hpBereich;
    const [sMin, sMax] = g.schadenBereich;
    assert.ok(hpMin <= hpMax && sMin <= sMax, g.id);
    if (g.rolle === 'normal') {
      assert.ok(hpMin >= 30 && hpMax <= 45, g.id); // Normal-HP 30–45
      assert.ok(sMin >= 6 && sMax <= 10, g.id); // Schaden-Band
    }
    if (g.rolle === 'elite') assert.ok(hpMin >= 50 && hpMax <= 65, g.id); // Elite-Mix 50–65
    if (g.rolle === 'boss') assert.ok(hpMin >= 110 && hpMax <= 130, g.id); // Boss 110–130
  }
});

test('Hain-Segen: 16 Stück, Haken-Konsistenz (hakenTextKey genau bei hatHaken)', () => {
  assert.equal(Object.keys(HAIN_SEGEN).length, 16);
  for (const segen of Object.values(HAIN_SEGEN)) {
    if (segen.hatHaken) {
      assert.ok(segen.hakenTextKey, segen.id);
      assert.ok(segen.haken, segen.id);
    } else {
      assert.equal(segen.hakenTextKey, null, segen.id);
    }
  }
});

test('alle referenzierten Text-Keys existieren in i18n/de.js', () => {
  const keys = [];
  for (const v of Object.values(WUERFEL_VORLAGEN)) keys.push(v.nameKey);
  for (const k of Object.values(KLASSEN)) keys.push(k.nameKey);
  for (const g of Object.values(GRAVUREN)) keys.push(g.nameKey);
  for (const b of Object.values(BLAUPAUSEN)) keys.push(b.nameKey);
  for (const g of Object.values(GEGNER_VORLAGEN)) keys.push(g.nameKey);
  for (const s of Object.values(HAIN_SEGEN)) {
    keys.push(s.textKey);
    if (s.hakenTextKey) keys.push(s.hakenTextKey);
  }
  for (const e of Object.values(EVENTS)) {
    keys.push(e.titelKey, e.textKey, ...e.optionen.map((o) => o.textKey));
  }
  const fehlend = keys.filter((k) => !(k in DE));
  assert.deepEqual(fehlend, []);
});
