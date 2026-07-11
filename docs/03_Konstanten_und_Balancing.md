# Würfelhain — Konstanten & Balancing (Artefakt 03)

*Eine einzige Quelle für alle tunbaren Zahlen. Gesperrte Werte aus Index 00 §3 wörtlich; alles andere `[PROVISORISCH]` — die Sim entscheidet die Endwerte.*

*Stand: 2026-07-02. Update: §1 Arsenal 6→12 `[GESPERRT-OVERRIDE]` + Ziehmodell, §2/§3 Vollmond-Präzisierung + Klassen-Sockel-Klausel, §6.1 Eigen-Status-Konstanten, §12/§13 Re-Run-Vermerk (Siegraten stammen von 6er-Läufen). Vorheriges Update: §4 Kristallisation, §12 Welle-1-Tor-Befund.*

---

## 0. Lesehinweis

- `[GESPERRT]` — durch Design/Sim bestätigt, ändert sich nur mit Begründung.
- `[PROVISORISCH]` — baubar, aber noch nicht balanciert. Standardwert zum Loslegen, Sim überschreibt.
- `[GESPERRT-OVERRIDE]` — sanktionierter Eingriff in einen vormals gesperrten Wert (Datum/Begründung in `06_Aenderungen.md`).
- Die Werte in Region-/Reifegrad-Tabellen sind Startpunkte; das Welle-1-Tor (Region 1, Reifegrad 0) ist die erste echte Eichung.

---

## 1. Kampf-Grundwerte

| Konstante | Wert | Status |
|---|---|---|
| Atem/Zug | 3 (fix, ungenutzt verfällt) | `[GESPERRT]` |
| Start-Würfel-Kosten | 1 Atem | `[GESPERRT]` |
| Handgröße | 5 Würfel | `[GESPERRT]` |
| Arsenal-Start | **12 Würfel** (vorher 6) | `[GESPERRT-OVERRIDE 2026-07-02]` |
| Arsenal-Ziel (Run-Ende) | **~22–24 Würfel** (vorher ~14) | `[PROVISORISCH]` |
| Ziehmodell | Hand je Zug **frisch aus Ziehstapel** (5), Zugende → Ablage; Reshuffle bei Zugbeginn wenn Ziehstapel < 5 (StS-Stil, 02 §2.2) | `[PROVISORISCH: Modell-Default]` |
| Hüter-Basis-HP | 75 | `[PROVISORISCH]` |
| Eichwart-HP-Mod | +5 (= 80) | `[PROVISORISCH]` |
| Block (Rinde) Verfall | je Zug, fängt keinen Status | `[GESPERRT]` |
| Ziel pro Zug | 1, kein Wechsel im Paket; `Fläche` trifft alle | `[GESPERRT]` |
| Überschuss bei Gegner-Tod | verfällt (kein Übertrag ohne Keyword) | `[GESPERRT]` |
| Pools | ≥ 0, kein Negativschaden; Mult auf leeren Pool = 0 | `[GESPERRT]` |

**Override-Begründung (Arsenal):** StS-Ziehstapel bei 6 Würfeln sinnlos, Hand 5 aus 6 inkohärent (`06_Aenderungen.md` A). **Output/Zug bleibt Atem-gedeckelt (3 Seiten) — der Region-1-Korridor ~15–17 (§7/§12) ändert sich nicht**; 12 Würfel geben Deckbau, nicht mehr Schaden.

---

## 2. Auflösungs-Reihenfolge (gesperrt) + Combo-/Glanz-Einschub

Pro gespielter Schaden-Seite, links→rechts:

