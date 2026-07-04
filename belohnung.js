// belohnung.js — Kampf-Belohnungen: Währungs-Einkommen, 3-Wahl-Ziehung mit
// Blaupause-Pity, Anwendung von Blaupausen/Gravuren aufs Arsenal.
// DOM-frei, reine Daten-Operationen (09 §1). Bezüge: 03 §8/§10, 04 §1.1/§3, 09 §2.5.

import { BLAUPAUSEN, GRAVUREN, SLICE_BLAUPAUSEN, SLICE_GRAVUREN } from './data.js';

export const BLAUPAUSE_PITY_N = 6; // spätestens nach N Belohnungen ohne Blaupause [PROVISORISCH]
export const ELITE_FAKTOR = 1.8; // Elite ≈ 1,8× Normal (07 §2.2) [PROVISORISCH]

const SELTENHEITS_GEWICHT = { haeufig: 6, selten: 3, episch: 1 }; // [PROVISORISCH]
// Typ-Mix je Options-Slot [PROVISORISCH]: Gravur 45 % · Blaupause 35 % · Münzen-Bonus 20 %.
const OPTIONS_MIX = [
  { typ: 'gravur', gewicht: 45 },
  { typ: 'blaupause', gewicht: 35 },
  { typ: 'muenzen', gewicht: 20 },
];

// --- Einkommen (03 §8 gesperrt: Münzen ~14–16/Kampf, Eicheln ~8/Kampf) --------

export function verdieneKampfBelohnung(run, rng, { elite = false } = {}) {
  const faktor = elite ? ELITE_FAKTOR : 1;
  const einkommen = {
    muenzen: Math.round((14 + rng.naechsteZahl() * 2) * faktor),
    eicheln: Math.round(8 * faktor),
  };
  run.waehrungen.muenzen += einkommen.muenzen;
  run.waehrungen.eicheln += einkommen.eicheln;
  return einkommen;
}

// --- Ziehung -------------------------------------------------------------------

function gewichteteWahl(eintraege, rng) {
  const summe = eintraege.reduce((s, e) => s + e.gewicht, 0);
  let rest = rng.naechsteZahl() * summe;
  for (const e of eintraege) {
    rest -= e.gewicht;
    if (rest < 0) return e;
  }
  return eintraege[eintraege.length - 1];
}

function zieheBlaupausenOption(rng) {
  const kandidaten = SLICE_BLAUPAUSEN.map((id) => ({
    id,
    gewicht: SELTENHEITS_GEWICHT[BLAUPAUSEN[id].seltenheit],
  }));
  const { id } = gewichteteWahl(kandidaten, rng);
  return { typ: 'blaupause', blaupauseId: id, nameKey: BLAUPAUSEN[id].nameKey };
}

function zieheGravurOption(rng) {
  const id = SLICE_GRAVUREN[Math.floor(rng.naechsteZahl() * SLICE_GRAVUREN.length)];
  return { typ: 'gravur', gravurId: id, nameKey: GRAVUREN[id].nameKey };
}

function zieheMuenzenOption(rng) {
  return { typ: 'muenzen', betrag: 10 + Math.floor(rng.naechsteZahl() * 5) }; // 10–14 [PROVISORISCH]
}

// 3 Optionen je Belohnungs-Knoten (03 §10). Pity: nach BLAUPAUSE_PITY_N
// Ziehungen ohne angebotene Blaupause ist eine Option garantiert Blaupause.
export function zieheBelohnungsoptionen(run, rng) {
  const optionen = [];
  for (let i = 0; i < 3; i += 1) {
    const { typ } = gewichteteWahl(OPTIONS_MIX, rng);
    if (typ === 'blaupause') optionen.push(zieheBlaupausenOption(rng));
    else if (typ === 'gravur') optionen.push(zieheGravurOption(rng));
    else optionen.push(zieheMuenzenOption(rng));
  }

  const enthaeltBlaupause = optionen.some((o) => o.typ === 'blaupause');
  if (!enthaeltBlaupause && run.belohnungenOhneBlaupause + 1 >= BLAUPAUSE_PITY_N) {
    optionen[0] = zieheBlaupausenOption(rng); // Pity-Garantie
  }

  run.belohnungenOhneBlaupause = optionen.some((o) => o.typ === 'blaupause')
    ? 0
    : run.belohnungenOhneBlaupause + 1;
  return optionen;
}

