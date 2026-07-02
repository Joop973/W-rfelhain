# Würfelhain — Master-Index & Bauplan (Artefakt 00)

*Das Rückgrat. Koordiniert alle anderen Artefakte. Lege dieses Dokument als **Projektdatei** ab, damit jeder Folge-Chat es per Suche findet, ohne dass du es neu einfügen musst.*

*Stand: 2026-06-30. Letzte Änderung: Kristallisations-Mechanik (Übermut→Schreck bei Kampfende) sim-bestätigt; Welle-1-Tor strukturell erfüllt; Artefakte 04+09 entsprechend ergänzt.*

---

## 0. Zweck & Nutzungsregeln

- Dieses Dokument ist die einzige **Inhalts-Karte** des Projekts. Es sagt, welches Artefakt was enthält und in welcher Reihenfolge gebaut wird.
- **Pro Folge-Chat wird genau EIN Artefakt erstellt oder aktualisiert.** Das schont Token und hält jeden Chat fokussiert.
- **Status-Konvention in allen Artefakten:**
  - `[GESPERRT]` — durch Design/Simulation bestätigt, ändert sich nur mit Begründung.
  - `[PROVISORISCH]` — erfunden, baubar, aber noch nicht balanciert. Die Sim entscheidet die Endwerte.
- Token-Regel: Folge-Chats fügen **nicht** die alten Design-Dokumente komplett ein. Sie referenzieren dieses Index + bei Bedarf die Projektdateien. Der Kickoff-Prompt (§6) enthält schon alle nötigen gesperrten Werte.

---

## 1. Artefakt-Karte

| Nr | Datei | Inhalt | Status-Mix | Welle | Erstellt |
|----|-------|--------|-----------|-------|----------|
| 00 | `00_Index_und_Bauplan.md` | Dieses Dokument: Karte, Reihenfolge, gesperrte Werte, Kickoff-Prompts | gesperrt | — | ✓ laufend |
| 01 | `01_Spielbeschreibung_und_Lore.md` | Ausführliche Spielbeschreibung, Ton, Narrativ, Wendung, 3 Enden, Regions-Themen | gesperrt + prov. | alle | — |
| 02 | `02_Mechaniken.md` | Kampf, Auflösungs-Reihenfolge, Atem, Schreck/Gemüt, Übermut/Tischsturz, Status, Keywords, Combos — exakte Regeln | gesperrt | 1/3 | ✓ 2026-06-30 — **Kristallisations-Update aussteht** |
| 03 | `03_Konstanten_und_Balancing.md` | ALLE tunbaren Zahlen an einem Ort + Sim-Befunde + Ziel-Metriken | gesperrt + prov. | alle | ✓ 2026-06-30 — **Kristallisations-Update aussteht** |
| 04 | `04_Wuerfel_und_Blaupausen.md` | Würfel-Schema, Start-Arsenale, Verzauber-/Gravur-Katalog, 16 Blaupausen | gesperrt + prov. | 1/2/3 | ✓ 2026-06-30 — Kristallisation in §1.1 ergänzt |
| 05 | `05_Gegner_und_Bosse.md` | Roster je Region, 6+4 Mechaniken, Stat-Kurven, 6 Bosse + Twists | provisorisch | 2/5 | — |
| 06 | `06_Klassen.md` | 5 Hüter-Klassen: Start-Arsenal, Passiv, Spielgefühl, Freischaltung | prov. (Eichwart gesperrt) | 1/4 | — |
| 07 | `07_Karte_Hain_Events_Oekonomie.md` | Regionen/Knoten, Hain-Segen-Pool, Events, 3 Währungen (Quellen/Senken), Händler | gesperrt + prov. | 2/3 | — |
| 08 | `08_Design_Platzhalter.md` | Kunst-/Audio-Richtung, Platzhalter-Specs (Größen, Hain-Tisch), Entsättigung | prov. | 2/5 | — |
| 09 | `09_Technik_und_Save.md` | Architektur, vollständiges Daten-Schema, Save-Format, Lokalisierung, Build-Stand | gesperrt | alle | ✓ 2026-06-30 — Kristallisation + Build-Stand ergänzt |

**Hinweis zu 02/03:** Inhaltlich noch auf dem Stand vor der Kristallisations-Entscheidung. §3 dieses Index dokumentiert die Regel bereits vollständig als Schnellreferenz — die Volltexte in 02 §7 und 03 §4 ziehen nach, sobald einer der beiden Artefakt-Chats erneut geöffnet wird.

