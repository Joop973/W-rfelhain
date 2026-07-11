# Würfelhain — Master-Index & Bauplan (Artefakt 00)

*Das Rückgrat. Koordiniert alle anderen Artefakte. Lege dieses Dokument als **Projektdatei** ab, damit jeder Folge-Chat es per Suche findet, ohne dass du es neu einfügen musst.*

*Stand: 2026-07-02. Letzte Änderung: Batch-Nachzug aus `06_Aenderungen.md` — Arsenal 6→12 `[GESPERRT-OVERRIDE]`, Ziehstapel-Modell, Keyword Ermutigung, Vollmond-Präzisierung + Schliff-Ausnahme, Eigen-Status in §3 gespiegelt, Karte aktualisiert (01/06/07 ✓), Kristallisations-Nachzüge in 02/03 abgehakt.*

---

## 0. Zweck & Nutzungsregeln

- Dieses Dokument ist die einzige **Inhalts-Karte** des Projekts. Es sagt, welches Artefakt was enthält und in welcher Reihenfolge gebaut wird.
- **Pro Folge-Chat wird genau EIN Artefakt erstellt oder aktualisiert.** Das schont Token und hält jeden Chat fokussiert. *(Ausnahme sanktioniert: Batch-Nachzug 2026-07-02 über sechs Artefakte, ausgelöst durch `06_Aenderungen.md`.)*
- **Status-Konvention in allen Artefakten:**
  - `[GESPERRT]` — durch Design/Simulation bestätigt, ändert sich nur mit Begründung.
  - `[PROVISORISCH]` — erfunden, baubar, aber noch nicht balanciert. Die Sim entscheidet die Endwerte.
  - `[GESPERRT-OVERRIDE]` — sanktionierter Eingriff in einen vormals gesperrten Wert (mit Datum/Begründung).
- Token-Regel: Folge-Chats fügen **nicht** die alten Design-Dokumente komplett ein. Sie referenzieren dieses Index + bei Bedarf die Projektdateien. Der Kickoff-Prompt (§6) enthält schon alle nötigen gesperrten Werte.

---

## 1. Artefakt-Karte

| Nr | Datei | Inhalt | Status-Mix | Welle | Erstellt |
|----|-------|--------|-----------|-------|----------|
| 00 | `00_Index_und_Bauplan.md` | Dieses Dokument: Karte, Reihenfolge, gesperrte Werte, Kickoff-Prompts | gesperrt | — | ✓ laufend |
| 01 | `01_Spielbeschreibung_und_Lore.md` | Ausführliche Spielbeschreibung, Ton, Narrativ, Wendung, 3 Enden, Regions-Themen | gesperrt + prov. | alle | ✓ 2026-06-30 — Arsenal-/Ermutigungs-Nachzug 2026-07-02 |
| 02 | `02_Mechaniken.md` | Kampf, Auflösungs-Reihenfolge, Atem, Schreck/Gemüt, Übermut/Tischsturz, Status, Keywords, Combos — exakte Regeln | gesperrt | 1/3 | ✓ 2026-06-30 — Ziehstapel/Ermutigung/Vollmond-Klausel 2026-07-02 |
| 03 | `03_Konstanten_und_Balancing.md` | ALLE tunbaren Zahlen an einem Ort + Sim-Befunde + Ziel-Metriken | gesperrt + prov. | alle | ✓ 2026-06-30 — Arsenal-Override/Eigen-Status/Re-Run-Vermerk 2026-07-02 |
| 04 | `04_Wuerfel_und_Blaupausen.md` | Würfel-Schema, Start-Arsenale, Verzauber-/Gravur-Katalog, 16 Blaupausen | gesperrt + prov. | 1/2/3 | ✓ 2026-06-30 — Eichwart 12 / Ermutigungs-Gravur 2026-07-02 |
| 05 | `05_Gegner_und_Bosse.md` | Roster je Region, 6+4 Mechaniken, Stat-Kurven, 6 Bosse + Twists | provisorisch | 2/5 | — |
| 06 | `06_Klassen.md` | 5 Hüter-Klassen: Start-Arsenal, Passiv, Spielgefühl, Freischaltung | prov. (Eichwart gesperrt) | 1/4 | ✓ 2026-07-02 |
| 07 | `07_Karte_Hain_Events_Oekonomie.md` | Regionen/Knoten, Hain-Segen-Pool, Events, 3 Währungen (Quellen/Senken), Händler | gesperrt + prov. | 2/3 | ✓ 2026-07-02 |
| 08 | `08_Design_Platzhalter.md` | Kunst-/Audio-Richtung, Platzhalter-Specs (Größen, Hain-Tisch), Entsättigung | prov. | 2/5 | — |
| 09 | `09_Technik_und_Save.md` | Architektur, vollständiges Daten-Schema, Save-Format, Lokalisierung, Build-Stand | gesperrt | alle | ✓ 2026-06-30 — Ziehstapel-State/`eigenStatus`/`ermutigung` 2026-07-02 |

