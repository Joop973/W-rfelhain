# Würfelhain — Karte, Hain, Events & Ökonomie (Artefakt 07)

*Run-Struktur (DAG), Hain-Segen-Pool, Events, drei Währungen, Händler-Logik, Inflations-Check. Gesperrte Einkommen/Preise aus Index 00 §3 und 03 §8 wörtlich. `[GESPERRT]` = bestätigt. `[PROVISORISCH]` = baubar, Werte offen (Sim eicht). Regions-Themen aus 01 §7, Schema-Bezug aus 09 §2.7/§2.8/§2.10/§2.11.*

*Stand: 2026-07-02. Erstfassung (Karte 3er-breit, StS-Merge).*

---

## 1. Run-Struktur (Karte)

### 1.1 Makro

- **6 Regionen** (01 §7: Saumhain → Moderbruch → Schwelgrund → Dürrmark → Graupforte → Hohles Herz), linear hintereinander. `[GESPERRT — aus Index 00 §2]`
- Jede Region: **7 traversierte Knoten + 1 Boss** = 8 Knoten-Reihen. `[GESPERRT]`
- Ganzer Run: 6 × 8 = **48 durchlaufene Knoten**. `[PROVISORISCH — Herleitung, nicht gesperrt]`
- Kein Übertrag von Kampf-Status/Block/Übermut über Region-Grenzen (Kampf-lokal, 02 §2.5). Gemüt/Schreck, Währungen, Arsenal, Segen, Welk-Grad **bleiben** run-lang.

### 1.2 Knoten-Topologie je Region (verzweigter DAG, StS-Stil) `[PROVISORISCH]`

7 **Reihen** vor dem Boss; der Spieler durchläuft **genau einen Knoten je Reihe**. Die Wahl-Reihen sind **bis zu 3 Knoten breit** (Slay-the-Spire-Stil); Kanten verbinden nur benachbarte Reihen und **laufen ineinander über** — Pfade dürfen sich verzweigen und wieder zusammenlaufen (StS-Merge). Kein Rücksprung, kein Überspringen. Drei Slots geben pro Reihe echte Wahl (aggressiver Beute-Pfad vs. sicherer/pflegender Pfad).

| Reihe | Breite | Knoten (Auswahl) | fest? | Regel |
|---|---|---|---|---|
| 1 | bis 3 | **Kampf** (mehrere Einstiegs-Slots) | ja (Typ) | Alle Startknoten sind Kämpfe, nie Elite/Event/Lagerfeuer. |
| 2 | bis 3 | Kampf / Event | nein | min. 1 Kampf-Slot. |
| 3 | bis 3 | Kampf / Markt / Event | nein | — |
| 4 | bis 3 | Kampf / **Elite** / Event | nein | Elite erstmals erreichbar. |
| 5 | bis 3 | Kampf / **Elite** / Schmiede | nein | — |
| 6 | bis 3 | **Schmiede / Markt** (mehrere Läden) | ja (kommerziell) | Alle Slots kommerziell; Spieler wählt einen. |
| 7 | 1 | **Lagerfeuer** | ja | Zusammenlauf; Ruhe/Heilung/Trösten vor dem Boss. |
| Boss | 1 | **Boss** | ja | Regions-Boss, feste Sonder-Belohnung. |

- **Breite-1-Reihen** (7, Boss) sind Zusammenlauf-Punkte: alle Pfade münden hier, egal welche Kette davor gewählt wurde. Reihe 7 zwingt so vor jedem Boss durch das Lagerfeuer.
- **Reihe 1** ist typ-fest (nur Kämpfe), aber mehrere parallele Startknoten wie in StS.
- **Breite-3-Reihen** (2–6): der Knotentyp je Slot wird bei Karten-Generierung gezogen (Regeln §1.4); Slots dürfen gleich oder verschieden sein.
- Kadenz Reihe 6→7→Boss = *einkaufen → rasten → Boss*, klassischer StS-Rhythmus.

### 1.3 Knotentypen `[PROVISORISCH]`

