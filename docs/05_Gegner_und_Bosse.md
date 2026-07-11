# Würfelhain — Gegner & Bosse (Artefakt 05)

*Roster je Region, Gegner-Mechaniken (6 StS + 4 Eigen-Status), Absichts-Muster, 6 Bosse mit Phasen/Twist/Belohnung, personalisierte Endboss-Phase, Trösten-Auflösung, Anti-Brick. Stat-Kurven aus 03 §7, Gegner-Schema aus 09 §2.6, Regions-Themen aus 01 §7, Endboss aus 01 §4.4/§5.*

*Status: **alles `[PROVISORISCH]`** — außer wo ein gesperrter Bezugswert wörtlich zitiert wird. Sim entscheidet Endwerte.*

*Stand: 2026-07-03. Erstfassung. Region-1-Werte kalibriert gegen den 12er-Arsenal-Re-Run (03 §12.1, Seed 20260703); **gegen diesen Re-Run erneut zu prüfen, sobald Gravuren/Segen im Slice dazukommen** (s. §1.2, §8).*

---

## 0. Lesehinweis & Kalibrier-Vermerk

- Alle Zahlen hier sind `[PROVISORISCH]`. Sim-abhängige Werte (HP, Schaden, Status-Mengen, Boss-HP, Phasen-Schwellen) sind zusätzlich mit **`[SIM]`** markiert.
- **Region-1-Werte** sind aus dem 12er-Re-Run abgeleitet (§1.2). Sie treffen das Reifegrad-0-Zielband (65–70 %, 03 §13) **für die gravurlose Pflege-Politik**. Sobald Gravuren/Segen den Spieler-Output anheben, verschiebt sich die Basis → **Nach-Eichung gegen 03 §12.1 nötig.**
- Regionen 2–6 sind **un-simuliert**: reine Kurven-Extrapolation aus 03 §7, Startpunkte.

---

## 1. Stat-Grundlagen

### 1.1 Kurven-Bezug (aus 03 §7, `[PROVISORISCH]`)

| Region | Normal-HP | Elite-HP | Boss-HP | Gegner-Schaden/Zug |
|---|---|---|---|---|
| 1 | 20–45 | 60–80 | 110–130 | 5–10 |
| 2 | 40–70 | 100–130 | 180–210 | 9–15 |
| 3 | 70–110 | 150–190 | 280–320 | 14–22 |
| 4 | 110–160 | 220–270 | 400–450 | 20–30 |
| 5 | 160–230 | 320–380 | 550–620 | 28–40 |
| 6 | 230–320 | 450–520 | 750–850 | 38–55 |

Anker (03 §7, gesperrt-konsistent): Hüter-Output R1 ~15–17/Zug → Normalgegner in 2–3 Zügen tot.

### 1.2 Region-1-Kalibrierung `[SIM, PROVISORISCH]`

Aus dem 12er-Re-Run (n=5000/Politik, Run=9 Kämpfe, Seed 20260703): die Stufe **„mittel"** bringt Pflege auf **70,2 %** Siegrate — im Zielband. Der effektive Gegner-Schaden dieser Stufe liegt bei **~7,8–10,4**, am oberen Rand bzw. leicht über der 03-§7-Spanne (5–10).

**Kalibrierter Region-1-Notierwert:** **Schaden 8–10/Zug**, Normal-HP **30–45** (oberer Spannenrand), Elite-Mix **50–65 HP**. Damit bleibt genug Kampflänge (Ø 2,61 Züge/Kampf unter Pflege), dass Übermut-Akkumulation und Kristallisation überhaupt greifen (03 §7-Hinweis).

Bezugstabelle (identisch für „moderat"/„mittel", Re-Run):

| Stufe | Politik | Siegrate | Ø-Schreck Σ/Arsenal | Ø-Züge/Kampf |
|---|---|---|---|---|
| moderat | Gier (blind) | 1,3 % | 81,3 | 3,39 |
| moderat | Gier (klug) | 97,4 % | 46,5 | 2,67 |
| moderat | **Pflege** | **98,5 %** | **0,0** | 2,64 |
| mittel | Gier (blind) | 0,8 % | 64,2 | 3,14 |
| mittel | Gier (klug) | 63,4 % | 44,7 | 2,62 |
| mittel | **Pflege** | **70,2 %** | **0,0** | 2,61 |

