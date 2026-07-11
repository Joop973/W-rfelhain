import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { graviereSeite } from '../belohnung.js';
import {
  starteRun,
  starteKampf,
  beginneZug,
  platziere,
  loeseZugAuf,
  fuehreGegnerzugAus,
} from '../kampf.js';

// Hilfsfunktion: legt einen Hand-Würfel auf eine gewünschte gefallene Seite fest
// und platziert ihn — deterministisch, ohne den RNG-Wurf.
function platziereFest(run, kampf, wuerfelId, seitenIndex) {
  const w = run.arsenal.find((x) => x.id === wuerfelId);
  kampf.wuerfe[wuerfelId] = { seitenIndex, wert: w.seiten[seitenIndex].wert };
  return platziere(run, kampf, wuerfelId);
}

function schadenWuerfelIn(run, kampf) {
  return kampf.hand.filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden');
}

test('Gift-Gravur legt Fäule auf den Gegner; sie tickt am Gegnerzug und decayt', () => {
  const rng = new RNG(101);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 200; // überlebt den Zug, damit Fäule ticken kann
  beginneZug(run, kampf, rng);

  const [giftId] = schadenWuerfelIn(run, kampf);
  graviereSeite(run.arsenal.find((w) => w.id === giftId), 'gift', 0); // Seite 0 → Fäule 2 Stapel
  platziereFest(run, kampf, giftId, 0);
  loeseZugAuf(run, kampf, rng);

  assert.equal(kampf.gegner.status.faeule, 2); // aufgelegt

  const hpVorGegnerzug = kampf.gegner.hp;
  fuehreGegnerzugAus(run, kampf, rng);
  assert.equal(kampf.gegner.hp, hpVorGegnerzug - 2); // 2 Schaden zu Zug-Beginn
  assert.equal(kampf.gegner.status.faeule, 1); // −1 Tick
});

test('Welk auf dem Gegner senkt dessen Angriffswert (−10 %/Stapel)', () => {
  const rng = new RNG(102);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  kampf.gegner.schaden = 10;
  kampf.gegner.absicht = { typ: 'angriff', wert: 10, angekuendigt: true };
  kampf.gegner.status.welk = 3; // −30 %
  beginneZug(run, kampf, rng);
  // Kein Block platzieren, direkt auflösen mit leerer Reihe geht nicht — spiele 1 Schaden.
  platziereFest(run, kampf, schadenWuerfelIn(run, kampf)[0], 0);
  loeseZugAuf(run, kampf, rng);

  const hpVorher = run.hp;
  fuehreGegnerzugAus(run, kampf, rng);
  assert.equal(run.hp, hpVorher - 7); // floor(10 * 0,7) = 7
});

test('Markhärtung-Gravur baut Kraft auf; Kraft hebt jede Schaden-Seite des Folgezugs', () => {
  const rng = new RNG(103);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  kampf.gegner.absicht = { typ: 'block', wert: 5, angekuendigt: true }; // blockt, greift nicht an
  beginneZug(run, kampf, rng);

  // Zug 1: Kraft-Seite spielen (Markhärtung St.1 = Kraft 1).
  const [kraftId] = schadenWuerfelIn(run, kampf);
  graviereSeite(run.arsenal.find((w) => w.id === kraftId), 'markhaertung', 0);
  platziereFest(run, kampf, kraftId, 0);
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.spielerStatus.kraft, 1);

  fuehreGegnerzugAus(run, kampf, rng); // Gegner blockt → kein Spielerschaden
  beginneZug(run, kampf, rng);

  // Zug 2: eine reine Schaden-Seite Wert 4 → Basis 4 + Passiv 2 + Kraft 1 = 7.
  const schadenId = schadenWuerfelIn(run, kampf)[0];
  platziereFest(run, kampf, schadenId, 3); // Astschneide-Seite Index 3 = Wert 4
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, 4 + 2 + 1);
});

test('Glanz-Gravur verdoppelt die nächste Schaden-Seite (Basis, vor Mult)', () => {
  const rng = new RNG(104);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);

  const [glanzId, schadenId] = schadenWuerfelIn(run, kampf);
  graviereSeite(run.arsenal.find((w) => w.id === glanzId), 'glanz_gravur', 0);
  platziereFest(run, kampf, glanzId, 0); // links: Glanz-Seite (Wert 0, bricht Vollmond)
  platziereFest(run, kampf, schadenId, 3); // rechts: Wert 4 → (4 + 2 Passiv) ×2 = 12
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, (4 + 2) * 2);
});

test('Morsch auf dem Gegner erhöht den Schaden noch im selben Zug (+20 %/Stapel)', () => {
  const rng = new RNG(105);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = 300;
  beginneZug(run, kampf, rng);

  const schaden = schadenWuerfelIn(run, kampf);
  const morschId = schaden[0];
  const trefferId = schaden[1];
  graviereSeite(run.arsenal.find((w) => w.id === morschId), 'faeulnis_hauch', 0); // Morsch 1 Stapel
  platziereFest(run, kampf, morschId, 0); // Morsch-Seite (bricht Vollmond, kein Schaden)
  platziereFest(run, kampf, trefferId, 3); // Wert 4 → (4+2)=6, ×1,2 (Morsch 1) = 7,2 → floor 7
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, Math.floor((4 + 2) * 1.2));
  assert.equal(kampf.gegner.status.morsch, 1); // bleibt für Folgezüge stehen
});