**Offen: 05, 08.** Die vormals ausstehenden Kristallisations-Nachzüge in 02 §7 und 03 §4 sind erledigt (2026-06-30/07-02); der frühere §1-Hinweis dazu ist gegenstandslos.

---

## 2. Ausarbeitungs-Reihenfolge (Abhängigkeits-Rückgrat)

*Jede Stufe baut auf der darüber. Inhalt ist additiv (Datenzeilen); teuer sind Systeme + UI + Balancing.*

1. **Kampf-Mathe** (Formel/Atem/Auflösung) — `[GESPERRT]`, in `engine.js` umgesetzt.
2. **Eichwart-Arsenal + Wucht-Gravur** — `[GESPERRT]` (§3; Arsenal-Größe seit 2026-07-02 auf 12 überschrieben).
3. **Welle-1-Tor in JS schließen** — Sim mit echten Daten, Gier-vs-Pflege belegen. **Strukturell erfüllt (Sandbox-verifiziert, Kristallisations-Fix, 6er-Arsenal). Portierung ins Claude-Code-Repo + Re-Run auf 12er-Arsenal noch offen.**
4. **Kern-Verzauber-Katalog** (nur was der Slice braucht), sim-geerdet.
5. **1 Region-1-Gegner** minimal → erster spielbarer Kampf-Slice.
6. **Welle 2** — Region 1 voll: Karte, Roster R1, Boss 1, Belohnungs-Flow, Schmiede+Händler, Save, lesbare Handy-UI, Tutorial-Boden.
7. **Welle 3** — Tiefe: Status voll, Combos, 3 Währungen, Synergie-/Furcht-Builds, Blaupausen/Talismane. Jedes Stück sim-geprüft.
8. **Welle 4** — Meta: Jahresringe, Stammbaum, Heimat-Hain/Samen, Reifegrade, Klassen-Freischaltung.
9. **Welle 5** — Voller Umfang: Regionen 2–6, Bosse, 3 Enden, narrative Schichten, Kunst/Audio.

**Harte Balance-Tore:** nach Stufe 3 (Gier-vs-Pflege greift) · nach Stufe 7 (mehrere Build-Pfade viable, keine Lawine) · nach Stufe 9 (voller Run balanciert).

---

## 3. Gesperrte Kern-Festlegungen (Schnellreferenz)

*Damit Folge-Chats nicht neu herleiten. Vollständig in 02/03/04/06.*

### Kampf & Auflösung
- Anordnung **links→rechts**. Reihenfolge der Modifikatoren: **effektiver Seitenwert (nach Wetzung/Scharte) + Kraft** (pro Schaden-Seite sofort) → **Glanz** (Basis ×2, vor Mult) → **×Mult** (typgebunden) → **Echo** (kopiert linken Nachbarn, Cap 1× Quelle) → Pool-Summe → **×Gleichklang** → **×Morsch** → **×Welk** → **+ Vollmond-Burst** → **floor**.
- Morsch/Welk wirken **nur auf den Schaden-Pool**, nicht auf Fäule/Brand.
- Pools ≥ 0, kein Negativschaden. Mult auf leeren Pool = 0 (erlaubter Lernfehler).
- Überschuss-Schaden bei Gegner-Tod **verfällt** (kein Übertrag ohne Keyword).
- **Ein Ziel pro Zug**, kein Wechsel mitten im Paket. `Fläche` trifft alle.
- **Block (Rinde)** verfällt je Zug, fängt **keinen** Status.
- **Atem 3 fix**, ungenutzt verfällt. Start-Würfel kosten 1 Atem.
- **Ziehmodell (StS-Stil) `[PROVISORISCH]`:** Hand (5) wird je Zug **frisch aus dem Ziehstapel gezogen**; Gespieltes/Verworfenes/Rest wandert auf den **Ablagestapel**; Ziehstapel leer bzw. < 5 bei Zugbeginn → Ablage neu mischen. Details 02 §2.2, State 09 §2.11/§3.1.

