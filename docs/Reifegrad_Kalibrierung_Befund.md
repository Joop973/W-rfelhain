# Reifegrad-Kalibrierung — Befund (Etappe C4)

*Stand: 2026-07-06. Messung: `sim/reifegrade.js` (Standard-Politik, n=2000/Stufe, Region-1-Karten-Runs). Zielkurve: 03 §13.*

## 1. Ergebnis (nachgeeichte Werte, `reifegrad.js` REIFEGRAD_WERTE)

| Stufe | Siegrate | Ziel (03 §13) |
|---|---|---|
| 0 | 68,5 % | 65–70 % ✓ |
| 1 | 66,4 % | |
| 2 | 67,5 % | |
| 3 | 61,1 % | ~55 % (leicht mild) |
| 4 | 58,3 % | |
| 5 | 51,0 % | |
| 6 | 46,6 % | ~45 % ✓ |
| 7 | 48,5 % | |
| 8 | 45,1 % | |
| 9 | 40,9 % | ~35 % (leicht mild) |
| 10 | 32,7 % | 25–30 % (knapp drüber) |

## 2. Abweichungen von den 03-§9-Nennwerten

Die Nennwerte kippten die Kurve weit unter Ziel (Stufe 3: 46,5 % statt ~55; Stufe 5: 23,7 %; Stufe 10: 3,5 % statt 25–30) — Region 1 ist auf 65–70 % messerscharf kalibriert und reagiert extrem empfindlich auf flache Gegner-Buffs. Nachgeeicht `[PROVISORISCH]`:

| Stufe | Nennwert (03 §9) | Nachgeeicht | Begründung |
|---|---|---|---|
| 3 | Gegner-Schaden +10 % (alle) | +10 % **nur Elite/Boss** | +1 Schaden auf jeden Normalgegner-Hit = −21 pp allein |
| 5 | Boss-HP +15 % | **+10 % → +5 %** | Boss-HP ist der schärfste Hebel (−20 pp bei +10 %) |
| 6 | Heilung −25 % | **−10 %** | trifft Lagerfeuer UND Labung (multiplikativ mit 5) |
| 10 | Gegner-HP +10 % | **+3 %** | kumuliert auf 9 Vorstufen |

Unverändert: Elite-HP +10 % (1), Start-Schreck 1 (2), Schmiede +20 % (4), Tischsturz +2 (7), Status-Zuschlag (8), Fluch-Näherung Schreck 2 (9).

## 3. Bekannte Verzerrungen (bewusst offen)

- **Stufe 8 ist in Region 1 wirkungslos** (kein Gegner legt Status). Sobald Regionen 2+ (D1) Status-legende Gegner bringen, greift der Zuschlag — Stufen 8–10 werden dann härter; die leichte Milde bei 9/10 ist dafür Headroom.
- **Stufe 9 ist eine Näherung** (+2 Schreck auf 1 Würfel im Event-Stil), bis das Fluch-System steht (Etappe D).
- Die Standard-Politik passt ihr Spiel nicht an die Stufe an (kein vorsichtigeres Blocken bei 3+) — menschliche Spieler flachen die Kurve zusätzlich ab.
- Endgültige Sperrung der Werte gehört zu Balance-Tor 3 (D8), wenn der volle Run gemessen wird.

## 4. System-Anbindung

- `run.reifegrad` wählbar vor Run-Start (UI-Picker, nur bis `meta.maxReifegrad`).
- **Ascension-Kette:** Sieg auf Stufe N schaltet N+1 frei (Cap 10), gespeichert in `meta.maxReifegrad`.
- Rodbauer-Freischalt-Bedingung (06 §7) liest jetzt den real erreichten `maxReifegrad`.
