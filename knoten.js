// knoten.js — Nicht-Kampf-Knoten: Schmiede, Markt, Event, Lagerfeuer (07 §1.3/§2/§3).
// DOM-frei; alle Preise/Werte ohne Sperrvermerk sind [PROVISORISCH].

import {
  GRAVUREN,
  BLAUPAUSEN,
  SLICE_GRAVUREN,
  SLICE_BLAUPAUSEN,
  EVENTS,
  erstelleWuerfel,
  GRAVUR_WECHSEL_AUFPREIS_FAKTOR,
} from './data.js';
import { graviereSeite, wendeBlaupauseAn } from './belohnung.js';
import { troeste, schreck } from './push.js';

export const TAU_PRO_REGION = 6; // 03 §8 [GESPERRT]
export const LAGERFEUER_HEILUNG_ANTEIL = 0.3; // +30 % hpMax [PROVISORISCH]
export const TROESTEN_DIENST_TAU = 3; // 3 Tau je +2 Gemüt (07 §2.3) [PROVISORISCH]
export const ENTFERNEN_STARTPREIS = 25; // +15 je Anwendung (07 §3.3) [PROVISORISCH]
export const ENTFERNEN_AUFSCHLAG = 15;

// Slice-Events: nur Vignetten, deren Effekte der aktuelle Code ausführen kann
// (Münzen/Tau/Trösten/Gemüt/Würfel-ins-Arsenal). Rest folgt mit den Systemen.
export const SLICE_EVENTS = ['ueberwucherter_brunnen', 'veraengstigtes_kaetzchen'];

const BLAUPAUSEN_PREIS = { haeufig: 60, selten: 80, episch: 100 }; // Eicheln (07 §2.3) [PROVISORISCH]

function findeWuerfel(run, id) {
  return run.arsenal.find((w) => w.id === id);
}

// --- Schmiede (03 §8: Preise 40/60/80 gesperrt) --------------------------------

export function erstelleSchmiedeAngebot() {
  return SLICE_GRAVUREN.map((id) => ({ gravurId: id, nameKey: GRAVUREN[id].nameKey }));
}

// Preis/Zielstufe für eine Gravur auf einer konkreten Seite; null = Cap erreicht.
export function schmiedePreis(wuerfel, gravurId, seitenIndex) {
  const gravur = GRAVUREN[gravurId];
  const aktuelleStufe = wuerfel.stufen[seitenIndex];
  const gleicheGravur = aktuelleStufe > 0 && wuerfel.seiten[seitenIndex].gravurId === gravurId;
  if (gleicheGravur && aktuelleStufe >= gravur.maxStufen) return null;
  const zielStufe = gleicheGravur ? aktuelleStufe + 1 : 1;
  let preis = gravur.stufen[zielStufe - 1].preisMuenzen;
  const typWechsel = aktuelleStufe > 0 && !gleicheGravur;
  if (typWechsel) preis = Math.ceil(preis * GRAVUR_WECHSEL_AUFPREIS_FAKTOR); // 04 §3.2
  return { zielStufe, preis, typWechsel };
}

export function kaufeGravur(run, gravurId, wuerfelId, seitenIndex) {
  const wuerfel = findeWuerfel(run, wuerfelId);
  const angebot = schmiedePreis(wuerfel, gravurId, seitenIndex);
  if (!angebot) return { ok: false, grund: 'cap' };
  if (run.waehrungen.muenzen < angebot.preis) return { ok: false, grund: 'muenzen' };
  run.waehrungen.muenzen -= angebot.preis;
  graviereSeite(wuerfel, gravurId, seitenIndex);
  return { ok: true, preis: angebot.preis, stufe: wuerfel.stufen[seitenIndex] };
}

// --- Markt (07 §3.2/§3.3) --------------------------------------------------------

export function erstelleMarktAngebot(rng) {
  const wuerfelVorlagen = ['astschneide', 'borkenschild'];
  const anzahlWuerfel = 1 + Math.floor(rng.naechsteZahl() * 2); // 1–2
  const wuerfel = [];
  for (let i = 0; i < anzahlWuerfel; i += 1) {
    wuerfel.push({
      vorlageId: wuerfelVorlagen[Math.floor(rng.naechsteZahl() * wuerfelVorlagen.length)],
      preisEicheln: 35 + Math.floor(rng.naechsteZahl() * 11), // 35–45
    });
  }
  let blaupause = null;
  if (rng.naechsteZahl() < 0.5) {
    const id = SLICE_BLAUPAUSEN[Math.floor(rng.naechsteZahl() * SLICE_BLAUPAUSEN.length)];
    blaupause = { blaupauseId: id, nameKey: BLAUPAUSEN[id].nameKey, preisEicheln: BLAUPAUSEN_PREIS[BLAUPAUSEN[id].seltenheit] };
  }
  return { wuerfel, blaupause };
}

export function kaufeWuerfel(run, vorlageId, preisEicheln) {
  if (run.waehrungen.eicheln < preisEicheln) return { ok: false, grund: 'eicheln' };
  run.waehrungen.eicheln -= preisEicheln;
  const neu = erstelleWuerfel(vorlageId, `markt_${vorlageId}_${run.arsenal.length}_${Date.now() % 10000}`);
  run.arsenal.push(neu);
  return { ok: true, wuerfel: neu };
}

