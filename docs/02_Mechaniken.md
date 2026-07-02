# Würfelhain — Mechaniken (Artefakt 02)

*Vollständige, eindeutige Regeltexte. Gesperrte Regeln aus Index 00 §3 wörtlich übernommen und ausgearbeitet. `[GESPERRT]` = bestätigt. `[PROVISORISCH]` = baubar, Endwerte offen (Sim/03 entscheidet). Reine Zahlenwerte ohne Sperrvermerk stehen in Artefakt 03.*

*Stand: 2026-06-30. Update: §7 Kristallisation (Übermut→Schreck). Neu: vier universelle Eigen-Status (Wetzung/Scharte, Freilauf/Klemme) in §8; Folgeänderungen in §2.2, §4, §7, §10.3.*

---

## 1. Begriffe

- **Würfel:** sechsseitig, hat einen **Typ** (z. B. Schaden, Rinde) und sechs **Seiten**. Jede Seite hat einen **Wert** und einen **Seiten-Effekt**.
- **Hand:** die zu Zugbeginn geworfenen Würfel. Handgröße 5 (03 §1).
- **Arsenal:** alle Würfel des Spielers; aus ihm wird die Hand gezogen.
- **Atem:** Aktionswährung pro Zug. **Atem 3 fix, ungenutzt verfällt.** `[GESPERRT]`
- **Pool:** Sammelbecken pro Wirkungs-Art (Schaden, Rinde, Fäule, Brand, …). Multiplikatoren sind **typgebunden** — sie wirken nur auf ihren eigenen Pool.
- **Effektiver Seitenwert:** der gewürfelte Seitenwert **nach** Wetzung/Scharte (§8), vor allem Weiteren. Alle Pools und Combos rechnen mit dem effektiven Wert.

---

## 2. Kampf-Ablauf (Schritt für Schritt)

Eine **Runde** = Spielerzug, dann Gegnerzug. Decay-Effekte (Morsch/Welk/Wetzung/Scharte/Freilauf/Klemme) ticken **pro Runde**.

### 2.1 Kampfbeginn
1. **Übermut = 0** setzen. `[GESPERRT]`
2. Gegner zeigen ihre **Absicht** an (Angriff/Block/Status → 05).
3. Hain-Segen / Klassen-Passive anwenden (Eichwart: +2 auf jede gespielte Schaden-Seite). `[GESPERRT]`

### 2.2 Spielerzug
1. **Rundenbeginn-Status:** **Fäule** tickt — Träger nimmt `Stapel` Schaden, dann Stapel −1. `[GESPERRT]`
2. **Werfen:** Hand wird geworfen. Vor dem Wurf gesperrte Seiten (durch Schreck) sind **sichtbar markiert** und können nicht fallen. `[GESPERRT]` **Wetzung/Scharte** modifizieren jetzt den gefallenen Seitenwert zum **effektiven Wert** (§8) — dieser gilt fortan für Pools, Gleichklang und Vollmond.
3. **Rerolls:** 1 Gratis-Reroll/Zug. Jeder weitere Reroll +1 Übermut. **Freilauf/Klemme** verändern die Reroll-Ökonomie dieses Zugs (§7.4). Reroll bei **Übermut > 6** löst Tischsturz aus (→ §7). `[GESPERRT]`
4. **Platzieren:** Seiten werden **links→rechts** in der Zug-Reihe angeordnet. Jede platzierte Seite kostet Atem (Start-Würfel 1 Atem). `[GESPERRT]`
5. **Ziel wählen:** **ein Ziel pro Zug**, kein Wechsel mitten im Paket. `Fläche`-Seiten treffen alle. `[GESPERRT]`
6. **Auflösen:** L→R, Reihenfolge nach §4.
7. **Zugende-Status:** **Brand** tickt — Ziel nimmt `Stapel` Schaden, dann Stapel −2. `[GESPERRT]`
8. **Rinde verfällt:** aller in diesem Zug nicht verbrauchter Block geht verloren. `[GESPERRT]`

