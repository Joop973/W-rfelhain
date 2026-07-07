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
    hpMod: 5, // 0→+5 nachgeschärft (C7-Befund: Floor-Dip kostet real mehr als 06 §3 erwartete)
    startArsenal: [
      { vorlage: 'astschneide', anzahl: 7 },
      { vorlage: 'borkenschild', anzahl: 2 },
      { vorlage: 'sanftholz', anzahl: 3 },
    ], // 6/3/3-Versuch rückgebaut (C7: Output-Verlust wog schwerer als Block-Gewinn)
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
    passiv: { typ: 'widerhall', schadenFlach: 5, bedingung: 'gleichklang_aktiv' }, // +3→+5 nachgeschärft (C7-Befund: 32 % Standard-Siegrate)
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

  // --- Region 2 — Moderbruch (Fäule/Morsch) [SIM, un-kalibriert — 05 §5] ---------
  // statusAuflagen: { typ, stapel, mit } — mit: 'sieche' (eigener Status-Zug),
  // 'angriff' (zusammen mit dem Treffer), 'selbst' (Self-Buff je Zyklus).
  faeulnisqualle: {
    id: 'faeulnisqualle', nameKey: 'gegner.faeulnisqualle.name', region: 2, rolle: 'normal',
    hpBereich: [45, 55], schadenBereich: [9, 11],
    statusAuflagen: [{ typ: 'faeule', stapel: 2, mit: 'sieche' }],
    absichtsMuster: 'sieche', mechanikIds: [],
  },
  sporenbalg: {
    id: 'sporenbalg', nameKey: 'gegner.sporenbalg.name', region: 2, rolle: 'normal',
    hpBereich: [50, 65], schadenBereich: [10, 12],
    statusAuflagen: [{ typ: 'faeule', stapel: 2, mit: 'sieche' }],
    absichtsMuster: 'schlaeger_sieche', mechanikIds: [],
  },
  schimmelwicht: {
    id: 'schimmelwicht', nameKey: 'gegner.schimmelwicht.name', region: 2, rolle: 'normal',
    hpBereich: [40, 50], schadenBereich: [9, 10],
    statusAuflagen: [], absichtsMuster: 'rasende', treffer: 2, mechanikIds: [],
  },
  modermutter: {
    id: 'modermutter', nameKey: 'gegner.modermutter.name', region: 2, rolle: 'elite',
    hpBereich: [100, 115], schadenBereich: [12, 14],
    statusAuflagen: [{ typ: 'faeule', stapel: 3, mit: 'angriff' }],
    absichtsMuster: 'wetterwechsler', mechanikIds: [],
  },
  pilzhort: {
    id: 'pilzhort', nameKey: 'gegner.pilzhort.name', region: 2, rolle: 'elite',
    hpBereich: [115, 130], schadenBereich: [11, 13],
    statusAuflagen: [{ typ: 'faeule', stapel: 2, mit: 'angriff' }],
    absichtsMuster: 'waechter', mechanikIds: [],
  },

  // --- Region 3 — Schwelgrund (Brand) [SIM, un-kalibriert] -----------------------
  glutkorn: {
    id: 'glutkorn', nameKey: 'gegner.glutkorn.name', region: 3, rolle: 'normal',
    hpBereich: [70, 80], schadenBereich: [14, 16],
    statusAuflagen: [{ typ: 'brand', stapel: 3, mit: 'sieche' }],
    absichtsMuster: 'sieche', mechanikIds: [],
  },
  aschekriecher: {
    id: 'aschekriecher', nameKey: 'gegner.aschekriecher.name', region: 3, rolle: 'normal',
    hpBereich: [85, 100], schadenBereich: [15, 18],
    statusAuflagen: [{ typ: 'brand', stapel: 3, mit: 'angriff' }],
    absichtsMuster: 'schlaeger', mechanikIds: [],
  },
  funkenschwarm: {
    id: 'funkenschwarm', nameKey: 'gegner.funkenschwarm.name', region: 3, rolle: 'normal',
    hpBereich: [70, 85], schadenBereich: [13, 15],
    statusAuflagen: [{ typ: 'kraft', stapel: 1, mit: 'selbst' }],
    absichtsMuster: 'rasende', treffer: 3, mechanikIds: [],
  },
  schwelbrand_ur: {
    id: 'schwelbrand_ur', nameKey: 'gegner.schwelbrand_ur.name', region: 3, rolle: 'elite',
    hpBereich: [150, 170], schadenBereich: [18, 20],
    statusAuflagen: [{ typ: 'brand', stapel: 4, mit: 'angriff' }, { typ: 'kraft', stapel: 1, mit: 'selbst' }],
    absichtsMuster: 'rasende', treffer: 2, mechanikIds: [],
  },
  glutwaechter: {
    id: 'glutwaechter', nameKey: 'gegner.glutwaechter.name', region: 3, rolle: 'elite',
    hpBereich: [170, 190], schadenBereich: [16, 19],
    statusAuflagen: [{ typ: 'brand', stapel: 4, mit: 'angriff' }],
    absichtsMuster: 'waechter', mechanikIds: [],
  },

  // --- Region 4 — Dürrmark (Welk; Scharte-Einstieg) [SIM, un-kalibriert] ---------
  duerrgeist: {
    id: 'duerrgeist', nameKey: 'gegner.duerrgeist.name', region: 4, rolle: 'normal',
    hpBereich: [110, 130], schadenBereich: [20, 23],
    statusAuflagen: [{ typ: 'welk', stapel: 2, mit: 'sieche' }],
    absichtsMuster: 'sieche', mechanikIds: [],
  },
  zehrranke: {
    id: 'zehrranke', nameKey: 'gegner.zehrranke.name', region: 4, rolle: 'normal',
    hpBereich: [130, 150], schadenBereich: [21, 24],
    statusAuflagen: [{ typ: 'welk', stapel: 1, mit: 'sieche' }, { typ: 'scharte', stapel: 1, mit: 'sieche' }],
    absichtsMuster: 'schlaeger_sieche', mechanikIds: [],
  },
  aschgabler: {
    id: 'aschgabler', nameKey: 'gegner.aschgabler.name', region: 4, rolle: 'normal',
    hpBereich: [115, 135], schadenBereich: [22, 25],
    statusAuflagen: [], absichtsMuster: 'rasende', treffer: 2, mechanikIds: [],
  },
  auszehrer: {
    id: 'auszehrer', nameKey: 'gegner.auszehrer.name', region: 4, rolle: 'elite',
    hpBereich: [220, 245], schadenBereich: [26, 29],
    statusAuflagen: [{ typ: 'welk', stapel: 3, mit: 'angriff' }, { typ: 'morsch', stapel: 1, mit: 'angriff' }],
    absichtsMuster: 'wetterwechsler', mechanikIds: [],
  },
  rissmark_alter: {
    id: 'rissmark_alter', nameKey: 'gegner.rissmark_alter.name', region: 4, rolle: 'elite',
    hpBereich: [245, 270], schadenBereich: [24, 27],
    statusAuflagen: [{ typ: 'scharte', stapel: 2, mit: 'angriff' }],
    absichtsMuster: 'waechter', mechanikIds: [],
  },

  // --- Region 5 — Graupforte (Riss/Scharte/Klemme) [SIM, un-kalibriert] ----------
  furchtwisp: {
    id: 'furchtwisp', nameKey: 'gegner.furchtwisp.name', region: 5, rolle: 'normal',
    hpBereich: [160, 185], schadenBereich: [28, 31],
    statusAuflagen: [{ typ: 'riss', stapel: 1, mit: 'sieche' }],
    absichtsMuster: 'sieche', mechanikIds: [],
  },
  klemmzange: {
    id: 'klemmzange', nameKey: 'gegner.klemmzange.name', region: 5, rolle: 'normal',
    hpBereich: [185, 210], schadenBereich: [30, 33],
    statusAuflagen: [{ typ: 'klemme', stapel: 1, mit: 'sieche' }],
    absichtsMuster: 'schlaeger_sieche', mechanikIds: [],
  },
  scharkant: {
    id: 'scharkant', nameKey: 'gegner.scharkant.name', region: 5, rolle: 'normal',
    hpBereich: [170, 195], schadenBereich: [29, 32],
    statusAuflagen: [{ typ: 'scharte', stapel: 1, mit: 'angriff' }],
    absichtsMuster: 'schlaeger', mechanikIds: [],
  },
  stillewicht: {
    id: 'stillewicht', nameKey: 'gegner.stillewicht.name', region: 5, rolle: 'normal',
    hpBereich: [160, 180], schadenBereich: [28, 30],
    statusAuflagen: [{ typ: 'welk', stapel: 2, mit: 'angriff' }, { typ: 'riss', stapel: 1, mit: 'angriff' }],
    absichtsMuster: 'rasende', treffer: 2, mechanikIds: [],
  },
  graupfoertnerin: {
    id: 'graupfoertnerin', nameKey: 'gegner.graupfoertnerin.name', region: 5, rolle: 'elite',
    hpBereich: [320, 350], schadenBereich: [34, 37],
    statusAuflagen: [{ typ: 'klemme', stapel: 2, mit: 'angriff' }, { typ: 'scharte', stapel: 1, mit: 'angriff' }],
    absichtsMuster: 'wetterwechsler', mechanikIds: [],
  },
  rissfuerst: {
    id: 'rissfuerst', nameKey: 'gegner.rissfuerst.name', region: 5, rolle: 'elite',
    hpBereich: [350, 380], schadenBereich: [32, 36],
    statusAuflagen: [{ typ: 'riss', stapel: 1, mit: 'angriff' }, { typ: 'welk', stapel: 3, mit: 'angriff' }],
    absichtsMuster: 'rasende', treffer: 2, mechanikIds: [],
  },

  // --- Region 6 — Hohles Herz (alles gebündelt) [SIM, un-kalibriert] -------------
  hohlenwaechter: {
    id: 'hohlenwaechter', nameKey: 'gegner.hohlenwaechter.name', region: 6, rolle: 'normal',
    hpBereich: [230, 260], schadenBereich: [38, 42],
    statusAuflagen: [{ typ: 'scharte', stapel: 2, mit: 'angriff' }, { typ: 'brand', stapel: 4, mit: 'angriff' }],
    absichtsMuster: 'wetterwechsler', mechanikIds: [],
  },
  duerre_echo: {
    id: 'duerre_echo', nameKey: 'gegner.duerre_echo.name', region: 6, rolle: 'normal',
    hpBereich: [260, 290], schadenBereich: [40, 44],
    statusAuflagen: [{ typ: 'welk', stapel: 3, mit: 'sieche' }, { typ: 'klemme', stapel: 2, mit: 'sieche' }],
    absichtsMuster: 'sieche', mechanikIds: [],
  },
  schreckborke: {
    id: 'schreckborke', nameKey: 'gegner.schreckborke.name', region: 6, rolle: 'normal',
    hpBereich: [240, 270], schadenBereich: [39, 43],
    statusAuflagen: [{ typ: 'riss', stapel: 1, mit: 'angriff' }, { typ: 'faeule', stapel: 4, mit: 'angriff' }],
    absichtsMuster: 'rasende', treffer: 2, mechanikIds: [],
  },
  rindenhohl: {
    id: 'rindenhohl', nameKey: 'gegner.rindenhohl.name', region: 6, rolle: 'elite',
    hpBereich: [450, 485], schadenBereich: [46, 50],
    statusAuflagen: [{ typ: 'morsch', stapel: 2, mit: 'angriff' }, { typ: 'scharte', stapel: 2, mit: 'angriff' }],
    absichtsMuster: 'waechter', mechanikIds: [],
  },
  letzter_schatten: {
    id: 'letzter_schatten', nameKey: 'gegner.letzter_schatten.name', region: 6, rolle: 'elite',
    hpBereich: [485, 520], schadenBereich: [44, 48],
    statusAuflagen: [{ typ: 'klemme', stapel: 2, mit: 'angriff' }, { typ: 'scharte', stapel: 2, mit: 'angriff' }, { typ: 'welk', stapel: 4, mit: 'angriff' }],
    absichtsMuster: 'wetterwechsler', mechanikIds: [],
  },

  // --- Bosse 2–6 (05 §6) — D1: Grundmuster; Phasen/Twists folgen mit D2/D3 -------
  // Boss 2 (05 §6): Sieche-Grundmuster; Phase 2 (<60 %) eskaliert die Fäule-
  // Auflage (+1 je Boss-Zyklus); Twist "Ausbreitung": Fäule auf dem Hüter
  // decayt nicht, solange der Boss > 30 % HP hat.
  modermutter_brut: {
    id: 'modermutter_brut', nameKey: 'boss.modermutter_brut.name', region: 2, rolle: 'boss',
    hpBereich: [180, 210], schadenBereich: [10, 12],
    statusAuflagen: [{ typ: 'faeule', stapel: 2, mit: 'sieche' }], // 3→2: Ausbreitung-Freeze macht die Auflage zur Uhr (D8)
    absichtsMuster: 'sieche', mechanikIds: ['ausbreitung'],
    phasen: [
      { abHpAnteil: 1.0, absichtsMuster: 'sieche' },
      { abHpAnteil: 0.6, absichtsMuster: 'sieche', statusAuflagen: [{ typ: 'faeule', stapel: 2, mit: 'sieche', eskaliert: true }] },
    ],
  },
  // Boss 3 (05 §6): Rasende 3× + Brand; Phase 2 (<66 %) Kraft-Eskalation,
  // Phase 3 (<33 %) Brand + Kraft gleichzeitig; Twist "Auflodern": +1 Grund-
  // schaden je Rundenende, Gegengewicht: Brand auf ihm zündet doppelt.
  schwelbrand: {
    id: 'schwelbrand', nameKey: 'boss.schwelbrand.name', region: 3, rolle: 'boss',
    hpBereich: [280, 320], schadenBereich: [16, 19],
    statusAuflagen: [{ typ: 'brand', stapel: 4, mit: 'angriff' }],
    absichtsMuster: 'rasende', treffer: 3, mechanikIds: ['auflodern'],
    phasen: [
      { abHpAnteil: 1.0, absichtsMuster: 'rasende', treffer: 3 },
      { abHpAnteil: 0.66, absichtsMuster: 'rasende', treffer: 3, statusAuflagen: [{ typ: 'kraft', stapel: 1, mit: 'selbst' }] }, // Kraft 2→1 (D8)
      { abHpAnteil: 0.33, absichtsMuster: 'rasende', treffer: 3, statusAuflagen: [{ typ: 'brand', stapel: 3, mit: 'angriff' }, { typ: 'kraft', stapel: 1, mit: 'selbst' }] },
    ],
  },
  // Boss 4 (05 §6): Sieche mit Welk+Scharte; Phase 2 (<50 %) plus Morsch-Spitze;
  // Twist "Auszehrung": passives Welk 1 je Rundenbeginn (Cap 4, Anti-Brick).
  auszehrer_fuerst: {
    id: 'auszehrer_fuerst', nameKey: 'boss.auszehrer_fuerst.name', region: 4, rolle: 'boss',
    hpBereich: [400, 450], schadenBereich: [22, 25],
    statusAuflagen: [{ typ: 'welk', stapel: 3, mit: 'sieche' }, { typ: 'scharte', stapel: 1, mit: 'sieche' }],
    absichtsMuster: 'schlaeger_sieche', mechanikIds: ['auszehrung'],
    phasen: [
      { abHpAnteil: 1.0, absichtsMuster: 'schlaeger_sieche' },
      { abHpAnteil: 0.5, absichtsMuster: 'sieche', statusAuflagen: [{ typ: 'welk', stapel: 3, mit: 'sieche' }, { typ: 'scharte', stapel: 1, mit: 'sieche' }, { typ: 'morsch', stapel: 1, mit: 'sieche' }] },
    ],
  },
  // Boss 5 (05 §6): Wetterwechsler mit Scharte/Klemme; Phase 2 (<50 %) plus
  // Riss (Dauer-erneuert via legeStatusAuf); Twist "Enge Pforte": Übermut > 0
  // ins Rundenende → +1 Schreck auf einen zufälligen Würfel.
  graupfoertnerin_boss: {
    id: 'graupfoertnerin_boss', nameKey: 'boss.graupfoertnerin.name', region: 5, rolle: 'boss',
    hpBereich: [550, 620], schadenBereich: [30, 34],
    statusAuflagen: [{ typ: 'scharte', stapel: 2, mit: 'angriff' }, { typ: 'klemme', stapel: 2, mit: 'angriff' }],
    absichtsMuster: 'wetterwechsler', mechanikIds: ['enge_pforte'],
    phasen: [
      { abHpAnteil: 1.0, absichtsMuster: 'wetterwechsler' },
      { abHpAnteil: 0.5, absichtsMuster: 'wetterwechsler', statusAuflagen: [{ typ: 'scharte', stapel: 2, mit: 'angriff' }, { typ: 'klemme', stapel: 2, mit: 'angriff' }, { typ: 'riss', stapel: 1, mit: 'angriff' }] },
    ],
  },
  // Endboss (05 §6/§7/§8, D3): drei Phasen — "Die Stimme" (lesbar, kaum Status),
  // "Der Riss" (Debuff-Bündelung mit Doppel-Spitzen), "Dein Spiegel"
  // (personalisiert aus dem ängstlichsten Arsenal; ruhig bei Schreck 0).
  // Twist "Das hohle Echo": heilt je Rundenende um das Rest-Übermut des Hüters.
  // bossSchreckStart: Trösten-Konto für die Befriedung (05 §8, Start 12–16 [SIM]).
  frueherer_hueter: {
    id: 'frueherer_hueter', nameKey: 'boss.frueherer_hueter.name', region: 6, rolle: 'boss',
    hpBereich: [750, 850], schadenBereich: [38, 44],
    statusAuflagen: [],
    absichtsMuster: 'wetterwechsler', mechanikIds: ['hohles_echo', 'dein_spiegel'],
    bossSchreckStart: 14,
    phasen: [
      { abHpAnteil: 1.0, absichtsMuster: 'wetterwechsler' }, // "Die Stimme"
      { abHpAnteil: 0.66, absichtsMuster: 'wetterwechsler', treffer: 2, statusAuflagen: [
        { typ: 'scharte', stapel: 2, mit: 'angriff' },
        { typ: 'klemme', stapel: 2, mit: 'angriff' },
        { typ: 'welk', stapel: 2, mit: 'angriff' },
      ] }, // "Der Riss" — Riss/Morsch "gelegentlich" vereinfacht [PROVISORISCH]
      { abHpAnteil: 0.33, absichtsMuster: 'wetterwechsler', statusAuflagen: [] }, // "Dein Spiegel" — Module via kampf.js
    ],
  },
};

