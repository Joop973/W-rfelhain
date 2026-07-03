# Würfelhain — Technik & Save (Artefakt 09)

*Architektur, Daten-Schema, Save-Format, Determinismus, Lokalisierung. `[GESPERRT]` = bestätigt. `[PROVISORISCH]` = baubar, Feinheiten offen.*

*Stand: 2026-07-02. Update: Kampf-State Ziehstapel/Hand/Ablage (§3.1), Schema-Slot `eigenStatus` (§2.11), `effekt.typ: "ermutigung"` (§2.1), Save-/RNG-Klärung für das Ziehmodell (§3.1/§4), Build-Stand um 12er-Re-Run-Vermerk. Vorheriges Update: Kristallisations-Mechanik (2026-06-30).*

---

## 1. Architektur `[GESPERRT]`

Vanilla JS, statische Web-App, kein Build-Step, kein TypeScript. Node nur für headless Tests/Sim, nie für Laufzeit.

```
/engine.js      // reine Kampf-Auflösung: Pools, L→R, Mult, Combos, floor
/rng.js         // mulberry32, gesäter Zufall
/push.js        // Übermut, Reroll, Tischsturz, Schreck, Kristallisation, Wurf-Gewichtung
/data.js        // statische Inhalts-Daten: Würfel-Vorlagen, Blaupausen, Gravuren,
                //   Gegner, Events, Hain-Segen, Text-Keys
/save.js        // Serialisierung, Versionierung, Migration, LocalStorage-IO
/ui/            // DOM-Rendering, Eingabe, kein Spiellogik-Code
/tests/         // Node-headless, kein DOM
/sim/           // Monte-Carlo, Node-headless, importiert engine.js/rng.js/push.js direkt
/index.html     // einziger Einstiegspunkt
```

**Regeln:**
- `engine.js`/`rng.js`/`push.js` sind **DOM-frei** — laufen identisch in Browser und Node. `[GESPERRT]`
- `data.js` enthält **keine Logik**, nur Objekte/Tabellen (s. §2). `[GESPERRT]`
- `ui/` greift nur lesend auf Engine-Resultate zu, nie umgekehrt — keine zirkulären Imports.
- Kein Bundler, keine npm-Build-Pipeline. ES-Module via `<script type="module">` oder einfache `<script>`-Tags. `[PROVISORISCH: genaues Modul-Format]`
- Persistenz ausschließlich LocalStorage (kein Server, kein IndexedDB im Slice). `[GESPERRT]`

---

## 2. Daten-Schema

Reine JS-Objektliterale/Fabrikfunktionen, keine Klassen-Pflicht. Felder unten sind verbindlich; zusätzliche Felder pro Inhalt erlaubt.

### 2.1 Seite `[GESPERRT]`

```js
{
  wert: 0,        // Zahlenwert, auch 0 erlaubt (reine Effekt-Seiten, 04 §1.1)
  effekt: []      // [{ typ: "schaden"|"rinde"|"faeule"|"brand"|"morsch"|"welk"|
                  //         "kraft"|"riss"|"echo"|"glanz"|"flaeche"|"beruhigung"|
                  //         "ermutigung"|"praegung"|"labung", wert: 0, ... }]
                  // Reihenfolge im Array = Auflöse-Reihenfolge falls mehrere (02 §4/03 §2)
}
```

- `"ermutigung"` ergänzt 2026-07-02 (Keyword 02 §6.4: +2 Gemüt universell, 1 Atem — Abgrenzung zu `"beruhigung"`, das nur bei Schreck > 0 greift). `[PROVISORISCH: Keyword, Slot GESPERRT]`

### 2.2 Würfel `[GESPERRT]`

```js
{
  id: "uuid",
  name: "Astschneide",
  typ: "schaden",        // primärer Pool: schaden|rinde|faeule|brand|stuetze|...
  atem: 1,                // Standard 1, Vollendet 0 (Untergrenze 0)
  gemuet: 0,               // Start 0; Schreck = max(0, -gemuet)
  blaupause: null,         // null oder { id, name, angewandtAm }
  seiten: [Seite, Seite, Seite, Seite, Seite, Seite],   // Index 0-5
  stufen: [0, 0, 0, 0, 0, 0]   // Verzauber-Stufe je Seite, 0-3, harter Cap 3
}
```

