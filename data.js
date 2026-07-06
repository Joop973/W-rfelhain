// data.js — statischer Inhalts-Datenkatalog: Würfel-Vorlagen, Klassen,
// Gravuren, Blaupausen, Gegner, Hain-Segen, Events (09 §1/§2).
// KEINE Logik — nur Objektliterale und triviale Fabrikfunktionen (09 §2).
// Spielertexte ausschließlich über Text-Keys (09 §5, /i18n/de.js).
// Zahlen ohne Sperrvermerk sind [PROVISORISCH] — Sim/03 entscheidet.

// --- Grundkonstanten (03 §1) ------------------------------------------------

export const HUETER_BASIS_HP = 75; // [PROVISORISCH]
export const HANDGROESSE = 5; // [GESPERRT]
export const ARSENAL_START = 12; // [GESPERRT-OVERRIDE 2026-07-02]
export const ATEM_PRO_ZUG = 3; // [GESPERRT]

// --- Würfel-Vorlagen (04 §2, 06 §2–§6) --------------------------------------
// Seite nach 09 §2.1: { wert, effekt: [{ typ, wert }] }. Reintypische Seiten
// tragen ihren Wert auch im Effekt; reine Effekt-Seiten haben wert 0 (04 §1.1).

function schadenSeiten(werte) {
  return werte.map((wert) => ({ wert, effekt: [{ typ: 'schaden', wert }] }));
}

function rindeSeiten(werte) {
  return werte.map((wert) => ({ wert, effekt: [{ typ: 'rinde', wert }] }));
}

export const WUERFEL_VORLAGEN = {
  // Eichwart-Basis [GESPERRT: Identitäten]
  astschneide: {
    id: 'astschneide',
    nameKey: 'wuerfel.astschneide.name',
    typ: 'schaden',
    atem: 1,
    seiten: schadenSeiten([1, 2, 3, 4, 5, 6]),
  },
  borkenschild: {
    id: 'borkenschild',
    nameKey: 'wuerfel.borkenschild.name',
    typ: 'rinde',
    atem: 1,
    seiten: rindeSeiten([1, 1, 2, 2, 3, 3]),
  },
  // Klassen-Würfel (06 §3–§6) [PROVISORISCH]
  klangwuerfel: {
    id: 'klangwuerfel',
    nameKey: 'wuerfel.klangwuerfel.name',
    typ: 'schaden',
    atem: 1,
    seiten: schadenSeiten([2, 3, 4, 4, 5, 5]),
  },
  wetzklinge: {
    id: 'wetzklinge',
    nameKey: 'wuerfel.wetzklinge.name',
    typ: 'schaden',
    atem: 1,
    seiten: schadenSeiten([2, 3, 4, 5, 6, 6]),
  },
  wildzahn: {
    id: 'wildzahn',
    nameKey: 'wuerfel.wildzahn.name',
    typ: 'schaden',
    atem: 1,
    seiten: schadenSeiten([1, 2, 3, 6, 6, 6]),
  },
  sanftholz: {
    id: 'sanftholz',
    nameKey: 'wuerfel.sanftholz.name',
    typ: 'stuetze',
    atem: 1,
    seiten: [
      { wert: 0, effekt: [{ typ: 'ermutigung', wert: 2 }] },
      { wert: 0, effekt: [{ typ: 'ermutigung', wert: 2 }] },
      ...rindeSeiten([2, 2, 3, 3]),
    ],
  },
};

// --- Klassen (06) -------------------------------------------------------------
// startArsenal = Vorlagen-Zählung; Instanzen via erstelleStartArsenal().
// passiv als deklarativer Deskriptor — Auswertung liegt in engine/Kampf-Loop.

