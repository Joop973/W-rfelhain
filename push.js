// push.js — Übermut, Reroll, Tischsturz, Schreck/Gemüt, Kristallisation.
// DOM-frei, reine Funktionen. Operiert auf Würfel-Objekten { id, gemuet, seiten, ... } (09 §2.2).

export const KIPP_PUNKT = 6; // 02 §7 / 03 §4
export const STANDARD_GRATIS_REROLLS = 1;
export const TISCHSTURZ_SCHRECK = 2;
export const TISCHSTURZ_SELBSTSCHADEN = 3;
export const KRISTALLISATION_VERHAELTNIS = 1; // 1:1, 03 §4

// --- Schreck & Gemüt (02 §6, 03 §5) ---------------------------------------

export function schreck(gemuet) {
  return Math.max(0, -gemuet);
}

const SCHRECK_SPERR_KURVE = [
  { schwelle: 9, gesperrt: 3 },
  { schwelle: 6, gesperrt: 2 },
  { schwelle: 3, gesperrt: 1 },
];

// Kurve "mittel": 1 Seite ab Schreck 3, 2 ab 6, 3 ab 9 (max 3).
export function gesperrteSeitenAnzahl(schreckWert) {
  const stufe = SCHRECK_SPERR_KURVE.find(({ schwelle }) => schreckWert >= schwelle);
  return stufe ? stufe.gesperrt : 0;
}

// Sperrt die höchsten freien Seiten; bei Wertgleichheit gewinnt der niedrigere
// Index (links zuerst) — deterministisch, auch bei Wert-0-Seiten (04 §1.1).
export function bestimmeGesperrteSeitenIndizes(wuerfel) {
  const anzahl = gesperrteSeitenAnzahl(schreck(wuerfel.gemuet));
  if (anzahl === 0) return [];
  return wuerfel.seiten
    .map((seite, index) => ({ index, wert: seite.wert }))
    .sort((a, b) => b.wert - a.wert || a.index - b.index)
    .slice(0, anzahl)
    .map((s) => s.index);
}

export function push(wuerfel) {
  return { ...wuerfel, gemuet: wuerfel.gemuet - 1 };
}

// Universelle Trösten-Regel: 1 Trösten = +2 Gemüt, gleich auf welchem Kanal (02 §6.1).
// bonus: Segen "Klarer Quell" hebt universell auf +3 (07 §4.2 #10).
export function troeste(wuerfel, bonus = 0) {
  return { ...wuerfel, gemuet: wuerfel.gemuet + 2 + bonus };
}

// Beruhigung ist reaktiv — greift nur bei Würfeln mit Schreck > 0 (02 §6.3).
export function beruhige(wuerfel) {
  if (schreck(wuerfel.gemuet) <= 0) return { wuerfel, angewendet: false };
  return { wuerfel: troeste(wuerfel), angewendet: true };
}

// Ermutigung ist proaktiv — wirkt immer, auch bei Gemüt ≥ 0 (02 §6.4).
export function ermutige(wuerfel) {
  return { wuerfel: troeste(wuerfel), angewendet: true };
}

// bonus: Segen "Geduldiger Wächter" hebt den Sauberer-Sieg-Bonus auf +2 (07 §4.2 #7).
export function wendeSauberenSiegAn(gespielteWuerfel, bonus = 1) {
  return gespielteWuerfel.map((w) => ({ ...w, gemuet: w.gemuet + bonus }));
}

// --- Reroll-Ökonomie & Tischsturz (02 §7) ---------------------------------

// Übermut-Kosten des n-ten Rerolls diesen Zug. Freilauf-Freischüsse werden
// zuerst gegen Klemme-Aufschläge verrechnet (02 §7.5): Netto-Klemme =
// max(0, Klemme−Freilauf) verteuerte erste Rerolls, Netto-Freilauf =
// max(0, Freilauf−Klemme) echte zusätzliche Gratis-Rerolls.
export function rerollKosten(rerollNummer, { freilauf = 0, klemme = 0 } = {}) {
  const gratisRerolls = STANDARD_GRATIS_REROLLS + Math.max(0, freilauf - klemme);
  const effektiveKlemme = Math.max(0, klemme - freilauf);
  const basis = rerollNummer <= gratisRerolls ? 0 : 1;
  const klemmeAufschlag = rerollNummer <= effektiveKlemme ? 1 : 0;
  return basis + klemmeAufschlag;
}

