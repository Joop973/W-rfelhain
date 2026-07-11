// sim/gier_vs_pflege.js — Monte-Carlo "Gier vs. Pflege" auf dem echten
// 12er-Arsenal-Code (rng.js/engine.js/push.js/ziehstapel.js direkt importiert,
// kein Sandbox-Nachbau). Re-Run des Welle-1-Tors (03 §12.1) auf 12er-Basis —
// reine Messung, kein Design-Wert wird verändert.
//
// Struktur: ein Trial = ein RUN aus mehreren Kämpfen (Region-1-Sequenz) mit
// Heilung zwischen den Kämpfen. Nur so kann Kristallisation als run-lange
// Konsequenz überhaupt wirken — der 6er-Befund misst dieselbe Struktur
// ("Heilungswert zwischen den Kämpfen" als Hebel, Schreck akkumuliert
// über den Run). Gemüt/Schreck persistiert am Würfel über Kampfgrenzen.
//
// Sim-Annahmen (keine Design-Entscheidungen):
// - Run = 9 Kämpfe (typische Region-1-Kampflast inkl. Elite-Mix), Sieg =
//   alle überlebt. Gegner je Kampf frisch nach 03 §7-Hinweis gewürfelt
//   (Normal 30–45 HP, Elite-Mix 50–65 HP ~20 %, Schaden 6–8).
// - Zwei Schwierigkeitsstufen über Gegner-Schaden-Mult + Heilung zwischen
//   Kämpfen (moderat ×1,15/+10 HP · mittel ×1,3/+8 HP) — Sim-Tuning zur
//   Reproduktion der zwei Stufen aus 03 §12.1, keine gesperrten Werte.
//   Ergebnisse: docs/Welle1_Tor_ReRun_12er_Befund.md.
// - Gravurloser Eichwart-Starter (04 §2), kein Block gespielt (03 §12.1:
//   proaktives Blocken in kurzen Kämpfen netto-negativ — trifft alle drei
//   Politiken gleich).
// - Reroll = ganze Hand neu werfen (grobkörnig). Gier-Ziel: Top-3-Schaden-
//   Summe ≥ 14. Blind ignoriert Übermut (Tischsturz-Risiko), klug stoppt
//   vor der Schwelle (02 §7), Pflege zahlt nie (nur Gratis-Reroll).
// - Push ist in 02 §6.1 nur als Gemüt-Kosten definiert (kein Output-Bonus);
//   die Gier-Achse läuft daher wie im Befund über Reroll-Aggressivität.

import { RNG } from '../rng.js';
import { resolveZug } from '../engine.js';
import {
  schreck,
  bestimmeGesperrteSeitenIndizes,
  beruhige,
  fuehreRerollAus,
  rerollKosten,
  loeseTischsturzAus,
  verarbeiteKampfende,
  KIPP_PUNKT,
  TISCHSTURZ_SELBSTSCHADEN,
} from '../push.js';
import { kampfbeginn, zieheHand, zugende } from '../ziehstapel.js';
import { erstelleStartArsenal, KLASSEN, HUETER_BASIS_HP, ATEM_PRO_ZUG } from '../data.js';

// --- Eichwart-Arsenal aus dem Datenkatalog (data.js, 04 §2) ------------------

const EICHWART_PASSIV = KLASSEN.eichwart.passiv.wert;
const HOECHSTWERT_ASTSCHNEIDE = 6;
const HUETER_HP = HUETER_BASIS_HP + KLASSEN.eichwart.hpMod; // = 80 (03 §1)
const MAX_ZUEGE_PRO_KAMPF = 40; // Sicherheitsnetz, in der Praxis nicht erreicht

const KAEMPFE_PRO_RUN = 9;
const GIER_ZIEL_TOP3 = 14; // rerollt, bis Top-3-Schaden-Summe dieses Ziel erreicht

const baueEichwartArsenal = () => erstelleStartArsenal('eichwart');

// --- Region-1-Gegner (03 §7 Hinweis) ----------------------------------------

const REGION1_NORMAL_HP = [30, 45];
const REGION1_ELITE_MIX_HP = [50, 65];
const REGION1_SCHADEN = [6, 8];
const ELITE_MIX_ANTEIL = 0.2;

const SCHWIERIGKEITEN = {
  moderat: { schadenMult: 1.15, heilungZwischenKaempfen: 10 },
  mittel: { schadenMult: 1.3, heilungZwischenKaempfen: 8 },
};

function zufallZwischen(rng, [min, max]) {
  return min + rng.naechsteZahl() * (max - min);
}