1. **Basis** = effektiver Seitenwert (nach Wetzung/Scharte/Klassen-Sockel, 02 §2.2) + Kraft `[GESPERRT]`
2. **Glanz** (falls aktiv): Basis ×2, verbraucht sich. Greift VOR ×Mult/Combos, damit nicht multiplikativ-stapelbar. `[GESPERRT: Prinzip]` · `[Timing aus 02 ableiten — wenn 02 abweicht, gilt 02]`
3. **×Mult** (typgebunden, z. B. Wucht), zündet 1× pro Auflösung, kein Selbst-Stapeln `[GESPERRT]`
4. **Echo-Seite** (falls gespielt): kopiert den Beitrag der unmittelbar links platzierten Schaden-Seite inkl. deren Mults; Echo-Beitrag hart gedeckelt auf 1× Quellbeitrag; max 1 Wiederholung je Echo-Seite, kein Ketten-Echo `[GESPERRT]`

→ Pool-Summe bilden, dann auf den Pool:

5. **×Gleichklang** (falls ≥2 gespielte Schaden-Seiten denselben effektiven Seitenwert zeigen: ×1,25 / ×1,5 / ×1,75 bei 2 / 3 / 4+; additiv +0,25/Stufe, harter Cap ×1,75; nach Mult, vor Morsch) `[GESPERRT]`
6. **×Morsch** `[GESPERRT]`
7. **×Welk** `[GESPERRT]`
8. **+ Vollmond-Burst** (fester, regions-skalierter Bonus, additiv, nicht multiplikativ; falls jede gespielte Seite **effektiven Wert ≥ natürlichen Höchstwert** ihres Würfels erreicht — **permanente Klassen-Wertsockel wie Schleiferin-Schliff zählen für die Prüfung nicht, Wetzung-Status schon** [02 §10.3]; Werte §3.1) `[GESPERRT: Prinzip · Klausel PROVISORISCH]`
9. **floor**, Pool ≥ 0 `[GESPERRT]`

Morsch/Welk wirken nur auf den Schaden-Pool, nicht auf Fäule/Brand. `[GESPERRT]`

---

## 3. Combos — Bedingungen & Faktoren

| Combo | Bedingung | Effekt | Faktor/Wert | Status |
|---|---|---|---|---|
| **Gleichklang** | ≥2 gespielte Schaden-Seiten mit demselben effektiven Seitenwert | Schaden-Pool-Mult, gestaffelt nach Anzahl gleicher Werte | ×1,25 / ×1,5 / ×1,75 (2/3/4+); additiv +0,25, Cap ×1,75 | `[GESPERRT]` |
| **Echo** | dedizierte Echo-Seite gespielt | kopiert Beitrag der unmittelbar links platzierten Schaden-Seite inkl. Mults | Cap 1× Quellbeitrag, max 1 Wiederholung, kein Ketten-Echo | `[GESPERRT]` |
| **Vollmond** | jede gespielte Seite: effektiver Wert ≥ natürlicher Höchstwert des Würfels (permanente Klassen-Sockel ausgenommen, Wetzung-Status zählt — 02 §10.3) | fester Burst, additiv, skaliert mit Region | s. §3.1 `[PROVISORISCH]` | `[GESPERRT: Prinzip, verfeinert 2026-06-30/07-02]` |

- Combos stapeln miteinander, aber jede zündet **nur einmal pro Zug**. `[GESPERRT]`
- Echo prüft Nachbarschaft in der Reihe; Gleichklang/Vollmond prüfen das ganze gespielte Paket. `[GESPERRT]`
- Echo an Position 1 (nichts links) oder nach einer Nicht-Schaden-Seite = 0. Eine Echo-Seite zählt für Gleichklang mit, profitiert aber nur bis zum Quellbeitrags-Cap. `[GESPERRT]`
- **Vollmond-Klausel:** keine Zahlenänderung — nur der Verweis, dass der permanente Schliff-Sockel (+1, 06 §5) Vollmond **nicht** speist; Schaden rechnet er voll mit. `[PROVISORISCH]`

### 3.1 Vollmond-Burst je Region `[PROVISORISCH]`

Fester additiver Bonus auf den Schaden-Pool; skaliert mit Region (~×1,5/Region). Sim eicht die Höhe.