**Invarianten (Schema-Constraints, von `save.js`/Engine geprüft, nicht nur dokumentiert):**
- `stufen[i]` ∈ [0,3], harter Cap, global. `[GESPERRT]`
- Blaupause anwenden → **alle 6 `seiten` überschrieben UND alle 6 `stufen` auf 0 zurückgesetzt.** `[GESPERRT]`
- Blaupausen-Würfel sind danach normal verzauberbar (auch auf Quell/Hort-Seiten). `[GESPERRT]`
- Schreck sperrt höchste freie Seiten; **Tiebreak bei Wertgleichheit: niedrigerer `seiten`-Index zuerst** (deterministisch, auch bei Wert-0-Seiten). `[GESPERRT]`
- **Kristallisation:** bei Kampfende wird restliches Übermut (>0) **1:1 in `gemuet`-Abzug** auf die zuletzt gespielten Würfel verteilt, statt zu verfallen. Sofort-Mechanik (Tischsturz bei Übermut > 6) bleibt unverändert; Kristallisation ist die zusätzliche run-lange Konsequenz. `[GESPERRT — Sim-bestätigt 2026-06-30, Eingriff in vormals `[GESPERRT]` 02 §7 Übermut-Reset]`. Implementiert in `push.js: kristallisiereUebermut(uebermutRest, gespielteWuerfelLetzterZug)`.
- `gemuet` haftet am Würfel, nicht an der Kampf-Zone — Ziehstapel/Hand/Ablage (§2.11) ändern daran nichts.
- Atemkosten liegen am Würfel (`atem`), nicht an der Seite.

### 2.3 Blaupause `[GESPERRT]`

```js
{
  id: "quell",
  name: "Quell",
  typ: "stuetze",
  seitenVorlage: [Seite, Seite, Seite, Seite, Seite, Seite],
  seltenheit: "episch",     // haeufig|selten|episch
  quelle: "boss_event",     // belohnung|haendler|event|boss
  verbrauchtSichBeimAnwenden: true   // [GESPERRT], immer true
}
```

### 2.4 Verzauberung/Gravur `[GESPERRT]`

```js
{
  id: "wucht",
  name: "Wucht",
  ueberschreibtZu: "schaden_mult",   // Effekt-Typ der Zielseite
  stufen: [
    { stufe: 1, effektWert: 1.5, preisMuenzen: 40 },
    { stufe: 2, effektWert: 2.0, preisMuenzen: 60 },
    { stufe: 3, effektWert: 2.5, preisMuenzen: 80 }
  ],
  maxStufen: 3,              // harter Cap, global [GESPERRT]
  atemAenderung: 0,           // Standard: ändert Atem nicht
  einStufenSeite: false        // true für Echo/Glanz/Beruhigung/Ermutigung/Bruchstelle (04 §3.2)
}
```

**Effekt-Typ-Wechsel auf bereits verzauberter Seite** `[PROVISORISCH]`:

```js
// Aktion, kein Datenfeld am Würfel:
{
  aktion: "gravur_wechsel",
  seitenIndex: 3,
  alteGravurId: "schaerfe",
  neueGravurId: "gift",
  preis: Math.ceil(neueGravur.stufen[0].preisMuenzen * 1.5),   // +50% Default
  effekt: "setzt seiten[3].effekt + stufen[3] zurück auf Stufe 1 der neuen Gravur"
}
```

**Doppelschlag** `[GESPERRT-Prinzip, Werte PROVISORISCH]` — Sonderfall: eine Seite trägt zwei volle Schaden-Teilwerte:

