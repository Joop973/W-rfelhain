// sim/vollrun.js — BALANCE-TOR 3 (D8): Voll-Run-Monte-Carlo über alle 6 Regionen
// gegen die Zielkurve 03 §13 (Reifegrad 0: 65–70 % GESAMT-Siegrate).
// Politik "Voll-Standard": greedy-vernünftig MIT Deckbau — kauft Würfel am
// Markt, graviert breit (Wucht + Schärfe), heilt konsequent, tröstet bei
// Schreck-Druck. Misst Überlebensrate je Region (wo stirbt der Run?).
// SIM_POLITIK=gier: rerollt bis kurz vor den Kipp-Punkt, tröstet NIE —
// prüft das Tor-3-Kriterium "Gier darf nie dominieren" auf jeder Stufe.
// Aufruf: node sim/vollrun.js  (SIM_N Runs, SIM_REIFEGRAD Stufe, SIM_POLITIK)

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
import { bestimmeEnde } from '../enden.js';
import { wendeBelohnungAn } from '../belohnung.js';
import {
  kaufeGravur,
  kaufeWuerfel,
  troesteDienst,
  rasteLagerfeuer,
  waehleEventOption,
  zieheEvent,
  erstelleMarktAngebot,
} from '../knoten.js';

const N = Number(process.env.SIM_N ?? 500);
const REIFEGRAD = Number(process.env.SIM_REIFEGRAD ?? 0);
const POLITIK = process.env.SIM_POLITIK ?? 'standard'; // standard | gier
const PRAEFERENZ = ['kampf', 'schmiede', 'markt', 'lagerfeuer', 'event', 'elite', 'boss'];

function spieleZug(run, kampf, rng) {
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
    // Standard adaptiv: bei Schreck-Druck (Kristallisations-Spirale) keine
    // bezahlten Rerolls mehr — die Doppelstrafe der Gier ist die Lektion des
    // Spiels. Gier ignoriert das und rerollt bis kurz vor den Kipp-Punkt.
    const budget = POLITIK === 'gier' ? KIPP_PUNKT : arsenalSchreckSumme(run) > 12 ? 0 : 3;
    const kosten = rerollKosten(kampf.rerollsDiesenZug + 1, {
      freilauf: kampf.spielerStatus.freilauf,
      klemme: kampf.spielerStatus.klemme,
    });
    if (kampf.uebermut + kosten > budget) break;
    const { tischsturz } = rerolle(run, kampf, rng);
    if (tischsturz) return;
  }
  const nachWert = (a, b) => kampf.wuerfe[b].wert - kampf.wuerfe[a].wert;
  for (const id of kampf.hand.filter((id) => run.arsenal.find((w) => w.id === id).typ === 'schaden').sort(nachWert)) {
    if (kampf.atem <= 0) break;
    platziere(run, kampf, id);
  }
  if (kampf.atem > 0 && kampf.gegner.absicht.typ === 'angriff') {
    for (const id of kampf.hand
      .filter((id) => ['rinde', 'stuetze'].includes(run.arsenal.find((w) => w.id === id).typ) && !kampf.reihe.includes(id))
      .sort(nachWert)) {
      if (kampf.atem <= 0) break;
      platziere(run, kampf, id);
    }
  }
  loeseZugAuf(run, kampf, rng);
}

// Deckbau-Belohnung: Gravur auf die schwächste Seite des schwächsten Schaden-
// Würfels (breite Streuung statt Ein-Würfel-Fokus).
function wendeSiegBelohnungAn(run, kampf) {
  if (!kampf.belohnung) return; // Endboss: das Ende ist die Belohnung
  const optionen = kampf.belohnung.optionen;
  const option =
    optionen.find((o) => o.typ === 'gravur') ??
    optionen.find((o) => o.typ === 'blaupause') ??
    optionen.find((o) => o.typ === 'segen') ??
    optionen[0];
  if (option.typ === 'gravur') {
    const ziel = [...run.arsenal]
      .filter((w) => w.typ === 'schaden' && w.stufen.some((s) => s === 0))
      .sort((a, b) => a.seiten.reduce((s, x) => s + x.wert, 0) - b.seiten.reduce((s, x) => s + x.wert, 0))[0];
    if (ziel) wendeBelohnungAn(run, option, { wuerfel: ziel, seitenIndex: ziel.stufen.findIndex((s) => s === 0) });
  } else if (option.typ === 'blaupause') {
    const ziel = [...run.arsenal]
      .filter((w) => !w.blaupause)
      .sort((a, b) => a.seiten.reduce((s, x) => s + x.wert, 0) - b.seiten.reduce((s, x) => s + x.wert, 0))[0];
    if (ziel) wendeBelohnungAn(run, option, { wuerfel: ziel });
  } else {
    wendeBelohnungAn(run, option);
  }
}

