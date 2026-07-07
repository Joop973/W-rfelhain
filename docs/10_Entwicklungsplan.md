# Würfelhain — Entwicklungsplan bis zur Vollendung (Artefakt 10)

*Arbeitsdokument mit fortschreibbaren Häkchen. Etappen = Wellen aus 00 §2, Etappen-Grenzen und Balance-Tore sind fix; Reihenfolge innerhalb einer Etappe darf nach Abhängigkeiten optimiert werden. Rollen: **[C]** = Claude (Code-Session), **[D]** = Du (Design/Playtest/Assets), **[C+D]** = gemeinsam.*

*Stand: 2026-07-04. Erstfassung nach Abschluss des Welle-1-Slices.*

---

## 0. Ausgangslage

- [x] Design-Artefakte 00–09 vollständig in `docs/`
- [x] Fundament: `rng.js` · `engine.js` · `push.js` · `ziehstapel.js` · `data.js` · `save.js` · `kampf.js` · `sim/` · `ui/` · `i18n/` · `index.html` — 38 Tests grün
- [x] Welle-1-Tor auf 12er-Arsenal geschlossen (Pflege 70,2 % > Gier klug 63,4 %, `docs/Welle1_Tor_ReRun_12er_Befund.md`)
- [x] Spielbarer Kampf-Slice im Browser (Region-1-Sequenz, 9 Kämpfe, Chromium-verifiziert)

**Damit sind die Stufen 1–5 der Ausarbeitungs-Reihenfolge (00 §2) erfüllt.**

## Rollenverteilung (durchgängig)

| Wer | Aufgaben |
|---|---|
| **Claude [C]** | Implementierung + Tests (Node + Chromium-Smoke), Monte-Carlo-Sims + Befund-Dokumente, Save-Migrationen, Doku-Nachzüge in `docs/`, Commits auf den Branch |
| **Du [D]** | Design-Entscheide (`[PROVISORISCH]` → `[GESPERRT]`), Handy-Playtests + Spielgefühl-Feedback, neue Artefakt-Stände aus Design-Chats hochladen, Kunst/Audio (bzw. Aaron, 08), Abnahme an den 3 Balance-Toren, Merge-Entscheidungen (PR ja/nein) |

**Arbeits-Loop je Schritt:** Du gibst frei → Claude baut + testet + committet → du spielst auf dem Handy → Sim misst nach → Befund nach `docs/` → nächster Schritt.

---

## Etappe A — Welle 2: Region 1 voll *(als Nächstes)*

Ziel: kompletter Region-1-Run mit Karte, Belohnungen, Händlern, Boss, Save — „lesbare Handy-UI, Tutorial-Boden" (00 §2 Stufe 6).