```js
// seiten[i] für eine Doppelschlag-Seite, Stufe 2 Beispiel:
{
  wert: 0,              // ungenutzt, Teilwerte stecken im Effekt
  effekt: [
    { typ: "schaden", wert: 2 },   // Teilwert 1 — volle Schaden-Seite, +Passiv, Gleichklang-fähig
    { typ: "schaden", wert: 2 }    // Teilwert 2 — ebenso
  ]
  // Atemkosten: EINE Zahlung (Würfel-atem), trotz zwei Schaden-Beiträgen [GESPERRT]
}
```

### 2.5 Belohnung `[PROVISORISCH]`

```js
{
  id: "uuid",
  typ: "blaupause" | "gravur" | "muenzen" | "eicheln" | "tau" | "hain_segen" | "wuerfel_entfernen",
  inhalt: { /* je nach typ: Blaupause-Objekt, Gravur-Objekt, Betrag, ... */ },
  seltenheitsGewicht: 1.0,
  knotenTyp: "kampf" | "elite" | "boss" | "event"
}
```

### 2.6 Gegner + Absicht `[PROVISORISCH]`

```js
{
  id: "uuid",
  name: "...",
  region: 1,
  hp: 30,
  hpMax: 30,
  statusStapel: { morsch: 0, welk: 0, kraft: 0, riss: 0 },   // additive Stapel
  absichtAktuell: {
    typ: "angriff" | "block" | "status" | "mehrfach",
    wert: 8,
    statusTyp: null,   // bei typ "status": "morsch"|"welk"|"faeule"|"brand"|"riss"|
                        //   "scharte"|"klemme" (Eigen-Status, spielerseitig — s. §2.11/05)
    angekuendigt: true   // [GESPERRT] Absicht ist vor Spielerzug sichtbar
  },
  mechanikIds: ["..."]   // Verweis auf 05-Mechaniken
}
```

### 2.7 Event `[PROVISORISCH]`

```js
{
  id: "uuid",
  titel: "...",
  textKey: "event.duerre_brunnen.text",
  optionen: [
    { textKey: "event.duerre_brunnen.opt1", effekt: { /* Belohnung/Status/Fluch */ } },
    { textKey: "event.duerre_brunnen.opt2", effekt: { /* ... */ } }
  ],
  kannFluchAufdruecken: false   // [GESPERRT] Events dürfen Fluch-Seiten erzwingen
}
```

### 2.8 Hain-Segen `[PROVISORISCH]`

```js
{
  id: "uuid",
  name: "...",
  textKey: "segen.xyz.text",
  effekt: { /* Passiv-Modifikator, StS-Relikt-Stil */ },
  hatHaken: false,
  hakenTextKey: null,
  seltenheit: "haeufig" | "selten" | "episch" | "boss"
}
```

### 2.9 Stammbaum-Knoten `[PROVISORISCH]` (Welle 4)

```js
{
  id: "uuid",
  freigeschaltetDurch: "run_id" | "meta_bedingung",
  effekt: { /* dauerhafter Meta-Bonus */ },
  kosten: { jahresringe: 3 }
}
```

### 2.10 Welk-Global `[PROVISORISCH]`

Entsättigungs-/Palette-State, getrennt vom Kampf-Status „Welk" (Namenskollision beachten — technischer State, nicht Spielmechanik):

```js
{
  globalerWelkGrad: 0,   // 0-N, treibt Palette-Swap (08), kampf-übergreifend
  quelle: "run_fortschritt" | "region"
}
```

### 2.11 Kampf-State: Ziehmodell + Eigen-Status `[GESPERRT-Prinzip, Details PROVISORISCH]`

Existiert **nur während eines Kampfs**, wird bei Kampfende aufgelöst und **nie persistiert** (s. §3.1 — kein Mid-Kampf-Save). Referenziert von 02 §2.2/§8.2 und 06 §5.

