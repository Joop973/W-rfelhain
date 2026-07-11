// karte.js — Karten-Generator Region 1 (07 §1). DOM-frei, rein über rng.
// 7 traversierte Reihen + Boss-Reihe; Wahl-Reihen bis 3 breit, Kanten laufen
// ineinander über (StS-Merge), kein Rücksprung, kein Überspringen.

export const REIHEN_GESAMT = 8; // 7 + Boss

// Reihen-Typ-Regeln (07 §1.2). fest = alle Slots dieses Typs.
const REIHEN_REGELN = [
  { breite: [2, 3], typen: ['kampf'], fest: true }, // R1: nur Kämpfe
  { breite: [2, 3], typen: ['kampf', 'event'] }, // R2
  { breite: [2, 3], typen: ['kampf', 'markt', 'event'] }, // R3
  { breite: [2, 3], typen: ['kampf', 'elite', 'event'] }, // R4: Elite erstmals
  { breite: [2, 3], typen: ['kampf', 'elite', 'schmiede'] }, // R5
  { breite: [2, 3], typen: ['schmiede', 'markt'], fest: true }, // R6: kommerziell
  { breite: [1, 1], typen: ['lagerfeuer'], fest: true }, // R7: Zusammenlauf
  { breite: [1, 1], typen: ['boss'], fest: true }, // R8
];

function zufallAus(rng, liste) {
  return liste[Math.floor(rng.naechsteZahl() * liste.length)];
}

// Kanten von Reihe (Breite a) zur Folgereihe (Breite b): proportionaler
// Basis-Slot + Nachbar — deckt jede Zielspalte ab und hält den Mittel-Slot
// von jedem Vorgänger erreichbar (Elite-Garantie, 07 §1.4).
function kantenFuer(slot, a, b) {
  const basis = a === 1 ? Math.floor(b / 2) : Math.round((slot * (b - 1)) / (a - 1));
  const nachbar = basis + 1 < b ? basis + 1 : basis - 1;
  const kanten = new Set([basis]);
  if (nachbar >= 0) kanten.add(nachbar);
  return [...kanten].sort((x, y) => x - y);
}

export function generiereKarte(rng) {
  const reihen = REIHEN_REGELN.map((regel, index) => {
    const [min, max] = regel.breite;
    const breite = min + Math.floor(rng.naechsteZahl() * (max - min + 1));
    const knoten = [];
    for (let slot = 0; slot < breite; slot += 1) {
      knoten.push({
        id: `r${index + 1}s${slot}`,
        reihe: index + 1,
        slot,
        typ: regel.fest && regel.typen.length === 1 ? regel.typen[0] : zufallAus(rng, regel.typen),
        kanten: [],
      });
    }
    return knoten;
  });

  // Garantien: Reihe 2–5 haben ≥1 Kampf-Slot; Elite genau einmal im
  // Mittel-Slot von R4 oder R5 (von jedem Vorgänger erreichbar).
  for (const reihenIndex of [1, 2, 3, 4]) {
    const reihe = reihen[reihenIndex];
    if (!reihe.some((k) => k.typ === 'kampf')) {
      zufallAus(rng, reihe).typ = 'kampf';
    }
  }
  for (const reihe of [reihen[3], reihen[4]]) {
    for (const k of reihe) if (k.typ === 'elite') k.typ = 'kampf'; // erst räumen
  }
  const eliteReihe = reihen[rng.naechsteZahl() < 0.5 ? 3 : 4];
  eliteReihe[Math.floor(eliteReihe.length / 2)].typ = 'elite';
  for (const reihenIndex of [3, 4]) {
    // Kampf-Garantie darf durch die Elite-Setzung nicht verloren gehen.
    const reihe = reihen[reihenIndex];
    if (!reihe.some((k) => k.typ === 'kampf')) {
      reihe.find((k) => k.typ !== 'elite').typ = 'kampf';
    }
  }

  // Kanten verdrahten.
  for (let index = 0; index < reihen.length - 1; index += 1) {
    const a = reihen[index].length;
    const b = reihen[index + 1].length;
    for (const knoten of reihen[index]) {
      knoten.kanten = kantenFuer(knoten.slot, a, b);
    }
  }

  return { reihen };
}

// Invarianten (07 §1.2/§1.4): feste Reihen-Typen, Kampf-Garantie, genau eine
// von jedem Vorgänger erreichbare Elite, volle Konnektivität bis zum Boss.
export function pruefeKarte(karte) {
  const fehler = [];
  const { reihen } = karte;
  if (reihen.length !== REIHEN_GESAMT) fehler.push(`Reihenzahl ${reihen.length} != ${REIHEN_GESAMT}`);

  if (!reihen[0].every((k) => k.typ === 'kampf')) fehler.push('Reihe 1 muss nur Kämpfe enthalten');
  if (!reihen[5].every((k) => ['schmiede', 'markt'].includes(k.typ))) fehler.push('Reihe 6 muss kommerziell sein');
  if (reihen[6].length !== 1 || reihen[6][0].typ !== 'lagerfeuer') fehler.push('Reihe 7 muss 1 Lagerfeuer sein');
  if (reihen[7].length !== 1 || reihen[7][0].typ !== 'boss') fehler.push('Reihe 8 muss 1 Boss sein');

  for (const index of [1, 2, 3, 4]) {
    if (!reihen[index].some((k) => k.typ === 'kampf')) fehler.push(`Reihe ${index + 1} ohne Kampf-Slot`);
  }
  for (const index of [0, 1]) {
    if (reihen[index].some((k) => ['elite', 'lagerfeuer'].includes(k.typ))) {
      fehler.push(`Reihe ${index + 1} enthält Elite/Lagerfeuer`);
    }
  }

  // Elite: genau eine, in R4/R5, von JEDEM Vorgänger-Knoten direkt wählbar.
  const eliten = reihen.flat().filter((k) => k.typ === 'elite');
  if (eliten.length !== 1) fehler.push(`Elite-Anzahl ${eliten.length} != 1`);
  else {
    const elite = eliten[0];
    if (![4, 5].includes(elite.reihe)) fehler.push(`Elite in Reihe ${elite.reihe}`);
    for (const vorgaenger of reihen[elite.reihe - 2]) {
      if (!vorgaenger.kanten.includes(elite.slot)) {
        fehler.push(`Elite von ${vorgaenger.id} nicht wählbar`);
      }
    }
  }

  // Konnektivität: alle Knoten von Reihe 1 aus erreichbar, jeder führt zum Boss.
  const erreichbar = new Set(reihen[0].map((k) => k.id));
  for (let index = 0; index < reihen.length - 1; index += 1) {
    for (const knoten of reihen[index]) {
      if (!erreichbar.has(knoten.id)) continue;
      if (knoten.kanten.length === 0) fehler.push(`${knoten.id} ohne Ausgang`);
      for (const slot of knoten.kanten) {
        const ziel = reihen[index + 1][slot];
        if (!ziel) fehler.push(`${knoten.id} zeigt auf fehlenden Slot ${slot}`);
        else erreichbar.add(ziel.id);
      }
    }
  }
  for (const knoten of reihen.flat()) {
    if (!erreichbar.has(knoten.id)) fehler.push(`${knoten.id} unerreichbar`);
  }

  return fehler;
}