---

## 2. Ausarbeitungs-Reihenfolge (Abhängigkeits-Rückgrat)

*Jede Stufe baut auf der darüber. Inhalt ist additiv (Datenzeilen); teuer sind Systeme + UI + Balancing.*

1. **Kampf-Mathe** (Formel/Atem/Auflösung) — `[GESPERRT]`, in `engine.js` umgesetzt.
2. **Eichwart-Arsenal + Wucht-Gravur** — `[GESPERRT]` (§3).
3. **Welle-1-Tor in JS schließen** — Sim mit echten Daten, Gier-vs-Pflege belegen. **Strukturell erfüllt (Sandbox-verifiziert, Kristallisations-Fix). Portierung ins Claude-Code-Repo noch offen.**
4. **Kern-Verzauber-Katalog** (nur was der Slice braucht), sim-geerdet.
5. **1 Region-1-Gegner** minimal → erster spielbarer Kampf-Slice.
6. **Welle 2** — Region 1 voll: Karte, Roster R1, Boss 1, Belohnungs-Flow, Schmiede+Händler, Save, lesbare Handy-UI, Tutorial-Boden.
7. **Welle 3** — Tiefe: Status voll, Combos, 3 Währungen, Synergie-/Furcht-Builds, Blaupausen/Talismane. Jedes Stück sim-geprüft.
8. **Welle 4** — Meta: Jahresringe, Stammbaum, Heimat-Hain/Samen, Reifegrade, Klassen-Freischaltung.
9. **Welle 5** — Voller Umfang: Regionen 2–6, Bosse, 3 Enden, narrative Schichten, Kunst/Audio.

**Harte Balance-Tore:** nach Stufe 3 (Gier-vs-Pflege greift) · nach Stufe 7 (mehrere Build-Pfade viable, keine Lawine) · nach Stufe 9 (voller Run balanciert).

---

## 3. Gesperrte Kern-Festlegungen (Schnellreferenz)

*Damit Folge-Chats nicht neu herleiten. Vollständig in 02/03/04.*

### Kampf & Auflösung
- Anordnung **links→rechts**. Reihenfolge der Modifikatoren: **Seitenwert + Kraft** (pro Schaden-Seite sofort) → **Glanz** (Basis ×2, vor Mult) → **×Mult** (typgebunden) → **Echo** (kopiert linken Nachbarn, Cap 1× Quelle) → Pool-Summe → **×Gleichklang** → **×Morsch** → **×Welk** → **+ Vollmond-Burst** → **floor**.
- Morsch/Welk wirken **nur auf den Schaden-Pool**, nicht auf Fäule/Brand.
- Pools ≥ 0, kein Negativschaden. Mult auf leeren Pool = 0 (erlaubter Lernfehler).
- Überschuss-Schaden bei Gegner-Tod **verfällt** (kein Übertrag ohne Keyword).
- **Ein Ziel pro Zug**, kein Wechsel mitten im Paket. `Fläche` trifft alle.
- **Block (Rinde)** verfällt je Zug, fängt **keinen** Status.
- **Atem 3 fix**, ungenutzt verfällt. Start-Würfel kosten 1 Atem.

### Combos (Modelle gesperrt, Faktoren teils prov.)
- **Gleichklang:** ≥2 gespielte Schaden-Seiten mit **demselben Seitenwert** → Schaden-Pool-Mult, gestaffelt **×1,25 / ×1,5 / ×1,75** bei 2/3/4+ (additiv +0,25, harter Cap ×1,75). Greift nach Mult, vor Morsch. Prüft das ganze Paket.
- **Echo:** dedizierte **Echo-Seite** kopiert den Beitrag der unmittelbar **links** platzierten Schaden-Seite inkl. deren Mults; Echo-Beitrag **hart gedeckelt auf 1× Quellbeitrag**, max 1 Wiederholung, **kein Ketten-Echo**. Position 1 oder nach Nicht-Schaden-Seite = 0.
- **Vollmond:** alle gespielten Würfel zeigen ihren **Höchstwert** → fester **additiver** Burst auf den Schaden-Pool (nicht multiplikativ), **skaliert mit Region**. Burst-Kurve `[PROVISORISCH]`: R1–R6 = **8 / 14 / 22 / 34 / 50 / 70** (~×1,5/Region, Sim eicht).
- Alle Combos zünden **nur 1× pro Zug**, stapeln aber miteinander.