**Lesart:** „mittel" ist die kalibrierte Region-1-Basis. Pflege (70,2 %) schlägt kluge Gier (63,4 %) — Welle-1-Relation gewahrt. **`[PROVISORISCH]` im Design-Sinn:** Werte treffen das Band ohne Gravuren/Segen; mit Slice-Ausbau nachzueichen.

---

## 2. Gegner-Mechaniken — die 6 StS-Status als Gegner-Werkzeug `[PROVISORISCH]`

Wirkung, Modelle und Caps aus 02 §8.1 / 03 §6 (dort `[GESPERRT]`). Hier: **wie ein Gegner sie einsetzt** (Quelle = Gegner). Ein Gegner legt Status **angekündigt** auf (Absicht `typ:"status"`, 09 §2.6).

| Status | Ziel | Gegner-Einsatz | Menge/Anwendung `[SIM]` |
|---|---|---|---|
| **Fäule** | Hüter-HP | DoT auf den Hüter: zu Beginn des Gegnerzugs? Nein — tickt zu Beginn des **Trägerzugs**; auf den Hüter gelegt tickt sie zu **Spielerzug-Beginn** (`Stapel` Schaden, dann −1). Verwesungs-Gegner. | R2: 2–3 · R6: 4–6 |
| **Brand** | Hüter-HP | DoT: zu **Zugende** `Stapel` Schaden auf Hüter, dann −2. Schwelgrund-Gegner. Hoher Sofort-Peak, schneller Decay. | R3: 3–5 · R6: 5–7 |
| **Morsch** | Hüter (eingehend) | Gegner macht Hüter **verwundbar**: Hüter nimmt **+20 %/Stapel** aus **Gegner-Angriffen** (Cap 4). *Parallel-Anwendung zur Spieler-seitigen Morsch-Regel — `[PROVISORISCH]`, s. §2.1.* | R4/R6: 1–2 |
| **Welk** | Hüter-Output | Gegner schwächt den Hüter: **−10 %/Stapel** auf den fertigen **Schaden-Pool** des Hüters (Cap 4, additiv, Decay −1/Runde). Dürrmark-Kern. | R4: 1–3 · R6: 2–4 |
| **Kraft** | Gegner selbst | **Self-Buff:** +`Stapel` auf jeden eigenen Angriff. Berserk-/Eskalations-Gegner. Kein Decay. | R3+: 1–2/Zug |
| **Riss** | Hüter-Würfel | **25 % Zünd-Aussetzer** je gespielter Seite, 2 Runden. Legt Furcht-Chaos auf, ohne Seiten zu sperren. Graupforte-Kern. | R5: 1× (2 Runden) |

**Glanz** ist **kein** Gegner-Werkzeug (Spieler-/Segen-seitiger Buff, 02 §8.1) → hier nur der Vollständigkeit halber ausgenommen. Damit bleiben **6** gegner-taugliche Status.

### 2.1 Morsch als Gegner-Mechanik — Design-Entscheidung `[GESPERRT — Option A, entschieden 2026-07-06]`

03 §6 definiert Morsch/Welk als additive Modifikatoren **nur auf den Schaden-Pool des Hüters**. Ein Gegner, der dem Hüter Morsch aufdrückt, hätte darin **keine** Wirkung (der Hüter füllt keinen eigenen eingehenden Pool). Zwei saubere Optionen standen zur Wahl:

- **(A, GEWÄHLT — B7-Entscheid):** Gegner-Morsch wirkt **symmetrisch** auf **eingehenden** Schaden — Hüter nimmt +20 %/Stapel aus Gegner-Angriffen (Cap 4, Decay −1/Runde, verrechnet **vor** Block). Implementiert als `eingehendMult` in `engine.js`, verdrahtet in `fuehreGegnerzugAus`.
- ~~(B, Fallback): Gegner benutzen kein Morsch; Verwundbarkeit über Kraft-Self-Buff.~~ **Verworfen.**