// kampfState: { uebermut, rerollsDiesenZug }. Löst bei Übermut > Kipp-Punkt
// sofort Tischsturz aus; der Reset gilt nur für diese Sofort-Mechanik (02 §7).
// freischein: macht einen bezahlten Reroll kostenlos (Segen "Gieriger Griff"
// je Zug / "Loser Ast" je Kampf, 07 §4.2) — freischeinGenutzt meldet Verbrauch.
export function fuehreRerollAus(kampfState, eigenStatus = {}, { freischein = false } = {}) {
  const rerollNummer = kampfState.rerollsDiesenZug + 1;
  let kosten = rerollKosten(rerollNummer, eigenStatus);
  const freischeinGenutzt = freischein && kosten > 0;
  if (freischeinGenutzt) kosten = 0;
  const uebermutNach = kampfState.uebermut + kosten;
  const tischsturz = uebermutNach > KIPP_PUNKT;
  return {
    state: {
      ...kampfState,
      rerollsDiesenZug: rerollNummer,
      uebermut: tischsturz ? 0 : uebermutNach,
    },
    kosten,
    tischsturz,
    freischeinGenutzt,
  };
}

// +2 Schreck auf die ganze Hand (nicht nur gespielte Würfel), 02 §7.1.
// Zug-Paket-Verfall und Selbstschaden (TISCHSTURZ_SELBSTSCHADEN) sind Sache
// des Kampf-Loops — push.js liefert nur die Würfel-Konsequenz.
export function loeseTischsturzAus(handWuerfel) {
  return handWuerfel.map((w) => ({ ...w, gemuet: w.gemuet - TISCHSTURZ_SCHRECK }));
}

// --- Kristallisation (02 §7.2/§7.3, 03 §4.1) ------------------------------

// Rest-Übermut (>0), das nicht in Tischsturz mündete, wird 1:1 als Gemüt-Abzug
// auf die zuletzt gespielten Würfel verteilt (round-robin, Summe = uebermutRest).
// Tischsturz und Kristallisation schließen sich pro Kampf aus: löste der letzte
// Reroll einen Tischsturz aus, ist uebermut bereits auf 0 zurückgesetzt (s. o.),
// sodass hier nichts mehr zu verteilen bleibt — keine Sonderfallprüfung nötig.
// Segen-Haken (07 §4.2): verhaeltnis 2 = "Ungeduld" (2:1 statt 1:1),
// zuschlag +1 = "Gieriger Griff" (+1 Schreck-Rest, nur wenn überhaupt Rest da ist).
export function kristallisiereUebermut(
  uebermutRest,
  gespielteWuerfelLetzterZug,
  { verhaeltnis = KRISTALLISATION_VERHAELTNIS, zuschlag = 0 } = {}
) {
  const rest = uebermutRest > 0 ? uebermutRest * verhaeltnis + zuschlag : 0;
  if (rest <= 0 || gespielteWuerfelLetzterZug.length === 0) {
    return gespielteWuerfelLetzterZug;
  }
  const wuerfel = gespielteWuerfelLetzterZug.map((w) => ({ ...w }));
  for (let i = 0; i < rest; i += 1) {
    wuerfel[i % wuerfel.length].gemuet -= 1;
  }
  return wuerfel;
}

// Kampfende-Reihenfolge: erst Sauberer-Sieg-Bonus, dann Kristallisation (02 §7.3).
export function verarbeiteKampfende({
  sauberSieg = false,
  gespielteWuerfelGesamt = [],
  zuletztGespielteIds = [],
  uebermutRest = 0,
  sauberSiegBonus = 1,
  kristallisation = {},
} = {}) {
  const nachSauberemSieg = sauberSieg
    ? wendeSauberenSiegAn(gespielteWuerfelGesamt, sauberSiegBonus)
    : gespielteWuerfelGesamt;
  const zuletztGespielte = nachSauberemSieg.filter((w) => zuletztGespielteIds.includes(w.id));
  const kristallisiert = kristallisiereUebermut(uebermutRest, zuletztGespielte, kristallisation);
  const kristallisiertNachId = new Map(kristallisiert.map((w) => [w.id, w]));
  return nachSauberemSieg.map((w) => kristallisiertNachId.get(w.id) ?? w);
}