### 2.3 Gegnerzug
1. Gegner führt angekündigte Absicht aus.
2. Schaden trifft zuerst auf Rinde des Spielers, Rest auf HP. **Rinde fängt keinen Status.** `[GESPERRT]`

### 2.4 Rundenende
- Morsch, Welk, **Wetzung, Scharte, Freilauf, Klemme** ticken **−1 (Decay/Runde)**. `[GESPERRT]`

### 2.5 Kampfende
- **Sauberer Sieg** (Bedingung → 03): **+1 Gemüt** auf jeden **gespielten** Würfel. `[GESPERRT]`
- Überschuss-Schaden bei Gegner-Tod **verfällt** (kein Übertrag ohne Keyword). `[GESPERRT]`
- **Kristallisation:** restliches Übermut (>0), das nicht in Tischsturz mündete, wird zusätzlich verarbeitet — siehe §7.2. `[GESPERRT — Sim-bestätigt 2026-06-30]`
- Alle kampf-begrenzten Eigen-Status (Wetzung/Scharte/Freilauf/Klemme, §8) **verfallen** — keine Übertragung in den nächsten Kampf. `[GESPERRT-Prinzip]`

---

## 3. Pools & Typbindung

- Platzierte Seiten laufen nach Wirkungs-Art in getrennte Pools: **Schaden**, **Rinde** (Block), **Fäule**, **Brand**, weitere Status.
- **Multiplikator-Seiten sind typgebunden:** eine Schaden-Mult (z. B. Wucht) multipliziert **nur** den Schaden-Pool.
- **Pools ≥ 0**, kein Negativschaden. `[GESPERRT]`
- **Mult auf leeren Pool = 0** (erlaubter Lernfehler). `[GESPERRT]`
- **Morsch/Welk wirken nur auf den Schaden-Pool**, nicht auf Fäule/Brand. `[GESPERRT]`
- **Wetzung/Scharte wirken auf den Wert JEDER gewürfelten Seite** (alle Pools), da sie den effektiven Wert setzen — dies ist der einzige pool-übergreifende Wert-Modifikator. `[GESPERRT-Prinzip]`

---

## 4. Auflösungs-Reihenfolge

**Fester Ablauf je Schaden-Pool, floor erst am Ende** (keine Zwischenrundung). `[GESPERRT]`

0. **Effektiver Wert** = Seitenwert ± Wetzung/Scharte (bereits beim Wurf gesetzt, §2.2). Alles Folgende rechnet mit diesem Wert. `[GESPERRT-Prinzip]`
1. **Effektiver Wert + Kraft + flache Passive** (additive Stufe; pro Schaden-Seite sofort). Eichwart-Passiv (+2) und Kraft (+`Stapel`) gehören hierher.
2. **× Mult** (typgebunden, z. B. Wucht)
3. **× Gleichklang**
4. **× Morsch** (Ziel-Debuff, erhöht erlittenen Schaden)
5. **× Welk** (Angreifer-Debuff, senkt ausgeteilten Schaden)
6. **floor** (abrunden)

### 4.1 Rechenbeispiel
Eichwart spielt eine Schaden-Seite, gefallener Wert **5**. Aktiv: Wetzung 1 (+1 effektiver Wert → 6), Kraft 1, Wucht ×2,0, Gleichklang ×1,5, Ziel hat Morsch 2 (+40 %), Spieler hat Welk 1 (−10 %).

| Schritt | Rechnung | Wert |
|--------|----------|------|
| Effektiver Wert (5 +Wetzung 1) | 6 | 6 |
| + Eichwart-Passiv | +2 | 8 |
| + Kraft | +1 | 9 |
| × Wucht | ×2,0 | 18 |
| × Gleichklang | ×1,5 | 27 |
| × Morsch | ×1,4 | 37,8 |
| × Welk | ×0,9 | 34,02 |
| **floor** | — | **34** |

