# Würfelhain — Klassen (Artefakt 06)

*5 Hüter-Klassen: Start-Arsenal, Passiv, Spielgefühl, Schwierigkeit, Freischaltung. Eichwart-Passiv `[GESPERRT]`; Arsenal-Größe 12 ist ein sanktionierter Eingriff in vormals `[GESPERRT]` (Arsenal-Start 6) — s. §1.1 und `06_Aenderungen.md`. Alle Passive flach/gedeckelt, kein multiplikativer Selbstläufer (03 §14).*

*Stand: 2026-07-02. Neufassung: Arsenal-Start 12 (StS-Ziehstapel), Namen final, Dorfschamane-/Schleiferin-Fixes eingearbeitet.*

---

## 1. Design-Rahmen

### 1.1 Arsenal-Modell `[GESPERRT-OVERRIDE]`

- **Arsenal-Start 12 Würfel** (vorher 6). **Handgröße 5 unverändert.** Ziehen im **StS-Stil**: Hand wird je Zug aus einem Ziehstapel gezogen, Gespieltes/Verworfenes wandert auf einen Ablagestapel, leer → Ablage mischt neu. Über einen Kampf zirkuliert das ganze Deck.
- **Output/Zug bleibt Atem-gedeckelt (3 Seiten)** — der Region-1-Korridor **~15–17 Roh-Schaden/Zug** (03 §7/§12) ändert sich durch mehr Würfel **nicht**. 12 Würfel geben Deckbau, Rotation und Thinning, nicht mehr Schaden pro Zug.
- **Arsenal-Ziel Run-Ende ~22–24** (vorher ~14). `[PROVISORISCH]`
- **Konsistenz-Anker je Klasse:** eine 5er-Hand aus einem 12er-Deck enthält im Schnitt `5 × (Schaden-Anteil)` Schaden-Würfel. Damit ~3 spielbare Schaden-Seiten sicher sind, tragen Schaden-Klassen **7–8 Schaden-Würfel**; die Pflege-Klasse liegt bewusst darunter (Floor-Dip als Tradeoff).
- **Spezifikation ausstehend:** Ziehstapel/Ablage/Reshuffle gehört als Regeltext nach **02 §2.2** und als State nach **09 §3.1** (`ziehstapel`/`hand`/`ablage`). S. `06_Aenderungen.md`.

### 1.2 Staffelungs-Prinzip `[GESPERRT-Prinzip]`

- **Schwierigkeit über Fragilität und Komplexität, nicht über rohe Stärke.** Jede Klasse erreicht den Korridor auf **eigenem Weg** — kein Eichwart-Klon.
- **Kein Passiv multipliziert.** Alle flach, konditional oder status-basiert mit hartem Cap. Multiplikation nur über Wucht + gedeckelte Combos (03 §14).
- **Gier-vs-Pflege-Achse (01 §2):** die Klassen spannen sie auf — pflege-belohnend (Dorfschamane) bis gier-belohnend-hart-bestraft (Rodbauer). Kristallisation (02 §7.2) trifft jede Klasse; gier-lastige am stärksten.

### 1.3 Verortung (Übersicht)

| Klasse | Achse | Kern-Mechanik | Schwierigkeit | HP-Mod `[PROV]` |
|---|---|---|---|---|
| **Eichwart** | neutral | Stärke + Block | Einsteiger | +5 (80) |
| **Dorfschamane** | Pflege-Pol | Trösten / Sustain | Mittel | +0 (75) |
| **Glöckner** | taktisch-neutral | Gleichklang / Echo | Mittel–Schwer | +0 (75) |
| **Schleiferin** | nuanciert (Freilauf-Ventil) | Wetzung / Reroll-native | Schwer | −5 (70) |
| **Rodbauer** | Gier-Pol | Roh-Schaden, glass cannon | Experte | −10 (65) |

Hüter-Basis-HP 75 (03 §1, `[PROVISORISCH]`); Mods addieren.

### 1.4 Lore `[GESPERRT-Prinzip]`

Die vier Nicht-Eichwart-Klassen sind **zeitgenössische Hüter-Archetypen ohne Dürre-Bezug** (01 §4), keine narrative Verstrickung mit dem früheren Hüter. Namen sind alte Handwerks-/Berufsbilder, `[PROVISORISCH]` (Flavor, keine Sim-Größe).

---

## 2. Eichwart `[GESPERRT-Passiv / Arsenal OVERRIDE]`

Start-Klasse. Ehrlicher Boden: Stärke ist gut, Zahlen lesbar, Block hält. Passiv aus Index 00 §3 wörtlich; Arsenal auf 12 skaliert (2:1-Verhältnis erhalten).