### Schreck & Gemüt
- **Gemüt** pro Würfel, Start 0. Push: −1. Sauberer Sieg: +1 (nur gespielte Würfel). **Trösten: +2 (universell, alle Kanäle).** Fröhlich-Bonus: **+1** (nicht +3).
- **Schreck = max(0, −Gemüt).**
- **Schreck-Mechanik:** sperrt die **höchsten freien** Seiten eines Würfels (nicht zufällig), **vor dem Wurf sichtbar**, max 3. Kurve `mittel`: **1 Seite ab Schreck 3, 2 ab 6, 3 ab 9.**
- **Beruhigungs-Seite:** +2 Gemüt auf einen ängstlichen Hand-Würfel, Kosten 1 Atem.

### Übermut & Tischsturz
- **Kipp-Punkt 6.** 1 Gratis-Reroll/Zug; jeder weitere +1 Übermut.
- Tischsturz (Übermut > 6): Zug-Paket verfällt, **+2 Schreck auf ganze Hand**, ~3 Selbstschaden.
- Übermut-Reset auf 0 zu Kampfbeginn **und** nach Tischsturz — **gilt nur für die Sofort-Mechanik.**
- **Kristallisation `[GESPERRT — Sim-bestätigt 2026-06-30]`:** bei Kampfende wird restliches Übermut (>0), das nicht in Tischsturz mündete, **1:1 in Gemüt-Abzug** (= Schreck) auf die zuletzt gespielten Würfel verteilt, statt zu verfallen. Run-lange Konsequenz für Rerollen, zusätzlich zur Push-Schreck-Quelle. Begründung: ohne Kristallisation hat Rerollen unter optimalem Spiel keine Langzeit-Kosten — Welle-1-Tor war damit nicht schließbar (Befund: `Wuerfelhain_Welle1_Tor_Befund.md`). Eingriff in den vormals uneingeschränkten Reset-Satz oben.

### Status (StS-geerdet)
- **Fäule** (= Poison): zu Beginn Trägerzug `Stapel` Schaden, dann −1 Stapel.
- **Brand:** zu Zugende `Stapel` Schaden, dann −2 Stapel.
- **Morsch:** +20 %/Stapel, Cap 4 (max +80 %), Decay −1/Runde, **additiv**.
- **Welk:** −10 %/Stapel, Cap 4 (max −40 %), Decay −1/Runde, **additiv**.
- **Kraft** (= Strength): +`Stapel` auf jede gespielte Schaden-Seite.
- **Riss:** 25 % Zünd-Aussetzer, 2 Runden. **Glanz:** nächste gespielte Seite zählt doppelt (Basis ×2, vor Mult).

### Ökonomie
- **Münzen = reine Währung** (aus Kämpfen + Events), **kein** Prägen durch Push. Push-Preis = ausschließlich Schreck.
- Münzen ~14–16/Kampf · Eicheln ~8/Kampf · Tau ~6/Region → kombiniert **~1,2× StS-Kaufkraft**.
- Schmiede-Preise **40/60/80** je Stufe; Schmiede häufigster Shop (~0,7 der Händler-Knoten). ~12–13 Verzauberungen/Run.

### Eichwart (Start-Klasse) `[GESPERRT]`
- **4× Schadenswürfel:** Seiten 1,2,3,4,5,6 (alles Schaden).
- **2× Rindenwürfel:** Seiten 1,1,2,2,3,3 (alles Block/Rinde).
- Alle Kosten 1 Atem. **Passiv:** +2 Schaden auf jede gespielte Schaden-Seite.
- Reserve falls zu fragil: Rindenwürfel auf 1,2,2,3,3,4 (Ø 2,5).

### Erste Gravur „Wucht" (Schaden-Mult) `[GESPERRT]`
- Überschreibt eine Seite zur typgebundenen Schaden-Mult-Seite.
- Stufe 1/2/3 = ×1,5 / ×2,0 / ×2,5. Preis 40/60/80 Münzen.
- Additiver Zuwachs (+0,5/Stufe, Selbstbremse). Harter Cap 3 Stufen.

### Synergie-Paare (Welle-3-Inhalt, dimensioniert)
- **Tau:** Blaupause „Quell" + Keyword „Labung" — Basis 3, +1 je Trösten, Cap +8, run-lang, selbstbremsend.
- **Münzen:** Blaupause „Hort" + Keyword „Prägung" — 3 Münzen/Spiel, Kosten 1 Atem; Headroom max ~16–18 Verz./Run.

