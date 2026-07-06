// reifegrad.js — Reifegrade 1–10 (Ascension-Mods, 03 §9). DOM-frei.
// Kumulativ: Stufe N enthält alle Mods der Stufen 1..N. Alle Werte [PROVISORISCH],
// die Ziel-Siegraten-Kurve (03 §13) eicht: 0 → 65–70 % … 10 → 25–30 %.

export const REIFEGRAD_MAX = 10;

// Deklarative Liste (Anzeige/Doku); die Auswertung liegt in reifegradMods().
export const REIFEGRAD_BESCHREIBUNG = [
  /* 1 */ 'Elite-HP +10 %',
  /* 2 */ 'Start mit +1 Schreck auf 1 Würfel',
  /* 3 */ 'Gegner-Schaden +10 %',
  /* 4 */ 'Schmiede-Preise +20 %',
  /* 5 */ 'Boss-HP +15 %',
  /* 6 */ 'Heilung −25 %',
  /* 7 */ 'Tischsturz-Selbstschaden +2',
  /* 8 */ 'Normalgegner +1 Status-Stapel/Anwendung',
  /* 9 */ 'Start mit aufgedrücktem Fluch (Näherung: +2 Schreck auf 1 Würfel, bis das Fluch-System steht)',
  /* 10 */ 'Gegner-HP +10 % über alle Typen',
];

// Eich-Werte [PROVISORISCH — 03 §9 nennt Startwerte, "Sim eicht Schwellen"].
// Die Region-1-Kurven-Sim (sim/reifegrade.js) hat die Nennwerte als zu hart
// gemessen (Stufe 3: 46 % statt ~55, Stufe 10: 4 % statt 25–30) — die Werte
// hier sind die nachgeeichte Fassung; Befund: docs/Reifegrad_Kalibrierung_Befund.md.
export const REIFEGRAD_WERTE = {
  eliteHp: 0.10, // Stufe 1
  startSchreck: 1, // Stufe 2
  gegnerSchaden: 0.10, // Stufe 3 — nachgeeicht: NUR Elite/Boss (Normalgegner unberührt)
  schmiedePreis: 0.20, // Stufe 4
  bossHp: 0.05, // Stufe 5 (Nennwert 0.15 weit zu hart — Boss-HP ist der schärfste Hebel)
  heilung: 0.10, // Stufe 6, als Malus (Nennwert 0.25 zu hart)
  tischsturz: 2, // Stufe 7
  statusZuschlag: 1, // Stufe 8 (greift erst mit Status-legenden Gegnern, D1)
  fluchSchreck: 2, // Stufe 9 (Fluch-Näherung bis das Fluch-System steht)
  gegnerHp: 0.03, // Stufe 10 (Nennwert 0.10 zu hart)
};

// Kumulierte Modifikatoren einer Stufe. Verbraucher: kampf.js (Gegner/Start/
// Tischsturz), knoten.js (Schmiede/Heilung), spätere Regionen (Status-Zuschlag).
export function reifegradMods(stufe = 0) {
  const s = Math.max(0, Math.min(REIFEGRAD_MAX, stufe));
  const w = REIFEGRAD_WERTE;
  return {
    eliteHpMult: s >= 1 ? 1 + w.eliteHp : 1,
    startSchreck: (s >= 2 ? w.startSchreck : 0) + (s >= 9 ? w.fluchSchreck : 0),
    // Nachgeeicht: der Schadens-Mult trifft nur Elite/Boss — auf Normalgegner
    // kippte +10 % die Region-1-Kurve um −20 Prozentpunkte (Befund §2).
    eliteBossSchadenMult: s >= 3 ? 1 + w.gegnerSchaden : 1,
    schmiedePreisMult: s >= 4 ? 1 + w.schmiedePreis : 1,
    bossHpMult: s >= 5 ? 1 + w.bossHp : 1,
    heilungMult: s >= 6 ? 1 - w.heilung : 1,
    tischsturzZuschlag: s >= 7 ? w.tischsturz : 0,
    // Greift erst, wenn Gegner Status auflegen (Regionen 2+, Etappe D1).
    gegnerStatusZuschlag: s >= 8 ? w.statusZuschlag : 0,
    gegnerHpMult: s >= 10 ? 1 + w.gegnerHp : 1,
  };
}