| Region | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Burst | 8 | 14 | 22 | 34 | 50 | 70 |

---

## 4. Übermut & Tischsturz

| Konstante | Wert | Status |
|---|---|---|
| Kipp-Punkt | 6 | `[GESPERRT]` |
| Gratis-Reroll/Zug | 1 | `[GESPERRT]` |
| Jeder weitere Reroll | +1 Übermut | `[GESPERRT]` |
| Tischsturz-Auslöser | Übermut > 6 | `[GESPERRT]` |
| Tischsturz: Zug-Paket | verfällt | `[GESPERRT]` |
| Tischsturz: Schreck | +2 auf ganze Hand | `[GESPERRT]` |
| Tischsturz: Selbstschaden | ~3 | `[GESPERRT]` |
| Übermut-Reset | auf 0 bei Kampfbeginn und nach Tischsturz — **gilt nur für die Sofort-Mechanik** | `[GESPERRT]` |
| Kristallisation: Umrechnung | Rest-Übermut → Gemüt-Abzug | 1:1 | `[GESPERRT — Sim-bestätigt 2026-06-30]` |
| Kristallisation: Ziel | zuletzt gespielte Würfel des Kampfes | — | `[GESPERRT — Sim-bestätigt 2026-06-30]` |

### 4.1 Kristallisation — Regel im Detail `[GESPERRT — Sim-bestätigt 2026-06-30]`

**Ausgangsproblem:** Unter dem reinen Reset-Modell (Übermut → 0 bei jedem Kampfende, unabhängig vom Stand) hat Rerollen für einen klugen Spieler keine run-lange Kosten — Übermut lässt sich stets unter 6 halten, der Tischsturz ist trivial vermeidbar, und selbst der per-Kampf-Malus verschwindet danach spurlos. Die Monte-Carlo-Sim des Welle-1-Tors hat das bestätigt (s. §12): eine „kluge Gier"-Politik (aggressiv rerollen, aber nie über die Tischsturz-Schwelle) schlug die intendierte „Pflege"-Politik konsistent.

**Fix:** Bei Kampfende wird **restliches Übermut (>0), das nicht in einen Tischsturz gemündet ist**, **1:1 in Gemüt-Abzug** (= Schreck) auf die **zuletzt gespielten Würfel** dieses Kampfes umgewandelt, statt einfach zu verfallen.

- Die Sofort-Mechanik (Tischsturz-Risiko bei Übermut > 6) bleibt **innerhalb** des Kampfs vollständig unverändert.
- Kristallisation ist die **zusätzliche, run-lange Konsequenz** — sie macht jeden bezahlten Reroll zu einem echten Tradeoff, der nicht durch kluges Stoppen umgangen werden kann.
- Kristallisation und Tischsturz schließen sich pro Kampf gegenseitig aus: entweder das Übermut mündet in Tischsturz (Reset auf 0, kein Rest zum Kristallisieren), oder es bleibt bis Kampfende stehen und kristallisiert vollständig.
- Kristallisierter Schreck ist mechanisch identisch zu push-erzeugtem Schreck (02 §6) — er ist eine **zweite, unabhängige Quelle**, die sich auf denselben `gemüt`-Wert addiert und nur durch Trösten abbaubar ist.
- **Eingriff in den vormals uneingeschränkten `[GESPERRT]`-Reset-Satz** (02 §7 / Index 00 §3): der Reset gilt fortan nur für die Sofort-Wirkung.

---

## 5. Schreck & Gemüt