| Typ | Inhalt |
|---|---|
| **Kampf** | Normalgegner (Roster → 05). Belohnung: Münzen + Eicheln + 1 Karten-artige Wahl (Blaupause/Gravur/Würfel/Segen, gewichtet 03 §10). |
| **Elite** | Stärkerer Gegner, höhere Beute, garantiert ≥1 Segen-Angebot. Reifegrad-Mods greifen zuerst hier (03 §9). |
| **Event** | Vignette mit Optionen (§5). Stimmung/Währung/Risiko/Fluch. |
| **Schmiede** | Gravuren aufwerten (Münzen, §3.1). |
| **Markt** | Würfel/Blaupausen/Segen kaufen (Eicheln), Würfel entfernen (Münzen, §3.3). |
| **Lagerfeuer** | Rasten: **Heilen** *oder* **Trösten** *oder* **Vollenden** (−1 Atem eines Würfels, 02 §5) — eine Aktion pro Feuer (§2.3). |
| **Boss** | Regions-Boss (→ 05), Sonder-Belohnung. R6 = früherer Hüter + personalisierte Phase (01 §4.4). |

### 1.4 Garantie- & Verzweigungsregeln `[PROVISORISCH]`

- Reihe 1 = Kampf, Reihe 6 = kommerziell, Reihe 7 = Lagerfeuer, Boss fest (s. §1.2). `[Prinzip GESPERRT-nah, Verteilung PROVISORISCH]`
- Auf **jedem** Pfad durch die Region erreichbar: min. **3 Kämpfe**, **1 Einkaufsknoten** (Reihe 6 immer), **1 Lagerfeuer**.
- **Elite-Garantie:** in Reihe 4 und/oder 5 liegt min. ein Elite-Slot so, dass er von jedem Pfad aus wählbar ist (Generator-Constraint: Kanten-Führung muss den Elite-Slot von allen Vorgänger-Knoten erreichbar lassen), damit kein Pfad die Region ohne Elite-Option durchläuft. `[PROVISORISCH]`
- **Sinnvolle Verzweigung (3er-Breite):** nicht alle Slots einer Reihe dürfen zum selben Nachfolger führen, sonst ist die Wahl kosmetisch. Generator hält min. 2 unterscheidbare Weiterführungen pro Wahl-Reihe. `[PROVISORISCH]`
- Elite und Lagerfeuer nie in Reihe 1–2.
- Event-Dichte: min. 1 Event pro Region auf typischem Pfad (Zufalls-abhängig, nicht garantiert erzwungen).
- **Blaupause-Pity** (03 §10): spätestens nach N≈6 Belohnungs-Knoten ohne Blaupause eine garantiert.
- Region-Übergang: kurze narrative Karte-Szene, Welk-Grad-Update (§1.5).

### 1.5 Welk-Grad-Kopplung `[PROVISORISCH]`

