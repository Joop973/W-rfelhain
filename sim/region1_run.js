// sim/region1_run.js — Region-1-Nach-Eichung (Etappe A8): Monte-Carlo über den
// ECHTEN Spielcode (karte/kampf/knoten/belohnung), nicht über einen Nachbau.
// Misst Siegraten dreier Politiken über komplette Karten-Runs (Karte → Knoten →
// Boss) gegen das Reifegrad-0-Zielband 65–70 % (03 §13). Reine Messung.
//
// Politiken:
// - pflege: nur Gratis-Reroll, Lagerfeuer tröstet bei Schreck (sonst heilen),
//   Events/Markt wählen Pflege-Optionen (Trösten/Tau).
// - standard ("greedy-vernünftig", 03 §13): bezahlte Rerolls bis Übermut 3,
//   Lagerfeuer heilt, kauft Wucht an der Schmiede.
// - gier_klug: rerollt aggressiv bis kurz vor den Kipp-Punkt, heilt, ignoriert Pflege.
//
// Sim-Annahmen: Belohnungs-Politik für alle gleich (isoliert die Reroll-/Pflege-
// Achse): Gravur → beste Schaden-Seite ersetzt schwächste Seite, Blaupause →
// schwächster Würfel, Münzen → nehmen.

import { RNG } from '../rng.js';
import { schreck, rerollKosten, KIPP_PUNKT } from '../push.js';
import {
  starteRun,
  starteKampf,
  beginneZug,
  rerolle,
  platziere,
  loeseZugAuf,
  fuehreGegnerzugAus,
  verfuegbareKnoten,
  betreteKnoten,
  arsenalSchreckSumme,
} from '../kampf.js';
import { wendeBelohnungAn } from '../belohnung.js';
import { kaufeGravur, troesteDienst, rasteLagerfeuer, waehleEventOption, zieheEvent, erstelleMarktAngebot } from '../knoten.js';

const GIER_ZIEL_TOP3 = 14;

const KNOTEN_PRAEFERENZ = {
  pflege: ['event', 'markt', 'kampf', 'schmiede', 'lagerfeuer', 'elite', 'boss'],
  standard: ['kampf', 'schmiede', 'markt', 'event', 'elite', 'lagerfeuer', 'boss'],
  gier_klug: ['elite', 'kampf', 'schmiede', 'markt', 'event', 'lagerfeuer', 'boss'],
};

function top3Summe(run, kampf) {
  return kampf.hand
    .filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden')
    .map((id) => kampf.wuerfe[id].wert)
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((s, x) => s + x, 0);
}

function spieleZug(run, kampf, policy, rng) {
  // Reroll-Phase je Politik.
  let schutz = 0;
  while (top3Summe(run, kampf) < GIER_ZIEL_TOP3 && schutz < 30) {
    schutz += 1;
    if (policy === 'pflege' && kampf.rerollsDiesenZug >= 1) break;
    if (policy === 'standard') {
      const kosten = rerollKosten(kampf.rerollsDiesenZug + 1, {});
      if (kampf.uebermut + kosten > 3) break; // vernünftig: moderates Übermut-Budget
    }
    if (policy === 'gier_klug') {
      const kosten = rerollKosten(kampf.rerollsDiesenZug + 1, {});
      if (kampf.uebermut + kosten > KIPP_PUNKT) break; // stoppt vor Tischsturz
    }
    const { tischsturz } = rerolle(run, kampf, rng);
    if (tischsturz) return;
  }

  // Platzieren: höchste Schaden-Würfe, Rest-Atem in Rinde wenn Gegner angreift.
  const schadenIds = kampf.hand
    .filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden')
    .sort((a, b) => kampf.wuerfe[b].wert - kampf.wuerfe[a].wert);
  for (const id of schadenIds) {
    if (kampf.atem <= 0) break;
    platziere(run, kampf, id);
  }
  if (kampf.atem > 0 && kampf.gegner.absicht.typ === 'angriff') {
    const rindeIds = kampf.hand
      .filter((id) => run.arsenal.find((w) => w.id === id).typ === 'rinde' && !kampf.reihe.includes(id))
      .sort((a, b) => kampf.wuerfe[b].wert - kampf.wuerfe[a].wert);
    for (const id of rindeIds) {
      if (kampf.atem <= 0) break;
      platziere(run, kampf, id);
    }
  }
  loeseZugAuf(run, kampf, rng);
}

function wendeSiegBelohnungAn(run, kampf, rng) {
  const option =
    kampf.belohnung.optionen.find((o) => o.typ === 'gravur') ??
    kampf.belohnung.optionen.find((o) => o.typ === 'blaupause') ??
    kampf.belohnung.optionen[0];
  if (option.typ === 'muenzen') {
    wendeBelohnungAn(run, option);
  } else if (option.typ === 'gravur') {
    // Beste Schaden-Seite: schwächste Seite (Index 0) eines ungravierten Schaden-Würfels.
    const ziel = run.arsenal.find((w) => w.typ === 'schaden' && w.stufen.every((s) => s === 0));
    if (ziel) wendeBelohnungAn(run, option, { wuerfel: ziel, seitenIndex: 0 });
  } else {
    // Blaupause auf den schwächsten Würfel (niedrigste Seitensumme).
    const ziel = [...run.arsenal].sort(
      (a, b) => a.seiten.reduce((s, x) => s + x.wert, 0) - b.seiten.reduce((s, x) => s + x.wert, 0)
    )[0];
    wendeBelohnungAn(run, option, { wuerfel: ziel });
  }
}

