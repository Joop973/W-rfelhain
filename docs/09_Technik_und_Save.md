# Würfelhain — Technik & Save (Artefakt 09)

*Architektur, Daten-Schema, Save-Format, Determinismus, Lokalisierung. `[GESPERRT]` = bestätigt. `[PROVISORISCH]` = baubar, Feinheiten offen.*

*Stand: 2026-06-30. Update: Kristallisations-Mechanik (Übermut→Schreck, Welle-1-Tor) ergänzt.*

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
                  //         "praegung"|"labung", wert: 0, ... }]
                  // Reihenfolge im Array = Auflöse-Reihenfolge falls mehrere (02 §4/03 §2)
}
```

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
  einStufenSeite: false        // true für Echo/Glanz/Beruhigung/Bruchstelle (04 §3.2)
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
    statusTyp: null,   // bei typ "status": "morsch"|"welk"|"faeule"|"brand"|"riss"
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

### 2.11 Save-Objekt

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
    arsenal: [Würfel, Würfel, ...],
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

### 3.2 Versionierung & Migration `[GESPERRT: Prinzip]`

- Jede Save-Struktur-Änderung erhöht `saveVersion` um 1.
- `save.js` exportiert `migrate(rawSave)`:
  - Liest `saveVersion`, wendet **Migrationsfunktionen sequenziell** an (`migrate_1_to_2`, `migrate_2_to_3`, ...).
  - Jede Migrationsfunktion ist rein, nimmt altes Objekt, gibt neues zurück, keine Seiteneffekte.
  - Unbekannte/zu hohe `saveVersion` (Save aus neuerer Version geladen in älterem Build) → Fehler anzeigen, **nicht** stillschweigend laden. `[GESPERRT]`
  - Fehlende Migration zwischen zwei Versionen = Build-Fehler (Test prüft Lückenlosigkeit der Kette). `[PROVISORISCH: Testpflicht]`

### 3.3 Persistenz `[GESPERRT]`

- LocalStorage, Key `"wuerfelhain_save_v" + saveVersion` oder fester Key `"wuerfelhain_save"` mit `saveVersion` im Payload — **fester Key bevorzugt**, damit Migration greift statt Save-Verlust. `[PROVISORISCH: Key-Strategie]`
- Schreiben: nach jedem Knoten-Abschluss, nicht pro Zug (Performance, Verschleiß irrelevant bei LocalStorage aber unnötige Schreibzyklen vermeiden).
- Kein Cloud-Sync im Slice.

---

## 4. Determinismus & RNG `[GESPERRT]`

- `rng.js`: gesäter **mulberry32**, einzige Zufallsquelle für Würfelwürfe, Belohnungs-Ziehung, Gegner-Variation.
- Seed wird **ausschließlich intern für Tests/Sim** gesetzt (`new RNG(12345)`), nie im Spiel-UI exponiert.
- **Kein Daily-Modus, kein Seed-Modus für Spieler.** `[GESPERRT]`
- Echte Runs: Seed aus `Date.now()` oder `crypto.getRandomValues` bei Run-Start, nicht im Save persistiert als reproduzierbarer Spiel-Modus (nur als interner RNG-State, falls Mid-Run-Speicherung den RNG-Stream fortsetzen muss — `[PROVISORISCH: RNG-State im Save nötig?]`).
- Engine/Push sind reine Funktionen über `(state, rng) → neuerState` — keine globalen Zufalls-Seiteneffekte. `[GESPERRT]`

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
- `rng.js` — mulberry32, deterministisch. ✓
- `engine.js` — reine Kampf-Auflösung (Pools, L→R, Mult typgebunden, Kraft, Morsch/Welk final, floor). ✓
- `push.js` — Übermut, Reroll, Tischsturz, Schreck, stimmungsabhängiges Würfeln. ✓
- `tests/engine.test.js` — 11 Tests grün. ✓
- `data.js`, `save.js`, `ui/`, `sim/` — **noch nicht angelegt.**
- **Kristallisations-Mechanik (§2.2, §3.1) noch NICHT im Repo-Code portiert** — bisher nur in der Sandbox-Referenz verifiziert (s. u.). Nächster Claude-Code-Schritt: `push.js` um `kristallisiereUebermut()` ergänzen, Kampf-Loop entsprechend verdrahten, Tests ergänzen.

**Sandbox-Referenzimplementierung (dieser Chat, nicht Teil des Repos):**
- Eigenständiger, lauffähiger Node-Prototyp (`rng.js`/`engine.js`/`push.js`/`data.js`/`sim/gier_vs_pflege.js`, ES-Module) zur Verifikation des Welle-1-Tors gebaut, da kein Zugriff auf den echten Repo-Code bestand.
- Diente als **Beleg-Werkzeug**, nicht als Übernahme-Vorlage 1:1 — Funktionsnamen/-signaturen können vom Repo-Code abweichen; Mechanik-Logik (insbesondere `kristallisiereUebermut`) ist die zu portierende Referenz.
- **Welle-1-Tor (Gier-vs-Pflege) strukturell ERFÜLLT** mit der Kristallisations-Regel: Pflege-Politik schlägt sowohl blinde als auch klug-tischsturz-vermeidende Gier-Politik konsistent über mehrere Schwierigkeitsstufen. Exakte Zielband-Kalibrierung (65–70 % Siegrate, 03 §13) offen, reine Eichungsarbeit, kein struktureller Blocker mehr.
- Befund-Dokument: `Wuerfelhain_Welle1_Tor_Befund.md`.

**Gesamtstatus:** Welle-0-Tor erfüllt. Welle-1-Tor strukturell erfüllt (Sandbox-verifiziert) — **Portierung der Kristallisations-Mechanik ins Claude-Code-Repo steht noch aus**, bevor Schema-Erweiterung für Welle 2 beginnt.

---

## 7. Offene Punkte für Sim/Folge-Artefakte

- **Kristallisations-Mechanik ins Claude-Code-Repo portieren** (höchste Priorität — Welle-1-Tor real erst geschlossen, wenn der echte Code die Sim-verifizierte Regel trägt, nicht nur die Sandbox-Referenz).
- Feinkalibrierung Schwierigkeit/Heilung ins Zielband 65–70 % (03 §13).
- RNG-State-Persistenz bei Mid-Run-Save (§4) — nötig oder Stream-Neustart akzeptabel?
- LocalStorage-Key-Strategie (§3.3) final festlegen.
- Migrationsketten-Testpflicht (§3.2) in `tests/` verankern, sobald `saveVersion` 2 existiert.
- `ui/`-Modulgrenzen (Komponenten vs. einzelne Render-Funktionen) — Welle 2.
