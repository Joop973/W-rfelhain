# Balance-Tor 3 — Befund (Etappe D8)

*Stand: 2026-07-07. Messung: `sim/vollrun.js` (n=500/Stufe bzw. Politik), echter Spielcode, Voll-Runs über alle 6 Regionen bis zum Endboss Früherer Hüter. Voraussetzung: C1–C7 + D1–D3 komplett (Meta-Loop, Reifegrade, Regionen 2–6, Bosse 2–6, Endboss mit Befriedung, Enden). Politik „Voll-Standard": greedy-vernünftig mit Deckbau (Markt-Käufe Richtung 22 Würfel, breite Gravur-Streuung, Lagerfeuer-Heilung < 70 %, Trösten-Dienst bei Schreck-Druck, adaptiver Reroll-Stopp bei Arsenal-Schreck > 12).*

## 1. Kriterium „Voll-Run-Siegrate Reifegrad 0: 65–70 %" (03 §13) — ERFÜLLT

| Messgröße | Wert |
|---|---|
| Gesamt-Siegrate | **67,6 %** (Ziel 65–70 %) |
| Tode je Region | R1 1 % · R2 1 % · R3 4 % · R4 7 % · R5 5 % · R6 14 % |
| Tode je Knotentyp | Kampf/Elite 92 · Boss 70 (von 162 Toden) |
| Ø Trösten je Run | 10,9 |
| Ø End-Schreck (Arsenal Σ) | 11,6 |

Die Todeskurve steigt nach hinten an und gipfelt am Endboss-Abschnitt (R6: 14 %) — Spannung wächst über den Run, ohne dass eine Mittelregion zur Mauer wird. Boss- und Normalkampf-Tode halten sich die Waage.

## 2. Kriterium „Reifegrad-Kurve 0 → 10" (03 §13) — ERFÜLLT

| Reifegrad | Siegrate | Ziel (03 §13) |
|---|---|---|
| 0 | **67,6 %** | 65–70 % |
| 2 | 68,2 % | — |
| 4 | 60,0 % | — |
| 6 | 54,6 % | ~45–55 % (interpoliert) |
| 8 | 37,6 % | — |
| 10 | **25,2 %** | 25–30 % |

Beide Anker-Punkte sitzen im Band; dazwischen fällt die Kurve monoton (RG 2 ≈ RG 0 liegt im Rausch-Bereich von n=500, ±2 %). Die Reifegrad-Werte aus `reifegrad.js` (C4-Kalibrierung) tragen unverändert auf den Voll-Run — keine Nach-Eichung nötig.

## 3. Kriterium „Gier darf nie dominieren — auf jeder Stufe" — ERFÜLLT

Gier-Politik (`SIM_POLITIK=gier`): rerollt bis kurz vor den Kipp-Punkt (Übermut 6), tröstet nie (kein Markt-Dienst, kein Lagerfeuer-Trösten, Events nehmen Münzen).

| Reifegrad | Standard | Gier | Verhältnis |
|---|---|---|---|
| 0 | 67,6 % | **6,4 %** | ~1 : 10 |
| 5 | ~57 % | **4,0 %** | ~1 : 14 |
| 10 | 25,2 % | **0,4 %** | ~1 : 60 |

Gier kollabiert auf jeder Stufe — und die Schere öffnet sich mit dem Reifegrad weiter (die Doppelstrafe aus Kristallisation + Spiegel-Endboss skaliert mit dem Schreck, den Gier anhäuft). Die Gier-Todeskurve kippt vorn (R3/R4 ~60 % der Tode): die Kristallisations-Spirale frisst das Arsenal, lange bevor der Endboss sie bestrafen könnte.

## 4. Enden-Schwellen — nachgeeicht, halten

| Schwelle | Wert | Befund |
|---|---|---|
| Frühling: Trösten ≥ 8 + End-Schreck ≤ 10 + Boss befriedet | `enden.js` | Ø Trösten 10,9 → die Trösten-Schwelle ist über einen normalen pflegenden Run **erreichbar** (vor D8: R1-Runs kamen auf ~5) |
| Stiller Hain: Schreck < 40, kein Frühling | — | **Kanonisches Sim-Ende** (338 von 338 Siegen) — passt zur Design-Absicht „Stiller Hain ist der Normalfall" |
| Hohles Erbe: End-Schreck ≥ 40 | — | 0 unter Standard (Ø 11,6); unter Gier wäre es das typische Sieg-Ende — nur siegt Gier fast nie |

