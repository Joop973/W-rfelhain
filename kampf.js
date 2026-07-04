// kampf.js — Kampf-Loop: verdrahtet engine/push/ziehstapel/data zum spielbaren
// Zug-Zyklus (02 §2). DOM-frei, Node-testbar; ui/ ruft diese Funktionen und
// rendert nur (09 §1: kein Spiellogik-Code in ui/ — darum lebt der Loop hier).
// Slice-Umfang: Region-1-Sequenz (9 Kämpfe, Kampf 9 = Elite), Werte aus der
// kalibrierten Stufe "mittel" (docs/Welle1_Tor_ReRun_12er_Befund.md).

import { resolveZug } from './engine.js';
import {
  schreck,
  bestimmeGesperrteSeitenIndizes,
  fuehreRerollAus,
  loeseTischsturzAus,
  verarbeiteKampfende,
  TISCHSTURZ_SELBSTSCHADEN,
} from './push.js';
import { kampfbeginn, zieheHand, zugende } from './ziehstapel.js';
import { GEGNER_VORLAGEN, KLASSEN, HUETER_BASIS_HP, ATEM_PRO_ZUG, erstelleStartArsenal } from './data.js';
import { verdieneKampfBelohnung, zieheBelohnungsoptionen, zieheBossBelohnung } from './belohnung.js';
import { generiereKarte } from './karte.js';
import { TAU_PRO_REGION } from './knoten.js';

const NORMALE_GEGNER = ['astbeisser', 'borkenkriecher', 'moosgnom'];
const ELITE_GEGNER = 'dornalter';
const BOSS_GEGNER = 'saumhueter';

// --- Run --------------------------------------------------------------------

export function starteRun(klasseId = 'eichwart', rng) {
  const hpMax = HUETER_BASIS_HP + KLASSEN[klasseId].hpMod;
  return {
    klasse: klasseId,
    arsenal: erstelleStartArsenal(klasseId),
    hp: hpMax,
    hpMax,
    karte: generiereKarte(rng),
    positionKnotenId: null, // vor Reihe 1
    kampfNummer: 0, // abgeschlossene Kämpfe (Statistik)
    waehrungen: { muenzen: 0, eicheln: 0, tau: TAU_PRO_REGION }, // Tau je Region (03 §8)
    belohnungenOhneBlaupause: 0, // Blaupause-Pity-Zähler (03 §10)
    entfernteWuerfel: 0, // treibt die Entfernen-Preiseskalation (07 §3.3)
    troestenZahl: 0, // run-weite Trösten-Ereignisse (01 §5)
    verloren: false,
    abgeschlossen: false, // Boss besiegt
  };
}

// --- Karten-Navigation (07 §1) -------------------------------------------------

export function findeKnoten(run, knotenId) {
  return run.karte.reihen.flat().find((k) => k.id === knotenId) ?? null;
}

// Wählbare Knoten: Reihe 1 am Start, danach die Kanten des aktuellen Knotens.
export function verfuegbareKnoten(run) {
  if (run.verloren || run.abgeschlossen) return [];
  if (!run.positionKnotenId) return run.karte.reihen[0];
  const aktuell = findeKnoten(run, run.positionKnotenId);
  if (aktuell.reihe >= run.karte.reihen.length) return [];
  const naechsteReihe = run.karte.reihen[aktuell.reihe]; // reihe ist 1-basiert
  return naechsteReihe.filter((k) => aktuell.kanten.includes(k.slot));
}

// Betritt einen wählbaren Knoten; Kampf-Knoten startet der Aufrufer via starteKampf.
export function betreteKnoten(run, knotenId) {
  const knoten = verfuegbareKnoten(run).find((k) => k.id === knotenId);
  if (!knoten) return null;
  run.positionKnotenId = knoten.id;
  return knoten;
}

// --- Gegner & Absicht (05 §4, minimaler Slice) --------------------------------

function zufallZwischen(rng, [min, max]) {
  return Math.round(min + rng.naechsteZahl() * (max - min));
}