### 4.2 Reihenfolge-Edge-Cases
- **Mult vor leerem Pool:** Wucht-Seite zählt, aber Pool ist 0 → bleibt 0.
- **Mehrere Mult im selben Pool:** multiplizieren nacheinander in Platzierungs-Reihenfolge (L→R), alle vor Gleichklang.
- **Fäule/Brand ignorieren** Mult/Morsch/Welk vollständig — sie ticken mit reinem Stapelwert.
- **Wetzung/Scharte vs. Fäule/Brand:** diese Status legen einen **Stapelwert** auf, keinen Seitenwert — Wetzung/Scharte verschieben nur den **gewürfelten Seitenwert** einer Fäule-/Brand-**auflegenden** Seite, falls deren Auflege-Menge an den Seitenwert gekoppelt ist. Reine Stapel-Effekte (fester Stapel) bleiben unberührt. `[PROVISORISCH: Kopplung je Gravur, s. 04]`
- **Scharte-Untergrenze:** der effektive Wert fällt nie unter **1** (§8.1) — kein 0- oder Negativwert durch Scharte.

---

## 5. Atem

- **3 Atem/Zug, fix.** Ungenutzter Atem verfällt. `[GESPERRT]`
- Start-Würfel kosten **1 Atem** je gespielte Seite. `[GESPERRT]`
- **Beruhigungs-Seite:** kostet 1 Atem (Wirkung → §6). `[GESPERRT]`
- Vollendete Würfel können 0 Atem kosten (Untergrenze 0). `[GESPERRT]`

---

## 6. Schreck & Gemüt

### 6.1 Gemüt
- **Pro Würfel**, Start **0**. `[GESPERRT]`
- **Push: −1 Gemüt** (auf den gepushten Würfel). `[GESPERRT]`
- **Sauberer Sieg: +1** (nur gespielte Würfel). `[GESPERRT]`
- **Trösten: +2 Gemüt** — universell, gilt für alle Kanäle (Events, Seiten, Segen). `[GESPERRT]`
- **Fröhlich-Bonus: +1** (nicht +3). `[GESPERRT]`

### 6.2 Schreck
- **Schreck = max(0, −Gemüt).** Ein Würfel mit Gemüt ≥ 0 hat keinen Schreck. `[GESPERRT]`
- **Wirkung:** Schreck sperrt die **höchsten freien Seiten** des Würfels (nicht zufällig), **vor dem Wurf sichtbar markiert**, **max 3** gesperrte Seiten. `[GESPERRT]`
- **Sperr-Kurve `mittel`:** 1 Seite ab Schreck 3, 2 Seiten ab Schreck 6, 3 Seiten ab Schreck 9. `[GESPERRT]`
- Gesperrte Seiten fallen beim Wurf **nicht**; der Würfel landet nur auf seinen freien Seiten.

### 6.3 Beruhigungs-Seite
- **+2 Gemüt** auf einen ängstlichen Hand-Würfel, Kosten **1 Atem**. `[GESPERRT]`
- Universelle Regel: **1 Trösten = +2 Gemüt.** `[GESPERRT]`

### 6.4 Edge-Cases
- Schreck-Sperrung greift **vor** dem Wurf — gesperrte hohe Seiten sind nicht würfelbar.
- Trösten über die 0-Linie hinaus baut **positives Gemüt** auf (Richtung Fröhlich); Schreck bleibt 0.
- Push auf einen bereits ängstlichen Würfel vertieft Schreck und kann eine weitere Top-Seite sperren, sobald die Kurven-Schwelle erreicht ist.

---

## 7. Übermut & Tischsturz

- **Kipp-Punkt 6.** `[GESPERRT]`
- **1 Gratis-Reroll/Zug.** Jeder weitere Reroll: **+1 Übermut.** `[GESPERRT]`
- **Tischsturz** bei **Übermut > 6** (also ab dem Reroll, der auf 7 bringt):
  - Das gesamte **Zug-Paket verfällt**. `[GESPERRT]`
  - **+2 Schreck auf die ganze Hand.** `[GESPERRT]`
  - **~3 Selbstschaden.** `[PROVISORISCH]` (Feinwert → 03)