### Combos (Modelle gesperrt, Faktoren teils prov.)
- **Gleichklang:** ≥2 gespielte Schaden-Seiten mit **demselben effektiven Seitenwert** → Schaden-Pool-Mult, gestaffelt **×1,25 / ×1,5 / ×1,75** bei 2/3/4+ (additiv +0,25, harter Cap ×1,75). Greift nach Mult, vor Morsch. Prüft das ganze Paket.
- **Echo:** dedizierte **Echo-Seite** kopiert den Beitrag der unmittelbar **links** platzierten Schaden-Seite inkl. deren Mults; Echo-Beitrag **hart gedeckelt auf 1× Quellbeitrag**, max 1 Wiederholung, **kein Ketten-Echo**. Position 1 oder nach Nicht-Schaden-Seite = 0.
- **Vollmond `[verfeinert 2026-06-30]`:** jede gespielte Würfel-Seite erreicht **effektiven Wert ≥ natürlichem Höchstwert** ihres Würfels → fester **additiver** Burst auf den Schaden-Pool (nicht multiplikativ), **skaliert mit Region**. Burst-Kurve `[PROVISORISCH]`: R1–R6 = **8 / 14 / 22 / 34 / 50 / 70** (~×1,5/Region, Sim eicht). **Klausel `[PROVISORISCH]`:** permanente **Klassen-Wertsockel** (z. B. Schleiferin-Schliff +1) zählen **nicht** für die Vollmond-Bedingung — geprüft wird der natürlich gewürfelte Wert plus temporäre Status; der **Wetzung-Status** ermöglicht Vollmond dagegen regulär, Scharte kann ihn brechen (02 §10.3).
- Alle Combos zünden **nur 1× pro Zug**, stapeln aber miteinander.

### Schreck & Gemüt
- **Gemüt** pro Würfel, Start 0. Push: −1. Sauberer Sieg: +1 (nur gespielte Würfel). **Trösten: +2 (universell, alle Kanäle).** Fröhlich-Bonus: **+1** (nicht +3).
- **Schreck = max(0, −Gemüt).**
- **Schreck-Mechanik:** sperrt die **höchsten freien** Seiten eines Würfels (nicht zufällig), **vor dem Wurf sichtbar**, max 3. Kurve `mittel`: **1 Seite ab Schreck 3, 2 ab 6, 3 ab 9.**
- **Beruhigungs-Seite:** +2 Gemüt auf einen ängstlichen Hand-Würfel (nur Schreck > 0), Kosten 1 Atem.
- **Keyword Ermutigung `[PROVISORISCH]`:** +2 Gemüt **universell** — wirkt auch bei Gemüt ≥ 0 (baut Richtung Fröhlich), Kosten 1 Atem. **Abgrenzung:** Beruhigung nur bei Schreck > 0, Ermutigung immer. Löst das Henne-Ei-Problem der Beruhigung unter sauberem Pflege-Spiel. Definition 02 §6.4/§9, Gravur 04 §3.2, Schema 09 §2.1.

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

### Eigen-Status (Würfelhain-nativ, universell R1–R6) `[GESPERRT-Prinzip, Werte PROVISORISCH]`
- **Wetzung** (Buff): +`Stapel` auf den **effektiven Wert jeder gewürfelten Seite** (alle Pools). Kann Vollmond ermöglichen.
- **Scharte** (Debuff): −`Stapel` auf den effektiven Wert jeder Seite, Untergrenze 1. Kann Vollmond brechen.
- **Freilauf** (Buff): +`Stapel` übermut-freie Rerolls diesen Zug.
- **Klemme** (Debuff): erste `Stapel` Rerolls kosten je +1 Übermut (Gratis-Reroll zuerst verteuert).
- Alle vier: **Cap 3, Decay −1/Runde, kampf-begrenzt.** Wetzung ≠ Kraft (Wurf-Zeitpunkt, alle Pools), Scharte ≠ Welk (flach, vor Pools). Voll in 02 §8.2, Schema-Slot `eigenStatus` in 09 §2.11.

### Ökonomie
- **Münzen = reine Währung** (aus Kämpfen + Events), **kein** Prägen durch Push. Push-Preis = ausschließlich Schreck.
- Münzen ~14–16/Kampf · Eicheln ~8/Kampf · Tau ~6/Region → kombiniert **~1,2× StS-Kaufkraft**.
- Schmiede-Preise **40/60/80** je Stufe; Schmiede häufigster Shop (~0,7 der Händler-Knoten). ~12–13 Verzauberungen/Run.