```js
{
  // Ziehmodell (StS-Stil, 02 §2.2): Arrays von Würfel-IDs, disjunkt,
  // Vereinigung = gesamtes Arsenal
  ziehstapel: ["id", ...],   // Kampfbeginn: gemischtes Arsenal
  hand: ["id", ...],          // je Zug 5 frisch gezogen, Zugende → ablage
  ablage: ["id", ...],        // Reshuffle: bei Zugbeginn < 5 im Ziehstapel

  // Vier Eigen-Status, spielerseitig (02 §8.2): additiv, Cap 3,
  // Decay -1/Runde, kampf-begrenzt
  eigenStatus: { wetzung: 0, scharte: 0, freilauf: 0, klemme: 0 },

  gespielteWuerfelLetzterZug: ["id", ...]   // Kristallisations-Ziel (02 §7.2)
}
```

- Invariante: `ziehstapel ∪ hand ∪ ablage` = `runState.arsenal`-IDs, paarweise disjunkt. Engine prüft.
- `eigenStatus` ist der spielerseitige Zwilling von `statusStapel` am Gegner (§2.6) — bewusst getrennter Slot, weil kampf-begrenzt und nie im Save.
- Gegner-Absichten mit `statusTyp: "scharte"|"klemme"` schreiben hierher; Segen/Klassen-Effekte (Wetzung/Freilauf) ebenso.

### 2.12 Save-Objekt

s. §3.

---

## 3. Save-Format `[GESPERRT: Prinzip, Felder PROVISORISCH]`

### 3.1 Struktur

```js
{
  saveVersion: 1,                 // [GESPERRT] Pflichtfeld, int, monoton steigend
  erstelltAm: "ISO-8601",
  zuletztGespeichertAm: "ISO-8601",
  runState: {
    klasse: "eichwart",
    arsenal: [Würfel, Würfel, ...],   // Start 12 (00 §3 [GESPERRT-OVERRIDE]), Gesamtmenge —
                                        //   Ziehstapel/Hand/Ablage sind KEIN Save-Inhalt (s. u.)
    region: 1,
    knotenIndex: 3,
    waehrungen: { muenzen: 0, eicheln: 0, tau: 0 },
    hainSegen: [HainSegenId, ...],
    reifegrad: 0,
    uebermut: 0,                  // [GESPERRT] reset bei Kampfbeginn UND nach Kristallisation am Kampfende —
                                    // im Save effektiv immer 0 zw. Knoten (Rest fließt in arsenal[].gemuet)
    aktiveFluechte: [],
    sauberSiegStreak: 0
  },
  metaState: {                    // Welle 4, run-übergreifend
    jahresringe: 0,
    stammbaum: [StammbaumKnotenId, ...],
    freigeschalteteKlassen: ["eichwart"]
  },
  einstellungen: {
    sprache: "de" | "en",
    audioAn: true
  }
}
```

**Kein Mid-Kampf-Save `[PROVISORISCH: Default, entschieden 2026-07-02]`:**
- Gespeichert wird **nur zwischen Knoten** (nach Knoten-Abschluss, §3.3 unverändert). Der Kampf-State (§2.11: `ziehstapel`/`hand`/`ablage`/`eigenStatus`) wird **nie serialisiert**.
- App-Abbruch mitten im Kampf → Kampf startet beim nächsten Laden **neu** (voller HP-Stand vom Knoten-Eintritt, Arsenal-Gemüt vom letzten Save).
- Konsequenz: **RNG-Stream-Persistenz entfällt** — die offene Frage aus §4 ist damit beantwortet (Stream-Neustart je Session akzeptabel, da kein Seed-Modus existiert und kein Kampf-Zustand fortgesetzt werden muss). Auch die Ziehstapel-Reihenfolge muss nie persistiert werden.
- Fallback, falls Spielgefühl Mid-Kampf-Resume verlangt (lange Boss-Kämpfe auf Mobile): dann §2.11 + RNG-State in den Save aufnehmen und `saveVersion` erhöhen — bewusst vertagt, kein Slice-Inhalt.

### 3.2 Versionierung & Migration `[GESPERRT: Prinzip]`

