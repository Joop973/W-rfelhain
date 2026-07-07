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
    maxReifegrad: 0, // höchste freigeschaltete Ascension-Stufe (03 §9, C4)
    samen: 0, // Enden-Währung des Heimat-Hains (01 §5, C5)
    heimatHain: [], // gepflanzte Setzling-IDs
  };
}

// Jahresring-Einkommen je Run-Ende [PROVISORISCH — Meta-Ökonomie ist Welle-4-
// Inhalt, 06 §7]: 2 für einen durchquerten Region-Run (Boss gefallen),
// 1 Trost-Ring für eine Niederlage mit erkennbarem Fortschritt (≥ 3 Kämpfe),
// 0 für frühe Abbrüche. Dimensioniert gegen die Freischalt-Kosten 3/5/8/12:
// Dorfschamane nach ~2 Runs, Rodbauer nach ~6 guten Runs.
export function verdieneJahresringe(meta, { sieg = false, kaempfe = 0, reifegrad = 0 } = {}) {
  const ringe = sieg ? 2 : kaempfe >= 3 ? 1 : 0;
  meta.jahresringe += ringe;
  meta.runsGespielt += 1;
  if (sieg) {
    meta.runsGewonnen += 1;
    // Ascension-Kette (03 §9): Sieg auf Stufe N schaltet Stufe N+1 frei (Cap 10).
    meta.maxReifegrad = Math.max(meta.maxReifegrad ?? 0, Math.min(10, reifegrad + 1));
  }
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

// --- Heimat-Hain: Samen + Setzlinge (01 §2.7/§5, C5) --------------------------------
// Samen sind die NARRATIV verdiente Meta-Währung: nur Enden geben welche —
// der Stille Hain pflanzt kanonisch einen Samen (+1), der Frühling restauriert
// voll (+2), das Hohle Erbe lässt nichts wachsen (0). [PROVISORISCH]

const SAMEN_JE_ENDE = { fruehling: 2, stiller_hain: 1, hohles_erbe: 0 };

export function verdieneSamen(meta, endeId) {
  const samen = SAMEN_JE_ENDE[endeId] ?? 0;
  meta.samen = (meta.samen ?? 0) + samen;
  return samen;
}

// Setzlinge: permanente, FLACHE Start-Boni im Pflege-Thema — nichts
// multipliziert, alles einmalig je Run (Anti-Lawine 03 §14). [PROVISORISCH]
export const SETZLINGE = {
  tau_wurzel: {
    id: 'tau_wurzel',
    textKey: 'setzling.tau_wurzel.text',
    kosten: { samen: 1 },
    effekt: { typ: 'tau_bonus', wert: 2 }, // +2 Tau je Region-Eintritt
  },
  mut_trieb: {
    id: 'mut_trieb',
    textKey: 'setzling.mut_trieb.text',
    kosten: { samen: 1 },
    effekt: { typ: 'start_gemuet', wert: 2 }, // 1 zufälliger Würfel startet fröhlich
  },
  tiefwurzel: {
    id: 'tiefwurzel',
    textKey: 'setzling.tiefwurzel.text',
    kosten: { samen: 2 },
    effekt: { typ: 'max_hp', wert: 5 },
  },
  fruehjahrs_knospe: {
    id: 'fruehjahrs_knospe',
    textKey: 'setzling.fruehjahrs_knospe.text',
    kosten: { samen: 3 },
    effekt: { typ: 'gratis_lagerfeuer_troesten', wert: 1 }, // 1×/Run: Trösten verbraucht die Rast nicht
  },
};

export function hatSetzling(meta, setzlingId) {
  return (meta.heimatHain ?? []).includes(setzlingId);
}

export function pruefeSetzlingKauf(meta, setzlingId) {
  const setzling = SETZLINGE[setzlingId];
  if (!setzling) return { ok: false, grund: 'unbekannt' };
  if (hatSetzling(meta, setzlingId)) return { ok: false, grund: 'gepflanzt' };
  if ((meta.samen ?? 0) < setzling.kosten.samen) return { ok: false, grund: 'samen' };
  return { ok: true, setzling };
}

export function pflanzeSetzling(meta, setzlingId) {
  const pruefung = pruefeSetzlingKauf(meta, setzlingId);
  if (!pruefung.ok) return pruefung;
  meta.samen -= pruefung.setzling.kosten.samen;
  meta.heimatHain = [...(meta.heimatHain ?? []), setzlingId];
  return { ok: true, setzling: pruefung.setzling };
}

// Aktive Setzling-Effekte für den Run-Start — kampf.js/knoten.js lesen die
// Liste über run.setzlinge (IDs), damit Sims ohne Meta-Objekt testen können.
export function aktiveSetzlinge(meta) {
  return meta?.heimatHain ?? [];
}

// Altbestand-Saves (metaState seit v1, aber ohne die C1-Felder) auffüllen.
export function normalisiereMeta(metaState) {
  return { ...leeresMeta(), ...(metaState ?? {}) };
}