export const KLASSEN = {
  eichwart: {
    id: 'eichwart',
    nameKey: 'klasse.eichwart.name',
    hpMod: 5, // = 80 [PROVISORISCH]
    startArsenal: [
      { vorlage: 'astschneide', anzahl: 8 },
      { vorlage: 'borkenschild', anzahl: 4 },
    ], // [GESPERRT-OVERRIDE: Anzahl · GESPERRT: Identitäten]
    passiv: { typ: 'schaden_flach', wert: 2 }, // +2 je gespielte Schaden-Seite [GESPERRT]
    freischaltung: { start: true },
  },
  dorfschamane: {
    id: 'dorfschamane',
    nameKey: 'klasse.dorfschamane.name',
    hpMod: 0,
    startArsenal: [
      { vorlage: 'astschneide', anzahl: 7 },
      { vorlage: 'borkenschild', anzahl: 2 },
      { vorlage: 'sanftholz', anzahl: 3 },
    ],
    passiv: { typ: 'zuversicht', schadenFlach: 2, nurGemuetAb: 0, sauberSiegBonus: 2, gratisErmutigungProKampf: 1 },
    freischaltung: { jahresringe: 3 },
  },
  gloeckner: {
    id: 'gloeckner',
    nameKey: 'klasse.gloeckner.name',
    hpMod: 0,
    startArsenal: [
      { vorlage: 'klangwuerfel', anzahl: 8 },
      { vorlage: 'borkenschild', anzahl: 4 },
    ],
    passiv: { typ: 'widerhall', schadenFlach: 3, bedingung: 'gleichklang_aktiv' },
    freischaltung: { jahresringe: 5 },
  },
  schleiferin: {
    id: 'schleiferin',
    nameKey: 'klasse.schleiferin.name',
    hpMod: -5,
    startArsenal: [
      { vorlage: 'wetzklinge', anzahl: 8 },
      { vorlage: 'borkenschild', anzahl: 4 },
    ],
    // Klassen-Sockel speist Vollmond NICHT (02 §10.3)
    passiv: { typ: 'schliff', klassenSockel: 1, extraGratisRerolls: 1 },
    freischaltung: { jahresringe: 8 },
  },
  rodbauer: {
    id: 'rodbauer',
    nameKey: 'klasse.rodbauer.name',
    hpMod: -10,
    startArsenal: [
      { vorlage: 'astschneide', anzahl: 8 },
      { vorlage: 'wildzahn', anzahl: 4 },
    ],
    passiv: { typ: 'schaden_flach', wert: 3 },
    freischaltung: { jahresringe: 12, bedingung: 'fruehling_oder_reifegrad_3' },
  },
};

// --- Gravuren (04 §3, Schema 09 §2.4) ----------------------------------------