function baueGegner(rng, schadenMult) {
  const istElite = rng.naechsteZahl() < ELITE_MIX_ANTEIL;
  const hp = istElite ? zufallZwischen(rng, REGION1_ELITE_MIX_HP) : zufallZwischen(rng, REGION1_NORMAL_HP);
  const schaden = zufallZwischen(rng, REGION1_SCHADEN) * schadenMult;
  return { hp, schaden };
}

// --- Wurf mit Schreck-Sperrung ----------------------------------------------

function wirf(wuerfel, rng) {
  const gesperrt = new Set(bestimmeGesperrteSeitenIndizes(wuerfel));
  const frei = [0, 1, 2, 3, 4, 5].filter((i) => !gesperrt.has(i));
  const index = frei[Math.floor(rng.naechsteZahl() * frei.length)];
  return wuerfel.seiten[index].wert;
}

function top3SchadenSumme(handIds, handWerte, arsenalById) {
  return handIds
    .filter((id) => arsenalById.get(id).typ === 'schaden')
    .map((id) => handWerte.get(id))
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((s, x) => s + x, 0);
}

// --- Ein Kampf innerhalb eines Runs -----------------------------------------

function simuliereKampf(policy, arsenalById, spielerHp, schadenMult, rng) {
  let ziehstapelState = kampfbeginn([...arsenalById.keys()], rng);
  const gegner = baueGegner(rng, schadenMult);
  const hpBeiKampfbeginn = spielerHp;

  let kampfState = { uebermut: 0, rerollsDiesenZug: 0 }; // Reset je Kampf (02 §2.1)
  let tischsturzImKampf = false;
  let zuege = 0;
  let zuletztGespielteIds = [];
  const gespielteImKampf = new Set();
  let ausgang = null;

  while (zuege < MAX_ZUEGE_PRO_KAMPF) {
    zuege += 1;
    kampfState.rerollsDiesenZug = 0;

    ziehstapelState = zieheHand(ziehstapelState, rng);
    const handIds = ziehstapelState.hand;
    let handWerte = new Map(handIds.map((id) => [id, wirf(arsenalById.get(id), rng)]));

    // Reroll-Phase je Politik.
    let tischsturzDiesenZug = false;
    while (top3SchadenSumme(handIds, handWerte, arsenalById) < GIER_ZIEL_TOP3) {
      if (policy === 'pflege' && kampfState.rerollsDiesenZug >= 1) break; // nur Gratis-Reroll
      if (policy === 'gier_klug') {
        const naechsteKosten = rerollKosten(kampfState.rerollsDiesenZug + 1, {});
        if (kampfState.uebermut + naechsteKosten > KIPP_PUNKT) break; // stoppt vor Tischsturz
      }
      const { state: neuerKampfState, tischsturz } = fuehreRerollAus(kampfState, {});
      kampfState = neuerKampfState;
      if (tischsturz) {
        tischsturzDiesenZug = true;
        tischsturzImKampf = true;
        break;
      }
      handWerte = new Map(handIds.map((id) => [id, wirf(arsenalById.get(id), rng)]));
    }

    if (tischsturzDiesenZug) {
      // Zug-Paket verfällt, +2 Schreck auf ganze Hand, Selbstschaden (02 §7).
      loeseTischsturzAus(handIds.map((id) => arsenalById.get(id))).forEach((w) => arsenalById.set(w.id, w));
      spielerHp -= TISCHSTURZ_SELBSTSCHADEN;
      zuletztGespielteIds = [];
    } else {
      let atemUebrig = ATEM_PRO_ZUG;

      // Pflege: 1 Atem in Beruhigung des ängstlichsten Hand-Würfels (02 §6.3).
      if (policy === 'pflege') {
        const angstWuerfel = handIds
          .map((id) => arsenalById.get(id))
          .filter((w) => schreck(w.gemuet) > 0)
          .sort((a, b) => schreck(b.gemuet) - schreck(a.gemuet))[0];
        if (angstWuerfel && atemUebrig > 0) {
          const { wuerfel: beruhigt } = beruhige(angstWuerfel);
          arsenalById.set(beruhigt.id, beruhigt);
          atemUebrig -= 1;
        }
      }

      const gespielt = handIds
        .filter((id) => arsenalById.get(id).typ === 'schaden')
        .sort((a, b) => handWerte.get(b) - handWerte.get(a))
        .slice(0, atemUebrig);
      gespielt.forEach((id) => gespielteImKampf.add(id));

      const gespielteSeiten = gespielt.map((id) => ({
        typ: 'schaden',
        effektiverWert: handWerte.get(id),
        vollmondWert: handWerte.get(id),
        hoechstwert: HOECHSTWERT_ASTSCHNEIDE,
        kraft: 0,
        passiv: EICHWART_PASSIV,
      }));

      const { schaden } = resolveZug(gespielteSeiten, { morschStapel: 0, welkStapel: 0, region: 1 });
      gegner.hp = Math.max(0, gegner.hp - schaden);
      zuletztGespielteIds = gespielt;
    }

    if (gegner.hp <= 0) {
      ausgang = 'sieg';
    } else {
      spielerHp -= gegner.schaden;
      if (spielerHp <= 0) ausgang = 'niederlage';
    }

    ziehstapelState = zugende(ziehstapelState);
    if (ausgang) break;
  }
  if (!ausgang) ausgang = 'niederlage';

  // Kampfende: erst Sauberer-Sieg (+1 nur auf im Kampf gespielte Würfel),
  // dann Kristallisation des Rest-Übermuts (02 §2.5/§7.3).
  const sauberSieg = ausgang === 'sieg' && !tischsturzImKampf && spielerHp === hpBeiKampfbeginn;
  const gespielteWuerfel = [...gespielteImKampf].map((id) => arsenalById.get(id));
  verarbeiteKampfende({
    sauberSieg,
    gespielteWuerfelGesamt: gespielteWuerfel,
    zuletztGespielteIds,
    uebermutRest: kampfState.uebermut,
  }).forEach((w) => arsenalById.set(w.id, w));

  return { sieg: ausgang === 'sieg', zuege, spielerHp };
}

