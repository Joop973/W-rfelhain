// ui/main.js — DOM-Rendering + Eingabe, kein Spiellogik-Code (09 §1).
// Karten-Run Region 1: Karte → Knoten (Kampf/Schmiede/Markt/Event/Lagerfeuer) → Karte.
// Alles in Platzhalter-Konvention (08 §4.0).

import { RNG } from '../rng.js';
import { schreck, gesperrteSeitenAnzahl, KIPP_PUNKT } from '../push.js';
import { uebersetze, setzeSprache, aktiveSprache } from '../i18n/sprache.js';
import { KLASSEN, HUETER_BASIS_HP } from '../data.js';
import { erstelleNeuenSave, speichere, lade, loesche } from '../save.js';
import {
  STAMMBAUM_KNOTEN,
  SETZLINGE,
  normalisiereMeta,
  verdieneJahresringe,
  verdieneSamen,
  pruefeStammbaumKauf,
  kaufeStammbaumKnoten,
  pruefeSetzlingKauf,
  pflanzeSetzling,
  aktiveSetzlinge,
} from '../meta.js';
import { bestimmeEnde, endSchreck, merkeEnde } from '../enden.js';
import {
  starteRun,
  starteKampf,
  beginneZug,
  rerolle,
  platziere,
  nimmZurueck,
  loeseZugAuf,
  fuehreGegnerzugAus,
  arsenalSchreckSumme,
  verfuegbareKnoten,
  betreteKnoten,
  findeKnoten,
} from '../kampf.js';
import { wendeBelohnungAn } from '../belohnung.js';
import {
  erstelleSchmiedeAngebot,
  schmiedePreis,
  kaufeGravur,
  erstelleMarktAngebot,
  kaufeWuerfel,
  kaufeMarktBlaupause,
  kaufeMarktSegen,
  entfernenPreis,
  entferneWuerfel,
  troesteDienst,
  TROESTEN_DIENST_TAU,
  zieheEvent,
  waehleEventOption,
  eventOptionMoeglich,
  rasteLagerfeuer,
} from '../knoten.js';
import {
  mentorBeiRegionEintritt,
  mentorBeiTischsturz,
  wendungSzene,
  wendungSteht,
  endeSzenen,
  welkStufe,
} from '../narrativ.js';
import * as audio from './audio.js';

let rng = new RNG((Date.now() >>> 0) || 1);
// Icon je Knotentyp — der Name kommt als Text-Key (ui.knoten.<typ>, E6).
const KNOTEN_ICON = {
  kampf: '⚔', elite: '☠', boss: '👑', markt: '🧺',
  schmiede: '🔨', event: '❖', lagerfeuer: '🔥',
};
const knotenLabel = (typ) => `${KNOTEN_ICON[typ]} ${uebersetze(`ui.knoten.${typ}`)}`;

let run = null;
let kampf = null;
let meta = normalisiereMeta(null); // Meta-Progression, überlebt Run-Enden (C1)
let modus = 'karte'; // karte | kampf | schmiede | markt | event | lagerfeuer | wendung
let letztesEreignis = '';
let mentorZeile = null; // aktiver Mentor-Text-Key (D4) — bis zum nächsten Knoten sichtbar
// UI-Auswahlzustände
let belohnungsWahl = null; // { option, wuerfelId? }
let schmiedeWahl = null; // { gravurId, wuerfelId? }
let marktWahl = null; // { aktion: 'blaupause'|'entfernen'|'troesten', blaupause? }
let lagerfeuerWahl = null; // 'troesten' | 'vollenden'
let knotenKontext = null; // Angebot/Event des aktiven Knotens
let klassenWahl = false; // Klassen-Auswahl vor neuem Run (C2/C3)
let reifegradWahl = 0; // gewählte Ascension-Stufe für den nächsten Run (C4)
let tutorial = null; // geführter erster Kampf (E: einmal je Profil, meta.tutorialGesehen)

// Tutorial-Zeile über den Mentor-Kanal zeigen — jede höchstens einmal.
function tutorialZeile(schritt) {
  if (!tutorial || tutorial.gezeigt.has(schritt)) return;
  tutorial.gezeigt.add(schritt);
  mentorZeile = `tutorial.${schritt}`;
}

function beendeTutorial() {
  if (!tutorial) return;
  tutorial = null;
  meta.tutorialGesehen = true; // persistiert über metaState (normalisiereMeta erhält das Feld)
}

const wurzel = document.getElementById('spiel');
const hain = document.getElementById('hain');

// Sprite-Manifest (D6): vorhandene Assets; fehlt ein Key → Platzhalter-Box
// (08 §4.0). Lädt asynchron — bis dahin rendert alles als Platzhalter.
let sprites = null;
fetch('assets/manifest.json')
  .then((r) => (r.ok ? r.json() : null))
  .then((m) => { if (m) { sprites = m; render(); } })
  .catch(() => { /* kein Manifest — Platzhalter bleiben */ });

function wuerfelSprite(typ) {
  return sprites?.wuerfel?.[typ]?.png ?? null;
}
function gegnerSprite(vorlageId) {
  return sprites?.gegner?.[vorlageId]?.png ?? null;
}
function seitenIcon(effektTyp) {
  return sprites?.icons?.seite?.includes(effektTyp) ? `assets/icons/seite.${effektTyp}.png` : null;
}
function figurSprite(key) {
  return sprites?.figur?.[key]?.png ?? null;
}
function szeneSprite(key) {
  return sprites?.szene?.[key]?.png ?? null; // z. B. "boden.r1", "bg.kulisse.r1"
}
function uiSprite(key) {
  return sprites?.ui?.keys?.includes(key) ? `assets/ui/${key}.png` : null;
}

// Welk-Entsättigung (D5, 08 §3.4 Variante C): Klasse welk-0…5 am Wurzel-
// Container treibt den CSS-Filter; Audio dünnt deckungsgleich aus (08 §2.2).
function wendeWelkStufeAn() {
  const stufe = run ? welkStufe(run) : 0;
  if (hain && !hain.classList.contains(`welk-${stufe}`)) {
    for (let i = 0; i <= 5; i += 1) hain.classList.remove(`welk-${i}`);
    hain.classList.add(`welk-${stufe}`);
    audio.setzeWelkStufe(stufe);
  }
}

// Autoplay-Policy: die erste Geste entsperrt den AudioContext und startet
// die Region-Stems (No-Op, solange keine Audio-Dateien liegen — D6).
document.addEventListener('pointerdown', () => {
  audio.entsperreAudio();
  if (run) audio.spieleRegion(run.region ?? 1, welkStufe(run));
}, { once: true });

// --- Persistenz (nur zwischen Knoten, 09 §3.1/§3.3) ------------------------------

function speichereZwischenKnoten() {
  try {
    const save = erstelleNeuenSave(run.klasse);
    Object.assign(save.runState, {
      arsenal: run.arsenal,
      karte: run.karte,
      positionKnotenId: run.positionKnotenId,
      hp: run.hp,
      waehrungen: run.waehrungen,
      belohnungenOhneBlaupause: run.belohnungenOhneBlaupause,
      entfernteWuerfel: run.entfernteWuerfel,
      troestenZahl: run.troestenZahl,
      pflegeZahl: run.pflegeZahl,
      hainSegen: run.hainSegen,
      welkGrad: run.welkGrad,
      reifegrad: run.reifegrad ?? 0,
      setzlinge: run.setzlinge ?? [],
      knospeGenutzt: run.knospeGenutzt ?? false,
      region: run.region ?? 1,
      hpMax: run.hpMax,
      hinweise: run.hinweise ?? [],
      wendungGesehen: run.wendungGesehen ?? false,
      kampfKnoten: run.kampfKnoten ?? null,
    });
    save.metaState = meta; // Meta überlebt Run-Wechsel (C1)
    save.einstellungen.sprache = aktiveSprache(); // D7
    speichere(save);
  } catch {
    /* kein localStorage (z. B. file://) — ignorieren */
  }
}