export function kaufeMarktBlaupause(run, blaupauseId, preisEicheln, wuerfelId) {
  if (run.waehrungen.eicheln < preisEicheln) return { ok: false, grund: 'eicheln' };
  run.waehrungen.eicheln -= preisEicheln;
  wendeBlaupauseAn(findeWuerfel(run, wuerfelId), blaupauseId);
  return { ok: true };
}

export function entfernenPreis(run) {
  return ENTFERNEN_STARTPREIS + ENTFERNEN_AUFSCHLAG * run.entfernteWuerfel;
}

export function entferneWuerfel(run, wuerfelId) {
  if (run.arsenal.length <= 5) return { ok: false, grund: 'arsenal_minimum' }; // Handgröße bleibt füllbar
  const preis = entfernenPreis(run);
  if (run.waehrungen.muenzen < preis) return { ok: false, grund: 'muenzen' };
  run.waehrungen.muenzen -= preis;
  run.arsenal = run.arsenal.filter((w) => w.id !== wuerfelId);
  run.entfernteWuerfel += 1;
  return { ok: true, preis };
}

// Trösten-Dienst: 3 Tau je +2 Gemüt (Tau kauft nie Schaden — Zweck-Trennung 07 §2.1).
export function troesteDienst(run, wuerfelId) {
  if (run.waehrungen.tau < TROESTEN_DIENST_TAU) return { ok: false, grund: 'tau' };
  run.waehrungen.tau -= TROESTEN_DIENST_TAU;
  const wuerfel = findeWuerfel(run, wuerfelId);
  wuerfel.gemuet = troeste(wuerfel).gemuet;
  run.troestenZahl = (run.troestenZahl ?? 0) + 1; // zählt für Frühling (01 §5)
  run.pflegeZahl = (run.pflegeZahl ?? 0) + 1; // speist Labung (04 §4.1)
  return { ok: true };
}

// --- Event (07 §5, Slice-Teilmenge) -----------------------------------------------

export function zieheEvent(rng) {
  const id = SLICE_EVENTS[Math.floor(rng.naechsteZahl() * SLICE_EVENTS.length)];
  return EVENTS[id];
}

// Wendet die deklarativen Options-Effekte an, soweit der Slice sie kennt.
export function waehleEventOption(run, event, optionIndex, rng) {
  const effekt = event.optionen[optionIndex].effekt;
  const ergebnis = [];

  if (effekt.muenzen) {
    run.waehrungen.muenzen += effekt.muenzen;
    ergebnis.push(`${effekt.muenzen > 0 ? '+' : ''}${effekt.muenzen} Münzen`);
  }
  if (effekt.eicheln) {
    run.waehrungen.eicheln += effekt.eicheln;
    ergebnis.push(`${effekt.eicheln > 0 ? '+' : ''}${effekt.eicheln} Eicheln`);
  }
  if (effekt.tau) {
    run.waehrungen.tau += effekt.tau;
    ergebnis.push(`+${effekt.tau} Tau`);
  }
  if (effekt.troesten) {
    // Trösten trifft den ängstlichsten Würfel (bzw. einen zufälligen bei Gleichstand 0).
    for (let i = 0; i < effekt.troesten; i += 1) {
      const ziel = [...run.arsenal].sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
      ziel.gemuet = troeste(ziel).gemuet;
    }
    run.troestenZahl = (run.troestenZahl ?? 0) + effekt.troesten;
    run.pflegeZahl = (run.pflegeZahl ?? 0) + effekt.troesten;
    ergebnis.push(`${effekt.troesten}× Trösten`);
  }
  if (effekt.gemuet) {
    const ziel = run.arsenal[Math.floor(rng.naechsteZahl() * run.arsenal.length)];
    ziel.gemuet += effekt.gemuet.wert;
    ergebnis.push(`${effekt.gemuet.wert} Gemüt auf einen Würfel`);
  }
  if (effekt.wuerfelInsArsenal) {
    const neu = erstelleWuerfel(effekt.wuerfelInsArsenal.vorlage, `event_${run.arsenal.length}_${Math.floor(rng.naechsteZahl() * 10000)}`);
    neu.gemuet = effekt.wuerfelInsArsenal.gemuet ?? 0;
    run.arsenal.push(neu);
    ergebnis.push('ein Würfel schließt sich an');
  }
  return ergebnis;
}

// --- Lagerfeuer (07 §1.3: eine Aktion — Heilen ODER Trösten ODER Vollenden) --------

export function rasteLagerfeuer(run, wahl, wuerfelId = null) {
  if (wahl === 'heilen') {
    const menge = Math.round(run.hpMax * LAGERFEUER_HEILUNG_ANTEIL);
    run.hp = Math.min(run.hpMax, run.hp + menge);
    return { ok: true, text: `+${menge} HP` };
  }
  if (wahl === 'troesten') {
    const wuerfel = findeWuerfel(run, wuerfelId);
    wuerfel.gemuet = troeste(wuerfel).gemuet;
    run.troestenZahl = (run.troestenZahl ?? 0) + 1;
    run.pflegeZahl = (run.pflegeZahl ?? 0) + 1;
    return { ok: true, text: '+2 Gemüt' };
  }
  if (wahl === 'vollenden') {
    const wuerfel = findeWuerfel(run, wuerfelId);
    wuerfel.atem = Math.max(0, wuerfel.atem - 1); // Vollendet-Bonus = −1 Atem, Untergrenze 0
    return { ok: true, text: `Atem-Kosten jetzt ${wuerfel.atem}` };
  }
  return { ok: false };
}