| # | Name | Typ | Seiten (1–6) | Atem |
|---|---|---|---|---|
| 1–8 | Astschneide | Schaden | 1, 2, 3, 4, 5, 6 | 1 |
| 9–12 | Borkenschild | Rinde | 1, 1, 2, 2, 3, 3 | 1 |

- **Passiv „Wehrhaftigkeit" `[PROV-Name, GESPERRT-Effekt]`:** +2 Schaden auf **jede gespielte Schaden-Seite** (additive Stufe, 02 §4.1).
- **HP-Mod:** +5 (= 80). `[PROVISORISCH]`
- **Spielgefühl:** direkt, verzeihend.
- **Output:** 3 × (Ø 3,5 + 2) = **16,5 roh/Zug** → Anker (04 §2.1). Schaden-Anteil 8/12 → Ø 3,3 Schaden-Würfel/Hand. `[GESPERRT-konsistent]`
- **Freischaltung:** Start, immer verfügbar. `[GESPERRT]`

---

## 3. Dorfschamane `[PROVISORISCH]`

Der Pflege-Pol. Lehrt die Care-Ökonomie, hält Schreck auf 0, arbeitet auf „Der neue Frühling" hin. Roh-Schaden solide, aber an die Zufriedenheit der Würfel gekoppelt.

| # | Name | Typ | Seiten (1–6) | Atem |
|---|---|---|---|---|
| 1–7 | Astschneide | Schaden | 1, 2, 3, 4, 5, 6 | 1 |
| 8–9 | Borkenschild | Rinde | 1, 1, 2, 2, 3, 3 | 1 |
| 10–12 | Sanftholz | Stütze | Erm(0), Erm(0), 2, 2, 3, 3 | 1 |

*Erm(0) = Ermutigungs-Seite, Wert 0. Die 2/3-Seiten des Sanftholz sind Block.*

- **Neues Keyword „Ermutigung" `[PROVISORISCH]`:** +2 Gemüt **universell** — wirkt **auch bei Gemüt ≥ 0** (baut Richtung Fröhlich), 1 Atem. Abgrenzung zu **Beruhigung** (02 §6.3: nur bei Schreck > 0). Ermutigung schließt die Lücke, die Beruhigung unter sauberem Spiel offenließ.
- **Passiv „Zuversicht":** +2 Schaden auf Schaden-Seiten von Würfeln mit **Gemüt ≥ 0** (Schreck > 0 verliert den Bonus); **sauberer Sieg gibt +2 statt +1 Gemüt** (nur gespielte Würfel); **1 Ermutigung/Kampf kostet 0 Atem**. `[PROVISORISCH]`
- **HP-Mod:** +0 (= 75).
- **Anti-Lawine:** Bonus flach, konditional, selbst-limitierend; Ermutigung/Sauber-Sieg-Boost flach.
- **Spielgefühl:** bei ruhigem Arsenal wie Eichwart, plus aktiver Pflege-Kreislauf **ab Zug 1** (Ermutigung wirkt sofort). Gier sperrt Top-Seiten **und** streicht +2 auf betroffenen Würfeln — doppelte Strafe.
- **Output:** bei Gemüt ≥ 0 = 3 × 5,5 = **16,5 roh** (Korridor). Schaden-Anteil 7/12 → Ø 2,9 Schaden/Hand → Floor dipt gelegentlich auf ~11, kompensiert durch Sustain/Trösten-Vorsprung. `[PROVISORISCH]`
- **Caveat (Sim):** universelle Ermutigung könnte die Frühling-Bedingung (Trösten-Zahl ≥ 8, 01 §5) trivialisieren — Zugang/Häufigkeit gegen die Schwelle prüfen.
- **Freischaltung:** erste Nicht-Eichwart-Klasse. Günstig (§7).

---

## 4. Glöckner `[PROVISORISCH]`

Taktisch-neutral. Baut auf **Gleichklang**: eng geclusterte Werte, damit gleiche Werte häufig fallen. Belohnt Setup, nicht Care oder Aggression. Combo hart gedeckelt (×1,75, 03 §3).

| # | Name | Typ | Seiten (1–6) | Atem |
|---|---|---|---|---|
| 1–8 | Klangwürfel | Schaden | 2, 3, 4, 4, 5, 5 | 1 |
| 9–12 | Borkenschild | Rinde | 1, 1, 2, 2, 3, 3 | 1 |

