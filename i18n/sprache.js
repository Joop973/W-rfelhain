// i18n/sprache.js — Sprachwahl (D7, 09 §5). DOM-frei; die UI setzt die
// Sprache aus save.einstellungen.sprache und ruft uebersetze() für jeden
// Spielertext. Fallback-Kette: aktive Sprache → Deutsch (Ausgangssprache)
// → Key selbst (macht fehlende Übersetzungen im Spiel sichtbar).

import { DE } from './de.js';
import { EN } from './en.js';

export const SPRACHEN = { de: DE, en: EN };

let aktiv = 'de';

export function setzeSprache(code) {
  aktiv = SPRACHEN[code] ? code : 'de';
  return aktiv;
}

export function aktiveSprache() {
  return aktiv;
}

export function uebersetze(key) {
  return SPRACHEN[aktiv][key] ?? DE[key] ?? key;
}