### Bewusste Abweichungen von der Spielbibel
1. Endlos-Modus gestrichen; Daily/Seed gestrichen (Seed nur intern für Tests).
2. Flüche können durch **Events** aufgedrückt werden (sonst freiwillig).
3. Vollendet-Bonus = **−1 Atem** (Untergrenze 0).
4. Fröhlich-Bonus +1 statt +3.
5. Münz-Seiten existieren nur via Blaupause „Hort" (keine Münz-Seiten in Basiswürfeln, da Münzen reine Währung).
6. Verzauberung: **harter Cap 3 Stufen pro Seite**.
7. Blaupausen = **ganzer Würfel** als Basis-Identität, überschreibt alle 6 Seiten, verbraucht sich.
8. Keine pauschale Skalier-Grenze; **jede Engine bremst sich selbst** (StS-Stil).
9. **Übermut-Reset gilt nur für die Sofort-Mechanik** (Tischsturz-Risiko); restliches Übermut kristallisiert bei Kampfende zu Schreck (s. Übermut & Tischsturz oben).

---

## 4. Build-Stand

**Claude-Code-Repo (echter Spielcode, Smartphone-Workflow):**
- `rng.js` — gesäter, deterministischer Zufall (mulberry32). `[GESPERRT]`
- `engine.js` — reine Kampf-Auflösung (drei Pools, L→R, Mult typgebunden, Kraft, Morsch/Welk final, floor). `[GESPERRT]`
- `push.js` — Übermut, Reroll, Tischsturz, Schreck, stimmungsabhängiges Würfeln. `[GESPERRT]`
- `tests/engine.test.js` — 11 Tests grün.
- **Kristallisations-Mechanik (Übermut→Schreck bei Kampfende) noch NICHT im Repo-Code** — nächster Code-Schritt.
- `data.js`, `save.js`, `ui/`, `sim/` — noch nicht angelegt.

**Sandbox-Referenzimplementierung (Design-Chat, nicht Teil des Repos):**
- Eigenständiger Node-Prototyp (`rng.js`/`engine.js`/`push.js`/`data.js`/`sim/gier_vs_pflege.js`) zur Verifikation gebaut, da kein Zugriff auf den echten Repo-Code bestand. Dient als Beleg-Werkzeug, nicht 1:1-Übernahmevorlage — Mechanik-Logik (`kristallisiereUebermut`) ist die zu portierende Referenz.
- **Welle-1-Tor strukturell ERFÜLLT:** Pflege-Politik schlägt blinde wie kluge Gier-Politik konsistent über mehrere Schwierigkeitsstufen. Exakte Zielband-Kalibrierung (65–70 % Siegrate, 03 §13) offen, reine Eichungsarbeit.
- Befund-Dokument: `Wuerfelhain_Welle1_Tor_Befund.md`.

**Design-Stand:** Artefakte 02 (Mechaniken) + 03 (Konstanten & Balancing) + 04 (Würfel & Blaupausen) + 09 (Technik & Save) erstellt. 04 + 09 bereits mit Kristallisations-Update; 02 + 03 inhaltlich noch ausstehend (s. §1-Hinweis).

**Gesamtstatus:** Welle-0-Tor erfüllt. **Welle-1-Tor strukturell erfüllt** (Sandbox-verifiziert) — Portierung ins Claude-Code-Repo ist der nächste konkrete Schritt, bevor Schema-Erweiterung für Welle 2 beginnt.

---

## 5. Multi-Chat-Protokoll

1. Neuer Chat im Projekt öffnen.
2. Den passenden **Kickoff-Prompt** aus §6 einfügen — er enthält schon alle gesperrten Bezugswerte.
3. Claude erstellt genau **ein** Artefakt, voll erfunden, mit `[GESPERRT]`/`[PROVISORISCH]`-Markierung.
4. Artefakt als Projektdatei ablegen.
5. **Diesen Index aktualisieren:** in der Karte (§1) Häkchen/Datum setzen; bei neuen gesperrten Werten §3 ergänzen.
6. Token-Disziplin: pro Chat nur ein Thema; keine Voll-Einfügung alter Dokumente.

---

## 6. Kickoff-Prompts je Artefakt

*Jeweils paste-ready. „Lies Index 00 und die Projektdateien" reicht als Kontext — die Kernwerte stehen in §3.*