### Klassen & Eichwart (Start-Klasse)
- **Fünf Klassen (06, Namen final):** Eichwart (Start, neutral) · **Dorfschamane** (Pflege) · **Glöckner** (Gleichklang/Echo) · **Schleiferin** (Wetzung/Reroll) · **Rodbauer** (Gier). Nur Eichwart-Passiv gesperrt.
- **Arsenal-Start 12 Würfel `[GESPERRT-OVERRIDE 2026-07-02]`** (vorher 6 `[GESPERRT]`; sanktioniert, weil StS-Ziehen bei 6 Würfeln sinnlos und Hand 5 aus 6 inkohärent war). **Arsenal-Ziel Run-Ende ~22–24 `[PROVISORISCH]`** (vorher ~14). Handgröße **5 bleibt `[GESPERRT]`**. **Output/Zug bleibt Atem-gedeckelt (3 Seiten) — Region-1-Korridor ~15–17 Schaden/Zug unverändert**; mehr Würfel geben Deckbau/Rotation, nicht mehr Schaden.
- **Eichwart-Arsenal `[GESPERRT-OVERRIDE: Anzahl · GESPERRT: Identitäten]`:**
  - **8× Schadenswürfel (Astschneide):** Seiten 1,2,3,4,5,6 (alles Schaden).
  - **4× Rindenwürfel (Borkenschild):** Seiten 1,1,2,2,3,3 (alles Block/Rinde). (2:1-Verhältnis erhalten.)
- Alle Kosten 1 Atem. **Passiv:** +2 Schaden auf jede gespielte Schaden-Seite — **unverändert `[GESPERRT]`**.
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

## 4. Build-Stand *(Sync 2026-07-11 — A–D bis auf D6-Rest komplett; E1/E2/E5/E5b/E6 fertig, offen E3/E4/E7)*

**Nachzug 2026-07-11 (E-Etappe):** `fluch.js` (Fluch-System 07 §5.4, 3 Flüche + Fluch-Events, RG 9 echt) · Doppelschlag/Bruchstelle im Kampf-Loop (Bruchstelle als `gegner_riss`) · Reifegrad 1/2 nachgeschärft, Bänder RG 0 = 68,8 % / RG 10 = 25,2 % (n=2000) · Kampf-Arena nach Artefakt 12 (StS-Schema, echte Sprites) · 52 Sprites integriert (`assets/` + Manifest, Pipeline `tools/sprite_freistellen.py`) · Save **v7** (Kampf-Seed-Resume) · Tutorial + Enden-Zähler (E5) · Geräte-Smoke `tools/geraete_smoke.mjs` (E2) · Pages-Workflow vorbereitet (E1) · UI komplett auf Text-Keys (~120 `ui.*`-Keys, DE/EN) · **189 Tests grün**. Der Rest dieses Abschnitts ist der historische Stand 2026-07-07; maßgeblich ist `docs/10_Entwicklungsplan.md`.

**Claude-Code-Repo (echter Spielcode):**
- **Kern (DOM-frei, Node+Browser):** `rng.js` · `engine.js` · `push.js` · `ziehstapel.js` · `status.js` · `kampf.js` (Run/Karte/Kampf-Loop, Regionen 1–6, Bosse mit Phasen/Twists, Endboss mit Spiegel-Modulen + Befriedung) · `karte.js` · `knoten.js` (Schmiede/Markt/Event/Lagerfeuer, 6 Slice-Events regions-gegated) · `belohnung.js` · `segen.js` (16 Hain-Segen) · `data.js` (16 Blaupausen, 12 Gravuren, 31 Gegner/Bosse, REGION_TUNING) · `meta.js` (Jahresringe/Stammbaum/Samen/Setzlinge) · `reifegrad.js` (Stufen 1–10) · `enden.js` (3 Enden, Frühling-Gate scharf) · `narrativ.js` (Mentor/Zweifel/Wendung/Welk-Stufe) · `save.js` (SAVE_VERSION 6, lückenlose Migrationskette).
- **Präsentation:** `ui/main.js` (alle Screens inkl. Wendung/Enden-Inszenierung, Welk-Filter-Swap) · `ui/audio.js` (Stem-Ausdünnen 08 §2.2, No-Op bis Assets da) · `i18n/de.js` + `i18n/en.js` + `i18n/sprache.js` (D7, 209 Keys, DE/EN-Toggle) · `index.html` (Rollen-Slots, welk-0…5).
- **Sims:** `sim/vollrun.js` (Tor 3) · region1_run · build_pfade · reifegrade · klassen · morsch_gegner_ab (R1-gepinnt, Relativ-Diagnose).
- **Tests:** 177 grün (`npm test`), je Mechanik; Chromium-Smokes je UI-Schritt.

