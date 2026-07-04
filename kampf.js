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
import { verdieneKampfBelohnung, zieheBelohnungsoptionen } from './belohnung.js';

export const KAEMPFE_PRO_REGION = 9; // [PROVISORISCH] Sim-Annahme, 05 §1.2
export const HEILUNG_ZWISCHEN_KAEMPFEN = 8; // kalibrierte Stufe "mittel"
const NORMALE_GEGNER = ['astbeisser', 'borkenkriecher', 'moosgnom'];
const ELITE_GEGNER = 'dornalter';

// --- Run --------------------------------------------------------------------

export function starteRun(klasseId = 'eichwart') {
  const hpMax = HUETER_BASIS_HP + KLASSEN[klasseId].hpMod;
  return {
    klasse: klasseId,
    arsenal: erstelleStartArsenal(klasseId),
    hp: hpMax,
    hpMax,
    kampfNummer: 0, // abgeschlossene Kämpfe
    waehrungen: { muenzen: 0, eicheln: 0, tau: 0 },
    belohnungenOhneBlaupause: 0, // Blaupause-Pity-Zähler (03 §10)
    verloren: false,
    abgeschlossen: false,
  };
}

// --- Gegner & Absicht (05 §4, minimaler Slice) --------------------------------

function zufallZwischen(rng, [min, max]) {
  return Math.round(min + rng.naechsteZahl() * (max - min));
}

function naechsteAbsicht(gegner) {
  const muster = gegner.absichtsMuster;
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
    hp,
    hpMax: hp,
    schaden: zufallZwischen(rng, vorlage.schadenBereich),
    absichtsMuster: vorlage.absichtsMuster,
    zyklus: 0,
    absicht: null,
  };
  gegner.absicht = naechsteAbsicht(gegner);
  return gegner;
}

// --- Kampf --------------------------------------------------------------------

export function starteKampf(run, rng) {
  const istElite = run.kampfNummer === KAEMPFE_PRO_REGION - 1;
  const vorlageId = istElite
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

  const warElite = GEGNER_VORLAGEN[kampf.gegner.vorlageId].rolle === 'elite';
  kampf.belohnung = {
    einkommen: verdieneKampfBelohnung(run, rng, { elite: warElite }),
    optionen: zieheBelohnungsoptionen(run, rng),
  };

  run.kampfNummer += 1;
  if (run.kampfNummer >= KAEMPFE_PRO_REGION) {
    run.abgeschlossen = true;
  } else {
    run.hp = Math.min(run.hpMax, run.hp + HEILUNG_ZWISCHEN_KAEMPFEN);
  }
}

// --- Anzeige-Helfer (rein lesend) ----------------------------------------------

export function arsenalSchreckSumme(run) {
  return run.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0);
}
