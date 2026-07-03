// ziehstapel.js — Kampf-State für Ziehstapel/Hand/Ablage (02 §2, StS-Stil).
// DOM-frei, reine Funktionen. Operiert nur auf Würfel-IDs (nicht auf Würfel-Objekten) —
// Gemüt/Schreck haften am Würfel selbst (Arsenal), nicht an der Zone (02 §2.6); da diese
// Funktionen nie ein Würfel-Objekt anfassen, ist das strukturell garantiert.
// Kein Save-Bezug: Ziehstapel/Hand/Ablage sind rein kampf-lokal (02 §2.5, 09 §3.1).

export const HANDGROESSE = 5;

function mischeFisherYates(ids, rng) {
  const kopie = [...ids];
  for (let i = kopie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng.naechsteZahl() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

// Kampfbeginn: gesamtes Arsenal mischen → Ziehstapel, Hand/Ablage leer (02 §2.1).
export function kampfbeginn(arsenalIds, rng) {
  return {
    ziehstapel: mischeFisherYates(arsenalIds, rng),
    hand: [],
    ablage: [],
  };
}

// Zieht die Hand für einen neuen Zug: Rest des Ziehstapels zuerst, bei Bedarf
// Ablage vor dem Weiterziehen neu mischen, dann auf Handgröße auffüllen
// (02 §2.2/§2.6). Ist das gesamte Arsenal kleiner als die Handgröße, endet die
// Hand entsprechend kleiner — kein Fehler.
export function zieheHand(state, rng, handgroesse = HANDGROESSE) {
  let ziehstapel = [...state.ziehstapel];
  let ablage = [...state.ablage];
  const hand = [];

  while (hand.length < handgroesse) {
    if (ziehstapel.length === 0) {
      if (ablage.length === 0) break; // Arsenal < Handgröße (02 §2.6) — nichts mehr zu ziehen
      ziehstapel = mischeFisherYates(ablage, rng);
      ablage = [];
    }
    hand.push(ziehstapel.pop());
  }

  return { ziehstapel, hand, ablage };
}

// Zugende: die gesamte Hand (gespielt wie ungespielt) wandert auf die Ablage,
// kein Behalten/Auffüllen (02 §2.2).
export function zugende(state) {
  return {
    ziehstapel: state.ziehstapel,
    hand: [],
    ablage: [...state.ablage, ...state.hand],
  };
}

// Invariante: Ziehstapel/Hand/Ablage sind paarweise disjunkt, ihre Vereinigung
// entspricht exakt dem Arsenal — keine Verluste, keine Duplikate.
export function pruefeInvariante(state, arsenalIds) {
  const alle = [...state.ziehstapel, ...state.hand, ...state.ablage];
  const alleSet = new Set(alle);
  if (alle.length !== alleSet.size) return false; // Duplikat irgendwo im Kampf-State
  const arsenalSet = new Set(arsenalIds);
  if (alleSet.size !== arsenalSet.size) return false;
  for (const id of arsenalSet) {
    if (!alleSet.has(id)) return false;
  }
  return true;
}
