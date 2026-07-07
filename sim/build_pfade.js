// sim/build_pfade.js — BALANCE-TOR 2 (Etappe B8): Sim-Suite über vier gezielte
// Build-Pfade auf dem echten Spielcode (Karte → Knoten → Boss, Region 1).
//
// Build-Pfade (03 §14 / 10 B8):
// - wucht:       Mult-Seiten (Wucht-Gravur, Stufen bis Cap 3) auf Schaden-Würfeln
// - status:      DoT/Debuff (Gift/Zunder/Markhärtung, Giftranke/Schwelbrand)
// - gleichklang: gleiche effektive Werte (Gleichmaß-Blaupause, Schärfe), Platzierung
//                wählt die größte wertgleiche Gruppe statt der höchsten Würfe
// - pflege:      Trösten/Labung (Quell/Sanftholz, Beruhigungs-/Ermutigungs-Gravur),
//                nur Gratis-Rerolls
//
// Kriterien: alle viable (Siegrate deutlich über Gier-Niveau ~20 %), KEINE Lawine
// (03 §14: p99/Median-Zugschaden bleibt flach, kein Build reißt nach oben aus),
// Gier-vs-Pflege-Tor hält weiter (separat: sim/region1_run.js).
//
// Aufruf: node sim/build_pfade.js  (SIM_N steuert Runs je Build)

import { RNG } from '../rng.js';
import { schreck, rerollKosten } from '../push.js';
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

const N = Number(process.env.SIM_N ?? 2000);

const BUILDS = {
  wucht: {
    label: 'Wucht (Mult)',
    gravuren: ['wucht'],
    blaupausen: ['hartholz', 'splitterklinge'],
    schmiede: 'wucht',
    rerollBudget: 3,
  },
  status: {
    label: 'Status (DoT)',
    gravuren: ['gift', 'zunder', 'markhaertung', 'faeulnis_hauch'],
    blaupausen: ['giftranke', 'schwelbrand', 'morschmacher'],
    schmiede: 'gift',
    rerollBudget: 3,
  },
  gleichklang: {
    label: 'Gleichklang',
    gravuren: ['schaerfe'],
    blaupausen: ['gleichmass', 'hartholz'],
    schmiede: 'schaerfe',
    rerollBudget: 3,
  },
  pflege: {
    label: 'Pflege (Labung)',
    gravuren: ['ermutigungs_gravur', 'beruhigungs_gravur'],
    blaupausen: ['quell', 'sanftholz', 'eichenwall'],
    schmiede: 'ermutigungs_gravur',
    rerollBudget: 0, // nur Gratis-Reroll
  },
};

const KNOTEN_PRAEFERENZ = {
  pflege: ['event', 'markt', 'kampf', 'schmiede', 'lagerfeuer', 'elite', 'boss'],
  sonst: ['kampf', 'schmiede', 'markt', 'event', 'elite', 'lagerfeuer', 'boss'],
};

// --- Zug-Logik -----------------------------------------------------------------

function top3Summe(run, kampf) {
  return kampf.hand
    .filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden')
    .map((id) => kampf.wuerfe[id].wert)
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((s, x) => s + x, 0);
}

// Gleichklang-Platzierung: größte wertgleiche Gruppe der Schaden-Würfe zuerst.
function platziereGleichklang(run, kampf) {
  const schadenIds = kampf.hand.filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden');
  const gruppen = new Map();
  for (const id of schadenIds) {
    const wert = kampf.wuerfe[id].wert;
    gruppen.set(wert, [...(gruppen.get(wert) ?? []), id]);
  }
  const beste = [...gruppen.values()].sort((a, b) => b.length - a.length || kampf.wuerfe[b[0]].wert - kampf.wuerfe[a[0]].wert)[0] ?? [];
  const rest = schadenIds.filter((id) => !beste.includes(id)).sort((a, b) => kampf.wuerfe[b].wert - kampf.wuerfe[a].wert);
  for (const id of [...beste, ...rest]) {
    if (kampf.atem <= 0) break;
    platziere(run, kampf, id);
  }
}