// Voll-Run-Kalibrierung (D8, Balance-Tor 3) [PROVISORISCH — Sim eicht]:
// globale Mults auf die 05-§5-Rohwerte je Region. Die Roster-Zeilen bleiben
// unangetastet; hier dreht die Eichung. Start: 1.0 = Doc-Werte.
export const REGION_TUNING = {
  // R1: die A8-Härtung (+32 %) war das SLICE-Band (Region 1 = ganzer Run);
  // im vollen Run ist R1 der Lernboden → zurück Richtung 05-Originalwerte.
  // bossHp: zusätzlicher Boss-Faktor — das Kampffenster muss ~5–6 Züge bleiben,
  // sonst werden die Boss-Uhren (Twists/Eskalationen) unschaffbar.
  // status: Dämpfer auf Gegner-Status-Stapel (Debuff-Dichte spät erdrückend).
  1: { hp: 1.0, schaden: 0.75, bossHp: 1.0, status: 1.0 },
  2: { hp: 0.6, schaden: 0.65, bossHp: 0.85, status: 1.0 },
  3: { hp: 0.4, schaden: 0.4, bossHp: 0.85, status: 0.8 },
  4: { hp: 0.4, schaden: 0.38, bossHp: 0.7, status: 0.7 },
  5: { hp: 0.3, schaden: 0.28, bossHp: 0.55, status: 0.6 },
  6: { hp: 0.2, schaden: 0.19, bossHp: 0.5, status: 0.4 },
};

