# Würfelhain — Kampfszenen-Layout (Artefakt 12)

*Räumliches Konzept der Kampfszene: wo Kreaturen, Würfel, Tisch, Zustände und Effekte hingehören, damit die Einzel-Sprites **eine zusammenhängende Bühne** ergeben statt zusammengewürfelter Fragmente. Hochformat (Handy senkrecht), typisches Roguelike-Deckbuilder-Layout (Slay-the-Spire-Skelett). Baut auf 08 (Hain-Tisch, Palette, Maße), 02/03 (Kampf-Mechanik), 05 (Gegner/Absichten). Stand 2026-07-09.*

---

## 0. Das Kohäsions-Problem und seine Lösung

**Warum Einzel-Sprites wie Fragmente wirken:** keine gemeinsame Standfläche, kein gemeinsames Licht, kein Rahmen, keine Größen-Hierarchie. Man sieht ausgeschnittene Figuren, die nebeneinander schweben.

**Wie Slay the Spire es löst:** eine gemalte Kulisse, Gegner stehen auf *einer* Bodenlinie mit Schlagschatten, ein durchgehender Rahmen/Vignette, die Karten als eine gefächerte Hand unten, ein fixes HUD.

**Würfelhains eingebautes Kohäsions-Mittel ist der Hain-Tisch (08 §1.2).** Der gesamte Kampf spielt auf einer Holztisch­platte im Hain. Das ist der Rahmen, der alles zusammenbindet:

| Ebene | Rolle | Bindung |
|---|---|---|
| **Kulisse** (hinten) | die ferne Hain-Welt, Parallaxe, entsättigt mit der Welk-Stufe | „Wo" |
| **Gegner** | steht *im Hain, knapp hinter der Tischkante*, mit Bodenschatten, überragt den Tisch | steht auf demselben Boden wie die Kulisse |
| **Tischplatte** (vorne) | konstante, warme Holzbühne in leichter Aufsicht | der ruhige Anker, auf dem alles liegt |
| **Würfel-Kreaturen** | liegen *auf* dem Tisch (die Hand), kleiner Schlagschatten aufs Holz | liegen auf derselben Platte |
| **UI/HUD** | „Zeug auf dem Tisch": Kerb-Skala, Eichel-Schale, Tau-Fläschchen | in dieselbe Holz-Welt eingelassen |

**Die fünf Kohäsions-Regeln** (das eigentliche Rezept — s. §5) machen aus den Fragmenten ein Bild: *ein* Licht, *ein* Boden mit Schatten, *ein* Rahmen, *eine* Größen-Hierarchie, *eine* Farb-Gradierung.

---

## 1. Grund-Aufbau: Hochformat, Bänder von oben nach unten

Das Handy senkrecht (Hochformat, logische Breite 224 px, 08 §1.3). Die **Haupt-Aktionsachse ist vertikal**: die Würfel liegen unten bei der Spieler-Hand, ihre Wirkung steigt über den Tisch nach oben und trifft den Gegner. Das liest sich im Hochformat natürlich und gibt jeder Kraft eine sichtbare Flugbahn.

```
┌───────────────────────────────┐  ← Handy senkrecht (Hochformat)
│  BAND 0  Kulisse (Hain)        │   Himmel/Bäume, Parallaxe,
│          entsättigt m. Welk    │   entsättigt mit der Region
│ ┌───────────────────────────┐ │
│ │ BAND 1  GEGNER-BÜHNE       │ │   Gegner mittig, Bodenschatten
│ │   Absicht (⚔ 12 / 🛡 / ×2) │ │   Absicht ÜBER dem Kopf
│ │        ┌─────┐             │ │   HP-Balken darunter
│ │        │ 👹  │  HP▓▓▓▓░░   │ │   Status-Badges am Fuß
│ │        └─────┘ 🔥3 ☣2      │ │   (Boss: Phasen-Pips, Twist)
│ ├───────────────────────────┤ │
│ │ BAND 2  Tischkante ────────│ │   Horizont: Gegner dahinter,
│ ├───────────────────────────┤ │   Würfel davor (Tiefen-Anker)
│ │ BAND 3  SPIELFELD / REIHE  │ │   Kerb-Slots auf dem Holz,
│ │   [S][S][R]  →  auflösen →  │ │   Ablage L→R, Block-Token
│ ├───────────────────────────┤ │
│ │ BAND 4  HÜTER-LEISTE       │ │   ❤HP  Übermut▐▐▐░░  Atem●●●
│ │   🪙 🌰 💧  Region 3/6  🌿  │ │   Währungen, Schreck Σ, Segen
│ ├───────────────────────────┤ │
│ │ BAND 5  HAND (5 Würfel)    │ │   Würfel-Kreaturen auf dem
│ │  🎲 🎲 🎲 🎲 🎲            │ │   Tisch; Wurf-Seite groß lesbar
│ │  Zieh▮5        Ablage▮3    │ │   Gemüt-Gesicht; gesperrte Seiten
│ ├───────────────────────────┤ │
│ │ BAND 6  AKTIONEN           │ │   [Neu werfen +1] [Auflösen]
│ │                            │ │   [Trösten]  — daumenerreichbar
└─┴────────────────────────────┴─┘
```

