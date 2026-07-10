// sim/meta_loop.js — Meta-Progressions-Messung (E-Verbesserung 4, 2026-07-09):
// Wie viele Runs braucht ein Profil bis zu den Stammbaum-/Setzling-Unlocks?
// Nutzt die echten meta.js-Funktionen; Siegraten aus der Tor-3-Voll-Run-Kurve
// (sim/vollrun.js). Enden-Verteilung wie gemessen: Stiller Hain kanonisch,
// Frühling 0 % (Politik-Artefakt — Rodbauer hängt damit an Reifegrad ≥ 3).
// Aufruf: node sim/meta_loop.js  (SIM_N Profile)

import { RNG } from '../rng.js';
import {
  leeresMeta,
  verdieneJahresringe,
  verdieneSamen,
  STAMMBAUM_KNOTEN,
  SETZLINGE,
  kaufeStammbaumKnoten,
  pflanzeSetzling,
  hatStammbaumKnoten,
  hatSetzling,
} from '../meta.js';
import { merkeEnde } from '../enden.js';

const N = Number(process.env.SIM_N ?? 4000);

// Gemessene Voll-Run-Siegraten je Reifegrad (Tor 3, n=500/Stufe), interpoliert.
const SIEGRATE = { 0: 0.676, 1: 0.672, 2: 0.682, 3: 0.64, 4: 0.6, 5: 0.575, 6: 0.546, 7: 0.46, 8: 0.376, 9: 0.3, 10: 0.252 };

// Zwei Spielweisen:
// - bleibt:   spielt immer Reifegrad 0 (Komfort-Spieler).
// - klettert: spielt immer die höchste freie Stufe, bis Reifegrad 3 erreicht
//             ist (der Rodbauer-Schlüssel), danach zurück auf 0.
const POLITIKEN = ['bleibt', 'klettert'];

const STAMMBAUM_REIHENFOLGE = ['klasse_dorfschamane', 'klasse_gloeckner', 'klasse_schleiferin', 'klasse_rodbauer'];
const SETZLING_REIHENFOLGE = ['tau_wurzel', 'mut_trieb', 'tiefwurzel', 'fruehjahrs_knospe'];

function simuliereProfil(politik, rng, maxRuns = 120) {
  const meta = leeresMeta();
  const wann = {}; // unlock -> Run-Nummer
  for (let runNr = 1; runNr <= maxRuns; runNr += 1) {
    const reifegrad = politik === 'klettert' ? Math.min(meta.maxReifegrad ?? 0, 3) : 0;
    const sieg = rng.naechsteZahl() < (SIEGRATE[reifegrad] ?? 0.5);
    // Niederlagen zählen praktisch immer ≥ 3 Kämpfe (Tode ab R3 dominieren, Tor 3).
    verdieneJahresringe(meta, { sieg, kaempfe: sieg ? 12 : 5, reifegrad });
    if (sieg) {
      merkeEnde(meta, 'stiller_hain');
      verdieneSamen(meta, 'stiller_hain');
    }
    // Greedy kaufen, sobald bezahlbar (Kauf-Reihenfolge = Kostenaufsteigend).
    for (const id of STAMMBAUM_REIHENFOLGE) {
      if (!hatStammbaumKnoten(meta, id) && kaufeStammbaumKnoten(meta, id, { reifegrad: meta.maxReifegrad }).ok) {
        wann[id] = runNr;
      }
    }
    for (const id of SETZLING_REIHENFOLGE) {
      if (!hatSetzling(meta, id) && pflanzeSetzling(meta, id).ok) {
        wann[`setzling_${id}`] = runNr;
      }
    }
  }
  return wann;
}

console.log(`Würfelhain — META-PROGRESSION (n=${N} Profile, Siegraten aus Tor 3)\n`);
for (const politik of POLITIKEN) {
  const rng = new RNG(20260709 + (politik === 'klettert' ? 1 : 0));
  const summen = {}; const erreicht = {};
  for (let i = 0; i < N; i += 1) {
    const wann = simuliereProfil(politik, rng);
    for (const [k, v] of Object.entries(wann)) {
      summen[k] = (summen[k] ?? 0) + v;
      erreicht[k] = (erreicht[k] ?? 0) + 1;
    }
  }
  console.log(`Politik "${politik}":`);
  const zeile = (label, k) => {
    const q = erreicht[k] ?? 0;
    console.log(
      `  ${label.padEnd(26)} Ø Run ${q ? (summen[k] / q).toFixed(1).padStart(5) : '    —'}  (erreicht: ${((100 * q) / N).toFixed(0)} %)`
    );
  };
  zeile('Dorfschamane (3🪵)', 'klasse_dorfschamane');
  zeile('Glöckner (5🪵)', 'klasse_gloeckner');
  zeile('Schleiferin (8🪵)', 'klasse_schleiferin');
  zeile('Rodbauer (12🪵 + Bed.)', 'klasse_rodbauer');
  zeile('Tau-Wurzel (1🌱)', 'setzling_tau_wurzel');
  zeile('Mut-Trieb (1🌱)', 'setzling_mut_trieb');
  zeile('Tiefwurzel (2🌱)', 'setzling_tiefwurzel');
  zeile('Frühjahrs-Knospe (3🌱)', 'setzling_fruehjahrs_knospe');
  console.log('');
}
console.log('Lesart: "erreicht %" < 100 heißt: innerhalb von 120 Runs nicht freigeschaltet.');
console.log('Rodbauer verlangt Frühling-Ende ODER Reifegrad ≥ 3 — Frühling fällt in der Sim');
console.log('nie (Politik spielt keine Boss-Befriedung), der Weg führt also über das Klettern.');
