import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { KLASSEN, HUETER_BASIS_HP } from '../data.js';
import { starteRun, starteKampf, beginneZug, platziere, nimmZurueck, loeseZugAuf, rerolle } from '../kampf.js';

function platziereFest(run, kampf, wuerfelId, seitenIndex) {
  const w = run.arsenal.find((x) => x.id === wuerfelId);
  kampf.wuerfe[wuerfelId] = { seitenIndex, wert: w.seiten[seitenIndex].wert };
  return platziere(run, kampf, wuerfelId);
}

function handWuerfelVomTyp(run, kampf, typ) {
  return kampf.hand.filter((id) => run.arsenal.find((w) => w.id === id).typ === typ);
}

function bereiteKampf(klasseId, seed, gegnerHp = 400) {
  const rng = new RNG(seed);
  const run = starteRun(klasseId, rng);
  const kampf = starteKampf(run, rng);
  kampf.gegner.hp = kampf.gegner.hpMax = gegnerHp;
  beginneZug(run, kampf, rng);
  return { rng, run, kampf };
}

test('Start-Arsenale und HP-Mods aller 5 Klassen (06 §1.3)', () => {
  const rng = new RNG(1000);
  for (const [id, klasse] of Object.entries(KLASSEN)) {
    const run = starteRun(id, rng);
    assert.equal(run.arsenal.length, 12, `${id}: 12er-Arsenal`);
    assert.equal(run.hpMax, HUETER_BASIS_HP + klasse.hpMod, `${id}: HP-Mod`);
  }
});

test('Rodbauer: +3 je Schaden-Seite, kein Rinde-Würfel im Start-Arsenal', () => {
  const { rng, run, kampf } = bereiteKampf('rodbauer', 1001);
  assert.ok(run.arsenal.every((w) => w.typ !== 'rinde'));
  const id = handWuerfelVomTyp(run, kampf, 'schaden')[0];
  const wert = run.arsenal.find((w) => w.id === id).seiten[1].wert; // niedrige Seite, kein Vollmond
  platziereFest(run, kampf, id, 1);
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, wert + 3);
});

test('Dorfschamane "Zuversicht": +2 nur bei Gemüt ≥ 0, Schreck streicht den Bonus', () => {
  const { rng, run, kampf } = bereiteKampf('dorfschamane', 1002);
  const [a, b] = handWuerfelVomTyp(run, kampf, 'schaden');
  assert.ok(b, 'zwei Schaden-Würfel in der Hand (Seed 1002)');
  run.arsenal.find((w) => w.id === b).gemuet = -1; // ängstlich → kein Bonus
  platziereFest(run, kampf, a, 1); // Wert 2 → 2+2
  platziereFest(run, kampf, b, 0); // Wert 1 → 1+0
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.schaden, 2 + 2 + 1);
});

test('Dorfschamane: erste Ermutigungs-Seite je Kampf kostet 0 Atem (inkl. Zurücknehmen)', () => {
  const { rng, run, kampf } = bereiteKampf('dorfschamane', 1003);
  let stuetzeId = handWuerfelVomTyp(run, kampf, 'stuetze')[0];
  while (!stuetzeId) {
    beginneZug(run, kampf, rng);
    stuetzeId = handWuerfelVomTyp(run, kampf, 'stuetze')[0];
  }
  kampf.wuerfe[stuetzeId] = { seitenIndex: 0, wert: 0 }; // Erm(0)-Seite
  const atemVorher = kampf.atem;
  platziere(run, kampf, stuetzeId);
  assert.equal(kampf.atem, atemVorher); // gratis
  nimmZurueck(run, kampf, stuetzeId);
  assert.equal(kampf.atem, atemVorher); // kein Atem-Geschenk beim Zurücknehmen
  assert.equal(kampf.gratisErmutigungRest, 1); // Freischein wieder da
  platziere(run, kampf, stuetzeId);
  assert.equal(kampf.atem, atemVorher); // wieder gratis
  assert.equal(kampf.gratisErmutigungRest, 0);
});

