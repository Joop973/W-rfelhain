// segen.js — Hain-Segen: Besitz, Ziehung, Erwerbs-Effekte, Abfrage-Helfer (07 §4).
// DOM-frei. Segen sind run-lange passive Modifikatoren (Relikt-Stil); die
// laufenden Effekte/Haken werten kampf.js/belohnung.js/knoten.js über die
// Helfer hier aus. Gezogene Segen sind einmalig je Run (07 §4.3).

import { HAIN_SEGEN } from './data.js';

const SELTENHEITS_GEWICHT = { haeufig: 6, selten: 3, episch: 1 }; // wie Blaupausen [PROVISORISCH]

export function hatSegen(run, segenId) {
  return (run.hainSegen ?? []).includes(segenId);
}

// Liefert das Effekt-Objekt eines besessenen Segens mit diesem Effekt-Typ (oder null).
export function segenEffekt(run, effektTyp) {
  for (const id of run.hainSegen ?? []) {
    const s = HAIN_SEGEN[id];
    if (s?.effekt?.typ === effektTyp) return s.effekt;
  }
  return null;
}

// Alle Effekt-Objekte dieses Typs — für stapelbare Effekte (z. B. Kampfbeginn-
// Wetzung aus Wetzstein UND Doppelter Morgen, 07 §4.2 #5/#11).
export function segenEffekte(run, effektTyp) {
  return (run.hainSegen ?? [])
    .map((id) => HAIN_SEGEN[id]?.effekt)
    .filter((e) => e?.typ === effektTyp);
}

// Liefert das Haken-Objekt eines besessenen Segens mit diesem Haken-Typ (oder null).
export function segenHaken(run, hakenTyp) {
  for (const id of run.hainSegen ?? []) {
    const s = HAIN_SEGEN[id];
    if (s?.hatHaken && s.haken?.typ === hakenTyp) return s.haken;
  }
  return null;
}

// Klarer Quell: Trösten gibt +3 statt +2 (universell, 07 §4.2 #10).
export function troestenBonus(run) {
  return segenEffekt(run, 'troesten_gemuet') ? 1 : 0;
}

// Gewichtete Ziehung eines noch nicht besessenen Segens. Boss-Seltenheit nur
// auf Anforderung (Boss-Sonder-Belohnung, 07 §4.3); null wenn Pool leer.
export function zieheSegenOption(run, rng, { nurBoss = false } = {}) {
  const kandidaten = Object.values(HAIN_SEGEN).filter(
    (s) => !hatSegen(run, s.id) && (nurBoss ? s.seltenheit === 'boss' : s.seltenheit !== 'boss')
  );
  if (kandidaten.length === 0) return null;
  const summe = kandidaten.reduce((s, k) => s + (SELTENHEITS_GEWICHT[k.seltenheit] ?? 1), 0);
  let rest = rng.naechsteZahl() * summe;
  let gewaehlt = kandidaten[kandidaten.length - 1];
  for (const k of kandidaten) {
    rest -= SELTENHEITS_GEWICHT[k.seltenheit] ?? 1;
    if (rest < 0) {
      gewaehlt = k;
      break;
    }
  }
  return { typ: 'segen', segenId: gewaehlt.id, textKey: gewaehlt.textKey, hakenTextKey: gewaehlt.hakenTextKey };
}

// Nimmt einen Segen auf und wendet Erwerbs-Sofort-Effekte an. "je Region"-
// Effekte (Tau/Welk-Grad) greifen einmalig sofort für die laufende Region und
// danach bei jedem Region-Eintritt (tauBeiRegionEintritt). [PROVISORISCH]
export function gibSegen(run, segenId) {
  if (hatSegen(run, segenId)) return { ok: false, grund: 'doppelt' };
  const s = HAIN_SEGEN[segenId];
  if (!s) return { ok: false, grund: 'unbekannt' };
  run.hainSegen = [...(run.hainSegen ?? []), segenId];

  if (s.effekt.typ === 'tau_einkommen') run.waehrungen.tau += s.effekt.wert;
  if (s.haken?.typ === 'tau_einkommen') run.waehrungen.tau = Math.max(0, run.waehrungen.tau + s.haken.wert);
  if (s.haken?.typ === 'max_hp') {
    run.hpMax += s.haken.wert; // Hamsterherz: −5 Max-HP
    run.hp = Math.min(run.hp, run.hpMax);
  }
  if (s.haken?.typ === 'welk_grad_pro_region') {
    run.welkGrad = (run.welkGrad ?? 0) + s.haken.wert; // Dürre-Same (09 §2.10, rein visuell)
  }
  return { ok: true, segen: s };
}

// Tau-Zufluss bei Region-Eintritt: Basis + Morgentau-Krug − Klarer-Quell-Haken (03 §8, 07 §4.2).
export function tauBeiRegionEintritt(run, basis) {
  let tau = basis;
  const bonus = segenEffekt(run, 'tau_einkommen');
  if (bonus?.je === 'region') tau += bonus.wert;
  const haken = segenHaken(run, 'tau_einkommen');
  if (haken?.je === 'region') tau += haken.wert;
  return Math.max(0, tau);
}
