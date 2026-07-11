// kampf.js — Kampf-Loop: verdrahtet engine/push/ziehstapel/data zum spielbaren
// Zug-Zyklus (02 §2). DOM-frei, Node-testbar; ui/ ruft diese Funktionen und
// rendert nur (09 §1: kein Spiellogik-Code in ui/ — darum lebt der Loop hier).
// Slice-Umfang: Region-1-Sequenz (9 Kämpfe, Kampf 9 = Elite), Werte aus der
// kalibrierten Stufe "mittel" (docs/Welle1_Tor_ReRun_12er_Befund.md).

import { resolveZug, welkMult, effektiverWert, vollmondPruefwert, eingehendMult } from './engine.js';
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
import { GEGNER_VORLAGEN, KLASSEN, HUETER_BASIS_HP, ATEM_PRO_ZUG, REGION_GEGNER, REGION_MAX, REGION_TUNING, REGION_HEILUNG_ANTEIL, REGION_HPMAX_BONUS, erstelleStartArsenal } from './data.js';
import { verdieneKampfBelohnung, zieheBelohnungsoptionen, zieheBossBelohnung } from './belohnung.js';
import { generiereKarte } from './karte.js';
import { TAU_PRO_REGION } from './knoten.js';
import { segenEffekt, segenEffekte, segenHaken, troestenBonus } from './segen.js';
import { reifegradMods } from './reifegrad.js';
import { drueckeFluchAuf } from './fluch.js';

// Gegner-Auswahl je Region: REGION_GEGNER (data.js, D1).

// --- Run --------------------------------------------------------------------

// setzlinge: gepflanzte Heimat-Hain-Boni (C5, meta.aktiveSetzlinge) — flache
// Start-Effekte; die Liste wandert als run.setzlinge mit (knoten.js liest sie).
export function starteRun(klasseId = 'eichwart', rng, { reifegrad = 0, setzlinge = [], maxRegion = REGION_MAX } = {}) {
  let hpMax = HUETER_BASIS_HP + KLASSEN[klasseId].hpMod;
  if (setzlinge.includes('tiefwurzel')) hpMax += 5;
  const arsenal = erstelleStartArsenal(klasseId);
  // Reifegrad-Start-Malus (03 §9 Stufe 2): Schreck auf einen zufälligen Würfel.
  const { startSchreck, startFluch } = reifegradMods(reifegrad);
  if (startSchreck > 0) {
    const ziel = arsenal[Math.floor(rng.naechsteZahl() * arsenal.length)];
    ziel.gemuet -= startSchreck;
  }
  // Mut-Trieb: ein zufälliger Würfel startet fröhlich (+2 Gemüt).
  if (setzlinge.includes('mut_trieb')) {
    const ziel = arsenal[Math.floor(rng.naechsteZahl() * arsenal.length)];
    ziel.gemuet += 2;
  }
  const run = {
    klasse: klasseId,
    reifegrad,
    setzlinge: [...setzlinge],
    region: 1,
    maxRegion, // Sims messen einzelne Regionen mit maxRegion: 1
    arsenal,
    hp: hpMax,
    hpMax,
    karte: generiereKarte(rng),
    positionKnotenId: null, // vor Reihe 1
    kampfNummer: 0, // abgeschlossene Kämpfe (Statistik)
    // Tau je Region (03 §8) + Tau-Wurzel-Setzling (+2 je Region-Eintritt, C5)
    waehrungen: { muenzen: 0, eicheln: 0, tau: TAU_PRO_REGION + (setzlinge.includes('tau_wurzel') ? 2 : 0) },
    belohnungenOhneBlaupause: 0, // Blaupause-Pity-Zähler (03 §10)
    entfernteWuerfel: 0, // treibt die Entfernen-Preiseskalation (07 §3.3)
    troestenZahl: 0, // run-weite Trösten-Ereignisse für Frühling — OHNE Ermutigung (01 §5)
    pflegeZahl: 0, // alle Gemüt-Pflege-Ereignisse (inkl. Ermutigung) — speist Labung (04 §4.1)
    hainSegen: [], // besessene Segen-IDs, einmalig je Run (07 §4)
    welkGrad: 0, // globaler Welk-Grad (09 §2.10, rein visuell — Dürre-Same treibt ihn)
    hinweise: [], // Zweifel-Hinweise aus R4/R5-Events (07 §5.3) — färben die Wendung (D4)
    wendungGesehen: false, // Wendungs-Szene an der Schwelle zu Region 6 (01 §4.3), einmalig
    verloren: false,
    abgeschlossen: false, // Boss besiegt
  };
  // Reifegrad 9 (03 §9): Start mit aufgedrücktem Fluch — die generische tote
  // Fluch-Seite (07 §5.4), seit E6 echt statt der +2-Schreck-Näherung.
  if (startFluch) drueckeFluchAuf(run, 'fluch_seite', rng);
  return run;
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

// Aktive Boss-Phase (05 §6): tiefste erreichte HP-Schwelle gewinnt. Phasen
// können Muster, Status-Auflagen und Treffer-Zahl wechseln (D2).
export function aktivePhase(gegner) {
  if (!gegner.phasen) return null;
  let aktiv = null;
  for (const phase of gegner.phasen) {
    if (gegner.hp / gegner.hpMax <= phase.abHpAnteil) aktiv = phase;
  }
  return aktiv;
}

// "Dein Spiegel" (Endboss Phase 3, 05 §7): Module aus den Top-N ängstlichsten
// Arsenal-Würfeln — Schaden = Summe der gesperrten (höchsten) Seiten × k (k=1),
// Spiegel-Status = 1 Scharte/Klemme je 3 Schreck (Cap 2, alternierend).
// N = min(3, Würfel mit Schreck > 0); N = 0 → ruhige Spiegelung (Standard-Moveset).
export function baueSpiegelModule(run) {
  const aengstliche = run.arsenal
    .filter((w) => schreck(w.gemuet) > 0)
    .sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))
    .slice(0, 3);
  return aengstliche.map((w, index) => {
    const gesperrt = bestimmeGesperrteSeitenIndizes(w);
    const schadenSumme = gesperrt.reduce((s, i) => s + w.seiten[i].wert, 0);
    const spiegelStapel = Math.min(2, Math.floor(schreck(w.gemuet) / 3));
    return {
      wuerfelId: w.id,
      // Modul ohne gesperrte Seiten (Schreck 1-2) schlägt mit dem Grund-Schreck zu.
      schaden: gesperrt.length > 0 ? schadenSumme : schreck(w.gemuet) * 2,
      status: spiegelStapel > 0 ? { typ: index % 2 === 0 ? 'scharte' : 'klemme', stapel: spiegelStapel, mit: 'angriff' } : null,
    };
  });
}

