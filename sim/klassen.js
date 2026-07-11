// sim/klassen.js — C7: Klassen-Balance-Sim (06 §8).
// Messung A — Roh-Korridor: Ø Schaden/Zug je Klasse mit Start-Arsenal gegen
//   einen Block-losen Dummy (Ziel ~15–17; Glöckner darunter/darüber je Match,
//   Rodbauer bewusst ~19,5 über Decke).
// Messung B — Region-1-Runs: Siegrate/End-Schreck/Trösten/Frühling-Quote je
//   Klasse unter Standard- und Pflege-Politik (Rodbauer-Überlebbarkeit,
//   Dorfschamane vs. Frühling-Trivialisierung — 01 §5-Fix prüfen).
// Aufruf: node sim/klassen.js  (SIM_N steuert Runs je Zelle)

import { RNG } from '../rng.js';
import { schreck, rerollKosten } from '../push.js';
import { KLASSEN } from '../data.js';
import { bestimmeEnde } from '../enden.js';
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

const N = Number(process.env.SIM_N ?? 1500);
const KLASSEN_IDS = Object.keys(KLASSEN);

// --- Platzierung: Standard = höchste Schaden-Würfe; Glöckner = größte wertgleiche Gruppe ---

function platziereSchaden(run, kampf) {
  const schadenIds = kampf.hand.filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden');
  let reihenfolge;
  if (run.klasse === 'gloeckner') {
    const gruppen = new Map();
    for (const id of schadenIds) {
      const wert = kampf.wuerfe[id].wert;
      gruppen.set(wert, [...(gruppen.get(wert) ?? []), id]);
    }
    const beste =
      [...gruppen.values()].sort((a, b) => b.length - a.length || kampf.wuerfe[b[0]].wert - kampf.wuerfe[a[0]].wert)[0] ?? [];
    reihenfolge = [...beste, ...schadenIds.filter((id) => !beste.includes(id)).sort((a, b) => kampf.wuerfe[b].wert - kampf.wuerfe[a].wert)];
  } else {
    reihenfolge = [...schadenIds].sort((a, b) => kampf.wuerfe[b].wert - kampf.wuerfe[a].wert);
  }
  for (const id of reihenfolge) {
    if (kampf.atem <= 0) break;
    platziere(run, kampf, id);
  }
}

// --- Messung A: Roh-Korridor gegen Dummy ------------------------------------------

function messeKorridor(klasseId, zuege = 4000) {
  const rng = new RNG(30000 + KLASSEN_IDS.indexOf(klasseId));
  let summe = 0;
  let gemessen = 0;
  while (gemessen < zuege) {
    const run = starteRun(klasseId, rng, { maxRegion: 1 });
    const kampf = starteKampf(run, rng);
    kampf.gegner.hp = kampf.gegner.hpMax = 100000; // Dummy
    kampf.gegner.absicht = { typ: 'block', wert: 0, angekuendigt: true }; // greift nie an
    for (let z = 0; z < 12 && gemessen < zuege; z += 1) {
      beginneZug(run, kampf, rng);
      platziereSchaden(run, kampf);
      const pools = loeseZugAuf(run, kampf, rng);
      if (pools) {
        summe += pools.schaden;
        gemessen += 1;
      }
      kampf.phase = 'zug'; // Dummy-Schleife: Gegnerzug überspringen
      kampf.gegner.absicht = { typ: 'block', wert: 0, angekuendigt: true };
    }
  }
  return summe / gemessen;
}

// --- Messung B: Region-1-Runs je Klasse × Politik -----------------------------------