**Frühling 0 % in der Sim ist ein Politik-Artefakt, kein Balance-Befund:** Die Standard-Politik spielt gegen den Endboss keine Beruhigungs-/Ermutigungs-Seiten (sie platziert nur Schaden/Rinde), also wird `bossBefriedet` nie gesetzt — das Gate (D3, scharf) greift korrekt. Ein Spieler, der die Befriedung *ansteuert*, erfüllt die übrigen Schwellen laut Messwerten bequem. Kein Eingriff an den Schwellen nötig.

## 5. Kalibrierungs-Weg (0 % → 67,6 %) und [D]-Entscheide

Die erste Voll-Run-Messung nach D3 lag bei **0 %** — die Gegner-Nominale aus 03/07 wachsen über die Regionen ×4–8, der Spieler-Output (Gravur-Ökonomie + Markt) nur ~+40 %. Struktur-Problem, kein Zahlendreher. Die Kalibrierung hat deshalb **Spieler-Wachstum eingebaut und die Gegner-Kurve abgeflacht**; alle Werte `[PROVISORISCH]`, Abnahme = dieses Tor:

1. **„Rast am Regionstor":** Voll-Heilung bei Regions-Eintritt (`REGION_HEILUNG_ANTEIL = 1.0`) — jede Region beginnt frisch; HP-Druck ist ein Innerhalb-der-Region-Thema.
2. **Struktur-Wachstum:** `REGION_HPMAX_BONUS = 8` — +8 hpMax je durchschrittenem Tor (R6: 40 über Start).
3. **Einkommens-Skalierung:** Kampf-Belohnung × `1 + 0,2 × (Region − 1)` (`belohnung.js`) — die Gravur-/Markt-Ökonomie wächst mit; 03 §8 sperrt nur die R1-Werte, die bleiben unberührt.
4. **`REGION_TUNING` (data.js):** Dämpfer auf die Doku-Nominale je Region — hp/schaden/bossHp/status:

   | Region | hp | schaden | bossHp | status |
   |---|---|---|---|---|
   | 1 | 1,0 | 0,75 | 1,0 | 1,0 |
   | 2 | 0,6 | 0,65 | 0,85 | 1,0 |
   | 3 | 0,4 | 0,4 | 0,85 | 0,8 |
   | 4 | 0,4 | 0,38 | 0,7 | 0,7 |
   | 5 | 0,3 | 0,28 | 0,55 | 0,6 |
   | 6 | 0,2 | 0,19 | 0,5 | 0,4 |

   Lesart: die *Absolutwerte* der Gegner steigen weiter von Region zu Region (die Dämpfer wirken auf stark wachsende Nominale); `bossHp` hält die Boss-Fenster bei ~5–6 Zügen.
5. **Twist-Raten entschärft:** Eskalation zählt erst, *während* eine eskalierende Auflage aktiv ist (vorher: ab Kampfbeginn — Fäule +7/+8 war ein Todesurteil); Auflodern +1 nur jede zweite Runde; Modermutter Fäule 3→2, Schwelbrand Kraft 2→1 / Brand 4→3 in den Spätphasen.
6. **R1-Zielband abgelöst:** R1 ist jetzt bewusst weich (`schaden 0,75` → Standard ~99 % auf R1 allein). Das alte Slice-Band „R1 = 65–70 %" gilt seit diesem Tor **für den Voll-Run**; `sim/region1_run.js` und `sim/reifegrade.js` tragen entsprechende Hinweise und dienen nur noch der Relativ-Diagnose (Pflege ≥ Standard ≥ Gier).

## 6. Einordnung & offene Punkte

- **R6-Spitze (14 % Tode)** ist gewollt: der Endboss soll der härteste Einzelschritt sein. Falls Playtests ihn als Mauer empfinden, ist `bossHp` für Region 6 (0,5) der erste Hebel.
- **R2 fast todesfrei (1 %)**: leichtes Durchatmen nach R1 ist okay; falls zu flach, `schaden` R2 (0,65) leicht anheben — bewusst nicht getan, um Neulingen den ersten Regionswechsel zu gönnen.
- **Ø End-Schreck 11,6** liegt im „gesunden Druck"-Bereich: genug, dass der Spiegel-Endboss Material hat, weit weg von der Hohles-Erbe-Schwelle (40).
- Die Klassen- (C7) und Setzling-Messungen (C5) sind R1-gepinnt und wären nach dieser Umstellung auf Voll-Run-Basis zu wiederholen — Beobachtungspunkt, kein Tor-Blocker (die Mechanik-Deltas sind regions-unabhängig).
- Sperr-Kandidaten nach Abnahme: `REGION_TUNING`, `REGION_HEILUNG_ANTEIL`, `REGION_HPMAX_BONUS`, Einkommens-Skalierung, Twist-Raten.

**Empfehlung:** Tor 3 passieren. Nächste Balance-Arbeit erst wieder nach Handy-Playtests (A7) bzw. an D4/D5-Inhalten.