| Konstante | Wert | Status |
|---|---|---|
| Gemüt-Start (pro Würfel) | 0 | `[GESPERRT]` |
| Push | −1 Gemüt | `[GESPERRT]` |
| Sauberer Sieg | +1 Gemüt (nur gespielte Würfel) | `[GESPERRT]` |
| Trösten | +2 Gemüt (universell, alle Kanäle) | `[GESPERRT]` |
| Fröhlich-Bonus | +1 | `[GESPERRT]` |
| Schreck-Formel | max(0, −Gemüt) | `[GESPERRT]` |
| Schreck-Mechanik | sperrt höchste freie Seiten (nicht zufällig), vor Wurf sichtbar, max 3 | `[GESPERRT]` |
| Beruhigungs-Seite | +2 Gemüt auf einen ängstlichen Hand-Würfel (nur Schreck > 0), Kosten 1 Atem | `[GESPERRT]` |
| Ermutigungs-Seite | +2 Gemüt **universell** (auch Gemüt ≥ 0), Kosten 1 Atem; zählt **nicht** auf Frühling-Trösten-Zahl (01 §5) | `[PROVISORISCH]` |

### Schreck-Sperr-Kurve „mittel" `[GESPERRT]`

| Schreck | gesperrte Top-Seiten |
|---|---|
| 1–2 | 0 |
| 3–5 | 1 |
| 6–8 | 2 |
| 9+ | 3 |

---

## 6. Status — Caps & Formeln (StS-geerdet)

| Status | Effekt | Cap / Decay | Formel | Status |
|---|---|---|---|---|
| **Fäule** | zu Beginn Trägerzug `Stapel` Schaden | dann −1 Stapel | additiv | `[GESPERRT]` |
| **Brand** | zu Zugende `Stapel` Schaden | dann −2 Stapel | additiv | `[GESPERRT]` |
| **Morsch** | +20 %/Stapel | Cap 4 (max +80 %), Decay −1/Runde | additiv | `[GESPERRT]` |
| **Welk** | −10 %/Stapel | Cap 4 (max −40 %), Decay −1/Runde | additiv | `[GESPERRT]` |
| **Kraft** | +`Stapel` auf jede gespielte Schaden-Seite | — | additiv | `[GESPERRT]` |
| **Riss** | 25 % Zünd-Aussetzer | 2 Runden | — | `[GESPERRT]` |
| **Glanz** | nächste gespielte Seite zählt doppelt (Basis ×2, vor Mult) | verbraucht sich | — | `[GESPERRT: Prinzip]` |

### 6.1 Eigen-Status (Würfelhain-nativ, 02 §8.2) `[GESPERRT-Prinzip, Werte PROVISORISCH]`

Spielerseitig, kampf-begrenzt, Schema-Slot `eigenStatus` (09 §2.11).

| Status | Achse | Effekt je Stapel | Cap | Decay | Status |
|---|---|---|---|---|---|
| **Wetzung** (Buff) | Seitenwert | +1 effektiver Wert jeder gewürfelten Seite (alle Pools); speist Vollmond | 3 | −1/Runde | `[PROVISORISCH]` |
| **Scharte** (Debuff) | Seitenwert | −1 effektiver Wert jeder Seite, Untergrenze 1; bricht Vollmond | 3 | −1/Runde | `[PROVISORISCH]` |
| **Freilauf** (Buff) | Reroll | +1 übermut-freier Reroll diesen Zug | 3 | −1/Runde | `[PROVISORISCH]` |
| **Klemme** (Debuff) | Reroll | erster Reroll je Stapel kostet +1 Übermut (Gratis-Reroll zuerst verteuert) | 3 | −1/Runde | `[PROVISORISCH]` |

Abgrenzungen (Wetzung ≠ Kraft, Scharte ≠ Welk, Sockel-Ausnahme für Vollmond) in 02 §8.2/§10.3.

---

## 7. HP- & Schaden-Kurven je Region `[PROVISORISCH]`

Startpunkte; Sim eicht ab Region 1. Spieler-Output wächst grob ~×1,5–2 je Region — HP folgt.