function spieleZug(run, kampf, policy, rng) {
  let schutz = 0;
  while (schutz < 30) {
    schutz += 1;
    const top3 = kampf.hand
      .filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden')
      .map((id) => kampf.wuerfe[id].wert)
      .sort((a, b) => b - a)
      .slice(0, 3)
      .reduce((s, x) => s + x, 0);
    if (top3 >= 14) break;
    if (policy === 'pflege' && kampf.rerollsDiesenZug >= 1) break;
    if (policy === 'standard') {
      const kosten = rerollKosten(kampf.rerollsDiesenZug + 1, {});
      if (kampf.uebermut + kosten > 3) break;
    }
    const { tischsturz } = rerolle(run, kampf, rng);
    if (tischsturz) return;
  }
  platziereSchaden(run, kampf);
  if (kampf.atem > 0 && kampf.gegner.absicht.typ === 'angriff') {
    const rindeIds = kampf.hand
      .filter((id) => run.arsenal.find((w) => w.id === id).typ === 'rinde' && !kampf.reihe.includes(id))
      .sort((a, b) => kampf.wuerfe[b].wert - kampf.wuerfe[a].wert);
    for (const id of rindeIds) {
      if (kampf.atem <= 0) break;
      platziere(run, kampf, id);
    }
  }
  // Rest-Atem in Stütze-Würfel (Dorfschamane-Kit: Sanftholz-Block/Ermutigung —
  // eine Klassen-Politik, die das Kit ignoriert, misst die Klasse nicht fair).
  if (kampf.atem > 0) {
    const stuetzeIds = kampf.hand
      .filter((id) => run.arsenal.find((w) => w.id === id).typ === 'stuetze' && !kampf.reihe.includes(id))
      .sort((a, b) => kampf.wuerfe[b].wert - kampf.wuerfe[a].wert);
    for (const id of stuetzeIds) {
      if (kampf.atem <= 0) break;
      platziere(run, kampf, id);
    }
  }
  loeseZugAuf(run, kampf, rng);
}

function wendeSiegBelohnungAn(run, kampf) {
  const option =
    kampf.belohnung.optionen.find((o) => o.typ === 'gravur') ??
    kampf.belohnung.optionen.find((o) => o.typ === 'blaupause') ??
    kampf.belohnung.optionen[0];
  if (option.typ === 'gravur') {
    const ziel = run.arsenal.find((w) => w.typ === 'schaden' && w.stufen.every((s) => s === 0));
    if (ziel) wendeBelohnungAn(run, option, { wuerfel: ziel, seitenIndex: 0 });
  } else if (option.typ === 'blaupause') {
    const ziel = [...run.arsenal].sort(
      (a, b) => a.seiten.reduce((s, x) => s + x.wert, 0) - b.seiten.reduce((s, x) => s + x.wert, 0)
    )[0];
    wendeBelohnungAn(run, option, { wuerfel: ziel });
  } else {
    wendeBelohnungAn(run, option);
  }
}

const PRAEFERENZ = {
  pflege: ['event', 'markt', 'kampf', 'schmiede', 'lagerfeuer', 'elite', 'boss'],
  standard: ['kampf', 'schmiede', 'markt', 'event', 'elite', 'lagerfeuer', 'boss'],
};

function simuliereRun(klasseId, policy, rng) {
  const run = starteRun(klasseId, rng, { maxRegion: 1 });
  let schutz = 0;
  while (!run.abgeschlossen && !run.verloren && schutz < 30) {
    schutz += 1;
    const optionen = verfuegbareKnoten(run);
    const wahl = PRAEFERENZ[policy].map((typ) => optionen.find((k) => k.typ === typ)).find(Boolean) ?? optionen[0];
    const knoten = betreteKnoten(run, wahl.id);
    if (['kampf', 'elite', 'boss'].includes(knoten.typ)) {
      const kampf = starteKampf(run, rng, knoten.typ);
      let kschutz = 0;
      while ((kampf.phase === 'zug' || kampf.phase === 'gegnerzug') && kschutz < 200) {
        kschutz += 1;
        if (kampf.phase === 'zug') {
          beginneZug(run, kampf, rng);
          if (kampf.phase === 'zug') spieleZug(run, kampf, policy, rng);
        } else {
          fuehreGegnerzugAus(run, kampf, rng);
        }
      }
      if (kampf.phase === 'sieg') wendeSiegBelohnungAn(run, kampf);
    } else if (knoten.typ === 'schmiede') {
      const ziel = run.arsenal.find((w) => w.typ === 'schaden');
      let kauf = kaufeGravur(run, 'wucht', ziel.id, 0);
      while (kauf.ok) kauf = kaufeGravur(run, 'wucht', ziel.id, 0);
    } else if (knoten.typ === 'markt') {
      erstelleMarktAngebot(rng, run);
      if (policy === 'pflege') {
        let ziel = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
        while (schreck(ziel.gemuet) > 0 && troesteDienst(run, ziel.id).ok) {
          ziel = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
        }
      }
    } else if (knoten.typ === 'event') {
      const event = zieheEvent(rng, run.region);
      const index = policy === 'pflege'
        ? event.optionen.findIndex((o) => o.effekt.troesten || o.effekt.tau)
        : event.optionen.findIndex((o) => o.effekt.muenzen);
      waehleEventOption(run, event, Math.max(0, index), rng);
    } else if (knoten.typ === 'lagerfeuer') {
      const angst = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
      if (policy === 'pflege' && schreck(angst.gemuet) > 0 && run.hp > run.hpMax * 0.5) {
        rasteLagerfeuer(run, 'troesten', angst.id);
      } else {
        rasteLagerfeuer(run, 'heilen');
      }
    }
  }
  return run;
}

