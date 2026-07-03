# Würfelhain — Welle-1-Tor Re-Run auf 12er-Arsenal (Befund)

*Messlauf 2026-07-03, `sim/gier_vs_pflege.js` (Repo-Code: rng/engine/push/ziehstapel direkt importiert — kein Sandbox-Nachbau). Ersetzt die 6er-Arsenal-Zahlen aus 03 §12.1 als Eichpunkte. Reine Messung — kein Design-Wert verändert.*

---

## 1. Setup

- **Trial = Run aus 9 Kämpfen** (Region-1-Sequenz), Heilung zwischen den Kämpfen, Gemüt/Schreck persistiert am Würfel über Kampfgrenzen. Sieg = alle 9 Kämpfe überlebt.
- **Eichwart 12er-Arsenal** (04 §2): 8× Astschneide 1–6, 4× Borkenschild 1,1,2,2,3,3, Passiv +2, HP 80. Ziehmodell aktiv (`ziehstapel.js`, 5er-Hand frisch je Zug).
- **Gegner** nach 03 §7-Hinweis: Normal 30–45 HP (~80 %), Elite-Mix 50–65 HP (~20 %), Schaden 6–8/Zug.
- **Politiken** (wie 03 §12.1): Gier blind (rerollt bis Hand-Ziel, ignoriert Übermut), Gier klug (rerollt aggressiv, stoppt vor Tischsturz-Schwelle), Pflege (nur Gratis-Reroll, 1 Atem/Zug in Beruhigung bei Schreck).
- **n = 5000 Runs** je Politik/Stufe, Seed 20260703.
- Sim-Annahmen (keine Design-Werte): Reroll = ganze Hand; Gier-Ziel Top-3-Summe ≥ 14; kein Block gespielt; Stufen-Tuning s. u.

## 2. Ergebnis

### moderat (Gegner-Schaden ×1,15, Heilung +10/Kampf)

| Politik | Siegrate | Ø-Schreck Σ/Arsenal (Run-Ende) | Ø-Züge/Kampf |
|---|---|---|---|
| Gier (blind) | 1,3 % | 81,3 | 3,39 |
| Gier (klug) | 97,4 % | 46,5 | 2,67 |
| **Pflege** | **98,5 %** | **0,0** | 2,64 |

### mittel (Gegner-Schaden ×1,3, Heilung +8/Kampf)

| Politik | Siegrate | Ø-Schreck Σ/Arsenal (Run-Ende) | Ø-Züge/Kampf |
|---|---|---|---|
| Gier (blind) | 0,8 % | 64,2 | 3,14 |
| Gier (klug) | 63,4 % | 44,7 | 2,62 |
| **Pflege** | **70,2 %** | **0,0** | 2,61 |

## 3. Lesart

- **Welle-1-Tor strukturell BESTÄTIGT auf 12er-Arsenal + Ziehmodell, jetzt im echten Repo-Code:** Pflege schlägt beide Gier-Politiken auf beiden Stufen. Schreck akkumuliert unter kluger Gier sichtbar (Σ ~45–47/Arsenal), unter Pflege bleibt er exakt 0.
- **Trennung Pflege vs. kluge Gier ist auf 12er-Basis kleiner als im 6er-Befund** (dort 96,3/71,8 bzw. 48,1/20,8): genau der in 03 §12.1 vorhergesagte Verdünnungseffekt — mehr Würfel verteilen den kristallisierten Schreck, einzelne Sperrungen treffen seltener dieselbe 5er-Hand. Die Relation bleibt, der Abstand schrumpft (~1–7 Prozentpunkte statt ~25).
- **Schreck-Anker für die Enden-Schwellen (01 §5):** kluge Gier landet bei Σ ~45–47 (statt 60–73 auf 6er), blinde Gier bei Σ ~64–81. Die provisorischen Schwellen (~10/~40 End-Schreck) liegen damit weiterhin plausibel zwischen Pflege (0) und Gier (45+); Feinjustierung bleibt Welle-4-Arbeit.
- **Nebenbefund Zielband:** die Stufe „mittel" liefert für Pflege 70,2 % — exakt am oberen Rand des Reifegrad-0-Zielbands 65–70 % (03 §13). Gegner-Schaden ×1,3 mit Heilung +8/Kampf ist damit ein brauchbarer Startpunkt für die Region-1-Kalibrierung.
- **Nebenbefund Spirale bestätigt:** blinde Gier kollabiert auf beiden Stufen (< 2 %) über die bekannte Schreck-Spirale (Tischsturz → gesperrte Top-Seiten → längere Kämpfe, Ø-Züge steigen sichtbar auf 3,1–3,4).

## 4. Konsequenz / offene Punkte

- Der Vermerk „Re-Run auf 12er-Arsenal nötig" (00 §4, 03 §12.1/§13, 09 §6) ist hiermit **erledigt** — diese Zahlen ersetzen die 6er-Werte als Eichpunkte.
- Da die Gier-vs-Pflege-Trennung auf 12er-Basis schmaler ist, lohnt für Welle 2 ein Blick darauf, ob Kristallisation 1:1 genug Druck behält, sobald Trösten-Zugang (Beruhigung/Ermutigung/Segen) breiter verfügbar wird — Messfrage, keine akute Design-Änderung.
- Feinkalibrierung ins Zielband (03 §13) kann jetzt auf dieser Basis erfolgen; „mittel" ist der nächstliegende Ausgangspunkt.