function spieleZug(run, kampf, buildId, rng) {
  const build = BUILDS[buildId];
  let schutz = 0;
  while (top3Summe(run, kampf) < 14 && schutz < 30) {
    schutz += 1;
    if (build.rerollBudget === 0 && kampf.rerollsDiesenZug >= 1) break;
    if (build.rerollBudget > 0) {
      const kosten = rerollKosten(kampf.rerollsDiesenZug + 1, {});
      if (kampf.uebermut + kosten > build.rerollBudget) break;
    }
    const { tischsturz } = rerolle(run, kampf, rng);
    if (tischsturz) return null;
  }

  if (buildId === 'gleichklang') {
    platziereGleichklang(run, kampf);
  } else {
    // Schaden zuerst (Status-Build spielt auch Fäule/Brand/Stütze-Würfel mit).
    const spielbar = kampf.hand
      .filter((id) => {
        const typ = run.arsenal.find((w) => w.id === id).typ;
        if (buildId === 'status') return ['schaden', 'faeule', 'brand'].includes(typ);
        if (buildId === 'pflege') return ['schaden', 'stuetze'].includes(typ);
        return typ === 'schaden';
      })
      .sort((a, b) => kampf.wuerfe[b].wert - kampf.wuerfe[a].wert);
    for (const id of spielbar) {
      if (kampf.atem <= 0) break;
      platziere(run, kampf, id);
    }
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
  return loeseZugAuf(run, kampf, rng);
}

// --- Belohnungs-/Knoten-Politik je Build ------------------------------------------

function wendeSiegBelohnungAn(run, kampf, buildId) {
  const build = BUILDS[buildId];
  const optionen = kampf.belohnung.optionen;
  const option =
    optionen.find((o) => o.typ === 'gravur' && build.gravuren.includes(o.gravurId)) ??
    optionen.find((o) => o.typ === 'blaupause' && build.blaupausen.includes(o.blaupauseId)) ??
    optionen.find((o) => o.typ === 'gravur') ??
    optionen.find((o) => o.typ === 'segen') ??
    optionen[0];

  if (option.typ === 'gravur') {
    const bevorzugt = build.gravuren.includes(option.gravurId);
    // Bevorzugte Gravuren stufen bestehende Seiten hoch (Cap 3), sonst schwächste
    // Seite eines ungravierten Schaden-Würfels.
    const stufbar = bevorzugt
      ? run.arsenal.find((w) => w.typ === 'schaden' && w.seiten.some((s, i) => s.gravurId === option.gravurId && w.stufen[i] < 3))
      : null;
    const ziel = stufbar ?? run.arsenal.find((w) => w.typ === 'schaden' && w.stufen.every((s) => s === 0));
    if (ziel) {
      const seitenIndex = stufbar ? ziel.seiten.findIndex((s, i) => s.gravurId === option.gravurId && ziel.stufen[i] < 3) : 0;
      wendeBelohnungAn(run, option, { wuerfel: ziel, seitenIndex });
    }
  } else if (option.typ === 'blaupause') {
    const ziel = [...run.arsenal]
      .filter((w) => !w.blaupause)
      .sort((a, b) => a.seiten.reduce((s, x) => s + x.wert, 0) - b.seiten.reduce((s, x) => s + x.wert, 0))[0];
    if (ziel) wendeBelohnungAn(run, option, { wuerfel: ziel });
  } else {
    wendeBelohnungAn(run, option);
  }
}

function kaempfe(run, buildId, knotenTyp, rng, statistik) {
  const kampf = starteKampf(run, rng, knotenTyp);
  let schutz = 0;
  while ((kampf.phase === 'zug' || kampf.phase === 'gegnerzug') && schutz < 200) {
    schutz += 1;
    if (kampf.phase === 'zug') {
      beginneZug(run, kampf, rng);
      if (kampf.phase !== 'zug') break;
      const pools = spieleZug(run, kampf, buildId, rng);
      if (pools) statistik.zugSchaeden.push(pools.schaden);
    } else {
      fuehreGegnerzugAus(run, kampf, rng);
    }
  }
  if (kampf.phase === 'sieg') wendeSiegBelohnungAn(run, kampf, buildId);
}

function simuliereRun(buildId, rng, statistik) {
  const run = starteRun('eichwart', rng, { maxRegion: 1 });
  let schutz = 0;
  while (!run.abgeschlossen && !run.verloren && schutz < 30) {
    schutz += 1;
    const optionen = verfuegbareKnoten(run);
    const praeferenz = buildId === 'pflege' ? KNOTEN_PRAEFERENZ.pflege : KNOTEN_PRAEFERENZ.sonst;
    const wahl = praeferenz.map((typ) => optionen.find((k) => k.typ === typ)).find(Boolean) ?? optionen[0];
    const knoten = betreteKnoten(run, wahl.id);

    if (['kampf', 'elite', 'boss'].includes(knoten.typ)) {
      kaempfe(run, buildId, knoten.typ, rng, statistik);
    } else if (knoten.typ === 'schmiede') {
      const gravurId = BUILDS[buildId].schmiede;
      const ziel = run.arsenal.find((w) => w.typ === 'schaden');
      let kauf = kaufeGravur(run, gravurId, ziel.id, 0);
      while (kauf.ok) kauf = kaufeGravur(run, gravurId, ziel.id, 0);
    } else if (knoten.typ === 'markt') {
      erstelleMarktAngebot(rng, run);
      if (buildId === 'pflege') {
        let ziel = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
        while (schreck(ziel.gemuet) > 0 && troesteDienst(run, ziel.id).ok) {
          ziel = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
        }
      }
    } else if (knoten.typ === 'event') {
      const event = zieheEvent(rng);
      const index = buildId === 'pflege'
        ? event.optionen.findIndex((o) => o.effekt.troesten || o.effekt.tau)
        : event.optionen.findIndex((o) => o.effekt.muenzen);
      waehleEventOption(run, event, Math.max(0, index), rng);
    } else if (knoten.typ === 'lagerfeuer') {
      const angstWuerfel = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
      if (buildId === 'pflege' && schreck(angstWuerfel.gemuet) > 0 && run.hp > run.hpMax * 0.5) {
        rasteLagerfeuer(run, 'troesten', angstWuerfel.id);
      } else {
        rasteLagerfeuer(run, 'heilen');
      }
    }
  }
  return { sieg: run.abgeschlossen, schreckSumme: arsenalSchreckSumme(run) };
}

// --- Messung -------------------------------------------------------------------

function quantil(sortiert, q) {
  if (sortiert.length === 0) return 0;
  return sortiert[Math.min(sortiert.length - 1, Math.floor(q * sortiert.length))];
}

function messe(buildId) {
  const rng = new RNG(20260706);
  const statistik = { zugSchaeden: [] };
  let siege = 0;
  let schreckSumme = 0;
  for (let i = 0; i < N; i += 1) {
    const e = simuliereRun(buildId, rng, statistik);
    if (e.sieg) siege += 1;
    schreckSumme += e.schreckSumme;
  }
  const sortiert = [...statistik.zugSchaeden].sort((a, b) => a - b);
  const median = quantil(sortiert, 0.5);
  const p99 = quantil(sortiert, 0.99);
  return {
    siegrate: (100 * siege) / N,
    schreck: schreckSumme / N,
    median,
    p99,
    max: sortiert[sortiert.length - 1] ?? 0,
    lawinenFaktor: median > 0 ? p99 / median : 0,
  };
}

console.log(`Würfelhain — BALANCE-TOR 2: Build-Pfade über Region-1-Karten-Runs (n=${N}/Build)\n`);
console.log('Build            | Siegrate | Ø-Schreck | Zug-Schaden Median | p99 | Max | Lawinen-Faktor (p99/Median)');
console.log('-----------------|----------|-----------|--------------------|-----|-----|----------------------------');
const befunde = {};
for (const buildId of Object.keys(BUILDS)) {
  const m = messe(buildId);
  befunde[buildId] = m;
  console.log(
    `${BUILDS[buildId].label.padEnd(17)}| ${m.siegrate.toFixed(1).padStart(7)}% | ${m.schreck.toFixed(1).padStart(9)} | ${String(m.median).padStart(18)} | ${String(m.p99).padStart(3)} | ${String(m.max).padStart(3)} | ${m.lawinenFaktor.toFixed(2).padStart(5)}`
  );
}

const alleViable = Object.values(befunde).every((m) => m.siegrate >= 50);
const keineLawine = Object.values(befunde).every((m) => m.lawinenFaktor <= 6);
console.log(`\nKriterium "alle viable" (Siegrate ≥ 50 %, deutlich über Gier ~20 %): ${alleViable ? 'ERFÜLLT' : 'VERFEHLT'}`);
console.log(`Kriterium "keine Lawine" (p99/Median ≤ 6, 03 §14): ${keineLawine ? 'ERFÜLLT' : 'VERFEHLT'}`);
console.log('Gier-vs-Pflege-Tor: separat prüfen mit `node sim/region1_run.js`.');