// --- Ein Run = Kampf-Sequenz mit Heilung dazwischen -------------------------

function simuliereRun(policy, stufe, rng) {
  const { schadenMult, heilungZwischenKaempfen } = SCHWIERIGKEITEN[stufe];
  const arsenalById = new Map(baueEichwartArsenal().map((w) => [w.id, w]));
  let spielerHp = HUETER_HP;
  let zuegeSumme = 0;
  let kaempfe = 0;

  for (let kampf = 0; kampf < KAEMPFE_PRO_RUN; kampf += 1) {
    const { sieg, zuege, spielerHp: hpNach } = simuliereKampf(policy, arsenalById, spielerHp, schadenMult, rng);
    zuegeSumme += zuege;
    kaempfe += 1;
    if (!sieg) {
      return { sieg: false, arsenalById, zuegeProKampf: zuegeSumme / kaempfe };
    }
    spielerHp = Math.min(HUETER_HP, hpNach + heilungZwischenKaempfen);
  }
  return { sieg: true, arsenalById, zuegeProKampf: zuegeSumme / kaempfe };
}

// --- Aggregation & Bericht ---------------------------------------------------

function simuliere(policy, stufe, n, rng) {
  let siege = 0;
  let schreckSumme = 0;
  let zuegeSumme = 0;
  for (let i = 0; i < n; i += 1) {
    const { sieg, arsenalById, zuegeProKampf } = simuliereRun(policy, stufe, rng);
    if (sieg) siege += 1;
    schreckSumme += [...arsenalById.values()].reduce((s, w) => s + schreck(w.gemuet), 0);
    zuegeSumme += zuegeProKampf;
  }
  return {
    siegrate: (siege / n) * 100,
    schreckArsenal: schreckSumme / n, // Σ Schreck über das Arsenal am Run-Ende, Ø über Trials
    zuegeProKampf: zuegeSumme / n,
  };
}

const N = 5000;
const POLICIES = ['gier_blind', 'gier_klug', 'pflege'];
const POLICY_LABEL = { gier_blind: 'Gier (blind)', gier_klug: 'Gier (klug)', pflege: 'Pflege' };

function main() {
  const rng = new RNG(20260703);
  console.log(`Würfelhain — Gier vs. Pflege, 12er-Arsenal-Re-Run`);
  console.log(`Run = ${KAEMPFE_PRO_RUN} Kämpfe, n=${N} Runs je Politik/Stufe\n`);

  for (const stufe of Object.keys(SCHWIERIGKEITEN)) {
    const { schadenMult, heilungZwischenKaempfen } = SCHWIERIGKEITEN[stufe];
    console.log(`## ${stufe} (Gegner-Schaden ×${schadenMult}, Heilung +${heilungZwischenKaempfen}/Kampf)`);
    console.log('Politik        | Siegrate | Ø-Schreck Σ/Arsenal | Ø-Züge/Kampf');
    console.log('---------------|----------|---------------------|-------------');
    for (const policy of POLICIES) {
      const { siegrate, schreckArsenal, zuegeProKampf } = simuliere(policy, stufe, N, rng);
      console.log(
        `${POLICY_LABEL[policy].padEnd(14)} | ${siegrate.toFixed(1).padStart(7)}% | ${schreckArsenal
          .toFixed(1)
          .padStart(19)} | ${zuegeProKampf.toFixed(2).padStart(12)}`
      );
    }
    console.log('');
  }
}

main();