export const GRAVUREN = {
  wucht: {
    id: 'wucht',
    nameKey: 'gravur.wucht.name',
    ueberschreibtZu: 'schaden_mult',
    stufen: [
      { stufe: 1, effektWert: 1.5, preisMuenzen: 40 },
      { stufe: 2, effektWert: 2.0, preisMuenzen: 60 },
      { stufe: 3, effektWert: 2.5, preisMuenzen: 80 },
    ], // [GESPERRT]
    maxStufen: 3,
    atemAenderung: 0,
    einStufenSeite: false,
  },
  schaerfe: {
    id: 'schaerfe',
    nameKey: 'gravur.schaerfe.name',
    ueberschreibtZu: 'schaden',
    stufen: [
      { stufe: 1, effektWert: 2, preisMuenzen: 25 },
      { stufe: 2, effektWert: 3, preisMuenzen: 40 },
      { stufe: 3, effektWert: 4, preisMuenzen: 55 },
    ],
    maxStufen: 3,
    atemAenderung: 0,
    einStufenSeite: false,
  },
  borke: {
    id: 'borke',
    nameKey: 'gravur.borke.name',
    ueberschreibtZu: 'rinde',
    stufen: [
      { stufe: 1, effektWert: 2, preisMuenzen: 25 },
      { stufe: 2, effektWert: 3, preisMuenzen: 40 },
      { stufe: 3, effektWert: 4, preisMuenzen: 55 },
    ],
    maxStufen: 3,
    atemAenderung: 0,
    einStufenSeite: false,
  },
  gift: {
    id: 'gift',
    nameKey: 'gravur.gift.name',
    ueberschreibtZu: 'faeule',
    stufen: [
      { stufe: 1, effektWert: 2, preisMuenzen: 35 },
      { stufe: 2, effektWert: 3, preisMuenzen: 50 },
      { stufe: 3, effektWert: 4, preisMuenzen: 65 },
    ],
    maxStufen: 3,
    atemAenderung: 0,
    einStufenSeite: false,
  },
  zunder: {
    id: 'zunder',
    nameKey: 'gravur.zunder.name',
    ueberschreibtZu: 'brand',
    stufen: [
      { stufe: 1, effektWert: 2, preisMuenzen: 35 },
      { stufe: 2, effektWert: 3, preisMuenzen: 50 },
      { stufe: 3, effektWert: 4, preisMuenzen: 65 },
    ],
    maxStufen: 3,
    atemAenderung: 0,
    einStufenSeite: false,
  },
  faeulnis_hauch: {
    id: 'faeulnis_hauch',
    nameKey: 'gravur.faeulnis_hauch.name',
    ueberschreibtZu: 'morsch',
    stufen: [
      { stufe: 1, effektWert: 1, preisMuenzen: 30 },
      { stufe: 2, effektWert: 2, preisMuenzen: 45 },
      { stufe: 3, effektWert: 2, preisMuenzen: 55 },
    ],
    maxStufen: 3,
    atemAenderung: 0,
    einStufenSeite: false,
  },
  duerre_hauch: {
    id: 'duerre_hauch',
    nameKey: 'gravur.duerre_hauch.name',
    ueberschreibtZu: 'welk',
    stufen: [
      { stufe: 1, effektWert: 1, preisMuenzen: 30 },
      { stufe: 2, effektWert: 2, preisMuenzen: 45 },
      { stufe: 3, effektWert: 2, preisMuenzen: 55 },
    ],
    maxStufen: 3,
    atemAenderung: 0,
    einStufenSeite: false,
  },
  markhaertung: {
    id: 'markhaertung',
    nameKey: 'gravur.markhaertung.name',
    ueberschreibtZu: 'kraft',
    stufen: [
      { stufe: 1, effektWert: 1, preisMuenzen: 45 },
      { stufe: 2, effektWert: 1, preisMuenzen: 60 },
      { stufe: 3, effektWert: 2, preisMuenzen: 80 },
    ],
    maxStufen: 3,
    atemAenderung: 0,
    einStufenSeite: false,
  },
  echo_gravur: {
    id: 'echo_gravur',
    nameKey: 'gravur.echo_gravur.name',
    ueberschreibtZu: 'echo',
    stufen: [{ stufe: 1, effektWert: 1, preisMuenzen: 60 }],
    maxStufen: 1,
    atemAenderung: 0,
    einStufenSeite: true,
  },
  glanz_gravur: {
    id: 'glanz_gravur',
    nameKey: 'gravur.glanz_gravur.name',
    ueberschreibtZu: 'glanz',
    stufen: [{ stufe: 1, effektWert: 2, preisMuenzen: 55 }],
    maxStufen: 1,
    atemAenderung: 0,
    einStufenSeite: true,
  },
  beruhigungs_gravur: {
    id: 'beruhigungs_gravur',
    nameKey: 'gravur.beruhigungs_gravur.name',
    ueberschreibtZu: 'beruhigung',
    stufen: [{ stufe: 1, effektWert: 2, preisMuenzen: 30 }],
    maxStufen: 1,
    atemAenderung: 0,
    einStufenSeite: true,
  },
  ermutigungs_gravur: {
    id: 'ermutigungs_gravur',
    nameKey: 'gravur.ermutigungs_gravur.name',
    ueberschreibtZu: 'ermutigung',
    stufen: [{ stufe: 1, effektWert: 2, preisMuenzen: 35 }],
    maxStufen: 1,
    atemAenderung: 0,
    einStufenSeite: true,
  },
  doppelschlag: {
    id: 'doppelschlag',
    nameKey: 'gravur.doppelschlag.name',
    ueberschreibtZu: 'schaden_doppel',
    stufen: [
      { stufe: 1, effektWert: [1, 1], preisMuenzen: 30 },
      { stufe: 2, effektWert: [2, 2], preisMuenzen: 45 },
      { stufe: 3, effektWert: [2, 3], preisMuenzen: 60 },
    ],
    maxStufen: 3,
    atemAenderung: 0,
    einStufenSeite: false,
  },
  bruchstelle: {
    id: 'bruchstelle',
    nameKey: 'gravur.bruchstelle.name',
    ueberschreibtZu: 'riss',
    stufen: [{ stufe: 1, effektWert: 1, preisMuenzen: 50 }],
    maxStufen: 1,
    atemAenderung: 0,
    einStufenSeite: true,
  },
};

// Gravur-Typ-Wechsel: Aufpreis-Default +50 % auf Stufe-1-Preis (04 §3.2) [PROVISORISCH]
export const GRAVUR_WECHSEL_AUFPREIS_FAKTOR = 1.5;

// Slice-Gravuren, deren Effekte der Kampf-Loop ausführen kann: Mult/Aufschlag
// (Wucht/Schärfe/Borke) + Status/Glanz seit Etappe B1 (Gift/Zunder/Fäulnis-Hauch/
// Dürre-Hauch/Markhärtung/Glanz). Doppelschlag/Bruchstelle folgen später. [PROVISORISCH]
export const SLICE_GRAVUREN = [
  'wucht', 'schaerfe', 'borke',
  'gift', 'zunder', 'faeulnis_hauch', 'duerre_hauch', 'markhaertung', 'glanz_gravur',
  'echo_gravur', // seit B3 (Echo im Loop)
  'beruhigungs_gravur', 'ermutigungs_gravur', // seit B5 (Pflege-Seiten im Loop)
];

// --- Blaupausen (04 §4, Schema 09 §2.3) ---------------------------------------
// Effekt-Seiten-Stapelmengen sind [PROVISORISCH] (04 §1.1 — je Blaupause offen).