| Region | Normal-HP | Elite-HP | Boss-HP | Gegner-Schaden/Zug |
|---|---|---|---|---|
| 1 | 20–45 | 60–80 | 110–130 | 5–10 |
| 2 | 40–70 | 100–130 | 180–210 | 9–15 |
| 3 | 70–110 | 150–190 | 280–320 | 14–22 |
| 4 | 110–160 | 220–270 | 400–450 | 20–30 |
| 5 | 160–230 | 320–380 | 550–620 | 28–40 |
| 6 | 230–320 | 450–520 | 750–850 | 38–55 |

Anker (gesperrt-konsistent): Region 1 ~15–17 Schaden/Zug des Hüters → Normalgegner in 2–3 Zügen tot. **Gilt unverändert unter dem 12er-Arsenal** (Atem-Deckel, §1).

**Hinweis (Welle-1-Tor, s. §12):** Die Sim-Verifikation der Kristallisations-Regel lief mit moderat angehobenen Region-1-Werten am oberen Rand dieser Spanne (Normal-HP 30–45, Schaden 6–8; teils Elite-Mix 50–65 HP). Grund: der gravurlose Starter braucht genug Kampflänge, damit sich Übermut-Akkumulation und Kristallisation überhaupt auswirken können — bei sehr kurzen Kämpfen (2–3 Züge) bleibt kein Raum für den Effekt. Feinkalibrierung ins exakte Zielband (§13) steht noch aus — **auf 12er-Arsenal-Basis**.

---

## 8. Ökonomie — Einkommen, Preise, Senken

### Einkommen (gesperrt) `[GESPERRT]`

| Währung | Einkommen | Quelle |
|---|---|---|
| Münzen | ~14–16/Kampf | Kämpfe + Events (reine Währung) |
| Eicheln | ~8/Kampf | Kämpfe |
| Tau | ~6/Region | Pflege/Struktur |

Budget-Regel: kombinierte Kaufkraft ~1,2× StS (nicht 3×). `[GESPERRT]`

### Schmiede / Preise `[GESPERRT]`

| Posten | Wert |
|---|---|
| Verzauber-Stufe 1/2/3 | 40 / 60 / 80 Münzen |
| Schmiede-Anteil an Händler-Knoten | ~0,7 |
| Verzauberungen/Run (Ziel) | ~12–13 |

### Push-Kosten `[GESPERRT]`

- Push kostet **ausschließlich Schreck** (−1 Gemüt), **keine** Münzen.

### Synergie-Engines (Welle-3-Inhalt, dimensioniert) `[GESPERRT]`

| Engine | Blaupause | Keyword | Wert | Bremse |
|---|---|---|---|---|
| Tau | Quell | Labung | Basis 3, +1 je Trösten, Cap +8 | run-lang, selbstbremsend |
| Münzen | Hort | Prägung | 3 Münzen/Spiel, Kosten 1 Atem | Headroom ~16–18 Verz./Run |

### Weitere Senken `[PROVISORISCH]`

| Senke | Kosten | Status |
|---|---|---|
| Heilung am Lagerfeuer | — / strukturell | `[PROVISORISCH]` |
| Würfel entfernen (Senke) | ~25–50 Münzen, steigend | `[PROVISORISCH]` — Wert steigt unter 12er-Arsenal (Thinning wichtiger, 04 §6) |
| Event-Risiko-Tausch | variabel | `[PROVISORISCH]` |

---

## 9. Reifegrade (Ascension-Mods) `[PROVISORISCH]`

Vorschlag: 10 Stufen, kumulativ. Sim eicht Schwellen.

| Stufe | Modifikator (kumulativ) |
|---|---|
| 0 | Basis |
| 1 | Elite-HP +10 % |
| 2 | Start mit +1 Schreck auf 1 Würfel |
| 3 | Gegner-Schaden +10 % |
| 4 | Schmiede-Preise +20 % |
| 5 | Boss-HP +15 % |
| 6 | Heilung −25 % |
| 7 | Tischsturz-Selbstschaden +2 |
| 8 | Normalgegner +1 Status-Stapel/Anwendung |
| 9 | Start mit aufgedrücktem Fluch (Event-Stil) |
| 10 | Gegner-HP +10 % über alle Typen |