export function naechsteAbsicht(gegner) {
  // Boss-Twist "Erste Geduld" (05 §6): jede dritte Boss-Runde zwingend Block.
  if (gegner.mechanikIds?.includes('erste_geduld') && gegner.zyklus % 3 === 2) {
    return { typ: 'block', wert: gegner.schaden, angekuendigt: true };
  }
  // "Dein Spiegel": in Phase 3 rotiert der Endboss durch die Module (05 §7).
  if (gegner.spiegelModule?.length) {
    const modul = gegner.spiegelModule[gegner.zyklus % gegner.spiegelModule.length];
    return { typ: 'angriff', wert: modul.schaden, spiegelModul: modul, angekuendigt: true };
  }
  const phase = aktivePhase(gegner);
  let muster = phase?.absichtsMuster ?? gegner.absichtsMuster;
  const treffer = phase?.treffer ?? gegner.treffer ?? 1;
  // Wächter-Mehrfach (Saumhüter Phase 2): Wächter-Rotation, Angriffe als Doppel.
  if (muster === 'waechter_mehrfach') {
    return gegner.zyklus % 2 === 0
      ? { typ: 'block', wert: gegner.schaden, angekuendigt: true }
      : { typ: 'angriff', wert: gegner.schaden, treffer: 2, angekuendigt: true };
  }
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
  // Sieche (05 §4/§5): legt jeden zweiten Zyklus Status statt anzugreifen.
  if (muster === 'sieche') {
    return zyklus % 2 === 0
      ? { typ: 'sieche', wert: 0, angekuendigt: true }
      : { typ: 'angriff', wert: gegner.schaden, angekuendigt: true };
  }
  // Schläger→Sieche: zwei Angriffe, dann ein Status-Zyklus.
  if (muster === 'schlaeger_sieche') {
    return zyklus % 3 === 2
      ? { typ: 'sieche', wert: 0, angekuendigt: true }
      : { typ: 'angriff', wert: gegner.schaden, angekuendigt: true };
  }
  // Rasende: mehrere kleine Treffer (Summe = Schaden; Block wirkt je Treffer).
  if (muster === 'rasende') {
    return { typ: 'angriff', wert: gegner.schaden, treffer: treffer > 1 ? treffer : 2, angekuendigt: true };
  }
  return { typ: 'angriff', wert: gegner.schaden, angekuendigt: true }; // schlaeger
}

