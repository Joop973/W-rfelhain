# Würfelhain — Entwicklungsplan bis zur Vollendung (Artefakt 10)

*Arbeitsdokument mit fortschreibbaren Häkchen. Etappen = Wellen aus 00 §2, Etappen-Grenzen und Balance-Tore sind fix; Reihenfolge innerhalb einer Etappe darf nach Abhängigkeiten optimiert werden. Rollen: **[C]** = Claude (Code-Session), **[D]** = Du (Design/Playtest/Assets), **[C+D]** = gemeinsam.*

*Stand: 2026-07-11 (Erstfassung 2026-07-04 nach dem Welle-1-Slice). Repo-Stand: 189 Tests grün · Save v7 · alle 3 Balance-Tore abgenommen · Bänder RG 0 = 68,8 % / RG 10 = 25,2 % (n=2000).*

## Status-Übersicht *(zuerst lesen — der Rest ist Verlauf)*

| Etappe | Status | Offen |
|---|---|---|
| A — Region 1 voll | ✅ komplett | — |
| B — Tiefe (Tor 2) | ✅ komplett | — |
| C — Meta | ✅ komplett | — |
| D — Voller Umfang (Tor 3) | ✅ bis auf D6 | **D6**: Kunst/Audio (77 Sprites da, **Region 1 voll bebildert** + HUD komplett; Rest s. `Sprite_Backlog.md`; Audio komplett offen) |
| E — Release | E1/E2/E5/E6 + Arena ✅ | **E3** Beta · **E4** Doku-Endstand · **E7** Kleinrest |

**Nächster Claude-Schritt [C]:** E7 (klein) oder auf Zuruf. **Deine nächsten Schritte [D]:** gesammelt in der Sektion „Offene [D]-Punkte" am Ende — die Etappen-interne Streuung ist dort konsolidiert.

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

## Etappe A — Welle 2: Region 1 voll

Ziel: kompletter Region-1-Run mit Karte, Belohnungen, Händlern, Boss, Save — „lesbare Handy-UI, Tutorial-Boden" (00 §2 Stufe 6).