// Rast am Regionstor (D8) [PROVISORISCH]: Heilung beim Region-Übergang als
// Anteil von hpMax — ohne strukturelle Erholung ist der 6-Regionen-Run
// rechnerisch unschaffbar (Befund docs/BalanceTor3_Befund.md).
export const REGION_HEILUNG_ANTEIL = 1.0; // Vollheilung am Tor — macht die Regions-Eichung entkoppelt (D8-Iteration 3)
// Der Hüter wächst mit dem Weg (D8) [PROVISORISCH — D-Entscheid]: +Max-HP je
// Regionstor. Ohne strukturelles Spieler-Wachstum konvergiert die 6-Regionen-
// Kurve nicht (Output wächst ~+40 %, Gegner-Rohkurve ×4-8).
export const REGION_HPMAX_BONUS = 8;

// Region-Zuordnung für die Kampf-Auswahl (D1). REGION_MAX = voller Run (00 §2).
export const REGION_MAX = 6;
export const REGION_GEGNER = {
  1: { normal: ['astbeisser', 'borkenkriecher', 'moosgnom'], elite: ['dornalter'], boss: 'saumhueter' },
  2: { normal: ['faeulnisqualle', 'sporenbalg', 'schimmelwicht'], elite: ['modermutter', 'pilzhort'], boss: 'modermutter_brut' },
  3: { normal: ['glutkorn', 'aschekriecher', 'funkenschwarm'], elite: ['schwelbrand_ur', 'glutwaechter'], boss: 'schwelbrand' },
  4: { normal: ['duerrgeist', 'zehrranke', 'aschgabler'], elite: ['auszehrer', 'rissmark_alter'], boss: 'auszehrer_fuerst' },
  5: { normal: ['furchtwisp', 'klemmzange', 'scharkant', 'stillewicht'], elite: ['graupfoertnerin', 'rissfuerst'], boss: 'graupfoertnerin_boss' },
  6: { normal: ['hohlenwaechter', 'duerre_echo', 'schreckborke'], elite: ['rindenhohl', 'letzter_schatten'], boss: 'frueherer_hueter' },
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