// Am Run-Ende: frische Save-Hülle (karte: null → kein Wiederaufnehmen eines
// toten Runs), aber mit aktuellem Meta-Stand (C1).
function speichereNurMeta() {
  try {
    const save = erstelleNeuenSave(run?.klasse ?? 'eichwart');
    save.metaState = meta;
    save.einstellungen.sprache = aktiveSprache(); // D7
    speichere(save);
  } catch {
    /* kein localStorage — ignorieren */
  }
}

function ladeGespeichertenRun() {
  try {
    const save = lade();
    if (save?.einstellungen?.sprache) setzeSprache(save.einstellungen.sprache); // D7
    if (save?.metaState) meta = normalisiereMeta(save.metaState);
    if (!save?.runState?.karte) return false;
    const rs = save.runState;
    // hpMax steht seit Save v6 im Save (D8: +8 je Regionstor); Fallback = Basis.
    const hpMax = rs.hpMax ?? HUETER_BASIS_HP + KLASSEN[rs.klasse].hpMod;
    run = {
      klasse: rs.klasse,
      arsenal: rs.arsenal,
      hp: rs.hp ?? hpMax,
      hpMax,
      karte: rs.karte,
      positionKnotenId: rs.positionKnotenId,
      kampfNummer: 0,
      waehrungen: rs.waehrungen,
      belohnungenOhneBlaupause: rs.belohnungenOhneBlaupause ?? 0,
      entfernteWuerfel: rs.entfernteWuerfel ?? 0,
      troestenZahl: rs.troestenZahl ?? 0,
      pflegeZahl: rs.pflegeZahl ?? rs.troestenZahl ?? 0,
      hainSegen: rs.hainSegen ?? [],
      welkGrad: rs.welkGrad ?? 0,
      reifegrad: rs.reifegrad ?? 0,
      setzlinge: rs.setzlinge ?? [],
      knospeGenutzt: rs.knospeGenutzt ?? false,
      region: rs.region ?? 1,
      maxRegion: 6,
      hinweise: rs.hinweise ?? [],
      wendungGesehen: rs.wendungGesehen ?? false,
      kampfKnoten: rs.kampfKnoten ?? null,
      verloren: false,
      // Boss-Position heißt nur DANN "Run fertig", wenn kein Kampf mehr läuft (v7).
      abgeschlossen: findeKnotenTyp(rs) === 'boss' && !rs.kampfKnoten,
    };
    return !run.abgeschlossen;
  } catch {
    return false;
  }
}

function findeKnotenTyp(rs) {
  if (!rs.positionKnotenId) return null;
  return rs.karte.reihen.flat().find((k) => k.id === rs.positionKnotenId)?.typ ?? null;
}

// --- Aktionen ----------------------------------------------------------------------

function neuerRun(klasseId = 'eichwart', reifegrad = 0) {
  // Nur den Run löschen — der Stammbaum (meta) überlebt (C1). Der nächste
  // speichereZwischenKnoten schreibt meta wieder in den frischen Save.
  try { loesche(); } catch { /* ignorieren */ }
  run = starteRun(klasseId, rng, { reifegrad, setzlinge: aktiveSetzlinge(meta) });
  kampf = null;
  modus = 'karte';
  belohnungsWahl = schmiedeWahl = marktWahl = lagerfeuerWahl = knotenKontext = null;
  letztesEreignis = uebersetze('ui.neuer_run');
  mentorZeile = mentorBeiRegionEintritt(1); // die Eiche spricht zum ersten Mal (01 §7)
  render();
}

function zurKarte() {
  run.kampfKnoten = null; // Kampf beendet — Resume-Anker löschen (v7)
  beendeTutorial();
  if (kampf?.regionGeschafft) {
    letztesEreignis = uebersetze('ui.region_geschafft', { region: kampf.regionGeschafft });
    // Regions-Eintritt: Mentor-Zeile der neuen Region — bzw. an der Schwelle
    // zu Region 6 die Wendung (01 §4.3), dort schweigt der Mentor für immer.
    mentorZeile = mentorBeiRegionEintritt(run.region);
    // Stem-Wechsel deckungsgleich mit dem Palette-Swap (08 §2.2/§3.4).
    audio.spieleRegion(run.region, welkStufe(run));
  }
  modus = wendungSteht(run) ? 'wendung' : 'karte';
  kampf = null;
  belohnungsWahl = schmiedeWahl = marktWahl = lagerfeuerWahl = knotenKontext = null;
  speichereZwischenKnoten();
  render();
}