- **Passiv „Widerhall":** zünden im Zug ≥ 2 Schaden-Seiten mit demselben **effektiven Wert** (Gleichklang aktiv), **+3 flacher Schaden** auf den Pool. **1×/Zug, additiv**, vor floor. `[PROVISORISCH]`
- **HP-Mod:** +0 (= 75).
- **Anti-Lawine:** flacher Sockel, 1×/Zug, greift nur bei ohnehin gedeckeltem Gleichklang — addiert, multipliziert nicht.
- **Spielgefühl:** geclusterte Würfel (Ø 3,83, Werte auf 4/5) machen Matches häufig; der Reiz liegt im Platzieren. Echo-/Glanzkorn-Blaupausen (04 §4) sind natürliche Ausbauten.
- **Output:** ohne Match ~11,5 roh; mit Match (z. B. 4,4,5 → 13 × 1,25 = 16,25 + 3) **~19 roh**. Varianz um den Korridor, Matches sind der Hebel. Schaden-Anteil 8/12. `[PROVISORISCH]`
- **Freischaltung:** zweite Klasse (Combo-Einstieg). Mittel (§7).

---

## 5. Schleiferin `[PROVISORISCH]`

Die dice-native Klasse. Dockt an **Wetzung** (effektiver Seitenwert) und **Freilauf** (Reroll-Ökonomie) an — beide `eigenStatus` (02 §8.2 / 09 §2.11). Höchste Pilotier-Komplexität; hohe Varianz durch Freilauf gebändigt.

| # | Name | Typ | Seiten (1–6) | Atem |
|---|---|---|---|---|
| 1–8 | Wetzklinge | Schaden | 2, 3, 4, 5, 6, 6 | 1 |
| 9–12 | Borkenschild | Rinde | 1, 1, 2, 2, 3, 3 | 1 |

- **Passiv „Schliff":** **+1 auf den effektiven Wert jeder gewürfelten Seite** (flach, dauerhaft, alle Pools; funktional permanente Wetzung 1, aber **kein Decay, kein Stapeln über 1**, unabhängig vom Wetzung-Status). Zusätzlich **+1 Gratis-Reroll/Zug** (Freilauf-Grundausstattung). `[PROVISORISCH]`
- **Vollmond-Ausnahme `[PROVISORISCH]`:** **Vollmond prüft den natürlich gewürfelten Wert und ignoriert das Schliff-+1.** Verhindert Vollmond-als-Norm. Der **Wetzung-Status** ermöglicht Vollmond weiterhin regulär (02 §10.3 unverändert) — nur der permanente Klassen-Sockel ist ausgenommen.
- **HP-Mod:** −5 (= 70).
- **Anti-Lawine:** +1 hart bei 1 gedeckelt; Wetzung-Status stapelt daneben bis Cap 3, jeder Teil für sich gedeckelt — keine multiplikative Kopplung.
- **Spielgefühl:** +1 auf alle Pools hebt Schaden **und** Block und erleichtert Wetzung-Vollmond-Builds; der Extra-Freilauf glättet die 2/3/6/6-Varianz, ohne Übermut zu bauen — pflege-freundliches Ventil, das die Gier-Versuchung dämpft.
- **Output:** Schaden-Seiten Ø 4,33 + 1 = 5,33 × 3 = **16 roh** (Korridor); Freilauf hebt den Floor. Schaden-Anteil 8/12. `[PROVISORISCH]`
- **Freischaltung:** dritte Klasse (dice-native Tiefe). Teuer (§7).

---

## 6. Rodbauer `[PROVISORISCH]`

Der Gier-Pol. Höchste Roh-Decke, **kein Block**, niedrigste HP — glass cannon. Name: Brandrodung gibt maximalen Sofort-Ertrag und lässt verbrannten Boden zurück. Belohnt Aggression, wird von **Kristallisation** am härtesten bestraft. Experten-Grat zwischen God Run und Schreck-Spirale.

| # | Name | Typ | Seiten (1–6) | Atem |
|---|---|---|---|---|
| 1–8 | Astschneide | Schaden | 1, 2, 3, 4, 5, 6 | 1 |
| 9–12 | Wildzahn | Schaden | 1, 2, 3, 6, 6, 6 | 1 |

*Kein Rinde-Würfel im Start-Arsenal.*

- **Passiv „Brandrodung":** +3 Schaden auf **jede gespielte Schaden-Seite**. Kein eingebauter Block. `[PROVISORISCH]`
- **HP-Mod:** −10 (= 65).
- **Anti-Lawine:** +3 flach, kein Stapeln, kein Mult. Die hohe Decke wird ausschließlich über **Fragilität** (65 HP, null Block) ausbalanciert — Offense-als-Defense.
- **Spielgefühl:** brachial, riskant. Astschneide Ø 3,5 + 3 = 6,5; Wildzahn hochvariant (Ø 4,0) für Gleichklang-Spitzen oben. Jeder Treffer geht voll auf HP → Druck zu schnellen Kills → Versuchung zu rerollen/pushen → Kristallisation koppelt das an run-langen Schreck. Braucht Borke-Gravur/Block-Blaupausen zum Überleben.
- **Output:** 3 × 6,5 = **~19,5 roh** (über Decke), per Fragilität ausbalanciert. Schaden-Anteil 12/12. `[PROVISORISCH]`
- **Freischaltung:** letzte Klasse. Teuerste; ggf. an Meta-Bedingung geknüpft (§7).