**Sim-Befund (sim/morsch_gegner_ab.js, n=5000, Region-1-Elite):** A hält 99,8 % Siegrate bei +19 % HP-Verlust — selbstbremsender Druck, Block bleibt Konterspiel. B fiel auf 96,2 % bei +28 % HP-Verlust mit unbegrenzt wachsendem Maximaltreffer (additive Uhr, bestraft langsame Builds überproportional — Konflikt mit 03 §14).

Roster-Konsequenz: Morsch bei Gegnern weiterhin **sparsam** (R4/R6-Elite, Boss-Spitzen) — jetzt als bewusste Dosierung, nicht mehr als Absicherung.

---

## 3. Gegner-Mechaniken — die 4 Eigen-Status als Gegner-Werkzeug `[PROVISORISCH]`

Definition/Caps aus 02 §8.2 (Cap 3, Decay −1/Runde, kampf-begrenzt). Entscheidend: **Wetzung und Freilauf sind Buffs auf die Spieler-Achsen** (effektiver Würfelwert bzw. Reroll-Ökonomie) — ein Gegner würfelt nicht und rerollt nicht, kann sie also **nicht sinnvoll auf sich selbst** legen. Sie sind **Segen-/Klassen-seitig** (02 §271 offener Punkt), **nicht** Gegner-Werkzeug. Gegner nutzen ausschließlich die **Debuff-Hälften**:

| Status | Achse | Gegner-Einsatz | Menge `[SIM]` | Träger-Regionen |
|---|---|---|---|---|
| **Wetzung** (Buff) | Seitenwert | — **kein** Gegner-Werkzeug (Segen/Klasse gewährt). | — | — |
| **Scharte** (Debuff) | Seitenwert | Gegner legt Scharte auf den Hüter: **−`Stapel`** auf den effektiven Wert **jeder** gewürfelten Seite (alle Pools), Untergrenze **1**. Kann Vollmond brechen (02 §8.3). | 1–2 | **R4, R5** |
| **Freilauf** (Buff) | Reroll | — **kein** Gegner-Werkzeug (Segen/Klasse gewährt). | — | — |
| **Klemme** (Debuff) | Reroll | Gegner verteuert Rerolls: erste `Stapel` Rerolls kosten je **+1 Übermut** (Gratis-Reroll zuerst). Treibt Übermut → Tischsturz/Kristallisation. Legt selbst **keinen** Schreck (02 §7.5). | 1–2 | **R5** |

**Zuordnung (01 §7-Kandidaten, bestätigt):** Scharte ab **Region 4** (Dürrmark, Auszehrung) und **Region 5**; Klemme erst **Region 5** (Graupforte, Furcht/Aussetzer). Region 6 bündelt beides.

**Warum so spät:** Scharte (Wert-Malus) und Klemme (Reroll-Steuer) greifen direkt die Gier-Ökonomie an — früh eingeführt würden sie die Schreck-Spirale (03 §12.1 Nebenbefund) zu früh zünden. Erst ab R4/R5, wenn der Spieler Trösten-Zugang (Beruhigung, Segen) etabliert hat.

---

## 4. Absichts-Muster (angekündigt, 09 §2.6) `[PROVISORISCH]`

Jeder Gegner zeigt vor dem Spielerzug **eine** Absicht (`absichtAktuell`, `angekuendigt:true` gesperrt). Muster-Archetypen:

| Muster | Absichts-Typ | Verhalten | Telegraf |
|---|---|---|---|
| **Schläger** | `angriff` | Fester/leicht schwankender Angriff jeden Zug. | Zahl sichtbar. |
| **Wächter** | `block` → `angriff` | Blockt einen Zug, schlägt den nächsten hart. | Schild-Icon dann Zahl. |
| **Sieche** | `status` | Legt Status (Fäule/Welk/Scharte…), geringer/kein Direktschaden. | Status-Icon + Stapel. |
| **Rasende** | `mehrfach` | Mehrere kleine Treffer (Kraft-skaliert). | n×-Icon. |
| **Wetterwechsler** | rotiert | Fester Zyklus (z. B. Angriff→Status→Block), lesbar/lernbar. | Nächster Zyklus-Schritt sichtbar. |

