// sim/reifegrade.js — C4: Ziel-Siegraten je Reifegrad (03 §13) mit der
// Standard-Politik ("greedy-vernünftig") über komplette Region-1-Karten-Runs.
// Zielkurve [PROVISORISCH]: 0 → 65–70 % · 3 → ~55 % · 6 → ~45 % · 9 → ~35 % ·
// 10 → 25–30 %. Reine Messung; die Mod-Werte (reifegrad.js) sind die Stellschrauben.
// Aufruf: node sim/reifegrade.js  (SIM_N steuert Runs je Stufe)

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
} from '../kampf.js';
import { wendeBelohnungAn } from '../belohnung.js';
import { kaufeGravur, rasteLagerfeuer, waehleEventOption, zieheEvent, erstelleMarktAngebot } from '../knoten.js';

const N = Number(process.env.SIM_N ?? 2000);
const KNOTEN_PRAEFERENZ = ['kampf', 'schmiede', 'markt', 'event', 'elite', 'lagerfeuer', 'boss'];

function top3Summe(run, kampf) {
  return kampf.hand
    .filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden')
    .map((id) => kampf.wuerfe[id].wert)
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((s, x) => s + x, 0);
}

function spieleZug(run, kampf, rng) {
  let schutz = 0;
  while (top3Summe(run, kampf) < 14 && schutz < 30) {
    schutz += 1;
    const kosten = rerollKosten(kampf.rerollsDiesenZug + 1, {});
    if (kampf.uebermut + kosten > 3) break; // Standard: moderates Übermut-Budget
    const { tischsturz } = rerolle(run, kampf, rng);
    if (tischsturz) return;
  }
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

function simuliereRun(reifegrad, rng) {
  const run = starteRun('eichwart', rng, { reifegrad, maxRegion: 1 });
  let schutz = 0;
  while (!run.abgeschlossen && !run.verloren && schutz < 30) {
    schutz += 1;
    const optionen = verfuegbareKnoten(run);
    const wahl = KNOTEN_PRAEFERENZ.map((typ) => optionen.find((k) => k.typ === typ)).find(Boolean) ?? optionen[0];
    const knoten = betreteKnoten(run, wahl.id);
    if (['kampf', 'elite', 'boss'].includes(knoten.typ)) {
      const kampf = starteKampf(run, rng, knoten.typ);
      let kschutz = 0;
      while ((kampf.phase === 'zug' || kampf.phase === 'gegnerzug') && kschutz < 200) {
        kschutz += 1;
        if (kampf.phase === 'zug') {
          beginneZug(run, kampf, rng);
          if (kampf.phase === 'zug') spieleZug(run, kampf, rng);
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
    } else if (knoten.typ === 'event') {
      const event = zieheEvent(rng);
      const index = event.optionen.findIndex((o) => o.effekt.muenzen);
      waehleEventOption(run, event, Math.max(0, index), rng);
    } else if (knoten.typ === 'lagerfeuer') {
      rasteLagerfeuer(run, 'heilen');
    }
  }
  return run.abgeschlossen;
}

const ZIEL = { 0: '65–70', 3: '~55', 6: '~45', 9: '~35', 10: '25–30' };

console.log(`Würfelhain — Reifegrad-Kurve (Standard-Politik, n=${N}/Stufe)\n`);
console.log('Stufe | Siegrate | Ziel (03 §13)');
console.log('------|----------|--------------');
for (let stufe = 0; stufe <= 10; stufe += 1) {
  const rng = new RNG(20260707 + stufe);
  let siege = 0;
  for (let i = 0; i < N; i += 1) if (simuliereRun(stufe, rng)) siege += 1;
  const rate = (100 * siege) / N;
  console.log(`${String(stufe).padStart(5)} | ${rate.toFixed(1).padStart(7)}% | ${ZIEL[stufe] ?? ''}`);
}
console.log('\nHinweis: Stufe 8 (Gegner-Status-Zuschlag) ist in Region 1 wirkungslos (Gegner legen noch keinen Status) — Kurve dort flacher als final.');