function kaempfe(run, policy, knotenTyp, rng) {
  const kampf = starteKampf(run, rng, knotenTyp);
  let schutz = 0;
  while ((kampf.phase === 'zug' || kampf.phase === 'gegnerzug') && schutz < 200) {
    schutz += 1;
    if (kampf.phase === 'zug') {
      beginneZug(run, kampf, rng);
      spieleZug(run, kampf, policy, rng);
    } else {
      fuehreGegnerzugAus(run, kampf, rng);
    }
  }
  if (kampf.phase === 'sieg') wendeSiegBelohnungAn(run, kampf, rng);
  return kampf;
}

function simuliereRun(policy, rng) {
  const run = starteRun('eichwart', rng, { maxRegion: 1 });
  let kaempfeGesamt = 0;
  let schutz = 0;

  while (!run.abgeschlossen && !run.verloren && schutz < 30) {
    schutz += 1;
    const optionen = verfuegbareKnoten(run);
    const wahl = KNOTEN_PRAEFERENZ[policy]
      .map((typ) => optionen.find((k) => k.typ === typ))
      .find(Boolean) ?? optionen[0];
    const knoten = betreteKnoten(run, wahl.id);

    if (['kampf', 'elite', 'boss'].includes(knoten.typ)) {
      kaempfe(run, policy, knoten.typ, rng);
      kaempfeGesamt += 1;
    } else if (knoten.typ === 'schmiede') {
      // Wucht auf die schwächste Seite des ersten Schadenswürfels, solange bezahlbar.
      const ziel = run.arsenal.find((w) => w.typ === 'schaden');
      let kauf = kaufeGravur(run, 'wucht', ziel.id, 0);
      while (kauf.ok) kauf = kaufeGravur(run, 'wucht', ziel.id, 0);
    } else if (knoten.typ === 'markt') {
      erstelleMarktAngebot(rng); // Angebot ziehen (RNG-Strom wie im Spiel)
      if (policy === 'pflege') {
        let ziel = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
        while (schreck(ziel.gemuet) > 0 && troesteDienst(run, ziel.id).ok) {
          ziel = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
        }
      }
    } else if (knoten.typ === 'event') {
      const event = zieheEvent(rng);
      const index = policy === 'pflege'
        ? event.optionen.findIndex((o) => o.effekt.troesten || o.effekt.tau)
        : event.optionen.findIndex((o) => o.effekt.muenzen);
      waehleEventOption(run, event, Math.max(0, index), rng);
    } else if (knoten.typ === 'lagerfeuer') {
      const angstWuerfel = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
      if (policy === 'pflege' && schreck(angstWuerfel.gemuet) > 0 && run.hp > run.hpMax * 0.5) {
        rasteLagerfeuer(run, 'troesten', angstWuerfel.id);
      } else {
        rasteLagerfeuer(run, 'heilen');
      }
    }
  }

  return {
    sieg: run.abgeschlossen,
    schreckSumme: arsenalSchreckSumme(run),
    troestenZahl: run.troestenZahl,
    kaempfeGesamt,
    muenzenRest: run.waehrungen.muenzen,
  };
}

function simuliere(policy, n, rng) {
  const summen = { siege: 0, schreck: 0, troesten: 0, kaempfe: 0 };
  for (let i = 0; i < n; i += 1) {
    const e = simuliereRun(policy, rng);
    if (e.sieg) summen.siege += 1;
    summen.schreck += e.schreckSumme;
    summen.troesten += e.troestenZahl;
    summen.kaempfe += e.kaempfeGesamt;
  }
  return {
    siegrate: (summen.siege / n) * 100,
    schreck: summen.schreck / n,
    troesten: summen.troesten / n,
    kaempfe: summen.kaempfe / n,
  };
}

const N = Number(process.env.SIM_N ?? 2000);
const POLICIES = ['pflege', 'standard', 'gier_klug'];
const LABEL = { pflege: 'Pflege', standard: 'Standard', gier_klug: 'Gier (klug)' };

function main() {
  const rng = new RNG(20260704);
  console.log(`Würfelhain — Region-1-Karten-Run (echter Spielcode), n=${N}/Politik\n`);
  console.log('Politik      | Siegrate | Ø-Schreck Σ | Ø-Trösten | Ø-Kämpfe');
  console.log('-------------|----------|--------------|-----------|--------');
  for (const policy of POLICIES) {
    const e = simuliere(policy, N, rng);
    console.log(
      `${LABEL[policy].padEnd(12)} | ${e.siegrate.toFixed(1).padStart(7)}% | ${e.schreck.toFixed(1).padStart(12)} | ${e.troesten.toFixed(1).padStart(9)} | ${e.kaempfe.toFixed(1).padStart(6)}`
    );
  }
  console.log(
    '\nHinweis: Seit Tor 3 (D8) gilt 65–70 % für den VOLL-Run (sim/vollrun.js), nicht mehr' +
      '\nfür Region 1 allein — R1 ist bewusst weich (Standard ~99 %). Hier zählt nur noch' +
      '\ndas Struktur-Kriterium Pflege ≥ Standard ≥ Gier (Welle 1).'
  );
}

main();