**Balance-Tore:** Tor 1 (Gier<Pflege, 12er-Re-Run) ✓ · Tor 2 (Build-Pfade/Lawine, `docs/BalanceTor2_Befund.md`) ✓ · **Tor 3 (Voll-Run: RG 0 = 67,6 %, RG 10 = 25,2 %, Gier nie dominant — abgenommen 2026-07-07, `docs/BalanceTor3_Befund.md`)** ✓.

**Design-Stand:** Artefakte 00–12 liegen im Repo (`docs/`); 11 (Bild-Prompts) 2026-07-07, 12 (Kampfszenen-Layout + Mockup) 2026-07-10. Offen: Rest-Asset-Produktion (D6/`Sprite_Backlog.md`, Aaron) und Text-Redaktionen (D4/D7/E5-Entwürfe).

**Gesamtstatus (2026-07-11):** A–C komplett; D bis auf **D6-Rest** komplett; E: E1/E2/E5/E5b/E6 fertig — offen **E3 (Beta, deine Seite)**, **E4 (Doku-Endstand)**, **E7 (Kleinrest)**. Offene [D]-Punkte gesammelt am Ende von Artefakt 10.

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

**01 — Spielbeschreibung & Lore** *(erstellt 2026-06-30, Nachzug 2026-07-02)*

**02 — Mechaniken** *(erstellt 2026-06-30, Nachzüge 2026-06-30 + 2026-07-02)*

**03 — Konstanten & Balancing** *(erstellt 2026-06-30, Nachzüge 2026-06-30 + 2026-07-02)*

**04 — Würfel & Blaupausen** *(erstellt 2026-06-30, Nachzüge 2026-06-30 + 2026-07-02)*

**05 — Gegner & Bosse**
> Erstelle Artefakt 05 (Gegner & Bosse), alles `[PROVISORISCH]`. Pro Region ein Roster mit Stat-Tabelle (HP, Schaden, Status-Mengen) nach den Stat-Kurven; die 6 StS- + 4 eigenen Mechaniken exakt definiert (inkl. Zuordnung, welche Gegner Scharte/Klemme auflegen — Regions-Themen 01 §7, Eigen-Status 02 §8.2); Absichts-Muster; 6 Bosse mit Phasen, Regel-Twist, HP, Sonder-Belohnung; personalisierte Endboss-Phase aus dem ängstlichsten Würfel; Trösten-Auflösung des Endkampfs (01 §5, „Der neue Frühling"). Anti-Brick beachten. Deutsch, Markdown.

**06 — Klassen** *(erstellt 2026-07-02)*

**07 — Karte, Hain, Events & Ökonomie** *(erstellt 2026-07-02)*

**08 — Design-Platzhalter**
> Erstelle Artefakt 08 (Design-Platzhalter), alles `[PROVISORISCH]`. Kunst-Richtung (cozy Pixel-Art, Hain-Tisch-Konzept), Audio-Richtung (Folk, diegetisches Ausdünnen), Entsättigungs-System (Palette-Swap je Welk-Stufe — technische Umsetzung), vollständige Asset-Liste mit Platzhalter-Specs (feste Größen, z. B. 32×32, beschriftete Boxen). KEINE fertige Art — nur Platzhalter-Vorgaben. Deutsch, Markdown.

**09 — Technik & Save** *(erstellt 2026-06-30, Nachzüge 2026-06-30 + 2026-07-02)*

---

## 7. Nächster konkreter Schritt

1. **Kristallisations-Mechanik ins Claude-Code-Repo portieren.** Sandbox-Referenz (`push.js: kristallisiereUebermut()`) → echtes `push.js`, Kampf-Loop verdrahten (Aufruf bei jedem Kampfende), `tests/engine.test.js` um Kristallisations-Fälle erweitern.
2. **Welle-1-Tor Re-Run auf 12er-Arsenal** (inkl. Ziehstapel-Modell 02 §2.2) — Struktur soll halten, Zahlen neu erheben; danach Feinkalibrierung ins Zielband 65–70 % (03 §13).
3. Dann Inhalts-Artefakte: **05 → 08** (Kickoff-Prompts §6). 05 braucht die sim-kalibrierten Stat-Kurven aus Schritt 2.
