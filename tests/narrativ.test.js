import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { DE } from '../i18n/de.js';
import { EVENTS, HUETER_BASIS_HP, KLASSEN, REGION_HPMAX_BONUS } from '../data.js';
import { starteRun } from '../kampf.js';
import { zieheEvent, waehleEventOption, eventOptionMoeglich, SLICE_EVENTS } from '../knoten.js';
import { migriere } from '../save.js';
import {
  mentorBeiRegionEintritt,
  mentorBeiTischsturz,
  merkeHinweis,
  wendungSzene,
  wendungSteht,
  endeSzenen,
} from '../narrativ.js';

test('Mentor-Zeilen: eine je Region 1–5, keine in Region 6 (die Wendung übernimmt)', () => {
  for (let r = 1; r <= 5; r += 1) {
    const key = mentorBeiRegionEintritt(r);
    assert.equal(key, `mentor.region.${r}`);
    assert.ok(key in DE, `${key} fehlt in i18n/de.js`);
  }
  assert.equal(mentorBeiRegionEintritt(6), null);
  assert.ok(mentorBeiTischsturz() in DE);
});

test('Event-Ziehung ist regions-gegated: Zweifel-Events NUR in R4/R5 (07 §5.3)', () => {
  const rng = new RNG(1700);
  for (let i = 0; i < 200; i += 1) {
    const e1 = zieheEvent(rng, 1);
    assert.ok(!['stumme_lichtung', 'hohler_stumpf'].includes(e1.id), `Zweifel-Event in R1: ${e1.id}`);
    assert.ok(e1.regionen.includes(1));
    assert.ok(zieheEvent(rng, 4).regionen.includes(4));
    assert.ok(zieheEvent(rng, 5).regionen.includes(5));
  }
  // R4/R5 enthalten die Zweifel-Events tatsächlich im Pool.
  const gesehen = new Set();
  for (let i = 0; i < 100; i += 1) gesehen.add(zieheEvent(rng, 4).id);
  assert.ok(gesehen.has('stumme_lichtung'));
  // Region ohne Regions-Treffer (6): Fallback auf den vollen Slice-Pool.
  assert.ok(SLICE_EVENTS.includes(zieheEvent(rng, 6).id));
});

test('Zweifel-Option merkt den Hinweis am Run und zählt das Trösten', () => {
  const rng = new RNG(1701);
  const run = starteRun('eichwart', rng);
  run.region = 4;
  const wirkungen = waehleEventOption(run, EVENTS.stumme_lichtung, 1, rng);
  assert.deepEqual(run.hinweise, ['zweifel_1']);
  assert.equal(run.troestenZahl, 1);
  assert.ok(wirkungen.length > 0);
  assert.ok('hinweis.zweifel_1' in DE);
  assert.ok('hinweis.zweifel_2' in DE);
});

test('Neue Event-Effekte: Selbstschaden (Untergrenze 1), Gratis-Gravur, Segen', () => {
  const rng = new RNG(1702);
  const run = starteRun('eichwart', rng);
  // Schwelende Wurzel A: Zunder-Gravur gratis + 3 Selbstschaden.
  const hpVorher = run.hp;
  waehleEventOption(run, EVENTS.schwelende_wurzel, 0, rng);
  assert.equal(run.hp, hpVorher - 3);
  assert.ok(run.arsenal.some((w) => w.seiten.some((s) => s.gravurId === 'zunder')));
  // Untergrenze: Events töten nicht.
  run.hp = 2;
  waehleEventOption(run, EVENTS.schwelende_wurzel, 0, rng);
  assert.equal(run.hp, 1);
  // Wetzstein B: Segen ins Inventar.
  waehleEventOption(run, EVENTS.wetzstein_am_wegrand, 1, rng);
  assert.ok(run.hainSegen.includes('wetzstein'));
});

test('Negative Währungs-Effekte sind Preise: unbezahlbar → Option wirkungslos', () => {
  const rng = new RNG(1703);
  const run = starteRun('eichwart', rng);
  const option = EVENTS.wetzstein_am_wegrand.optionen[0]; // −20 Eicheln
  assert.equal(eventOptionMoeglich(run, option), false); // Start: 0 Eicheln
  assert.deepEqual(waehleEventOption(run, EVENTS.wetzstein_am_wegrand, 0, rng), []);
  assert.equal(run.waehrungen.eicheln, 0);

  run.waehrungen.eicheln = 25;
  assert.equal(eventOptionMoeglich(run, option), true);
  const seitenVorher = run.arsenal
    .filter((w) => w.typ === 'schaden')
    .map((w) => w.seiten.reduce((s, x) => s + x.wert, 0));
  waehleEventOption(run, EVENTS.wetzstein_am_wegrand, 0, rng);
  assert.equal(run.waehrungen.eicheln, 5);
  const seitenNachher = run.arsenal
    .filter((w) => w.typ === 'schaden')
    .map((w) => w.seiten.reduce((s, x) => s + x.wert, 0));
  // Zwei Würfel wurden dauerhaft um +1 geschärft.
  const delta = seitenNachher.reduce((s, x) => s + x, 0) - seitenVorher.reduce((s, x) => s + x, 0);
  assert.equal(delta, 2);
});

test('Wendung: steht an der Schwelle zu Region 6, einmalig, färbt sich mit Hinweisen', () => {
  const rng = new RNG(1704);
  const run = starteRun('eichwart', rng);
  assert.equal(wendungSteht(run), false); // Region 1
  run.region = 6;
  assert.equal(wendungSteht(run), true);
  assert.deepEqual(wendungSzene(run), ['wendung.szene1', 'wendung.szene2', 'wendung.szene3']);
  merkeHinweis(run, 'zweifel_2');
  assert.deepEqual(wendungSzene(run).at(-1), 'wendung.geahnt');
  run.wendungGesehen = true;
  assert.equal(wendungSteht(run), false);
  for (const key of ['wendung.szene1', 'wendung.szene2', 'wendung.szene3', 'wendung.geahnt']) {
    assert.ok(key in DE, `${key} fehlt in i18n/de.js`);
  }
});

test('Enden-Inszenierung: drei Szenen-Keys je Ende, alle übersetzt', () => {
  for (const endeId of ['fruehling', 'stiller_hain', 'hohles_erbe']) {
    const szenen = endeSzenen(endeId);
    assert.equal(szenen.length, 3);
    for (const key of szenen) assert.ok(key in DE, `${key} fehlt in i18n/de.js`);
  }
});

test('Save v5 → v6: Narrativ-Felder + hpMax-Rekonstruktion (D8-Bonus je Tor)', () => {
  const v5 = {
    saveVersion: 5,
    runState: { klasse: 'eichwart', region: 3, setzlinge: [], troestenZahl: 0 },
  };
  const v6 = migriere(structuredClone(v5));
  assert.equal(v6.saveVersion, 6);
  assert.deepEqual(v6.runState.hinweise, []);
  assert.equal(v6.runState.wendungGesehen, false);
  assert.equal(
    v6.runState.hpMax,
    HUETER_BASIS_HP + KLASSEN.eichwart.hpMod + REGION_HPMAX_BONUS * 2
  );
  // Region ≥ 6: die Wendung gilt als gesehen (kein Replay auf Bestands-Saves).
  const spaet = migriere({ saveVersion: 5, runState: { klasse: 'eichwart', region: 6 } });
  assert.equal(spaet.runState.wendungGesehen, true);
});