function effektSeite(typ, wert) {
  return { wert: 0, effekt: [{ typ, wert }] };
}

export const BLAUPAUSEN = {
  quell: {
    id: 'quell',
    nameKey: 'blaupause.quell.name',
    typ: 'stuetze',
    seitenVorlage: Array.from({ length: 6 }, () => effektSeite('labung', 3)), // Basis 3, +1 je Trösten, Cap +8 [GESPERRT]
    seltenheit: 'episch',
    quelle: 'boss_event',
    verbrauchtSichBeimAnwenden: true,
  },
  hort: {
    id: 'hort',
    nameKey: 'blaupause.hort.name',
    typ: 'stuetze',
    seitenVorlage: Array.from({ length: 6 }, () => effektSeite('praegung', 3)), // 3 Münzen/Spiel, 1 Atem [GESPERRT]
    seltenheit: 'episch',
    quelle: 'boss_event',
    verbrauchtSichBeimAnwenden: true,
  },
  hartholz: {
    id: 'hartholz',
    nameKey: 'blaupause.hartholz.name',
    typ: 'schaden',
    seitenVorlage: schadenSeiten([3, 3, 4, 4, 5, 5]),
    seltenheit: 'haeufig',
    quelle: 'belohnung',
    verbrauchtSichBeimAnwenden: true,
  },
  splitterklinge: {
    id: 'splitterklinge',
    nameKey: 'blaupause.splitterklinge.name',
    typ: 'schaden',
    seitenVorlage: schadenSeiten([1, 2, 3, 6, 6, 6]),
    seltenheit: 'selten',
    quelle: 'haendler',
    verbrauchtSichBeimAnwenden: true,
  },
  eichenwall: {
    id: 'eichenwall',
    nameKey: 'blaupause.eichenwall.name',
    typ: 'rinde',
    seitenVorlage: rindeSeiten([3, 3, 4, 4, 5, 5]),
    seltenheit: 'haeufig',
    quelle: 'belohnung',
    verbrauchtSichBeimAnwenden: true,
  },
  giftranke: {
    id: 'giftranke',
    nameKey: 'blaupause.giftranke.name',
    typ: 'faeule',
    seitenVorlage: [...schadenSeiten([2, 2, 3, 3, 4]), effektSeite('faeule', 2)],
    seltenheit: 'selten',
    quelle: 'belohnung',
    verbrauchtSichBeimAnwenden: true,
  },
  schwelbrand: {
    id: 'schwelbrand',
    nameKey: 'blaupause.schwelbrand.name',
    typ: 'brand',
    seitenVorlage: [...schadenSeiten([2, 2, 3, 3, 4]), effektSeite('brand', 2)],
    seltenheit: 'selten',
    quelle: 'belohnung',
    verbrauchtSichBeimAnwenden: true,
  },
  morschmacher: {
    id: 'morschmacher',
    nameKey: 'blaupause.morschmacher.name',
    typ: 'schaden',
    seitenVorlage: [...schadenSeiten([2, 3, 4]), effektSeite('morsch', 1), effektSeite('morsch', 1), effektSeite('morsch', 1)],
    seltenheit: 'selten',
    quelle: 'haendler',
    verbrauchtSichBeimAnwenden: true,
  },
  duerrhauch: {
    id: 'duerrhauch',
    nameKey: 'blaupause.duerrhauch.name',
    typ: 'stuetze',
    seitenVorlage: [effektSeite('welk', 1), effektSeite('welk', 1), effektSeite('welk', 1), ...rindeSeiten([1, 1, 2])],
    seltenheit: 'selten',
    quelle: 'event',
    verbrauchtSichBeimAnwenden: true,
  },
  markstein: {
    id: 'markstein',
    nameKey: 'blaupause.markstein.name',
    typ: 'schaden',
    seitenVorlage: [...schadenSeiten([2, 3, 4]), effektSeite('kraft', 1), effektSeite('kraft', 1), ...schadenSeiten([5])],
    seltenheit: 'selten',
    quelle: 'belohnung',
    verbrauchtSichBeimAnwenden: true,
  },
  hallklinge: {
    id: 'hallklinge',
    nameKey: 'blaupause.hallklinge.name',
    typ: 'schaden',
    seitenVorlage: [...schadenSeiten([3, 4, 5, 5]), effektSeite('echo', 1), effektSeite('echo', 1)],
    seltenheit: 'episch',
    quelle: 'boss',
    verbrauchtSichBeimAnwenden: true,
  },
  glanzkorn: {
    id: 'glanzkorn',
    nameKey: 'blaupause.glanzkorn.name',
    typ: 'schaden',
    seitenVorlage: [...schadenSeiten([2, 3, 4, 5]), effektSeite('glanz', 2), effektSeite('glanz', 2)],
    seltenheit: 'episch',
    quelle: 'boss',
    verbrauchtSichBeimAnwenden: true,
  },
  weitwurf: {
    id: 'weitwurf',
    nameKey: 'blaupause.weitwurf.name',
    typ: 'schaden',
    seitenVorlage: [...schadenSeiten([2, 3, 4, 4]), effektSeite('flaeche', 3), effektSeite('flaeche', 3)],
    seltenheit: 'selten',
    quelle: 'belohnung',
    verbrauchtSichBeimAnwenden: true,
  },
  gleichmass: {
    id: 'gleichmass',
    nameKey: 'blaupause.gleichmass.name',
    typ: 'schaden',
    seitenVorlage: schadenSeiten([4, 4, 4, 4, 2, 3]),
    seltenheit: 'episch',
    quelle: 'haendler_event',
    verbrauchtSichBeimAnwenden: true,
  },
  sanftholz: {
    id: 'sanftholz',
    nameKey: 'blaupause.sanftholz.name',
    typ: 'stuetze',
    seitenVorlage: [effektSeite('ermutigung', 2), effektSeite('ermutigung', 2), ...rindeSeiten([2, 2, 3, 3])],
    seltenheit: 'haeufig',
    quelle: 'belohnung',
    verbrauchtSichBeimAnwenden: true,
  },
  wildwuchs: {
    id: 'wildwuchs',
    nameKey: 'blaupause.wildwuchs.name',
    typ: 'schaden',
    seitenVorlage: [...schadenSeiten([2, 3, 6, 6, 6]), effektSeite('riss', 1)], // Eigen-Riss-Risiko
    seltenheit: 'episch',
    quelle: 'event_fluch',
    verbrauchtSichBeimAnwenden: true,
  },
};