- [x] **A1 [C] Belohnungs-Flow** nach Kämpfen: Münzen/Eicheln automatisch + 1 Wahl aus 3 (Blaupause/Gravur/Münzen), Seltenheits-Gewichte, Blaupause-Pity N≈6 *(09 §2.5, 03 §10)* — `belohnung.js`, 2026-07-04
- [x] **A2 [C] Gravuren anwendbar**: Seite überschreiben (Cap 3), Wucht-Mult in den Kampf-Loop verdrahtet (Seiten-Index-Refactor in `kampf.js`), Schmiede-Knoten mit Preisen 40/60/80 — *Slice-Gravuren Wucht/Schärfe/Borke; Status-Gravuren folgen mit Etappe B* *(04 §3, 02 §4)*
- [x] **A3 [C] Karten-Generator** Region 1: DAG 7 Reihen + Boss, bis 3 breit, StS-Merge, Garantie-Regeln (Reihe 1 Kampf, 6 kommerziell, 7 Lagerfeuer, Elite-Erreichbarkeit) *(07 §1)* — `karte.js`, 2026-07-04
- [x] **A4 [C] Knotentypen**: Markt (Eicheln-Käufe, Würfel entfernen 25+15/Anwendung, Trösten-Dienst 3 Tau), Event-Vignetten (Slice: Brunnen + Kätzchen), Lagerfeuer (Heilen/Trösten/Vollenden), Tau +6/Region *(07 §1.3/§2/§3)* — `knoten.js`, 2026-07-04
- [x] **A5 [C] Boss 1 Saumhüter**: 2 Phasen, Twist „Erste Geduld" (jede 3. Runde Block), Sonder-Belohnung = Blaupausen-Wahl *(05 §6)* — 2026-07-04 *(mehrfach-Treffer der Phase 2 folgen mit Etappe B)*
- [x] **A6 [C] Save v2**: Karte/Position/HP/Pity in `runState`, Migration 1→2 aktiv (Kettenpflicht-Test greift), UI lädt gespeicherten Run beim Start *(09 §3)* — 2026-07-04
- [ ] **A7 [C+D] Handy-UI-Ausbau**: Karten-/Belohnungs-/Händler-Screens, Tutorial-Hinweise — weiter in Platzhalter-Konvention (08 §4.0). **Du testest auf dem echten Handy** (Lesbarkeit ist Design-Kriterium, 08 §1.3)
- [x] **A8 [C] Region-1-Nach-Eichung gemessen**: `sim/region1_run.js` läuft über den echten Spielcode (Karte/Knoten/Belohnungen); Gegner-Schaden nachgeeicht (Normal 8–13, Elite 12–13, Boss 12–14) → Standard 70,5 % im Zielband, Pflege 92,8 % > Gier 21,2 % — Befund: `docs/Region1_Karten_Kalibrierung_Befund.md`, 2026-07-04. **[D] Endwert-Entscheid offen** (inkl. Frage 03-§7-Kurve nachziehen vs. Heilung senken, s. Befund §5) *(03 §13, 05 §1.2)*

**Deine Entscheide in Etappe A [D]:**
- [ ] Ziehmodell-Default bestätigen (je Zug 5 frisch — 02 §2.2)
- [ ] Rinde-Reserve zünden ja/nein (04 §2, falls Block zu dünn wirkt)
- [ ] Sauber-Sieg-Bedingung: „ohne HP-Verlust" zu streng? (03 §11)
- [ ] Ökonomie-Gefühl: reichen ~12–13 Gravuren/Run?

---

## Etappe B — Welle 3: Tiefe

Ziel: alle Systeme voll aktiv, mehrere Build-Pfade. Endet mit **Balance-Tor 2**.