---

## 10. RNG-Schichten & Pity `[PROVISORISCH]`

Basis: gesäter mulberry32 (`rng.js`, gesperrt deterministisch).

| Schicht | Regel | Status |
|---|---|---|
| Würfelwurf | gleichverteilt 1–6 je freie Seite | `[GESPERRT]` |
| Ziehstapel-Mischen | Fisher-Yates über denselben Stream (09 §4) | `[PROVISORISCH]` |
| Stimmungs-Gewichtung | Fröhlich/Ängstlich verschiebt Seiten-Wahrscheinlichkeit | `[PROVISORISCH]` |
| Belohnungs-Auswahl | 3 Optionen/Knoten, gewichtet nach Seltenheit | `[PROVISORISCH]` |
| Blaupause-Pity | garantierte Blaupause spätestens nach N Belohnungs-Knoten ohne | N ~6 `[PROVISORISCH]` |
| Selten-Pity | erhöhte Selten-Chance nach M Belohnungen ohne Selten | M ~5 `[PROVISORISCH]` |
| Seed | nur intern für Tests, kein Daily/Seed-Modus | `[GESPERRT]` |

---

## 11. Sauberer-Sieg-Bedingung

- Belohnung gesperrt: **+1 Gemüt, nur auf gespielte Würfel.** `[GESPERRT]`
- Auslöser-Definition `[PROVISORISCH]`: Kampf gewonnen **ohne HP-Verlust des Hüters** in diesem Kampf **und ohne Tischsturz**. (Sim/Spielgefühl prüft, ob „ohne HP-Verlust" zu streng ist; Fallback: nur „ohne Tischsturz".)

---

## 12. Bisherige Sim-Befunde

- Zufälliges Seiten-Sperren ist effektiv kostenlos (Hand-Spielraum + Reroll-Redundanz) → **Schreck sperrt höchste Seite**, nicht zufällig. `[GESPERRT]`
- Eichwart-Output Region 1: ~15–17 Schaden/Zug, Normalgegner 20–45 HP in 2–3 Zügen. Konsistent mit Ziel-Pacing. `[GESPERRT]` (Atem-gedeckelt — arsenal-größen-unabhängig.)
- Wucht additiv (×1,5/2,0/2,5, +0,5/Stufe) wirkt als Anti-Lawinen-Bremse; harter Cap 3 Stufen/Seite. `[GESPERRT]`
- Drei-Währungs-Budget bei ~1,2× StS-Kaufkraft verhindert Inflation gegenüber naivem 3×. `[GESPERRT]`
- Python-Prototypen waren ephemeral (gelöscht). JS-Port des Monte-Carlo wurde als eigenständige Sandbox-Referenz gebaut (nicht im Claude-Code-Repo) — s. Welle-1-Tor-Befund unten.

### 12.1 Welle-1-Tor-Befund (2026-06-30) `[GESPERRT — strukturell bestätigt · Zahlen: 6er-Arsenal, Re-Run nötig]`

**⚠ Kalibrierungs-Basis:** Alle Läufe dieses Befunds fuhren das **alte 6er-Arsenal** (vor `[GESPERRT-OVERRIDE]` 2026-07-02, §1). Das **strukturelle Ergebnis (Pflege > Gier) hält erwartbar** auch unter 12 Würfeln — Atem-Deckel und Kristallisation sind arsenal-größen-unabhängig. Die **absoluten Siegraten und die Schreck-Akkumulation verschieben sich** jedoch (mehr Würfel = Schreck verteilt sich, einzelne Sperrungen treffen seltener dieselbe Hand; Ziehmodell ändert Hand-Zusammensetzung): **Re-Run auf 12er-Arsenal + Ziehmodell (02 §2.2) erforderlich**, bevor die Zahlen unten als Eichpunkte weiterverwendet werden.