- [x] **A1 [C] Belohnungs-Flow** nach Kämpfen: Münzen/Eicheln automatisch + 1 Wahl aus 3 (Blaupause/Gravur/Münzen), Seltenheits-Gewichte, Blaupause-Pity N≈6 *(09 §2.5, 03 §10)* — `belohnung.js`, 2026-07-04
- [x] **A2 [C] Gravuren anwendbar**: Seite überschreiben (Cap 3), Wucht-Mult in den Kampf-Loop verdrahtet (Seiten-Index-Refactor in `kampf.js`), Schmiede-Knoten mit Preisen 40/60/80 — *Slice-Gravuren Wucht/Schärfe/Borke; Status-Gravuren folgen mit Etappe B* *(04 §3, 02 §4)*
- [x] **A3 [C] Karten-Generator** Region 1: DAG 7 Reihen + Boss, bis 3 breit, StS-Merge, Garantie-Regeln (Reihe 1 Kampf, 6 kommerziell, 7 Lagerfeuer, Elite-Erreichbarkeit) *(07 §1)* — `karte.js`, 2026-07-04
- [x] **A4 [C] Knotentypen**: Markt (Eicheln-Käufe, Würfel entfernen 25+15/Anwendung, Trösten-Dienst 3 Tau), Event-Vignetten (Slice: Brunnen + Kätzchen), Lagerfeuer (Heilen/Trösten/Vollenden), Tau +6/Region *(07 §1.3/§2/§3)* — `knoten.js`, 2026-07-04
- [x] **A5 [C] Boss 1 Saumhüter**: 2 Phasen, Twist „Erste Geduld" (jede 3. Runde Block), Sonder-Belohnung = Blaupausen-Wahl *(05 §6)* — 2026-07-04 *(mehrfach-Treffer der Phase 2 folgen mit Etappe B)*
- [x] **A6 [C] Save v2**: Karte/Position/HP/Pity in `runState`, Migration 1→2 aktiv (Kettenpflicht-Test greift), UI lädt gespeicherten Run beim Start *(09 §3)* — 2026-07-04
- [x] **A7 [C+D] Handy-UI-Ausbau**: Karten-/Belohnungs-/Händler-Screens, Tutorial-Hinweise — weiter in Platzhalter-Konvention (08 §4.0) *(über die Etappen hinweg vollständig gebaut: alle Screens (A), Tutorial (E5), Touch-Härtung + Geräte-Smoke (E2), Kampf-Arena mit echten Sprites (Artefakt 12, s. Etappe E). Der [D]-Teil „echtes Handy" ist in der E2-Checkliste (`docs/Geraete_Matrix_Befund.md`) aufgegangen)* — 2026-07-11
- [x] **A8 [C] Region-1-Nach-Eichung gemessen**: `sim/region1_run.js` läuft über den echten Spielcode (Karte/Knoten/Belohnungen); Gegner-Schaden nachgeeicht (Normal 8–13, Elite 12–13, Boss 12–14) → Standard 70,5 % im Zielband, Pflege 92,8 % > Gier 21,2 % — Befund: `docs/Region1_Karten_Kalibrierung_Befund.md`, 2026-07-04. *Der damals offene [D]-Endwert-Entscheid ist durch die Tor-3-Abnahme überholt (D8, 2026-07-07: Kalibrierungs-Hebel gesperrt)* *(03 §13, 05 §1.2)*

**Deine Entscheide in Etappe A [D]:** → konsolidiert in „Offene [D]-Punkte" (Ende des Dokuments); die drei Tore haben die Werte implizit im Band bestätigt, formale Sperrung = E4.

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

**Deine Entscheide in Etappe B [D]:** → konsolidiert in „Offene [D]-Punkte" (Ende des Dokuments).

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
- [x] **D3 [C] Endboss**: 3 Phasen, Twist „Hohles Echo", personalisierte Phase aus dem ängstlichsten Arsenal, Trösten-Auflösung via `bossSchreck` *(05 §7/§8)* *(Spiegel-Module aus gesperrten Seiten; Befriedung beendet ohne Kill und setzt run.bossBefriedet — das Frühling-Gate in enden.js ist damit scharf; Endboss ohne Item-Belohnung)* — 2026-07-06
- [x] **D4 [C+D] 3 Enden + Narrativ**: Mentor-Stimme über den Run (Text-Keys!), Zweifel-Events R4/R5, Wendungs-Szene, Enden-Inszenierung — **du redigierst alle Texte** (Ton 01 §6 ist Chefsache) *(`narrativ.js` DOM-frei: Mentor-Zeile je Regions-Eintritt 1–5 + Tischsturz; Zweifel-Events Stumme Lichtung/Hohler Stumpf regions-gegated R4/R5, Hinweise färben die Wendung („geahnt"); Wendungs-Szene einmalig an der Schwelle zu R6; Enden mit 3-Absatz-Inszenierung; Event-Slice 2→6 Vignetten (neue Effekte: Segen/Selbstschaden/Seiten-Schärfung/Gratis-Gravur/Preis-Gate); Save v6 (+hinweise/wendungGesehen/hpMax — schließt das D8-hpMax-Loch im Loader); 8 Tests. Voll-Run-Nachmessung nach Event-Ausbau: 70,0 % (n=2000, obere Bandkante — Events geben ~+2 pp, im Band). **Alle Texte [ENTWURF] — deine Redaktion offen**)* — 2026-07-07
- [x] **D5 [C+D] Welk-Grad/Entsättigung**: Filter-MVP ist vorbereitet → Rollen-Swap (08 §3.4 A/B) sobald echte Sprites da sind; Audio-Stems mit diegetischem Ausdünnen (08 §2.2). Claude Technik, **du/Aaron Assets** *(Technik fertig: `welk-N`-Klasse folgt `run.welkGrad` (clamp 0–5, `welkStufe` in narrativ.js), CSS-Filter-Swap mit 600-ms-Übergang; `ui/audio.js` mit Stem-Mixing je Welk-Stufe (Ausdünn-Kurve 08 §2.2), Trösten-Zier-Rückkehr, SFX-Slots — alles stille No-Ops bis Aaron `assets/audio/` + `manifest.json` liefert (D6). Rollen-Swap A/B wartet auf echte Sprites)* — 2026-07-07
- [ ] **D6 [D→C] Kunst/Audio-Produktion**: Sprites nach Platzhalter-Specs (~136 Boxen, 08 §4), Musik-Stems (~24), SFX (~13), Bitmap-Font mit Umlauten — Platzhalter werden 1:1 ersetzt (gleiche Maße/Keys). **Du/Aaron liefert**, Claude integriert. *Teilstand 2026-07-11: **77 Sprites geliefert, freigestellt und in `assets/`** (9 Würfel, 5 Gegner, **Hüter-Kampffigur**, 40 Icons, 20 HUD-Elemente, **Boden + Kulisse R1** — Region 1 ist damit ohne Platzhalter bebildert, HUD Artefakt 11 §6 komplett; Pipeline `tools/sprite_freistellen.py` + Segmentierungs-Treiber, `assets/manifest.json`, Fallback auf Platzhalter-Boxen). HUD-Verdrahtung ins Spiel = E7-Kandidat. Prompts für alles Weitere in `docs/11_Bild_Prompts.md`, offene Liste priorisiert in `docs/Sprite_Backlog.md` (zuerst: Hüter-Kampf-Sprite, widerhall/saumhueter-Neuexport, Kulisse+Boden R1). Audio: Technik-Slots stehen (D5), null Dateien geliefert*
- [x] **D7 [C+D] Lokalisierung EN**: `i18n/en.js` (Struktur steht). Claude übersetzt, du prüfst *(alle 209 Keys übersetzt, Terminologie-Register im Datei-Kopf (Hüter=Keeper, Schreck=Fright, Übermut=Recklessness, …); `i18n/sprache.js` mit Fallback-Kette EN→DE→Key; DE/EN-Toggle in der Statuszeile, persistiert in `einstellungen.sprache`; Paritäts- und Fließtext-Tests. **Deine Prüfung der Übersetzungen offen**; UI-Chrome-Strings in ui/main.js sind noch hart deutsch — Merkposten)* — 2026-07-07
- [x] **D8 [C+D] BALANCE-TOR 3**: Voll-Run-Monte-Carlo gegen 03 §13 (Reifegrad 0: 65–70 % … Reifegrad 10: 25–30 %), Enden-Schwellen nacheichen, Gier-darf-nie-dominieren-Kriterium auf jeder Stufe. Claude misst, **du nimmst ab** *(gemessen via `sim/vollrun.js`: RG 0 = 67,6 %, RG 10 = 25,2 %, monoton dazwischen; Gier 6,4 %/4,0 %/0,4 % auf RG 0/5/10 — dominiert nie; Enden-Schwellen halten (Ø Trösten 10,9 ≥ 8, Stiller Hain kanonisch). Kalibrierung 0 %→67,6 % über REGION_TUNING, Vollheilung + hpMax+8 am Regionstor, Einkommens-Skalierung, Twist-Raten — Details `docs/BalanceTor3_Befund.md`. **Abgenommen 2026-07-07** — Kalibrierungs-Hebel gesperrt)* — 2026-07-07

---

## Etappe E — Release

- [x] **E1 [C+D] Deployment**: GitHub Pages (statisch, kein Build — passt exakt zur Architektur). Claude bereitet vor, **du aktivierst Pages in den Repo-Settings** und entscheidest den Merge *(vorbereitet: `.github/workflows/pages.yml` (Test-Job → Deploy der Repo-Wurzel bei Push auf main), `.nojekyll`, README mit Anleitung, Titel entstaubt; Subpfad-Smoke unter `/W-rfelhain/` grün — alle Pfade relativ. **Deine Seite: Settings → Pages → Source „GitHub Actions" + Merge-Entscheid des Feature-Branches**)* — 2026-07-07
- [x] **E2 [C+D] Geräte-Matrix-Test**: iOS Safari + Android Chrome (Audio-Fallback `.m4a`, LocalStorage, Performance Integer-Scaling). Claude automatisiert was geht, **du testest real** *(automatisierter Teil fertig: `tools/geraete_smoke.mjs` — Android-/iPhone-Emulation mit Touch-Taps, Overflow-, Touch-Ziel-, Save/Resume- und Performance-Checks, alles grün (~0,5 s bis interaktiv, Tap-Render < 70 ms). Eingebaut: Audio-Format-Fallback `.ogg → .m4a` via canPlayType (Aaron liefert BEIDE Formate!) + `touch-action: manipulation`. **Deine Seite: reale Tests nach der Checkliste in `docs/Geraete_Matrix_Befund.md`** — echtes iOS-Safari ist nicht emulierbar)* — 2026-07-09
- [ ] **E3 [D→C] Beta mit echten Spielern**, Feedback-Runde, letzte Eichung. **Du organisierst**, Claude fixt
- [ ] **E4 [C+D] Doku-Endstand**: alle verbleibenden `[PROVISORISCH]` → `[GESPERRT]` oder gestrichen; Index 00 final. *Sperr-Kandidaten, die sich seit Tor 3 angesammelt haben: Doppelschlag-Preise 40/55/70 + Nur-Schmiede-Regel (E6) · Fluch-Werte/-Platzierung (fluch.js) · Event-Gegenwerte der 3 Fluch-Events · Reifegrad-Werte (E6-Nachschärfung) · Meta-Einkommen/Setzlinge/Samen (C1/C5) · Lagerfeuer/Markt/Trösten-Dienst-Preise · Tutorial-/Mentor-/Enden-Texte nach deiner Redaktion. Dazu die formale Bestätigung der Alt-Entscheide aus „Offene [D]-Punkte"*
- [x] **E5 [C] Verbesserungsrunde 1** (Review 2026-07-09, Entscheide D): *(a) Tutorial: geführter erster Kampf je Profil — Mentor erklärt Wurf/Legen/Auflösen/Gegner-Absicht in seiner Art, verharmlost Übermut absichtlich (Tutorial + Narrativ in einem; `meta.tutorialGesehen`, Texte [ENTWURF]). (b) Enden-Zähler sichtbar: Trösten-Zahl 🕊 + Schreck Σ in der Statuszeile mit Ende-Hinweis-Tooltip. (c) Meta-Pacing gemessen (`sim/meta_loop.js`): Dorfschamane Ø Run 2,1 · Glöckner 5,0 · Schleiferin 9,8 · Setzlinge alle ≤ Run ~10 — gesund; **Befund: Rodbauer ist für reine RG-0-Spieler unerreichbar (0 %), nur Kletterer ~Run 17** — gewollt als Experten-Gate? [D-Beobachtung]. (d) Kampf-Seed (Save v7, `kampfKnoten`): Reload mid-Kampf startet denselben Kampf mit demselben Seed von vorn — kein Verlust bei Tab-Rauswurf, kein Auswürfeln per Neuladen. Gestrichen: Befriedungs-Sichtbarkeit (Entscheid: erstmal nicht))* — 2026-07-09
- [x] **E5b [C+D] Kampf-Arena nach Artefakt 12** *(fehlte bisher im Plan — nachgetragen)*: Kampf-Screen vom Listen-Layout zur StS-Arena umgebaut — Kulisse/Boden-Ebene je Region austauschbar, Monster rechts (Sprite, Absicht-Omen ⚔/×/🛡/☣, HP-Balken, Status-Badges), Hüter-Silhouette + Würfel-Armee auf der Boden-Ebene (Gemüt-Idles, ✦/◆-Marker, 🔒), Wurf-Leiste unten (Nummer·Icon·Name·Wert·Effekt), Atem-Orb, StS-Topbar, Belohnung als Overlay; Hochformat 72 vh + „Querformat empfohlen". **Design-Entscheide [D] eingeflossen:** 1 Gegner vs. Würfel-Armee, alle Figuren auf einer Boden-Ebene, KEINE Synergie-/Farb-Hilfen (§8.2 — „der Spieler soll selber schauen"). Layout-Doku: `docs/12_Kampfszene_Layout.md` + Mockup — 2026-07-11
- [x] **E6 [C] Restposten** — alle fünf Punkte umgesetzt, 189 Tests grün — 2026-07-11:
  - [x] **Doppelschlag verdrahtet** (04 §3.2): `schaden_doppel` expandiert im Kampf-Loop zu zwei vollen Schaden-Seiten (beide Passiv/Kraft, beide Gleichklang-fähig, Riss prüft je Teil-Seite, Glanz nur auf die erste) für EINE Atemzahlung; bricht Vollmond (Teilwerte < Höchstwert, bewusst). **Lawinen-Check aus 04 §5 schlug an:** als Gratis-Belohnungs-Gravur hob Doppelschlag RG 0 auf 71,3 % (n=4000, über Band; ohne ihn 68,8 %) — Konsequenz: **nur noch Schmiede-Kauf** (`NUR_SCHMIEDE_GRAVUREN` in belohnung.js), Preise 30/45/60 → 40/55/70 [PROVISORISCH]
  - [x] **Bruchstelle verdrahtet**: Namenskonflikt gelöst — `ueberschreibtZu: 'gegner_riss'` (der Typ `riss` bleibt der Wildwuchs-EIGEN-Riss auf den Spieler); legt Riss auf den GEGNER (Dauer-erneuernd), in `fuehreGegnerzugAus` setzt seine ganze Aktion zu 25 % aus (Spiegel des Hüter-Zünd-Aussetzers, `ergebnis.ausgesetzt` + UI-Meldung)
  - [x] **Fluch-System** (`fluch.js`, 07 §5.4): 3 Flüche als aufgedrückte Seiten (Fäule-Anfälligkeit = ☣2 auf den Hüter · Fluch-Seite = tote Seite · Scharte-Fluch = 🩹2, 1 Stapel überlebt den Decay) auf der schwächsten ungravierten Seite eines zufälligen Würfels, max. 1 Fluch je Würfel; **nicht überschmiedbar** (Guards in graviereSeite/schmiedePreis/UI), **Blaupause löst ihn NICHT** (sonst wäre der Schrein-Gegenwert sein eigener Fluch-Löser), nur Würfel-entfernen. Die 3 wartenden Events sind im Slice (Moderpfütze mit 50-%-Giftranke-Fund, Schrein mit epischer Blaupause, Trockene Quelle +30 🪙) — Blaupausen-Funde als `run.offeneBelohnungen` mit Ziel-Wahl im Event-Screen (transient, Save läuft eh erst am Knoten-Ende). **RG 9 nutzt jetzt den echten Fluch** statt der +2-Schreck-Näherung
  - [x] **Reifegrad-1/2-Nachschärfung**: Ist-Messung RG 1 = 70,8 / RG 2 = 71,1 % — im Rauschen ÜBER RG 0 (70,4). Neu: Elite-HP +10 → **+25 %**, Start-Schreck 1 → **2**. Nachmessung: RG 2 = 69,6 (< RG 0 ✓), RG 3 = 63,5; **Bänder halten: RG 0 = 68,8 % · RG 10 = 25,2 %** (je n=2000, nach Doppelschlag-Bremse), Gier dominiert nie (RG 0: 5,9 % · RG 10: 0,3 %). RG 1 bleibt in der Sim unsichtbar (Politik meidet Elites) — fühlbar für Spieler auf Segen-Jagd, als Politik-Grenze akzeptiert
  - [x] **`knoten.aktuell`-Puls**: `steps(1)`-Keyframe (harter 2-Frame-Wechsel, 1:1 durch das spätere Puls-Sprite ersetzbar), `prefers-reduced-motion` respektiert
  - [x] **UI-Chrome-Strings → Text-Keys** (D7-Merkposten): ~120 neue `ui.*`/`status.*`-Keys in de/en, `uebersetze()` mit `{name}`-Platzhaltern, EN im Browser verifiziert („⚔ Fight — row 1."). *(Kleiner Rest s. E7)*
- [ ] **E7 [C] Restposten 2** *(klein, nichts davon blockiert E3/E4)*:
  - [x] **Arena-Szene verdrahtet** (2026-07-11): `figurSprite`/`szeneSprite`-Loader; Kulisse + Boden R1 ersetzen den CSS-Verlauf (`.hat-bild`-Overrides), Hüter-Kampfsprite statt Silhouette, `prefers-reduced-motion` respektiert — **Region 1 im Browser voll bebildert** (Screenshot verifiziert)
  - [x] **Wurf-Leisten-Effektnamen** (E6-Regressionsfix): `status.schaden`/`status.rinde` zeigten den rohen Key → lesbares „Schaden/Rinde/…" via neuer `effekt.*`-Keys (DE/EN)
  - [x] **Atem-Pips verdrahtet** (2026-07-11): diegetische `atem.pip`/`atem.pip_leer`-Blattspiralen statt Kreis-Orb, voll/leer je verbleibendem Atem (Screenshot verifiziert)
  - [ ] restliche HUD-Sprites (assets/ui): Knöpfe/Übermut-Leiste/Schreck-Marke/overlay.gesperrt, Pergament/9-Slice für Panels — **[D]-Entscheid offen**: die geschnitzten Holz-Plaketten (mit eingebrannten Symbolen) kollidieren mit den Text-Labels der aktuellen StS-Arena-Buttons; entweder HUD auf Plaketten-Stil umbauen oder beim cleanen Look bleiben
  - [ ] Engine-seitige Ergebnistexte auf Keys umziehen (`waehleEventOption`-Wirkungsliste + `rasteLagerfeuer`-Texte in knoten.js liefern noch deutsche Strings an die UI)
  - [ ] Fluch-Anzeige im Arsenal außerhalb des Kampfes (💀 aktuell nur in Seiten-Pickern/Wurf-Leiste sichtbar)
  - [ ] falls E3-Beta es braucht: Elite-suchende Sim-Politik für eine echte RG-1-Messung (Befund §5)
  - [ ] optional nach deinem Geräte-Test: Web-App-Manifest („Zum Startbildschirm"), `100dvh`-Umstellung, History-Guard (alle drei [D]-abhängig, E2-Checkliste)

---

## Offene [D]-Punkte — alles Deine an EINEM Ort *(Stand 2026-07-11)*

**Blockiert den Release-Pfad (in dieser Reihenfolge):**
- [ ] **GitHub Pages aktivieren + Merge-Entscheid** (E1: Settings → Pages → Source „GitHub Actions"; Feature-Branch → main)
- [ ] **Reale Geräte-Tests** nach Checkliste `docs/Geraete_Matrix_Befund.md` (E2 — echtes iOS-Safari ist nicht emulierbar; Ergebnisse dort nachtragen, Bugs werden E-Punkte)
- [ ] **Text-Redaktion**: alle [ENTWURF]-Texte — Mentor/Zweifel/Wendung/Enden (D4), Tutorial (E5); Ton 01 §6 ist Chefsache
- [ ] **EN-Übersetzungs-Prüfung** (D7; seit E6 inkl. ~120 UI-Chrome-Keys)
- [ ] **E3 Beta organisieren** (echte Spieler, Feedback-Runde)

**Asset-Lieferungen (D6, Aaron — Prompts in 11, Prioritäten in `Sprite_Backlog.md`):**
- [ ] Priorität 1: Hüter-Kampf-Sprite · widerhall/saumhueter-Neuexport (Alpha-tauglich) · Kulisse+Boden R1
- [ ] danach: Gegner R2–R6, Gemüt-Varianten, HUD/VFX/Szenen, Böden/Kulissen R2–R6
- [ ] Audio komplett: Stems ~24 + SFX ~13, **je in .ogg UND .m4a** (iOS) · Bitmap-Font mit Umlauten

**Design-Entscheide (keine Eile — formale Sperrung gehört zu E4):**
- [ ] Rodbauer-Gate: für reine RG-0-Spieler unerreichbar (0 %, nur Kletterer ~Run 17) — gewollt als Experten-Gate? (E5-Befund)
- [ ] Alt-Entscheide aus Etappe A/B, durch die Tor-Abnahmen implizit bestätigt, formal aber offen: Ziehmodell „je Zug 5 frisch" (02 §2.2) · Rinde-Reserve nein (04 §2) · Sauber-Sieg „ohne HP-Verlust" (03 §11) · Gravur-Ökonomie ~12–13/Run · Freilauf/Klemme-Verrechnung (02 §7.5) · Tau-Knappheit R1–2 (03 §12.1 — Tor 3: Ø Trösten 10,9 ≥ 8, hält)
- [ ] Web-App-Manifest / `100dvh` / History-Guard — nur falls deine Geräte-Tests es nahelegen (E2-Checkliste „Beide")

---

## Laufende Pflege (parallel zu allem)

- **Doku-Sync [C]:** Nach jedem Etappen-Abschluss Build-Stand in 00 §4 / 09 §6 nachziehen. **Wichtig [D]:** neue Artefakt-Stände aus Design-Chats immer hochladen — Claude difft gegen den Repo-Stand und weist auf Regressionen hin (wie beim veralteten 00-Index geschehen).
- **Test-Disziplin [C]:** jede neue Mechanik bekommt Node-Tests; jeder UI-Schritt einen Chromium-Smoke; jedes Balance-Tor ein Befund-Dokument in `docs/`.
- **Save-Migrationen [C]:** jede Schema-Änderung = `SAVE_VERSION`+1 + Migrationsfunktion (Kettenpflicht-Test erzwingt das bereits).

## Annahmen

- Hosting-Ziel ist **GitHub Pages** (statische Web-App ohne Build-Step legt das nahe).
- „Aaron" (08) ist die Kunst-/Audio-Quelle — die Produktion der echten Assets liegt auf eurer Seite; Claude baut nur Platzhalter + Integration.
- Reihenfolge innerhalb der Etappen darf nach Abhängigkeiten optimiert werden; die Etappen-Grenzen (= Wellen + Tore aus 00 §2) sind fix.
