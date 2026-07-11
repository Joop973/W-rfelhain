// knoten.js — Nicht-Kampf-Knoten: Schmiede, Markt, Event, Lagerfeuer (07 §1.3/§2/§3).
// DOM-frei; alle Preise/Werte ohne Sperrvermerk sind [PROVISORISCH].

import {
  GRAVUREN,
  BLAUPAUSEN,
  HAIN_SEGEN,
  SLICE_GRAVUREN,
  SLICE_BLAUPAUSEN,
  EVENTS,
  erstelleWuerfel,
  GRAVUR_WECHSEL_AUFPREIS_FAKTOR,
} from './data.js';
import { graviereSeite, wendeBlaupauseAn } from './belohnung.js';
import { drueckeFluchAuf } from './fluch.js';
import { troeste, schreck } from './push.js';
import { gibSegen, segenEffekt, troestenBonus, zieheSegenOption } from './segen.js';
import { reifegradMods } from './reifegrad.js';
import { merkeHinweis } from './narrativ.js';

export const TAU_PRO_REGION = 6; // 03 §8 [GESPERRT]
export const LAGERFEUER_HEILUNG_ANTEIL = 0.3; // +30 % hpMax [PROVISORISCH]
export const TROESTEN_DIENST_TAU = 3; // 3 Tau je +2 Gemüt (07 §2.3) [PROVISORISCH]
export const ENTFERNEN_STARTPREIS = 25; // +15 je Anwendung (07 §3.3) [PROVISORISCH]
export const ENTFERNEN_AUFSCHLAG = 15;

// Slice-Events: nur Vignetten, deren Effekte der aktuelle Code ausführen kann
// (Münzen/Eicheln/Tau/Trösten/Gemüt/Würfel/Segen/Gravur/Selbstschaden/Hinweis/
// Fluch/Blaupausen-Fund). Zweifel-Events R4/R5 seit D4 (07 §5.3); die drei
// Fluch-Events seit E6 (Fluch-System, 07 §5.4).
export const SLICE_EVENTS = [
  'ueberwucherter_brunnen',
  'veraengstigtes_kaetzchen',
  'schwelende_wurzel',
  'wetzstein_am_wegrand',
  'stumme_lichtung',
  'hohler_stumpf',
  'moderpfuetze',
  'schrein_der_raschen_gaben',
  'trockene_quelle',
];

// Moderpfütze: Chance, die Giftranke-Blaupause aus dem Brackwasser zu fischen
// (07 §5.2 "Giftranke-Chance") [PROVISORISCH].
export const BLAUPAUSE_FUND_CHANCE = 0.5;

const BLAUPAUSEN_PREIS = { haeufig: 60, selten: 80, episch: 100 }; // Eicheln (07 §2.3) [PROVISORISCH]

function findeWuerfel(run, id) {
  return run.arsenal.find((w) => w.id === id);
}

// --- Schmiede (03 §8: Preise 40/60/80 gesperrt) --------------------------------

export function erstelleSchmiedeAngebot() {
  return SLICE_GRAVUREN.map((id) => ({ gravurId: id, nameKey: GRAVUREN[id].nameKey }));
}

// Preis/Zielstufe für eine Gravur auf einer konkreten Seite; null = Cap erreicht.
// run (optional): für Segen-Rabatte — Krone des alten Hüters halbiert Stufe-1-Preise (07 §4.2 #15).
export function schmiedePreis(wuerfel, gravurId, seitenIndex, run = null) {
  if (wuerfel.seiten[seitenIndex]?.fluchId) return null; // Fluch weicht keiner Gravur (07 §5.4)
  const gravur = GRAVUREN[gravurId];
  const aktuelleStufe = wuerfel.stufen[seitenIndex];
  const gleicheGravur = aktuelleStufe > 0 && wuerfel.seiten[seitenIndex].gravurId === gravurId;
  if (gleicheGravur && aktuelleStufe >= gravur.maxStufen) return null;
  const zielStufe = gleicheGravur ? aktuelleStufe + 1 : 1;
  let preis = gravur.stufen[zielStufe - 1].preisMuenzen;
  const typWechsel = aktuelleStufe > 0 && !gleicheGravur;
  if (typWechsel) preis = Math.ceil(preis * GRAVUR_WECHSEL_AUFPREIS_FAKTOR); // 04 §3.2
  const rabatt = run && zielStufe === 1 ? segenEffekt(run, 'schmiede_stufe1_rabatt_prozent') : null;
  if (rabatt) preis = Math.ceil(preis * (1 - rabatt.wert / 100));
  // Reifegrad 4: Schmiede-Preise +20 % (03 §9) — nach Rabatten, auf den Endpreis.
  if (run) preis = Math.ceil(preis * reifegradMods(run.reifegrad ?? 0).schmiedePreisMult);
  return { zielStufe, preis, typWechsel };
}

