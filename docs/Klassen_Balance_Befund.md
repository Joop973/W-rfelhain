# Klassen-Balance — Befund (Etappe C7)

*Stand: 2026-07-06. Messung: `sim/klassen.js` — Korridor: 4000 Züge/Klasse gegen Block-losen Dummy (Start-Arsenal, Top-Atem-Platzierung, Glöckner mit Match-Platzierung); Runs: n=1500 je Klasse × Politik über Region-1-Karten-Runs. Referenz: 06 §8.*

## 1. Messung A — Roh-Korridor (Ziel ~15–17, 06 §8)

| Klasse | Ø Schaden/Zug | Soll (06 §8) | Einordnung |
|---|---|---|---|
| Eichwart | 18,4 | 16,5 (Anker) | +12 % über Papierwert — der **Top-3-aus-Hand-Selektionseffekt**, den die 06-Rechnung (Ø-Seitenwerte) nicht kennt. Betrifft alle Klassen. |
| Dorfschamane | 16,7 | 16,5 bei Gemüt ≥ 0 | ✓ (7/12-Floor-Dip drückt trotz Selektion) |
| Glöckner | 16,5 | 11,5–19 je Match | ✓ mitten in der Spanne |
| Schleiferin | 19,2 | 16 | leicht drüber (hohe Wetzklinge-Seiten + Selektion + Sockel) |
| **Rodbauer** | **28,9** | ~19,5 (über Decke) | **+48 % über Papierwert** — 12/12 Schaden-Anteil maximiert den Selektionseffekt (immer 5 Kandidaten für 3 Slots, Wildzahn-6er-Spitzen) |

## 2. Messung B — Region-1-Runs

| Klasse | Standard | Pflege | Ø-Schreck (Std.) | Befund |
|---|---|---|---|---|
| Eichwart | 66,5 % | 92,1 % | 12,5 | Anker ✓ |
| Dorfschamane | **4,1 %** | 62,6 % | 10,4 | s. §3.2 |
| Glöckner | **32,3 %** | 57,1 % | 10,3 | s. §3.3 |
| Schleiferin | 55,9 % | 82,7 % | 5,7 | „Schwer"-Einordnung ✓ (Freilauf drückt Schreck) |
| **Rodbauer** | **93,1 %** | 98,7 % | **1,3** | s. §3.1 |

Frühling-Quote: **0 % in allen Zellen** (Ø-Trösten max 1,5) — s. §3.4.

## 3. Befunde

### 3.1 Rodbauer dominiert Region 1 (statt bestraft zu werden)
Der Gier-Pol gewinnt 93 % unter Standard mit Ø-Schreck 1,3: Bei 28,9 Output sterben Region-1-Gegner (20–45 HP) in 1–2 Zügen — **die Fragilität (65 HP, kein Block) kommt nie zum Tragen**, und ohne lange Kämpfe entsteht kein Reroll-Druck → keine Kristallisation. Die Glass-Cannon-Bestrafung ist eine Funktion der **Kampflänge**, und die liefert Region 1 nicht.
**Einordnung:** Rodbauer ist die letzte Freischaltung (12 Ringe + Bedingung); Regionen 2–6 (HP 40–320) strecken die Kämpfe genau in den Bereich, wo Fragilität und Kristallisation greifen. Ein R1-Nerf würde die Klasse an ihrem schwächsten zukünftigen Punkt kalibrieren.

### 3.2 Dorfschamane kollabiert unter der Standard-Politik (4,1 %)
Teils Politik-Artefakt: die „Top-3 ≥ 14"-Reroll-Jagd ist mit 7 Schaden-Würfeln eine Übermut-Spirale (Kristallisation → Schreck → Zuversicht-Bonus weg → noch schwächer — die designte Doppelstrafe, extrem ausgespielt). Unter Pflege (62,6 %) funktioniert er, liegt aber **~30 pp unter Eichwart-Pflege (92,1 %)** — der von 06 §3 erwartete „Sustain/Trösten-Vorsprung" existiert in Region 1 nicht (Trösten-Quellen zu knapp, §3.4). Der Floor-Dip ist real teurer als auf dem Papier.

### 3.3 Glöckner deutlich unter Anker (32,3 % Standard)
Korridor stimmt im Mittel (16,5), aber die **Varianz** kostet: Züge ohne Match (~11,5 roh) verlängern Kämpfe, und Widerhall +3 kompensiert nur die guten Züge. −34 pp gegenüber Eichwart ist mehr als „Mittel–Schwer" rechtfertigt.

### 3.4 Frühling ist in Region 1 unerreichbar
Ø-Trösten 1,5 unter konsequenter Pflege (Tau 6 = 2 Markt-Dienste, +1 Lagerfeuer, seltene Events) gegen Schwelle ≥ 8. Kein Trivialisierungs-Problem (der 01-§5-Ermutigungs-Ausschluss wirkt — Dorfschamane erreicht trotz Ermutigungs-Kit 0 % Frühling ✓), sondern das Gegenteil: **im Ein-Regionen-Slice ist der Rodbauer-Frühling-Pfad faktisch tot** (nur Reifegrad 3 bleibt). Über 6 Regionen (6 Tau je Region) ist ≥ 8 plausibel — endgültige Eichung gehört zu Balance-Tor 3. Bestätigt die offene [D]-Frage „Tau-Knappheit" (03 §12.1).

## 4. Entscheidungsvorlage [D]

1. **Rodbauer:** beobachten bis Tor 3 (R2+ bestraft strukturell) **oder** jetzt zähmen (Wildzahn 6,6,6-Spitze bzw. Passiv +3 → +2)?
2. **Glöckner/Dorfschamane:** jetzt nachschärfen (z. B. Widerhall +3 → +5; Dorfschamane +1 Borkenschild statt Astschneide im Start-Arsenal) **oder** bis zur Region-2-Kalibrierung stehen lassen?
3. **Frühling-Schwelle:** bleibt ≥ 8 (voller Run eicht) — Empfehlung: nicht am Slice kalibrieren.

**Empfehlung Claude:** Rodbauer beobachten (1a), Glöckner/Dorfschamane minimal nachschärfen (2a — beide fühlen sich sonst JETZT schlecht an, und die Maßnahmen sind klein und rückbaubar), Frühling unangetastet (3).