**Erste Iteration (ohne Kristallisation) — Tor NICHT erfüllbar:**

Einzelkampf-Diagnostik (1 Elite, volle HP, n=5000) zeigte: eine „kluge Gier"-Politik (rerollt aggressiv, stoppt aber bewusst vor der Tischsturz-Schwelle) war **strikt besser** als die intendierte „Pflege"-Politik — schneller (3,5 vs. 4,0 Züge), weniger HP-Verlust (30,5 vs. 33,5), und akkumulierte dabei **null** Schreck. Drei Ursachen identifiziert:

1. Übermut kostete unter klugem Spiel nichts (Klippe bei >6 trivial vermeidbar, zusätzlich Reset pro Kampf).
2. Schreck hatte keine Eintrittstür unter klugem Spiel (Tischsturz vermieden, Push self-gated auf Schreck, der nie entstand).
3. Proaktives Blocken war in kurzen Kämpfen netto-negativ (Atemkosten für Block > eingesparte HP).

**Fix:** Kristallisations-Regel eingeführt (s. §4.1). Übermut-Output-Malus als reine Kampf-interne Strafe wurde probiert und wieder verworfen — er wirkte unter kurzen Kämpfen zu schwach, um den schnelleren-Kill-Vorteil der Gier-Politik zu überkompensieren. Kristallisation (run-lange Schreck-Kopplung) war der tragende Fix.

**Ergebnis nach Fix — Tor strukturell ERFÜLLT über mehrere Schwierigkeitsstufen (6er-Arsenal):**

| Schwierigkeit | Gier (blind) | Gier (klug, tischsturz-vermeidend) | Pflege |
|---|---|---|---|
| moderat | 8,6 % | 71,8 % | 96,3 % |
| mittel | 2,6 % | 20,8 % | 48,1 % |

Pflege schlägt **beide** Gier-Politiken konsistent in beiden getesteten Stufen. Schreck akkumuliert unter Gier sichtbar (Ø 60–73/Arsenal am Kampfende), unter Pflege bleibt er bei 0. **Achtung:** der Ø-Schreck-Anker 60–73 bezog sich auf ein 6er-Arsenal — auch die Enden-Schwellen (01 §5) hängen an diesem Anker und werden mit dem Re-Run nachgeeicht.

**Nebenbefund — Schreck-Wachstum ist nichtlinear/klippen-anfällig:** bei zu hoher Schwierigkeit kollabierten alle Politiken auf 0 % Siegrate (selbstverstärkende Spirale: gesperrte Top-Seiten senken Output → mehr Rerolls/Pushes nötig → mehr Schreck). Das ist im Kern der gewollte Anti-Gier-Mechanismus, macht die Schwierigkeitskurve aber empfindlich — für Welle 2 wichtig: früher Trösten-Zugang (Beruhigungs-/Ermutigungs-Seite, Hain-Segen) muss verfügbar sein, bevor die Spirale unkontrolliert kippt.

**Offen:** exakte Kalibrierung ins Zielband 65–70 % (§13) — Pflege pendelt aktuell zwischen 48 % und 96 % je nach Heilungswert zwischen den Kämpfen; reine Eichungsarbeit, kein struktureller Blocker. Vollständiger Befund inkl. Sim-Code: `Wuerfelhain_Welle1_Tor_Befund.md`.

**Wichtig für Repo-Status:** Die Verifikation lief in einer **Sandbox-Referenzimplementierung** (nicht Teil des Claude-Code-Repos). Die Kristallisations-Mechanik ist im echten Spielcode (`push.js`) noch **nicht portiert** — s. Index 00 §4/§7.

---

## 13. Ziel-Siegraten je Reifegrad `[PROVISORISCH]`

Gemessen über Monte-Carlo mit Standard-Spielpolitik (greedy-vernünftig).