- Jede Save-Struktur-Änderung erhöht `saveVersion` um 1.
- `save.js` exportiert `migrate(rawSave)`:
  - Liest `saveVersion`, wendet **Migrationsfunktionen sequenziell** an (`migrate_1_to_2`, `migrate_2_to_3`, ...).
  - Jede Migrationsfunktion ist rein, nimmt altes Objekt, gibt neues zurück, keine Seiteneffekte.
  - Unbekannte/zu hohe `saveVersion` (Save aus neuerer Version geladen in älterem Build) → Fehler anzeigen, **nicht** stillschweigend laden. `[GESPERRT]`
  - Fehlende Migration zwischen zwei Versionen = Build-Fehler (Test prüft Lückenlosigkeit der Kette). `[PROVISORISCH: Testpflicht]`

### 3.3 Persistenz `[GESPERRT]`

- LocalStorage, Key `"wuerfelhain_save_v" + saveVersion` oder fester Key `"wuerfelhain_save"` mit `saveVersion` im Payload — **fester Key bevorzugt**, damit Migration greift statt Save-Verlust. `[PROVISORISCH: Key-Strategie]`
- Schreiben: nach jedem Knoten-Abschluss, nicht pro Zug (Performance, Verschleiß irrelevant bei LocalStorage aber unnötige Schreibzyklen vermeiden). Konsistent mit „kein Mid-Kampf-Save" (§3.1).
- Kein Cloud-Sync im Slice.

---

## 4. Determinismus & RNG `[GESPERRT]`

- `rng.js`: gesäter **mulberry32**, einzige Zufallsquelle für Würfelwürfe, **Ziehstapel-Mischen**, Belohnungs-Ziehung, Gegner-Variation.
- Seed wird **ausschließlich intern für Tests/Sim** gesetzt (`new RNG(12345)`), nie im Spiel-UI exponiert.
- **Kein Daily-Modus, kein Seed-Modus für Spieler.** `[GESPERRT]`
- Echte Runs: Seed aus `Date.now()` oder `crypto.getRandomValues` bei Run-Start. **RNG-State wird nicht persistiert** — durch „kein Mid-Kampf-Save" (§3.1) entfällt der einzige Bedarf; je Session startet ein frischer Stream. `[PROVISORISCH: Default 2026-07-02, vormals offene Frage]`
- Engine/Push sind reine Funktionen über `(state, rng) → neuerState` — keine globalen Zufalls-Seiteneffekte. `[GESPERRT]`
- Sim/Tests: Mischen des Ziehstapels läuft über denselben gesäten Stream → deterministische Kampf-Reproduktion headless bleibt möglich.

---

## 5. Lokalisierung DE/EN `[GESPERRT: Prinzip]`

- Kein Freitext in `data.js`/Engine — alle Spielertexte über **Text-Keys**.
- Struktur:

```js
// data.js liefert Keys, keine Strings
{ name_key: "wuerfel.astschneide.name", ... }

// separate Sprachdatei(en), z.B. /i18n/de.js, /i18n/en.js
{
  "wuerfel.astschneide.name": "Astschneide",
  "event.duerre_brunnen.text": "...",
  ...
}
```

- Key-Konvention: `kategorie.id.feld` (z. B. `blaupause.quell.name`, `segen.xyz.haken`).
- Fehlender Key in Zielsprache → Fallback auf `de` (Ausgangssprache), Konsole-Warnung im Dev-Modus. `[PROVISORISCH]`
- `einstellungen.sprache` im Save (s. §3.1) steuert aktive Sprachdatei.
- Pluralisierung/Zahlenformate: nicht im Slice — Zahlen sprachneutral angezeigt. `[PROVISORISCH]`

---

## 6. Build-Stand `[GESPERRT]`