export function naechsteAbsicht(gegner) {
  // Boss-Twist "Erste Geduld" (05 §6): jede dritte Boss-Runde zwingend Block.
  if (gegner.mechanikIds?.includes('erste_geduld') && gegner.zyklus % 3 === 2) {
    return { typ: 'block', wert: gegner.schaden, angekuendigt: true };
  }
  let muster = gegner.absichtsMuster;
  // Boss-Phasen (05 §6): unter der HP-Schwelle wechselt das Muster.
  if (gegner.phasen) {
    for (const phase of gegner.phasen) {
      if (gegner.hp / gegner.hpMax <= phase.abHpAnteil) muster = phase.absichtsMuster;
    }
  }
  if (muster === 'waechter_mehrfach') muster = 'waechter'; // mehrfach-Treffer folgen mit Etappe B
  const zyklus = gegner.zyklus;
  if (muster === 'waechter') {
    // blockt zuerst, schlägt dann (05 §4) — Block halbiert eingehenden Schaden.
    return zyklus % 2 === 0
      ? { typ: 'block', wert: gegner.schaden, angekuendigt: true }
      : { typ: 'angriff', wert: gegner.schaden, angekuendigt: true };
  }
  if (muster === 'wetterwechsler') {
    return zyklus % 3 === 2
      ? { typ: 'block', wert: gegner.schaden, angekuendigt: true }
      : { typ: 'angriff', wert: gegner.schaden, angekuendigt: true };
  }
  return { typ: 'angriff', wert: gegner.schaden, angekuendigt: true }; // schlaeger
}

function baueGegner(vorlageId, rng) {
  const vorlage = GEGNER_VORLAGEN[vorlageId];
  const hp = zufallZwischen(rng, vorlage.hpBereich);
  const gegner = {
    vorlageId,
    nameKey: vorlage.nameKey,
    rolle: vorlage.rolle,
    hp,
    hpMax: hp,
    schaden: zufallZwischen(rng, vorlage.schadenBereich),
    absichtsMuster: vorlage.absichtsMuster,
    mechanikIds: vorlage.mechanikIds ?? [],
    phasen: vorlage.phasen ?? null,
    zyklus: 0,
    absicht: null,
  };
  gegner.absicht = naechsteAbsicht(gegner);
  return gegner;
}

// --- Kampf --------------------------------------------------------------------

// knotenTyp: 'kampf' | 'elite' | 'boss' (aus dem betretenen Karten-Knoten).
export function starteKampf(run, rng, knotenTyp = 'kampf') {
  const vorlageId =
    knotenTyp === 'boss'
      ? BOSS_GEGNER
      : knotenTyp === 'elite'
        ? ELITE_GEGNER
        : NORMALE_GEGNER[Math.floor(rng.naechsteZahl() * NORMALE_GEGNER.length)];
  return {
    zieh: kampfbeginn(run.arsenal.map((w) => w.id), rng), // Übermut-Reset implizit unten
    gegner: baueGegner(vorlageId, rng),
    uebermut: 0, // Reset je Kampf, nur Sofort-Mechanik (02 §2.1/§7)
    rerollsDiesenZug: 0,
    zugNummer: 0,
    hand: [],
    wuerfe: {}, // wuerfelId → gefallener Wert
    reihe: [], // platzierte Würfel-IDs, links→rechts
    atem: 0,
    block: 0,
    hpBeiKampfbeginn: run.hp,
    tischsturzImKampf: false,
    gespielteImKampf: [],
    zuletztGespielteIds: [],
    phase: 'zug', // zug | gegnerzug | sieg | niederlage
  };
}

function findeWuerfel(run, id) {
  return run.arsenal.find((w) => w.id === id);
}

// Wirft einen Würfel und liefert den gefallenen Seiten-INDEX — der Index ist
// nötig, damit Gravur-Seiten (Effekt-Liste) in der Auflösung wirken können.
function wirf(wuerfel, rng) {
  const gesperrt = new Set(bestimmeGesperrteSeitenIndizes(wuerfel));
  const frei = [0, 1, 2, 3, 4, 5].filter((i) => !gesperrt.has(i));
  const seitenIndex = frei[Math.floor(rng.naechsteZahl() * frei.length)];
  return { seitenIndex, wert: wuerfel.seiten[seitenIndex].wert };
}