---

## 7. Freischalt-Reihenfolge (Welle 4) `[PROVISORISCH]`

Über **Jahresringe / Stammbaum** (09 §2.9). Reihenfolge lehrt die Achse: erst Pflege, dann Combos, dann dice-native Tiefe, zuletzt Experten-Gier.

| Reihenfolge | Klasse | Kosten `[PROV]` | Zusatz-Bedingung `[PROV]` |
|---|---|---|---|
| Start | Eichwart | — | — `[GESPERRT]` |
| 1 | Dorfschamane | 3 Jahresringe | — |
| 2 | Glöckner | 5 | — |
| 3 | Schleiferin | 8 | — |
| 4 | Rodbauer | 12 | Run mit Ende „Der neue Frühling" **oder** Reifegrad ≥ 3 |

Kosten/Bedingungen sind Startpunkte; Meta-Ökonomie ist Welle-4-Inhalt, noch nicht dimensioniert. Rodbauer bewusst hinter eine Schwelle, damit die Experten-Klasse die Kristallisations-Lektion nicht als erster Griff umgeht.

---

## 8. Balance-Sanity — Korridor je Klasse

Ziel: **~15–17 Roh-Schaden/Zug** in Region 1, jeweils auf eigenem Weg. Output bleibt Atem-gedeckelt (3 Seiten); 12er-Arsenal ändert nur Konsistenz/Deckbau.

| Klasse | Weg zum Korridor | Roh/Zug (Basis) | Schaden-Anteil | Bemerkung |
|---|---|---|---|---|
| Eichwart | 3× Schaden + flat +2 | 16,5 | 8/12 | Anker |
| Dorfschamane | 3× Schaden + konditional +2 | 16,5 | 7/12 | fällt mit Schreck; Floor-Dip bei dünner Hand |
| Glöckner | Gleichklang-Match + flat +3 | 11,5 / ~19 | 8/12 | unter/über je Match — Setup ist der Hebel |
| Schleiferin | höhere Basis + flat +1 alle Pools | 16 | 8/12 | Freilauf glättet Varianz, öffnet Wetzung-Vollmond |
| Rodbauer | 3× Schaden + flat +3, kein Block | ~19,5 | 12/12 | über Decke, per Fragilität (65 HP) balanciert |

**Grundsatz:** kein Passiv multipliziert; jede Abweichung vom Eichwart-Sockel wird über Konditionalität, Combo-Kopplung, Varianz/Status-Tiefe oder Fragilität erkauft. Erfüllt 03 §14.

---

## 9. Offene Punkte für Sim / Folge-Artefakte

- Alle `[PROVISORISCH]`-Werte: HP-Mods, Passiv-Aufschläge, Jahresringe-Kosten.
- **Ziehstapel-Modell (§1.1)** spezifizieren (02/09), inkl. Reshuffle-Timing und Save-State.
- **Welle-1-Tor neu kalibrieren** auf 12er-Arsenal: strukturelles Gier-vs-Pflege-Ergebnis hält (Atem-/Kristallisations-getrieben), aber Zahlen aus 03 §12.1 stammen von 6er-Läufen → Re-Run nötig.
- **Dorfschamane:** „Zuversicht"-Kollaps-Härte eichen (soll strafen, nicht unspielbar machen in R5/R6); Ermutigungs-Häufigkeit gegen Frühling-Schwelle (01 §5).
- **Glöckner:** Floor (~11,5) gegen R1-Pacing; Cluster-Verteilung vs. Match-Häufigkeit; Widerhall +3 justieren.
- **Schleiferin:** Vollmond-Ausnahme im Sim bestätigen; Schliff-+1 × Wetzung-Status × Block gegenchecken.
- **Rodbauer:** 65 HP + null Block in R1 überlebbar oder Brick-nah? Kristallisations-Schreck unter Rodbauer-Gier messen (erwartet höchster Anstieg).
- **Passiv × Combos/Blaupausen** je Klasse auf Lawinen prüfen — v. a. Rodbauer + Wucht, Glöckner + Gleichmaß/Doppelschlag (04 §6).
