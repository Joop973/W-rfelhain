import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { schreck } from '../push.js';
import { pruefeInvariante } from '../ziehstapel.js';
import { rasteLagerfeuer } from '../knoten.js';
import {
  starteRun,
  starteKampf,
  beginneZug,
  rerolle,
  platziere,
  nimmZurueck,
  loeseZugAuf,
  fuehreGegnerzugAus,
  arsenalSchreckSumme,
  verfuegbareKnoten,
  betreteKnoten,
  findeKnoten,
  naechsteAbsicht,
} from '../kampf.js';

function spieleZugAuto(run, kampf, rng) {
  // Platziert die 3 höchsten Schaden-Würfe (greedy, kein Reroll).
  const kandidaten = kampf.hand
    .filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden')
    .sort((a, b) => kampf.wuerfe[b].wert - kampf.wuerfe[a].wert);
  for (const id of kandidaten) {
    if (kampf.atem <= 0) break;
    platziere(run, kampf, id);
  }
  return loeseZugAuf(run, kampf, rng);
}

function kaempfeDurch(run, kampf, rng) {
  while (kampf.phase === 'zug' || kampf.phase === 'gegnerzug') {
    if (kampf.phase === 'zug') {
      beginneZug(run, kampf, rng);
      spieleZugAuto(run, kampf, rng);
    } else {
      fuehreGegnerzugAus(run, kampf, rng);
    }
  }
}

test('Kampf startet regelkonform: Hand 5, Atem 3, Absicht angekündigt, Invariante hält', () => {
  const rng = new RNG(1);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  beginneZug(run, kampf, rng);

  assert.equal(kampf.hand.length, 5);
  assert.equal(kampf.atem, 3);
  assert.equal(kampf.uebermut, 0);
  assert.ok(kampf.gegner.absicht.angekuendigt);
  assert.ok(pruefeInvariante({ ...kampf.zieh, hand: kampf.hand }, run.arsenal.map((w) => w.id)));
});

test('Platzieren kostet Atem, Zurücknehmen erstattet; max 3 Seiten je Zug', () => {
  const rng = new RNG(2);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  beginneZug(run, kampf, rng);

  const [a, b, c, d] = kampf.hand;
  assert.ok(platziere(run, kampf, a));
  assert.ok(platziere(run, kampf, b));
  assert.ok(platziere(run, kampf, c));
  assert.equal(kampf.atem, 0);
  assert.equal(platziere(run, kampf, d), false); // Atem-Deckel
  assert.ok(nimmZurueck(run, kampf, b));
  assert.equal(kampf.atem, 1);
  assert.deepEqual(kampf.reihe, [a, c]); // Reihenfolge bleibt L→R
});

test('Tischsturz über Reroll: Hand +2 Schreck, Selbstschaden, Zug verbraucht', () => {
  const rng = new RNG(3);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  beginneZug(run, kampf, rng);
  const handIds = [...kampf.hand];
  const hpVorher = run.hp;

  kampf.uebermut = 6; // Kipp-Punkt erreicht — nächster bezahlter Reroll kippt
  kampf.rerollsDiesenZug = 1; // Gratis-Reroll verbraucht
  const { tischsturz } = rerolle(run, kampf, rng);

  assert.equal(tischsturz, true);
  assert.equal(run.hp, hpVorher - 3);
  assert.equal(kampf.phase, 'gegnerzug');
  for (const id of handIds) {
    assert.equal(schreck(run.arsenal.find((w) => w.id === id).gemuet), 2);
  }
});

test('Kristallisation bei Kampfende: Rest-Übermut wird Schreck auf zuletzt gespielte', () => {
  const rng = new RNG(4);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = 1; // stirbt am nächsten Paket
  beginneZug(run, kampf, rng);
  kampf.uebermut = 4; // bezahlte Rerolls simuliert
  run.hp -= 1; // HP-Verlust → kein sauberer Sieg, kein +1-Gegenverrechnen

  spieleZugAuto(run, kampf, rng);

  assert.equal(kampf.phase, 'sieg');
  assert.equal(kampf.sauberSieg, false);
  assert.equal(kampf.kristallisiert, 4);
  assert.equal(arsenalSchreckSumme(run), 4); // 1:1 auf zuletzt gespielte verteilt
});