// Welle-1-Slice: nur diese Blaupausen aktiv, Rest bleibt Datenkatalog (04 §4).
// Etappe B4: alle 16 Blaupausen sind spielbar (Slice-Sperre aufgehoben, 04 §4).
// Quell/Labung + Hort/Prägung haben ihre Engines im Kampf-Loop; Fläche zählt im
// Ein-Gegner-Slice als Schaden; Ermutigung/Beruhigung folgen mit B5.
export const SLICE_BLAUPAUSEN = [
  'quell', 'hort', 'hartholz', 'splitterklinge', 'eichenwall', 'giftranke',
  'schwelbrand', 'morschmacher', 'duerrhauch', 'markstein', 'hallklinge',
  'glanzkorn', 'weitwurf', 'gleichmass', 'sanftholz', 'wildwuchs',
];

// --- Gegner — Region 1 + Boss 1 (05 §5/§6, kalibriert §1.2) --------------------
// Bereiche statt Festwerten (Schema 09 §2.6 erlaubt Zusatzfelder); der
// Kampf-Aufbau würfelt Instanzwerte über rng.js. Absicht immer angekündigt
// [GESPERRT]. Regionen 2–6 folgen als Datenzeilen aus 05 §5, sobald der
// Slice sie braucht (un-simulierte Kurven-Extrapolation).

export const GEGNER_VORLAGEN = {
  astbeisser: {
    id: 'astbeisser',
    nameKey: 'gegner.astbeisser.name',
    region: 1,
    rolle: 'normal',
    hpBereich: [30, 38],
    schadenBereich: [11, 12], // A8-Nach-Eichung 2026-07-04 (war 8-9)
    statusAuflagen: [],
    absichtsMuster: 'schlaeger',
    mechanikIds: [],
  },
  borkenkriecher: {
    id: 'borkenkriecher',
    nameKey: 'gegner.borkenkriecher.name',
    region: 1,
    rolle: 'normal',
    hpBereich: [38, 45],
    schadenBereich: [8, 11], // A8-Nach-Eichung 2026-07-04 (war 6-8)
    statusAuflagen: [],
    absichtsMuster: 'waechter',
    mechanikIds: ['blockt_zug_1'],
  },
  moosgnom: {
    id: 'moosgnom',
    nameKey: 'gegner.moosgnom.name',
    region: 1,
    rolle: 'normal',
    hpBereich: [30, 35],
    schadenBereich: [11, 13], // A8-Nach-Eichung 2026-07-04 (war 8-10)
    statusAuflagen: [],
    absichtsMuster: 'schlaeger',
    mechanikIds: ['schwankender_angriff'],
  },
  dornalter: {
    id: 'dornalter',
    nameKey: 'gegner.dornalter.name',
    region: 1,
    rolle: 'elite',
    hpBereich: [60, 65],
    schadenBereich: [12, 13], // A8-Nach-Eichung 2026-07-04 (war 9-10)
    statusAuflagen: [],
    absichtsMuster: 'wetterwechsler',
    mechanikIds: ['angriff_block_rotation'],
  },
  saumhueter: {
    id: 'saumhueter',
    nameKey: 'boss.saumhueter.name',
    region: 1,
    rolle: 'boss',
    hpBereich: [110, 130],
    schadenBereich: [12, 14], // A8-Nach-Eichung 2026-07-04 (war 9-11)
    statusAuflagen: [],
    absichtsMuster: 'schlaeger',
    mechanikIds: ['erste_geduld'], // jede 3. Runde zwingend Block (05 §6 Twist)
    phasen: [
      { abHpAnteil: 1.0, absichtsMuster: 'schlaeger' },
      { abHpAnteil: 0.5, absichtsMuster: 'waechter_mehrfach' },
    ],
    sonderBelohnung: { wahl: ['blaupause_haeufig', 'segen_gravur_rabatt'] },
  },
};