export function kaufeGravur(run, gravurId, wuerfelId, seitenIndex) {
  const wuerfel = findeWuerfel(run, wuerfelId);
  const angebot = schmiedePreis(wuerfel, gravurId, seitenIndex, run);
  if (!angebot) return { ok: false, grund: 'cap' };
  if (run.waehrungen.muenzen < angebot.preis) return { ok: false, grund: 'muenzen' };
  run.waehrungen.muenzen -= angebot.preis;
  graviereSeite(wuerfel, gravurId, seitenIndex);
  return { ok: true, preis: angebot.preis, stufe: wuerfel.stufen[seitenIndex] };
}

// --- Markt (07 §3.2/§3.3) --------------------------------------------------------

const SEGEN_PREIS = { haeufig: 70, selten: 95, episch: 120 }; // Eicheln (07 §2.3: ~70–120) [PROVISORISCH]

// run (optional): Segen-Angebot 0–1, nur noch nicht besessene (07 §3.2/§4.3 "Markt kann selten Segen führen").
export function erstelleMarktAngebot(rng, run = null) {
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
  let segen = null;
  if (run && rng.naechsteZahl() < 0.35) {
    const option = zieheSegenOption(run, rng);
    if (option) segen = { ...option, preisEicheln: SEGEN_PREIS[HAIN_SEGEN[option.segenId].seltenheit] };
  }
  return { wuerfel, blaupause, segen };
}

export function kaufeMarktSegen(run, segenId, preisEicheln) {
  if (run.waehrungen.eicheln < preisEicheln) return { ok: false, grund: 'eicheln' };
  const ergebnis = gibSegen(run, segenId);
  if (!ergebnis.ok) return ergebnis;
  run.waehrungen.eicheln -= preisEicheln;
  return { ok: true };
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
  wuerfel.gemuet = troeste(wuerfel, troestenBonus(run)).gemuet;
  run.troestenZahl = (run.troestenZahl ?? 0) + 1; // zählt für Frühling (01 §5)
  run.pflegeZahl = (run.pflegeZahl ?? 0) + 1; // speist Labung (04 §4.1)
  return { ok: true };
}

// --- Event (07 §5, Slice-Teilmenge) -----------------------------------------------

// Regions-Gating (07 §5.2): Zweifel-Events erscheinen NUR in R4/R5 (01 §9 —
// die Wendung darf nicht früher angedeutet werden). Ohne Regions-Treffer
// (z. B. Region 6) fällt die Ziehung auf den vollen Slice-Pool zurück.
export function zieheEvent(rng, region = null) {
  const pool = region == null
    ? SLICE_EVENTS
    : SLICE_EVENTS.filter((id) => EVENTS[id].regionen.includes(region));
  const auswahl = pool.length > 0 ? pool : SLICE_EVENTS;
  const id = auswahl[Math.floor(rng.naechsteZahl() * auswahl.length)];
  return EVENTS[id];
}

// Prüft, ob eine Option bezahlbar ist (negative Währungs-Effekte sind Preise).
export function eventOptionMoeglich(run, option) {
  const effekt = option.effekt;
  if ((effekt.muenzen ?? 0) < 0 && run.waehrungen.muenzen + effekt.muenzen < 0) return false;
  if ((effekt.eicheln ?? 0) < 0 && run.waehrungen.eicheln + effekt.eicheln < 0) return false;
  return true;
}