**Regel `[PROVISORISCH]`:** Absichten sind **deterministisch genug zum Lernen** (kein reiner Zufall pro Zug) — die Tiefe liegt im Reagieren, nicht im Raten. Eliten/Bosse nutzen `mehrfach`- und Rotations-Muster; Region-1-Normalgegner fast nur `Schläger`/`Wächter`.

---

## 5. Roster je Region `[PROVISORISCH]`

*Schaden = pro Zug, vor Kraft/Morsch. Status-Mengen = Stapel je Anwendung, `[SIM]`. Absicht = Haupt-Muster (§4).*

### Region 1 — Saumhain (Grundlagen, ruhig) `[SIM: kalibriert §1.2, gegen 12er-Re-Run zu prüfen]`

| Gegner | Rolle | HP | Schaden | Status | Absicht | Mechanik |
|---|---|---|---|---|---|---|
| Astbeißer | Normal | 30–38 | 8–9 | — | Schläger | reiner Angriff |
| Borkenkriecher | Normal | 38–45 | 6–8 | — | Wächter | blockt Zug 1 |
| Moosgnom | Normal | 30–35 | 8–10 | — | Schläger | leicht schwankend |
| **Dornalter** | Elite | 60–65 | 9–10 | — | Wetterwechsler | Angriff↔Block-Rotation |

*Kein Status-Auflegen in R1 — Lernboden. Werte aus §1.2 (Schaden 8–10, HP 30–45/50–65).*

### Region 2 — Moderbruch (Fäule / Morsch) `[SIM, un-kalibriert]`

| Gegner | Rolle | HP | Schaden | Status | Absicht | Mechanik |
|---|---|---|---|---|---|---|
| Fäulnisqualle | Normal | 45–55 | 9–11 | Fäule 2 | Sieche | Fäule auf Hüter |
| Sporenbalg | Normal | 50–65 | 10–12 | Fäule 2–3 | Schläger→Sieche | Angriff + Fäule-Tick |
| Schimmelwicht | Normal | 40–50 | 9–10 | — | Rasende | 2× kleine Treffer |
| **Modermutter** | Elite | 100–115 | 12–14 | Fäule 3 | Wetterwechsler | streut Fäule pro Zyklus |
| **Pilzhort** | Elite | 115–130 | 11–13 | Fäule 2 | Wächter | blockt, dann Fäule-Welle |

### Region 3 — Schwelgrund (Brand) `[SIM, un-kalibriert]`

| Gegner | Rolle | HP | Schaden | Status | Absicht | Mechanik |
|---|---|---|---|---|---|---|
| Glutkorn | Normal | 70–80 | 14–16 | Brand 3 | Sieche | Brand auf Hüter |
| Aschekriecher | Normal | 85–100 | 15–18 | Brand 3–4 | Schläger | Angriff + Brand |
| Funkenschwarm | Normal | 70–85 | 13–15 | — | Rasende | 3× Treffer, Kraft-skaliert |
| **Schwelbrand-Ur** | Elite | 150–170 | 18–20 | Brand 4, Kraft 1/Zug | Rasende | Kraft-Eskalation |
| **Glutwächter** | Elite | 170–190 | 16–19 | Brand 4 | Wächter | Block→Brand-Doppel |

### Region 4 — Dürrmark (Welk; Scharte-Einstieg) `[SIM, un-kalibriert]`

| Gegner | Rolle | HP | Schaden | Status | Absicht | Mechanik |
|---|---|---|---|---|---|---|
| Dürrgeist | Normal | 110–130 | 20–23 | Welk 2 | Sieche | Welk (Output-Malus) |
| Zehrranke | Normal | 130–150 | 21–24 | Welk 1–2, **Scharte 1** | Schläger→Sieche | Welk + erste Scharte |
| Aschgabler | Normal | 115–135 | 22–25 | — | Rasende | 2–3× Treffer |
| **Auszehrer** | Elite | 220–245 | 26–29 | Welk 3, **Morsch 1** (§2.1) | Wetterwechsler | Welk + Verwundbarkeit |
| **Rissmark-Alter** | Elite | 245–270 | 24–27 | **Scharte 2** | Wächter | Block→Scharte-Welle |