**01 — Spielbeschreibung & Lore**
> Erstelle Artefakt 01 (Spielbeschreibung & Lore) für Würfelhain. Lies Index 00 §3 für gesperrte Werte. Inhalt: ausführliche Spielbeschreibung (Genre, Schleife, Eisberg-Prinzip), vollständiges Narrativ (Dürre = eigene Gier, Großmutter-Eiche-Wendung, früherer Hüter), die 3 Enden mit Schreck-/Trösten-Schwellen `[PROVISORISCH]`, Ton-Leitlinien, Themen der 6 Regionen. Deutsch, terse, Markdown.

**02 — Mechaniken** *(erstellt 2026-06-30 — Kristallisations-Update aussteht)*
> Aktualisiere Artefakt 02 (Mechaniken) §7 (Übermut & Tischsturz) um die Kristallisations-Regel aus Index 00 §3. Übernimm den Text wörtlich, arbeite ihn in den bestehenden Regeltext-Stil ein (Edge-Cases, Beispiele), markiere als `[GESPERRT — Sim-bestätigt 2026-06-30]`. Sonst unverändert. Deutsch, Markdown.

**03 — Konstanten & Balancing** *(erstellt 2026-06-30 — Kristallisations-Update aussteht)*
> Aktualisiere Artefakt 03 (Konstanten & Balancing) §4 (Übermut & Tischsturz) und §12 (Sim-Befunde) um die Kristallisations-Regel und den Welle-1-Tor-Befund aus Index 00 §3/§4. Deutsch, Markdown.

**04 — Würfel & Blaupausen** *(erstellt 2026-06-30, Kristallisation ergänzt)*

**05 — Gegner & Bosse**
> Erstelle Artefakt 05 (Gegner & Bosse), alles `[PROVISORISCH]`. Pro Region ein Roster mit Stat-Tabelle (HP, Schaden, Status-Mengen) nach den Stat-Kurven; die 6 StS- + 4 eigenen Mechaniken exakt definiert; Absichts-Muster; 6 Bosse mit Phasen, Regel-Twist, HP, Sonder-Belohnung; personalisierte Endboss-Phase aus dem ängstlichsten Würfel. Anti-Brick beachten. Deutsch, Markdown.

**06 — Klassen**
> Erstelle Artefakt 06 (Klassen). 5 Hüter-Klassen je Start-Arsenal (konkrete Würfel+Seiten), Passiv, Spielgefühl, Schwierigkeit, Freischalt-Reihenfolge. Eichwart `[GESPERRT]` aus Index 00 §3, Rest `[PROVISORISCH]`. Deutsch, Markdown.

**07 — Karte, Hain, Events & Ökonomie**
> Erstelle Artefakt 07. Run-Struktur (6 Regionen × 7 Knoten + Boss), Verzweigungs-/Garantie-Regeln, vollständiger Hain-Segen-Pool (StS-Relikt-Stil, mit Haken), Event-Liste (Stimmungs-/Währungs-/Risiko-Vignetten) mit Optionen, drei Währungen mit allen Quellen/Senken (gesperrte Einkommen aus Index 00 §3), Händler-Logik. Inflations-Check. Meist `[PROVISORISCH]`. Deutsch, Markdown.

**08 — Design-Platzhalter**
> Erstelle Artefakt 08 (Design-Platzhalter), alles `[PROVISORISCH]`. Kunst-Richtung (cozy Pixel-Art, Hain-Tisch-Konzept), Audio-Richtung (Folk, diegetisches Ausdünnen), Entsättigungs-System (Palette-Swap je Welk-Stufe — technische Umsetzung), vollständige Asset-Liste mit Platzhalter-Specs (feste Größen, z. B. 32×32, beschriftete Boxen). KEINE fertige Art — nur Platzhalter-Vorgaben. Deutsch, Markdown.

**09 — Technik & Save** *(erstellt 2026-06-30, Kristallisation + Build-Stand ergänzt)*

---

## 7. Nächster konkreter Schritt

**Kristallisations-Mechanik ins Claude-Code-Repo portieren.** Die Sandbox-Referenz (`push.js: kristallisiereUebermut()`) hat das Welle-1-Tor strukturell verifiziert; der echte Spielcode trägt die Regel noch nicht. Schritte: `push.js` im Repo um die Funktion ergänzen, Kampf-Loop verdrahten (Aufruf bei jedem Kampfende), `tests/engine.test.js` um Kristallisations-Fälle erweitern.

Parallel/danach: **02 und 03 inhaltlich nachziehen** (Kickoff-Prompts oben), dann Feinkalibrierung der Schwierigkeit ins Zielband 65–70 % (03 §13), dann **04 → 09 fertig** → **01 → 07 → 06 → 05 → 08** (Inhalt/Lore).