- [x] **B1 [C] Status-Set voll im Kampf**: Fäule/Brand-Ticks (Zug-Beginn/-Ende, DoT-Tod → Sieg), Morsch/Welk-Stapel + Decay, Kraft-Selbst-Buff, Riss (25 %-Aussetzer), Glanz-Verdopplung — neues Modul `status.js`, in `kampf.js` verdrahtet; Slice-Gravuren um Gift/Zunder/Fäulnis-Hauch/Dürre-Hauch/Markhärtung/Glanz erweitert; Status-Badges in der UI *(02 §2/§8)* — 2026-07-04
- [x] **B2 [C] Eigen-Status**: Wetzung/Scharte setzen den effektiven Wurf-Wert (Untergrenze 1, ermöglichen/brechen Vollmond), Freilauf/Klemme in die Reroll-Ökonomie verdrahtet; State-Slots + Decay/Caps schon aus B1 (`spielerStatus`), UI-Badges ergänzt *(09 §2.11)* — 2026-07-04. **Quellen** (Segen/Schleiferin/Gegner) folgen mit B6/C2/späteren Regionen
- [x] **B3 [C] Combos komplett spielbar**: Echo-/Glanz-Seiten als Gravuren im Loop, Vollmond-Prüfung mit echten Höchstwerten, Gleichklang-Anzeige in der UI *(engine liefert `combos`-Metadaten, Echo speist Gleichklang, UI-Log für Gleichklang/Vollmond/Riss)* — 2026-07-06
- [x] **B4 [C] Alle 16 Blaupausen anwendbar** (Slice-Sperre aufheben), inkl. Quell/Labung- und Hort/Prägung-Engines *(SLICE_BLAUPAUSEN = alle 16; Labung heilt Basis+Trösten Cap+8, Prägung münzt je Seite, Fläche = Schaden im Ein-Gegner-Slice, Wildwuchs-Eigen-Riss; Sim weiter im Band)* — 2026-07-06
- [x] **B5 [C] Beruhigung/Ermutigung spielbar** + Trösten-Zähler run-weit (zählt für Frühling-Bedingung, Ermutigung ausgeschlossen — 01 §5) *(Pflege-Seiten mit Auto-Ziel im Loop; Zähler-Split troestenZahl/pflegeZahl, Labung liest pflegeZahl; Save v3; Sim n=6000 Standard 67,2 % im Band)* — 2026-07-06
- [x] **B6 [C] Hain-Segen-Pool**: alle 16 mit Haken-Effekten (Kristallisations-Modifikatoren „Gieriger Griff"/„Ungeduld" brauchen `push.js`-Hooks) *(neues Modul `segen.js`; push-Hooks Verhältnis/Zuschlag/Freischein; Quellen: Belohnungs-Mix 10 %, Elite-Garantie, Boss = 2 Blaupausen + 1 Boss-Segen, Markt; Save v4; Sim n=6000 Standard 67,4 % im Band)* — 2026-07-06
- [x] **B7 [C+D] Morsch-als-Gegner-Entscheid**: Option A (eingehend-Multiplikator in `engine.js`) vs. B (Fallback Kraft) — Claude baut Prototyp A, **du entscheidest** *(05 §2.1)* — **Option A entschieden** (Sim: A 99,8 % Siegrate/+19 % HP-Verlust selbstbremsend vs. B 96,2 %/+28 % eskalierend; `eingehendMult` in engine.js, 05 §2.1 gesperrt) — 2026-07-06
- [x] **B8 [C+D] BALANCE-TOR 2**: Sim-Suite über mehrere Build-Pfade (Wucht-, Status-, Gleichklang-, Pflege-Build) — Kriterium: alle viable, keine Lawine (03 §14), Gier-vs-Pflege hält weiter. Claude misst, **du nimmst ab** — **ABGENOMMEN** *(Builds 68,9–91,2 %, Lawinen-Faktor ~2,1 ≤ 6, Standard 67,4 % im Band; `sim/build_pfade.js`, Befund: docs/BalanceTor2_Befund.md)* — 2026-07-06

**Etappe B ist damit abgeschlossen** (Tor 2 passiert). Beobachtungspunkt für Etappe C/D: Status-Build in R1 strukturell schwächster Pfad — Region-2-Kalibrierung (Moderbruch) prüft.

**Deine Entscheide in Etappe B [D]:**
- [ ] Alle `[PROVISORISCH]`-Gravur-/Blaupausen-Werte nach Sim-Befund sperren
- [ ] Freilauf/Klemme-Verrechnung bestätigen (02 §7.5)
- [ ] Tau-Knappheit prüfen: reicht der Trösten-Zugang in R1–2 gegen die Schreck-Spirale? *(Kernfrage 03 §12.1)*

---

## Etappe C — Welle 4: Meta