### Region 5 — Graupforte (Schreck / Riss; Scharte + Klemme) `[SIM, un-kalibriert]`

| Gegner | Rolle | HP | Schaden | Status | Absicht | Mechanik |
|---|---|---|---|---|---|---|
| Furchtwisp | Normal | 160–185 | 28–31 | **Riss 1** (2 Rd.) | Sieche | Zünd-Aussetzer |
| Klemmzange | Normal | 185–210 | 30–33 | **Klemme 1–2** | Schläger→Sieche | Reroll-Steuer |
| Scharkant | Normal | 170–195 | 29–32 | **Scharte 1–2** | Schläger | Wert-Malus |
| Stillewicht | Normal | 160–180 | 28–30 | Welk 2, **Riss 1** | Rasende | Chaos-Treffer |
| **Graupförtnerin** | Elite | 320–350 | 34–37 | **Klemme 2**, **Scharte 1** | Wetterwechsler | volle Gier-Steuer |
| **Rissfürst** | Elite | 350–380 | 32–36 | **Riss 1**, Welk 3 | Rasende | Aussetzer + Schwächung |

### Region 6 — Hohles Herz (alles gebündelt) `[SIM, un-kalibriert]`

| Gegner | Rolle | HP | Schaden | Status | Absicht | Mechanik |
|---|---|---|---|---|---|---|
| Hohlenwächter | Normal | 230–260 | 38–42 | Scharte 2, Brand 4 | Wetterwechsler | gemischt |
| Dürre-Echo | Normal | 260–290 | 40–44 | Welk 3, **Klemme 2** | Sieche | Output + Reroll |
| Schreckborke | Normal | 240–270 | 39–43 | **Riss 1**, Fäule 4 | Rasende | Aussetzer + DoT |
| **Rindenhohl** | Elite | 450–485 | 46–50 | **Morsch 2** (§2.1), Scharte 2 | Wächter | Verwundbarkeit + Malus |
| **Letzter Schatten** | Elite | 485–520 | 44–48 | **Klemme 2**, **Scharte 2**, Welk 4 | Wetterwechsler | volle Debuff-Bündelung |

---

## 6. Bosse `[PROVISORISCH]`

Ein Boss je Region. HP aus 03 §7 (Boss-Spalte). Jeder Boss: **2–3 Phasen** (HP-Schwellen), **ein Regel-Twist** (kampf-lokaler Modifikator), **Sonder-Belohnung** (Blaupause/Gravur/Boss-Segen, 09 §2.3/§2.8). Alle Werte `[SIM]`.

### Boss 1 — Der Saumhüter *(Saumhain)* — HP 110–130

Verdorrter Wächter am Rand, noch fast heil. Lehr-Boss.

- **Phase 1 (100–50 %):** Schläger, Schaden 9–11. Zeigt Absichten überdeutlich.
- **Phase 2 (<50 %):** wechselt zu Wächter-Rotation, gelegentlich `mehrfach`.
- **Regel-Twist „Erste Geduld":** Jede **dritte** Boss-Runde blockt er zwingend statt anzugreifen — belohnt Warten/sauberen Sieg, bestraft überhastetes Gier-Push. Sanfte Einführung der Tempo-Frage.
- **Sonder-Belohnung:** garantierte Wahl aus 1 **Blaupause** (häufig) **oder** Gravur-Rabatt-Segen.

### Boss 2 — Die Modermutter-Brut *(Moderbruch)* — HP 180–210

Riesige Fäulnis-Kolonie. Fäule/Morsch-Thema.

- **Phase 1:** Sieche — legt Fäule 3, Schaden 10–12.
- **Phase 2 (<60 %):** Fäule-Stapel auf dem Hüter **eskalieren** (Auflege +1/Zyklus).
- **Regel-Twist „Ausbreitung":** Fäule auf dem Hüter **decayt nicht** (−1 ausgesetzt), solange der Boss über 30 % HP hat — zwingt aktives Wegspielen/Trösten statt Aussitzen.
- **Sonder-Belohnung:** Blaupause **Quell** (Tau/Labung-Engine, 03 §3-Verweis) oder episch-Gravur-Wahl.