function besucheSchmiede(run) {
  // Erst Wucht auf bis zu 3 Würfeln hochstufen, dann Schärfe streuen.
  let schutz = 0;
  while (schutz < 20) {
    schutz += 1;
    const wuchtZiel = run.arsenal.find(
      (w) => w.typ === 'schaden' && (w.stufen[0] === 0 || (w.seiten[0].gravurId === 'wucht' && w.stufen[0] < 3))
    );
    const kauf = wuchtZiel ? kaufeGravur(run, run.arsenal.filter((w) => w.seiten[0]?.gravurId === 'wucht').length < 3 ? 'wucht' : 'schaerfe', wuchtZiel.id, 0) : { ok: false };
    if (!kauf.ok) break;
  }
}

function besucheMarkt(run, rng) {
  const angebot = erstelleMarktAngebot(rng, run);
  // Arsenal ausbauen Richtung 22–24 (06 §1.1) — kaufe, solange Eicheln reichen.
  for (const w of angebot.wuerfel) {
    if (run.arsenal.length >= 22) break;
    kaufeWuerfel(run, w.vorlageId, w.preisEicheln);
  }
  // Trösten bei Schreck-Druck (Tau erlaubt ~2 Dienste je Region). Gier nie.
  let schutz = 0;
  while (POLITIK !== 'gier' && schutz < 6) {
    schutz += 1;
    const ziel = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
    if (schreck(ziel.gemuet) === 0 || !troesteDienst(run, ziel.id).ok) break;
  }
}

function simuliereVollRun(rng) {
  const run = starteRun('eichwart', rng, { reifegrad: REIFEGRAD });
  let schutz = 0;
  while (!run.abgeschlossen && !run.verloren && schutz < 200) {
    schutz += 1;
    const optionen = verfuegbareKnoten(run);
    const wahl = PRAEFERENZ.map((typ) => optionen.find((k) => k.typ === typ)).find(Boolean) ?? optionen[0];
    const knoten = betreteKnoten(run, wahl.id);
    run.letzterKnotenTyp = knoten.typ; // Diagnose: wo stirbt der Run?
    if (['kampf', 'elite', 'boss'].includes(knoten.typ)) {
      const kampf = starteKampf(run, rng, knoten.typ);
      let ks = 0;
      while ((kampf.phase === 'zug' || kampf.phase === 'gegnerzug') && ks < 200) {
        ks += 1;
        if (kampf.phase === 'zug') {
          beginneZug(run, kampf, rng);
          if (kampf.phase === 'zug') spieleZug(run, kampf, rng);
        } else {
          fuehreGegnerzugAus(run, kampf, rng);
        }
      }
      if (kampf.phase === 'sieg') wendeSiegBelohnungAn(run, kampf);
    } else if (knoten.typ === 'schmiede') {
      besucheSchmiede(run);
    } else if (knoten.typ === 'markt') {
      besucheMarkt(run, rng);
    } else if (knoten.typ === 'event') {
      const event = zieheEvent(rng);
      const index =
        POLITIK === 'gier'
          ? event.optionen.findIndex((o) => o.effekt.muenzen)
          : event.optionen.findIndex((o) => o.effekt.troesten || o.effekt.tau);
      waehleEventOption(run, event, Math.max(0, index), rng);
    } else if (knoten.typ === 'lagerfeuer') {
      const angst = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
      if (POLITIK === 'gier' || run.hp < run.hpMax * 0.7) rasteLagerfeuer(run, 'heilen');
      else if (schreck(angst.gemuet) > 0) rasteLagerfeuer(run, 'troesten', angst.id);
      else rasteLagerfeuer(run, 'heilen');
    }
  }
  return run;
}

const rng = new RNG(20260709 + REIFEGRAD);
let siege = 0;
const todeJeRegion = [0, 0, 0, 0, 0, 0, 0]; // Index = Region
const todeJeTyp = {};
let troestenSumme = 0;
let schreckSumme = 0;
const enden = { fruehling: 0, stiller_hain: 0, hohles_erbe: 0 };
for (let i = 0; i < N; i += 1) {
  const run = simuliereVollRun(rng);
  if (run.abgeschlossen) {
    siege += 1;
    enden[bestimmeEnde(run).id] += 1;
  } else {
    todeJeRegion[run.region] += 1;
    todeJeTyp[run.letzterKnotenTyp] = (todeJeTyp[run.letzterKnotenTyp] ?? 0) + 1;
  }
  troestenSumme += run.troestenZahl;
  schreckSumme += arsenalSchreckSumme(run);
}

console.log(`Würfelhain — VOLL-RUN (6 Regionen, Reifegrad ${REIFEGRAD}, Politik ${POLITIK}, n=${N})\n`);
console.log(`Gesamt-Siegrate: ${((100 * siege) / N).toFixed(1)} %  (Ziel Reifegrad 0: 65–70 %)`);
console.log(`Tode je Region:  ${todeJeRegion.slice(1).map((t, i) => `R${i + 1}:${((100 * t) / N).toFixed(0)}%`).join(' · ')}`);
console.log(`Ø Trösten ${(troestenSumme / N).toFixed(1)} · Ø End-Schreck ${(schreckSumme / N).toFixed(1)}`);
console.log(`Enden unter Siegen: Frühling ${enden.fruehling} · Stiller Hain ${enden.stiller_hain} · Hohles Erbe ${enden.hohles_erbe}`);
console.log('Tode je Knotentyp:', JSON.stringify(todeJeTyp));