- **Übermut-Reset auf 0 zu Kampfbeginn und nach Tischsturz — gilt nur für die Sofort-Mechanik.** `[GESPERRT]`

### 7.1 Edge-Cases (Sofort-Mechanik)
- Der erste Reroll ist gratis. Der zweite Reroll im selben Zug bringt Übermut auf 1 (kumuliert über Züge bis Tischsturz/Reset).
- Tischsturz trifft die **ganze Hand** mit Schreck, nicht nur gespielte Würfel.
- Nach Tischsturz ist der Zug verbraucht.

### 7.2 Kristallisation `[GESPERRT — Sim-bestätigt 2026-06-30]`

**Problem, das die Regel löst:** Ohne Kristallisation hat Rerollen unter optimalem Spiel keine run-lange Kosten. Kluges Spiel rollt so, dass Übermut nie über 6 steigt, und Übermut resettet ohnehin pro Kampf. Die Monte-Carlo-Sim (`Wuerfelhain_Welle1_Tor_Befund.md`) zeigte: kluge Gier schlägt Pflege konsistent — die Gier-vs-Pflege-Spannung existierte mechanisch nicht.

**Regel:** Bei Kampfende wird **restliches Übermut (>0), das nicht in Tischsturz mündete**, **1:1 in Gemüt-Abzug** (= Schreck) auf die **zuletzt gespielten Würfel** verteilt, statt zu verfallen.

- Die Sofort-Mechanik (Tischsturz-Risiko) bleibt **unverändert**.
- Kristallisation ist die **run-lange Konsequenz**: jeder bezahlte Reroll ist ein echter Tradeoff, nicht durch kluges Stoppen umgehbar.
- Verteilung auf die im **letzten Zug** gespielten Würfel. Bei 0 gespielten Würfeln (z. B. Tischsturz im letzten Zug) verfällt der Rest.
- **Zweite, unabhängige Schreck-Quelle** neben Push (§6.1) — beide addieren auf denselben `gemüt`-Wert.
- **Eingriff in den vormals `[GESPERRT]`-Reset-Satz**: gilt fortan nur für die Sofort-Wirkung.

### 7.3 Kristallisations-Edge-Cases
- Übermut, das per Tischsturz verbraucht wurde, kristallisiert **nicht zusätzlich** — Tischsturz und Kristallisation schließen sich pro Kampf aus.
- Kristallisierter Schreck ist identisch zu push-erzeugtem Schreck (Sperr-Kurve `mittel`, nur durch Trösten abbaubar).
- Reihenfolge Kampfende: erst Sauberer-Sieg-Bonus (§2.5), **dann** Kristallisation.
- Kristallisation prüft nur **Rest-Übermut am Kampfende**, nicht kumulierten Übermut.

### 7.4 Freilauf & Klemme (Reroll-Ökonomie-Status) `[GESPERRT-Prinzip, Werte PROVISORISCH]`

Zwei universelle Eigen-Status (Definition/Caps §8), die **direkt** an dieser Ökonomie ansetzen — dort, wo Würfelhain sich strukturell von kartenbasierten Spielen unterscheidet.

- **Freilauf `Stapel`:** gewährt **+`Stapel` übermut-freie Rerolls** in diesem Zug (zusätzlich zum Standard-Gratis-Reroll). Pflege-freundliches Ventil: erlaubt Nachbessern ohne Übermut-Aufbau.
- **Klemme `Stapel`:** die **ersten `Stapel` Rerolls** dieses Zugs kosten **je +1 zusätzliches Übermut**. Der Standard-Gratis-Reroll wird dabei **zuerst** verteuert (Klemme 1 ⇒ schon der erste Reroll kostet 1 Übermut).
- Beide sind **kampf-begrenzt**, ticken **−1/Runde** (§2.4), verfallen bei Kampfende.
- **Wechselwirkung mit Kristallisation:** Klemme beschleunigt Übermut-Aufbau → schnellerer Tischsturz **und** mehr Rest-Übermut zum Kristallisieren. Das ist der intendierte Druck (Gier wird teurer), muss aber per Sim gegen Oppression früh im Run geprüft werden (Cap + Decay begrenzen). Freilauf wirkt gegenläufig und ist bewusst die seltenere Ressource, um die Kristallisations-Kopplung nicht zu untergraben.

