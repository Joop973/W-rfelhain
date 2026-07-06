// enden.js — die drei Enden (01 §5): Klassifikation über die zwei Run-weiten
// Größen End-Schreck (Σ Schreck übers Arsenal) und Trösten-Zahl (gezielte
// Trösten-Ereignisse OHNE Ermutigung — B5-Zähler-Split). DOM-frei.
//
// Schwellen [PROVISORISCH — 01 §5, Sim/Spielgefühl eicht]: ≤10 / ≥40, Trösten ≥8.
// "Der neue Frühling" verlangt zusätzlich die Trösten-Auflösung des Endkampfs
// (bossBefriedet) — der Endboss kommt mit D3; bis dahin liefert der Aufrufer
// den Platzhalter true (Region-1-Slice hat keinen befriedbaren Endgegner).

import { schreck } from './push.js';

export const ENDE_SCHRECK_NIEDRIG = 10; // Frühling-Obergrenze [PROVISORISCH]
export const ENDE_SCHRECK_HOCH = 40; // Hohles-Erbe-Untergrenze [PROVISORISCH]
export const ENDE_TROESTEN_SCHWELLE = 8; // Frühling-Mindest-Trösten (01 §5) [PROVISORISCH]

export const ENDEN = {
  fruehling: { id: 'fruehling', textKey: 'ende.fruehling.text', titelKey: 'ende.fruehling.titel' },
  stiller_hain: { id: 'stiller_hain', textKey: 'ende.stiller_hain.text', titelKey: 'ende.stiller_hain.titel' },
  hohles_erbe: { id: 'hohles_erbe', textKey: 'ende.hohles_erbe.text', titelKey: 'ende.hohles_erbe.titel' },
};

export function endSchreck(run) {
  return run.arsenal.reduce((s, w) => s + schreck(w.gemuet), 0);
}

// Klassifiziert das Run-Ende (nur bei Sieg sinnvoll — Niederlage hat kein Ende,
// 01 §5 misst "bei Fall des früheren Hüters").
export function bestimmeEnde(run, { bossBefriedet = true } = {}) {
  const schreckSumme = endSchreck(run);
  if (
    schreckSumme <= ENDE_SCHRECK_NIEDRIG &&
    (run.troestenZahl ?? 0) >= ENDE_TROESTEN_SCHWELLE &&
    bossBefriedet
  ) {
    return ENDEN.fruehling;
  }
  if (schreckSumme >= ENDE_SCHRECK_HOCH) return ENDEN.hohles_erbe;
  return ENDEN.stiller_hain;
}

// Merkt ein erreichtes Ende im Meta-State (einmalig; speist u. a. die
// Rodbauer-Freischalt-Bedingung, 06 §7).
export function merkeEnde(meta, endeId) {
  if (!(meta.endenErreicht ?? []).includes(endeId)) {
    meta.endenErreicht = [...(meta.endenErreicht ?? []), endeId];
  }
  return meta;
}
