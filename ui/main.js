// ui/main.js — DOM-Rendering + Eingabe, kein Spiellogik-Code (09 §1).
// Karten-Run Region 1: Karte → Knoten (Kampf/Schmiede/Markt/Event/Lagerfeuer) → Karte.
// Alles in Platzhalter-Konvention (08 §4.0).

import { RNG } from '../rng.js';
import { schreck, gesperrteSeitenAnzahl, KIPP_PUNKT } from '../push.js';
import { uebersetze } from '../i18n/de.js';
import { KLASSEN, HUETER_BASIS_HP } from '../data.js';
import { erstelleNeuenSave, speichere, lade, loesche } from '../save.js';
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
  rasteLagerfeuer,
} from '../knoten.js';

const rng = new RNG((Date.now() >>> 0) || 1);
const KNOTEN_LABEL = {
  kampf: '⚔ Kampf', elite: '☠ Elite', boss: '👑 Boss', markt: '🧺 Markt',
  schmiede: '🔨 Schmiede', event: '❖ Ereignis', lagerfeuer: '🔥 Lagerfeuer',
};

let run = null;
let kampf = null;
let modus = 'karte'; // karte | kampf | schmiede | markt | event | lagerfeuer
let letztesEreignis = '';
// UI-Auswahlzustände
let belohnungsWahl = null; // { option, wuerfelId? }
let schmiedeWahl = null; // { gravurId, wuerfelId? }
let marktWahl = null; // { aktion: 'blaupause'|'entfernen'|'troesten', blaupause? }
let lagerfeuerWahl = null; // 'troesten' | 'vollenden'
let knotenKontext = null; // Angebot/Event des aktiven Knotens

const wurzel = document.getElementById('spiel');

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
    });
    speichere(save);
  } catch {
    /* kein localStorage (z. B. file://) — ignorieren */
  }
}