// --- Hain-Segen (07 §4.2, Schema 09 §2.8) --------------------------------------
// achse: G = Gier-lehnend, P = Pflege-lehnend, N = neutral. effekt/haken sind
// deklarative Deskriptoren [PROVISORISCH]; Auswertung folgt in Welle 2/3.

export const HAIN_SEGEN = {
  morgentau_krug: {
    id: 'morgentau_krug', textKey: 'segen.morgentau_krug.text', seltenheit: 'haeufig', achse: 'P',
    effekt: { typ: 'tau_einkommen', wert: 2, je: 'region' },
    hatHaken: false, hakenTextKey: null,
  },
  rindenring: {
    id: 'rindenring', textKey: 'segen.rindenring.text', seltenheit: 'haeufig', achse: 'N',
    effekt: { typ: 'erster_rinde_wuerfel_bonus', wert: 2, je: 'zug' },
    hatHaken: false, hakenTextKey: null,
  },
  fleissiges_eichhorn: {
    id: 'fleissiges_eichhorn', textKey: 'segen.fleissiges_eichhorn.text', seltenheit: 'haeufig', achse: 'N',
    effekt: { typ: 'eicheln_einkommen', wert: 3, je: 'kampf' },
    hatHaken: false, hakenTextKey: null,
  },
  warmes_moos: {
    id: 'warmes_moos', textKey: 'segen.warmes_moos.text', seltenheit: 'haeufig', achse: 'P',
    effekt: { typ: 'lagerfeuer_heilung_prozent', wert: 25 },
    hatHaken: false, hakenTextKey: null,
  },
  wetzstein: {
    id: 'wetzstein', textKey: 'segen.wetzstein.text', seltenheit: 'selten', achse: 'N',
    effekt: { typ: 'kampfbeginn_wetzung', wuerfel: 1, stapel: 1 },
    hatHaken: false, hakenTextKey: null,
  },
  loser_ast: {
    id: 'loser_ast', textKey: 'segen.loser_ast.text', seltenheit: 'selten', achse: 'N',
    effekt: { typ: 'freilauf_pro_kampf', wert: 1 },
    hatHaken: false, hakenTextKey: null,
  },
  geduldiger_waechter: {
    id: 'geduldiger_waechter', textKey: 'segen.geduldiger_waechter.text', seltenheit: 'selten', achse: 'P',
    effekt: { typ: 'sauber_sieg_gemuet', wert: 2 },
    hatHaken: true, hakenTextKey: 'segen.geduldiger_waechter.haken',
    haken: { typ: 'kein_eicheln_bonus_bei_hp_verlust' },
  },
  gieriger_griff: {
    id: 'gieriger_griff', textKey: 'segen.gieriger_griff.text', seltenheit: 'selten', achse: 'G',
    effekt: { typ: 'erster_bezahlter_reroll_frei', je: 'zug' },
    hatHaken: true, hakenTextKey: 'segen.gieriger_griff.haken',
    haken: { typ: 'kristallisation_zuschlag', wert: 1 },
  },
  splitternde_borke: {
    id: 'splitternde_borke', textKey: 'segen.splitternde_borke.text', seltenheit: 'selten', achse: 'G',
    effekt: { typ: 'vollmond_burst_prozent', wert: 50 },
    hatHaken: true, hakenTextKey: 'segen.splitternde_borke.haken',
    haken: { typ: 'scharte_ohne_vollmond', wuerfel: 1, stapel: 1, je: 'zug' },
  },
  klarer_quell: {
    id: 'klarer_quell', textKey: 'segen.klarer_quell.text', seltenheit: 'episch', achse: 'P',
    effekt: { typ: 'troesten_gemuet', wert: 3 },
    hatHaken: true, hakenTextKey: 'segen.klarer_quell.haken',
    haken: { typ: 'tau_einkommen', wert: -2, je: 'region' },
  },
  doppelter_morgen: {
    id: 'doppelter_morgen', textKey: 'segen.doppelter_morgen.text', seltenheit: 'episch', achse: 'N',
    effekt: { typ: 'kampfbeginn_wetzung', wuerfel: 2, stapel: 1 },
    hatHaken: true, hakenTextKey: 'segen.doppelter_morgen.haken',
    haken: { typ: 'gegner_absichtswert', wert: 1 },
  },
  hamsterherz: {
    id: 'hamsterherz', textKey: 'segen.hamsterherz.text', seltenheit: 'episch', achse: 'G',
    effekt: { typ: 'rinde_uebertrag', cap: 5 },
    hatHaken: true, hakenTextKey: 'segen.hamsterherz.haken',
    haken: { typ: 'max_hp', wert: -5 },
  },
  ungeduld: {
    id: 'ungeduld', textKey: 'segen.ungeduld.text', seltenheit: 'episch', achse: 'G',
    effekt: { typ: 'atem_pro_zug', wert: 1 },
    hatHaken: true, hakenTextKey: 'segen.ungeduld.haken',
    haken: { typ: 'kristallisation_verhaeltnis', wert: 2 }, // 2:1 statt 1:1
  },
  stiller_hain: {
    id: 'stiller_hain', textKey: 'segen.stiller_hain.text', seltenheit: 'boss', achse: 'P',
    effekt: { typ: 'schaden_prozent_bei_null_schreck', wert: 15 },
    hatHaken: true, hakenTextKey: 'segen.stiller_hain.haken',
    haken: { typ: 'deaktiviert_bei_schreck' },
  },
  krone_des_alten_hueters: {
    id: 'krone_des_alten_hueters', textKey: 'segen.krone_des_alten_hueters.text', seltenheit: 'boss', achse: 'G',
    effekt: { typ: 'schmiede_stufe1_rabatt_prozent', wert: 50 },
    hatHaken: true, hakenTextKey: 'segen.krone_des_alten_hueters.haken',
    haken: { typ: 'kampfbeginn_klemme', wuerfel: 1, stapel: 1 },
  },
  duerre_same: {
    id: 'duerre_same', textKey: 'segen.duerre_same.text', seltenheit: 'boss', achse: 'G',
    effekt: { typ: 'muenzen_pro_kill', wert: 2 },
    hatHaken: true, hakenTextKey: 'segen.duerre_same.haken',
    haken: { typ: 'welk_grad_pro_region', wert: 1 },
  },
};