- [x] **C1 [C] Jahresringe + Stammbaum** (Meta-Save, dauerhafte Freischaltungen, 09 §2.9) *(neues Modul `meta.js`; Einkommen PROVISORISCH Sieg 2/Niederlage 1/Abbruch 0; Stammbaum = 4 Klassen-Knoten inkl. Rodbauer-Bedingung; Meta überlebt „Neuer Run", Ende-Screen mit Ring-Vergabe + Kauf-Panel)* — 2026-07-06
- [x] **C2 [C] Klassen 2–5 spielbar**: Dorfschamane (Zuversicht + Gratis-Ermutigung), Glöckner (Widerhall), Schleiferin (Schliff-Sockel + Vollmond-Ausnahme + Extra-Reroll), Rodbauer (Brandrodung) — Daten liegen schon in `data.js`, Passive brauchen `kampf.js`/`engine.js`-Anbindung *(alle 4 Passive im Loop; Klassen-Sockel trennt jetzt effektiverWert/vollmondPruefwert; 8 Tests)* — 2026-07-06
- [x] **C3 [C] Klassen-Freischalt-Reihenfolge** (3/5/8/12 Jahresringe, Rodbauer hinter Bedingung — 06 §7) *(Stammbaum-Knoten aus C1 tragen Kosten + Rodbauer-Bedingung; Klassen-Wahl vor neuem Run zeigt nur Freigeschaltete)* — 2026-07-06
- [x] **C4 [C] Reifegrade 1–10** (kumulative Mods, 03 §9) + Ziel-Siegraten-Sims je Stufe *(`reifegrad.js` mit nachgeeichten Werten — Kurve 68,5/61,1/46,6/40,9/32,7 % auf Stufe 0/3/6/9/10, Befund: docs/Reifegrad_Kalibrierung_Befund.md; Ascension-Kette via meta.maxReifegrad, UI-Picker)* — 2026-07-06
- [x] **C5 [C+D] Heimat-Hain/Samen** (Anschluss „Stiller Hain"-Ende) — noch dünn in den Artefakten, ggf. Design-Chat-Runde vorab — **Design entschieden + umgesetzt:** Samen = Enden-Währung (Frühling 2/Stiller Hain 1/Erbe 0), 4 Setzlinge als flache permanente Start-Boni (Tau-Wurzel/Mut-Trieb/Tiefwurzel/Frühjahrs-Knospe), Heimat-Hain-Panel am Ende-Screen; Save v5. Alles [PROVISORISCH] — 2026-07-06
- [x] **C6 [C] Run-weite Enden-Zähler**: End-Schreck + Trösten-Zahl tracken, Schwellen ~10/~40 provisorisch verdrahten *(`enden.js`: Klassifikation ≤10/≥40 + Trösten ≥8, Befriedungs-Gate als D3-Platzhalter; Sieg-Screen zeigt Ende, meta.endenErreicht speist Rodbauer-Bedingung)* — 2026-07-06
- [x] **C7 [C+D] Klassen-Balance-Sim**: jede Klasse gegen den Korridor 15–17 (06 §8), Rodbauer-Überlebbarkeit R1, Dorfschamane vs. Frühling-Trivialisierung. Claude misst, **du entscheidest** — **entschieden:** Rodbauer beobachten bis Tor 3; Widerhall +3→+5 (Glöckner 53,7 % Standard) und Dorfschamane hpMod +5 (Pflege 76,3 %) nachgeschärft; keine Frühling-Trivialisierung (Ermutigungs-Ausschluss wirkt, 0 % Quote). Befund: docs/Klassen_Balance_Befund.md — 2026-07-06

---

## Etappe D — Welle 5: Voller Umfang

Endet mit **Balance-Tor 3** (voller Run balanciert).

- [x] **D1 [C] Regionen 2–6**: Roster als `data.js`-Zeilen (05 §5 liegt komplett vor), Status-Themen je Region, HP-/Schaden-Kurven *(26 Gegner + Bosse 2–6 als Grundmuster; Sieche/Rasende/Angriff+Status/Selbst-Buff; Gegner-Status aktiviert eingehendMult + Reifegrad 8; Region-Progression mit Tau/Welk-Grad; Sims auf maxRegion 1 gepinnt. Voll-Run un-kalibriert ~0 % — Eichung = D8)* — 2026-07-06
- [x] **D2 [C] Bosse 2–5** mit Phasen + Twists (Ausbreitung, Auflodern, Auszehrung, Enge Pforte) *(Phasen-System wechselt Muster/Auflagen/Treffer; alle 4 Twists + eskalierende Fäule + Saumhüter-Doppelschlag; 7 Tests)* — 2026-07-06
- [ ] **D3 [C] Endboss**: 3 Phasen, Twist „Hohles Echo", personalisierte Phase aus dem ängstlichsten Arsenal, Trösten-Auflösung via `bossSchreck` *(05 §7/§8)*
- [ ] **D4 [C+D] 3 Enden + Narrativ**: Mentor-Stimme über den Run (Text-Keys!), Zweifel-Events R4/R5, Wendungs-Szene, Enden-Inszenierung — **du redigierst alle Texte** (Ton 01 §6 ist Chefsache)
- [ ] **D5 [C+D] Welk-Grad/Entsättigung**: Filter-MVP ist vorbereitet → Rollen-Swap (08 §3.4 A/B) sobald echte Sprites da sind; Audio-Stems mit diegetischem Ausdünnen (08 §2.2). Claude Technik, **du/Aaron Assets**
- [ ] **D6 [D→C] Kunst/Audio-Produktion**: Sprites nach Platzhalter-Specs (~136 Boxen, 08 §4), Musik-Stems (~24), SFX (~13), Bitmap-Font mit Umlauten — Platzhalter werden 1:1 ersetzt (gleiche Maße/Keys). **Du/Aaron liefert**, Claude integriert
- [ ] **D7 [C+D] Lokalisierung EN**: `i18n/en.js` (Struktur steht). Claude übersetzt, du prüfst
- [ ] **D8 [C+D] BALANCE-TOR 3**: Voll-Run-Monte-Carlo gegen 03 §13 (Reifegrad 0: 65–70 % … Reifegrad 10: 25–30 %), Enden-Schwellen nacheichen, Gier-darf-nie-dominieren-Kriterium auf jeder Stufe. Claude misst, **du nimmst ab**

---

## Etappe E — Release

- [ ] **E1 [C+D] Deployment**: GitHub Pages (statisch, kein Build — passt exakt zur Architektur). Claude bereitet vor, **du aktivierst Pages in den Repo-Settings** und entscheidest den Merge
- [ ] **E2 [C+D] Geräte-Matrix-Test**: iOS Safari + Android Chrome (Audio-Fallback `.m4a`, LocalStorage, Performance Integer-Scaling). Claude automatisiert was geht, **du testest real**
- [ ] **E3 [D→C] Beta mit echten Spielern**, Feedback-Runde, letzte Eichung. **Du organisierst**, Claude fixt
- [ ] **E4 [C+D] Doku-Endstand**: alle verbleibenden `[PROVISORISCH]` → `[GESPERRT]` oder gestrichen; Index 00 final

---

## Laufende Pflege (parallel zu allem)

- **Doku-Sync [C]:** Nach jedem Etappen-Abschluss Build-Stand in 00 §4 / 09 §6 nachziehen. **Wichtig [D]:** neue Artefakt-Stände aus Design-Chats immer hochladen — Claude difft gegen den Repo-Stand und weist auf Regressionen hin (wie beim veralteten 00-Index geschehen).
- **Test-Disziplin [C]:** jede neue Mechanik bekommt Node-Tests; jeder UI-Schritt einen Chromium-Smoke; jedes Balance-Tor ein Befund-Dokument in `docs/`.
- **Save-Migrationen [C]:** jede Schema-Änderung = `SAVE_VERSION`+1 + Migrationsfunktion (Kettenpflicht-Test erzwingt das bereits).

## Annahmen

- Hosting-Ziel ist **GitHub Pages** (statische Web-App ohne Build-Step legt das nahe).
- „Aaron" (08) ist die Kunst-/Audio-Quelle — die Produktion der echten Assets liegt auf eurer Seite; Claude baut nur Platzhalter + Integration.
- Reihenfolge innerhalb der Etappen darf nach Abhängigkeiten optimiert werden; die Etappen-Grenzen (= Wellen + Tore aus 00 §2) sind fix.
