import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { schreck } from '../push.js';
import { pruefeInvariante } from '../ziehstapel.js';
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
  KAEMPFE_PRO_REGION,
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

test('Kampf startet regelkonform: Hand 5, Atem 3, Absicht angekündigt, Invariante hält', () => {
  const rng = new RNG(1);
  const run = starteRun('eichwart');
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
  const run = starteRun('eichwart');
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
  const run = starteRun('eichwart');
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
  const run = starteRun('eichwart');
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
  const run = starteRun('eichwart');
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

test('kompletter Run terminiert: 9 Kämpfe greedy durchgespielt', () => {
  const rng = new RNG(20260704);
  const run = starteRun('eichwart');

  let sicherheit = 0;
  while (!run.abgeschlossen && !run.verloren && sicherheit < 500) {
    sicherheit += 1;
    const kampf = starteKampf(run, rng);
    while (kampf.phase === 'zug' || kampf.phase === 'gegnerzug') {
      if (kampf.phase === 'zug') {
        beginneZug(run, kampf, rng);
        spieleZugAuto(run, kampf, rng);
      } else {
        fuehreGegnerzugAus(run, kampf);
      }
    }
  }

  assert.ok(run.abgeschlossen || run.verloren);
  if (run.abgeschlossen) assert.equal(run.kampfNummer, KAEMPFE_PRO_REGION);
  assert.ok(run.hp <= run.hpMax);
});