### Boss 3 — Der Schwelbrand *(Schwelgrund)* — HP 280–320

Fieberndes Glutwesen. Brand + Kraft.

- **Phase 1:** Rasende, 3× Treffer, Brand 4.
- **Phase 2 (<66 %):** Self-**Kraft 2/Zug** (Eskalation).
- **Phase 3 (<33 %):** Brand-Auflege + Kraft gleichzeitig — Zeitdruck.
- **Regel-Twist „Auflodern":** Am Ende jeder Boss-Runde erhöht sich sein Grund-Schaden um +1 (kumulativ) — der Kampf **muss** vorankommen; reines Blocken verliert. Gegengewicht: Brand auf den Boss selbst zündet doppelt (belohnt Fäule/Brand-Builds).
- **Sonder-Belohnung:** Brand-Gravur (episch) oder Boss-Segen „Glutkern" (Brand-Auflege +1).

### Boss 4 — Der Auszehrer-Fürst *(Dürrmark)* — HP 400–450

Ausgedörrte Gestalt. Welk + Scharte, erste offene Dürre.

- **Phase 1:** Sieche — Welk 3 + Scharte 1, Schaden 22–25.
- **Phase 2 (<50 %):** Welk **und** Scharte pro Zyklus, Morsch 1 (§2.1) als Spitze.
- **Regel-Twist „Auszehrung":** Passiv-**Welk 1** auf den Hüter zu **jedem** Rundenbeginn (bis Cap 4) — der Output sinkt schleichend; zwingt entweder Tempo (schnell töten) oder Welk-Gegenspiel. **Anti-Brick:** Welk ist Prozent-Malus, sperrt nichts — Output bleibt >0.
- **Sonder-Belohnung:** Blaupause (Wert-/Wetzung-nah) oder Tau-Paket.

### Boss 5 — Die Graupförtnerin *(Graupforte)* — HP 550–620

Stille Torwächterin der Furcht. Riss + Scharte + Klemme — der Preis der Gier maximal sichtbar.

- **Phase 1:** Wetterwechsler — Scharte 2, dann Klemme 2, dann Angriff.
- **Phase 2 (<50 %):** Riss 1 (Dauer-erneuert) **plus** eine Debuff-Achse/Zug.
- **Regel-Twist „Enge Pforte":** Solange der Hüter **Übermut > 0** ins Rundenende trägt, legt sie **+1 Schreck** auf einen zufälligen Hand-Würfel (angekündigt). Direkte mechanische Bestrafung von Gier im Boss-Kontext — Spiegel der Kristallisation. **Anti-Brick:** wirkt nur bei selbst-erzeugtem Übermut; sauberes/gepflegtes Spiel bleibt unberührt.
- **Sonder-Belohnung:** episch-Segen „Ruhiger Wurf" (Freilauf-Quelle) — als Gegengewicht zum Klemme-Thema, belohnt das Überstehen.

### Boss 6 — Der frühere Hüter *(Hohles Herz)* — HP 750–850 · Endboss

Die Wendung (01 §4.3). Drei Phasen; die dritte ist **personalisiert** (§7). Trösten-Auflösung → Frühling (§8).

- **Phase 1 „Die Stimme" (100–66 %):** kämpft als vertrauter Mentor-Ton — moderate, lesbare Muster (Schläger/Wächter), Schaden 38–44. Legt kaum Status: die Maske hält noch.
- **Phase 2 „Der Riss" (66–33 %):** Maske bricht — volle Debuff-Bündelung (Scharte 2, Klemme 2, Welk, gelegentlich Riss/Morsch). Wetterwechsler mit `mehrfach`-Spitzen.
- **Phase 3 „Dein Spiegel" (<33 %):** **personalisierte Phase** (§7) — sein Moveset wird aus dem ängstlichsten Arsenal des Spielers gebaut.
- **Regel-Twist „Das hohle Echo":** Am Ende **jeder Runde** heilt der Boss um das **Rest-Übermut** des Hüters zu diesem Zeitpunkt (vor Reset). Rührt **nicht** an der Kristallisations-Regel (03 §4.1, Kampfende-only, `[GESPERRT]`) — eigenständiger, boss-lokaler Rundenend-Effekt, additiv zur normalen Kristallisation bei Kampfende. Gier füttert ihn wörtlich, Runde für Runde. **Anti-Brick:** rein spieler-erzeugt; Pflege-Spiel (Übermut konsequent unter 6, wenig Reroll) deaktiviert den Twist faktisch.
- **Sonder-Belohnung:** Run-Ende — keine Item-Belohnung, sondern das **Ende** (§8): Erbe / Stiller Hain / Frühling.

