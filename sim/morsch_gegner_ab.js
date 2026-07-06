// sim/morsch_gegner_ab.js — B7-Entscheidungsgrundlage (05 §2.1):
// Morsch als Gegner-Mechanik, Option A (eingehend-Multiplikator, decayt, Cap 4)
// gegen Option B (Kraft-Self-Buff, additiv, permanent) am Region-1-Elite-Kampf.
// Gemessen wird derselbe Kampf mit identischer Politik über viele Seeds:
//   Basis  — Elite ohne Zusatz-Mechanik (Referenz)
//   A      — Elite legt je Gegnerzug Morsch 1 auf den Hüter (eingehendMult greift)
//   B      — Elite bufft sich je Gegnerzug Kraft +1 (ohne Decay)
// Aufruf: node sim/morsch_gegner_ab.js  (SIM_N steuert die Stichprobe)

import { RNG } from '../rng.js';
import { legeStatusAuf } from '../status.js';
import {
  starteRun,
  starteKampf,
  beginneZug,
  platziere,
  loeseZugAuf,
  fuehreGegnerzugAus,
} from '../kampf.js';

const N = Number(process.env.SIM_N ?? 5000);

// Schlichte, für alle Varianten identische Politik: alle bezahlbaren Würfel
// spielen, keine Rerolls (hält Übermut/Tischsturz aus der Messung heraus).
function spieleZug(run, kampf, rng) {
  for (const id of [...kampf.hand]) {
    if (kampf.atem <= 0) break;
    platziere(run, kampf, id);
  }
  loeseZugAuf(run, kampf, rng);
}

function simuliereEliteKampf(variante, seed) {
  const rng = new RNG(seed);
  const run = starteRun('eichwart', rng);
  const kampf = starteKampf(run, rng, 'elite'); // Dornalter, Region-1-Elite
  const hpStart = run.hp;
  let zuege = 0;
  let maxTreffer = 0;

  while ((kampf.phase === 'zug' || kampf.phase === 'gegnerzug') && zuege < 60) {
    if (kampf.phase === 'zug') {
      zuege += 1;
      beginneZug(run, kampf, rng);
      if (kampf.phase !== 'zug') break; // DoT-Tod
      spieleZug(run, kampf, rng);
    } else {
      // Varianten-Mechanik VOR der Gegner-Handlung (wirkt ab diesem Angriff):
      if (variante === 'A') legeStatusAuf(kampf.spielerStatus, 'morsch', 1);
      if (variante === 'B') kampf.gegner.status.kraft += 1;
      const ergebnis = fuehreGegnerzugAus(run, kampf, rng);
      if (ergebnis) maxTreffer = Math.max(maxTreffer, ergebnis.erlitten);
    }
  }
  return { sieg: kampf.phase === 'sieg', hpVerlust: hpStart - run.hp, zuege, maxTreffer };
}

function messe(variante) {
  let siege = 0;
  let hpVerlustSumme = 0;
  let zuegeSumme = 0;
  let maxTrefferSumme = 0;
  for (let i = 0; i < N; i += 1) {
    const r = simuliereEliteKampf(variante, 40000 + i);
    if (r.sieg) {
      siege += 1;
      hpVerlustSumme += r.hpVerlust;
    }
    zuegeSumme += r.zuege;
    maxTrefferSumme += r.maxTreffer;
  }
  return {
    siegrate: (100 * siege) / N,
    oHpVerlust: siege > 0 ? hpVerlustSumme / siege : NaN,
    oZuege: zuegeSumme / N,
    oMaxTreffer: maxTrefferSumme / N,
  };
}

console.log(`Würfelhain — B7: Morsch-als-Gegner A/B (Elite Dornalter, n=${N}/Variante)\n`);
console.log('Variante            | Siegrate | Ø HP-Verlust (Sieg) | Ø Züge | Ø härtester Treffer');
console.log('--------------------|----------|---------------------|--------|--------------------');
for (const [name, variante] of [['Basis (ohne)', 'basis'], ['A: Morsch eingehend', 'A'], ['B: Kraft-Buff', 'B']]) {
  const m = messe(variante);
  console.log(
    `${name.padEnd(20)}| ${m.siegrate.toFixed(1).padStart(7)}% | ${m.oHpVerlust.toFixed(1).padStart(19)} | ${m.oZuege
      .toFixed(2)
      .padStart(6)} | ${m.oMaxTreffer.toFixed(1).padStart(19)}`
  );
}
console.log(
  '\nLesart: A ist selbstbremsend (Decay −1/Runde, Cap 4 → Druck pendelt sich ein),\nB ist eine additive Uhr (jeder Zug hebt den Grundschaden dauerhaft — Kampflänge wird zur Niederlagen-Spirale).'
);
