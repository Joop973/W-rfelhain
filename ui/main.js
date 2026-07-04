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
import { wendeBelohnungAn } from '../belohnung.js';

const rng = new RNG((Date.now() >>> 0) || 1);
let run = null;
let kampf = null;
let letztesEreignis = '';
// Belohnungs-Auswahlzustand: null | { option, wuerfelId? } — steuert die Picker.
let belohnungsWahl = null;

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
  belohnungsWahl = null;
  kampf = starteKampf(run, rng);
  beginneZug(run, kampf, rng);
  letztesEreignis = `Kampf ${run.kampfNummer + 1} von ${KAEMPFE_PRO_REGION}.`;
  render();
}

// --- Belohnungs-Flow (A1/A2) ----------------------------------------------------

function optionLabel(option) {
  if (option.typ === 'muenzen') return `+${option.betrag} Münzen`;
  if (option.typ === 'blaupause') return `Blaupause: ${uebersetze(option.nameKey)}`;
  return `Gravur: ${uebersetze(option.nameKey)}`;
}

function waehleBelohnung(index) {
  const option = kampf.belohnung.optionen[index];
  if (option.typ === 'muenzen') {
    wendeBelohnungAn(run, option);
    kampf.belohnung.erledigt = true;
    letztesEreignis = `${option.betrag} Münzen eingestrichen.`;
  } else {
    belohnungsWahl = { option }; // Blaupause/Gravur brauchen ein Ziel
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
    belohnungsWahl = { ...belohnungsWahl, wuerfelId }; // Gravur: jetzt Seite wählen
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
      <span class="label">${uebersetze(w.nameKey)}</span>
      ${gesperrt > 0 ? `<span class="gesperrt">🔒${gesperrt}</span>` : ''}
      ${position ? `<span class="position">${position}.</span>` : ''}
    </button>`;
}

function belohnungsPanel() {
  const b = kampf.belohnung;
  if (belohnungsWahl?.wuerfelId) {
    // Seiten-Picker (Gravur)
    const wuerfel = run.arsenal.find((w) => w.id === belohnungsWahl.wuerfelId);
    return `
      <section class="ph ph--belohnung">
        <strong>${uebersetze(belohnungsWahl.option.nameKey)} — Seite wählen (${uebersetze(wuerfel.nameKey)})</strong>
        <div class="picker">
          ${wuerfel.seiten
            .map(
              (s, i) => `
            <button class="ph ph--seite" data-ziel-seite="${i}">
              <span class="wert">${s.wert}</span>
              ${wuerfel.stufen[i] > 0 ? `<span class="stufe">St.${wuerfel.stufen[i]}</span>` : ''}
            </button>`
            )
            .join('')}
        </div>
      </section>`;
  }
  if (belohnungsWahl) {
    // Würfel-Picker (Blaupause oder Gravur)
    return `
      <section class="ph ph--belohnung">
        <strong>${optionLabel(belohnungsWahl.option)} — Würfel wählen</strong>
        <div class="picker">
          ${run.arsenal
            .map(
              (w) => `
            <button class="ph ph--seite" data-ziel-wuerfel="${w.id}">
              <span class="label">${uebersetze(w.nameKey)}</span>
              ${w.blaupause ? `<span class="stufe">${uebersetze(w.blaupause.nameKey)}</span>` : ''}
            </button>`
            )
            .join('')}
        </div>
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

function render() {
  const belohnungOffen = kampf?.phase === 'sieg' && kampf.belohnung && !kampf.belohnung.erledigt;
  if ((run.verloren || run.abgeschlossen) && !belohnungOffen) {
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
      <span>🪙 ${run.waehrungen.muenzen} · 🌰 ${run.waehrungen.eicheln}</span>
      <span>Kampf ${Math.min(run.kampfNummer + 1, KAEMPFE_PRO_REGION)}/${KAEMPFE_PRO_REGION}</span>
    </section>

    <section class="hand">
      ${kampf.hand.map(wuerfelBox).join('')}
    </section>

    ${belohnungOffen ? belohnungsPanel() : ''}

    <section class="aktionen">
      ${kampf.phase === 'zug' ? `
        <button data-aktion="reroll">Neu werfen ${kampf.rerollsDiesenZug === 0 ? '(gratis)' : '(+1 Übermut)'}</button>
        <button data-aktion="aufloesen" ${kampf.reihe.length === 0 ? 'disabled' : ''}>Auflösen (${kampf.reihe.length})</button>
      ` : ''}
      ${kampf.phase === 'gegnerzug' ? `<button data-aktion="gegnerzug">Gegnerzug</button>` : ''}
      ${kampf.phase === 'sieg' && !belohnungOffen ? `<button data-aktion="weiter">Weiter</button>` : ''}
    </section>

    <section class="ph ph--log">${letztesEreignis}</section>
  `;
  verdrahte();
}

function klickWeiter() {
  if (run.abgeschlossen || run.verloren) render(); // End-Screen
  else naechsterKampf();
}

function verdrahte() {
  wurzel.querySelectorAll('[data-wuerfel]').forEach((el) => {
    el.addEventListener('click', () => klickWuerfel(el.dataset.wuerfel));
  });
  wurzel.querySelectorAll('[data-opt]').forEach((el) => {
    el.addEventListener('click', () => waehleBelohnung(Number(el.dataset.opt)));
  });
  wurzel.querySelectorAll('[data-ziel-wuerfel]').forEach((el) => {
    el.addEventListener('click', () => waehleZielWuerfel(el.dataset.zielWuerfel));
  });
  wurzel.querySelectorAll('[data-ziel-seite]').forEach((el) => {
    el.addEventListener('click', () => waehleZielSeite(Number(el.dataset.zielSeite)));
  });
  const aktionen = {
    reroll: klickReroll,
    aufloesen: klickAufloesen,
    gegnerzug: klickGegnerzug,
    weiter: klickWeiter,
    ueberspringen: ueberspringeBelohnung,
    neu: neuerRun,
  };
  wurzel.querySelectorAll('[data-aktion]').forEach((el) => {
    el.addEventListener('click', aktionen[el.dataset.aktion]);
  });
}

neuerRun();