### 7.5 Freilauf/Klemme-Edge-Cases
- **Beide gleichzeitig:** verrechnen sich pro Reroll — Freilauf-Freischüsse werden gegen Klemme-Aufschläge zuerst gegengerechnet (ein Freilauf-Reroll, der auf eine Klemme-Stufe trifft, ist übermut-frei; Netto = max(0, Klemme − Freilauf) verteuerte erste Rerolls). `[PROVISORISCH: Verrechnung, Sim prüft]`
- **Klemme + Übermut-Stand nahe 6:** ein Klemme-verteuerter Reroll kann direkt in Tischsturz kippen — angekündigt über den sichtbaren Übermut-Zähler, kein verdeckter Sprung.
- Klemme ändert **nur die Reroll-Kosten**, legt **selbst keinen Schreck** auf (der entsteht erst indirekt über Tischsturz/Kristallisation).

---

## 8. Status-Set `[GESPERRT]`

### 8.1 Klassische Status (StS-geerdet)

| Status | Wirkung | Tick / Decay | Modell |
|--------|---------|--------------|--------|
| **Fäule** (Poison) | zu Beginn Trägerzug `Stapel` Schaden | dann Stapel −1 | direkter Schaden, ignoriert Mult/Morsch/Welk |
| **Brand** | zu Zugende `Stapel` Schaden | dann Stapel −2 | direkter Schaden, ignoriert Mult/Morsch/Welk |
| **Morsch** (Vulnerable) | Ziel nimmt **+20 %/Stapel** Schaden, Cap 4 (max +80 %) | −1/Runde | **additiv** auf Schaden-Pool |
| **Welk** (Weak) | Angreifer teilt **−10 %/Stapel** aus, Cap 4 (max −40 %) | −1/Runde | **additiv** auf Schaden-Pool |
| **Kraft** (Strength) | +`Stapel` auf jede gespielte Schaden-Seite | kein Decay (sofern nicht anders) | additive Stufe (§4.1) |
| **Riss** | **25 % Zünd-Aussetzer** je gespielter Seite, 2 Runden | läuft nach 2 Runden aus | Ausfall-Chance |
| **Glanz** | nächste gespielte Seite zählt **doppelt** (Basis ×2, vor Mult) | verbraucht sich | x2 auf eine Seite |

### 8.2 Eigen-Status (Würfelhain-nativ, universell) `[GESPERRT-Prinzip, Werte PROVISORISCH]`

Vier Status als zwei Buff/Debuff-Paare an den zwei Achsen, die kartenbasierte Spiele nicht haben: dem **gewürfelten Seitenwert** und der **Reroll-Ökonomie**. Additiv, stapelbar, **Cap 3**, **Decay −1/Runde**, **kampf-begrenzt**. Universell von Region 1 bis 6 nutzbar, weil beide Achsen jeden Zug berühren.

| Status | Achse | Wirkung | Cap | Decay |
|--------|-------|---------|-----|-------|
| **Wetzung** (Buff) | Seitenwert | **+`Stapel` auf den effektiven Wert JEDER gewürfelten Seite** (alle Pools, nicht nur Schaden) | 3 | −1/Runde |
| **Scharte** (Debuff) | Seitenwert | **−`Stapel` auf den effektiven Wert jeder gewürfelten Seite**, Untergrenze **1** | 3 | −1/Runde |
| **Freilauf** (Buff) | Reroll | **+`Stapel` übermut-freie Rerolls** diesen Zug (§7.4) | 3 | −1/Runde |
| **Klemme** (Debuff) | Reroll | **erste `Stapel` Rerolls** kosten je **+1 Übermut** (Gratis-Reroll zuerst verteuert, §7.4) | 3 | −1/Runde |

