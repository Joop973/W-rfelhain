// save.js — Serialisierung, Versionierung, Migration, LocalStorage-IO (09 §3).
// Gespeichert wird nur zwischen Knoten; der Kampf-State (Ziehstapel/Hand/
// Ablage/eigenStatus) wird nie serialisiert (09 §3.1 — kein Mid-Kampf-Save,
// kein RNG-State im Save). Storage ist injizierbar, damit Node-Tests ohne
// Browser laufen (Default: globalThis.localStorage).

import { erstelleStartArsenal, HUETER_BASIS_HP, KLASSEN, REGION_HPMAX_BONUS } from './data.js';

export const SAVE_VERSION = 6; // [GESPERRT] Pflichtfeld, monoton steigend
// v2 (2026-07-04): + karte, positionKnotenId, hp, belohnungenOhneBlaupause,
// entfernteWuerfel, troestenZahl (Etappe A3–A6, Karten-Run).
// v3 (2026-07-06): + pflegeZahl — Gemüt-Pflege-Zähler inkl. Ermutigung,
// speist Labung (Etappe B5; troestenZahl bleibt der Frühling-Zähler ohne Ermutigung).
// v4 (2026-07-06): + welkGrad — globaler Welk-Grad (09 §2.10, Dürre-Same-Haken;
// hainSegen existiert seit v1 und trägt ab jetzt die aktiven Segen, Etappe B6).
// v5 (2026-07-06): + setzlinge/knospeGenutzt — Heimat-Hain-Boni im Run (C5).
// v6 (2026-07-07): + hinweise/wendungGesehen (Narrativ D4) und hpMax — seit D8
// wächst hpMax je Regionstor (+8) und muss mitgespeichert werden.
export const SAVE_KEY = 'wuerfelhain_save'; // fester Key, Migration statt Save-Verlust (09 §3.3)

// --- Neuen Run anlegen (Struktur 09 §3.1) -----------------------------------

export function erstelleNeuenSave(klasseId = 'eichwart', jetzt = () => new Date().toISOString()) {
  const zeit = jetzt();
  return {
    saveVersion: SAVE_VERSION,
    erstelltAm: zeit,
    zuletztGespeichertAm: zeit,
    runState: {
      klasse: klasseId,
      arsenal: erstelleStartArsenal(klasseId),
      region: 1,
      knotenIndex: 0,
      karte: null, // null = kein laufender Karten-Run (v2)
      positionKnotenId: null,
      hp: HUETER_BASIS_HP + KLASSEN[klasseId].hpMod,
      hpMax: HUETER_BASIS_HP + KLASSEN[klasseId].hpMod,
      waehrungen: { muenzen: 0, eicheln: 0, tau: 0 },
      hainSegen: [],
      welkGrad: 0,
      setzlinge: [],
      knospeGenutzt: false,
      reifegrad: 0,
      uebermut: 0, // zwischen Knoten effektiv immer 0 (Rest kristallisiert in arsenal[].gemuet)
      belohnungenOhneBlaupause: 0,
      entfernteWuerfel: 0,
      troestenZahl: 0,
      pflegeZahl: 0,
      hinweise: [],
      wendungGesehen: false,
      aktiveFluechte: [],
      sauberSiegStreak: 0,
    },
    metaState: {
      jahresringe: 0,
      stammbaum: [],
      freigeschalteteKlassen: ['eichwart'],
    },
    einstellungen: {
      sprache: 'de',
      audioAn: true,
    },
  };
}

// --- Validierung (Schema-Invarianten 09 §2.2/§3.1, von save.js geprüft) ------

export function validiereSave(save) {
  const fehler = [];
  if (!Number.isInteger(save?.saveVersion)) fehler.push('saveVersion fehlt oder ist kein Integer');
  const run = save?.runState;
  if (!run) {
    fehler.push('runState fehlt');
    return fehler;
  }
  if (!KLASSEN[run.klasse]) fehler.push(`unbekannte Klasse: ${run.klasse}`);
  if (!Array.isArray(run.arsenal) || run.arsenal.length === 0) fehler.push('arsenal fehlt oder leer');
  else {
    const ids = new Set();
    for (const w of run.arsenal) {
      if (ids.has(w.id)) fehler.push(`doppelte Würfel-ID: ${w.id}`);
      ids.add(w.id);
      if (!Array.isArray(w.seiten) || w.seiten.length !== 6) fehler.push(`${w.id}: seiten != 6`);
      if (!Array.isArray(w.stufen) || w.stufen.length !== 6 || w.stufen.some((s) => s < 0 || s > 3)) {
        fehler.push(`${w.id}: stufen außerhalb [0,3]`); // harter Cap 3, global [GESPERRT]
      }
      if (typeof w.gemuet !== 'number') fehler.push(`${w.id}: gemuet fehlt`);
    }
  }
  if (run.uebermut !== 0) fehler.push('uebermut muss zwischen Knoten 0 sein (09 §3.1)');
  for (const [name, wert] of Object.entries(run.waehrungen ?? {})) {
    if (!Number.isFinite(wert) || wert < 0) fehler.push(`Währung ${name} ungültig: ${wert}`);
  }
  return fehler;
}

