import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { graviereSeite } from '../belohnung.js';
import { bestimmeEnde } from '../enden.js';
import {
  starteRun,
  starteKampf,
  beginneZug,
  platziere,
  loeseZugAuf,
  fuehreGegnerzugAus,
  naechsteAbsicht,
  baueSpiegelModule,
} from '../kampf.js';

function endbossKampf(seed) {
  const rng = new RNG(seed);
  const run = starteRun('eichwart', rng);
  run.region = 6;
  const kampf = starteKampf(run, rng, 'boss');
  assert.equal(kampf.gegner.vorlageId, 'frueherer_hueter');
  return { rng, run, kampf };
}

function platziereFest(run, kampf, wuerfelId, seitenIndex) {
  const w = run.arsenal.find((x) => x.id === wuerfelId);
  kampf.wuerfe[wuerfelId] = { seitenIndex, wert: w.seiten[seitenIndex].wert };
  return platziere(run, kampf, wuerfelId);
}

test('Das hohle Echo: Rest-Übermut heilt den Boss am Rundenende', () => {
  const { rng, run, kampf } = endbossKampf(1600);
  kampf.gegner.hp -= 30;
  const hpVorher = kampf.gegner.hp;
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
  kampf.uebermut = 4;
  kampf.gegner.absicht = { typ: 'block', wert: 0, angekuendigt: true };
  fuehreGegnerzugAus(run, kampf, rng);
  assert.equal(kampf.gegner.hp, hpVorher + 4);
  assert.equal(kampf.hohlesEchoGeheilt, 4);
});

test('Dein Spiegel: Module aus den ängstlichsten Würfeln, N = min(3, mit Schreck)', () => {
  const rng = new RNG(1601);
  const run = starteRun('eichwart', rng);
  run.arsenal[0].gemuet = -6; // 2 gesperrte Seiten, Spiegel-Status Cap 2
  run.arsenal[1].gemuet = -3; // 1 gesperrte Seite
  const module = baueSpiegelModule(run);
  assert.equal(module.length, 2);
  // Würfel 0 (Astschneide 1-6, Schreck 6): gesperrt sind 6+5 → Schaden 11.
  assert.equal(module[0].wuerfelId, run.arsenal[0].id);
  assert.equal(module[0].schaden, 11);
  assert.equal(module[0].status.stapel, 2);
  // Ruhige Spiegelung: ohne Schreck keine Module.
  const ruhig = starteRun('eichwart', rng);
  assert.equal(baueSpiegelModule(ruhig).length, 0);
});

test('Phase-3-Eintritt baut die Module; die Absicht rotiert durch sie', () => {
  const { rng, run, kampf } = endbossKampf(1602);
  run.arsenal[0].gemuet = -6;
  beginneZug(run, kampf, rng);
  loeseZugAuf(run, kampf, rng);
  kampf.gegner.hp = Math.floor(kampf.gegner.hpMax * 0.3); // < 33 %
  kampf.gegner.absicht = { typ: 'block', wert: 0, angekuendigt: true };
  fuehreGegnerzugAus(run, kampf, rng); // Rundenende baut Module + kündigt an
  assert.equal(kampf.gegner.spiegelModule.length, 1);
  assert.equal(kampf.gegner.absicht.spiegelModul.wuerfelId, run.arsenal[0].id);
  assert.equal(kampf.gegner.absicht.typ, 'angriff');
});

test('Trösten-Auflösung: Pflege-Seiten senken bossSchreck in Phase 3; <= 0 = befriedet ohne Kill', () => {
  const { rng, run, kampf } = endbossKampf(1603);
  kampf.gegner.bossSchreck = 4; // kurz vor der Befriedung
  kampf.gegner.spiegelModule = []; // Phase 3 aktiv (ruhige Spiegelung)
  beginneZug(run, kampf, rng);
  // Zwei Ermutigungs-Seiten gravieren und spielen — jede senkt bossSchreck um 2.
  const [a, b] = kampf.hand;
  graviereSeite(run.arsenal.find((w) => w.id === a), 'ermutigungs_gravur', 0);
  graviereSeite(run.arsenal.find((w) => w.id === b), 'ermutigungs_gravur', 0);
  platziereFest(run, kampf, a, 0);
  platziereFest(run, kampf, b, 0);
  const bossHp = kampf.gegner.hp;
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.gegner.bossSchreck, 0);
  assert.equal(kampf.befriedet, true);
  assert.equal(run.bossBefriedet, true);
  assert.equal(kampf.phase, 'sieg');
  assert.equal(kampf.gegner.hp, bossHp); // ohne Kill — kein Schaden nötig
  assert.equal(run.abgeschlossen, true);
  assert.equal(kampf.belohnung, null); // das Ende IST die Belohnung (05 §6)
  assert.equal(run.troestenZahl, 2); // gezieltes Trösten zählt (01 §5)
});

test('Kill-Pfad ohne Befriedung: Frühling bleibt verschlossen (Gate scharf)', () => {
  const { rng, run, kampf } = endbossKampf(1604);
  kampf.gegner.hp = 1;
  beginneZug(run, kampf, rng);
  const schadenId = kampf.hand.find((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden');
  platziereFest(run, kampf, schadenId, 3);
  loeseZugAuf(run, kampf, rng);
  assert.equal(kampf.phase, 'sieg');
  assert.equal(run.abgeschlossen, true);
  assert.notEqual(run.bossBefriedet, true);
  run.troestenZahl = 20; // selbst mit hoher Trösten-Zahl und Schreck 0:
  assert.notEqual(bestimmeEnde(run).id, 'fruehling');
});

test('Endboss-Sieg unter maxRegion 6 beendet den Run (keine 7. Region)', () => {
  const { rng, run, kampf } = endbossKampf(1605);
  kampf.gegner.hp = 1;
  beginneZug(run, kampf, rng);
  const schadenId = kampf.hand.find((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden');
  platziereFest(run, kampf, schadenId, 3);
  loeseZugAuf(run, kampf, rng);
  assert.equal(run.region, 6);
  assert.equal(run.abgeschlossen, true);
});
