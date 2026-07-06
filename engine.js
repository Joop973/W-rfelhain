// engine.js — reine Kampf-Auflösung. DOM-frei, keine Zufallsquelle (02 §4, 03 §2).
//
// Modell: der Aufrufer löst Wetzung/Scharte/Klassen-Sockel bereits beim Wurf auf
// (02 §2.2) und übergibt eine "Zug-Paket" genannte Liste bereits geworfener,
// platzierter Seiten in Spielreihenfolge (links→rechts) an resolveZug().

export const GLEICHKLANG_STUFEN = { 2: 1.25, 3: 1.5, 4: 1.75 };
export const GLEICHKLANG_CAP = 1.75;

// Fester, regions-skalierter Vollmond-Burst, Region 1–6 (03 §3.1).
export const VOLLMOND_BURST = [8, 14, 22, 34, 50, 70];

// Effektiver Seitenwert: Seitenwert ± Wetzung/Scharte ± permanenter Klassen-Sockel,
// Untergrenze 1 gilt für den Wurf-Anteil selbst (02 §4.2 Scharte-Untergrenze).
export function effektiverWert(seitenwert, { wetzung = 0, scharte = 0, klassenSockel = 0 } = {}) {
  const geworfenerAnteil = Math.max(1, seitenwert + wetzung - scharte);
  return geworfenerAnteil + klassenSockel;
}

// Vollmond-Prüfwert: wie effektiverWert, aber OHNE permanente Klassen-Sockel —
// diese speisen Vollmond nicht, Wetzung-Status hingegen schon (02 §10.3).
export function vollmondPruefwert(seitenwert, { wetzung = 0, scharte = 0 } = {}) {
  return Math.max(1, seitenwert + wetzung - scharte);
}

export function gleichklangMult(anzahlGleicherWerte) {
  if (anzahlGleicherWerte >= 4) return GLEICHKLANG_CAP;
  return GLEICHKLANG_STUFEN[anzahlGleicherWerte] ?? 1;
}

export function morschMult(stapel) {
  return 1 + 0.2 * Math.min(stapel, 4);
}

export function welkMult(stapel) {
  return 1 - 0.1 * Math.min(stapel, 4);
}

// Basis einer einzelnen Schaden-Seite: effektiver Wert + Kraft + flache Passive,
// danach Glanz (Basis ×2, falls aktiv) — vor jedem ×Mult (02 §4 Schritte 0–2).
export function seitenBasis(seite) {
  let basis = seite.effektiverWert + (seite.kraft ?? 0) + (seite.passiv ?? 0);
  if (seite.glanz) basis *= 2;
  return basis;
}

// Pool-Stufe: ×Gleichklang → ×Morsch → ×Welk → +Vollmond-Burst → floor (03 §2 Schritte 5–9).
export function wendePoolModifikatoren(
  poolSumme,
  { gleichklangAnzahl = 0, morschStapel = 0, welkStapel = 0, vollmondBurst = 0 } = {}
) {
  let pool = poolSumme;
  pool *= gleichklangMult(gleichklangAnzahl);
  pool *= morschMult(morschStapel);
  pool *= welkMult(welkStapel);
  pool += vollmondBurst;
  return Math.max(0, Math.floor(pool));
}

function groessteGleicheGruppe(werte) {
  const zaehler = new Map();
  for (const w of werte) zaehler.set(w, (zaehler.get(w) ?? 0) + 1);
  return werte.length === 0 ? 0 : Math.max(...zaehler.values());
}

// Löst ein komplettes Zug-Paket auf: Pools Schaden/Rinde/Fäule/Brand.
// gespielteSeiten: [{ typ, effektiverWert, vollmondWert?, hoechstwert, kraft?, passiv?,
//                      glanz?, mult?, istEcho?, stapel? }], links→rechts.
// kontext: { morschStapel, welkStapel, region, vollmondBurstMult }.
// vollmondBurstMult: flacher Aufschlag auf den additiven Burst (Segen
// "Splitternde Borke" ×1,5, 07 §4.2 #9) — nie multiplikativ auf den Pool.
export function resolveZug(gespielteSeiten, kontext = {}) {
  const { morschStapel = 0, welkStapel = 0, region = 1, vollmondBurstMult = 1 } = kontext;
  const pools = { schaden: 0, rinde: 0, faeule: 0, brand: 0 };

  let schadenPoolLaufend = 0;
  let vorherigerSchadenBeitrag = 0;
  let vorherigeSeiteWarSchaden = false;
  let vollmondMoeglich = true;
  let schadenSeitenGespielt = 0;

  for (const seite of gespielteSeiten) {
    if (seite.typ !== 'schaden') {
      vollmondMoeglich = false; // jede Nicht-Schaden-Seite bricht Vollmond (02 §10.3)
      vorherigeSeiteWarSchaden = false;
      if (seite.typ === 'rinde') pools.rinde += seite.effektiverWert ?? 0;
      else if (seite.typ === 'faeule') pools.faeule += seite.stapel ?? 0;
      else if (seite.typ === 'brand') pools.brand += seite.stapel ?? 0;
      continue;
    }

    let beitrag;
    if (seite.istEcho) {
      // Hart gedeckelt auf 1× Quellbeitrag, eigene Kraft/Passiv/Mult der Echo-Seite
      // fließen bewusst NICHT ein (02 §10.2 / 04 §3.3).
      beitrag = vorherigeSeiteWarSchaden ? vorherigerSchadenBeitrag : 0;
    } else {
      beitrag = seitenBasis(seite);
      // ×Mult wirkt auf den bis hierhin akkumulierten Pool, nicht rückwirkend auf
      // spätere Seiten — Wucht vor additiven Seiten platziert ergibt 0 (04 §3.1).
      if (seite.mult != null) schadenPoolLaufend *= seite.mult;
    }

    schadenPoolLaufend += beitrag;
    vorherigerSchadenBeitrag = beitrag;
    vorherigeSeiteWarSchaden = true;
    schadenSeitenGespielt += 1;

    const vollmondWert = seite.vollmondWert ?? seite.effektiverWert;
    if (vollmondWert < seite.hoechstwert) vollmondMoeglich = false;
  }

  const gleichklangAnzahl = groessteGleicheGruppe(
    gespielteSeiten.filter((s) => s.typ === 'schaden').map((s) => s.effektiverWert)
  );
  const vollmondBurst =
    vollmondMoeglich && schadenSeitenGespielt > 0
      ? Math.floor((VOLLMOND_BURST[region - 1] ?? 0) * vollmondBurstMult)
      : 0;

  pools.schaden = wendePoolModifikatoren(schadenPoolLaufend, {
    gleichklangAnzahl,
    morschStapel,
    welkStapel,
    vollmondBurst,
  });

  // Combo-Metadaten für die Anzeige (UI); ändert die Pools nicht.
  pools.combos = {
    gleichklangAnzahl: gleichklangAnzahl >= 2 ? gleichklangAnzahl : 0,
    gleichklangMult: gleichklangAnzahl >= 2 ? gleichklangMult(gleichklangAnzahl) : 1,
    vollmond: vollmondBurst > 0,
    vollmondBurst,
  };
  return pools;
}
