// rng.js — gesäter, deterministischer Zufall (mulberry32).
// Einzige Zufallsquelle im Spiel (09 §1/§4). DOM-frei, läuft identisch in Browser und Node.

export class RNG {
  constructor(seed) {
    this.zustand = seed >>> 0;
  }

  // Nächste Gleitkommazahl im Intervall [0, 1).
  naechsteZahl() {
    let t = (this.zustand += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Würfelwurf 1..seiten, gleichverteilt (03 §10).
  wuerfel(seiten = 6) {
    return Math.floor(this.naechsteZahl() * seiten) + 1;
  }
}