// Zugbeginn: 5 frisch ziehen, werfen (Schreck-Sperrung greift vor dem Wurf).
export function beginneZug(run, kampf, rng) {
  kampf.zugNummer += 1;
  kampf.rerollsDiesenZug = 0;
  kampf.atem = ATEM_PRO_ZUG;
  kampf.reihe = [];
  kampf.zieh = zieheHand(kampf.zieh, rng);
  kampf.hand = [...kampf.zieh.hand];
  kampf.wuerfe = {};
  for (const id of kampf.hand) kampf.wuerfe[id] = wirf(findeWuerfel(run, id), rng);
  return kampf;
}

// Reroll = ganze Hand neu werfen (Slice-Vereinfachung; 02 §2.2 Schritt 4).
export function rerolle(run, kampf, rng) {
  const { state, tischsturz } = fuehreRerollAus(
    { uebermut: kampf.uebermut, rerollsDiesenZug: kampf.rerollsDiesenZug },
    {}
  );
  kampf.uebermut = state.uebermut;
  kampf.rerollsDiesenZug = state.rerollsDiesenZug;

  if (tischsturz) {
    // Zug-Paket verfällt, +2 Schreck auf ganze Hand, Selbstschaden (02 §7).
    kampf.tischsturzImKampf = true;
    const handWuerfel = kampf.hand.map((id) => findeWuerfel(run, id));
    loeseTischsturzAus(handWuerfel).forEach((neu) => {
      const w = findeWuerfel(run, neu.id);
      w.gemuet = neu.gemuet;
    });
    run.hp -= TISCHSTURZ_SELBSTSCHADEN;
    kampf.reihe = [];
    kampf.zuletztGespielteIds = [];
    kampf.zieh = zugende({ ...kampf.zieh, hand: kampf.hand });
    kampf.hand = [];
    kampf.phase = run.hp <= 0 ? 'niederlage' : 'gegnerzug';
    if (kampf.phase === 'niederlage') run.verloren = true;
    return { tischsturz: true };
  }

  for (const id of kampf.hand) {
    if (!kampf.reihe.includes(id)) kampf.wuerfe[id] = wirf(findeWuerfel(run, id), rng);
  }
  return { tischsturz: false };
}

// Platzieren links→rechts, 1 Atem je Seite (02 §2.2 Schritt 5).
export function platziere(run, kampf, wuerfelId) {
  if (kampf.phase !== 'zug') return false;
  if (kampf.atem <= 0) return false;
  if (!kampf.hand.includes(wuerfelId) || kampf.reihe.includes(wuerfelId)) return false;
  kampf.reihe.push(wuerfelId);
  kampf.atem -= findeWuerfel(run, wuerfelId).atem;
  return true;
}

export function nimmZurueck(run, kampf, wuerfelId) {
  const index = kampf.reihe.indexOf(wuerfelId);
  if (index === -1) return false;
  kampf.reihe.splice(index, 1);
  kampf.atem += findeWuerfel(run, wuerfelId).atem;
  return true;
}

// Auflösen L→R (02 §4), dann Hand ablegen. Baut das Paket aus den tatsächlich
// gefallenen Seiten-Effekten — Gravur-Seiten (z. B. Wucht-Mult) wirken damit.
export function loeseZugAuf(run, kampf, rng) {
  if (kampf.phase !== 'zug') return null;
  const passiv = KLASSEN[run.klasse].passiv;
  const passivWert = passiv.typ === 'schaden_flach' ? passiv.wert : 0;

  const gespielteSeiten = [];
  for (const id of kampf.reihe) {
    const w = findeWuerfel(run, id);
    const seite = w.seiten[kampf.wuerfe[id].seitenIndex];
    const hoechstwert = Math.max(...w.seiten.map((s) => s.wert));
    for (const effekt of seite.effekt) {
      if (effekt.typ === 'schaden') {
        gespielteSeiten.push({
          typ: 'schaden',
          effektiverWert: effekt.wert,
          vollmondWert: effekt.wert,
          hoechstwert,
          kraft: 0,
          passiv: passivWert,
        });
      } else if (effekt.typ === 'rinde') {
        gespielteSeiten.push({ typ: 'rinde', effektiverWert: effekt.wert, hoechstwert });
      } else if (effekt.typ === 'schaden_mult') {
        // Mult-Seite: multipliziert den Pool, ist selbst keine Schaden-Seite (kein Passiv).
        gespielteSeiten.push({
          typ: 'schaden',
          effektiverWert: 0,
          vollmondWert: 0,
          hoechstwert,
          kraft: 0,
          passiv: 0,
          mult: effekt.wert,
        });
      }
      // Weitere Effekt-Typen (Status, Echo, Glanz, …) folgen mit Etappe B.
    }
  }

  const pools = resolveZug(gespielteSeiten, { morschStapel: 0, welkStapel: 0, region: 1 });

  // Gegner-Block halbiert eingehenden Schaden (Slice-Minimal, 05 §4 Wächter).
  const effektiverSchaden = kampf.gegner.absicht.typ === 'block' ? Math.floor(pools.schaden / 2) : pools.schaden;
  kampf.gegner.hp = Math.max(0, kampf.gegner.hp - effektiverSchaden);
  kampf.block = pools.rinde;

  kampf.zuletztGespielteIds = [...kampf.reihe];
  for (const id of kampf.reihe) {
    if (!kampf.gespielteImKampf.includes(id)) kampf.gespielteImKampf.push(id);
  }
  kampf.zieh = zugende({ ...kampf.zieh, hand: kampf.hand });
  kampf.hand = [];
  kampf.reihe = [];

  if (kampf.gegner.hp <= 0) {
    beendeKampf(run, kampf, true, rng);
  } else {
    kampf.phase = 'gegnerzug';
  }
  return pools;
}