test('Glöckner "Widerhall": Flachbonus auf den Pool, wenn Gleichklang zündet — sonst nicht', () => {
  const { rng, run, kampf } = bereiteKampf('gloeckner', 1004);
  const [a, b] = handWuerfelVomTyp(run, kampf, 'schaden');
  platziereFest(run, kampf, a, 2); // Klangwürfel Wert 4
  platziereFest(run, kampf, b, 2); // Wert 4 → Gleichklang 2
  const pools = loeseZugAuf(run, kampf, rng);
  // (4+4) × 1,25 = 10, +5 Widerhall (nachgeschärft, C7) = 15.
  assert.equal(pools.combos.widerhallBonus, KLASSEN.gloeckner.passiv.schadenFlach);
  assert.equal(pools.schaden, Math.floor(8 * 1.25) + KLASSEN.gloeckner.passiv.schadenFlach);

  // Ohne Match: kein Widerhall.
  const zweiter = bereiteKampf('gloeckner', 1005);
  const [c, d] = handWuerfelVomTyp(zweiter.run, zweiter.kampf, 'schaden');
  platziereFest(zweiter.run, zweiter.kampf, c, 0); // Wert 2
  platziereFest(zweiter.run, zweiter.kampf, d, 1); // Wert 3
  const pools2 = loeseZugAuf(zweiter.run, zweiter.kampf, zweiter.rng);
  assert.equal(pools2.combos.widerhallBonus, 0);
  assert.equal(pools2.schaden, 5);
});

test('Schleiferin "Schliff": +1 effektiver Wert (alle Pools), Vollmond ignoriert den Sockel', () => {
  const { rng, run, kampf } = bereiteKampf('schleiferin', 1006);
  const id = handWuerfelVomTyp(run, kampf, 'schaden')[0];
  platziereFest(run, kampf, id, 3); // Wetzklinge Wert 5 → eff 6 = Höchstwert, aber natürlich 5
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.combos.vollmond, false); // Sockel speist Vollmond nicht (06 §5)
  assert.equal(pools.schaden, 5 + 1); // eff 6, kein Passiv-Flachbonus

  // Natürliche 6 → Vollmond zündet regulär.
  const zweiter = bereiteKampf('schleiferin', 1007);
  const id2 = handWuerfelVomTyp(zweiter.run, zweiter.kampf, 'schaden')[0];
  platziereFest(zweiter.run, zweiter.kampf, id2, 4); // Wert 6 natürlich
  const pools2 = loeseZugAuf(zweiter.run, zweiter.kampf, zweiter.rng);
  assert.equal(pools2.combos.vollmond, true);
  assert.equal(pools2.schaden, 7 + 8); // eff 7 + Burst 8 (Region 1)
});

test('Schleiferin: Rinde bekommt den Schliff-Sockel ebenfalls (+1)', () => {
  const { rng, run, kampf } = bereiteKampf('schleiferin', 1008);
  const rindeId = handWuerfelVomTyp(run, kampf, 'rinde')[0];
  assert.ok(rindeId, 'Borkenschild in der Hand (Seed 1008)');
  const wert = run.arsenal.find((w) => w.id === rindeId).seiten[4].wert;
  platziereFest(run, kampf, rindeId, 4);
  const pools = loeseZugAuf(run, kampf, rng);
  assert.equal(pools.rinde, wert + 1);
});

test('Schleiferin: +1 Gratis-Reroll je Zug (zweiter Reroll baut kein Übermut)', () => {
  const { rng, run, kampf } = bereiteKampf('schleiferin', 1009);
  rerolle(run, kampf, rng); // Standard-Gratis
  rerolle(run, kampf, rng); // Schliff-Freilauf
  assert.equal(kampf.uebermut, 0);
  rerolle(run, kampf, rng); // dritter kostet
  assert.equal(kampf.uebermut, 1);
});