// --- Events (07 §5.2, Schema 09 §2.7) ------------------------------------------
// Options-Effekte als deklarative Deskriptoren [PROVISORISCH].

export const EVENTS = {
  ueberwucherter_brunnen: {
    id: 'ueberwucherter_brunnen', titelKey: 'event.ueberwucherter_brunnen.titel',
    textKey: 'event.ueberwucherter_brunnen.text', regionen: [1, 2], art: 'waehrung',
    optionen: [
      { textKey: 'event.ueberwucherter_brunnen.opt1', effekt: { muenzen: 20, gemuet: { wuerfel: 1, wert: -1 } } },
      { textKey: 'event.ueberwucherter_brunnen.opt2', effekt: { tau: 4, troesten: 1 } },
      { textKey: 'event.ueberwucherter_brunnen.opt3', effekt: {} },
    ],
    kannFluchAufdruecken: false,
  },
  veraengstigtes_kaetzchen: {
    id: 'veraengstigtes_kaetzchen', titelKey: 'event.veraengstigtes_kaetzchen.titel',
    textKey: 'event.veraengstigtes_kaetzchen.text', regionen: [1, 2, 3], art: 'stimmung',
    optionen: [
      { textKey: 'event.veraengstigtes_kaetzchen.opt1', effekt: { wuerfelInsArsenal: { vorlage: 'wildzahn', gemuet: -2 } } },
      { textKey: 'event.veraengstigtes_kaetzchen.opt2', effekt: { troesten: 1 } },
    ],
    kannFluchAufdruecken: false,
  },
  moderpfuetze: {
    id: 'moderpfuetze', titelKey: 'event.moderpfuetze.titel',
    textKey: 'event.moderpfuetze.text', regionen: [2], art: 'risiko',
    optionen: [
      { textKey: 'event.moderpfuetze.opt1', effekt: { blaupauseChance: 'giftranke', fluch: 'faeule_anfaelligkeit' } },
      { textKey: 'event.moderpfuetze.opt2', effekt: {} },
    ],
    kannFluchAufdruecken: true,
  },
  schwelende_wurzel: {
    id: 'schwelende_wurzel', titelKey: 'event.schwelende_wurzel.titel',
    textKey: 'event.schwelende_wurzel.text', regionen: [3], art: 'risiko',
    optionen: [
      { textKey: 'event.schwelende_wurzel.opt1', effekt: { gravurGratis: 'zunder', selbstschaden: 3 } },
      { textKey: 'event.schwelende_wurzel.opt2', effekt: { tau: 3 } },
    ],
    kannFluchAufdruecken: false,
  },
  schrein_der_raschen_gaben: {
    id: 'schrein_der_raschen_gaben', titelKey: 'event.schrein_der_raschen_gaben.titel',
    textKey: 'event.schrein_der_raschen_gaben.text', regionen: [2, 3, 4], art: 'fluch',
    optionen: [
      { textKey: 'event.schrein_der_raschen_gaben.opt1', effekt: { fluch: 'fluch_seite', belohnung: 'episch' } },
      { textKey: 'event.schrein_der_raschen_gaben.opt2', effekt: { troesten: 1 } },
      { textKey: 'event.schrein_der_raschen_gaben.opt3', effekt: {} },
    ],
    kannFluchAufdruecken: true,
  },
  wetzstein_am_wegrand: {
    id: 'wetzstein_am_wegrand', titelKey: 'event.wetzstein_am_wegrand.titel',
    textKey: 'event.wetzstein_am_wegrand.text', regionen: [1, 2, 3, 4], art: 'waehrung',
    optionen: [
      { textKey: 'event.wetzstein_am_wegrand.opt1', effekt: { eicheln: -20, seitenAufwertung: { wuerfel: 2, wert: 1 } } },
      { textKey: 'event.wetzstein_am_wegrand.opt2', effekt: { segen: 'wetzstein' } },
    ],
    kannFluchAufdruecken: false,
  },
  stumme_lichtung: {
    id: 'stumme_lichtung', titelKey: 'event.stumme_lichtung.titel',
    textKey: 'event.stumme_lichtung.text', regionen: [4], art: 'zweifel',
    optionen: [
      { textKey: 'event.stumme_lichtung.opt1', effekt: { muenzen: 10, gemuet: { wuerfel: 1, wert: -1 } } },
      { textKey: 'event.stumme_lichtung.opt2', effekt: { troesten: 1, hinweis: 'zweifel_1' } },
    ],
    kannFluchAufdruecken: false,
  },
  hohler_stumpf: {
    id: 'hohler_stumpf', titelKey: 'event.hohler_stumpf.titel',
    textKey: 'event.hohler_stumpf.text', regionen: [5], art: 'zweifel',
    optionen: [
      { textKey: 'event.hohler_stumpf.opt1', effekt: { muenzen: 25, eicheln: 8, gemuet: { wuerfel: 1, wert: -2 } } },
      { textKey: 'event.hohler_stumpf.opt2', effekt: { troesten: 2, tau: 3, hinweis: 'zweifel_2' } },
    ],
    kannFluchAufdruecken: false,
  },
  trockene_quelle: {
    id: 'trockene_quelle', titelKey: 'event.trockene_quelle.titel',
    textKey: 'event.trockene_quelle.text', regionen: [4, 5], art: 'risiko',
    optionen: [
      { textKey: 'event.trockene_quelle.opt1', effekt: { muenzen: 30, fluch: 'scharte_fluch' } },
      { textKey: 'event.trockene_quelle.opt2', effekt: { tau: 3 } },
    ],
    kannFluchAufdruecken: true,
  },
};

// --- Fabrikfunktionen (triviale Daten-Konstruktion, keine Spiellogik) ----------

// Erzeugt eine Würfel-Instanz nach Schema 09 §2.2 aus einer Vorlage.
export function erstelleWuerfel(vorlageId, id) {
  const vorlage = WUERFEL_VORLAGEN[vorlageId];
  return {
    id,
    nameKey: vorlage.nameKey,
    typ: vorlage.typ,
    atem: vorlage.atem,
    gemuet: 0,
    blaupause: null,
    seiten: vorlage.seiten.map((s) => ({ wert: s.wert, effekt: s.effekt.map((e) => ({ ...e })) })),
    stufen: [0, 0, 0, 0, 0, 0],
  };
}

// Baut das Start-Arsenal einer Klasse (eindeutige IDs, Gemüt 0).
export function erstelleStartArsenal(klasseId) {
  const klasse = KLASSEN[klasseId];
  const arsenal = [];
  for (const { vorlage, anzahl } of klasse.startArsenal) {
    for (let i = 0; i < anzahl; i += 1) {
      arsenal.push(erstelleWuerfel(vorlage, `${klasseId}_${vorlage}_${i}`));
    }
  }
  return arsenal;
}