**Claude-Code-Repo (echter Spielcode, Smartphone-Workflow):**
- `rng.js` — mulberry32, deterministisch (`RNG`-Klasse, `naechsteZahl()`, `wuerfel()`). ✓
- `engine.js` — reine Kampf-Auflösung (Pools, L→R, Mult typgebunden, Kraft, Glanz, Echo, Gleichklang, Vollmond mit Klassen-Sockel-Ausnahme, Morsch/Welk final, floor). ✓
- `push.js` — Übermut, Reroll-Ökonomie (inkl. Freilauf/Klemme-Verrechnung), Tischsturz, Schreck-Sperrung, Push/Beruhigung/Ermutigung, **Kristallisation (`kristallisiereUebermut()`, `verarbeiteKampfende()`) portiert**. ✓
- `ziehstapel.js` — **Ziehmodell (§2.11) portiert**: `kampfbeginn()`/`zieheHand()`/`zugende()`/`pruefeInvariante()`, Fisher-Yates-Mischen über `rng.js`. ✓
- `tests/engine.test.js`, `tests/push.test.js`, `tests/ziehstapel.test.js` — 16 Tests grün. ✓
- `data.js`, `save.js`, `ui/`, `sim/` — **noch nicht angelegt.**
- **Beide Bausteine für den 12er-Re-Run (Kristallisation + Ziehmodell) sind jetzt im Repo-Code vorhanden** — der Re-Run selbst (via `sim/`) steht noch aus, da `sim/` und `data.js` fehlen.

**Sandbox-Referenzimplementierung (Design-Chat, nicht Teil des Repos):**
- Eigenständiger, lauffähiger Node-Prototyp (`rng.js`/`engine.js`/`push.js`/`data.js`/`sim/gier_vs_pflege.js`, ES-Module) zur Verifikation des Welle-1-Tors gebaut, da kein Zugriff auf den echten Repo-Code bestand.
- Diente als **Beleg-Werkzeug**, nicht als Übernahme-Vorlage 1:1 — Funktionsnamen/-signaturen können vom Repo-Code abweichen; Mechanik-Logik (insbesondere `kristallisiereUebermut`) ist die zu portierende Referenz.
- **Welle-1-Tor (Gier-vs-Pflege) strukturell ERFÜLLT** mit der Kristallisations-Regel: Pflege-Politik schlägt sowohl blinde als auch klug-tischsturz-vermeidende Gier-Politik konsistent über mehrere Schwierigkeitsstufen. **Achtung: alle Läufe auf dem alten 6er-Arsenal** — mit dem 12er-Arsenal + Ziehmodell ist ein **Re-Run nötig** (Struktur hält erwartbar: Atem-Deckel + Kristallisation sind arsenal-größen-unabhängig; absolute Siegraten/Schreck-Werte verschieben sich, 03 §12.1). Exakte Zielband-Kalibrierung (65–70 % Siegrate, 03 §13) offen.
- Befund-Dokument: `Wuerfelhain_Welle1_Tor_Befund.md`.

**Gesamtstatus:** Welle-0-Tor erfüllt. Welle-1-Tor strukturell erfüllt (Sandbox-verifiziert, 6er-Arsenal) — **Kristallisation und Ziehmodell sind jetzt im Claude-Code-Repo portiert**; offen ist der **12er-Re-Run selbst** (`sim/` + `data.js` fehlen noch), bevor Schema-Erweiterung für Welle 2 beginnt.

---

## 7. Offene Punkte für Sim/Folge-Artefakte

- ~~Kristallisations-Mechanik ins Claude-Code-Repo portieren~~ — **erledigt** (`push.js: kristallisiereUebermut()`).
- ~~Ziehmodell implementieren~~ — **erledigt** (`ziehstapel.js`).
- **12er-Re-Run durchführen** (`sim/` + `data.js` als Voraussetzung) — höchste Priorität, damit das Welle-1-Tor real (nicht nur strukturell/Sandbox) auf 12er-Arsenal-Basis geschlossen ist.
- Feinkalibrierung Schwierigkeit/Heilung ins Zielband 65–70 % (03 §13) — auf 12er-Basis.
- ~~RNG-State-Persistenz bei Mid-Run-Save~~ — **entschieden** (§3.1/§4): kein Mid-Kampf-Save, kein RNG-State im Save. `[PROVISORISCH: Default, Fallback dokumentiert]`
- LocalStorage-Key-Strategie (§3.3) final festlegen.
- Migrationsketten-Testpflicht (§3.2) in `tests/` verankern, sobald `saveVersion` 2 existiert.
- `ui/`-Modulgrenzen (Komponenten vs. einzelne Render-Funktionen) — Welle 2.