function ladeGespeichertenRun() {
  try {
    const save = lade();
    if (!save?.runState?.karte) return false;
    const rs = save.runState;
    const hpMax = HUETER_BASIS_HP + KLASSEN[rs.klasse].hpMod;
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
      verloren: false,
      abgeschlossen: findeKnotenTyp(rs) === 'boss',
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

function neuerRun() {
  try { loesche(); } catch { /* ignorieren */ }
  run = starteRun('eichwart', rng);
  kampf = null;
  modus = 'karte';
  belohnungsWahl = schmiedeWahl = marktWahl = lagerfeuerWahl = knotenKontext = null;
  letztesEreignis = 'Ein neuer Hüter betritt den Saumhain. Wähle deinen Weg.';
  render();
}

function zurKarte() {
  modus = 'karte';
  kampf = null;
  belohnungsWahl = schmiedeWahl = marktWahl = lagerfeuerWahl = knotenKontext = null;
  speichereZwischenKnoten();
  render();
}

function klickKnoten(knotenId) {
  const knoten = betreteKnoten(run, knotenId);
  if (!knoten) return;
  if (['kampf', 'elite', 'boss'].includes(knoten.typ)) {
    modus = 'kampf';
    kampf = starteKampf(run, rng, knoten.typ);
    beginneZug(run, kampf, rng);
    letztesEreignis = `${KNOTEN_LABEL[knoten.typ]} — Reihe ${knoten.reihe}.`;
  } else if (knoten.typ === 'schmiede') {
    modus = 'schmiede';
    knotenKontext = erstelleSchmiedeAngebot();
    letztesEreignis = 'Die Schmiede glüht. Gravuren gegen Münzen.';
  } else if (knoten.typ === 'markt') {
    modus = 'markt';
    knotenKontext = erstelleMarktAngebot(rng, run);
    letztesEreignis = 'Ein Markt am Wegesrand.';
  } else if (knoten.typ === 'event') {
    modus = 'event';
    knotenKontext = { event: zieheEvent(rng), ergebnis: null };
    letztesEreignis = '';
  } else if (knoten.typ === 'lagerfeuer') {
    modus = 'lagerfeuer';
    knotenKontext = { genutzt: false };
    letztesEreignis = 'Ein ruhiges Feuer vor dem Boss. Eine Handlung.';
  }
  render();
}

// Kampf-Aktionen (unverändert zur Slice-Version, plus Karten-Rückkehr).
function klickWuerfel(id) {
  if (kampf.phase !== 'zug') return;
  if (kampf.reihe.includes(id)) nimmZurueck(run, kampf, id);
  else platziere(run, kampf, id);
  render();
}

function klickReroll() {
  const { tischsturz } = rerolle(run, kampf, rng);
  letztesEreignis = tischsturz
    ? 'TISCHSTURZ! Die Würfel stürzen vom Tisch — die ganze Hand erschrickt.'
    : 'Die Hand wird neu geworfen.';
  render();
}

function klickAufloesen() {
  const pools = loeseZugAuf(run, kampf, rng);
  if (!pools) return;
  letztesEreignis = `Paket aufgelöst: ${pools.schaden} Schaden, ${pools.rinde} Rinde.`;
  const c = pools.combos;
  if (c?.gleichklangAnzahl >= 2) letztesEreignis += ` Gleichklang ×${c.gleichklangMult} (${c.gleichklangAnzahl} gleiche)!`;
  if (c?.vollmond) letztesEreignis += ` 🌕 Vollmond +${c.vollmondBurst}!`;
  if (kampf.geheilt > 0) letztesEreignis += ` 💧 Labung +${kampf.geheilt} HP.`;
  if (kampf.gepraegt > 0) letztesEreignis += ` 🪙 Prägung +${kampf.gepraegt} Münzen.`;
  if (kampf.getroestet > 0) letztesEreignis += ` 🍃 ${kampf.getroestet}× getröstet (+2 Gemüt).`;
  if (kampf.aussetzer > 0) letztesEreignis += ` (${kampf.aussetzer}× Riss-Aussetzer.)`;
  if (kampf.phase === 'sieg') {
    letztesEreignis += kampf.sauberSieg ? ' Sauberer Sieg (+1 Gemüt auf Gespielte).' : '';
    if (kampf.kristallisiert > 0) letztesEreignis += ` ${kampf.kristallisiert} Übermut kristallisiert zu Schreck.`;
  }
  render();
}

function klickGegnerzug() {
  const ergebnis = fuehreGegnerzugAus(run, kampf, rng);
  if (!ergebnis) return;
  const dot = (ergebnis.faeule || 0) + (ergebnis.brand || 0);
  if (ergebnis.besiegt) {
    letztesEreignis = 'Der Status frisst den Gegner auf — besiegt.';
  } else {
    letztesEreignis = ergebnis.erlitten > 0
      ? `Der Gegner trifft für ${ergebnis.erlitten}.`
      : 'Der Gegner holt aus — kein Schaden durchgedrungen.';
    if (dot > 0) letztesEreignis += ` (Status: ${dot} an den Gegner.)`;
  }
  if (kampf.phase === 'zug') beginneZug(run, kampf, rng);
  render();
}

// Belohnungs-Flow (A1/A2)
function optionLabel(option) {
  if (option.typ === 'muenzen') return `+${option.betrag} Münzen`;
  if (option.typ === 'blaupause') return `Blaupause: ${uebersetze(option.nameKey)}`;
  if (option.typ === 'segen') {
    const haken = option.hakenTextKey ? ` — Haken: ${uebersetze(option.hakenTextKey)}` : '';
    return `Segen: ${uebersetze(option.textKey)}${haken}`;
  }
  return `Gravur: ${uebersetze(option.nameKey)}`;
}

function waehleBelohnung(index) {
  const option = kampf.belohnung.optionen[index];
  if (option.typ === 'muenzen' || option.typ === 'segen') {
    wendeBelohnungAn(run, option); // Segen brauchen kein Ziel — run-weiter Modifikator
    kampf.belohnung.erledigt = true;
    letztesEreignis =
      option.typ === 'segen'
        ? `Segen aufgenommen: ${uebersetze(option.textKey)}`
        : `${option.betrag} Münzen eingestrichen.`;
  } else {
    belohnungsWahl = { option };
  }
  render();
}

function waehleZielWuerfel(wuerfelId) {
  const wuerfel = run.arsenal.find((w) => w.id === wuerfelId);
  if (belohnungsWahl.option.typ === 'blaupause') {
    wendeBelohnungAn(run, belohnungsWahl.option, { wuerfel });
    letztesEreignis = `${uebersetze(belohnungsWahl.option.nameKey)} auf ${uebersetze(wuerfel.nameKey)} angewandt.`;
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
  letztesEreignis = `${uebersetze(belohnungsWahl.option.nameKey)} auf Seite ${seitenIndex + 1} von ${uebersetze(wuerfel.nameKey)} graviert (Stufe ${wuerfel.stufen[seitenIndex]}).`;
  kampf.belohnung.erledigt = true;
  belohnungsWahl = null;
  render();
}

function ueberspringeBelohnung() {
  belohnungsWahl = null;
  kampf.belohnung.erledigt = true;
  letztesEreignis = 'Belohnung ausgeschlagen.';
  render();
}

// Schmiede
function schmiedeKauf(seitenIndex) {
  const ergebnis = kaufeGravur(run, schmiedeWahl.gravurId, schmiedeWahl.wuerfelId, seitenIndex);
  letztesEreignis = ergebnis.ok
    ? `Graviert für ${ergebnis.preis} Münzen (Stufe ${ergebnis.stufe}).`
    : ergebnis.grund === 'muenzen' ? 'Zu wenige Münzen.' : 'Diese Seite ist am Cap.';
  if (ergebnis.ok) schmiedeWahl = null;
  render();
}

// Markt
function marktKaufWuerfel(index) {
  const angebot = knotenKontext.wuerfel[index];
  const ergebnis = kaufeWuerfel(run, angebot.vorlageId, angebot.preisEicheln);
  letztesEreignis = ergebnis.ok ? `${uebersetze(ergebnis.wuerfel.nameKey)} gekauft.` : 'Zu wenige Eicheln.';
  if (ergebnis.ok) knotenKontext.wuerfel.splice(index, 1);
  render();
}

function marktKaufSegen() {
  const s = knotenKontext.segen;
  const ergebnis = kaufeMarktSegen(run, s.segenId, s.preisEicheln);
  letztesEreignis = ergebnis.ok ? `Segen aufgenommen: ${uebersetze(s.textKey)}` : 'Zu wenige Eicheln.';
  if (ergebnis.ok) knotenKontext.segen = null;
  render();
}

function marktZiel(wuerfelId) {
  if (marktWahl.aktion === 'blaupause') {
    const b = knotenKontext.blaupause;
    const ergebnis = kaufeMarktBlaupause(run, b.blaupauseId, b.preisEicheln, wuerfelId);
    letztesEreignis = ergebnis.ok ? `${uebersetze(b.nameKey)} angewandt.` : 'Zu wenige Eicheln.';
    if (ergebnis.ok) knotenKontext.blaupause = null;
  } else if (marktWahl.aktion === 'entfernen') {
    const ergebnis = entferneWuerfel(run, wuerfelId);
    letztesEreignis = ergebnis.ok
      ? `Würfel entfernt (${ergebnis.preis} Münzen).`
      : ergebnis.grund === 'muenzen' ? 'Zu wenige Münzen.' : 'Das Arsenal ist am Minimum.';
  } else if (marktWahl.aktion === 'troesten') {
    const ergebnis = troesteDienst(run, wuerfelId);
    letztesEreignis = ergebnis.ok ? '+2 Gemüt.' : 'Zu wenig Tau.';
  }
  marktWahl = null;
  render();
}

// Event
function eventOption(index) {
  const wirkungen = waehleEventOption(run, knotenKontext.event, index, rng);
  knotenKontext.ergebnis = wirkungen.length ? wirkungen.join(' · ') : 'Du gehst weiter.';
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
  knotenKontext.genutzt = true;
  lagerfeuerWahl = null;
  letztesEreignis = `Rast: ${ergebnis.text}.`;
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
      <span>❤ ${run.hp}/${run.hpMax}</span>
      <span>🪙 ${run.waehrungen.muenzen} · 🌰 ${run.waehrungen.eicheln} · 💧 ${run.waehrungen.tau}</span>
      <span>Schreck Σ ${arsenalSchreckSumme(run)}</span>
      ${segen ? `<span class="segen-leiste">${segen}</span>` : ''}
    </section>`;
}

function arsenalPicker(datenAttribut, filter = () => true) {
  return `
    <div class="picker">
      ${run.arsenal.filter(filter).map((w) => `
        <button class="ph ph--seite" data-${datenAttribut}="${w.id}">
          <span class="label">${uebersetze(w.nameKey)}</span>
          <span class="stufe">${w.gemuet !== 0 ? `Gemüt ${w.gemuet}` : ''} ${w.atem === 0 ? '· 0 Atem' : ''}</span>
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
              ${KNOTEN_LABEL[k.typ]}
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
        <strong>${uebersetze(belohnungsWahl.option.nameKey)} — Seite wählen (${uebersetze(wuerfel.nameKey)})</strong>
        <div class="picker">
          ${wuerfel.seiten.map((s, i) => `
            <button class="ph ph--seite" data-ziel-seite="${i}">
              <span class="wert">${s.wert}</span>
              ${wuerfel.stufen[i] > 0 ? `<span class="stufe">St.${wuerfel.stufen[i]}</span>` : ''}
            </button>`).join('')}
        </div>
      </section>`;
  }
  if (belohnungsWahl) {
    return `
      <section class="ph ph--belohnung">
        <strong>${optionLabel(belohnungsWahl.option)} — Würfel wählen</strong>
        ${arsenalPicker('ziel-wuerfel')}
      </section>`;
  }
  return `
    <section class="ph ph--belohnung">
      <strong>Sieg! +${b.einkommen.muenzen} Münzen, +${b.einkommen.eicheln} Eicheln</strong>
      <div class="picker">
        ${b.optionen.map((o, i) => `<button data-opt="${i}">${optionLabel(o)}</button>`).join('')}
        <button data-aktion="ueberspringen">Überspringen</button>
      </div>
    </section>`;
}

const STATUS_ICON = {
  faeule: '☣', brand: '🔥', morsch: '💢', welk: '🥀', kraft: '💪', riss: '⚡',
  wetzung: '🔪', scharte: '🩹', freilauf: '🎲', klemme: '🔒',
};

function statusBadges(status) {
  return Object.entries(STATUS_ICON)
    .filter(([typ]) => status[typ] > 0)
    .map(([typ, icon]) => `<span class="badge" title="${typ}">${icon}${status[typ]}</span>`)
    .join(' ');
}

function renderKampf() {
  const belohnungOffen = kampf.phase === 'sieg' && kampf.belohnung && !kampf.belohnung.erledigt;
  const g = kampf.gegner;
  const absichtText = g.absicht.typ === 'angriff' ? `⚔ Angriff ${g.absicht.wert}` : '🛡 Block (halbiert Schaden)';
  return `
    <section class="ph ph--gegner">
      <strong>${uebersetze(g.nameKey)}</strong>
      <div class="balken"><div class="balken-fuellung" style="width:${(g.hp / g.hpMax) * 100}%"></div></div>
      <span>${g.hp} / ${g.hpMax} HP · Absicht: ${absichtText}</span>
      ${statusBadges(g.status) ? `<div class="badges">${statusBadges(g.status)}</div>` : ''}
    </section>
    <section class="status">
      <span>❤ ${run.hp}/${run.hpMax}</span>
      <span>Atem ${pips(3, kampf.atem, 'Atem')}</span>
      <span>Rinde ${kampf.block}</span>
      <span class="${kampf.uebermut >= KIPP_PUNKT ? 'warnung' : ''}">Übermut ${pips(KIPP_PUNKT, kampf.uebermut, 'Übermut')}</span>
      <span>🪙 ${run.waehrungen.muenzen} · 🌰 ${run.waehrungen.eicheln}</span>
      ${statusBadges(kampf.spielerStatus) ? `<span class="badges">${statusBadges(kampf.spielerStatus)}</span>` : ''}
    </section>
    <section class="hand">${kampf.hand.map((id) => wuerfelBox(id)).join('')}</section>
    ${belohnungOffen ? belohnungsPanel() : ''}
    <section class="aktionen">
      ${kampf.phase === 'zug' ? `
        <button data-aktion="reroll">Neu werfen ${kampf.rerollsDiesenZug === 0 ? '(gratis)' : '(+1 Übermut)'}</button>
        <button data-aktion="aufloesen" ${kampf.reihe.length === 0 ? 'disabled' : ''}>Auflösen (${kampf.reihe.length})</button>
      ` : ''}
      ${kampf.phase === 'gegnerzug' ? '<button data-aktion="gegnerzug">Gegnerzug</button>' : ''}
      ${kampf.phase === 'sieg' && !belohnungOffen ? '<button data-aktion="weiter">Weiter</button>' : ''}
    </section>`;
}

function renderSchmiede() {
  if (schmiedeWahl?.wuerfelId) {
    const wuerfel = run.arsenal.find((w) => w.id === schmiedeWahl.wuerfelId);
    return `
      <section class="ph ph--belohnung">
        <strong>Seite wählen (${uebersetze(wuerfel.nameKey)})</strong>
        <div class="picker">
          ${wuerfel.seiten.map((s, i) => {
            const angebot = schmiedePreis(wuerfel, schmiedeWahl.gravurId, i, run);
            return `
              <button class="ph ph--seite" data-schmiede-seite="${i}" ${angebot ? '' : 'disabled'}>
                <span class="wert">${s.wert}</span>
                <span class="stufe">${angebot ? `${angebot.preis} 🪙${angebot.typWechsel ? ' (Wechsel)' : ''}` : 'Cap'}</span>
              </button>`;
          }).join('')}
        </div>
      </section>`;
  }
  if (schmiedeWahl) {
    return `
      <section class="ph ph--belohnung">
        <strong>Würfel wählen</strong>
        ${arsenalPicker('schmiede-wuerfel')}
      </section>`;
  }
  return `
    <section class="ph ph--belohnung">
      <strong>Schmiede — Gravuren (Stufe 1/2/3: 40/60/80 🪙)</strong>
      <div class="picker">
        ${knotenKontext.map((g) => `<button data-schmiede-gravur="${g.gravurId}">${uebersetze(g.nameKey)}</button>`).join('')}
      </div>
    </section>`;
}

function renderMarkt() {
  if (marktWahl) {
    const titel = marktWahl.aktion === 'blaupause' ? 'Blaupause anwenden auf' : marktWahl.aktion === 'entfernen' ? 'Würfel entfernen' : 'Würfel trösten';
    return `<section class="ph ph--belohnung"><strong>${titel} — Würfel wählen</strong>${arsenalPicker('markt-ziel')}</section>`;
  }
  const k = knotenKontext;
  return `
    <section class="ph ph--belohnung">
      <strong>Markt</strong>
      <div class="picker">
        ${k.wuerfel.map((a, i) => `<button data-markt-wuerfel="${i}">${uebersetze(`wuerfel.${a.vorlageId}.name`)} (${a.preisEicheln} 🌰)</button>`).join('')}
        ${k.blaupause ? `<button data-markt-aktion="blaupause">Blaupause ${uebersetze(k.blaupause.nameKey)} (${k.blaupause.preisEicheln} 🌰)</button>` : ''}
        ${k.segen ? `<button data-markt-aktion="segen">Segen ${uebersetze(k.segen.textKey).split(':')[0]} (${k.segen.preisEicheln} 🌰)</button>` : ''}
        <button data-markt-aktion="entfernen">Würfel entfernen (${entfernenPreis(run)} 🪙)</button>
        <button data-markt-aktion="troesten">Trösten-Dienst (${TROESTEN_DIENST_TAU} 💧)</button>
      </div>
    </section>`;
}

function renderEvent() {
  const { event, ergebnis } = knotenKontext;
  return `
    <section class="ph ph--belohnung">
      <strong>${uebersetze(event.titelKey)}</strong>
      <p>${uebersetze(event.textKey)}</p>
      ${ergebnis
        ? `<p><em>${ergebnis}</em></p>`
        : `<div class="picker">
            ${event.optionen.map((o, i) => `<button data-event-opt="${i}">${uebersetze(o.textKey)}</button>`).join('')}
          </div>`}
    </section>`;
}

function renderLagerfeuer() {
  if (lagerfeuerWahl) {
    return `<section class="ph ph--belohnung"><strong>${lagerfeuerWahl === 'troesten' ? 'Trösten' : 'Vollenden'} — Würfel wählen</strong>${arsenalPicker('lagerfeuer-ziel')}</section>`;
  }
  if (knotenKontext.genutzt) {
    return '<section class="ph ph--belohnung"><strong>Das Feuer brennt ruhig herunter.</strong></section>';
  }
  return `
    <section class="ph ph--belohnung">
      <strong>Lagerfeuer — eine Handlung</strong>
      <div class="picker">
        <button data-lagerfeuer="heilen">Heilen (+30 % HP)</button>
        <button data-lagerfeuer="troesten">Trösten (+2 Gemüt)</button>
        <button data-lagerfeuer="vollenden">Vollenden (−1 Atem)</button>
      </div>
    </section>`;
}

function render() {
  const belohnungOffen = kampf?.phase === 'sieg' && kampf.belohnung && !kampf.belohnung.erledigt;
  if ((run.verloren || run.abgeschlossen) && !belohnungOffen && modus !== 'kampf') {
    const titel = run.abgeschlossen ? 'Region 1 durchquert — der Saumhüter fällt' : 'Der Hüter fällt';
    wurzel.innerHTML = `
      <div class="ph ph--ende">
        <h2>${titel}</h2>
        <p>Arsenal-Schreck: ${arsenalSchreckSumme(run)} · Trösten: ${run.troestenZahl} · 🪙 ${run.waehrungen.muenzen}</p>
        <button data-aktion="neu">Neuer Run</button>
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
  else inhalt = statuszeile() + renderKarte();

  const verlassenSichtbar = ['schmiede', 'markt', 'lagerfeuer'].includes(modus) || (modus === 'event' && knotenKontext?.ergebnis);
  wurzel.innerHTML = `
    ${inhalt}
    ${verlassenSichtbar ? '<section class="aktionen"><button data-aktion="verlassen">Weiterziehen</button></section>' : ''}
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
  binde('[data-lagerfeuer]', (el) => lagerfeuerAktion(el.dataset.lagerfeuer));
  binde('[data-lagerfeuer-ziel]', (el) => lagerfeuerAktion(lagerfeuerWahl, el.dataset.lagerfeuerZiel));
  const aktionen = {
    reroll: klickReroll,
    aufloesen: klickAufloesen,
    gegnerzug: klickGegnerzug,
    weiter: klickWeiter,
    ueberspringen: ueberspringeBelohnung,
    verlassen: zurKarte,
    neu: neuerRun,
  };
  binde('[data-aktion]', (el) => aktionen[el.dataset.aktion]());
}

// --- Start: gespeicherten Run fortsetzen oder neu beginnen ---------------------------

if (ladeGespeichertenRun()) {
  modus = 'karte';
  letztesEreignis = 'Willkommen zurück im Saumhain.';
  render();
} else {
  neuerRun();
}