function klickKnoten(knotenId) {
  const knoten = betreteKnoten(run, knotenId);
  if (!knoten) return;
  mentorZeile = null; // die Stimme verstummt, sobald der Weg gewählt ist
  if (['kampf', 'elite', 'boss'].includes(knoten.typ)) {
    modus = 'kampf';
    // Kampf-Seed fixieren + Stand VOR dem Kampf sichern (v7): Reload mid-Kampf
    // startet DENSELBEN Kampf von vorn — kein Verlust, kein Auswürfeln.
    const seed = (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0 || 1;
    run.kampfKnoten = { knotenId: knoten.id, seed };
    speichereZwischenKnoten();
    rng = new RNG(seed);
    kampf = starteKampf(run, rng, knoten.typ);
    beginneZug(run, kampf, rng);
    letztesEreignis = uebersetze('ui.knoten_betreten', { knoten: knotenLabel(knoten.typ), reihe: knoten.reihe });
    if (!meta.tutorialGesehen && !tutorial) tutorial = { gezeigt: new Set() };
    tutorialZeile('wurf');
  } else if (knoten.typ === 'schmiede') {
    modus = 'schmiede';
    knotenKontext = erstelleSchmiedeAngebot();
    letztesEreignis = uebersetze('ui.schmiede_gruss');
  } else if (knoten.typ === 'markt') {
    modus = 'markt';
    knotenKontext = erstelleMarktAngebot(rng, run);
    letztesEreignis = uebersetze('ui.markt_gruss');
  } else if (knoten.typ === 'event') {
    modus = 'event';
    knotenKontext = { event: zieheEvent(rng, run.region), ergebnis: null, hinweisKey: null };
    letztesEreignis = '';
  } else if (knoten.typ === 'lagerfeuer') {
    modus = 'lagerfeuer';
    knotenKontext = { genutzt: false };
    letztesEreignis = uebersetze('ui.lagerfeuer_gruss');
  }
  render();
}

// Kampf-Aktionen (unverändert zur Slice-Version, plus Karten-Rückkehr).
function klickWuerfel(id) {
  if (kampf.phase !== 'zug') return;
  if (kampf.reihe.includes(id)) nimmZurueck(run, kampf, id);
  else {
    platziere(run, kampf, id);
    tutorialZeile('legen');
  }
  render();
}

function klickReroll() {
  const { tischsturz } = rerolle(run, kampf, rng);
  letztesEreignis = uebersetze(tischsturz ? 'ui.tischsturz' : 'ui.neu_geworfen');
  if (tischsturz) mentorZeile = mentorBeiTischsturz(); // die Stimme wiegelt ab (D4)
  else tutorialZeile('uebermut');
  audio.sfx(tischsturz ? 'tischsturz' : 'reroll');
  render();
}

function klickAufloesen() {
  const pools = loeseZugAuf(run, kampf, rng);
  if (!pools) return;
  letztesEreignis = uebersetze('ui.paket_aufgeloest', { schaden: pools.schaden, rinde: pools.rinde });
  const c = pools.combos;
  if (c?.gleichklangAnzahl >= 2) letztesEreignis += ` ${uebersetze('ui.gleichklang', { mult: c.gleichklangMult, anzahl: c.gleichklangAnzahl })}`;
  if (c?.vollmond) letztesEreignis += ` 🌕 ${uebersetze('ui.vollmond', { burst: c.vollmondBurst })}`;
  if (c?.widerhallBonus > 0) letztesEreignis += ` 🔔 ${uebersetze('ui.widerhall', { bonus: c.widerhallBonus })}`;
  if (kampf.geheilt > 0) letztesEreignis += ` 💧 ${uebersetze('ui.labung', { hp: kampf.geheilt })}`;
  if (kampf.gepraegt > 0) letztesEreignis += ` 🪙 ${uebersetze('ui.praegung', { muenzen: kampf.gepraegt })}`;
  if (kampf.getroestet > 0) letztesEreignis += ` 🍃 ${uebersetze('ui.getroestet', { anzahl: kampf.getroestet })}`;
  if (kampf.aussetzer > 0) letztesEreignis += ` ${uebersetze('ui.riss_aussetzer', { anzahl: kampf.aussetzer })}`;
  if (kampf.bossGetroestet > 0 && !kampf.befriedet) {
    letztesEreignis += ` 🕊 ${uebersetze('ui.boss_getroestet', { schreck: kampf.gegner.bossSchreck })}`;
  }
  if (kampf.befriedet) {
    letztesEreignis = `🕊 ${uebersetze('ui.befriedet')}`;
  }
  if (kampf.phase === 'sieg') {
    letztesEreignis += kampf.sauberSieg ? ` ${uebersetze('ui.sauberer_sieg')}` : '';
    if (kampf.kristallisiert > 0) letztesEreignis += ` ${uebersetze('ui.kristallisiert', { anzahl: kampf.kristallisiert })}`;
    tutorialZeile('sieg');
  } else {
    tutorialZeile('aufloesen'); // Gegnerzug steht bevor — Blick auf die Absicht lenken
  }
  render();
}

function klickGegnerzug() {
  const ergebnis = fuehreGegnerzugAus(run, kampf, rng);
  if (!ergebnis) return;
  const dot = (ergebnis.faeule || 0) + (ergebnis.brand || 0);
  if (ergebnis.besiegt) {
    letztesEreignis = uebersetze('ui.status_besiegt');
  } else if (ergebnis.ausgesetzt) {
    // Bruchstelle (04 §3.2): der Riss lässt die Gegner-Aktion verpuffen.
    letztesEreignis = `⚡ ${uebersetze('ui.gegner_aussetzer')}`;
  } else {
    letztesEreignis = ergebnis.erlitten > 0
      ? uebersetze('ui.gegner_trifft', { schaden: ergebnis.erlitten })
      : uebersetze('ui.gegner_geblockt');
    if (ergebnis.aufgelegt?.length) {
      const namen = ergebnis.aufgelegt.map((typ) => uebersetze(`status.${typ}`)).join(' + ');
      letztesEreignis += ` ${uebersetze('ui.gegner_legt_auf', { status: namen })}`;
    }
    if (kampf.hohlesEchoGeheilt) {
      letztesEreignis += ` 🌑 ${uebersetze('ui.hohles_echo', { heilung: kampf.hohlesEchoGeheilt })}`;
      kampf.hohlesEchoGeheilt = 0;
    }
    if (dot > 0) letztesEreignis += ` ${uebersetze('ui.status_dot', { schaden: dot })}`;
  }
  if (kampf.phase === 'zug') beginneZug(run, kampf, rng);
  render();
}

// Belohnungs-Flow (A1/A2)
function optionLabel(option) {
  if (option.typ === 'muenzen') return uebersetze('ui.opt_muenzen', { betrag: option.betrag });
  if (option.typ === 'blaupause') return `${uebersetze('ui.blaupause')}: ${uebersetze(option.nameKey)}`;
  if (option.typ === 'segen') {
    const haken = option.hakenTextKey ? ` — ${uebersetze('ui.haken')}: ${uebersetze(option.hakenTextKey)}` : '';
    return `${uebersetze('ui.segen')}: ${uebersetze(option.textKey)}${haken}`;
  }
  return `${uebersetze('ui.gravur')}: ${uebersetze(option.nameKey)}`;
}

function waehleBelohnung(index) {
  const option = kampf.belohnung.optionen[index];
  if (option.typ === 'muenzen' || option.typ === 'segen') {
    wendeBelohnungAn(run, option); // Segen brauchen kein Ziel — run-weiter Modifikator
    kampf.belohnung.erledigt = true;
    letztesEreignis =
      option.typ === 'segen'
        ? uebersetze('ui.segen_aufgenommen', { segen: uebersetze(option.textKey) })
        : uebersetze('ui.muenzen_eingestrichen', { betrag: option.betrag });
  } else {
    belohnungsWahl = { option };
  }
  render();
}

function waehleZielWuerfel(wuerfelId) {
  const wuerfel = run.arsenal.find((w) => w.id === wuerfelId);
  if (belohnungsWahl.option.typ === 'blaupause') {
    wendeBelohnungAn(run, belohnungsWahl.option, { wuerfel });
    letztesEreignis = uebersetze('ui.angewandt_auf', { was: uebersetze(belohnungsWahl.option.nameKey), wuerfel: uebersetze(wuerfel.nameKey) });
    kampf.belohnung.erledigt = true;
    belohnungsWahl = null;
  } else {
    belohnungsWahl = { ...belohnungsWahl, wuerfelId };
  }
  render();
}

function waehleZielSeite(seitenIndex) {
  const wuerfel = run.arsenal.find((w) => w.id === belohnungsWahl.wuerfelId);
  wendeBelohnungAn(run, belohnungsWahl.option, { wuerfel, seitenIndex });
  letztesEreignis = uebersetze('ui.graviert_auf', {
    was: uebersetze(belohnungsWahl.option.nameKey),
    seite: seitenIndex + 1,
    wuerfel: uebersetze(wuerfel.nameKey),
    stufe: wuerfel.stufen[seitenIndex],
  });
  kampf.belohnung.erledigt = true;
  belohnungsWahl = null;
  render();
}

function ueberspringeBelohnung() {
  belohnungsWahl = null;
  kampf.belohnung.erledigt = true;
  letztesEreignis = uebersetze('ui.belohnung_ausgeschlagen');
  render();
}

// Schmiede
function schmiedeKauf(seitenIndex) {
  const ergebnis = kaufeGravur(run, schmiedeWahl.gravurId, schmiedeWahl.wuerfelId, seitenIndex);
  letztesEreignis = ergebnis.ok
    ? uebersetze('ui.graviert_fuer', { preis: ergebnis.preis, stufe: ergebnis.stufe })
    : uebersetze(ergebnis.grund === 'muenzen' ? 'ui.zu_wenig_muenzen' : 'ui.seite_cap');
  if (ergebnis.ok) schmiedeWahl = null;
  render();
}

// Markt
function marktKaufWuerfel(index) {
  const angebot = knotenKontext.wuerfel[index];
  const ergebnis = kaufeWuerfel(run, angebot.vorlageId, angebot.preisEicheln);
  letztesEreignis = ergebnis.ok
    ? uebersetze('ui.gekauft', { name: uebersetze(ergebnis.wuerfel.nameKey) })
    : uebersetze('ui.zu_wenig_eicheln');
  if (ergebnis.ok) knotenKontext.wuerfel.splice(index, 1);
  render();
}

function marktKaufSegen() {
  const s = knotenKontext.segen;
  const ergebnis = kaufeMarktSegen(run, s.segenId, s.preisEicheln);
  letztesEreignis = ergebnis.ok
    ? uebersetze('ui.segen_aufgenommen', { segen: uebersetze(s.textKey) })
    : uebersetze('ui.zu_wenig_eicheln');
  if (ergebnis.ok) knotenKontext.segen = null;
  render();
}

function marktZiel(wuerfelId) {
  if (marktWahl.aktion === 'blaupause') {
    const b = knotenKontext.blaupause;
    const ergebnis = kaufeMarktBlaupause(run, b.blaupauseId, b.preisEicheln, wuerfelId);
    letztesEreignis = ergebnis.ok
      ? uebersetze('ui.angewandt', { name: uebersetze(b.nameKey) })
      : uebersetze('ui.zu_wenig_eicheln');
    if (ergebnis.ok) knotenKontext.blaupause = null;
  } else if (marktWahl.aktion === 'entfernen') {
    const ergebnis = entferneWuerfel(run, wuerfelId);
    letztesEreignis = ergebnis.ok
      ? uebersetze('ui.wuerfel_entfernt', { preis: ergebnis.preis })
      : uebersetze(ergebnis.grund === 'muenzen' ? 'ui.zu_wenig_muenzen' : 'ui.arsenal_minimum');
  } else if (marktWahl.aktion === 'troesten') {
    const ergebnis = troesteDienst(run, wuerfelId);
    letztesEreignis = uebersetze(ergebnis.ok ? 'ui.plus_gemuet' : 'ui.zu_wenig_tau');
    if (ergebnis.ok) audio.troestenRueckkehr(); // Zier-Stem kehrt kurz zurück (08 §2.2)
  }
  marktWahl = null;
  render();
}

// Event
function eventOption(index) {
  const option = knotenKontext.event.optionen[index];
  const wirkungen = waehleEventOption(run, knotenKontext.event, index, rng);
  knotenKontext.ergebnis = wirkungen.length ? wirkungen.join(' · ') : uebersetze('ui.du_gehst_weiter');
  // Zweifel-Hinweis (07 §5.3): der stille Text, der Unbehagen sät, als eigener Absatz.
  knotenKontext.hinweisKey = option.effekt.hinweis ? `hinweis.${option.effekt.hinweis}` : null;
  if (option.effekt.troesten) audio.troestenRueckkehr();
  render();
}

// Offene Event-Belohnung (E6): gefundene Blaupause auf den gewählten Würfel.
function eventBelohnungZiel(wuerfelId) {
  const option = run.offeneBelohnungen?.[0];
  if (!option) return;
  const wuerfel = run.arsenal.find((w) => w.id === wuerfelId);
  wendeBelohnungAn(run, option, { wuerfel });
  run.offeneBelohnungen = run.offeneBelohnungen.slice(1);
  letztesEreignis = uebersetze('ui.angewandt_auf', { was: uebersetze(option.nameKey), wuerfel: uebersetze(wuerfel.nameKey) });
  render();
}

// Lagerfeuer
function lagerfeuerAktion(wahl, wuerfelId = null) {
  if ((wahl === 'troesten' || wahl === 'vollenden') && !wuerfelId) {
    lagerfeuerWahl = wahl;
    render();
    return;
  }
  const ergebnis = rasteLagerfeuer(run, wahl, wuerfelId);
  knotenKontext.genutzt = !ergebnis.rastFrei; // Frühjahrs-Knospe schenkt die Rast (C5)
  lagerfeuerWahl = null;
  letztesEreignis = uebersetze('ui.rast', { text: ergebnis.text });
  if (wahl === 'troesten' && ergebnis.ok) audio.troestenRueckkehr();
  render();
}

// --- Rendering (Platzhalter-Konvention 08 §4.0) --------------------------------------

function pips(anzahl, voll, label) {
  const teile = [];
  for (let i = 0; i < anzahl; i += 1) teile.push(i < voll ? '●' : '○');
  return `<span class="pips" title="${label}">${teile.join('')}</span>`;
}

function statuszeile() {
  const segen = (run.hainSegen ?? [])
    .map((id) => `<span class="ph ph--segen" title="${uebersetze(`segen.${id}.text`)}">🌿 ${uebersetze(`segen.${id}.text`).split(':')[0]}</span>`)
    .join(' ');
  return `
    <section class="status">
      <span>${uebersetze('ui.region', { region: run.region ?? 1, max: run.maxRegion ?? 6 })}</span>
      <span>❤ ${run.hp}/${run.hpMax}</span>
      <span>🪙 ${run.waehrungen.muenzen} · 🌰 ${run.waehrungen.eicheln} · 💧 ${run.waehrungen.tau}</span>
      <span title="${uebersetze('ui.schreck_tooltip')}">${uebersetze('ui.schreck_summe', { summe: arsenalSchreckSumme(run) })}</span>
      <span title="${uebersetze('ui.troesten_tooltip')}">🕊 ${run.troestenZahl ?? 0}</span>
      ${segen ? `<span class="segen-leiste">${segen}</span>` : ''}
      <button class="sprache" data-aktion="sprache" title="Sprache wechseln / switch language">${aktiveSprache().toUpperCase()}</button>
    </section>`;
}

function arsenalPicker(datenAttribut, filter = () => true) {
  return `
    <div class="picker">
      ${run.arsenal.filter(filter).map((w) => `
        <button class="ph ph--seite" data-${datenAttribut}="${w.id}">
          <span class="label">${uebersetze(w.nameKey)}</span>
          <span class="stufe">${w.gemuet !== 0 ? uebersetze('ui.gemuet_wert', { wert: w.gemuet }) : ''} ${w.atem === 0 ? uebersetze('ui.null_atem') : ''}</span>
        </button>`).join('')}
    </div>`;
}

function renderKarte() {
  const waehlbar = new Set(verfuegbareKnoten(run).map((k) => k.id));
  const reihen = [...run.karte.reihen].reverse(); // Boss oben, Start unten
  return `
    <section class="ph ph--karte">
      ${reihen.map((reihe) => `
        <div class="karten-reihe">
          ${reihe.map((k) => `
            <button class="ph ph--knoten ${waehlbar.has(k.id) ? 'waehlbar' : ''} ${run.positionKnotenId === k.id ? 'aktuell' : ''}"
                    data-knoten="${k.id}" ${waehlbar.has(k.id) ? '' : 'disabled'}>
              ${knotenLabel(k.typ)}
            </button>`).join('')}
        </div>`).join('')}
    </section>`;
}

function wuerfelBox(id) {
  const w = run.arsenal.find((x) => x.id === id);
  const { wert } = kampf.wuerfe[id];
  const s = schreck(w.gemuet);
  const gesperrt = gesperrteSeitenAnzahl(s);
  const platziert = kampf.reihe.includes(id);
  const position = platziert ? kampf.reihe.indexOf(id) + 1 : null;
  const stimmung = s > 0 ? 'aengstlich' : w.gemuet > 0 ? 'froh' : 'ruhig';
  return `
    <button class="ph ph--wuerfel typ-${w.typ} stimmung-${stimmung} ${platziert ? 'platziert' : ''}"
            data-wuerfel="${id}" ${kampf.phase !== 'zug' ? 'disabled' : ''}>
      <span class="wert">${wert}</span>
      <span class="label">${w.blaupause ? uebersetze(w.blaupause.nameKey) : uebersetze(w.nameKey)}</span>
      ${gesperrt > 0 ? `<span class="gesperrt">🔒${gesperrt}</span>` : ''}
      ${position ? `<span class="position">${position}.</span>` : ''}
    </button>`;
}

function belohnungsPanel() {
  const b = kampf.belohnung;
  if (belohnungsWahl?.wuerfelId) {
    const wuerfel = run.arsenal.find((w) => w.id === belohnungsWahl.wuerfelId);
    return `
      <section class="ph ph--belohnung">
        <strong>${uebersetze(belohnungsWahl.option.nameKey)} — ${uebersetze('ui.seite_waehlen')} (${uebersetze(wuerfel.nameKey)})</strong>
        <div class="picker">
          ${wuerfel.seiten.map((s, i) => `
            <button class="ph ph--seite" data-ziel-seite="${i}" ${s.fluchId ? `disabled title="${uebersetze('ui.fluch_seite_gesperrt')}"` : ''}>
              <span class="wert">${s.fluchId ? '💀' : s.wert}</span>
              ${wuerfel.stufen[i] > 0 ? `<span class="stufe">St.${wuerfel.stufen[i]}</span>` : ''}
            </button>`).join('')}
        </div>
      </section>`;
  }
  if (belohnungsWahl) {
    return `
      <section class="ph ph--belohnung">
        <strong>${optionLabel(belohnungsWahl.option)} — ${uebersetze('ui.wuerfel_waehlen')}</strong>
        ${arsenalPicker('ziel-wuerfel')}
      </section>`;
  }
  return `
    <section class="ph ph--belohnung">
      <strong>${uebersetze('ui.sieg_einkommen', { muenzen: b.einkommen.muenzen, eicheln: b.einkommen.eicheln })}</strong>
      <div class="picker">
        ${b.optionen.map((o, i) => `<button data-opt="${i}">${optionLabel(o)}</button>`).join('')}
        <button data-aktion="ueberspringen">${uebersetze('ui.ueberspringen')}</button>
      </div>
    </section>`;
}

const STATUS_ICON = {
  faeule: '☣', brand: '🔥', morsch: '💢', welk: '🥀', kraft: '💪', riss: '⚡',
  wetzung: '🔪', scharte: '🩹', freilauf: '🎲', klemme: '🔒',
};

// Lesbarer Effekt-Name: Status-Typen haben status.*, die Nicht-Status-Effekte
// (schaden/rinde/echo/…) eigene effekt.*-Keys. Fallback = Typ selbst, nie ein
// roher „status.foo"-Key in der UI (E7-Fix des E6-Migrationsfehlers).
const STATUS_TYPEN = new Set(['faeule', 'brand', 'morsch', 'welk', 'kraft', 'riss', 'wetzung', 'scharte', 'freilauf', 'klemme']);
function effektName(typ) {
  return uebersetze(STATUS_TYPEN.has(typ) ? `status.${typ}` : `effekt.${typ}`);
}

// Kurz-Label eines Seiten-Effekts für die Wurf-Leiste; die E6-Typen brauchen
// eigene Formen (Doppelschlag = Wertepaar, Gegner-Riss/Flüche = benannt).
function effektKurz(e) {
  if (e.typ === 'schaden_mult') return `×${e.wert}`;
  if (e.typ === 'schaden_doppel') return `⚔${e.wert.join('+')}`;
  if (e.typ === 'gegner_riss') return `⚡${uebersetze('ui.eff_gegner_riss')}`;
  if (e.typ === 'fluch_faeule') return `💀${uebersetze('ui.eff_fluch_selbst', { icon: '☣', wert: e.wert })}`;
  if (e.typ === 'fluch_scharte') return `💀${uebersetze('ui.eff_fluch_selbst', { icon: '🩹', wert: e.wert })}`;
  if (e.typ === 'fluch_stumpf') return `💀${uebersetze('ui.eff_fluch_stumpf')}`;
  return `${STATUS_ICON[e.typ] ?? ''}${effektName(e.typ)} ${e.wert}`;
}

function statusBadges(status) {
  return Object.entries(STATUS_ICON)
    .filter(([typ]) => status[typ] > 0)
    .map(([typ, icon]) => `<span class="badge" title="${uebersetze(`status.${typ}`)}">${icon}${status[typ]}</span>`)
    .join(' ');
}

// --- Kampf-Arena (Artefakt 12: StS-Schema) --------------------------------------
// Monster rechts (Absicht als Omen, HP, Status), Hüter + Würfel-Armee links
// (Gemüt + Verzauberung; Nummer koppelt an die Wurf-Leiste), Reihe am Boden,
// Wurf-Leiste unten (Typ · Wert · Seiten-Effekt), Aktionen rechts. Keine
// Synergie-Hilfen — Kombis erkennt der Spieler selbst (§8.2).

function absichtOmen(g) {
  if (g.absicht.typ === 'angriff') {
    const treffer = g.absicht.treffer > 1 ? ` ×${g.absicht.treffer}` : '';
    return `⚔ <b>${g.absicht.wert}</b>${treffer}`;
  }
  if (g.absicht.typ === 'block') return '🛡';
  return '☣'; // sieche: legt Status statt anzugreifen
}

function armeeEinheit(id, index) {
  const w = run.arsenal.find((x) => x.id === id);
  const s = schreck(w.gemuet);
  const stimmung = s > 0 ? 'aengstlich' : w.gemuet > 0 ? 'froh' : 'ruhig';
  const platziert = kampf.reihe.includes(id);
  const sprite = wuerfelSprite(w.typ);
  const graviert = w.stufen.filter((st) => st > 0).length;
  const zauber = w.blaupause ? '◆' : graviert > 0 ? `✦${graviert > 1 ? graviert : ''}` : '';
  const name = w.blaupause ? uebersetze(w.blaupause.nameKey) : uebersetze(w.nameKey);
  return `
    <button class="a-einheit a-pos-${index + 1} ph--wuerfel stimmung-${stimmung} ${platziert ? 'platziert' : ''}"
            data-wuerfel="${id}" ${kampf.phase !== 'zug' ? 'disabled' : ''}
            title="${name} · ${uebersetze('ui.gemuet_wert', { wert: w.gemuet })}${s > 0 ? ` · ${uebersetze('ui.seiten_gesperrt', { anzahl: gesperrteSeitenAnzahl(s) })}` : ''}">
      <span class="nr">${index + 1}</span>
      ${zauber ? `<span class="zauber" title="${uebersetze(w.blaupause ? 'ui.blaupause' : 'ui.gravur')}">${zauber}</span>` : ''}
      ${sprite ? `<img src="${sprite}" alt="${name}">` : `<span class="ph w-platzhalter">${name}</span>`}
      <span class="gemuet">${uebersetze(`ui.stimmung.${stimmung}`)}${s > 0 ? ` 🔒${gesperrteSeitenAnzahl(s)}` : ''}</span>
    </button>`;
}

function wurfKachel(id, index) {
  const w = run.arsenal.find((x) => x.id === id);
  const { wert, seitenIndex } = kampf.wuerfe[id];
  const seite = w.seiten[seitenIndex];
  const platziert = kampf.reihe.includes(id);
  const name = w.blaupause ? uebersetze(w.blaupause.nameKey) : uebersetze(w.nameKey);
  const hauptTyp = seite.effekt[0]?.typ ?? w.typ;
  const ico = seitenIcon(hauptTyp);
  const effekte = seite.effekt.map(effektKurz).join(' · ') || uebersetze('ui.leer');
  return `
    <button class="a-kachel ${platziert ? 'platziert' : ''}" data-wuerfel="${id}"
            ${kampf.phase !== 'zug' ? 'disabled' : ''} title="${name}: ${effekte}">
      <span class="kopf">
        <span class="knr">${index + 1}</span>
        ${ico ? `<img class="kico" src="${ico}" alt="">` : ''}
        <span class="kname">${name}</span>
        <span class="kwert">${wert}</span>
      </span>
      <span class="keff">${platziert ? `${uebersetze('ui.gelegt', { position: kampf.reihe.indexOf(id) + 1 })} · ` : ''}${effekte}</span>
    </button>`;
}

// Atem als diegetische Pips (D6: atem.pip/pip_leer, 08 §4.5) — voll = verfügbar,
// leer = verbraucht; Fallback auf den CSS-Orb, solange kein Sprite geladen ist.
function atemAnzeige() {
  const voll = uiSprite('atem.pip');
  const leer = uiSprite('atem.pip_leer');
  if (!voll || !leer) return `<span class="a-orb">${kampf.atem}</span>`;
  const slots = Math.max(3, kampf.atem);
  const pips = Array.from({ length: slots }, (_, i) =>
    `<img src="${i < kampf.atem ? voll : leer}" alt="">`).join('');
  return `<span class="a-pips">${pips}</span>`;
}

function renderKampf() {
  const belohnungOffen = kampf.phase === 'sieg' && kampf.belohnung && !kampf.belohnung.erledigt;
  const g = kampf.gegner;
  const mSprite = gegnerSprite(g.vorlageId);
  const uebermut = Array.from({ length: KIPP_PUNKT }, (_, i) =>
    `<i class="${i < kampf.uebermut ? 'an' : ''} ${i === KIPP_PUNKT - 1 ? 'kipp' : ''}"></i>`).join('');
  const reihe = kampf.reihe.map((id) => `<span class="a-slot belegt">${kampf.wuerfe[id].wert}</span>`).join('');
  const freieSlots = Math.max(0, kampf.atem) ;
  // Arena-Ebenen je Region (Artefakt 12): echtes Bild wenn geliefert, sonst der
  // CSS-Verlauf (spätere Regionen haben noch keine Kulisse/Boden).
  const region = run.region ?? 1;
  const kulisse = szeneSprite(`bg.kulisse.r${region}`);
  const boden = szeneSprite(`boden.r${region}`);
  const hueterImg = figurSprite('hueter_kampf');
  return `
    <div class="arena">
      <div class="a-kulisse${kulisse ? ' hat-bild' : ''}"${kulisse ? ` style="background-image:url(${kulisse})"` : ''}></div>
      <div class="a-boden${boden ? ' hat-bild' : ''}"${boden ? ` style="background-image:url(${boden})"` : ''}></div>
      <div class="a-horizont"></div>

      <span class="a-drehhinweis">📱↻ ${uebersetze('ui.querformat')}</span>
      <div class="a-top">
        <span class="portraet"></span>
        <span>${uebersetze(`klasse.${run.klasse}.name`)}</span>
        <div class="balken"><div class="balken-fuellung" style="width:${(run.hp / run.hpMax) * 100}%"></div></div>
        <span>${run.hp}/${run.hpMax}</span>
        <span class="a-uebermut" title="${uebersetze('ui.uebermut_tooltip', { kipp: KIPP_PUNKT })}">${uebermut}</span>
        <span class="mitte">${uebersetze('ui.region', { region: run.region ?? 1, max: run.maxRegion ?? 6 })} · ${uebersetze('ui.rinde_wert', { wert: kampf.block })}</span>
        <span>🪙${run.waehrungen.muenzen} 🌰${run.waehrungen.eicheln} 💧${run.waehrungen.tau}</span>
        <span title="${uebersetze('ui.segen')}">${(run.hainSegen ?? []).map(() => '🌿').join('') || ''}</span>
        <span title="${uebersetze('ui.stapel_tooltip')}">▮${kampf.zieh?.ziehstapel?.length ?? 0}·▮${kampf.zieh?.ablage?.length ?? 0}</span>
      </div>

      <div class="a-monster ph--gegner">
        <span class="a-absicht">${absichtOmen(g)}</span>
        ${mSprite
          ? `<img src="${mSprite}" alt="${uebersetze(g.nameKey)}">`
          : `<span class="ph m-platzhalter">${uebersetze(g.nameKey)}</span>`}
        <div class="a-schatten"></div>
        <strong style="font:700 11px/1.6 monospace; text-shadow:0 1px 2px #000; color:#f2e4cc">${uebersetze(g.nameKey)}</strong>
        <div class="a-hp"><i style="transform:scaleX(${g.hp / g.hpMax})"></i><b>${g.hp} / ${g.hpMax}</b></div>
        ${statusBadges(g.status) ? `<div class="badges">${statusBadges(g.status)}</div>` : ''}
      </div>

      <div class="a-hueter">${hueterImg ? `<img src="${hueterImg}" alt="${uebersetze('ui.hueter')}">` : '<div class="mantel"></div>'}<small>${uebersetze('ui.hueter')}</small></div>
      ${kampf.hand.map((id, i) => armeeEinheit(id, i)).join('')}

      <div class="a-reihe">
        ${reihe}${freieSlots > 0 ? `<span class="a-slot">·</span>` : ''}
        <span class="a-pfeil">⟶</span>
      </div>
      ${statusBadges(kampf.spielerStatus) ? `<div class="a-status-badges badges">${statusBadges(kampf.spielerStatus)}</div>` : ''}

      <div class="a-wurf">
        <div class="a-atem">${atemAnzeige()}<span>${uebersetze('ui.atem_label')}</span></div>
        ${kampf.hand.map((id, i) => wurfKachel(id, i)).join('')}
      </div>

      <div class="a-akt${uiSprite('knopf.wurf') ? ' plakette' : ''}">
        ${kampf.phase === 'zug' ? `
          <button data-aktion="reroll" class="warn k-reroll">${uebersetze('ui.neu_werfen')}<br><small>${uebersetze(kampf.rerollsDiesenZug === 0 ? 'ui.gratis' : 'ui.plus_uebermut')}</small></button>
          <button data-aktion="aufloesen" class="k-wurf" ${kampf.reihe.length === 0 ? 'disabled' : ''}>${uebersetze('ui.aufloesen', { anzahl: kampf.reihe.length })}</button>
        ` : ''}
        ${kampf.phase === 'gegnerzug' ? `<button data-aktion="gegnerzug" class="k-wurf">${uebersetze('ui.gegnerzug')}</button>` : ''}
        ${kampf.phase === 'sieg' && !belohnungOffen ? `<button data-aktion="weiter" class="k-wurf">${uebersetze('ui.weiter')}</button>` : ''}
        ${kampf.phase === 'niederlage' ? `<button data-aktion="weiter" class="k-wurf">${uebersetze('ui.weiter')}</button>` : ''}
      </div>

      ${belohnungOffen ? `<div class="a-belohnung">${belohnungsPanel()}</div>` : ''}
      <div class="a-vignette"></div>
    </div>`;
}

function renderSchmiede() {
  if (schmiedeWahl?.wuerfelId) {
    const wuerfel = run.arsenal.find((w) => w.id === schmiedeWahl.wuerfelId);
    return `
      <section class="ph ph--belohnung">
        <strong>${uebersetze('ui.seite_waehlen')} (${uebersetze(wuerfel.nameKey)})</strong>
        <div class="picker">
          ${wuerfel.seiten.map((s, i) => {
            const angebot = schmiedePreis(wuerfel, schmiedeWahl.gravurId, i, run);
            return `
              <button class="ph ph--seite" data-schmiede-seite="${i}" ${angebot ? '' : 'disabled'}>
                <span class="wert">${s.fluchId ? '💀' : s.wert}</span>
                <span class="stufe">${angebot ? `${angebot.preis} 🪙${angebot.typWechsel ? ` ${uebersetze('ui.wechsel')}` : ''}` : uebersetze(s.fluchId ? 'ui.fluch_kurz' : 'ui.cap')}</span>
              </button>`;
          }).join('')}
        </div>
      </section>`;
  }
  if (schmiedeWahl) {
    return `
      <section class="ph ph--belohnung">
        <strong>${uebersetze('ui.wuerfel_waehlen')}</strong>
        ${arsenalPicker('schmiede-wuerfel')}
      </section>`;
  }
  return `
    <section class="ph ph--belohnung">
      <strong>${uebersetze('ui.schmiede_titel')}</strong>
      <div class="picker">
        ${knotenKontext.map((g) => `<button data-schmiede-gravur="${g.gravurId}">${uebersetze(g.nameKey)}</button>`).join('')}
      </div>
    </section>`;
}

function renderMarkt() {
  if (marktWahl) {
    const titel = uebersetze(`ui.markt_aktion.${marktWahl.aktion}`);
    return `<section class="ph ph--belohnung"><strong>${titel} — ${uebersetze('ui.wuerfel_waehlen')}</strong>${arsenalPicker('markt-ziel')}</section>`;
  }
  const k = knotenKontext;
  return `
    <section class="ph ph--belohnung">
      <strong>${uebersetze('ui.knoten.markt')}</strong>
      <div class="picker">
        ${k.wuerfel.map((a, i) => `<button data-markt-wuerfel="${i}">${uebersetze(`wuerfel.${a.vorlageId}.name`)} (${a.preisEicheln} 🌰)</button>`).join('')}
        ${k.blaupause ? `<button data-markt-aktion="blaupause">${uebersetze('ui.blaupause')} ${uebersetze(k.blaupause.nameKey)} (${k.blaupause.preisEicheln} 🌰)</button>` : ''}
        ${k.segen ? `<button data-markt-aktion="segen">${uebersetze('ui.segen')} ${uebersetze(k.segen.textKey).split(':')[0]} (${k.segen.preisEicheln} 🌰)</button>` : ''}
        <button data-markt-aktion="entfernen">${uebersetze('ui.markt_aktion.entfernen')} (${entfernenPreis(run)} 🪙)</button>
        <button data-markt-aktion="troesten">${uebersetze('ui.troesten_dienst')} (${TROESTEN_DIENST_TAU} 💧)</button>
      </div>
    </section>`;
}

function renderEvent() {
  const { event, ergebnis, hinweisKey } = knotenKontext;
  // Offene Event-Belohnung (E6, Fluch-Events): gefundene Blaupause braucht
  // einen Ziel-Würfel, BEVOR es weitergeht (transient — Save läuft erst am
  // Knoten-Ende, ein Reload spielt das Event neu).
  const offen = run.offeneBelohnungen?.[0];
  return `
    <section class="ph ph--belohnung">
      <strong>${uebersetze(event.titelKey)}</strong>
      <p>${uebersetze(event.textKey)}</p>
      ${ergebnis
        ? `<p><em>${ergebnis}</em></p>${hinweisKey ? `<p class="ph ph--hinweis">${uebersetze(hinweisKey)}</p>` : ''}`
        : `<div class="picker">
            ${event.optionen
              .map((o, i) => `<button data-event-opt="${i}" ${eventOptionMoeglich(run, o) ? '' : 'disabled'}>${uebersetze(o.textKey)}</button>`)
              .join('')}
          </div>`}
      ${offen ? `
        <p><strong>${uebersetze(offen.nameKey)}</strong> — ${uebersetze('ui.blaupause_ziel_frage')}</p>
        <div class="picker">
          ${run.arsenal.map((w) => `<button data-event-belohnung="${w.id}">${w.blaupause ? `◆ ${uebersetze(w.blaupause.nameKey)}` : uebersetze(w.nameKey)}</button>`).join('')}
        </div>` : ''}
    </section>`;
}

// Die Wendung (01 §4.3, D4): einmalige Szene an der Schwelle zu Region 6.
function renderWendung() {
  return `
    <section class="ph ph--wendung">
      <strong>${uebersetze('ui.wendung_titel')}</strong>
      ${wendungSzene(run).map((key) => `<p>${uebersetze(key)}</p>`).join('')}
      <button data-aktion="wendung-weiter">${uebersetze('ui.weitergehen')}</button>
    </section>`;
}

function renderLagerfeuer() {
  if (lagerfeuerWahl) {
    return `<section class="ph ph--belohnung"><strong>${uebersetze(`ui.lagerfeuer.${lagerfeuerWahl}`)} — ${uebersetze('ui.wuerfel_waehlen')}</strong>${arsenalPicker('lagerfeuer-ziel')}</section>`;
  }
  if (knotenKontext.genutzt) {
    return `<section class="ph ph--belohnung"><strong>${uebersetze('ui.feuer_genutzt')}</strong></section>`;
  }
  return `
    <section class="ph ph--belohnung">
      <strong>${uebersetze('ui.lagerfeuer_titel')}</strong>
      <div class="picker">
        <button data-lagerfeuer="heilen">${uebersetze('ui.lagerfeuer_heilen')}</button>
        <button data-lagerfeuer="troesten">${uebersetze('ui.lagerfeuer_troesten')}</button>
        <button data-lagerfeuer="vollenden">${uebersetze('ui.lagerfeuer_vollenden')}</button>
      </div>
    </section>`;
}

// Klassen-Wahl vor neuem Run (C2/C3): nur freigeschaltete Klassen wählbar.
function renderKlassenWahl() {
  const knoepfe = meta.freigeschalteteKlassen
    .map((id) => `<button data-klasse="${id}">${uebersetze(KLASSEN[id].nameKey)} (${HUETER_BASIS_HP + KLASSEN[id].hpMod} ❤)</button>`)
    .join(' ');
  const stufen = (meta.maxReifegrad ?? 0) > 0
    ? `<p>${uebersetze('ui.reifegrad_label')}: ${Array.from({ length: (meta.maxReifegrad ?? 0) + 1 }, (_, i) =>
        `<button data-reifegrad="${i}" ${i === reifegradWahl ? 'disabled' : ''}>${i}</button>`).join(' ')}</p>`
    : '';
  return `<section class="ph ph--klassenwahl"><strong>${uebersetze('ui.hueter_waehlen')}</strong>${stufen}<p>${knoepfe}</p></section>`;
}

// Heimat-Hain-Panel (C5): Setzlinge pflanzen mit Samen (Enden-Währung).
function renderHeimatHain() {
  const zeilen = Object.values(SETZLINGE).map((k) => {
    if (meta.heimatHain.includes(k.id)) return `<p>🌳 ${uebersetze(k.textKey)}</p>`;
    const pruefung = pruefeSetzlingKauf(meta, k.id);
    return `<p><button data-setzling="${k.id}" ${pruefung.ok ? '' : 'disabled'}>
      ${uebersetze(k.textKey)} (${k.kosten.samen} 🌱)</button></p>`;
  });
  return `<section class="ph ph--heimathain"><strong>${uebersetze('ui.heimathain_titel')} (🌱 ${meta.samen})</strong>${zeilen.join('')}</section>`;
}

function klickSetzling(setzlingId) {
  const ergebnis = pflanzeSetzling(meta, setzlingId);
  letztesEreignis = ergebnis.ok
    ? uebersetze('ui.gepflanzt', { name: uebersetze(ergebnis.setzling.textKey) })
    : uebersetze('ui.nicht_pflanzbar');
  speichereNurMeta();
  render();
}

// Stammbaum-Panel (C1): kaufbare Meta-Knoten am Run-Ende (09 §2.9).
function renderStammbaum() {
  const zeilen = Object.values(STAMMBAUM_KNOTEN).map((k) => {
    const pruefung = pruefeStammbaumKauf(meta, k.id, { reifegrad: meta.maxReifegrad ?? 0 });
    if (meta.stammbaum.includes(k.id)) {
      return `<p>✅ ${uebersetze(k.textKey)}</p>`;
    }
    const hinweis = pruefung.grund === 'bedingung' ? ` — ${uebersetze(k.bedingungTextKey)}` : '';
    return `<p><button data-stammbaum="${k.id}" ${pruefung.ok ? '' : 'disabled'}>
      ${uebersetze(k.textKey)} (${k.kosten.jahresringe} 🪵)</button>${hinweis}</p>`;
  });
  return `<section class="ph ph--stammbaum"><strong>${uebersetze('ui.stammbaum_titel')}</strong>${zeilen.join('')}</section>`;
}

function klickStammbaum(knotenId) {
  const ergebnis = kaufeStammbaumKnoten(meta, knotenId, { reifegrad: meta.maxReifegrad ?? 0 });
  letztesEreignis = ergebnis.ok
    ? uebersetze('ui.gekauft_meta', { name: uebersetze(ergebnis.knoten.textKey) })
    : uebersetze('ui.nicht_kaufbar');
  speichereNurMeta();
  render();
}

function render() {
  wendeWelkStufeAn(); // Entsättigung folgt run.welkGrad (D5)
  hain?.classList.toggle('arena-modus', modus === 'kampf'); // Arena braucht Breite (Artefakt 12)
  const belohnungOffen = kampf?.phase === 'sieg' && kampf.belohnung && !kampf.belohnung.erledigt;
  if ((run.verloren || run.abgeschlossen) && !belohnungOffen && modus !== 'kampf') {
    // Enden-Klassifikation (01 §5, C6): nur bei Sieg — Niederlage hat kein Ende.
    // bossBefriedet ist bis zum Endboss (D3) ein Platzhalter (default true).
    const ende = run.abgeschlossen ? bestimmeEnde(run) : null;
    const titel = ende ? uebersetze(ende.titelKey) : uebersetze('ui.hueter_faellt');
    if (!run.jahresringeVergebenFertig) {
      beendeTutorial(); // auch bei Niederlage: der geführte Kampf war gesehen
      run.jahresringeVergeben = verdieneJahresringe(meta, { sieg: run.abgeschlossen, kaempfe: run.kampfNummer, reifegrad: run.reifegrad ?? 0 });
      run.jahresringeVergebenFertig = true;
      if (ende) {
        merkeEnde(meta, ende.id); // speist u. a. die Rodbauer-Bedingung
        run.samenVergeben = verdieneSamen(meta, ende.id); // Heimat-Hain (C5)
      }
      speichereNurMeta(); // Meta sofort sichern; toter Run wandert NICHT in den Save
    }
    wurzel.innerHTML = `
      <div class="ph ph--ende">
        <h2>${titel}</h2>
        ${ende ? endeSzenen(ende.id).map((key) => `<p class="ph ph--ende-text">${uebersetze(key)}</p>`).join('') : ''}
        <p>${uebersetze('ui.ende_statistik', { schreck: endSchreck(run), troesten: run.troestenZahl })} · 🪙 ${run.waehrungen.muenzen}</p>
        <p>🪵 ${uebersetze('ui.jahresringe_vergeben', { neu: run.jahresringeVergeben || 0, gesamt: meta.jahresringe })}${run.samenVergeben ? ` · 🌱 ${uebersetze('ui.samen_vergeben', { neu: run.samenVergeben, gesamt: meta.samen })}` : ''}</p>
        ${renderStammbaum()}
        ${renderHeimatHain()}
        ${klassenWahl ? renderKlassenWahl() : `<button data-aktion="neu">${uebersetze('ui.neuer_run_knopf')}</button>`}
      </div>`;
    verdrahte();
    return;
  }

  let inhalt = '';
  if (modus === 'kampf') inhalt = renderKampf();
  else if (modus === 'schmiede') inhalt = statuszeile() + renderSchmiede();
  else if (modus === 'markt') inhalt = statuszeile() + renderMarkt();
  else if (modus === 'event') inhalt = statuszeile() + renderEvent();
  else if (modus === 'lagerfeuer') inhalt = statuszeile() + renderLagerfeuer();
  else if (modus === 'wendung') inhalt = statuszeile() + renderWendung();
  else inhalt = statuszeile() + renderKarte();

  const verlassenSichtbar = ['schmiede', 'markt', 'lagerfeuer'].includes(modus)
    || (modus === 'event' && knotenKontext?.ergebnis && !run.offeneBelohnungen?.length);
  wurzel.innerHTML = `
    ${inhalt}
    ${verlassenSichtbar ? `<section class="aktionen"><button data-aktion="verlassen">${uebersetze('ui.weiterziehen')}</button></section>` : ''}
    ${mentorZeile && modus !== 'wendung' ? `<section class="ph ph--mentor"><em>${uebersetze(mentorZeile)}</em></section>` : ''}
    <section class="ph ph--log">${letztesEreignis}</section>
  `;
  verdrahte();
}

function klickWeiter() {
  if (run.abgeschlossen || run.verloren) {
    modus = 'karte';
    kampf = null;
    render();
  } else {
    zurKarte();
  }
}

function verdrahte() {
  const binde = (selektor, handler) => {
    wurzel.querySelectorAll(selektor).forEach((el) => el.addEventListener('click', () => handler(el)));
  };
  binde('[data-knoten]', (el) => klickKnoten(el.dataset.knoten));
  binde('[data-wuerfel]', (el) => klickWuerfel(el.dataset.wuerfel));
  binde('[data-opt]', (el) => waehleBelohnung(Number(el.dataset.opt)));
  binde('[data-ziel-wuerfel]', (el) => waehleZielWuerfel(el.dataset.zielWuerfel));
  binde('[data-ziel-seite]', (el) => waehleZielSeite(Number(el.dataset.zielSeite)));
  binde('[data-schmiede-gravur]', (el) => { schmiedeWahl = { gravurId: el.dataset.schmiedeGravur }; render(); });
  binde('[data-schmiede-wuerfel]', (el) => { schmiedeWahl = { ...schmiedeWahl, wuerfelId: el.dataset.schmiedeWuerfel }; render(); });
  binde('[data-schmiede-seite]', (el) => schmiedeKauf(Number(el.dataset.schmiedeSeite)));
  binde('[data-markt-wuerfel]', (el) => marktKaufWuerfel(Number(el.dataset.marktWuerfel)));
  binde('[data-markt-aktion]', (el) => {
    if (el.dataset.marktAktion === 'segen') return marktKaufSegen();
    marktWahl = { aktion: el.dataset.marktAktion };
    render();
  });
  binde('[data-markt-ziel]', (el) => marktZiel(el.dataset.marktZiel));
  binde('[data-event-opt]', (el) => eventOption(Number(el.dataset.eventOpt)));
  binde('[data-event-belohnung]', (el) => eventBelohnungZiel(el.dataset.eventBelohnung));
  binde('[data-lagerfeuer]', (el) => lagerfeuerAktion(el.dataset.lagerfeuer));
  binde('[data-lagerfeuer-ziel]', (el) => lagerfeuerAktion(lagerfeuerWahl, el.dataset.lagerfeuerZiel));
  binde('[data-stammbaum]', (el) => klickStammbaum(el.dataset.stammbaum));
  binde('[data-setzling]', (el) => klickSetzling(el.dataset.setzling));
  binde('[data-klasse]', (el) => { klassenWahl = false; neuerRun(el.dataset.klasse, reifegradWahl); });
  binde('[data-reifegrad]', (el) => { reifegradWahl = Number(el.dataset.reifegrad); render(); });
  const aktionen = {
    reroll: klickReroll,
    aufloesen: klickAufloesen,
    gegnerzug: klickGegnerzug,
    weiter: klickWeiter,
    ueberspringen: ueberspringeBelohnung,
    verlassen: zurKarte,
    'wendung-weiter': () => {
      run.wendungGesehen = true; // einmalig (01 §4.3) — ab hier schweigt die Stimme
      modus = 'karte';
      speichereZwischenKnoten();
      render();
    },
    sprache: () => {
      setzeSprache(aktiveSprache() === 'de' ? 'en' : 'de'); // D7-Toggle
      if (modus !== 'kampf') speichereZwischenKnoten(); // Save nur zwischen Knoten (09 §3.1)
      render();
    },
    neu: () => {
      if ((meta.freigeschalteteKlassen.length > 1 || (meta.maxReifegrad ?? 0) > 0) && !klassenWahl) {
        klassenWahl = true;
        render();
      } else {
        neuerRun();
      }
    },
  };
  binde('[data-aktion]', (el) => aktionen[el.dataset.aktion]());
}

// --- Start: gespeicherten Run fortsetzen oder neu beginnen ---------------------------

if (ladeGespeichertenRun()) {
  if (run.kampfKnoten && run.positionKnotenId === run.kampfKnoten.knotenId) {
    // Unterbrochener Kampf (v7): DENSELBEN Kampf mit demselben Seed von vorn
    // starten — der Save trägt den Stand von VOR dem Kampf.
    const knoten = findeKnoten(run, run.kampfKnoten.knotenId);
    rng = new RNG(run.kampfKnoten.seed);
    modus = 'kampf';
    kampf = starteKampf(run, rng, knoten.typ);
    beginneZug(run, kampf, rng);
    letztesEreignis = uebersetze('ui.kampf_resume');
  } else {
    // Falls der Save an der Schwelle zu Region 6 liegt: die Wendung zuerst (D4).
    modus = wendungSteht(run) ? 'wendung' : 'karte';
    letztesEreignis = uebersetze('ui.willkommen_zurueck');
    mentorZeile = mentorBeiRegionEintritt(run.region);
  }
  render();
} else {
  neuerRun();
}
