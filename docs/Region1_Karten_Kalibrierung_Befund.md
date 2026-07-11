# Würfelhain — Region-1-Nach-Eichung auf Karten-Struktur (Befund A8)

*Messlauf 2026-07-04, `sim/region1_run.js` — Monte-Carlo über den **echten Spielcode** (karte/kampf/knoten/belohnung), komplette Karten-Runs bis zum Boss. n=2000 je Politik, Seed 20260704. Etappe A8 aus `docs/10_Entwicklungsplan.md`.*

---

## 1. Anlass

Mit A3–A6 wurde aus der linearen 9-Kampf-Sequenz (mit +8 HP Auto-Heilung je Kampf) die echte Run-Struktur aus 07 §1: **~4–6 Kämpfe je Pfad, Heilung nur strukturell** (ein Lagerfeuer +30 % vor dem Boss), dafür Gravuren/Belohnungen, die den Spieler-Output heben. Die bisherigen Gegner-Werte (05 §1.2: Schaden 8–10) stammen aus der alten Struktur — der in 05 §10 als Priorität vermerkte Fall.

## 2. Messung vor der Nach-Eichung (alte Werte)

| Politik | Siegrate | Ø-Schreck Σ | Ø-Trösten | Ø-Kämpfe |
|---|---|---|---|---|
| Pflege | 99,9 % | 0,0 | 1,5 | 4,0 |
| Standard | 99,8 % | 13,7 | 0,0 | 5,7 |
| Gier (klug) | 92,4 % | 27,6 | 0,0 | 5,8 |

**Deutlich zu leicht** — die Karten-Struktur senkt die Kampf-Anzahl (weniger Attrition), Rinde-Nutzung und Belohnungs-Ökonomie heben die Spielermacht.

## 3. Härte-Sweep (Schaden-Multiplikator auf alle R1-Gegner)

| Faktor | Pflege | Standard | Gier (klug) |
|---|---|---|---|
| ×1,0 | 99,9 % | 99,8 % | 92,4 % |
| ×1,3 | 94,3 % | 75,3 % | 26,7 % |
| ×1,35 | 89,8 % | 64,3 % | 17,4 % |
| ×1,4 | 87,0 % | 56,5 % | 13,4 % |
| ×1,5 | 70,3 % | 32,3 % | 4,2 % |
| ×1,5 + HP ×1,2 | 20,8 % | 4,3 % | 0,1 % |

Der bekannte **Klippen-Nebenbefund** (03 §12.1) bestätigt sich auf Run-Ebene: zwischen ×1,3 und ×1,5 fällt Standard von 75 % auf 32 %. HP-Anhebung wirkt doppelt steil (längere Kämpfe → mehr erlittene Angriffe) und verletzt zudem den gesperrt-konsistenten Anker „Normalgegner in 2–3 Zügen tot" — **HP bleibt unverändert, nur Schaden wird angehoben.**

## 4. Gewählte Nach-Eichung `[PROVISORISCH — Endwert-Entscheid offen]`

| Gegner | Schaden alt | **Schaden neu** | HP (unverändert) |
|---|---|---|---|
| Astbeißer | 8–9 | **11–12** | 30–38 |
| Borkenkriecher | 6–8 | **8–11** | 38–45 |
| Moosgnom | 8–10 | **11–13** | 30–35 |
| Dornalter (Elite) | 9–10 | **12–13** | 60–65 |
| Saumhüter (Boss) | 9–11 | **12–14** | 110–130 |

**Ergebnis mit diesen Werten:**

| Politik | Siegrate | Ø-Schreck Σ | Ø-Trösten | Ø-Kämpfe |
|---|---|---|---|---|
| Pflege | 92,8 % | 0,0 | 1,5 | 4,0 |
| **Standard** | **70,5 %** | 12,8 | 0,0 | 5,6 |
| Gier (klug) | 21,2 % | 22,4 | 0,0 | 5,6 |

- **Standard trifft die obere Bandkante des Reifegrad-0-Ziels** (65–70 %, 03 §13) — bewusst anfängerfreundlich gewählt; die Variante Boss 12–15 landete bei 63,9 % (untere Kante), falls härter gewünscht.
- **Welle-1-Kriterium hält:** Pflege (92,8 %) ≫ Gier klug (21,2 %); Schreck akkumuliert unter Gier sichtbar, unter Pflege exakt 0.
- Umgesetzt in `data.js` (`GEGNER_VORLAGEN`, Kommentar „A8-Nach-Eichung 2026-07-04").

## 5. Einordnung & offene Entscheide

1. **Das neue Schaden-Band (8–13 normal, 12–14 Boss) liegt über der 03-§7-Kurventabelle für Region 1 (5–10).** Ursache ist strukturell: weniger Kämpfe pro Region + strukturelle Heilung = weniger Attrition, also braucht der Einzelkampf mehr Druck. **Entscheid für dich:** entweder die 03-§7-R1-Zeile im Design-Chat nachziehen (Kurve beginnt höher), oder alternativ die Heilung senken (Lagerfeuer < 30 %) und Schaden näher an der alten Kurve halten — Messwerte dafür liefere ich auf Wunsch.
2. **Pflege bei ~93 %** ist gewollt hoch (die intendierte Spielweise gewinnt), aber prüfenswert, sobald Trösten echte Opportunitätskosten hat (mehr Trösten-Senken ab Etappe B).
3. Sim-Politiken sind grob (ganze-Hand-Reroll, feste Belohnungs-Wahl); dein Handy-Playtest (A7) ist der Gegencheck fürs Spielgefühl.
4. Werte bleiben `[PROVISORISCH]` — Endwert-Sperrung liegt bei dir (Etappe-A-Abnahme).