| Reifegrad | Ziel-Siegrate | Lesart |
|---|---|---|
| 0 | ~65–70 % | Anfänger gewinnt mit reiner Stärke |
| 3 | ~55 % | solides Verständnis nötig |
| 6 | ~45 % | Build-Wahl entscheidet |
| 9 | ~35 % | starkes Spiel nötig |
| 10 | ~25–30 % | Veteranen-Jagd auf God Runs |

Gier-vs-Pflege-Kriterium: Bei keinem Reifegrad darf reine Gier (Dauer-Push, kein Trösten) dominieren — Schreck-Akkumulation muss die Siegrate gegenüber gepflegtem Spiel messbar senken. Beleg via Sim ist die Bestehensbedingung des Welle-1-Tors. **Strukturell erfüllt seit Kristallisations-Fix (s. §12.1); bisherige Siegraten stammen von 6er-Arsenal-Läufen — Re-Run auf 12er-Arsenal + Ziehmodell nötig, bevor die Reifegrad-0-Kalibrierung (65–70 %) angegangen wird.**

---

## 14. Anti-Lawinen-Verteidigung (Zusammenfassung)

1. Max **3 Verzauber-Stufen/Seite** (hart, global). `[GESPERRT]`
2. Mult-Seiten zünden **1× pro Auflösung**, kein Selbst-Stapeln. `[GESPERRT]`
3. Skalier-Seiten setzen bei **Kampfende zurück** (kampf-lang). `[GESPERRT]`
4. **Keine** pauschale Skalier-Grenze; jede run-lange Engine bringt **eigene Bremse** mit (StS-Stil). `[GESPERRT]`
5. Gleichklang **hart gedeckelt** (×1,75 max), Echo auf **1× Quellbeitrag**, Vollmond = **fester regions-skalierter Burst** (additiv, permanente Klassen-Sockel speisen ihn nicht) — keine multiplikative Explosion. `[GESPERRT]`
6. Glanz verdoppelt **Basis** (vor Mult), nicht das Endprodukt. `[GESPERRT: Prinzip]`
7. Status-Intensität gedeckelt (Morsch/Welk Cap 4, Eigen-Status Cap 3, additiv, Decay). `[GESPERRT]`
8. **Übermut/Reroll:** Kristallisation koppelt Rerollen an eine run-lange Schreck-Strafe — Bremse gegen Gier-Optimierung, nicht gegen Schaden-Skalierung, aber Teil des gleichen Anti-Avalanche-Prinzips. `[GESPERRT — Sim-bestätigt 2026-06-30]`

---

## 15. Offene Werte, die die Sim klären muss

- Hüter-Basis-HP & Klassen-Mods (§1, 06 §1.3)
- **Ziehmodell-Default bestätigen** (§1: je Zug 5 frisch vs. behalten+auffüllen, 02 §2.2)
- Vollmond-Burst-Kurve je Region (§3.1) + Schliff-Ausnahme (§3) per Schleiferin-Sim
- **Eigen-Status-Werte (§6.1):** Stapel-Wirkung, Caps, Decay, Freilauf/Klemme-Verrechnung (02 §7.5)
- **Ermutigung (§5):** Häufigkeit gegen Frühling-Schwelle (01 §5); Nicht-Anrechnung bestätigen
- HP-/Schaden-Kurven Region 1–6 (§7)
- Reifegrad-Schwellen & exakte Mods (§9)
- Pity-Schwellen N/M (§10)
- Sauberer-Sieg: „ohne HP-Verlust" zu streng? (§11)
- Ziel-Siegraten als harte Eichpunkte (§13)
- **Welle-1-Tor Re-Run auf 12er-Arsenal + Ziehmodell** (§12.1) — Voraussetzung für alles Weitere
- **Feinkalibrierung Kristallisation:** exakte Region-1-Schwierigkeit/Heilung, um Pflege ins 65–70-%-Band zu bringen, ohne die Gier-vs-Pflege-Relation zu verlieren (§4.1/§12.1) — nach dem Re-Run