**Abgrenzung (wichtig, sonst redundant):**
- **Wetzung ≠ Kraft:** Kraft addiert erst bei der Auflösung und **nur** auf Schaden-Seiten. Wetzung setzt den **effektiven Wert schon beim Wurf** und wirkt auf **alle Pools** (Rinde-Block, Fäule-/Brand-Werte, Schaden gleichermaßen). Einziger pool-übergreifender Wert-Modifikator im Spiel.
- **Scharte ≠ Welk:** Welk ist ein prozentualer Malus **nur** auf den fertigen Schaden-Pool. Scharte ist ein flacher Malus auf den **Wert** jeder Seite **vor** allen Pools und kann u. a. **Vollmond brechen**.
- **Klemme/Freilauf** haben in kartenbasierten Spielen kein Gegenstück — sie greifen ausschließlich die Reroll-/Übermut-Ökonomie an.

### 8.3 Status-Edge-Cases
- **Morsch/Welk additiv:** 3 Morsch = +60 %, nicht (1,2)³. Reihenfolge §4 (Morsch vor Welk).
- **Harter Stapel-Cap 4** (Morsch/Welk), **Cap 3** (Eigen-Status): weitere Stapel werden nicht aufgenommen. Sauberer State. `[GESPERRT]`
- **Riss:** Aussetzer pro Seite gewürfelt, bevor sie in den Pool läuft; ausgesetzte Seite zählt 0, Atem verbraucht.
- **Glanz vor Mult:** verdoppelt den additiven Wert (inkl. effektivem Wert + Kraft + Passiv) der Seite, **bevor** §4-Multiplikatoren greifen. `[GESPERRT]`
- **Wetzung/Scharte-Reihenfolge:** wirken zeitlich **vor** Glanz — Glanz verdoppelt den bereits gewetzten/gescharteten Wert.
- **Scharte-Untergrenze 1:** ein gefallener Wert wird durch Scharte nie unter 1 gedrückt (kein 0-/Negativwert, keine Pool-Verwerfung).
- **Wetzung/Scharte + Gleichklang:** uniforme Verschiebung erhält die Gleichheits-Relation — Gleichklang zündet mit denselben Seiten wie ohne, nur auf einem verschobenen effektiven Wert. Sie **schaffen oder brechen keine** Gleichklang-Matches.
- **Fäule/Brand auf totes Ziel:** verfällt mit dem Ziel.
- **Kampf-Ende:** alle vier Eigen-Status verfallen (§2.5), kein Übertrag ins Arsenal.

---

## 9. Keywords (mit Edge-Cases)

| Keyword | Wirkung | Edge-Case |
|---------|---------|-----------|
| **Fläche** | trifft alle Gegner statt eines Ziels | `[GESPERRT]` Schaden je Ziel getrennt durch §4 gerechnet; Überschuss je Ziel verfällt einzeln. |
| **Beruhigung** | +2 Gemüt auf einen ängstlichen Hand-Würfel, 1 Atem | `[GESPERRT]` greift nur bei Würfeln mit Schreck > 0. |
| **Glanz** | nächste gespielte Seite ×2 | `[GESPERRT]` siehe §8.3 (vor Mult, nach Wetzung/Scharte). |

**Labung** (Tau) und **Prägung** (Münzen) sind Welle-3-Inhalt; Definition in Artefakt 04. `[PROVISORISCH]`

---

## 10. Combos

Auslöse-**Modelle** für Gleichklang, Echo, Vollmond sind `[GESPERRT]`; konkrete **Faktoren** bleiben `[PROVISORISCH]` (Sim/03). Alle Combos haben Anti-Lawinen-Selbstbremsen.

### 10.1 Gleichklang
- **Bedingung `[GESPERRT]`:** N gespielte Schaden-Seiten zeigen denselben **effektiven Seitenwert** → Schaden-Pool-Mult.
- **Stufen `[PROVISORISCH]`:** 2 gleiche = ×1,25, 3 = ×1,5, 4+ = ×1,75. Additiv (+0,25/Stufe), **harter Cap ×1,75**.
- **Reihenfolge:** Position 3 in §4, **nach** Wucht, **vor** Morsch.
- **Edge-Case:** zählt nur platzierte Seiten; gesperrte/ausgesetzte (Riss) zählen nicht. Uniforme Wetzung/Scharte ändern das Matching nicht (§8.3).