function baueGegner(vorlageId, rng, { schadenZuschlag = 0, reifegrad = 0 } = {}) {
  const vorlage = GEGNER_VORLAGEN[vorlageId];
  const mods = reifegradMods(reifegrad);
  // Voll-Run-Eichung (D8): zentrale Region-Mults über den Doc-Rohwerten.
  const tuning = REGION_TUNING[vorlage.region] ?? { hp: 1, schaden: 1 };
  // Reifegrad-Kurve (03 §9): HP-Mults je Rolle kumulativ mit dem globalen Mult.
  const rollenHpMult =
    vorlage.rolle === 'elite' ? mods.eliteHpMult : vorlage.rolle === 'boss' ? mods.bossHpMult : 1;
  const bossTuning = vorlage.rolle === 'boss' ? tuning.bossHp ?? 1 : 1;
  const hp = Math.round(zufallZwischen(rng, vorlage.hpBereich) * tuning.hp * bossTuning * rollenHpMult * mods.gegnerHpMult);
  const gegner = {
    vorlageId,
    nameKey: vorlage.nameKey,
    rolle: vorlage.rolle,
    hp,
    hpMax: hp,
    schaden:
      Math.round(
        zufallZwischen(rng, vorlage.schadenBereich) * tuning.schaden * (vorlage.rolle !== 'normal' ? mods.eliteBossSchadenMult : 1)
      ) + schadenZuschlag,
    absichtsMuster: vorlage.absichtsMuster,
    statusAuflagen: vorlage.statusAuflagen ?? [],
    treffer: vorlage.treffer ?? 1,
    mechanikIds: vorlage.mechanikIds ?? [],
    bossSchreck: vorlage.bossSchreckStart ?? null, // Trösten-Konto des Endboss (05 §8)
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
  const pool = REGION_GEGNER[run.region ?? 1] ?? REGION_GEGNER[1];
  const vorlageId =
    knotenTyp === 'boss'
      ? pool.boss
      : knotenTyp === 'elite'
        ? pool.elite[Math.floor(rng.naechsteZahl() * pool.elite.length)]
        : pool.normal[Math.floor(rng.naechsteZahl() * pool.normal.length)];
  // Doppelter-Morgen-Haken (07 §4.2 #11): Gegner starten mit +1 Absichtswert.
  const gegnerHaken = segenHaken(run, 'gegner_absichtswert');
  const kampf = {
    zieh: kampfbeginn(run.arsenal.map((w) => w.id), rng), // Übermut-Reset implizit unten
    gegner: baueGegner(vorlageId, rng, { schadenZuschlag: gegnerHaken?.wert ?? 0, reifegrad: run.reifegrad ?? 0 }),
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
    // Loser Ast (07 §4.2 #6): 1 übermut-freier Reroll je KAMPF.
    freischeineKampf: segenEffekt(run, 'freilauf_pro_kampf')?.wert ?? 0,
    griffGenutztDiesenZug: false, // Gieriger Griff: 1 freier bezahlter Reroll je ZUG
    // Dorfschamane "Zuversicht" (06 §3): 1 Ermutigung je Kampf kostet 0 Atem.
    gratisErmutigungRest: KLASSEN[run.klasse].passiv.gratisErmutigungProKampf ?? 0,
    gratisErmutigungGenutztFuer: null,
    phase: 'zug', // zug | gegnerzug | sieg | niederlage
  };

  // Kampfbeginn-Wetzung (Wetzstein 1 Würfel / Doppelter Morgen 2 Würfel) und
  // Kampfbeginn-Klemme (Krone-Haken). Slice-Vereinfachung: Eigen-Status liegen
  // spielerweit (B2-Modell), die Würfel-Anzahl wird als Stapelhöhe übersetzt.
  for (const wetzungSegen of segenEffekte(run, 'kampfbeginn_wetzung')) {
    legeStatusAuf(kampf.spielerStatus, 'wetzung', wetzungSegen.wuerfel * wetzungSegen.stapel);
  }
  const klemmeHaken = segenHaken(run, 'kampfbeginn_klemme');
  if (klemmeHaken) legeStatusAuf(kampf.spielerStatus, 'klemme', klemmeHaken.wuerfel * klemmeHaken.stapel);

  return kampf;
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
  // Boss-Twist "Auszehrung" (Auszehrer-Fürst, 05 §6): passives Welk 1 je
  // Rundenbeginn (Cap 4 via legeStatusAuf) — Prozent-Malus, sperrt nichts.
  if (kampf.gegner?.mechanikIds?.includes('auszehrung') && kampf.gegner.hp > 0) {
    legeStatusAuf(kampf.spielerStatus, 'welk', 1);
  }
  // Rundenbeginn-Status: eigene Fäule tickt (02 §2.2 Schritt 1).
  const faeuleVorTick = kampf.spielerStatus.faeule;
  const faeuleSchaden = tickeFaeule(kampf.spielerStatus);
  // Boss-Twist "Ausbreitung" (Modermutter-Brut, 05 §6): Fäule decayt nicht,
  // solange der Boss über 30 % HP hat — der Tick-Schaden bleibt, der −1 entfällt.
  if (
    kampf.gegner?.mechanikIds?.includes('ausbreitung') &&
    kampf.gegner.hp > kampf.gegner.hpMax * 0.3 &&
    faeuleVorTick > 0
  ) {
    kampf.spielerStatus.faeule = faeuleVorTick;
  }
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
  kampf.griffGenutztDiesenZug = false;
  // Ungeduld (07 §4.2 #13): +1 Atem je Zug — der Haken (Kristallisation 2:1) sitzt am Kampfende.
  kampf.atem = ATEM_PRO_ZUG + (segenEffekt(run, 'atem_pro_zug')?.wert ?? 0);
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
  // Freischeine (07 §4.2): Gieriger Griff macht den ersten BEZAHLTEN Reroll je
  // Zug frei; Loser Ast hält 1 freien Reroll je Kampf vor. Griff zuerst (zug-
  // lokal), damit der Kampf-Vorrat für spätere Züge erhalten bleibt.
  const griffFrei = segenEffekt(run, 'erster_bezahlter_reroll_frei') != null && !kampf.griffGenutztDiesenZug;
  const astFrei = (kampf.freischeineKampf ?? 0) > 0;
  // Schleiferin "Schliff" (06 §5): +1 Gratis-Reroll je Zug — wirkt wie
  // permanenter Freilauf 1 und verrechnet sich regulär gegen Klemme (02 §7.5).
  const passivFreilauf = KLASSEN[run.klasse].passiv.extraGratisRerolls ?? 0;
  const { state, tischsturz, freischeinGenutzt } = fuehreRerollAus(
    { uebermut: kampf.uebermut, rerollsDiesenZug: kampf.rerollsDiesenZug },
    { freilauf: kampf.spielerStatus.freilauf + passivFreilauf, klemme: kampf.spielerStatus.klemme },
    { freischein: griffFrei || astFrei }
  );
  if (freischeinGenutzt) {
    if (griffFrei) kampf.griffGenutztDiesenZug = true;
    else kampf.freischeineKampf -= 1;
  }
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
    // Reifegrad 7: Tischsturz-Selbstschaden +2 (03 §9).
    run.hp -= TISCHSTURZ_SELBSTSCHADEN + reifegradMods(run.reifegrad ?? 0).tischsturzZuschlag;
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
// Dorfschamane: die erste Ermutigungs-Seite je Kampf kostet 0 Atem (06 §3).
export function platziere(run, kampf, wuerfelId) {
  if (kampf.phase !== 'zug') return false;
  if (kampf.atem <= 0) return false;
  if (!kampf.hand.includes(wuerfelId) || kampf.reihe.includes(wuerfelId)) return false;
  const wuerfel = findeWuerfel(run, wuerfelId);
  const seite = wuerfel.seiten[kampf.wuerfe[wuerfelId]?.seitenIndex ?? 0];
  const istErmutigung = seite?.effekt?.some((e) => e.typ === 'ermutigung') ?? false;
  let kosten = wuerfel.atem;
  if (istErmutigung && kampf.gratisErmutigungRest > 0 && kampf.gratisErmutigungGenutztFuer == null) {
    kosten = 0;
    kampf.gratisErmutigungRest -= 1;
    kampf.gratisErmutigungGenutztFuer = wuerfelId;
  }
  kampf.reihe.push(wuerfelId);
  kampf.atem -= kosten;
  return true;
}

export function nimmZurueck(run, kampf, wuerfelId) {
  const index = kampf.reihe.indexOf(wuerfelId);
  if (index === -1) return false;
  kampf.reihe.splice(index, 1);
  if (kampf.gratisErmutigungGenutztFuer === wuerfelId) {
    // Gratis-Platzierung zurücknehmen: kein Atem zurück, Freischein wieder da.
    kampf.gratisErmutigungGenutztFuer = null;
    kampf.gratisErmutigungRest += 1;
  } else {
    kampf.atem += findeWuerfel(run, wuerfelId).atem;
  }
  return true;
}

// Auflösen L→R (02 §4), dann Hand ablegen. Baut das Paket aus den tatsächlich
// gefallenen Seiten-Effekten: Schaden/Rinde/Mult, Status-Auflage (Fäule/Brand/
// Morsch/Welk/Kraft), Glanz-Verdopplung und Riss-Aussetzer (02 §8).
export function loeseZugAuf(run, kampf, rng) {
  if (kampf.phase !== 'zug') return null;
  const passiv = KLASSEN[run.klasse].passiv;
  // Flaches Klassen-Passiv je Schaden-Seite (06): Eichwart/Rodbauer bedingungslos,
  // Dorfschamane "Zuversicht" nur für Würfel mit Gemüt ≥ 0 (Schreck streicht den Bonus).
  const passivFuer = (wuerfel) => {
    if (passiv.typ === 'schaden_flach') return passiv.wert;
    if (passiv.typ === 'zuversicht') return wuerfel.gemuet >= (passiv.nurGemuetAb ?? 0) ? passiv.schadenFlach : 0;
    return 0;
  };
  const spielerKraft = kampf.spielerStatus.kraft; // gilt für alle Schaden-Seiten dieses Zugs
  // Wetzung/Scharte (Eigen-Status) setzen den effektiven Wert JEDER gewürfelten Seite
  // (Schaden/Rinde) beim Wurf, Untergrenze 1 (02 §2.2/§8.2). Schleiferin-Schliff ist
  // der permanente Klassen-Sockel: hebt den effektiven Wert, speist Vollmond aber
  // NICHT (02 §10.3 / 06 §5 Vollmond-Ausnahme) — daher getrennter Prüfwert.
  const { wetzung, scharte } = kampf.spielerStatus;
  const klassenSockel = passiv.typ === 'schliff' ? passiv.klassenSockel : 0;

  const gespielteSeiten = [];
  const auflage = { morsch: 0, welk: 0, kraft: 0 }; // Pool-fremde Status (resolveZug ignoriert sie)
  let pendingGlanz = false;
  let aussetzer = 0;
  let letzterSchadenEffWert = 0; // effektiver Wert der zuletzt gelegten echten Schaden-Seite (für Echo-Gleichklang)
  let geheilt = 0; // Labung (Quell) — Tau-Engine, direkt auf run.hp
  let gepraegt = 0; // Prägung (Hort) — Münzen-Engine, direkt auf run.waehrungen
  let getroestet = 0; // Beruhigung/Ermutigung dieses Zugs (Anzeige)
  let ersteRindeGespielt = false; // Rindenring-Segen: erster Rinde-Würfel je Zug

  // Auto-Ziel der Pflege-Seiten (Slice): Hand-Würfel mit dem niedrigsten Gemüt.
  // Beruhigung ist reaktiv und verlangt Schreck > 0 (02 §6.3); Ermutigung ist
  // universell (02 §6.4). Beide: +`wert` Gemüt (universelle Trösten-Regel +2).
  const pflegeZiel = (nurMitSchreck) => {
    const kandidaten = kampf.hand
      .map((id) => findeWuerfel(run, id))
      .filter((w) => !nurMitSchreck || schreck(w.gemuet) > 0);
    return kandidaten.sort((a, b) => a.gemuet - b.gemuet)[0] ?? null;
  };

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
        const effWert = effektiverWert(effekt.wert, { wetzung, scharte, klassenSockel });
        gespielteSeiten.push({
          typ: 'schaden',
          effektiverWert: effWert,
          // Wetzung ermöglicht Vollmond, Scharte bricht ihn; der Schliff-Sockel
          // zählt bewusst nicht mit (Vollmond-Ausnahme, 06 §5).
          vollmondWert: vollmondPruefwert(effekt.wert, { wetzung, scharte }),
          hoechstwert,
          kraft: spielerKraft,
          passiv: passivFuer(w),
          glanz: pendingGlanz, // Glanz verdoppelt die nächste gespielte Schaden-Seite
        });
        pendingGlanz = false;
        letzterSchadenEffWert = effWert;
      } else if (effekt.typ === 'schaden_doppel') {
        // Doppelschlag (04 §3.2): zwei volle Schaden-Seiten (beide Kraft/Passiv,
        // beide Gleichklang-fähig) für EINE Atemzahlung. Riss prüft je Teil-Seite,
        // Glanz verdoppelt nur die erste. Der Wurf zeigt die Teilwerte, nie den
        // Höchstwert — Doppelschlag bricht Vollmond (bewusster Trade, 04 §5).
        for (const teilwert of effekt.wert) {
          if (kampf.spielerStatus.riss > 0 && rng.naechsteZahl() < 0.25) {
            aussetzer += 1;
            continue;
          }
          const effWert = effektiverWert(teilwert, { wetzung, scharte, klassenSockel });
          gespielteSeiten.push({
            typ: 'schaden',
            effektiverWert: effWert,
            vollmondWert: vollmondPruefwert(teilwert, { wetzung, scharte }),
            hoechstwert,
            kraft: spielerKraft,
            passiv: passivFuer(w),
            glanz: pendingGlanz,
          });
          pendingGlanz = false;
          letzterSchadenEffWert = effWert;
        }
      } else if (effekt.typ === 'echo') {
        // Echo kopiert den Beitrag der unmittelbar links platzierten Schaden-Seite
        // (Cap 1× Quelle, resolveZug); zählt für Gleichklang mit deren Wert. Der
        // Echo-Wurf selbst zeigt seinen 0-Wert → bricht Vollmond (vollmondWert 0).
        gespielteSeiten.push({ typ: 'schaden', istEcho: true, effektiverWert: letzterSchadenEffWert, vollmondWert: 0, hoechstwert });
        letzterSchadenEffWert = 0;
      } else if (effekt.typ === 'rinde') {
        // Rindenring (07 §4.2 #2): der erste gespielte Rinde-Würfel je Zug gibt +2 Block.
        let rindeWert = effektiverWert(effekt.wert, { wetzung, scharte, klassenSockel }); // Schliff hebt alle Pools
        if (!ersteRindeGespielt && segenEffekt(run, 'erster_rinde_wuerfel_bonus')) {
          rindeWert += segenEffekt(run, 'erster_rinde_wuerfel_bonus').wert;
        }
        ersteRindeGespielt = true;
        gespielteSeiten.push({ typ: 'rinde', effektiverWert: rindeWert, hoechstwert });
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
        // Quell/Tau-Engine (04 §4.1): Basis + 1 je Gemüt-Pflege-Ereignis (inkl.
        // Ermutigung — Default der Kopplungsfrage), harter Cap +8.
        const bonus = Math.min(8, run.pflegeZahl ?? run.troestenZahl ?? 0);
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
      } else if (effekt.typ === 'gegner_riss') {
        // Bruchstelle (04 §3.2): Riss gespiegelt auf den GEGNER — seine Aktionen
        // setzen 2 Runden lang zu 25 % aus (fuehreGegnerzugAus); Neubelegung
        // erneuert das Fenster (legeStatusAuf-Riss-Regel, 02 §8.1).
        legeStatusAuf(kampf.gegner.status, 'riss', effekt.wert);
        gespielteSeiten.push({ typ: 'gegner_riss', hoechstwert });
        letzterSchadenEffWert = 0;
      } else if (effekt.typ === 'fluch_faeule' || effekt.typ === 'fluch_scharte' || effekt.typ === 'fluch_stumpf') {
        // Fluch-Seiten (07 §5.4, fluch.js): der Nachteil trifft den Hüter selbst.
        // Fäule tickt ab dem nächsten Zugbeginn; Scharte 2 überlebt den Rundenende-
        // Decay mit 1 Stapel und stumpft den nächsten Zug ab; Stumpf tut nichts —
        // alle drei sind Nicht-Schaden-Seiten und brechen Vollmond.
        if (effekt.typ === 'fluch_faeule') legeStatusAuf(kampf.spielerStatus, 'faeule', effekt.wert);
        if (effekt.typ === 'fluch_scharte') legeStatusAuf(kampf.spielerStatus, 'scharte', effekt.wert);
        gespielteSeiten.push({ typ: effekt.typ, hoechstwert });
        letzterSchadenEffWert = 0;
      } else if (effekt.typ === 'beruhigung' || effekt.typ === 'ermutigung') {
        // Trösten-Auflösung (05 §8, D3): in der Spiegel-Phase des Endboss richten
        // sich Pflege-Seiten GEGEN den Boss — jedes Ereignis senkt bossSchreck um 2;
        // bei <= 0 ist er befriedet und der Kampf endet ohne Kill (Frühling-Pfad).
        if (
          kampf.gegner.bossSchreck != null &&
          kampf.gegner.bossSchreck > 0 &&
          kampf.gegner.spiegelModule != null
        ) {
          kampf.gegner.bossSchreck -= 2;
          kampf.bossGetroestet = (kampf.bossGetroestet ?? 0) + 1;
          run.troestenZahl = (run.troestenZahl ?? 0) + 1; // gezieltes Trösten (01 §5)
          run.pflegeZahl = (run.pflegeZahl ?? 0) + 1;
          gespielteSeiten.push({ typ: effekt.typ, hoechstwert });
          letzterSchadenEffWert = 0;
          continue;
        }
        // Pflege-Seiten (02 §6.3/§6.4): +Gemüt auf den ängstlichsten Hand-Würfel.
        // Beruhigung verpufft ohne Schreck-Ziel (reaktiv); Ermutigung wirkt immer.
        // Zähler: troestenZahl (Frühling, 01 §5) zählt Ermutigung NICHT mit;
        // pflegeZahl (Labung-Futter, 04 §4.1) zählt beide.
        const ziel = pflegeZiel(effekt.typ === 'beruhigung');
        if (ziel) {
          ziel.gemuet += effekt.wert + troestenBonus(run); // Klarer Quell: universell +3 statt +2
          getroestet += 1;
          run.pflegeZahl = (run.pflegeZahl ?? 0) + 1;
          if (effekt.typ === 'beruhigung') run.troestenZahl = (run.troestenZahl ?? 0) + 1;
        }
        gespielteSeiten.push({ typ: effekt.typ, hoechstwert }); // Nicht-Schaden: bricht Vollmond
        letzterSchadenEffWert = 0;
      }
    }
  }

  // Morsch dieses Zugs boostet bereits diesen Zug (einmaliger Pool-Mult), Cap 4.
  // Welk auf dem Spieler (vom Gegner) senkt den eigenen Pool; Spieler-Welk trifft den Gegner.
  const morschStapel = Math.min(4, kampf.gegner.status.morsch + auflage.morsch);
  const welkStapel = kampf.spielerStatus.welk;
  // Splitternde Borke (07 §4.2 #9): Vollmond-Burst +50 % — flach auf den Burst.
  const borke = segenEffekt(run, 'vollmond_burst_prozent');
  const pools = resolveZug(gespielteSeiten, {
    morschStapel,
    welkStapel,
    region: run.region ?? 1,
    vollmondBurstMult: borke ? 1 + borke.wert / 100 : 1,
    // Glöckner "Widerhall" (06 §4): +flach auf den Pool, wenn Gleichklang zündet.
    gleichklangFlachBonus: passiv.typ === 'widerhall' ? passiv.schadenFlach : 0,
  });
  kampf.combos = pools.combos; // Gleichklang/Vollmond für die Anzeige (UI)

  // Borke-Haken: jeder Zug MIT Schaden-Seiten, aber OHNE Vollmond → Scharte 1
  // (Slice: spielerweiter Eigen-Status, decayt am Rundenende).
  if (borke && !pools.combos.vollmond && gespielteSeiten.some((s) => s.typ === 'schaden' && !s.mult)) {
    legeStatusAuf(kampf.spielerStatus, 'scharte', 1);
  }

  // Stiller Hain (07 §4.2 #14): +15 % Schaden, solange Arsenal-Gesamt-Schreck = 0
  // (flach, konditional; schaltet sich bei Schreck > 0 selbst ab).
  const hain = segenEffekt(run, 'schaden_prozent_bei_null_schreck');
  if (hain && arsenalSchreckSumme(run) === 0) {
    pools.schaden = Math.floor(pools.schaden * (1 + hain.wert / 100));
  }

  // Status-Auflage auf den Gegner (Fäule/Brand/Morsch/Welk) bzw. Spieler (Kraft-Selbst-Buff).
  if (pools.faeule > 0) legeStatusAuf(kampf.gegner.status, 'faeule', pools.faeule);
  if (pools.brand > 0) legeStatusAuf(kampf.gegner.status, 'brand', pools.brand);
  if (auflage.morsch > 0) legeStatusAuf(kampf.gegner.status, 'morsch', auflage.morsch);
  if (auflage.welk > 0) legeStatusAuf(kampf.gegner.status, 'welk', auflage.welk);
  if (auflage.kraft > 0) legeStatusAuf(kampf.spielerStatus, 'kraft', auflage.kraft);

  // Labung heilt (Cap hpMax), Prägung münzt — beide Engines wirken beim Auflösen.
  // Reifegrad 6: Heilung −25 % (03 §9) — trifft alle Heilquellen.
  if (geheilt > 0) {
    geheilt = Math.floor(geheilt * reifegradMods(run.reifegrad ?? 0).heilungMult);
    run.hp = Math.min(run.hpMax, run.hp + geheilt);
  }
  if (gepraegt > 0) run.waehrungen.muenzen += gepraegt;
  kampf.geheilt = geheilt;
  kampf.gepraegt = gepraegt;
  kampf.getroestet = getroestet;

  // Befriedung (05 §8): bossSchreck <= 0 in der Spiegel-Phase → der Kampf endet
  // ohne Kill; der Hüter wird getröstet, nicht erschlagen.
  if (kampf.gegner.bossSchreck != null && kampf.gegner.bossSchreck <= 0 && kampf.gegner.spiegelModule != null) {
    kampf.befriedet = true;
    run.bossBefriedet = true;
    kampf.zuletztGespielteIds = [...kampf.reihe];
    kampf.zieh = zugende({ ...kampf.zieh, hand: kampf.hand });
    kampf.hand = [];
    kampf.reihe = [];
    beendeKampf(run, kampf, true, rng);
    return pools;
  }

  // Gegner-Block halbiert eingehenden Schaden (Slice-Minimal, 05 §4 Wächter).
  const effektiverSchaden = kampf.gegner.absicht.typ === 'block' ? Math.floor(pools.schaden / 2) : pools.schaden;
  kampf.gegner.hp = Math.max(0, kampf.gegner.hp - effektiverSchaden);
  // Hamsterherz-Übertrag (bereits auf Cap 5 gedeckelt) stapelt mit frischer Rinde.
  kampf.block = (segenEffekt(run, 'rinde_uebertrag') ? kampf.block : 0) + pools.rinde;
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

  // Selbst-Buffs (z. B. Kraft-Eskalation, 05 §5): jede Runde, unabhängig von der Aktion.
  // Boss-Phasen (D2) können den Auflagen-Satz austauschen.
  const mods = reifegradMods(run.reifegrad ?? 0);
  const auflagen = aktivePhase(kampf.gegner)?.statusAuflagen ?? kampf.gegner.statusAuflagen ?? [];
  for (const auflage of auflagen) {
    if (auflage.mit === 'selbst') legeStatusAuf(status, auflage.typ, auflage.stapel);
  }
  // Status auf den Hüter legen (D1): Reifegrad 8 gibt Normalgegnern +1 Stapel/Anwendung.
  // eskaliert (Modermutter-Brut Phase 2, 05 §6): Auflage wächst +1 je Boss-Zyklus.
  const statusTuning = REGION_TUNING[run.region ?? 1]?.status ?? 1;
  const legeAufHueter = (auflage) => {
    const zuschlag = kampf.gegner.rolle === 'normal' ? mods.gegnerStatusZuschlag : 0;
    const eskalation = auflage.eskaliert ? (kampf.gegner.eskalation ?? 0) : 0;
    // D8-Dämpfer: spätere Regionen bündeln Debuffs — der Tuning-Knopf hält die
    // Dichte spielbar (mindestens 1 Stapel bleibt immer).
    const stapel = Math.max(1, Math.round(auflage.stapel * statusTuning));
    legeStatusAuf(kampf.spielerStatus, auflage.typ, stapel + zuschlag + eskalation);
  };

  // Gegner handelt: Kraft-Buff hebt, Welk-Debuff senkt den Angriffswert (02 §8).
  // Bruchstelle-Spiegelung (04 §3.2): Riss auf dem GEGNER lässt seine ganze
  // Aktion zu 25 % aussetzen — das Gegenstück zum Zünd-Aussetzer des Hüters
  // (02 §8.1: dort je Seite; der Gegner spielt eine Aktion je Runde).
  const { absicht } = kampf.gegner;
  let erlitten = 0;
  let blockRest = kampf.block;
  const aufgelegt = [];
  const ausgesetzt = status.riss > 0 && rng.naechsteZahl() < 0.25;
  kampf.gegnerAussetzer = ausgesetzt; // Anzeige (UI)
  if (ausgesetzt) {
    // Die Aktion verpufft — weder Schaden noch Aktions-gebundene Auflagen.
  } else if (absicht.typ === 'sieche') {
    // Sieche-Zyklus: kein Schaden, dafür Status auf den Hüter (05 §5).
    for (const auflage of auflagen) {
      if ((auflage.mit ?? 'sieche') === 'sieche') {
        legeAufHueter(auflage);
        aufgelegt.push(auflage.typ);
      }
    }
  } else if (absicht.typ === 'angriff') {
    // Gegner-Kraft hebt, Spieler-Welk auf dem Gegner senkt; Gegner-Morsch auf
    // dem HÜTER verstärkt den Einschlag (Option A, 05 §2.1) — alles vor Block.
    const roh = Math.floor(
      (absicht.wert + status.kraft) * welkMult(status.welk) * eingehendMult(kampf.spielerStatus.morsch)
    );
    // Rasende: N kleine Treffer (Summe = roh), Block wirkt je Treffer fortlaufend —
    // Block ist gegen viele kleine Treffer stärker als gegen einen großen.
    const anzahl = absicht.treffer ?? 1;
    const basis = Math.floor(roh / anzahl);
    let block = kampf.block;
    for (let t = 0; t < anzahl; t += 1) {
      const hieb = basis + (t === 0 ? roh - basis * anzahl : 0); // Rest auf den ersten Treffer
      const durch = Math.max(0, hieb - block);
      block = Math.max(0, block - hieb);
      erlitten += durch;
    }
    blockRest = block;
    run.hp -= erlitten;
    // "Angriff + Status" (05 §5): Auflagen, die mit dem Treffer kommen.
    for (const auflage of auflagen) {
      if (auflage.mit === 'angriff') {
        legeAufHueter(auflage);
        aufgelegt.push(auflage.typ);
      }
    }
    // Spiegel-Modul (05 §7): die zurückkehrende Furcht des gespiegelten Würfels.
    if (absicht.spiegelModul?.status) {
      legeAufHueter(absicht.spiegelModul.status);
      aufgelegt.push(absicht.spiegelModul.status.typ);
    }
  }
  // Rinde verfällt (02 §2.2 Schritt 9) — außer Hamsterherz (07 §4.2 #12):
  // bis zu `cap` Rest-Block überdauert den Zug (der Cap ist die Bremse).
  const hamster = segenEffekt(run, 'rinde_uebertrag');
  kampf.block = hamster ? Math.min(hamster.cap, blockRest) : 0;

  // Gegnerzug-Ende: Brand tickt (kann ihn töten). Auflodern-Gegengewicht
  // (Schwelbrand, 05 §6): Brand auf DIESEM Boss zündet doppelt.
  let brand = tickeBrand(status);
  if (kampf.gegner.mechanikIds?.includes('auflodern')) brand *= 2;
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

  // Boss-Twists am Rundenende (05 §6, D2):
  // Auflodern: Grundschaden +1 kumulativ — der Kampf MUSS vorankommen.
  // D8-Eichung: +1 je ZWEI Runden (volle Rate war gegen die reale Spieler-
  // Skalierung eine unschaffbare Uhr) [PROVISORISCH].
  if (kampf.gegner.mechanikIds?.includes('auflodern') && kampf.gegner.zyklus % 2 === 1) {
    kampf.gegner.schaden += 1;
  }
  // "Das hohle Echo" (Endboss, 05 §6): heilt um das Rest-Übermut des Hüters —
  // Gier füttert ihn wörtlich; boss-lokal, rührt die Kristallisation nicht an.
  if (kampf.gegner.mechanikIds?.includes('hohles_echo') && kampf.uebermut > 0) {
    kampf.gegner.hp = Math.min(kampf.gegner.hpMax, kampf.gegner.hp + kampf.uebermut);
    kampf.hohlesEchoGeheilt = kampf.uebermut; // Anzeige
  }
  // "Dein Spiegel" (05 §7): beim Eintritt in Phase 3 (< 33 %) werden die Module
  // einmalig aus dem AKTUELLEN Arsenal gebaut; N = 0 → ruhige Spiegelung.
  if (
    kampf.gegner.mechanikIds?.includes('dein_spiegel') &&
    kampf.gegner.spiegelModule == null &&
    kampf.gegner.hp > 0 &&
    kampf.gegner.hp / kampf.gegner.hpMax <= 0.33
  ) {
    kampf.gegner.spiegelModule = baueSpiegelModule(run);
  }
  // Enge Pforte: Übermut > 0 ins Rundenende → +1 Schreck auf einen zufälligen
  // Würfel (angekündigte Gier-Strafe; rein spieler-erzeugt, Anti-Brick).
  if (kampf.gegner.mechanikIds?.includes('enge_pforte') && kampf.uebermut > 0) {
    const ziel = run.arsenal[Math.floor(rng.naechsteZahl() * run.arsenal.length)];
    ziel.gemuet -= 1;
    kampf.engePforteZuletzt = ziel.id; // Anzeige
  }
  // Eskalations-Zähler läuft nur, während eine eskalierte Auflage AKTIV ist
  // (05 §6: "Auflege +1/Zyklus" gilt ab Phase-2-Eintritt, nicht ab Kampfbeginn).
  if (auflagen.some((a) => a.eskaliert)) {
    kampf.gegner.eskalation = (kampf.gegner.eskalation ?? 0) + 1;
  }

  kampf.gegner.zyklus += 1;
  kampf.gegner.absicht = naechsteAbsicht(kampf.gegner);

  if (run.hp <= 0) {
    run.verloren = true;
    kampf.phase = 'niederlage';
  } else {
    kampf.phase = 'zug';
  }
  return { erlitten, faeule, brand, aufgelegt, ausgesetzt };
}

