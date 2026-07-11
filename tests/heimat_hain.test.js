import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import {
  leeresMeta,
  verdieneSamen,
  SETZLINGE,
  pruefeSetzlingKauf,
  pflanzeSetzling,
  hatSetzling,
  aktiveSetzlinge,
  normalisiereMeta,
} from '../meta.js';
import { schreck } from '../push.js';
import { TAU_PRO_REGION, rasteLagerfeuer } from '../knoten.js';
import { starteRun } from '../kampf.js';

test('Samen-Einkommen je Ende: Frühling 2, Stiller Hain 1, Hohles Erbe 0 (01 §5)', () => {
  const meta = leeresMeta();
  assert.equal(verdieneSamen(meta, 'fruehling'), 2);
  assert.equal(verdieneSamen(meta, 'stiller_hain'), 1);
  assert.equal(verdieneSamen(meta, 'hohles_erbe'), 0);
  assert.equal(meta.samen, 3);
});

test('Setzling pflanzen: Kosten-Gate, Abbuchung, kein Doppel', () => {
  const meta = leeresMeta();
  meta.samen = 1;
  assert.equal(pruefeSetzlingKauf(meta, 'tiefwurzel').grund, 'samen'); // kostet 2
  assert.equal(pflanzeSetzling(meta, 'tau_wurzel').ok, true);
  assert.equal(meta.samen, 0);
  assert.ok(hatSetzling(meta, 'tau_wurzel'));
  assert.equal(pflanzeSetzling(meta, 'tau_wurzel').grund, 'gepflanzt');
  assert.deepEqual(aktiveSetzlinge(meta), ['tau_wurzel']);
});

test('Tau-Wurzel: +2 Tau bei Region-Eintritt; Tiefwurzel: +5 Max-HP', () => {
  const rng = new RNG(1300);
  const ohne = starteRun('eichwart', rng);
  assert.equal(ohne.waehrungen.tau, TAU_PRO_REGION);
  const mit = starteRun('eichwart', rng, { setzlinge: ['tau_wurzel', 'tiefwurzel'] });
  assert.equal(mit.waehrungen.tau, TAU_PRO_REGION + 2);
  assert.equal(mit.hpMax, ohne.hpMax + 5);
  assert.equal(mit.hp, mit.hpMax);
});

test('Mut-Trieb: ein Würfel startet fröhlich (+2 Gemüt), kein Schreck', () => {
  const rng = new RNG(1301);
  const run = starteRun('eichwart', rng, { setzlinge: ['mut_trieb'] });
  const summe = run.arsenal.reduce((s, w) => s + w.gemuet, 0);
  assert.equal(summe, 2);
  assert.equal(run.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0), 0);
});

test('Frühjahrs-Knospe: erstes Lagerfeuer-Trösten je Run verbraucht die Rast nicht', () => {
  const rng = new RNG(1302);
  const run = starteRun('eichwart', rng, { setzlinge: ['fruehjahrs_knospe'] });
  const erste = rasteLagerfeuer(run, 'troesten', run.arsenal[0].id);
  assert.equal(erste.rastFrei, true);
  assert.equal(run.knospeGenutzt, true);
  const zweite = rasteLagerfeuer(run, 'troesten', run.arsenal[0].id);
  assert.equal(zweite.rastFrei, undefined); // nur einmal je Run
  assert.equal(run.arsenal[0].gemuet, 4); // beide Trösten wirkten (+2/+2)
  assert.equal(run.troestenZahl, 2);
});

test('normalisiereMeta füllt samen/heimatHain für Altbestände auf', () => {
  const meta = normalisiereMeta({ jahresringe: 3 });
  assert.equal(meta.samen, 0);
  assert.deepEqual(meta.heimatHain, []);
  assert.equal(Object.keys(SETZLINGE).length, 4);
});
