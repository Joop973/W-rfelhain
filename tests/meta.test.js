import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  leeresMeta,
  normalisiereMeta,
  verdieneJahresringe,
  STAMMBAUM_KNOTEN,
  pruefeStammbaumKauf,
  kaufeStammbaumKnoten,
  istKlasseFrei,
} from '../meta.js';
import { KLASSEN } from '../data.js';
import { erstelleNeuenSave, speichere, lade } from '../save.js';

function speicherStub() {
  const daten = new Map();
  return {
    getItem: (k) => daten.get(k) ?? null,
    setItem: (k, v) => daten.set(k, v),
    removeItem: (k) => daten.delete(k),
  };
}

test('Jahresring-Einkommen: Sieg 2, Niederlage mit Fortschritt 1, früher Abbruch 0', () => {
  const meta = leeresMeta();
  assert.equal(verdieneJahresringe(meta, { sieg: true, kaempfe: 6 }), 2);
  assert.equal(verdieneJahresringe(meta, { sieg: false, kaempfe: 3 }), 1);
  assert.equal(verdieneJahresringe(meta, { sieg: false, kaempfe: 1 }), 0);
  assert.equal(meta.jahresringe, 3);
  assert.equal(meta.runsGespielt, 3);
  assert.equal(meta.runsGewonnen, 1);
});

test('Stammbaum: Klassen-Knoten decken alle Nicht-Start-Klassen, Kosten 3/5/8/12 (06 §7)', () => {
  const klassenKnoten = Object.values(STAMMBAUM_KNOTEN).filter((k) => k.effekt.typ === 'klasse_freischalten');
  const freigeschaltet = klassenKnoten.map((k) => k.effekt.klasseId).sort();
  const erwartet = Object.keys(KLASSEN).filter((id) => id !== 'eichwart').sort();
  assert.deepEqual(freigeschaltet, erwartet);
  assert.deepEqual(
    klassenKnoten.map((k) => k.kosten.jahresringe).sort((a, b) => a - b),
    [3, 5, 8, 12]
  );
});

test('Kauf: Kosten-Gate, Abbuchung, Freischaltung, kein Doppelkauf', () => {
  const meta = leeresMeta();
  meta.jahresringe = 2;
  assert.equal(pruefeStammbaumKauf(meta, 'klasse_dorfschamane').ok, false); // zu arm
  meta.jahresringe = 4;
  const kauf = kaufeStammbaumKnoten(meta, 'klasse_dorfschamane');
  assert.equal(kauf.ok, true);
  assert.equal(meta.jahresringe, 1);
  assert.ok(istKlasseFrei(meta, 'dorfschamane'));
  assert.equal(kaufeStammbaumKnoten(meta, 'klasse_dorfschamane').ok, false); // gekauft
  assert.equal(meta.jahresringe, 1); // kein Doppel-Abzug
});

test('Rodbauer-Bedingung: gesperrt ohne Frühling/Reifegrad, offen mit einem von beiden (06 §7)', () => {
  const meta = leeresMeta();
  meta.jahresringe = 20;
  assert.equal(pruefeStammbaumKauf(meta, 'klasse_rodbauer', { reifegrad: 0 }).grund, 'bedingung');
  assert.equal(pruefeStammbaumKauf(meta, 'klasse_rodbauer', { reifegrad: 3 }).ok, true);
  meta.endenErreicht = ['fruehling'];
  assert.equal(pruefeStammbaumKauf(meta, 'klasse_rodbauer', { reifegrad: 0 }).ok, true);
});

test('Meta überlebt den Save-Roundtrip (metaState im Save, 09 §3.1)', () => {
  const storage = speicherStub();
  const meta = leeresMeta();
  meta.jahresringe = 7;
  kaufeStammbaumKnoten(meta, 'klasse_dorfschamane');
  const save = erstelleNeuenSave('eichwart');
  save.metaState = meta;
  speichere(save, storage);
  const geladen = lade(storage);
  const wieder = normalisiereMeta(geladen.metaState);
  assert.equal(wieder.jahresringe, 4);
  assert.ok(istKlasseFrei(wieder, 'dorfschamane'));
});

test('normalisiereMeta füllt Altbestand-Saves (metaState v1 ohne C1-Felder) auf', () => {
  const alt = { jahresringe: 2, stammbaum: [], freigeschalteteKlassen: ['eichwart'] };
  const meta = normalisiereMeta(alt);
  assert.equal(meta.jahresringe, 2);
  assert.deepEqual(meta.endenErreicht, []);
  assert.equal(meta.runsGespielt, 0);
});