---

## 7. Personalisierte Endboss-Phase (01 §4.4) `[PROVISORISCH]`

**Prinzip (gesperrt, 01 §4.4):** die finale Phase spiegelt das **ängstlichste Würfel-Arsenal** des Spielers — die Würfel mit dem höchsten angesammelten Schreck, mit ihren gesperrten Seiten und ihrer Furcht, gegen ihn selbst gewendet.

**Mechanische Umsetzung `[PROVISORISCH, SIM]`:**

1. Bei Eintritt in Phase 3 wählt der Kampf die **Top-N ängstlichsten Arsenal-Würfel** des Spielers (höchstes `max(0,−gemuet)`). **N = min(3, Anzahl Würfel mit Schreck > 0)** — nie mehr, als der Spieler tatsächlich hat (Anti-Brick, §9).
2. Jeder gewählte Würfel wird zu einem **Boss-Angriffs-Modul**:
   - **Schaden des Moduls** = Summe der **gesperrten (höchsten) Seiten** dieses Würfels × Skalar `k` `[SIM, Start k=1,0]`.
   - **Modul-Schreck** = der `gemuet`-Malus des Würfels wird als **+Scharte/Klemme-Stapel** (1 je 3 Schreck, Cap 2) auf den Hüter gespiegelt — die Furcht kommt zurück.
