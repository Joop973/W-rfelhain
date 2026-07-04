// status.js — Kampf-Status-State: Anlegen, Ticks, Decay, Auflegen (02 §8, 03 §6).
// DOM-frei, reine Funktionen. Trägt sowohl klassische Status (Fäule/Brand/Morsch/
// Welk/Kraft/Riss) als auch die vier Eigen-Status (Wetzung/Scharte/Freilauf/Klemme,
// Slots vorbereitet — Auswertung folgt mit B2). Glanz ist zug-lokal und lebt NICHT
// hier (verbraucht sich bei der nächsten Seite, Behandlung im Kampf-Loop).

// Harte Stapel-Caps (02 §8.3). Fäule/Brand/Kraft sind ungedeckelt (StS-Poison/Burn/Strength).
export const STATUS_CAP = {
  morsch: 4,
  welk: 4,
  wetzung: 3,
  scharte: 3,
  freilauf: 3,
  klemme: 3,
};

export const RISS_DAUER = 2; // Runden (02 §8.1)

export function leererStatus() {
  return {
    faeule: 0, // DoT, tickt Trägerzug-Beginn (`Stapel` Schaden, dann −1)
    brand: 0, // DoT, tickt Zugende (`Stapel` Schaden, dann −2)
    morsch: 0, // +20 %/Stapel erlittener Schaden, Cap 4, Decay −1/Runde
    welk: 0, // −10 %/Stapel ausgeteilter Schaden, Cap 4, Decay −1/Runde
    kraft: 0, // +`Stapel` je Schaden-Seite, kein Decay
    riss: 0, // Rest-Runden mit 25 % Zünd-Aussetzer
    wetzung: 0,
    scharte: 0,
    freilauf: 0,
    klemme: 0,
  };
}

// Fäule tickt zu Trägerzug-Beginn: Träger nimmt `Stapel` Schaden, dann −1.
// Gibt den zugefügten Schaden zurück.
export function tickeFaeule(status) {
  const schaden = status.faeule;
  if (status.faeule > 0) status.faeule -= 1;
  return schaden;
}

// Brand tickt zu Zugende: `Stapel` Schaden, dann −2 (schneller Decay, 02 §8.1).
export function tickeBrand(status) {
  const schaden = status.brand;
  if (status.brand > 0) status.brand = Math.max(0, status.brand - 2);
  return schaden;
}

// Rundenende-Decay −1 für die additiven, decayenden Status (02 §2.4).
// Kraft decayt nicht; Fäule/Brand decayen über ihren eigenen Tick.
export function decayRundenende(status) {
  for (const typ of ['morsch', 'welk', 'riss', 'wetzung', 'scharte', 'freilauf', 'klemme']) {
    if (status[typ] > 0) status[typ] -= 1;
  }
}

// Status additiv auflegen, hart am Cap gedeckelt (02 §8.3). Riss setzt die
// volle Dauer (nicht additiv — eine Neubelegung erneuert das Zeitfenster).
export function legeStatusAuf(status, typ, menge) {
  if (typ === 'riss') {
    status.riss = Math.max(status.riss, RISS_DAUER);
    return;
  }
  const cap = STATUS_CAP[typ] ?? Infinity;
  status[typ] = Math.min(cap, (status[typ] ?? 0) + menge);
}