// Region-Übergang (D1, 07 §1.5): neue Karte, Tau-Zufluss (Basis + Segen +
// Setzling), Welk-Grad steigt (visuell, 09 §2.10; Dürre-Same-Haken zusätzlich).
// Kampf-Status/Block/Übermut sind kampf-lokal und tragen nie über (02 §2.5).
export function betreteNaechsteRegion(run, rng) {
  run.region = (run.region ?? 1) + 1;
  run.karte = generiereKarte(rng);
  run.positionKnotenId = null;
  // Rast am Regionstor (D8) [GESPERRT — Tor-3-Abnahme 2026-07-07]: der Hüter
  // wächst mit dem Weg (+Max-HP), dann Heilung x Reifegrad-6-Malus.
  run.hpMax += REGION_HPMAX_BONUS;
  const heilung = Math.round(run.hpMax * REGION_HEILUNG_ANTEIL * reifegradMods(run.reifegrad ?? 0).heilungMult);
  run.hp = Math.min(run.hpMax, run.hp + heilung);
  let tau = TAU_PRO_REGION + (run.setzlinge?.includes('tau_wurzel') ? 2 : 0);
  const segenBonus = segenEffekt(run, 'tau_einkommen');
  if (segenBonus?.je === 'region') tau += segenBonus.wert;
  const segenMalus = segenHaken(run, 'tau_einkommen');
  if (segenMalus?.je === 'region') tau += segenMalus.wert;
  run.waehrungen.tau += Math.max(0, tau);
  run.welkGrad = (run.welkGrad ?? 0) + 1 + (segenHaken(run, 'welk_grad_pro_region')?.wert ?? 0);
  return run;
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
    // Sauberer Sieg +2 statt +1: Segen "Geduldiger Wächter" (07 §4.2 #7) oder
    // Dorfschamane-Passiv (06 §3) — nicht stapelnd, der höhere gilt.
    sauberSiegBonus: Math.max(
      segenEffekt(run, 'sauber_sieg_gemuet')?.wert ?? 1,
      KLASSEN[run.klasse].passiv.sauberSiegBonus ?? 1
    ),
    kristallisation: {
      // Ungeduld-Haken: 2:1 statt 1:1; Gieriger-Griff-Haken: +1 Schreck-Rest.
      verhaeltnis: segenHaken(run, 'kristallisation_verhaeltnis')?.wert ?? 1,
      zuschlag: segenHaken(run, 'kristallisation_zuschlag')?.wert ?? 0,
    },
  });
  for (const neu of verarbeitet) {
    findeWuerfel(run, neu.id).gemuet = neu.gemuet;
  }
  kampf.sauberSieg = sauberSieg;
  kampf.kristallisiert = kampf.uebermut;
  kampf.phase = 'sieg';

  const rolle = kampf.gegner.rolle;
  // Endboss (05 §6): keine Item-Belohnung — die Sonder-Belohnung ist das Ende.
  // Gilt nur für den ECHTEN Region-6-Boss; maxRegion < 6 (Sim-Pins) beendet den
  // Run regulär mit Belohnung.
  const istEndboss = rolle === 'boss' && (run.region ?? 1) >= REGION_MAX;
  if (istEndboss) {
    kampf.belohnung = null;
    run.kampfNummer += 1;
    run.abgeschlossen = true;
    return;
  }
  // Dürre-Same (07 §4.2 #16): +2 Münzen je Kill (Ein-Gegner-Slice: je Kampf-Sieg).
  const killGeld = segenEffekt(run, 'muenzen_pro_kill');
  if (killGeld) run.waehrungen.muenzen += killGeld.wert;
  kampf.belohnung = {
    einkommen: verdieneKampfBelohnung(run, rng, {
      elite: rolle !== 'normal',
      // Geduldiger-Wächter-Haken: Kämpfe mit HP-Verlust geben keinen Eicheln-Bonus.
      hpVerlust: run.hp < kampf.hpBeiKampfbeginn,
    }),
    // Boss-Sonder-Belohnung: Blaupausen + 1 Boss-Segen (05 §6, 07 §4.3);
    // Elite garantiert ≥1 Segen-Angebot (07 §4.3).
    optionen:
      rolle === 'boss'
        ? zieheBossBelohnung(run, rng)
        : zieheBelohnungsoptionen(run, rng, { garantierterSegen: rolle === 'elite' }),
  };

  run.kampfNummer += 1;
  if (rolle === 'boss') {
    // Endboss ist oben abgehandelt. Sim-Pin (maxRegion < 6): Run endet hier
    // regulär MIT Belohnung; sonst Übergang in die nächste Region (D1).
    if ((run.region ?? 1) >= (run.maxRegion ?? REGION_MAX)) {
      run.abgeschlossen = true;
    } else {
      betreteNaechsteRegion(run, rng);
      kampf.regionGeschafft = run.region; // Anzeige: "Region N erreicht"
    }
  }
  // Keine Auto-Heilung mehr — Heilung ist strukturell (Lagerfeuer, 07 §1.3);
  // Nach-Eichung der Schwierigkeit gegen die neue Struktur ist Etappe A8.
}

// --- Anzeige-Helfer (rein lesend) ----------------------------------------------

export function arsenalSchreckSumme(run) {
  return run.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0);
}