- `globalerWelkGrad` (09 §2.10) treibt die Entsättigung (Palette-Swap 08) und den narrativen Ton (01 §6 „diegetisches Ausdünnen").
- **Basis-Kopplung:** +1 Welk-Grad je betretener Region (monoton, 01 §7). So verarmt der Hain zum Herzen hin auch ohne Gier.
- **Schreck-Kopplung (Vorschlag):** hoher Arsenal-Gesamt-Schreck beim Region-Übergang addiert **+1** Welk-Grad extra (Gier beschleunigt die Dürre sichtbar). Schwelle `[PROVISORISCH]`. Rein kosmetisch/tonal, **kein** Kampf-Malus — Verwechslung mit Kampf-Status *Welk* (02 §8) vermeiden.
- Segen **Dürre-Same** (§4.2) kann den Welk-Grad zusätzlich treiben (thematischer Haken).

---

## 2. Drei Währungen — Quellen & Senken

### 2.1 Rollen-Split `[PROVISORISCH — Einkommen gesperrt, Aufgaben-Zuschnitt erfunden]`

Die drei Währungen spiegeln die Achse (01 §8). Klarer, nicht-überlappender Zweck:

| Währung | Rolle | Verb | Konnotation |
|---|---|---|---|
| **Eicheln** | **Erwerben** — neue Würfel, Blaupausen, Segen am Markt | „nimm, was gegeben wird" | ehrlich, warm |
| **Münzen** | **Verbessern** — Gravuren an der Schmiede, Würfel entfernen | „drängen, aufrüsten" | kühl, metallisch |
| **Tau** | **Pflegen** — Trösten, Heil-Boost, speist Labung/Quell | „heilen" | knapp, kostbar |

Trennung ist Absicht: Münzen kaufen **nie** Heilung oder Trösten (Gier heilt nicht), Tau kauft **nie** Schaden-Gravuren (Pflege rüstet nicht auf).

### 2.2 Einkommen `[GESPERRT]` (aus Index 00 §3 / 03 §8)

| Währung | Einkommen | Quelle |
|---|---|---|
| Münzen | ~14–16/Kampf | Kämpfe + Events (reine Währung, **kein** Prägen durch Push) |
| Eicheln | ~8/Kampf | Kämpfe |
| Tau | ~6/Region | Pflege/Struktur, Region-weise |

- Elite ≈ ~1,8× Normal, Boss ≈ ~2,5× Normal Münzen/Eicheln. `[PROVISORISCH]`
- Push kostet **ausschließlich Schreck**, nie Währung. `[GESPERRT]`
- Kombinierte Kaufkraft: **~1,2× StS-Basis**, nicht 3×. `[GESPERRT]`

### 2.3 Senken

| Senke | Währung | Kosten | Status |
|---|---|---|---|
| Gravur Stufe 1/2/3 | Münzen | 40 / 60 / 80 | `[GESPERRT]` |
| Gravur-Typ-Wechsel | Münzen | +50 % auf Stufe-1-Preis der neuen Gravur | `[PROVISORISCH]` (04 §3.2) |
| Würfel entfernen | Münzen | ~25–50, steigend (§3.3) | `[PROVISORISCH]` (03 §8) |
| Neuer Würfel (Markt) | Eicheln | ~35–45 | `[PROVISORISCH]` |
| Blaupause (Markt) | Eicheln | ~60–100 (nach Seltenheit) | `[PROVISORISCH]` |
| Segen (Markt/selten) | Eicheln | ~70–120 | `[PROVISORISCH]` |
| Lagerfeuer Heil-Boost | Tau | ~4/Anwendung | `[PROVISORISCH]` |
| Trösten-Dienst (Markt/Event) | Tau | ~3 je +2 Gemüt | `[PROVISORISCH]` |
| Labung-Engine (Quell) | — | speist sich aus Trösten-Zahl, nicht direkt aus Tau | `[GESPERRT]` (04 §4.1) |

- **Tau ist die knappste Ressource** (~6/Region) — bewusstes Gate des Pflege-Pfads, deckt sich mit dem Labung-Cap (+8) und der Welle-1-Beobachtung, dass früher Trösten-Zugang knapp, aber vorhanden sein muss (03 §12.1 Nebenbefund).

### 2.4 Inflations-Check `[PROVISORISCH — Herleitung]`

Kampf-fähige Reihen sind 1–5 = **5 Knoten** (Reihe 6 kommerziell, 7 Lagerfeuer). Ein Event/Markt-Slot **ersetzt** dort einen Kampf, addiert nicht. Typischer Pfad über die 5 Knoten: Reihe 1 Kampf + 1 Elite + 0–1 Event, Rest Kämpfe → **3–4 Kämpfe + 1 Elite** (+ Boss).

**Münzen brutto/Region:**
- Ohne Event: 4×15 + Elite ~27 + Boss ~38 = **~125**
- Mit 1 Event (ersetzt 1 Kampf): 3×15 + 27 + 38 + Event ~8 = **~118**
- → ~118–125/Region · × 6 ≈ **~710–750 Münzen brutto**

**Münzen-Bedarf/Run (Ziel ~12–13 Gravuren, 03 §8):**
- Bsp. 8× St.1 (40) + 3× St.2 (60) + 2× St.3 (80) = 320 + 180 + 160 = **660**
- + 2× Würfel entfernen (25 + 40) = 65
- → **~725 Münzen Bedarf**

**Ergebnis: brutto ≈ Bedarf** — praktisch ausgeglichen, **kein** Puffer. Der Spieler muss Gravuren priorisieren oder auf Elite-/Event-Beute setzen, um alle ~12–13 zu erreichen; kein 3×-Inflations-Loch. Reifegrad 4 (Preise +20 %, 03 §9) drückt ins Defizit und erzwingt härtere Priorisierung — gewollt. `[PROVISORISCH — Elite-/Boss-Multiplikatoren und Event-Ausbeute sim-abhängig; leichte Anhebung der Kampf-Münzen im gesperrten Band 14–16 verschafft bei Bedarf Luft]`

**Eicheln:** ~66/Region × 6 ≈ ~400 brutto; Arsenal 6→~14 wird großteils aus Kampf-Belohnungen (frei) gefüllt, Markt-Käufe (~3 Würfel + 1–2 Blaupausen ≈ 250–350) passen hinein. Kein Überschuss.

**Tau:** ~36/Run + Event/Segen-Zuschüsse — reicht für **einen** konsequent verfolgten Pflege-Hebel (Heil-Boost *oder* Quell-Fütterung), nicht für beide voll. Knappheit erzwingt Pflege als *Entscheidung*, nicht als Gratis-Dazu.

Fazit: Einkommen × Run-Länge landet konsistent bei ~12–13 Gravuren und ~1,2× StS-Kaufkraft, ohne dass eine Währung überläuft. `[Sim eicht die Elite-/Boss-Multiplikatoren und Markt-Preise]`

---

## 3. Händler

### 3.1 Schmiede (~0,7 der Händler-Knoten) `[GESPERRT-Anteil, Bestand PROVISORISCH]`

- Häufigster Shop (03 §8). Aufwerten von Seiten-Gravuren, Preise **40/60/80** (`[GESPERRT]`).
- Bestand: 3–5 Gravur-Angebote/Besuch, gewichtet nach freigeschaltetem Slice-Katalog (04 §3). Wucht `[GESPERRT]`, Rest `[PROVISORISCH]`.
- Gravur-Typ-Wechsel auf schon verzauberter Seite gegen Aufpreis (04 §3.2).
- Kein Heilen, kein Trösten (Münzen-Zweck-Trennung, §2.1).

### 3.2 Markt (~0,3 der Händler-Knoten) `[PROVISORISCH]`

- Bestand: 1–2 Würfel, 0–1 Blaupause, 0–1 Segen, 1 Würfel-entfernen-Dienst.
- Zahlung: Würfel/Blaupausen/Segen mit **Eicheln**; Würfel entfernen mit **Münzen**; optional Trösten-Dienst mit **Tau**.
- Seltenheits-Pity (03 §10) greift auf Markt-Angebote mit.

### 3.3 Würfel entfernen (Senke) `[PROVISORISCH]` (03 §8)

- Startpreis **25 Münzen**, **+15/Anwendung** (25 → 40 → 55 → …), Deckel offen (Sim). Verhindert triviales Deck-Dünnen, bleibt aber ein sinnvoller Konsistenz-Hebel gegen aufgeblähtes Arsenal (Ziel ~14, 03 §1).
- Am **Markt** verfügbar; ggf. seltener als Event-Option.

---

## 4. Hain-Segen-Pool

### 4.1 Prinzipien `[GESPERRT — Prinzip, Werte PROVISORISCH]`

- Relikt-Stil (StS): passive Dauer-Modifikatoren, run-lang. Schema 09 §2.8 (`hatHaken`, `hakenTextKey`, `seltenheit`).
- **An die Achse gebunden:** Segen lehnen entweder Richtung Gier (starker Effekt, Schreck-/Welk-Haken) oder Pflege (belohnt Trösten/sauberen Sieg), oder sind neutrale Utility.
- **Anti-Lawinen-Disziplin (03 §14):** kein Segen liefert freie multiplikative Skalierung. Prozent-Boni sind flach und/oder konditional selbstbremsend; Ressourcen-Segen sind gedeckelt.
- Einige gewähren **Wetzung/Freilauf** (Buff-Seite der Eigen-Status, 02 §8.2); Debuffs (Scharte/Klemme) verteilen **Gegner** (→ 05), nicht eigene Segen.
- **Haken = ehrlicher Preis**, nie versteckt: Boni mit Haken sind stärker, der Haken sichtbar im Segen-Text.

### 4.2 Pool-Tabelle `[PROVISORISCH]`

Achse: **G** = Gier-lehnend, **P** = Pflege-lehnend, **N** = neutral.

| # | Name | Selt. | Achse | Effekt | Haken (`hatHaken`) |
|---|---|---|---|---|---|
| 1 | **Morgentau-Krug** | häufig | P | +2 Tau je Region | — |
| 2 | **Rindenring** | häufig | N | Erster gespielter Rinde-Würfel/Zug: +2 Block | — |
| 3 | **Fleißiges Eichhorn** | häufig | N | +3 Eicheln/Kampf | — |
| 4 | **Warmes Moos** | häufig | P | Lagerfeuer-Heilung +25 % | — |
| 5 | **Wetzstein** | selten | N | Kampfbeginn: 1 zufälliger Hand-Würfel erhält **Wetzung 1** | — |
| 6 | **Loser Ast** | selten | N | +1 übermut-freier Reroll **pro Kampf** (nicht /Zug) — sanftes **Freilauf**-Ventil | — |
| 7 | **Geduldiger Wächter** | selten | P | Sauberer Sieg gibt **+2** Gemüt (statt +1) | ja: Kämpfe **mit** HP-Verlust geben keinen Eicheln-Bonus |
| 8 | **Gieriger Griff** | selten | G | Erster bezahlter Reroll/Zug kostet **0 Übermut** | ja: Kristallisation am Kampfende **+1** Schreck-Rest |
| 9 | **Splitternde Borke** | selten | G | **Vollmond-Burst +50 %** (flach, additiv bleibt) | ja: jeder Zug **ohne** Vollmond legt 1 Würfel **Scharte 1** auf |
| 10 | **Klarer Quell** | episch | P | **Trösten gibt +3** Gemüt (statt +2, universell) | ja: Tau-Einkommen **−2/Region** |
| 11 | **Doppelter Morgen** | episch | N | Kampfbeginn: 2 Hand-Würfel **Wetzung 1** | ja: Gegner starten mit +1 auf ihren Absichtswert |
| 12 | **Hamsterherz** | episch | G | Behalte bis **5** Rinde-Block über den Zug hinaus (Cap 5 = Bremse) | ja: −5 Max-HP |
| 13 | **Ungeduld** | episch | G | **+1 Atem/Zug** (also 4) | ja: Kristallisation **2:1** statt 1:1 (doppelter Rest-Schreck) |
| 14 | **Stiller Hain** | boss | P | Solange Arsenal-Gesamt-Schreck **= 0**: **+15 % Schaden** (flach, konditional) | ja: schaltet sich ab, sobald Schreck > 0 — bis wieder 0 |
| 15 | **Krone des alten Hüters** | boss | G | Schmiede-**Stufe-1-Preise −50 %** | ja: jeder Kampf startet mit 1 zufälligem Würfel **Klemme 1** |
| 16 | **Dürre-Same** | boss | G | Jeder Kill: **+2 Münzen** | ja: **+1 Welk-Grad je Region** (Dürre beschleunigt, §1.5) |

Slice-Hinweis: für Welle 2 (Region 1) genügen die **häufig**-Segen + wenige selten; episch/boss ab Welle 3, wenn Combos/Status voll aktiv sind.

### 4.3 Segen-Verteilung im Run `[PROVISORISCH]`

- **Boss-Segen** nur als Boss-Sonder-Belohnung (1 Wahl/Boss).
- **Elite** garantiert ≥1 Segen-Angebot (selten/episch gewichtet).
- **Markt** kann selten Segen führen (Eicheln, §3.2).
- Gezogene Segen sind einmalig (kein Doppel im selben Run).

---

## 5. Events

### 5.1 Prinzipien `[PROVISORISCH]`

- Schema 09 §2.7: `titel`, `textKey`, `optionen[]`, `kannFluchAufdruecken`.
- Drei Vignetten-Arten: **Stimmung** (Gemüt/Schreck), **Währung** (Handel/Risiko), **Fluch/Risiko** (starker Bonus gegen dauerhaften Nachteil).
- Jede Option nennt ihre Konsequenz sichtbar (Ton 01 §6: kein belehrender Text, aber ehrliche Wahl).
- Optionen spiegeln die Achse: es gibt fast immer eine **gierige** (schneller Vorteil, Schreck/Fluch) und eine **pflegende** (Tau/Trösten, langsamer) Antwort.

### 5.2 Event-Liste `[PROVISORISCH]`

| Event | Region | Art | Optionen (Effekt) | Fluch? |
|---|---|---|---|---|
| **Der überwucherte Brunnen** | R1–2 | Währung | A: Münzen schöpfen (+20 Münzen, 1 Würfel −1 Gemüt) · B: den Brunnen pflegen (+4 Tau, 1 Trösten) · C: weitergehen | nein |
| **Das verängstigte Kätzchen-Würfel** | R1–3 | Stimmung | A: aufnehmen (ängstlicher Würfel mit Schreck 2 ins Arsenal, aber solides Gesicht) · B: trösten und ziehen lassen (1 Trösten, kein Würfel) | nein |
| **Moderpfütze** | R2 | Risiko | A: durchwaten (Blaupause **Giftranke**-Chance, aber 1 Würfel Fäule-Anfälligkeit-Fluch) · B: umgehen (nichts) | ja |
| **Die schwelende Wurzel** | R3 | Risiko | A: Glut ernten (Zunder-Gravur gratis, 3 Selbstschaden) · B: löschen (+3 Tau) | nein |
| **Schrein der raschen Gaben** | R2–4 | Fluch | A: opfere Ruhe (Fluch-Seite auf 1 Würfel + episch-Belohnung) · B: bete still (1 Trösten) · C: geh | ja |
| **Wetzstein am Wegrand** | R1–4 | Währung | A: Würfel schärfen (−20 Eicheln → 2 Würfel dauerhaft +… kleiner Wert, kein Fluch) · B: Stein mitnehmen (Segen **Wetzstein**) | nein |
| **Die stumme Lichtung** | **R4** | Zweifel | s. §5.3 | nein |
| **Der hohle Stumpf** | **R5** | Zweifel | s. §5.3 | nein |
| **Die trockene Quelle** | R4–5 | Risiko | A: bis zum Grund graben (+30 Münzen, 1 Würfel Scharte-Fluch) · B: Tau sammeln, was bleibt (+3 Tau) | ja |

### 5.3 Zweifel-Events (R4/R5) `[PROVISORISCH]` (01 §9)

Stellen den Mentor **tonal** in Frage, **ohne** die Wendung (01 §4.3) zu spoilern. Keine Namensnennung des früheren Hüters, kein „die Eiche ist tot" — nur Risse im vertrauten Ton.

**Die stumme Lichtung (R4):** Auf einer Lichtung setzt die Stimme der Eiche kurz aus; für einen Moment ist nur der Wind zu hören, dann kehrt sie zurück und drängt weiter.
- A: **dem Rat folgen** — „nicht trödeln, weiter" (kleiner Sofort-Bonus: +10 Münzen; 1 Würfel −1 Gemüt).
- B: **verweilen und dem Hain zuhören** (1 Trösten; ein stiller Hinweis-Text, der Unbehagen sät).

**Der hohle Stumpf (R5):** Ein alter, ausgehöhlter Stumpf mit den Spuren eines früheren Wächters — Werkzeug, verdorrte Gaben, kein Körper.
- A: **plündern** — die Gaben nehmen (+25 Münzen + 8 Eicheln; +2 Schreck auf 1 Würfel; die Stimme lobt).
- B: **bestatten** — die Reste zur Ruhe betten (2 Trösten; +3 Tau; die Stimme schweigt auffällig).

Beide: Option B deutet die Wahrheit an (früherer Hüter, Gier-Kreislauf), Option A verstärkt die Bindung an den Mentor — die Wahl selbst wird später bedeutsam, ohne dass es hier ausgesprochen wird.

### 5.4 Fluch-Aufdrückung `[GESPERRT — Abweichung 2, Index 00 §3]`

- Events **dürfen** Fluch-Seiten erzwingen (`kannFluchAufdruecken: true`), sonst sind Flüche freiwillig.
- Fluch-Seiten = aufgedrückte schlechte Basis-Seiten oder Eigen-Riss-nahe Nachteile (Detail-Katalog → 05/spätere Fassung). Immer an einen **spürbaren Gegenwert** gekoppelt (episch-Belohnung, Blaupause).
- Fluch bleibt run-lang, entfernbar nur über Würfel-entfernen (§3.3) oder seltene Segen/Events. `[PROVISORISCH]`

---

## 6. Offene Punkte für Sim / Folge-Artefakte

- **Elite-/Boss-Währungs-Multiplikatoren** (§2.2) und Markt-Preise (§2.3) sim-eichen — Inflations-Check hängt daran.
- **Node-Zahlen im Inflations-Check** (§2.4) gegen echte durchschnittliche Pfadlänge prüfen (Sim über generierte Karten).
- **Welk-Grad-Schreck-Schwelle** (§1.5): ab welchem Arsenal-Schreck +1 Extra-Welk? Rein kosmetisch halten.
- **Segen-Haken-Werte** (§4.2): v. a. Ungeduld (2:1 Kristallisation), Krone (Klemme-Start), Dürre-Same (Welk) auf Oppression prüfen (03 §12.1 Spiral-Nebenbefund).
- **Tau-Knappheit** (§2.3): reicht der Pflege-Zugang in R1–2, um kristallisierten Schreck abzubauen, bevor die Spirale kippt? (Kernfrage aus 03 §12.1 / 04 §6.)
- **Fluch-Katalog** (§5.4) und **personalisierte R6-Endphase** (01 §4.4) → Artefakt 05.
- **Zweifel-Event-Texte** (§5.3) final gegen Spoiler-Grenze redigieren, sobald 01-Narrativ im Voll-Run steht.
- **DAG-Generierungs-Regeln** (§1.4) als Algorithmus formalisieren (Kanten-Wahrscheinlichkeiten, Erreichbarkeits-Garantie) → Welle 2, `data.js`/Karten-Generator.
