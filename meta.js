// meta.js — Meta-Progression: Jahresringe, Stammbaum, dauerhafte Freischaltungen
// (01 §2.7 Meta-Schleife, 06 §7, 09 §2.9). DOM-frei, reine Funktionen auf dem
// metaState (save.js §metaState). Der metaState überlebt Run-Enden und
// "Neuer Run" — gelöscht wird er nur mit dem kompletten Save (Voll-Reset).

export function leeresMeta() {
  return {
    jahresringe: 0,
    stammbaum: [], // gekaufte Knoten-IDs (09 §2.9)
    freigeschalteteKlassen: ['eichwart'],
    endenErreicht: [], // 'fruehling' | 'stiller_hain' | 'verloeschen' (C6/D4 füllen)
    runsGespielt: 0,
    runsGewonnen: 0,
  };
}

// Jahresring-Einkommen je Run-Ende [PROVISORISCH — Meta-Ökonomie ist Welle-4-
// Inhalt, 06 §7]: 2 für einen durchquerten Region-Run (Boss gefallen),
// 1 Trost-Ring für eine Niederlage mit erkennbarem Fortschritt (≥ 3 Kämpfe),
// 0 für frühe Abbrüche. Dimensioniert gegen die Freischalt-Kosten 3/5/8/12:
// Dorfschamane nach ~2 Runs, Rodbauer nach ~6 guten Runs.
export function verdieneJahresringe(meta, { sieg = false, kaempfe = 0 } = {}) {
  const ringe = sieg ? 2 : kaempfe >= 3 ? 1 : 0;
  meta.jahresringe += ringe;
  meta.runsGespielt += 1;
  if (sieg) meta.runsGewonnen += 1;
  return ringe;
}

// --- Stammbaum (09 §2.9) ---------------------------------------------------------
// Erst-Bestand: die vier Klassen-Freischaltungen (06 §7). Weitere Meta-Boni
// (Heimat-Hain/Samen) folgen mit C5, wenn das Design steht.

export const STAMMBAUM_KNOTEN = {
  klasse_dorfschamane: {
    id: 'klasse_dorfschamane',
    textKey: 'stammbaum.klasse_dorfschamane.text',
    kosten: { jahresringe: 3 },
    effekt: { typ: 'klasse_freischalten', klasseId: 'dorfschamane' },
  },
  klasse_gloeckner: {
    id: 'klasse_gloeckner',
    textKey: 'stammbaum.klasse_gloeckner.text',
    kosten: { jahresringe: 5 },
    effekt: { typ: 'klasse_freischalten', klasseId: 'gloeckner' },
  },
  klasse_schleiferin: {
    id: 'klasse_schleiferin',
    textKey: 'stammbaum.klasse_schleiferin.text',
    kosten: { jahresringe: 8 },
    effekt: { typ: 'klasse_freischalten', klasseId: 'schleiferin' },
  },
  klasse_rodbauer: {
    id: 'klasse_rodbauer',
    textKey: 'stammbaum.klasse_rodbauer.text',
    kosten: { jahresringe: 12 },
    // Experten-Klasse hinter Schwelle (06 §7): Frühling-Ende ODER Reifegrad ≥ 3.
    bedingung: (meta, kontext) =>
      (meta.endenErreicht ?? []).includes('fruehling') || (kontext?.reifegrad ?? 0) >= 3,
    bedingungTextKey: 'stammbaum.klasse_rodbauer.bedingung',
    effekt: { typ: 'klasse_freischalten', klasseId: 'rodbauer' },
  },
};

export function hatStammbaumKnoten(meta, knotenId) {
  return (meta.stammbaum ?? []).includes(knotenId);
}

export function istKlasseFrei(meta, klasseId) {
  return (meta.freigeschalteteKlassen ?? []).includes(klasseId);
}

// Kaufbar = nicht gekauft + bezahlbar + Bedingung erfüllt.
export function pruefeStammbaumKauf(meta, knotenId, kontext = {}) {
  const knoten = STAMMBAUM_KNOTEN[knotenId];
  if (!knoten) return { ok: false, grund: 'unbekannt' };
  if (hatStammbaumKnoten(meta, knotenId)) return { ok: false, grund: 'gekauft' };
  if (knoten.bedingung && !knoten.bedingung(meta, kontext)) return { ok: false, grund: 'bedingung' };
  if (meta.jahresringe < knoten.kosten.jahresringe) return { ok: false, grund: 'jahresringe' };
  return { ok: true, knoten };
}

export function kaufeStammbaumKnoten(meta, knotenId, kontext = {}) {
  const pruefung = pruefeStammbaumKauf(meta, knotenId, kontext);
  if (!pruefung.ok) return pruefung;
  const { knoten } = pruefung;
  meta.jahresringe -= knoten.kosten.jahresringe;
  meta.stammbaum = [...(meta.stammbaum ?? []), knotenId];
  if (knoten.effekt.typ === 'klasse_freischalten' && !istKlasseFrei(meta, knoten.effekt.klasseId)) {
    meta.freigeschalteteKlassen = [...(meta.freigeschalteteKlassen ?? []), knoten.effekt.klasseId];
  }
  return { ok: true, knoten };
}

// Altbestand-Saves (metaState seit v1, aber ohne die C1-Felder) auffüllen.
export function normalisiereMeta(metaState) {
  return { ...leeresMeta(), ...(metaState ?? {}) };
}
