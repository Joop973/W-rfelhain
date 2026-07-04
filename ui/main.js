// ui/main.js — DOM-Rendering + Eingabe, kein Spiellogik-Code (09 §1).
// Liest Kampf-/Run-State aus kampf.js und rendert Platzhalter-Boxen (08 §4.0).

import { RNG } from '../rng.js';
import { schreck, gesperrteSeitenAnzahl, KIPP_PUNKT } from '../push.js';
import { uebersetze } from '../i18n/de.js';
import { erstelleNeuenSave, speichere, SAVE_KEY } from '../save.js';
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
  KAEMPFE_PRO_REGION,
} from '../kampf.js';

const rng = new RNG((Date.now() >>> 0) || 1);
let run = null;
let kampf = null;
let letztesEreignis = '';

const wurzel = document.getElementById('spiel');

function speichereZwischenKnoten() {
  // Best-effort: Save nur zwischen Knoten (09 §3.1); UI bleibt ohne Storage lauffähig.
  try {
    const save = erstelleNeuenSave(run.klasse);
    save.runState.arsenal = run.arsenal;
    save.runState.knotenIndex = run.kampfNummer;
    save.runState.hp = run.hp; // Zusatzfeld (Schema erlaubt zusätzliche Felder)
    speichere(save);
  } catch {
    /* kein localStorage (z. B. file://-Kontext) — ignorieren */
  }
}

function neuerRun() {
  run = starteRun('eichwart');
  kampf = starteKampf(run, rng);
  beginneZug(run, kampf, rng);
  letztesEreignis = 'Ein neuer Hüter betritt den Saumhain.';
  render();
}

function naechsterKampf() {
  kampf = starteKampf(run, rng);
  beginneZug(run, kampf, rng);
  letztesEreignis = `Kampf ${run.kampfNummer + 1} von ${KAEMPFE_PRO_REGION}.`;
  render();
}

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
  const pools = loeseZugAuf(run, kampf);
  if (!pools) return;
  letztesEreignis = `Paket aufgelöst: ${pools.schaden} Schaden, ${pools.rinde} Rinde.`;
  if (kampf.phase === 'sieg') {
    letztesEreignis += kampf.sauberSieg ? ' Sauberer Sieg (+1 Gemüt auf Gespielte).' : '';
    if (kampf.kristallisiert > 0) {
      letztesEreignis += ` ${kampf.kristallisiert} Übermut kristallisiert zu Schreck.`;
    }
    speichereZwischenKnoten();
  }
  render();
}

function klickGegnerzug() {
  const ergebnis = fuehreGegnerzugAus(run, kampf);
  if (!ergebnis) return;
  letztesEreignis =
    ergebnis.erlitten > 0
      ? `Der Gegner trifft für ${ergebnis.erlitten}.`
      : 'Der Gegner holt aus — kein Schaden durchgedrungen.';
  if (kampf.phase === 'zug') beginneZug(run, kampf, rng);
  render();
}

// --- Rendering (Platzhalter-Konvention 08 §4.0) --------------------------------

function pips(anzahl, voll, label) {
  const teile = [];
  for (let i = 0; i < anzahl; i += 1) teile.push(i < voll ? '●' : '○');
  return `<span class="pips" title="${label}">${teile.join('')}</span>`;
}

function wuerfelBox(id) {
  const w = run.arsenal.find((x) => x.id === id);
  const wert = kampf.wuerfe[id];
  const s = schreck(w.gemuet);
  const gesperrt = gesperrteSeitenAnzahl(s);
  const platziert = kampf.reihe.includes(id);
  const position = platziert ? kampf.reihe.indexOf(id) + 1 : null;
  const stimmung = s > 0 ? 'aengstlich' : w.gemuet > 0 ? 'froh' : 'ruhig';
  return `
    <button class="ph ph--wuerfel typ-${w.typ} stimmung-${stimmung} ${platziert ? 'platziert' : ''}"
            data-wuerfel="${id}" ${kampf.phase !== 'zug' ? 'disabled' : ''}>
      <span class="wert">${wert}</span>
      <span class="label">${uebersetze(w.nameKey)}</span>
      ${gesperrt > 0 ? `<span class="gesperrt">🔒${gesperrt}</span>` : ''}
      ${position ? `<span class="position">${position}.</span>` : ''}
    </button>`;
}

function render() {
  if (run.verloren || run.abgeschlossen) {
    const titel = run.abgeschlossen ? 'Region 1 durchquert' : 'Der Hüter fällt';
    const text = run.abgeschlossen
      ? `Der Saumhain liegt hinter dir. Arsenal-Schreck: ${arsenalSchreckSumme(run)}.`
      : `Nach ${run.kampfNummer + 1} Kämpfen endet der Weg. Arsenal-Schreck: ${arsenalSchreckSumme(run)}.`;
    wurzel.innerHTML = `
      <div class="ph ph--ende">
        <h2>${titel}</h2>
        <p>${text}</p>
        <button data-aktion="neu">Neuer Run</button>
      </div>`;
    verdrahte();
    return;
  }

  const g = kampf.gegner;
  const absichtText =
    g.absicht.typ === 'angriff' ? `⚔ Angriff ${g.absicht.wert}` : `🛡 Block (halbiert Schaden)`;

  wurzel.innerHTML = `
    <section class="ph ph--gegner">
      <strong>${uebersetze(g.nameKey)}</strong>
      <div class="balken"><div class="balken-fuellung" style="width:${(g.hp / g.hpMax) * 100}%"></div></div>
      <span>${g.hp} / ${g.hpMax} HP · Absicht: ${absichtText}</span>
    </section>

    <section class="status">
      <span>❤ ${run.hp}/${run.hpMax}</span>
      <span>Atem ${pips(3, kampf.atem, 'Atem')}</span>
      <span>Rinde ${kampf.block}</span>
      <span class="${kampf.uebermut >= KIPP_PUNKT ? 'warnung' : ''}">Übermut ${pips(KIPP_PUNKT, kampf.uebermut, 'Übermut')}</span>
      <span>Kampf ${run.kampfNummer + 1}/${KAEMPFE_PRO_REGION}</span>
    </section>

    <section class="hand">
      ${kampf.hand.map(wuerfelBox).join('')}
    </section>

    <section class="aktionen">
      ${kampf.phase === 'zug' ? `
        <button data-aktion="reroll">Neu werfen ${kampf.rerollsDiesenZug === 0 ? '(gratis)' : '(+1 Übermut)'}</button>
        <button data-aktion="aufloesen" ${kampf.reihe.length === 0 ? 'disabled' : ''}>Auflösen (${kampf.reihe.length})</button>
      ` : ''}
      ${kampf.phase === 'gegnerzug' ? `<button data-aktion="gegnerzug">Gegnerzug</button>` : ''}
      ${kampf.phase === 'sieg' ? `<button data-aktion="weiter">Weiter</button>` : ''}
    </section>

    <section class="ph ph--log">${letztesEreignis}</section>
  `;
  verdrahte();
}

function verdrahte() {
  wurzel.querySelectorAll('[data-wuerfel]').forEach((el) => {
    el.addEventListener('click', () => klickWuerfel(el.dataset.wuerfel));
  });
  const aktionen = {
    reroll: klickReroll,
    aufloesen: klickAufloesen,
    gegnerzug: klickGegnerzug,
    weiter: naechsterKampf,
    neu: neuerRun,
  };
  wurzel.querySelectorAll('[data-aktion]').forEach((el) => {
    el.addEventListener('click', aktionen[el.dataset.aktion]);
  });
}

neuerRun();