test('sauberer Sieg ohne HP-Verlust: +1 Gemüt nur auf gespielte Würfel', () => {
  const rng = new RNG(5);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = 1;
  beginneZug(run, kampf, rng);
  spieleZugAuto(run, kampf, rng);

  assert.equal(kampf.phase, 'sieg');
  assert.equal(kampf.sauberSieg, true);
  const gespielte = new Set(kampf.gespielteImKampf);
  for (const w of run.arsenal) {
    assert.equal(w.gemuet, gespielte.has(w.id) ? 1 : 0, w.id);
  }
});

test('Karten-Navigation: Start bietet Reihe 1, betreten nur wählbarer Knoten', () => {
  const rng = new RNG(6);
  const run = starteRun('eichwart', rng);

  const start = verfuegbareKnoten(run);
  assert.ok(start.length >= 2);
  assert.ok(start.every((k) => k.reihe === 1 && k.typ === 'kampf'));

  assert.equal(betreteKnoten(run, 'r8s0'), null); // Boss ist nicht wählbar
  const knoten = betreteKnoten(run, start[0].id);
  assert.equal(run.positionKnotenId, knoten.id);

  const danach = verfuegbareKnoten(run);
  assert.ok(danach.every((k) => k.reihe === 2 && knoten.kanten.includes(k.slot)));
});

test('Boss-Twist "Erste Geduld": jede dritte Boss-Runde ist zwingend Block', () => {
  const gegner = {
    mechanikIds: ['erste_geduld'],
    absichtsMuster: 'schlaeger',
    phasen: [{ abHpAnteil: 0.5, absichtsMuster: 'waechter_mehrfach' }],
    schaden: 10,
    hp: 120,
    hpMax: 120,
    zyklus: 0,
  };
  const typen = [];
  for (let zyklus = 0; zyklus < 6; zyklus += 1) {
    gegner.zyklus = zyklus;
    typen.push(naechsteAbsicht(gegner).typ);
  }
  assert.deepEqual(typen, ['angriff', 'angriff', 'block', 'angriff', 'angriff', 'block']);

  gegner.hp = 50; // Phase 2 (<50 %): Wächter-Rotation, Twist bleibt
  gegner.zyklus = 2;
  assert.equal(naechsteAbsicht(gegner).typ, 'block'); // Twist hat Vorrang
  gegner.zyklus = 1;
  assert.equal(naechsteAbsicht(gegner).typ, 'angriff'); // Wächter: Zyklus 1 = Angriff
});

test('kompletter Run über die Karte terminiert (Boss beendet die Region)', () => {
  const rng = new RNG(20260704);
  const run = starteRun('eichwart', rng);

  let sicherheit = 0;
  while (!run.abgeschlossen && !run.verloren && sicherheit < 100) {
    sicherheit += 1;
    const wahl = verfuegbareKnoten(run)[0];
    const knoten = betreteKnoten(run, wahl.id);
    if (['kampf', 'elite', 'boss'].includes(knoten.typ)) {
      const kampf = starteKampf(run, rng, knoten.typ);
      kaempfeDurch(run, kampf, rng);
      if (kampf.phase === 'sieg' && knoten.typ === 'boss' && kampf.belohnung) {
        // Boss-Sonder-Belohnung seit B6: 2 Blaupausen + 1 Boss-Segen (Endboss: null).
        assert.ok(kampf.belohnung.optionen.every((o) => o.typ === 'blaupause' || o.typ === 'segen'));
        assert.ok(kampf.belohnung.optionen.filter((o) => o.typ === 'blaupause').length >= 2);
      }
    } else if (knoten.typ === 'lagerfeuer') {
      rasteLagerfeuer(run, 'heilen');
    }
    // Markt/Schmiede/Event: im Auto-Test nur durchlaufen.
  }

  assert.ok(run.abgeschlossen || run.verloren);
  if (run.abgeschlossen) {
    assert.equal(findeKnoten(run, run.positionKnotenId).typ, 'boss');
  }
});
