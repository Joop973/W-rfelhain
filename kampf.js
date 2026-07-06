// kampf.js — Kampf-Loop: verdrahtet engine/push/ziehstapel/data zum spielbaren
// Zug-Zyklus (02 §2). DOM-frei, Node-testbar; ui/ ruft diese Funktionen und
// rendert nur (09 §1: kein Spiellogik-Code in ui/ — darum lebt der Loop hier).
// Slice-Umfang: Region-1-Sequenz (9 Kämpfe, Kampf 9 = Elite), Werte aus der
// kalibrierten Stufe "mittel" (docs/Welle1_Tor_ReRun_12er_Befund.md).

import { resolveZug, welkMult, effektiverWert } from './engine.js';
import {
  schreck,
  bestimmeGesperrteSeitenIndizes,
  fuehreRerollAus,
  loeseTischsturzAus,
  verarbeiteKampfende,
  TISCHSTURZ_SELBSTSCHADEN,
} from './push.js';
import { leererStatus, tickeFaeule, tickeBrand, decayRundenende, legeStatusAuf } from './status.js';
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
    status: leererStatus(), // vom Spieler auflegbare Status (Fäule/Brand/Morsch/Welk)
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
    spielerStatus: leererStatus(), // vom Gegner auflegbare Status + Selbst-Buffs (Kraft)
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
  // Rundenbeginn-Status: eigene Fäule tickt (02 §2.2 Schritt 1).
  const faeuleSchaden = tickeFaeule(kampf.spielerStatus);
  if (faeuleSchaden > 0) {
    run.hp -= faeuleSchaden;
    if (run.hp <= 0) {
      run.verloren = true;
      kampf.phase = 'niederlage';
      return kampf;
    }
  }
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
// Freilauf/Klemme (Eigen-Status, 02 §7.4) verändern die Übermut-Kosten dieses Rerolls.
export function rerolle(run, kampf, rng) {
  const { state, tischsturz } = fuehreRerollAus(
    { uebermut: kampf.uebermut, rerollsDiesenZug: kampf.rerollsDiesenZug },
    { freilauf: kampf.spielerStatus.freilauf, klemme: kampf.spielerStatus.klemme }
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
// gefallenen Seiten-Effekten: Schaden/Rinde/Mult, Status-Auflage (Fäule/Brand/
// Morsch/Welk/Kraft), Glanz-Verdopplung und Riss-Aussetzer (02 §8).
export function loeseZugAuf(run, kampf, rng) {
  if (kampf.phase !== 'zug') return null;
  const passiv = KLASSEN[run.klasse].passiv;
  const passivWert = passiv.typ === 'schaden_flach' ? passiv.wert : 0;
  const spielerKraft = kampf.spielerStatus.kraft; // gilt für alle Schaden-Seiten dieses Zugs
  // Wetzung/Scharte (Eigen-Status) setzen den effektiven Wert JEDER gewürfelten Seite
  // (Schaden/Rinde) beim Wurf, Untergrenze 1 (02 §2.2/§8.2). Klassen-Sockel = 0 im Slice,
  // daher effektiver Wert = Vollmond-Prüfwert; das trennt sich erst mit der Schleiferin (C2).
  const { wetzung, scharte } = kampf.spielerStatus;

  const gespielteSeiten = [];
  const auflage = { morsch: 0, welk: 0, kraft: 0 }; // Pool-fremde Status (resolveZug ignoriert sie)
  let pendingGlanz = false;
  let aussetzer = 0;
  let letzterSchadenEffWert = 0; // effektiver Wert der zuletzt gelegten echten Schaden-Seite (für Echo-Gleichklang)
  let geheilt = 0; // Labung (Quell) — Tau-Engine, direkt auf run.hp
  let gepraegt = 0; // Prägung (Hort) — Münzen-Engine, direkt auf run.waehrungen

  for (const id of kampf.reihe) {
    const w = findeWuerfel(run, id);
    const seite = w.seiten[kampf.wuerfe[id].seitenIndex];
    const hoechstwert = Math.max(...w.seiten.map((s) => s.wert));
    for (const effekt of seite.effekt) {
      // Fläche (Weitwurf) trifft im Ein-Gegner-Slice wie eine Schaden-Seite;
      // Mehrfach-Ziele folgen mit den mehrgliedrigen Gegnern (spätere Region).
      if (effekt.typ === 'schaden' || effekt.typ === 'flaeche') {
        // Riss: 25 % Zünd-Aussetzer je gespielter Seite (02 §8.1) — Seite zählt 0.
        if (kampf.spielerStatus.riss > 0 && rng.naechsteZahl() < 0.25) {
          aussetzer += 1;
          continue;
        }
        const effWert = effektiverWert(effekt.wert, { wetzung, scharte });
        gespielteSeiten.push({
          typ: 'schaden',
          effektiverWert: effWert,
          vollmondWert: effWert, // Wetzung ermöglicht Vollmond, Scharte bricht ihn
          hoechstwert,
          kraft: spielerKraft,
          passiv: passivWert,
          glanz: pendingGlanz, // Glanz verdoppelt die nächste gespielte Schaden-Seite
        });
        pendingGlanz = false;
        letzterSchadenEffWert = effWert;
      } else if (effekt.typ === 'echo') {
        // Echo kopiert den Beitrag der unmittelbar links platzierten Schaden-Seite
        // (Cap 1× Quelle, resolveZug); zählt für Gleichklang mit deren Wert. Der
        // Echo-Wurf selbst zeigt seinen 0-Wert → bricht Vollmond (vollmondWert 0).
        gespielteSeiten.push({ typ: 'schaden', istEcho: true, effektiverWert: letzterSchadenEffWert, vollmondWert: 0, hoechstwert });
        letzterSchadenEffWert = 0;
      } else if (effekt.typ === 'rinde') {
        gespielteSeiten.push({ typ: 'rinde', effektiverWert: effektiverWert(effekt.wert, { wetzung, scharte }), hoechstwert });
        letzterSchadenEffWert = 0;
      } else if (effekt.typ === 'schaden_mult') {
        // Mult-Seite: multipliziert den Pool, ist selbst keine Schaden-Seite (kein Passiv).
        gespielteSeiten.push({ typ: 'schaden', effektiverWert: 0, vollmondWert: 0, hoechstwert, kraft: 0, passiv: 0, mult: effekt.wert });
      } else if (effekt.typ === 'faeule' || effekt.typ === 'brand') {
        // resolveZug summiert diese als Pool = Auflege-Menge; bricht Vollmond.
        gespielteSeiten.push({ typ: effekt.typ, stapel: effekt.wert, hoechstwert });
        letzterSchadenEffWert = 0;
      } else if (effekt.typ === 'glanz') {
        gespielteSeiten.push({ typ: 'glanz', hoechstwert }); // Nicht-Schaden-Seite: bricht Vollmond
        pendingGlanz = true;
        letzterSchadenEffWert = 0;
      } else if (effekt.typ === 'morsch' || effekt.typ === 'welk' || effekt.typ === 'kraft') {
        gespielteSeiten.push({ typ: effekt.typ, hoechstwert }); // bricht Vollmond, kein Pool
        letzterSchadenEffWert = 0;
        auflage[effekt.typ] += effekt.wert;
      } else if (effekt.typ === 'labung') {
        // Quell/Tau-Engine (04 §4.1): Basis + 1 je run-weitem Trösten, harter Cap +8.
        const bonus = Math.min(8, run.troestenZahl ?? 0);
        geheilt += effekt.wert + bonus;
        gespielteSeiten.push({ typ: 'labung', hoechstwert }); // Nicht-Schaden: bricht Vollmond
        letzterSchadenEffWert = 0;
      } else if (effekt.typ === 'praegung') {
        // Hort/Münzen-Engine (04 §4.2): feste Münzen je gespielter Seite (1 Atem ist die Bremse).
        gepraegt += effekt.wert;
        gespielteSeiten.push({ typ: 'praegung', hoechstwert });
        letzterSchadenEffWert = 0;
      } else if (effekt.typ === 'riss') {
        // Eigen-Riss (Wildwuchs, 04 §4): die Seite legt Riss auf den Spieler selbst.
        legeStatusAuf(kampf.spielerStatus, 'riss', effekt.wert);
        gespielteSeiten.push({ typ: 'riss', hoechstwert });
        letzterSchadenEffWert = 0;
      }
      // Beruhigung/Ermutigung folgen mit B5.
    }
  }

  // Morsch dieses Zugs boostet bereits diesen Zug (einmaliger Pool-Mult), Cap 4.
  // Welk auf dem Spieler (vom Gegner) senkt den eigenen Pool; Spieler-Welk trifft den Gegner.
  const morschStapel = Math.min(4, kampf.gegner.status.morsch + auflage.morsch);
  const welkStapel = kampf.spielerStatus.welk;
  const pools = resolveZug(gespielteSeiten, { morschStapel, welkStapel, region: 1 });
  kampf.combos = pools.combos; // Gleichklang/Vollmond für die Anzeige (UI)

  // Status-Auflage auf den Gegner (Fäule/Brand/Morsch/Welk) bzw. Spieler (Kraft-Selbst-Buff).
  if (pools.faeule > 0) legeStatusAuf(kampf.gegner.status, 'faeule', pools.faeule);
  if (pools.brand > 0) legeStatusAuf(kampf.gegner.status, 'brand', pools.brand);
  if (auflage.morsch > 0) legeStatusAuf(kampf.gegner.status, 'morsch', auflage.morsch);
  if (auflage.welk > 0) legeStatusAuf(kampf.gegner.status, 'welk', auflage.welk);
  if (auflage.kraft > 0) legeStatusAuf(kampf.spielerStatus, 'kraft', auflage.kraft);

  // Labung heilt (Cap hpMax), Prägung münzt — beide Engines wirken beim Auflösen.
  if (geheilt > 0) run.hp = Math.min(run.hpMax, run.hp + geheilt);
  if (gepraegt > 0) run.waehrungen.muenzen += gepraegt;
  kampf.geheilt = geheilt;
  kampf.gepraegt = gepraegt;

  // Gegner-Block halbiert eingehenden Schaden (Slice-Minimal, 05 §4 Wächter).
  const effektiverSchaden = kampf.gegner.absicht.typ === 'block' ? Math.floor(pools.schaden / 2) : pools.schaden;
  kampf.gegner.hp = Math.max(0, kampf.gegner.hp - effektiverSchaden);
  kampf.block = pools.rinde;
  kampf.aussetzer = aussetzer;

  // Zugende-Status: eigener Brand tickt (02 §2.2 Schritt 8).
  const brandSpieler = tickeBrand(kampf.spielerStatus);
  if (brandSpieler > 0) run.hp -= brandSpieler;

  kampf.zuletztGespielteIds = [...kampf.reihe];
  for (const id of kampf.reihe) {
    if (!kampf.gespielteImKampf.includes(id)) kampf.gespielteImKampf.push(id);
  }
  kampf.zieh = zugende({ ...kampf.zieh, hand: kampf.hand });
  kampf.hand = [];
  kampf.reihe = [];

  if (run.hp <= 0) {
    run.verloren = true;
    kampf.phase = 'niederlage';
  } else if (kampf.gegner.hp <= 0) {
    beendeKampf(run, kampf, true, rng);
  } else {
    kampf.phase = 'gegnerzug';
  }
  return pools;
}

// Gegnerzug: Fäule (Zug-Beginn) → Angriff (Kraft/Welk-moduliert) → Brand (Zug-Ende)
// → Rundenende-Decay. Rinde fängt Angriffsschaden, keinen Status (02 §2.3/§8).
export function fuehreGegnerzugAus(run, kampf, rng) {
  if (kampf.phase !== 'gegnerzug') return null;
  const status = kampf.gegner.status;

  // Gegnerzug-Beginn: Fäule tickt auf dem Gegner (kann ihn töten).
  const faeule = tickeFaeule(status);
  if (faeule > 0) {
    kampf.gegner.hp = Math.max(0, kampf.gegner.hp - faeule);
    if (kampf.gegner.hp <= 0) {
      beendeKampf(run, kampf, true, rng);
      return { erlitten: 0, faeule, brand: 0, besiegt: true };
    }
  }

  // Gegner handelt: Kraft-Buff hebt, Welk-Debuff senkt den Angriffswert (02 §8).
  const { absicht } = kampf.gegner;
  let erlitten = 0;
  if (absicht.typ === 'angriff') {
    const roh = Math.floor((absicht.wert + status.kraft) * welkMult(status.welk));
    erlitten = Math.max(0, roh - kampf.block);
    run.hp -= erlitten;
  }
  kampf.block = 0; // Rinde verfällt (02 §2.2 Schritt 9)

  // Gegnerzug-Ende: Brand tickt (kann ihn töten).
  const brand = tickeBrand(status);
  if (brand > 0) {
    kampf.gegner.hp = Math.max(0, kampf.gegner.hp - brand);
    if (kampf.gegner.hp <= 0) {
      beendeKampf(run, kampf, true, rng);
      return { erlitten, faeule, brand, besiegt: true };
    }
  }

  // Rundenende-Decay beider Seiten (02 §2.4).
  decayRundenende(status);
  decayRundenende(kampf.spielerStatus);

  kampf.gegner.zyklus += 1;
  kampf.gegner.absicht = naechsteAbsicht(kampf.gegner);

  if (run.hp <= 0) {
    run.verloren = true;
    kampf.phase = 'niederlage';
  } else {
    kampf.phase = 'zug';
  }
  return { erlitten, faeule, brand };
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