---

## 2. Die Bänder im Detail — wo was hingehört

### Band 0 — Kulisse `bg.kulisse.rN` (hinter allem)
- Ferner Hain je Region (08 §4.4), zwei bis drei Parallaxe-Ebenen (nahe Bäume / Mittel-Hain / Dunst).
- **Entsättigt automatisch mit der Welk-Stufe** (D5 ist verdrahtet: `welk-0…5`-Klasse am Wurzel-Container). Das ist der visuelle Dürre-Erzählstrang.
- Trägt **keine** Lesbarkeits-Last — bewusst ruhig, damit Gegner und Würfel vorne ablesbar bleiben.

### Band 1 — Gegner-Bühne (oberes Drittel, das Wichtigste fürs Roguelike-Lesen)
- **Kreatur** mittig, steht auf dem Hain-Boden knapp hinter der Tischkante, mit **weichem Schlagschatten** (bindet sie an den Boden — nie freischwebend). Größe nach Rolle (§4).
- **Absicht** (Absichtsmuster, 05) als **Omen über dem Kopf** — das zentrale Roguelike-Telegraph: `⚔ 12` (Angriff mit Wert), `🛡` (Block), Status-Glyph (legt Fäule/Brand…), `×2`/`×3` (Mehrfach-Treffer der Rasenden). Ohne diese Vorschau kein faires Roguelike.
- **HP-Balken** direkt unter der Kreatur, mit Zahl.
- **Status-Auflagen auf dem Gegner** als kleine Stapel-Badges am Fuß: `🔥3` Brand, `☣2` Fäule, Morsch/Welk/Kraft/Riss (Icons 08 §4.6). Zeigt dem Spieler seine gelegten DoTs.
- **Boss-Extras:** Phasen-Pips (Phase 1/2/3), Twist-Marker (z. B. „Auflodern"), und beim **Endboss** das `bossSchreck`-Herz + die **Spiegel-Module** (die geliehenen ängstlichsten Spieler-Würfel) schweben neben ihm (05 §8).

### Band 2 — Tischkante `bg.tischrand` (dünner Streifen)
- Die **Horizontlinie** Hain→Tisch. Der Gegner steht dahinter, die Würfel liegen davor. Dieser eine Streifen erzeugt die Tiefe, die „vorne Hand / hinten Feind" glaubwürdig macht.
- Funktional die **Trefferlinie**: gelegte Kräfte starten hier nach oben zum Gegner; Gegner-Angriffe schlagen hier auf den Tisch/Hüter herab.

### Band 3 — Spielfeld / Reihe (Tischoberfläche)
- Die **Reihe** = Platzier-Zone: in die Tischplatte **geritzte Slots** (`ui.pool.feld`), in die gespielte Würfel-Seiten links→rechts einsortiert werden (Auflösungs-Reihenfolge, 02). Jeder Slot dezent nach Pool-Typ getönt (Schaden=Glut, Rinde=Holz, …).
- Beim **Auflösen** wandert eine Hervorhebung links→rechts durch die Slots, die Wirkung fliegt über die Kante nach oben.
- Der **Block** des Hüters (angesammelte Rinde) liegt hier als Borke-Schild-Token.

### Band 4 — Hüter-Leiste (dünner Streifen, Tisch-Vorderkante)
Diegetisch in die vordere Tischkante eingebrannt / als kleine Requisiten:
- **❤ HP** (Herz + Balken), **Übermut**-Waage (0–6, Kipp-Punkt markiert — die Gier-Anzeige), **Atem** ●●● (3), **Währungen** 🪙 Münzen / 🌰 Eicheln / 💧 Tau, **Region N/6**, **Schreck Σ**, **Segen**-Icons 🌿.
- StS-Analogie: das ist die untere HUD-Zeile, nur als „Zeug am Tischrand" statt als schwebendes Overlay.

### Band 5 — Hand (unteres Drittel, beim Spieler)
- Die **5 gezogenen Würfel** als Kreaturen, auf dem nahen Tisch in leichter Reihe/Fächerung, je mit kleinem Schatten.
- Jeder Würfel zeigt **drei Informations-Ebenen gleichzeitig**, ohne sich zu verdecken:
  1. **Wurf-Seite** groß & lesbar: Zahl + Effekt-Icon auf der Oberseite (die Spiel-Information — Priorität).
  2. **Gemüt-Gesicht**: Augen/Haltung `ruhig`/`froh`/`aengstlich` (die Persönlichkeit — kleiner, aber sichtbar; das ist Würfelhains Alleinstellung).
  3. **Gesperrte Seiten** (Schreck): abgedunkelt mit Dornen-Riegel-Overlay (`overlay.gesperrt`).
- **Tippen** → der Würfel kippt seine gewählte Seite nach oben und gleitet in einen Reihe-Slot.
- **Ziehstapel** (linke Ecke) + **Ablage** (rechte Ecke) als kleine Würfel-Stapel mit Zahl.

### Band 6 — Aktionsleiste (ganz unten, daumenerreichbar)
- **Neu werfen** (zeigt Übermut-Kosten bzw. „gratis"), **Auflösen**, **Trösten**. Große Holz-Plaketten (`ui.knopf.*`).

---

## 3. Animation & Effekte — die vertikale Achse nutzen

Hochformat heißt: viel Höhe, wenig Breite. Deshalb läuft die Dramaturgie **vertikal**, und die Breite dient dem Nebeneinander (Würfel-Reihe, Status-Badges).

| Ereignis | Bewegung in der Szene |
|---|---|
| **Kraft auflösen** | Wirkung steigt von der Reihe (Mitte) über die Tischkante hoch zum Gegner — sichtbare Flugbahn. |
| **Gegner-Absicht** | oben über dem Kopf angekündigt; beim Gegnerzug fährt der Angriff von oben herab auf Tisch/Hüter. |
| **Übermut → Kipp-Punkt** | die Übermut-Waage füllt sich glutrot; bei > 6 **bebt der ganze Tisch** und Würfel poltern (`fx.tischsturz`) — ein Ganzszenen-Ereignis, maximal ablesbar. |
| **Trösten** | warmer Tau-Puls auf dem anvisierten Würfel unten (`fx.troesten`); der Zier-Stem kehrt kurz zurück (Audio, 08 §2.2). |
| **Kristallisation** (Kampfende) | Frost kriecht über die Würfel mit Rest-Übermut → Schreck (`fx.kristallisation`). |
| **Vollmond** | seltener heller Akkord + Aufblenden oben (`fx.vollmond`). |
| **Gemüt-Wechsel** | ein Würfel, der ängstlich wird, duckt sich, entsättigt, eine Seite verriegelt sichtbar. |
| **Welk-Stufen-Wechsel** (Regionstor) | Kulisse + Palette blenden weich in die trockenere Stufe (D5), Audio dünnt aus. |

---

## 4. Größen-Hierarchie (der stärkste Anti-Fragment-Hebel)

Alles gleich groß = Fragment-Optik. In der Szene skaliert **jede Rolle** anders (logische px, `manifest.json` → `displayLogisch`):

| Element | Logische Größe | Wirkung |
|---|---|---|
| Würfel-Kreatur (Hand) | ~40–52 | handlich, nah, viele nebeneinander |
| Normaler Gegner | ~64 | mittig, überschaubar |
| Elite | ~80 | spürbar größer, bedrohlicher |
| Boss | ~110 | überragt den Tisch |
| Endboss | ~140 | bricht oben aus dem Rahmen, dominiert |

Der Kontaktabzug zeigt alle Sprites gleich groß — **in der Szene towert der Boss, während die Würfel in der Hand liegen.** Das allein nimmt 80 % des „zusammengewürfelt"-Eindrucks.

---

## 5. Kohäsions-Regeln für die Asset-Produktion (an Aaron)

Damit jedes künftige Sprite in die Bühne passt:

1. **Ein Licht: von oben links, weich.** (Prüfen: der Saumhüter war frontal beleuchtet — neu ausleuchten. Die Tischplatte hat ihr Licht oben links, alle Figuren müssen dem folgen.)
2. **Geerdet, nicht schwebend:** jede Figur mit kleinem Kontakt-/Schlagschatten zeichnen; keine isolierten Schwebeposen (Würfel haben Füßchen — gut).
3. **Gleiche Konturstärke** (dunkle Rinde-Outline, 08 §0.1). Die Charge stimmt überwiegend; der Moosgnom ist weicher/malerischer → an die anderen angleichen.
4. **Kein eingebrannter Hintergrund, kein Nebel/Glow/Vignette** hinter der Figur (sonst nicht freistellbar — s. Freistellungs-Befund).
5. **Silhouette zuerst:** die Figur muss bei ihrer *Ziel-Größe* (48 px!) an der Silhouette erkennbar sein. Detail, das bei 48 px verschwindet, ist verschenkt.
6. **Farb-Gradierung zur Laufzeit:** die Voll-Farb-KI-Sprites bekommen im Spiel einen dezenten warmen Global-Grade + die Welk-Entsättigung → sie lesen als *ein* Set (dies ist der bewusste [D]-Abweich vom strikten 7-Farben-Raster, D5-Filter-MVP).

---

## 6. Verbesserungen gegenüber dem aktuellen Platzhalter-UI

Der jetzige `ui/main.js` stapelt beschriftete Kästen als schlichte DOM-Sektionen — funktional, aber genau die Fragment-Optik. Der Umbau:

| Jetzt (Platzhalter) | Ziel (Szene) |
|---|---|
| Kästen untereinander, flach | geschichtete Bühne: Kulisse → Tisch → Kreaturen → HUD |
| Gegner = Box mittig | Kreatur auf Bodenlinie, Absicht darüber, Schatten |
| Statuszeile als Text | Hüter-Leiste in die Tischkante eingelassen |
| Hand = Buttons | Würfel-Kreaturen auf dem Tisch, Wurf-Seite groß |
| kein Größenunterschied | Rollen-Größen-Hierarchie (§4) |
| kein Effekt-Ort | vertikale Aktionsachse (§3) |

Der Umbau ist rein `ui/`-seitig (09 §1: Präsentation liest nur) — die Spiellogik bleibt unberührt. Empfohlene Reihenfolge: (a) Bühne-Grundgerüst (Kulisse/Tisch/Bänder als Layer), (b) Gegner-Stage mit Absicht+HP+Status, (c) Hand mit echten Würfel-Sprites, (d) Effekt-Layer.

---

## 7. Entscheidungen (2026-07-09 mit dir geklärt)

- **Ein Gegner, mehrere Würfel — ENTSCHIEDEN.** 1-gegen-1 (`kampf.gegner`), klare Bühne, klare Absicht; die Vielfalt liegt in der Würfelhand, nicht im Gegnerfeld. Kein Mehr-Gegner-Feld.
- **Würfel-Doppelrolle — ENTSCHIEDEN.** Die Spiel-Seite (Wert + Effekt) dominiert und ist zuerst lesbar; das Gemüt-Gesicht ist ein kleiner Dauer-Tell (Augen/Haltung), nie im Weg der Zahl.
- **Reihe — ENTSCHIEDEN: geritzte Slots** auf der Tischplatte (diegetisch, bindet an den Tisch), keine abstrakte Pool-Leiste.
- **Format — ENTSCHIEDEN: Querformat, Slay-the-Spire-Arena** (2026-07-09). Nicht die zuerst skizzierte „Tisch-von-vorn"-Bühne, sondern das klassische StS-Arena-Schema:
  - **Oben:** volle Übersichts-Leiste (StS-Vorbild) — Hüter-Porträt + HP, Währungen 🪙🌰💧, Region/Akt mittig, Segen (Relikt-Analog) + Zieh/Ablage-Zähler + Menü rechts.
  - **Links:** der **Hüter** (Charakter-Sprite — *fehlt noch, neuer Asset-Bedarf*, s. u.) mit seinen **fünf Würfel-Kreaturen davor, versetzt** (leichte Rotation + Höhen-Versatz = organisch, nicht in Reih und Glied), auf dem Boden vor der Hain-Kulisse.
  - **Rechts:** das **Monster** (1 Gegner), groß, Absicht als Omen darüber, HP darunter, Status-Badges.
  - **Mitte (Boden):** die **Reihe-Slots**; gelegte Würfel lösen auf, Wirkung fliegt nach **rechts** zum Monster (StS-Angriffsrichtung).
  - **Unten links:** Atem-Orb (Energie-Analog, StS setzt Energie unten links) + Übermut-Leiste (Gier-Anzeige, Kipp-Punkt).
  - **Unten rechts:** Aktions-Tasten (Neu werfen / Auflösen / Trösten).
  - **Warum:** die Würfelhand ist das dichteste Element; Querformat gibt ihr die Breite (~40 % größere, ablesbarere Würfel). Der Preis (zweihändig, weniger „Standard") ist mit der bewussten StS-Ausrichtung akzeptiert. Hochformat bleibt als einhändige Alternative im Mockup, ist aber nicht mehr die Zielrichtung.
  - **Neuer Asset-Bedarf:** ein **Hüter-Kampf-Sprite** (Charakter links). Steht so nicht in Artefakt 11 (dort erscheint der Hüter nur in Wendung/Enden-Szenen). Im Mockup als beschriftete Silhouette platziert. → in die nächste Asset-Charge aufnehmen (Ruhe-Idle + evtl. Treffer-Zucken), Größe ~ Elite-Klasse (~64–80 logisch), Licht oben links, PNG-32 mit Alpha.

---

## 8. Würfel-Animation `[PROVISORISCH — Konzept]`

Die Würfel sind **Kreaturen und Spielsteine zugleich** — die Animation muss beides bedienen: den physischen Wurf (Spielstein) und die Persönlichkeit (Kreatur). Leitidee: **der Wurf ist die Signatur-Bewegung.** Weil es Würfel sind, wird gerollt, nicht gewischt (kein StS-Karten-Gleiten).

| Moment | Bewegung | Sprite-Bedarf |
|---|---|---|
| **Ziehen** (neue Hand) | die Würfel **purzeln/rollen** von links (vom Hüter her) an ihren Platz und kommen auf einer Seite zur Ruhe. | Roll-/Taumel-Sequenz (5–6 Frames), oder prozedural: Rotation + kleiner Sprung, Sprite bleibt statisch. |
| **Idle** | ruhiges Atmen/Wippen, **je Gemüt verschieden und zeitversetzt** (nicht synchron = organisch): `ruhig` sanft, `froh` kleiner Hüpfer, `ängstlich` Zittern (entsättigt, eingezogen). | Idle-Frames je Gemüt (04 §4.1: 3 Ausdruck-Zustände) — oder MVP: CSS-Transform (bob/hop/tremble, wie im Mockup). |
| **Antippen/Wählen** | der Würfel **hebt sich** kurz an und leuchtet (StS-Karten-Raise). | keiner (Transform + Glow). |
| **Neu werfen** | die gewählten Würfel **taumeln an Ort und Stelle** und landen auf einer neuen Seite; Übermut-Kosten blitzen auf; am Kipp-Punkt heftigeres Schütteln. | Roll-Sequenz (wie Ziehen). |
| **Platzieren** | der Würfel **hüpft/gleitet** aus der Hand in einen Reihe-Slot und **kippt seine gewählte Seite nach oben**; kleiner Staub-Puff auf dem Boden. | Kipp-Frames (Seite nach oben) — oder Transform-Rotation. |
| **Auflösen** | die Reihe pulst **links→rechts**, jeder Effekt fliegt als Glyph/Projektil nach **rechts zum Monster**; Monster zuckt beim Treffer. | VFX-Glyph je Effekt-Typ (`fx.treffer` u. a.), Monster-Treffer-Frame. |
| **Gemüt-Wechsel** | Schreck: der Würfel **zuckt**, entsättigt, eine Seite **verriegelt sichtbar** (Dornen-Riegel schnappt zu). Trösten: warmer Tau-Puls, der Würfel **richtet sich auf**. | `overlay.gesperrt`, `fx.troesten`, Wechsel Ausdruck-Zustand. |
| **Kristallisation** (Kampfende) | Frost kriecht über die Würfel mit Rest-Übermut → Schreck. | `fx.kristallisation` (6 Frames). |

**Empfehlung für die Umsetzung:** MVP rein über CSS-Transforms (Rotation/Sprung/Zittern auf den statischen Sprites — im Mockup schon zu sehen) — das trägt Ziehen, Idle, Wählen, Platzieren **ohne** zusätzliche Frames. Echte Roll- und Ausdruck-Frames (je Gemüt) sind die spätere Aufwertung, wenn Aaron sie liefert; die Keys stehen in Artefakt 11 §1 (`.idle`/`.wurf`-Sheets je Würfel). So bleibt die Reihenfolge: erst spielbar mit Transform-Animation, dann sukzessive echte Frames einsetzen — ohne UI-Umbau.

---

*Begleitend: `docs/12_Kampfszene_Mockup.html` (interaktives Mockup) setzt die echten, freigestellten Sprites in die StS-Arena — mit lebendigen Würfel-Idles (bob/hop/tremble je Gemüt) als Animations-Vorschau. Hochformat bleibt als Alternative darunter.*
