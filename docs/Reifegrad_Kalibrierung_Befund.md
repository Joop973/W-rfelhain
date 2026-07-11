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

Unverändert *(Stand C4 — Stufen 1/2/9 seit E6 überholt, s. §5)*: Elite-HP +10 % (1), Start-Schreck 1 (2), Schmiede +20 % (4), Tischsturz +2 (7), Status-Zuschlag (8), Fluch-Näherung Schreck 2 (9).

## 3. Bekannte Verzerrungen (bewusst offen)

- **Stufe 8 ist in Region 1 wirkungslos** (kein Gegner legt Status). Sobald Regionen 2+ (D1) Status-legende Gegner bringen, greift der Zuschlag — Stufen 8–10 werden dann härter; die leichte Milde bei 9/10 ist dafür Headroom.
- **Stufe 9 ist eine Näherung** (+2 Schreck auf 1 Würfel im Event-Stil), bis das Fluch-System steht (Etappe D). *Seit E6 erledigt: echter Fluch, s. §5.*
- Die Standard-Politik passt ihr Spiel nicht an die Stufe an (kein vorsichtigeres Blocken bei 3+) — menschliche Spieler flachen die Kurve zusätzlich ab.
- Endgültige Sperrung der Werte gehört zu Balance-Tor 3 (D8), wenn der volle Run gemessen wird.

## 4. System-Anbindung

- `run.reifegrad` wählbar vor Run-Start (UI-Picker, nur bis `meta.maxReifegrad`).
- **Ascension-Kette:** Sieg auf Stufe N schaltet N+1 frei (Cap 10), gespeichert in `meta.maxReifegrad`.
- Rodbauer-Freischalt-Bedingung (06 §7) liest jetzt den real erreichten `maxReifegrad`.

## 5. Nachtrag E6 (2026-07-11): RG-1/2-Nachschärfung + echter RG-9-Fluch

Voll-Run-Nachmessung (sim/vollrun.js, Standard-Politik) zeigte die frühen
Stufen als unfühlbar: **RG 1 = 70,8 % · RG 2 = 71,1 % — im Rauschen ÜBER
RG 0 (70,4 %)** (je n=1000). Änderungen:

| Stufe | vorher | nachher (E6) | Begründung |
|---|---|---|---|
| 1 | Elite-HP +10 % | **+25 %** | trifft gezielt die Segen-Jagd (Elite = garantiertes Segen-Angebot) |
| 2 | Start-Schreck 1 | **2** | erzwingt frühe Pflege statt sie nur anzudeuten |
| 9 | Näherung +2 Schreck | **echter Fluch** (tote Fluch-Seite, fluch.js) | Fluch-System steht seit E6; die tote Seite ist milder als 2 Schreck — gab RG 10 Luft |

Nachmessung: RG 2 = 69,6 % (< RG 0 ✓) · RG 3 = 63,5 % · **RG 0 = 68,8 % ·
RG 10 = 25,2 %** (n=2000, Bänder halten) · Gier 5,9 %/0,3 % auf RG 0/10.

**Bekannte Grenze:** RG 1 bleibt in der Sim unsichtbar, weil die Politik
Elites meidet (PRÄFERENZ-Reihenfolge) — kein Karten-Pfad erzwingt Elite.
Für Spieler, die Elites für Segen jagen, ist +25 % fühlbar; echte Messung
bräuchte eine Elite-suchende Politik (bei Bedarf in E3-Beta prüfen).

**Nebenbefund (04 §5-Lawinen-Check):** Doppelschlag als GRATIS-Belohnungs-
Gravur hob RG 0 auf 71,3 % (n=4000; ohne 68,8 %) — zwei volle Schaden-
Teil-Seiten + Selbst-Gleichklang auf der schwächsten Seite sind die
effizienteste Gravur des Spiels. Konsequenz: Doppelschlag ist NUR noch in
der Schmiede erhältlich (belohnung.js `NUR_SCHMIEDE_GRAVUREN`), Preise
40/55/70 [PROVISORISCH]; Bruchstelle bleibt in der Belohnungs-Ziehung.