// Wendet die deklarativen Options-Effekte an, soweit der Slice sie kennt.
export function waehleEventOption(run, event, optionIndex, rng) {
  const option = event.optionen[optionIndex];
  if (!eventOptionMoeglich(run, option)) return []; // Preis nicht bezahlbar — nichts passiert
  const effekt = option.effekt;
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
      ziel.gemuet = troeste(ziel, troestenBonus(run)).gemuet;
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
  if (effekt.segen) {
    gibSegen(run, effekt.segen);
    ergebnis.push('ein Hain-Segen begleitet dich');
  }
  if (effekt.selbstschaden) {
    // Events töten nicht — Untergrenze 1 HP [PROVISORISCH].
    run.hp = Math.max(1, run.hp - effekt.selbstschaden);
    ergebnis.push(`−${effekt.selbstschaden} HP`);
  }
  if (effekt.seitenAufwertung) {
    // "Würfel schärfen" (07 §5.2): dauerhaft +wert auf die schwächste
    // ungravierte Seite der ersten N Schaden-Würfel.
    const ziele = run.arsenal.filter((w) => w.typ === 'schaden').slice(0, effekt.seitenAufwertung.wuerfel);
    for (const w of ziele) {
      const kandidaten = w.seiten
        .map((s, i) => ({ s, i }))
        .filter(({ s, i }) => w.stufen[i] === 0 && !s.fluchId) // Fluch-Seiten schärfen sich nicht
        .sort((a, b) => a.s.wert - b.s.wert);
      if (kandidaten.length === 0) continue;
      const { s } = kandidaten[0];
      s.wert += effekt.seitenAufwertung.wert;
      for (const e of s.effekt) if (e.typ === 'schaden' || e.typ === 'rinde') e.wert = s.wert;
    }
    ergebnis.push(`${ziele.length} Würfel geschärft`);
  }
  if (effekt.gravurGratis) {
    // Fluch-Seiten (stufe 0, aber fluchId) sind nicht gravierbar — überspringen.
    const gravierbar = (w, i) => w.stufen[i] === 0 && !w.seiten[i].fluchId;
    const ziel = run.arsenal.find((w) => w.typ === 'schaden' && w.seiten.some((_, i) => gravierbar(w, i)));
    if (ziel) {
      const seitenIndex = ziel.seiten.findIndex((_, i) => gravierbar(ziel, i));
      graviereSeite(ziel, effekt.gravurGratis, seitenIndex);
      ergebnis.push('eine Gravur, ohne Preis');
    }
  }
  if (effekt.hinweis) {
    // Zweifel-Hinweis (07 §5.3): run-weit merken — die Wendung färbt sich (D4).
    merkeHinweis(run, effekt.hinweis);
  }
  if (effekt.fluch) {
    // Fluch-Aufdrückung (07 §5.4, E6): eine Fluch-Seite auf einen zufälligen
    // Würfel — run-lang, nur über Würfel-entfernen wieder loszuwerden.
    const getroffen = drueckeFluchAuf(run, effekt.fluch, rng);
    if (getroffen) {
      const label = { faeule_anfaelligkeit: 'Fäule-Fluch', fluch_seite: 'Fluch-Seite', scharte_fluch: 'Scharte-Fluch' };
      ergebnis.push(`${label[effekt.fluch] ?? 'Fluch'} auf einen Würfel`);
    }
  }
  if (effekt.blaupauseChance) {
    // Moderpfütze: 50-%-Fund. Die Blaupause wird nicht auto-angewandt (sie
    // überschreibt alle 6 Seiten!) — sie wandert als offene Belohnung mit,
    // die UI/Sim wählt den Ziel-Würfel. Transient: nicht Teil des Saves
    // (Save läuft nur zwischen Knoten, das Event wird bei Reload neu gespielt).
    if (rng.naechsteZahl() < BLAUPAUSE_FUND_CHANCE) {
      const id = effekt.blaupauseChance;
      run.offeneBelohnungen = [...(run.offeneBelohnungen ?? []), { typ: 'blaupause', blaupauseId: id, nameKey: BLAUPAUSEN[id].nameKey }];
      ergebnis.push('eine Blaupause treibt im Wasser — wähle einen Würfel');
    } else {
      ergebnis.push('nichts als Moder und Schlick');
    }
  }
  if (effekt.belohnung === 'episch') {
    // Schrein der raschen Gaben: der Gegenwert des Fluchs — eine epische
    // Blaupause (Pool enthält Wildwuchs, quelle 'event_fluch', 04 §4).
    const pool = SLICE_BLAUPAUSEN.filter((id) => BLAUPAUSEN[id].seltenheit === 'episch');
    const id = pool[Math.floor(rng.naechsteZahl() * pool.length)];
    run.offeneBelohnungen = [...(run.offeneBelohnungen ?? []), { typ: 'blaupause', blaupauseId: id, nameKey: BLAUPAUSEN[id].nameKey }];
    ergebnis.push('eine epische Blaupause — wähle einen Würfel');
  }
  return ergebnis;
}

// --- Lagerfeuer (07 §1.3: eine Aktion — Heilen ODER Trösten ODER Vollenden) --------

export function rasteLagerfeuer(run, wahl, wuerfelId = null) {
  if (wahl === 'heilen') {
    // Warmes Moos (07 §4.2 #4): Lagerfeuer-Heilung +25 %; Reifegrad 6: −25 % (03 §9).
    const moos = segenEffekt(run, 'lagerfeuer_heilung_prozent');
    const anteil = LAGERFEUER_HEILUNG_ANTEIL * (moos ? 1 + moos.wert / 100 : 1);
    const menge = Math.round(run.hpMax * anteil * reifegradMods(run.reifegrad ?? 0).heilungMult);
    run.hp = Math.min(run.hpMax, run.hp + menge);
    return { ok: true, text: `+${menge} HP` };
  }
  if (wahl === 'troesten') {
    const wuerfel = findeWuerfel(run, wuerfelId);
    wuerfel.gemuet = troeste(wuerfel, troestenBonus(run)).gemuet;
    run.troestenZahl = (run.troestenZahl ?? 0) + 1;
    run.pflegeZahl = (run.pflegeZahl ?? 0) + 1;
    // Frühjahrs-Knospe (Setzling, C5): das erste Lagerfeuer-Trösten je Run
    // verbraucht die Rast nicht (rastFrei — der Aufrufer lässt die Aktion offen).
    if ((run.setzlinge ?? []).includes('fruehjahrs_knospe') && !run.knospeGenutzt) {
      run.knospeGenutzt = true;
      return { ok: true, text: '+2 Gemüt — die Knospe schenkt die Rast', rastFrei: true };
    }
    return { ok: true, text: '+2 Gemüt' };
  }
  if (wahl === 'vollenden') {
    const wuerfel = findeWuerfel(run, wuerfelId);
    wuerfel.atem = Math.max(0, wuerfel.atem - 1); // Vollendet-Bonus = −1 Atem, Untergrenze 0
    return { ok: true, text: `Atem-Kosten jetzt ${wuerfel.atem}` };
  }
  return { ok: false };
}