function messeRuns(klasseId, policy) {
  const rng = new RNG(40000 + 100 * KLASSEN_IDS.indexOf(klasseId) + (policy === 'pflege' ? 1 : 0));
  let siege = 0;
  let schreckSumme = 0;
  let troestenSumme = 0;
  let fruehling = 0;
  for (let i = 0; i < N; i += 1) {
    const run = simuliereRun(klasseId, policy, rng);
    if (run.abgeschlossen) {
      siege += 1;
      if (bestimmeEnde(run).id === 'fruehling') fruehling += 1;
    }
    schreckSumme += arsenalSchreckSumme(run);
    troestenSumme += run.troestenZahl;
  }
  return {
    siegrate: (100 * siege) / N,
    schreck: schreckSumme / N,
    troesten: troestenSumme / N,
    fruehlingQuote: siege > 0 ? (100 * fruehling) / siege : 0,
  };
}

// --- Ausgabe -------------------------------------------------------------------

console.log(`Würfelhain — C7 Klassen-Balance (Korridor: 4000 Züge/Klasse · Runs: n=${N}/Zelle)\n`);
console.log('Messung A — Roh-Korridor (Ziel 06 §8):');
console.log('Klasse       | Ø Schaden/Zug | Soll');
console.log('-------------|----------------|-----');
const SOLL = { eichwart: '16,5 (Anker)', dorfschamane: '16,5 bei Gemüt ≥ 0', gloeckner: '11,5–19 je Match', schleiferin: '16', rodbauer: '~19,5 (über Decke)' };
for (const id of KLASSEN_IDS) {
  console.log(`${id.padEnd(13)}| ${messeKorridor(id).toFixed(1).padStart(14)} | ${SOLL[id]}`);
}

console.log('\nMessung B — Region-1-Runs (Siegrate / Ø-Schreck / Ø-Trösten / Frühling-Quote unter Siegen):');
console.log('Klasse       | Politik  | Siegrate | Ø-Schreck | Ø-Trösten | Frühling');
console.log('-------------|----------|----------|-----------|-----------|---------');
for (const id of KLASSEN_IDS) {
  for (const policy of ['standard', 'pflege']) {
    const m = messeRuns(id, policy);
    console.log(
      `${id.padEnd(13)}| ${policy.padEnd(9)}| ${m.siegrate.toFixed(1).padStart(7)}% | ${m.schreck.toFixed(1).padStart(9)} | ${m.troesten.toFixed(1).padStart(9)} | ${m.fruehlingQuote.toFixed(1).padStart(7)}%`
    );
  }
}
console.log('\nPrüfsteine: Rodbauer-Standard viable (>~40 %)? · Dorfschamane-Frühling nicht trivial (<~50 % unter Pflege)? · kein Klassen-Ausreißer nach oben.');