// Boss-Sonder-Belohnung: garantierte Blaupausen-Wahl (05 §6 Boss 1) —
// 3 verschiedene Blaupausen; Segen-Alternative folgt mit dem Segen-System. [PROVISORISCH]
export function zieheBossBelohnung(run, rng) {
  const pool = [...SLICE_BLAUPAUSEN];
  const optionen = [];
  for (let i = 0; i < 3 && pool.length > 0; i += 1) {
    const kandidaten = pool.map((id) => ({ id, gewicht: SELTENHEITS_GEWICHT[BLAUPAUSEN[id].seltenheit] }));
    const { id } = gewichteteWahl(kandidaten, rng);
    pool.splice(pool.indexOf(id), 1);
    optionen.push({ typ: 'blaupause', blaupauseId: id, nameKey: BLAUPAUSEN[id].nameKey });
  }
  run.belohnungenOhneBlaupause = 0;
  return optionen;
}

// --- Anwendung -------------------------------------------------------------------

// Blaupause überschreibt alle 6 Seiten UND setzt alle Stufen zurück (04 §1.1/09 §2.2, gesperrt).
export function wendeBlaupauseAn(wuerfel, blaupauseId) {
  const bp = BLAUPAUSEN[blaupauseId];
  wuerfel.seiten = bp.seitenVorlage.map((s) => ({
    wert: s.wert,
    effekt: s.effekt.map((e) => ({ ...e })),
  }));
  wuerfel.stufen = [0, 0, 0, 0, 0, 0];
  wuerfel.typ = bp.typ;
  wuerfel.blaupause = { id: bp.id, nameKey: bp.nameKey };
  return wuerfel;
}

function baueGravurSeite(gravur, effektWert, basisWert) {
  if (gravur.ueberschreibtZu === 'schaden_mult') {
    return { wert: 0, basisWert, gravurId: gravur.id, effekt: [{ typ: 'schaden_mult', wert: effektWert }] };
  }
  // Schärfe/Borke: fester Aufschlag auf den ursprünglichen Seitenwert (04 §3.2).
  const wert = basisWert + effektWert;
  return { wert, basisWert, gravurId: gravur.id, effekt: [{ typ: gravur.ueberschreibtZu, wert }] };
}

// Gleiche Gravur auf gravierter Seite → Stufe +1 (Cap 3); andere Gravur →
// Überschreiben auf Stufe 1 (Typ-Wechsel; Aufpreis-Regel folgt mit der Schmiede).
export function graviereSeite(wuerfel, gravurId, seitenIndex) {
  const gravur = GRAVUREN[gravurId];
  const seite = wuerfel.seiten[seitenIndex];
  const gleicheGravur = wuerfel.stufen[seitenIndex] > 0 && seite.gravurId === gravurId;
  const neueStufe = gleicheGravur
    ? Math.min(gravur.maxStufen, wuerfel.stufen[seitenIndex] + 1)
    : 1;
  const basisWert = seite.basisWert ?? seite.wert;
  wuerfel.seiten[seitenIndex] = baueGravurSeite(gravur, gravur.stufen[neueStufe - 1].effektWert, basisWert);
  wuerfel.stufen[seitenIndex] = neueStufe;
  return wuerfel;
}

// Wendet die gewählte Belohnungs-Option an. ziel: { wuerfel, seitenIndex }.
export function wendeBelohnungAn(run, option, ziel = {}) {
  if (option.typ === 'muenzen') {
    run.waehrungen.muenzen += option.betrag;
  } else if (option.typ === 'blaupause') {
    wendeBlaupauseAn(ziel.wuerfel, option.blaupauseId);
  } else if (option.typ === 'gravur') {
    graviereSeite(ziel.wuerfel, option.gravurId, ziel.seitenIndex);
  }
  return run;
}
