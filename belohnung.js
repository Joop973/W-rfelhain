// belohnung.js — Kampf-Belohnungen: Währungs-Einkommen, 3-Wahl-Ziehung mit
// Blaupause-Pity, Anwendung von Blaupausen/Gravuren aufs Arsenal.
// DOM-frei, reine Daten-Operationen (09 §1). Bezüge: 03 §8/§10, 04 §1.1/§3, 09 §2.5.

import { BLAUPAUSEN, GRAVUREN, SLICE_BLAUPAUSEN, SLICE_GRAVUREN } from './data.js';
import { gibSegen, segenEffekt, segenHaken, zieheSegenOption } from './segen.js';

export const BLAUPAUSE_PITY_N = 6; // spätestens nach N Belohnungen ohne Blaupause [PROVISORISCH]
export const ELITE_FAKTOR = 1.8; // Elite ≈ 1,8× Normal (07 §2.2) [PROVISORISCH]

const SELTENHEITS_GEWICHT = { haeufig: 6, selten: 3, episch: 1 }; // [PROVISORISCH]
// Typ-Mix je Options-Slot [PROVISORISCH]: Gravur 40 % · Blaupause 30 % ·
// Münzen-Bonus 20 % · Segen 10 % (Kampf-Belohnung enthält Segen, 07 §1.3/§4.3).
const OPTIONS_MIX = [
  { typ: 'gravur', gewicht: 40 },
  { typ: 'blaupause', gewicht: 30 },
  { typ: 'muenzen', gewicht: 20 },
  { typ: 'segen', gewicht: 10 },
];

// --- Einkommen (03 §8 gesperrt: Münzen ~14–16/Kampf, Eicheln ~8/Kampf) --------