### 10.2 Echo
- **Bedingung `[GESPERRT]`:** eine **Echo-Seite** wiederholt die **unmittelbar links** platzierte Schaden-Seite **inklusive ihrer Multiplikatoren**.
- **Selbstbremse `[GESPERRT]`:** Echo-Beitrag **hart gedeckelt auf 1× Quellbeitrag**; max **1 Wiederholung** je Echo-Seite (kein Ketten-Echo).
- **Edge-Case:** Echo an Position 1 = 0. Echo nach Nicht-Schaden-Seite = 0. Echo-Seite zählt für Gleichklang mit, profitiert nur bis zum Quell-Cap.

### 10.3 Vollmond
- **Bedingung `[GESPERRT — verfeinert 2026-06-30]`:** jede gespielte Würfel-Seite erreicht **effektiven Wert ≥ natürlichem Höchstwert** ihres Würfels (Würfel-/Schaden-Typ egal) → einmaliger Flach-Bonus auf den Schaden-Pool (additiv).
- **Verfeinerung/Eingriff:** die vormals gesperrte Formulierung „alle gespielten Würfel **zeigen** ihren Höchstwert" wird zu „**effektiver Wert ≥ Höchstwert**" präzisiert, damit **Wetzung** Vollmond ermöglichen und **Scharte** ihn brechen kann (§8.2). Begründung: koppelt die neuen Seitenwert-Status an die dice-native Combo, statt Vollmond von ihnen zu isolieren. Reine Bedingungs-Präzisierung; der additive, regions-skalierte Burst (kein Mult) bleibt unverändert. Index 00 §3 / 03 §2/§3.1 ziehen nach. `[GESPERRT: Prinzip]`
- **Selbstbremse `[GESPERRT]`:** **flacher** Bonus (kein Mult), 1×/Zug. Bonuswert `[PROVISORISCH]` (→ 03 §3.1).
- **Edge-Case:** jede **Nicht-Schaden-Seite** (Rinde/Block, Beruhigung) bricht Vollmond. Scharte, die auch nur einen Würfel unter seinen Höchstwert drückt, bricht Vollmond. Tischsturz bricht Vollmond.

- Alle Combos zünden **1×/Zug**, stapeln miteinander. `[GESPERRT]`

---

## 11. Bewusst offene Punkte (für 03 / Sim / Folge-Artefakte)

Modelle stehen. **Offen bleiben Zahlen und Folge-Redaktion:**
- Handgröße-Bestätigung, sauberer-Sieg-Bedingung, Tischsturz-Selbstschaden, alle Combo-Faktoren (Gleichklang-Stufen, Vollmond-Burst-Kurve).
- **Eigen-Status-Werte (§8.2):** Aufschlag/Malus je Stapel, Caps (Start 3), Decay-Rate, Freilauf/Klemme-Verrechnung (§7.5). Sim eicht; danach in **03 §6** als Konstanten-Tabelle spiegeln.
- **Vollmond-Präzisierung (§10.3):** in **Index 00 §3** und **03 §2/§3.1** nachziehen.
- **Kampf-begrenzter Player-State** für die vier Eigen-Status braucht Schema-Slot in **09 §2** (analog `statusStapel`, aber spielerseitig).
- **Zuordnung Status → Gegner/Segen (05/07):** welche Gegner Scharte/Klemme auflegen (Regions-Themen 01 §7), welche Hain-Segen/Klassen Wetzung/Freilauf gewähren.
- **Wetzung/Scharte-Kopplung an Fäule-/Brand-Auflege-Mengen (§4.2):** je Gravur klären (04).
- Feinkalibrierung Region-1-Schwierigkeit ins Zielband 65–70 % unter Kristallisation (03 §13).
- Diese Werte **nicht** hier festklopfen — Sim belegt sie.