// Gegnerzug: angekündigte Absicht ausführen; Rinde fängt Schaden, keinen Status (02 §2.3).
export function fuehreGegnerzugAus(run, kampf) {
  if (kampf.phase !== 'gegnerzug') return null;
  const { absicht } = kampf.gegner;
  let erlitten = 0;
  if (absicht.typ === 'angriff') {
    erlitten = Math.max(0, absicht.wert - kampf.block);
    run.hp -= erlitten;
  }
  kampf.block = 0; // Rinde verfällt (02 §2.2 Schritt 9)
  kampf.gegner.zyklus += 1;
  kampf.gegner.absicht = naechsteAbsicht(kampf.gegner);

  if (run.hp <= 0) {
    run.verloren = true;
    kampf.phase = 'niederlage';
  } else {
    kampf.phase = 'zug';
  }
  return { erlitten };
}

// Kampfende: erst Sauberer-Sieg-Bonus, dann Kristallisation (02 §2.5/§7.3),
// danach Einkommen + Belohnungs-Ziehung (A1).
function beendeKampf(run, kampf, sieg, rng) {
  if (!sieg) {
    kampf.phase = 'niederlage';
    run.verloren = true;
    return;
  }
  const sauberSieg = !kampf.tischsturzImKampf && run.hp === kampf.hpBeiKampfbeginn;
  const gespielteWuerfel = kampf.gespielteImKampf.map((id) => findeWuerfel(run, id));
  const verarbeitet = verarbeiteKampfende({
    sauberSieg,
    gespielteWuerfelGesamt: gespielteWuerfel,
    zuletztGespielteIds: kampf.zuletztGespielteIds,
    uebermutRest: kampf.uebermut,
  });
  for (const neu of verarbeitet) {
    findeWuerfel(run, neu.id).gemuet = neu.gemuet;
  }
  kampf.sauberSieg = sauberSieg;
  kampf.kristallisiert = kampf.uebermut;
  kampf.phase = 'sieg';

  const rolle = kampf.gegner.rolle;
  kampf.belohnung = {
    einkommen: verdieneKampfBelohnung(run, rng, { elite: rolle !== 'normal' }),
    // Boss-Sonder-Belohnung: garantierte Blaupausen-Wahl (05 §6).
    optionen: rolle === 'boss' ? zieheBossBelohnung(run, rng) : zieheBelohnungsoptionen(run, rng),
  };

  run.kampfNummer += 1;
  if (rolle === 'boss') run.abgeschlossen = true; // Region 1 geschafft
  // Keine Auto-Heilung mehr — Heilung ist strukturell (Lagerfeuer, 07 §1.3);
  // Nach-Eichung der Schwierigkeit gegen die neue Struktur ist Etappe A8.
}

// --- Anzeige-Helfer (rein lesend) ----------------------------------------------

export function arsenalSchreckSumme(run) {
  return run.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0);
}
