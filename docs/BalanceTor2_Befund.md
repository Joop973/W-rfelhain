# Balance-Tor 2 — Befund (Etappe B8)

*Stand: 2026-07-06. Messung: `sim/build_pfade.js` (n=2000/Build) + `sim/region1_run.js` (n=6000/Politik), echter Spielcode, Region-1-Karten-Runs (Karte → Knoten → Boss Saumhüter). Voraussetzung: B1–B7 komplett (Status-Set, Eigen-Status, Combos, 16 Blaupausen, Beruhigung/Ermutigung, 16 Hain-Segen, Gegner-Morsch Option A).*

## 1. Kriterium „alle Build-Pfade viable" — ERFÜLLT

Vier gezielte Builds, jeweils mit bevorzugter Belohnungs-/Schmiede-Wahl und passender Platzierungs-Politik:

| Build | Fokus | Siegrate | Ø-Schreck Σ |
|---|---|---|---|
| Wucht (Mult) | Wucht-Gravur (Stufen bis Cap 3) | **76,1 %** | 12,3 |
| Status (DoT) | Gift/Zunder/Markhärtung, Giftranke/Schwelbrand | **68,9 %** | 12,9 |
| Gleichklang | Gleichmaß-Blaupause, wertgleiche Gruppen | **76,5 %** | 12,5 |
| Pflege (Labung) | Quell/Sanftholz, Beruhigungs-/Ermutigungs-Gravur, nur Gratis-Rerolls | **91,2 %** | 0,0 |

Alle vier liegen weit über dem Gier-Referenzniveau (~20 %) und über der 50-%-Viabilitätsschwelle. Status ist der schwächste Pfad (DoT zahlt sich in kurzen Region-1-Kämpfen am wenigsten aus) — erwartbar und kein Tor-Blocker; mit längeren Kämpfen ab Region 2 steigt sein relativer Wert.

## 2. Kriterium „keine Lawine" (03 §14) — ERFÜLLT

Zug-Schaden-Verteilung über alle Züge aller Runs:

| Build | Median | p99 | Max | Lawinen-Faktor (p99/Median) |
|---|---|---|---|---|
| Wucht | 21 | 44 | 53 | 2,10 |
| Status | 21 | 44 | 64 | 2,10 |
| Gleichklang | 21 | 44 | 48 | 2,10 |
| Pflege | 20 | 44 | 48 | 2,20 |

Kein Build reißt nach oben aus: p99 ist über alle Pfade identisch (44 — der gemeinsame Deckel aus Vollmond-Burst + Top-Hand), die Faktoren liegen eng bei ~2,1 (Schwelle: ≤ 6). Die Anti-Lawinen-Bremsen (Wucht additiv je Stufe, Echo-Cap, Gleichklang ×1,75 max, Status-Caps) halten unter gezielter Ausnutzung.

## 3. Kriterium „Gier-vs-Pflege hält" — ERFÜLLT

Re-Run des Welle-1-Tors auf aktuellem Code-Stand (n=6000):

| Politik | Siegrate |
|---|---|
| Pflege | 91,6 % |
| Standard | **67,4 %** (Zielband 65–70 %, 03 §13) |
| Gier (klug) | 20,2 % |

Pflege ≥ Gier mit großem Abstand; Standard im Reifegrad-0-Zielband.

## 4. Einordnung & offene Punkte

- **Uniformer p99 (44):** Die Spitzen stammen bei allen Builds aus derselben Quelle (hohe Hand + Passiv + Vollmond/Gleichklang-Gelegenheit) — die Build-Differenzierung wirkt auf die *Konstanz* (Siegrate), nicht auf Ausreißer. Genau das will 03 §14.
- **Status-Build in R1 strukturell benachteiligt** (2–3-Züge-Kämpfe geben DoT wenig Zeit). Beobachtungspunkt für die Region-2-Kalibrierung (Moderbruch ist das Status-Thema), kein R1-Eingriff nötig.
- **Segen-Einfluss:** Builds nehmen Segen nur als Fallback (Politik greift bevorzugt Gravuren) — Segen-lastige Strategien sind hier nicht gemessen; das Segen-Gewicht (10 %) hat das Standard-Band nicht bewegt (67,4 % vor wie nach B6).
- Sperr-Kandidaten nach diesem Befund (Entscheid D, 10 „Deine Entscheide in Etappe B"): die `[PROVISORISCH]`-Werte der Gravuren/Blaupausen, Freilauf/Klemme-Verrechnung (02 §7.5), Tau-Knappheit R1 (03 §12.1).

**Empfehlung:** Tor 2 passieren. Nach-Eichung erst wieder an Region-2-Inhalten (Etappe C/D), nicht an Region 1.