export function verdieneKampfBelohnung(run, rng, { elite = false, hpVerlust = false } = {}) {
  // Regions-Skalierung (D8) [GESPERRT — Tor-3-Abnahme 2026-07-07]: spätere
  // Regionen zahlen mehr, damit die Gravur-Ökonomie mit den Gegner-Kurven
  // mitwächst (03 §8 sperrt nur R1).
  const regionsFaktor = 1 + 0.2 * ((run.region ?? 1) - 1);
  const faktor = (elite ? ELITE_FAKTOR : 1) * regionsFaktor;
  let eicheln = Math.round(8 * faktor);
  // Fleißiges Eichhorn: +3 Eicheln je Kampf (07 §4.2 #3).
  eicheln += segenEffekt(run, 'eicheln_einkommen')?.wert ?? 0;
  // Geduldiger-Wächter-Haken: Kämpfe MIT HP-Verlust geben keinen Eicheln-Bonus.
  if (hpVerlust && segenHaken(run, 'kein_eicheln_bonus_bei_hp_verlust')) eicheln = 0;
  const einkommen = {
    muenzen: Math.round((14 + rng.naechsteZahl() * 2) * faktor),
    eicheln,
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

// Doppelschlag nur gegen Münzen (Schmiede): als Gratis-Belohnung hob er die
// Voll-Run-Siegrate über das Band (04 §5-Lawinen-Check, E6: 71,3 % statt
// 65–70 — zwei Teil-Seiten + Selbst-Gleichklang auf der schwächsten Seite
// sind die effizienteste Gravur; der Kaufpreis ist die Bremse). [PROVISORISCH]
const NUR_SCHMIEDE_GRAVUREN = new Set(['doppelschlag']);

function zieheGravurOption(rng) {
  const pool = SLICE_GRAVUREN.filter((id) => !NUR_SCHMIEDE_GRAVUREN.has(id));
  const id = pool[Math.floor(rng.naechsteZahl() * pool.length)];
  return { typ: 'gravur', gravurId: id, nameKey: GRAVUREN[id].nameKey };
}

function zieheMuenzenOption(rng) {
  return { typ: 'muenzen', betrag: 10 + Math.floor(rng.naechsteZahl() * 5) }; // 10–14 [PROVISORISCH]
}

// 3 Optionen je Belohnungs-Knoten (03 §10). Pity: nach BLAUPAUSE_PITY_N
// Ziehungen ohne angebotene Blaupause ist eine Option garantiert Blaupause.
// garantierterSegen: Elite garantiert ≥1 Segen-Angebot (07 §4.3).
export function zieheBelohnungsoptionen(run, rng, { garantierterSegen = false } = {}) {
  const optionen = [];
  for (let i = 0; i < 3; i += 1) {
    const { typ } = gewichteteWahl(OPTIONS_MIX, rng);
    if (typ === 'blaupause') optionen.push(zieheBlaupausenOption(rng));
    else if (typ === 'gravur') optionen.push(zieheGravurOption(rng));
    else if (typ === 'segen') optionen.push(zieheSegenOption(run, rng) ?? zieheMuenzenOption(rng));
    else optionen.push(zieheMuenzenOption(rng));
  }

  if (garantierterSegen && !optionen.some((o) => o.typ === 'segen')) {
    const segen = zieheSegenOption(run, rng);
    if (segen) optionen[optionen.length - 1] = segen;
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

// Boss-Sonder-Belohnung (05 §6, 07 §4.3): 2 Blaupausen + 1 Boss-Segen —
// Boss-Segen gibt es NUR hier (1 Wahl je Boss). [PROVISORISCH]
export function zieheBossBelohnung(run, rng) {
  const pool = [...SLICE_BLAUPAUSEN];
  const optionen = [];
  for (let i = 0; i < 2 && pool.length > 0; i += 1) {
    const kandidaten = pool.map((id) => ({ id, gewicht: SELTENHEITS_GEWICHT[BLAUPAUSEN[id].seltenheit] }));
    const { id } = gewichteteWahl(kandidaten, rng);
    pool.splice(pool.indexOf(id), 1);
    optionen.push({ typ: 'blaupause', blaupauseId: id, nameKey: BLAUPAUSEN[id].nameKey });
  }
  const bossSegen = zieheSegenOption(run, rng, { nurBoss: true });
  if (bossSegen) optionen.push(bossSegen);
  run.belohnungenOhneBlaupause = 0;
  return optionen;
}

// --- Anwendung -------------------------------------------------------------------

// Blaupause überschreibt alle 6 Seiten UND setzt alle Stufen zurück (04 §1.1/09 §2.2, gesperrt).
export function wendeBlaupauseAn(wuerfel, blaupauseId) {
  const bp = BLAUPAUSEN[blaupauseId];
  // Fluch-Seiten überleben die Blaupause (07 §5.4: nur Würfel-entfernen löst
  // den Fluch) — sonst wäre der Schrein-Gegenwert sein eigener Fluch-Löser.
  const fluchSeiten = wuerfel.seiten
    .map((s, i) => (s.fluchId ? { s, i } : null))
    .filter(Boolean);
  wuerfel.seiten = bp.seitenVorlage.map((s) => ({
    wert: s.wert,
    effekt: s.effekt.map((e) => ({ ...e })),
  }));
  for (const { s, i } of fluchSeiten) wuerfel.seiten[i] = s;
  wuerfel.stufen = [0, 0, 0, 0, 0, 0];
  wuerfel.typ = bp.typ;
  wuerfel.blaupause = { id: bp.id, nameKey: bp.nameKey };
  return wuerfel;
}

// Gravur-Seiten drei Kategorien (09 §2.1 / 04 §3):
// - schaden_mult (Wucht): reine Mult-Seite, Wert 0.
// - schaden/rinde (Schärfe/Borke): fester Aufschlag auf den ursprünglichen Seitenwert.
// - alles Übrige (Gift/Zunder/Fäulnis/Dürre/Kraft/Glanz/…): reine Effekt-Seite,
//   Wert 0, der Effekt trägt die Menge (Status-Stapel bzw. Glanz-Marker).
const AUFSCHLAG_TYPEN = new Set(['schaden', 'rinde']);

function baueGravurSeite(gravur, effektWert, basisWert) {
  const typ = gravur.ueberschreibtZu;
  if (typ === 'schaden_mult') {
    return { wert: 0, basisWert, gravurId: gravur.id, effekt: [{ typ: 'schaden_mult', wert: effektWert }] };
  }
  if (AUFSCHLAG_TYPEN.has(typ)) {
    const wert = basisWert + effektWert;
    return { wert, basisWert, gravurId: gravur.id, effekt: [{ typ, wert }] };
  }
  return { wert: 0, basisWert, gravurId: gravur.id, effekt: [{ typ, wert: effektWert }] };
}

// Gleiche Gravur auf gravierter Seite → Stufe +1 (Cap 3); andere Gravur →
// Überschreiben auf Stufe 1 (Typ-Wechsel; Aufpreis-Regel folgt mit der Schmiede).
export function graviereSeite(wuerfel, gravurId, seitenIndex) {
  const gravur = GRAVUREN[gravurId];
  const seite = wuerfel.seiten[seitenIndex];
  if (seite.fluchId) return null; // Fluch-Seiten sind nicht überschmiedbar (07 §5.4)
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
  } else if (option.typ === 'segen') {
    gibSegen(run, option.segenId);
  }
  return run;
}
