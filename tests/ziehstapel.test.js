import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../rng.js';
import { kampfbeginn, zieheHand, zugende, pruefeInvariante } from '../ziehstapel.js';

const ARSENAL_12 = Array.from({ length: 12 }, (_, i) => `w${i}`);

test('Rotation über das 12er-Deck: alle Würfel werden über mehrere Züge gezogen', () => {
  const rng = new RNG(42);
  let state = kampfbeginn(ARSENAL_12, rng);
  const gesehen = new Set();

  for (let zug = 0; zug < 6; zug += 1) {
    state = zieheHand(state, rng);
    assert.equal(state.hand.length, 5); // Arsenal (12) ≥ Handgröße, nie kleiner
    state.hand.forEach((id) => gesehen.add(id));
    state = zugende(state);
  }

  assert.equal(gesehen.size, 12); // nach 6×5=30 Ziehungen wurde jeder Würfel mind. einmal gesehen
});

test('Reshuffle-Timing: Rest zuerst ziehen, dann Ablage mischen, dann auffüllen — keine Duplikate', () => {
  const rng = new RNG(7);
  // Ziehstapel hat nur noch 3, Ablage trägt die restlichen 9 — Handgröße 5 erzwingt Reshuffle.
  const state = {
    ziehstapel: ['a', 'b', 'c'],
    hand: [],
    ablage: ['d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
  };

  const nach = zieheHand(state, rng);

  assert.equal(nach.hand.length, 5);
  assert.equal(new Set(nach.hand).size, 5); // kein Würfel doppelt in einer Hand (02 §2.6)
  // Der komplette Rest des alten Ziehstapels (a,b,c) muss in der Hand stecken.
  assert.ok(['a', 'b', 'c'].every((id) => nach.hand.includes(id)));
  assert.equal(nach.ablage.length, 0); // Ablage wurde vollständig ins Ziehstapel gemischt
  assert.equal(nach.ziehstapel.length, 7); // 9 gemischt − 2 für die Hand nachgezogen
});

test('Invariante hält über Kampfbeginn, mehrere Zug-Zyklen und Arsenal < Handgröße', () => {
  const rng = new RNG(1234);
  let state = kampfbeginn(ARSENAL_12, rng);
  assert.ok(pruefeInvariante(state, ARSENAL_12));

  for (let zug = 0; zug < 8; zug += 1) {
    state = zieheHand(state, rng);
    assert.ok(pruefeInvariante(state, ARSENAL_12));
    state = zugende(state);
    assert.ok(pruefeInvariante(state, ARSENAL_12));
  }

  // Arsenal < Handgröße (02 §2.6): Hand endet kleiner, kein Fehler, Invariante bleibt gültig.
  const kleinesArsenal = ['x', 'y', 'z'];
  let kleinerState = kampfbeginn(kleinesArsenal, rng);
  kleinerState = zieheHand(kleinerState, rng);
  assert.equal(kleinerState.hand.length, 3);
  assert.ok(pruefeInvariante(kleinerState, kleinesArsenal));
});
