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

// params ersetzt {name}-Platzhalter im Text (E6: dynamische UI-Chrome-Texte,
// z. B. 'kampf.trifft' = "Der Gegner trifft für {schaden}.").
export function uebersetze(key, params = null) {
  let text = SPRACHEN[aktiv][key] ?? DE[key] ?? key;
  if (params) {
    for (const [name, wert] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(wert));
    }
  }
  return text;
}