// --- Migration (09 §3.2) ------------------------------------------------------
// Jede Struktur-Änderung erhöht SAVE_VERSION um 1 und registriert hier eine
// reine Funktion migriere_N_zu_N+1(altesSave) → neuesSave. Die Kette muss
// lückenlos sein (Test prüft).

export const MIGRATIONEN = {
  // v1 → v2: Karten-Run-Felder ergänzen. karte: null bedeutet "kein laufender
  // Run" — die UI startet dann eine frische Region mit dem geretteten Arsenal.
  1: (save) => ({
    ...save,
    saveVersion: 2,
    runState: {
      ...save.runState,
      karte: null,
      positionKnotenId: null,
      hp: save.runState.hp ?? null,
      belohnungenOhneBlaupause: save.runState.belohnungenOhneBlaupause ?? 0,
      entfernteWuerfel: 0,
      troestenZahl: 0,
    },
  }),
  // v2 → v3: pflegeZahl ergänzen. Bester Schätzer für Bestands-Saves ist die
  // bisherige troestenZahl (bis v2 gab es keine Ermutigungs-Ereignisse im Loop).
  2: (save) => ({
    ...save,
    saveVersion: 3,
    runState: {
      ...save.runState,
      pflegeZahl: save.runState.pflegeZahl ?? save.runState.troestenZahl ?? 0,
    },
  }),
  // v3 → v4: welkGrad ergänzen (0 = frisch); hainSegen zur Sicherheit auffüllen.
  3: (save) => ({
    ...save,
    saveVersion: 4,
    runState: {
      ...save.runState,
      welkGrad: save.runState.welkGrad ?? 0,
      hainSegen: save.runState.hainSegen ?? [],
    },
  }),
  // v4 → v5: Heimat-Hain-Felder (C5) — Bestands-Runs haben keine Setzlinge.
  4: (save) => ({
    ...save,
    saveVersion: 5,
    runState: {
      ...save.runState,
      setzlinge: save.runState.setzlinge ?? [],
      knospeGenutzt: save.runState.knospeGenutzt ?? false,
    },
  }),
  // v5 → v6: Narrativ-Felder (D4) + hpMax. Bestands-Saves in Region ≥ 6 haben
  // die Wendung logisch schon passiert; hpMax rekonstruiert den D8-Bonus
  // (+8 je durchschrittenem Regionstor).
  5: (save) => ({
    ...save,
    saveVersion: 6,
    runState: {
      ...save.runState,
      hinweise: save.runState.hinweise ?? [],
      wendungGesehen: save.runState.wendungGesehen ?? (save.runState.region ?? 1) >= 6,
      hpMax:
        save.runState.hpMax ??
        HUETER_BASIS_HP +
          (KLASSEN[save.runState.klasse]?.hpMod ?? 0) +
          ((save.runState.setzlinge ?? []).includes('tiefwurzel') ? 5 : 0) +
          REGION_HPMAX_BONUS * ((save.runState.region ?? 1) - 1),
    },
  }),
};

export class SaveVersionsFehler extends Error {}

export function migriere(rawSave) {
  if (!Number.isInteger(rawSave?.saveVersion)) {
    throw new SaveVersionsFehler('Save ohne gültige saveVersion');
  }
  if (rawSave.saveVersion > SAVE_VERSION) {
    // Save aus neuerem Build → Fehler anzeigen, nicht stillschweigend laden [GESPERRT]
    throw new SaveVersionsFehler(
      `Save-Version ${rawSave.saveVersion} ist neuer als unterstützt (${SAVE_VERSION})`
    );
  }
  let save = rawSave;
  while (save.saveVersion < SAVE_VERSION) {
    const migration = MIGRATIONEN[save.saveVersion];
    if (!migration) {
      throw new SaveVersionsFehler(`Migrationslücke: keine Migration ab Version ${save.saveVersion}`);
    }
    save = migration(save);
  }
  return save;
}

// Lückenlosigkeit der Kette: für jede Version 1..SAVE_VERSION-1 muss eine
// Migration existieren (09 §3.2 — Build-Fehler, Test prüft).
export function pruefeMigrationsKette() {
  const luecken = [];
  for (let v = 1; v < SAVE_VERSION; v += 1) {
    if (typeof MIGRATIONEN[v] !== 'function') luecken.push(v);
  }
  return luecken;
}

// --- Persistenz (09 §3.3) -------------------------------------------------------
// Schreiben nur nach Knoten-Abschluss (Aufrufdisziplin des Run-Loops), fester Key.

export function speichere(save, storage = globalThis.localStorage, jetzt = () => new Date().toISOString()) {
  const fehler = validiereSave(save);
  if (fehler.length > 0) {
    throw new Error(`Save ungültig: ${fehler.join(' · ')}`);
  }
  const zuSpeichern = { ...save, zuletztGespeichertAm: jetzt() };
  storage.setItem(SAVE_KEY, JSON.stringify(zuSpeichern));
  return zuSpeichern;
}

export function lade(storage = globalThis.localStorage) {
  const roh = storage.getItem(SAVE_KEY);
  if (roh == null) return null;
  const save = migriere(JSON.parse(roh));
  const fehler = validiereSave(save);
  if (fehler.length > 0) {
    throw new Error(`Geladener Save ungültig: ${fehler.join(' · ')}`);
  }
  return save;
}

export function loesche(storage = globalThis.localStorage) {
  storage.removeItem(SAVE_KEY);
}
