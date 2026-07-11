// fluch.js — Fluch-Aufdrückung (07 §5.4 [GESPERRT — Abweichung 2]): Events
// dürfen Fluch-Seiten erzwingen. Ein Fluch ist eine aufgedrückte schlechte
// Seite auf EINEM Würfel: run-lang, nicht überschmiedbar (belohnung.js weist
// Gravuren auf Fluch-Seiten ab), entfernbar nur über Würfel-entfernen (07 §3.3).
// DOM-frei; Werte [PROVISORISCH] — der Gegenwert (episch/Blaupause) trägt sie.

// Katalog: seitenTyp ist der Effekt-Typ, den loeseZugAuf (kampf.js) ausführt.
// - fluch_faeule: der Moder sitzt im Holz — die Seite legt Fäule auf den HÜTER.
// - fluch_stumpf: tote Seite — nichts passiert, aber sie bricht Vollmond und
//   verschwendet den Wurf (StS-Curse-Analogon).
// - fluch_scharte: die Seite legt Scharte auf den Hüter (2 Stapel: 1 überlebt
//   den Rundenende-Decay und stumpft den NÄCHSTEN Zug um −1 je Seite ab).
export const FLUECHE = {
  faeule_anfaelligkeit: {
    id: 'faeule_anfaelligkeit',
    nameKey: 'fluch.faeule_anfaelligkeit.name',
    seitenTyp: 'fluch_faeule',
    wert: 2,
  },
  fluch_seite: {
    id: 'fluch_seite',
    nameKey: 'fluch.fluch_seite.name',
    seitenTyp: 'fluch_stumpf',
    wert: 0,
  },
  scharte_fluch: {
    id: 'scharte_fluch',
    nameKey: 'fluch.scharte_fluch.name',
    seitenTyp: 'fluch_scharte',
    wert: 2,
  },
};

// Drückt den Fluch einem zufälligen Würfel auf: die schwächste noch ungravierte
// Seite wird überschrieben (Fallback: schwächste Seite überhaupt — ein Fluch
// weicht keiner Investition aus, wenn alles graviert ist). Ein Würfel trägt
// höchstens EINEN Fluch; bereits verfluchte Würfel werden übersprungen.
export function drueckeFluchAuf(run, fluchId, rng) {
  const fluch = FLUECHE[fluchId];
  if (!fluch) return null;
  const kandidaten = run.arsenal.filter((w) => !w.seiten.some((s) => s.fluchId));
  if (kandidaten.length === 0) return null; // alles schon verflucht — verpufft
  const wuerfel = kandidaten[Math.floor(rng.naechsteZahl() * kandidaten.length)];
  const indizes = wuerfel.seiten.map((s, i) => ({ s, i }));
  const ungraviert = indizes.filter(({ i }) => wuerfel.stufen[i] === 0);
  const pool = ungraviert.length > 0 ? ungraviert : indizes;
  const { s, i } = pool.sort((a, b) => a.s.wert - b.s.wert)[0];
  wuerfel.seiten[i] = {
    wert: 0,
    basisWert: s.basisWert ?? s.wert,
    fluchId: fluch.id,
    effekt: [{ typ: fluch.seitenTyp, wert: fluch.wert }],
  };
  wuerfel.stufen[i] = 0;
  return { wuerfel, fluch, seitenIndex: i };
}

// Aktive Flüche eines Runs — abgeleitet aus dem Arsenal, kein eigener
// Save-State (die Seiten wandern ohnehin mit; Würfel-entfernen löst den Fluch).
export function aktiveFluechte(run) {
  return run.arsenal.flatMap((w) =>
    w.seiten.filter((s) => s.fluchId).map((s) => ({ wuerfelId: w.id, fluchId: s.fluchId }))
  );
}
