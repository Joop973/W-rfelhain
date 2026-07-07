import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import {
  bestimmeEnde,
  endSchreck,
  merkeEnde,
  ENDE_SCHRECK_NIEDRIG,
  ENDE_SCHRECK_HOCH,
  ENDE_TROESTEN_SCHWELLE,
} from '../enden.js';
import { leeresMeta, pruefeStammbaumKauf } from '../meta.js';
import { starteRun } from '../kampf.js';

function runMit(schreckSumme, troestenZahl) {
  const rng = new RNG(1200);
  const run = starteRun('eichwart', rng);
  // Schreck gezielt verteilen (je Würfel bis −9).
  let rest = schreckSumme;
  for (const w of run.arsenal) {
    const anteil = Math.min(9, rest);
    w.gemuet = -anteil;
    rest -= anteil;
    if (rest <= 0) break;
  }
  run.troestenZahl = troestenZahl;
  return run;
}

test('Der neue Frühling: Schreck ≤ 10 UND Trösten ≥ 8 UND Boss befriedet', () => {
  const run = runMit(ENDE_SCHRECK_NIEDRIG, ENDE_TROESTEN_SCHWELLE);
  assert.equal(bestimmeEnde(run).id, 'stiller_hain'); // ohne Befriedung kein Frühling (D3 scharf)
  run.bossBefriedet = true;
  assert.equal(bestimmeEnde(run).id, 'fruehling');
  // Ohne Befriedung (ab D3 real) → Default-Ende.
  assert.equal(bestimmeEnde(run, { bossBefriedet: false }).id, 'stiller_hain');
  // Zu wenig Trösten → Default-Ende trotz Null-Schreck.
  assert.equal(bestimmeEnde(runMit(0, ENDE_TROESTEN_SCHWELLE - 1)).id, 'stiller_hain');
});

test('Das hohle Erbe ab Schreck ≥ 40, Der stille Hain dazwischen', () => {
  assert.equal(bestimmeEnde(runMit(ENDE_SCHRECK_HOCH, 0)).id, 'hohles_erbe');
  assert.equal(bestimmeEnde(runMit(60, 20)).id, 'hohles_erbe'); // Trösten rettet nicht über 40
  assert.equal(bestimmeEnde(runMit(25, 0)).id, 'stiller_hain');
  assert.equal(bestimmeEnde(runMit(11, 20)).id, 'stiller_hain'); // knapp über Frühling-Grenze
});

test('endSchreck summiert nur negatives Gemüt (Fröhlich zählt nicht gegen)', () => {
  const run = runMit(5, 0);
  run.arsenal[11].gemuet = 4; // fröhlicher Würfel
  assert.equal(endSchreck(run), 5);
});

test('merkeEnde: einmalig, speist die Rodbauer-Bedingung', () => {
  const meta = leeresMeta();
  meta.jahresringe = 20;
  assert.equal(pruefeStammbaumKauf(meta, 'klasse_rodbauer', { reifegrad: 0 }).grund, 'bedingung');
  merkeEnde(meta, 'fruehling');
  merkeEnde(meta, 'fruehling'); // kein Doppel
  assert.deepEqual(meta.endenErreicht, ['fruehling']);
  assert.equal(pruefeStammbaumKauf(meta, 'klasse_rodbauer', { reifegrad: 0 }).ok, true);
});