3. Der Boss spielt pro Zug **ein** Modul (Rotation), angekündigt (`mehrfach` bei N≥2 möglich).
4. **Skalierung mit Gier:** Je mehr Schreck der Run erzeugt hat, desto härter und zahlreicher die Module. Gepflegtes Spiel (wenig/kein Schreck) → **N kann 0 sein** → Phase 3 fällt auf ein ruhiges Standard-Moveset zurück (das ist die „ruhige Spiegelung", 01 §4.4).

**Kernaussage:** Wer gierig war, kämpft gegen sein eigenes verängstigtes Arsenal. Wer gepflegt hat, sieht Ruhe — und hat mehr Werkzeug für die Trösten-Auflösung (§8).

---

## 8. Trösten-Auflösung → „Der neue Frühling" (01 §5) `[PROVISORISCH]`

Das wahre Ende verlangt, den Hüter **zu befrieden statt zu erschlagen** (01 §5, gesperrtes Prinzip). Mechanische Bedingung:

**Der Boss trägt ein eigenes Schreck-Konto** `bossSchreck` `[SIM, Start = 12–16]`.

- **Kill-Pfad (Standard):** Boss-HP auf 0 → Kampf gewonnen. Ende nach Run-weitem End-Schreck (01 §5): Erbe (≥~40) / Stiller Hain (dazwischen) / — Frühling **nur**, wenn zusätzlich befriedet (s. u.).
- **Trösten-Pfad (Frühling):** In **Phase 3** kann der Spieler **Trösten/Beruhigung gegen den Boss** richten (Beruhigungs-Seiten, Trösten-Events-Nachwirkung, Segen). Jedes Trösten-Ereignis senkt `bossSchreck` um **2** (universeller Trösten-Wert, gesperrt 03 §5). Bei `bossSchreck ≤ 0` **während** Phase 3 → **befriedet**, Kampf endet ohne Kill.

**Frühling-Gesamtbedingung (01 §5, alle drei nötig):**
1. **Boss befriedet** (`bossSchreck ≤ 0` via Trösten, nicht totgeschlagen), **und**
2. **End-Schreck ≤ ~10** (Run-weit), **und**
3. **Trösten-Zahl ≥ ~8** (Run-weit).

Ist der Boss totgeschlagen (HP 0 zuerst) → maximal **Stiller Hain**, nie Frühling — die aktive Pflege-Auflösung ist Pflicht (01 §5-Designregel).

**Entscheidung `[PROVISORISCH, bestätigt]`:** Gegen `bossSchreck` zählt **ausschließlich** Beruhigung/Trösten (reaktiv, Schreck-abbauend) — **Ermutigung zählt nicht**, auch nicht anteilig. Konsistent mit der care-class-Trennung Beruhigung (reaktiv, Schreck > 0) vs. Ermutigung (proaktiv, universell). Ermutigung bleibt für Run-weiten End-Schreck/Trösten-Zahl (01 §5) relevant, wirkt aber nicht auf den Boss selbst. Sim prüft, ob `bossSchreck` 12–16 gegen Trösten-Zahl-Schwelle 8 stimmig ist.

**`bossSchreck`-Startwert** ist bewusst so gesetzt, dass ~6–8 Trösten-Ereignisse in Phase 3 nötig sind — nur ein **run-lang gepflegtes** Arsenal (genug Beruhigungs-Kapazität, niedriger Eigen-Schreck) schafft das. Gier-Runs haben die Werkzeuge dafür nicht.

---

## 9. Anti-Brick-Garantien `[GESPERRT-Prinzip, Werte PROVISORISCH]`

Kein Gegner/Boss darf den Spieler **vollständig aussperren**. Verankerte Schranken:

1. **Scharte-Untergrenze 1** (02 §8.3, gesperrt): kein 0-/Negativwert, Würfel bleiben spielbar.
2. **Schreck sperrt max 3 Seiten** (03 §5, gesperrt): nie einen ganzen Würfel.
3. **Riss = 25 % Aussetzer** (02 §8.1, gesperrt): probabilistisch, kein Totalausfall; läuft nach 2 Runden aus.
4. **Klemme Cap 3, Decay −1/Runde** (02 §8.2): verteuert Rerolls, verbietet sie nie; Gratis-Wurf bleibt möglich (nur teurer).
5. **Welk/Morsch = Prozent-Modifikatoren**, sperren nichts — Output/Eingang bleibt >0.
6. **Personalisierte Endphase: N ≤ vorhandene ängstliche Würfel** (§7) — kann nie mehr spiegeln, als existiert; bei 0 Schreck → kein personalisiertes Modul.
7. **Trösten/Beruhigung immer verfügbar:** Beruhigungs-Seite (1 Atem, +2 Gemüt) und Hain-Segen sind kein Gegner sperrbar — der Ausweg aus jeder Schreck-Spirale bleibt offen (03 §12.1 Nebenbefund: früher Trösten-Zugang ist Pflicht).
8. **Debuff-Stapel-Bündelung gedeckelt:** kein Gegner legt mehr als **2 Debuff-Achsen gleichzeitig** pro Zug (Roster §5 hält das ein), damit keine Kombo-Klippe entsteht.

---

## 10. Offene Sim-/Design-Punkte

- **Region-1-Nach-Eichung** gegen 12er-Re-Run (03 §12.1), sobald Gravuren/Segen im Slice sind — die Basis (Schaden 8–10, HP 30–45/50–65) verschiebt sich mit steigendem Spieler-Output. **Priorität.**
- **Regionen 2–6 vollständig un-simuliert** — reine Kurven-Extrapolation, jeder Wert `[SIM]`.
- **Morsch-als-Gegner (§2.1):** Option A (eingehend-Multiplikator) braucht `engine.js`-Erweiterung; sonst Fallback B. Code/Sim entscheidet.
- **Personalisierte Phase (§7):** Skalar `k`, N-Cap, Schreck→Scharte/Klemme-Umrechnung — alles Startwerte.
- **`bossSchreck`-Startwert (§8):** 12–16 gegen Trösten-Zahl-Schwelle 8 und Ermutigung-Ausschluss balancieren.
- **Absichts-Determinismus (§4):** exakter Zufall-Anteil pro Muster — Spielgefühl/Sim.
- **Boss-Twists (§6):** jeder Twist gegen die jeweilige Regions-Schwierigkeit prüfen (v. a. Boss 3 „Auflodern" vs. Block-Builds, Boss 6 „hohles Echo" vs. Gier-Runs).
