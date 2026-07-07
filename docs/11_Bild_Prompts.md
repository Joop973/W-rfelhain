# Würfelhain — Bildgenerierungs-Prompts für alle Assets (Artefakt 11)

*Vollständiger Asset-Katalog mit produktionsfertigen Bildgenerierungs-Prompts. Jeder Eintrag: **Funktion** im Spiel · **Aussehen** (deutsch, verbindliche Beschreibung) · **Animation** (Frames, Bewegung, Timing) · **Prompt** (englisch, universell für Midjourney/DALL-E/SD/Flux formuliert). Basis: 08 (Kunst-Richtung, Maße, Palette-Rollen), 05/`data.js` (Gegner-Roster), 01 (Ton, Regionen, Enden), D4 (Szenen). Alles `[PROVISORISCH]` — Entscheide 2026-07-07: Pixel-Art im 08-Raster, universelle Prompts, Sprite-Sheet-Prompts mit Frame-Spec, volles Inventar.*

---

## 0. Globale Konventionen

### 0.1 Stil-Kern (steckt in jedem Prompt)

**Cozy Folk-Tale Pixel-Art** (08 §1.1): warm-erdig, Volksmärchen, kein Fantasy-Hochglanz, kein Grimdark. Lesbare Silhouetten für kleine Handy-Screens. Alle Sprites werden **gegen die Stufe-0-Palette** gemalt (08 §3.4 B — die Welk-Entsättigung entsteht später per Umfärbung, **nie** eigene Sprites je Welk-Stufe):

| Rolle | Hex | Verwendung |
|---|---|---|
| Holz | `#8a5a3b` | warmes Braun, Tisch, Körper |
| Rinde | `#3d2a1e` | Konturen, Schatten |
| Laub | `#6a8f3c` | Grün, Leben |
| Tau | `#7fb7c4` | kühles Highlight, Pflege, „fröhlich" |
| Glut | `#c8552e` | warme Gefahr, Brand, Schaden |
| Pergament | `#e8dcc0` | helle Flächen, UI |
| Tinte | `#2a2018` | Text, feinste Linien |

Der wiederkehrende englische Stil-Baustein in jedem Prompt lautet:

> *"cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean readable silhouette, dark bark-colored outlines, no anti-aliasing, transparent background"*

### 0.2 Sprite-Sheet-Konvention

- Jeder Animations-Prompt fordert **einen horizontalen Streifen**: *„sprite sheet, N frames in a horizontal strip, same character in every frame, equal spacing"*. Ein Bild pro Asset.
- **Maße** in logischen Pixeln (08 §1.3, `b`=16): Würfel 32×32 · Seiten-/Status-Icons 16×16 · Normal-Gegner 48×48 · Elite 64×64 · Boss 96×96 · Endboss 128×128. Generatoren liefern größer — das Sheet wird nachträglich auf Zielmaß herunterquantisiert (Aseprite/Nearest-Neighbor); der Prompt nennt das Zielraster trotzdem, damit der Detailgrad stimmt.
- **Timing-Standard** `[PROVISORISCH]`: Idle 8 fps (125 ms/Frame, Loop) · Aktionen 12 fps (83 ms, einmalig) · Icons statisch. Abweichungen stehen am Eintrag.
- **Zustands-Benennung** wie 08 §4.0: Datei später `assets/<kategorie>/<key>.png`, Sheet-Varianten als `<key>.<anim>.png` (z. B. `wuerfel.schaden.ruhig.idle.png`).

### 0.3 Wiederkehrende Animations-Muster

| Muster | Frames | Beschreibung |
|---|---|---|
| `idle-atmen` | 4 | ruhiges Heben/Senken um 1 px, Loop A-B-C-B |
| `idle-froh` | 6 | kleiner Hüpfer: ducken (1) — Absprung (2) — Scheitel (3–4) — Landung (5) — Ausfedern (6) |
| `idle-zittern` | 4 | ängstliches Beben ±1 px horizontal, unregelmäßig, eingezogene Silhouette |
| `angriff` | 6 | Ausholen (1–2) — Vorschnellen (3) — Treffer-Pose mit Streckung (4) — Rückzug (5–6) |
| `treffer-reaktion` | 2 | Aufblitzen (Pergament-Weiß) + 1 px Rückversatz |
| `block` | 4 | Einrollen/Verschanzen, hält letzte Pose |

---

## 1. Würfel-Kreaturen — 32×32 (08 §4.1)

Jeder Würfel ist eine **kleine Kreatur mit Gemüt** (01 §6): ein hölzerner Spielwürfel mit sparsamen Gesichtszügen (zwei Augen, angedeutete Haltung — keine Arme/Beine, Ausdruck über Augen, Neigung und 1-px-Versätze). Pro Typ **drei Gemüt-Varianten** als je eigenes Sheet: `ruhig` (idle-atmen, 4 F) · `froh` (idle-froh, 6 F) · `aengstlich` (idle-zittern, 4 F; entsättigter wirkend, Augen groß, 1–2 Seiten sichtbar abgedunkelt = gesperrt). Dazu je Typ ein **Wurf-Sheet** (6 F: Würfel rollt/taumelt und kommt zur Ruhe — für Handwurf-Moment). **9 Typen × 4 Sheets = 36 Sheets.**

Basis-Prompt-Gerüst (für alle 9, `<KREATUR>` einsetzen):

> *"sprite sheet, [4|6] frames in a horizontal strip, same character every frame, a small living wooden six-sided die creature, 32x32 pixel grid, <KREATUR>, two simple dark eyes on the front face, subtle pips on visible faces, [calm breathing idle, body rises one pixel / happy little hop cycle / frightened trembling, hunched, one face darkened and cracked], cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean readable silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 1.1 `wuerfel.schaden` — Schadens-Würfel (Astschneide, Wildzahn, Wetzklinge)
- **Funktion:** Standard-Angriffswürfel; Seiten füllen den Schaden-Pool.
- **Aussehen:** helles Astholz mit sichtbarer Maserung; auf der Oberkante ein kleiner **blattförmiger Klingen-Spross** (`--laub` mit `--glut`-Schneide) — die Kreatur „trägt" ihre Waffe wie einen Haarschopf. Augen wach, leicht kampflustig.
- **Animation:** ruhig 4 F (Atmen; Klingen-Spross wippt 1 px nach) · froh 6 F (Hüpfer, Spross schwingt) · ängstlich 4 F (Zittern, Spross hängt) · Wurf 6 F.
- **Prompt (`ruhig`):** > *"sprite sheet, 4 frames in a horizontal strip, same character every frame, a small living wooden six-sided die creature carved from pale branch wood with visible grain, a tiny leaf-shaped blade sprouting from its top edge like a tuft (leaf green with an ember-orange cutting edge), two alert dark eyes on the front face, subtle dice pips, calm breathing idle where the body rises one pixel and the leaf-blade sways, 32x32 pixel grid, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"* — Varianten `froh`/`aengstlich`/`wurf`: Idle-Klausel gegen 0.3-Muster tauschen.

#### 1.2 `wuerfel.rinde` — Rinden-Würfel (Borkenschild)
- **Funktion:** Block; Seiten füllen den Rinde-Pool und fangen Gegner-Schaden ab.
- **Aussehen:** gedrungener Würfel, **dick mit rauer Borke gepanzert** (`--rinde`-Platten über `--holz`-Kern), Kanten abgerundet; kleine geduldige Augen zwischen zwei Borkenplatten. Wirkt wie eine schlafende Schildkröte.
- **Animation:** ruhig 4 F · froh 6 F · ängstlich 4 F (Platten klappern 1 px) · Wurf 6 F; Zusatz-Sheet `block` 4 F (zieht Augen ein, Platten schließen sich — hält Pose).
- **Prompt (`block`):** > *"sprite sheet, 4 frames in a horizontal strip, same character every frame, a stocky living wooden die creature armored in thick rough bark plates over a warm wood core, small patient eyes peeking between plates, animation of it tucking in: eyes close, bark plates slide shut like a tortoise shell, holds the final braced pose, 32x32 pixel grid, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 1.3 `wuerfel.faeule` — Fäule-Würfel (Giftranke, Morschmacher, Dürrhauch)
- **Funktion:** Status-Angreifer; legt Fäule/Morsch/Welk auf Gegner (DoT-Build).
- **Aussehen:** dunkleres, feucht wirkendes Holz mit **Moosflecken und zwei kleinen Pilzen** auf der Oberseite (`--laub` ins Bräunliche gebrochen); Augen halb geschlossen, verschmitzt. Ein Hauch Sporen-Schimmer.
- **Animation:** Standard-3 + Wurf; beim `froh`-Hüpfer lösen sich 2–3 Sporen-Pixel.
- **Prompt (`ruhig`):** > *"sprite sheet, 4 frames in a horizontal strip, same character every frame, a small living wooden die creature of darker damp wood, patches of moss and two tiny mushrooms growing on its top face, drowsy mischievous half-closed eyes, faint drifting spore pixels, calm breathing idle, 32x32 pixel grid, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 1.4 `wuerfel.brand` — Brand-Würfel (Schwelbrand, Glanzkorn)
- **Funktion:** Status-Angreifer; legt Brand (front-lastiger DoT), Glanz-Marker.
- **Aussehen:** angekohltes Holz, in den Rissen **glimmt Glut** (`--glut`); über der Oberkante ein winziges ruhiges Flämmchen. Augen hell, eifrig. Kein loderndes Feuer — schwelend, gemütlich-gefährlich.
- **Animation:** Standard-3 + Wurf; Glut-Risse pulsieren im Idle (Frame 2/4 heller), Flämmchen flackert je Frame.
- **Prompt (`ruhig`):** > *"sprite sheet, 4 frames in a horizontal strip, same character every frame, a small living wooden die creature of charred wood with ember-orange glow pulsing in its cracks, one tiny calm flame on its top edge flickering per frame, bright eager eyes, calm breathing idle, 32x32 pixel grid, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 1.5 `wuerfel.schliff` — Schliff-Würfel (Schleiferin-Klasse, Splitterklinge/Markstein-Nähe)
- **Funktion:** Werkzeug-Würfel der Schleiferin; Wetzung/Präzision (Sockel-Boni).
- **Aussehen:** **kantig-präzise geschliffener** Würfel, Kanten wie frisch gefast (`--pergament`-Glanzkante), eine Seite trägt ein eingeschliffenes Schleifstein-Rund; Augen schmal, konzentriert.
- **Animation:** Standard-3 + Wurf; im Idle läuft alle 4 Frames ein 1-px-Glanzlicht über die Oberkante.
- **Prompt (`ruhig`):** > *"sprite sheet, 4 frames in a horizontal strip, same character every frame, a precisely cut living wooden die creature with freshly beveled edges catching a thin parchment-white highlight that travels along the top edge across frames, one face carved with a round whetstone mark, narrow focused eyes, calm breathing idle, 32x32 pixel grid, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 1.6 `wuerfel.stuetze` — Stütz-Würfel (Hort, Eichenwall, Weitwurf)
- **Funktion:** Hybrid-/Unterstützungs-Würfel; Rinde-Übertrag, Fläche, Kraft.
- **Aussehen:** breiter, **untersetzter Würfel wie ein kleiner Baumstumpf** mit Jahresringen auf der Oberseite; eine Seite trägt eine stützende Astgabel-Kerbe. Augen treu, ruhig.
- **Animation:** Standard-3 + Wurf; `froh` = schwerfälligerer Hüpfer (nur 1 px Höhe, dafür 2 F Ausfedern).
- **Prompt (`ruhig`):** > *"sprite sheet, 4 frames in a horizontal strip, same character every frame, a wide squat living wooden die creature shaped like a small tree stump, visible growth rings on its top face, one face carved with a supporting forked-branch notch, loyal calm eyes, slow breathing idle, 32x32 pixel grid, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 1.7 `wuerfel.widerhall` — Widerhall-Würfel (Klangwürfel, Hallklinge — Glöckner)
- **Funktion:** Echo/Gleichklang-Träger des Glöckners; verdoppelt Seiten, Combo-Flach-Bonus.
- **Aussehen:** schlanker Würfel aus dunklem Klangholz, in die Front ist ein **kleiner Glockenmund** geschnitzt (Hohlraum mit `--tau`-Schimmer), oben eine winzige Holz-Glocke als Kappe.
- **Animation:** Standard-3 + Wurf; Idle: Glocke pendelt 1 px, alle 4 F ein `--tau`-Klang-Ring (2 px Bogen) aus dem Glockenmund.
- **Prompt (`ruhig`):** > *"sprite sheet, 4 frames in a horizontal strip, same character every frame, a slim living wooden die creature of dark resonant wood, a small bell mouth carved into its front face glowing faintly dew-blue inside, a tiny wooden bell as a cap on top swaying one pixel, every fourth frame a small dew-blue sound ring arc leaves the bell mouth, calm idle, 32x32 pixel grid, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 1.8 `wuerfel.zuversicht` — Zuversicht-Würfel (Dorfschamane)
- **Funktion:** Pflege-Klassen-Würfel; stärkt Gemüt-Ökonomie, Prägung.
- **Aussehen:** rundlicher Würfel aus hellem Lindenholz, mit **eingeritzten Schutzzeichen** (einfache Kerb-Ornamente, `--tau`), ein kleines Wollband um eine Kante geknotet; Augen groß, freundlich, aufmunternd.
- **Animation:** Standard-3 + Wurf; `froh` bekommt 2 zusätzliche `--tau`-Funken-Pixel über dem Kopf.
- **Prompt (`ruhig`):** > *"sprite sheet, 4 frames in a horizontal strip, same character every frame, a rounded living wooden die creature of pale linden wood, simple carved folk protection marks glowing faint dew-blue, a little woolen string knotted around one edge, big friendly encouraging eyes, calm breathing idle, 32x32 pixel grid, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 1.9 `wuerfel.ermutigung` — Ermutigungs-Würfel (Sanftholz, Quell-Nähe)
- **Funktion:** Pflege-Seiten (Beruhigung/Ermutigung/Labung); tröstet andere Würfel, heilt.
- **Aussehen:** weiches, fast samtiges Holz (`--holz` hell), auf der Oberseite ein **junges Blatt-Paar und ein Tau-Tropfen**, der nie fällt; Augen sanft geschlossen-lächelnd.
- **Animation:** Standard-3 + Wurf; Idle: Tau-Tropfen schwillt 1 px und fängt Licht (Frame 3).
- **Prompt (`ruhig`):** > *"sprite sheet, 4 frames in a horizontal strip, same character every frame, a soft velvety pale wooden die creature, a pair of young leaves and one dew drop resting on its top face, the drop swelling one pixel and catching light in frame three, gently closed smiling eyes, calm breathing idle, 32x32 pixel grid, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

---

## 2. Seiten-Icons — 16×16, statisch (08 §4.2)

Effekt-Glyphen auf Würfelseiten und in Pools. **Alle statisch (1 Frame), ein gemeinsames Sheet-Layout möglich** (16 Icons in einem 4×4-Raster generieren, dann schneiden). Zahlwerte kommen aus der Bitmap-Font, nie ins Icon. Gemeinsamer Prompt-Schwanz für alle:

> *"…16x16 pixel art game icon, single flat glyph, 2 to 3 colors from a warm earthy palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), thick dark outline, readable at 100% on a phone, no anti-aliasing, transparent background"*

| Key | Funktion | Motiv (Prompt-Kopf) |
|---|---|---|
| `icon.seite.schaden` | Schadens-Seite | *"a small slanted leaf-blade slash mark, ember orange edge"* |
| `icon.seite.rinde` | Block-Seite | *"a rounded bark shield plate with wood grain"* |
| `icon.seite.faeule` | Fäule-DoT | *"a drooping drop with two tiny mold spots, sickly green-brown"* |
| `icon.seite.brand` | Brand-DoT | *"a single calm candle-like flame, ember orange with warm core"* |
| `icon.seite.morsch` | Morsch (+Schaden erleiden) | *"a wood beam cracking apart with woodworm holes"* |
| `icon.seite.welk` | Welk (−Schaden) | *"a wilting leaf bending down, faded green"* |
| `icon.seite.kraft` | Kraft (+Pool) | *"an upward sprouting twig with two strong side shoots"* |
| `icon.seite.riss` | Riss (Aussetzer) | *"a jagged lightning-shaped crack through a die face"* |
| `icon.seite.echo` | Echo (Verdopplung) | *"two overlapping offset squares, the back one dew blue and fainter"* |
| `icon.seite.glanz` | Glanz-Marker | *"a four-pointed star sparkle, parchment white with dew blue tips"* |
| `icon.seite.flaeche` | Flächen-Effekt | *"three small impact bursts arranged in a fan"* |
| `icon.seite.beruhigung` | Beruhigung (+2 Gemüt, Schreck) | *"an open cupped hand holding a dew drop"* |
| `icon.seite.praegung` | Prägung | *"a stamp seal leaving a leaf imprint"* |
| `icon.seite.labung` | Labung (Heilung) | *"a small wooden bowl with rising dew-blue steam curl"* |
| `icon.seite.leer` | Wert-0-Seite | *"an empty recessed die face, subtle inner shadow only"* |
| `icon.seite.wucht` | Mult-Gravur | *"a heavy downward mallet stroke with two motion lines"* |

---

## 3. Status- & Combo-Icons — 16×16, statisch (08 §4.6)

Badges an Gegnern/Würfeln und in Tooltips. Gleicher Prompt-Schwanz wie §2. `status.faeule/brand/morsch/welk/kraft/riss/glanz` dedupliziert mit §2 (gleiche Glyphe, andere Randfarbe: Status-Badges bekommen einen 1-px-`--tinte`-Kreisrahmen — im Prompt: *"…inside a thin ink-colored circular badge ring"*).

| Key | Funktion | Motiv (Prompt-Kopf) |
|---|---|---|
| `status.wetzung` | Eigen-Status: +1 effektiver Wert | *"a whetstone sharpening a rising edge, one spark"* |
| `status.scharte` | Eigen-Status: −1 effektiver Wert | *"a blade edge with a visible notch chipped out"* |
| `status.freilauf` | Reroll günstiger | *"a small unrolled loop of string running freely"* |
| `status.klemme` | Reroll teurer | *"a wooden clamp squeezing a die"* |
| `combo.gleichklang` | Gleichklang-Combo | *"two equal dice faces side by side with a linking arc above"* |
| `combo.echo` | Echo-Combo | *"a die face with two fading repeats trailing right, dew blue"* |
| `combo.vollmond` | Vollmond-Combo | *"a full round moon over a tiny die, parchment glow"* |
| `fx.kristallisation.marke` | Übermut→Schreck-Marke | *"a frost-like crystal shard cluster, cold pale blue-grey"* |

*(+ die 7 deduplizierten aus §2 = 15 Boxen laut 08 §4.6.)*

---

## 4. Währungs- & Meta-Icons — 16×16, statisch (08 §4.7)

Gleicher Prompt-Schwanz wie §2. Münzen bewusst **kühl-metallisch** (01 §8), Eicheln/Tau warm.

| Key | Funktion | Motiv (Prompt-Kopf) |
|---|---|---|
| `waehrung.eicheln` | Kampf-Beute | *"a single warm brown acorn with cap, tiny highlight"* |
| `waehrung.tau` | Pflege-Währung | *"a fat dew drop on a small leaf, dew blue"* |
| `waehrung.muenzen` | Schmiede-Währung | *"an old cold grey-silver coin with a worn tree stamp, deliberately desaturated"* |
| `meta.jahresring` | Meta-Einkommen | *"a cross-cut tree slice showing concentric growth rings"* |
| `meta.samen` | Heimat-Hain-Währung | *"a single seed with a tiny green sprout crack"* |
| `meta.stammbaum_knoten` | Stammbaum-Knoten | *"a branching family-tree node: one trunk splitting into three buds"* |

---

## 5. Karten-/Knoten-Icons — 16×16 (08 §4.8)

Knoten der Hain-Karte. Statisch bis auf `knoten.aktuell` (2 F Puls). Gleicher Prompt-Schwanz wie §2.

| Key | Funktion | Motiv (Prompt-Kopf) |
|---|---|---|
| `knoten.kampf` | Kampf-Knoten | *"two crossed twig-swords"* |
| `knoten.elite` | Elite-Kampf | *"two crossed twig-swords with a thorn crown above"* |
| `knoten.boss` | Boss-Knoten | *"a large antlered skull-free guardian head silhouette, imposing but not gory"* |
| `knoten.haendler` | Markt | *"a small market basket with an acorn inside"* |
| `knoten.schmiede` | Schmiede | *"an anvil with a single ember spark"* |
| `knoten.event` | Ereignis | *"a parchment scroll with a question-mark-shaped vine"* |
| `knoten.hain_segen` | Segen-Knoten | *"a small shrine stone with a leaf offering"* |
| `knoten.rast` | Lagerfeuer | *"a tiny campfire with two logs, one calm flame"* |
| `knoten.pfad` | Pfad-Segment | *"a short dotted footpath segment of flat trodden earth"* |
| `knoten.aktuell` | Positions-Marker | *"a dew-blue ring marker"* — **2 Frames:** Ring 14 px ↔ 16 px pulsierend, 2 fps. Prompt-Zusatz: *"sprite sheet, 2 frames side by side, the ring one pixel larger in frame two"* |

---

## 6. UI / HUD (08 §4.5)

Diegetisch: „Zeug auf dem Tisch" (Pergament, Holz, Schnitzerei) — keine sterilen Panels. Statisch bis auf markierte Ausnahmen.

#### 6.1 `ui.atem.pip` / `ui.atem.pip_leer` — 16×16
- **Funktion:** Atem-Anzeige (3 fix nebeneinander); voll = verfügbar, leer = verbraucht.
- **Aussehen:** kleine **geschnitzte Holz-Lunge/Blatt-Spirale**; voll: `--tau`-gefüllt mit hellem Kern; leer: nur vertiefte Kerbe im Holz.
- **Animation:** statisch (das Verbrauchen animiert die UI per Swap).
- **Prompt:** > *"two 16x16 pixel art game icons side by side: a small carved spiral breath mark in wood, first version filled glowing dew blue, second version an empty recessed carving, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, dew blue #7fb7c4, parchment #e8dcc0, ink #2a2018), thick dark outline, no anti-aliasing, transparent background"*

#### 6.2 `ui.gemuet.leiste` — 48×16
- **Funktion:** Gemüt-Anzeige unter jedem Hand-Würfel (−6 … +6).
- **Aussehen:** schmale **Holzleiste mit Kerb-Skala**, Mittelkerbe betont; Marker = kleiner Tau-Tropfen (positiv, `--tau`) bzw. Glut-Splitter (negativ, `--glut`).
- **Animation:** statisch (Marker-Position setzt die UI).
- **Prompt:** > *"a 48x16 pixel art UI element: a narrow carved wooden gauge strip with notch marks and an emphasized center notch, plus two separate 6x8 marker sprites beside it, one dew-blue droplet marker and one ember-orange splinter marker, cozy folk-tale pixel art, warm earthy palette (wood brown #8a5a3b, dark bark #3d2a1e, dew blue #7fb7c4, ember orange #c8552e, ink #2a2018), no anti-aliasing, transparent background"*

#### 6.3 `ui.schreck.marke` — 16×16
- **Funktion:** Schreck-Indikator am Würfel (Anzahl via Bitmap-Font daneben).
- **Aussehen:** kleines **zusammengekauertes Auge** mit angehobener Braue, kalt entsättigt.
- **Prompt:** > *"a 16x16 pixel art status icon: a single wide frightened eye with a raised brow, cold desaturated grey-blue tones inside a thin ink badge ring, pixel art, thick dark outline, no anti-aliasing, transparent background"*

#### 6.4 `overlay.gesperrt` — 16×16
- **Funktion:** Overlay über gesperrten Seiten (Schreck sperrt Top-Seiten).
- **Aussehen:** halbtransparente dunkle Schraffur + kleiner **Dornen-Riegel** quer.
- **Prompt:** > *"a 16x16 pixel art overlay tile: diagonal dark hatching at 50 percent density with a small thorny wooden latch bar across the middle, meant to darken a die face beneath, pixel art, ink and dark bark colors only (#2a2018, #3d2a1e), no anti-aliasing, transparent background"*

#### 6.5 `ui.pool.feld` — 48×48
- **Funktion:** Ablagefeld je Pool (Schaden/Rinde/…) auf der Tischplatte.
- **Aussehen:** **in die Tischplatte geritzte Mulde** mit rundem Kerb-Rahmen; Pool-Typ zeigt das §2-Icon zentriert als Wasserzeichen (dunkler, 30 %).
- **Prompt:** > *"a 48x48 pixel art UI slot: a shallow circular depression carved into a warm wooden tabletop, ring of knife-carved notches around the rim, faint darker watermark area in the center for an icon, top-down view, cozy folk-tale pixel art, wood brown #8a5a3b and dark bark #3d2a1e, no anti-aliasing, transparent background"*

#### 6.6 `ui.uebermut.leiste` — 64×16, 2 Zustände
- **Funktion:** Übermut 0–6 mit markiertem Kipp-Punkt (6 → Tischsturz-Gefahr).
- **Aussehen:** liegende **Holz-Waage/Wippe** mit 6 Kerben; Füllung als aufsteigende `--glut`-Splitter; die 6. Kerbe trägt ein gerissenes Warn-Zeichen. Zustand B („voll"): letzte Kerbe glüht.
- **Animation:** 2 Frames für Zustand „am Kipp-Punkt" (Glühen pulsiert, 4 fps).
- **Prompt:** > *"a 64x16 pixel art UI gauge, sprite sheet with 2 frames stacked: a lying wooden tilt-scale with six carved notches filling left to right with ember-orange splinters, the sixth notch marked with a cracked warning carving, in frame two the sixth notch glows brighter, cozy folk-tale pixel art, warm earthy palette (wood brown #8a5a3b, dark bark #3d2a1e, ember orange #c8552e, ink #2a2018), no anti-aliasing, transparent background"*

#### 6.7 `ui.knopf.wurf` / `ui.knopf.reroll` / `ui.knopf.troesten` — je 48×24, je 2 Frames
- **Funktion:** Haupt-Aktionen; Frame 2 = gedrückt (1 px versenkt, Schatten weg).
- **Aussehen:** **geschnitzte Holz-Plaketten** mit Symbol + Platz für Bitmap-Font-Label: Wurf = fallender Würfel; Reroll = geschwungener Pfeil (bei Übermut färbt die UI den Pfeil `--glut`); Trösten = offene Hand mit Tau-Tropfen (`--tau`).
- **Prompt (ein Sheet für alle drei):** > *"a pixel art UI button set, sprite sheet 3 buttons in a column, each 48x24 with two states side by side (raised and pressed one pixel lower without drop shadow): carved wooden plaques with rounded corners — first with a tumbling die symbol, second with a curved reroll arrow, third with an open hand holding a dew drop — free space right of each symbol for a text label, cozy folk-tale pixel art, warm earthy palette (wood brown #8a5a3b, dark bark #3d2a1e, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), no anti-aliasing, transparent background"*

#### 6.8 `ui.karte.pergament` — 96×48
- **Funktion:** Grundfläche für Belohnungs-/Segen-Karten (3-Wahl).
- **Aussehen:** **Pergament-Zettel** mit unregelmäßig gerissenen Rändern, eine Ecke umgeschlagen, auf Holz liegend gedacht; freie Mitte für Icon + Text.
- **Prompt:** > *"a 96x48 pixel art UI card base: an aged parchment note with irregularly torn edges and one folded corner, subtle fiber texture, large empty center area for icon and text, cozy folk-tale pixel art, parchment #e8dcc0 with ink #2a2018 edge shading, no anti-aliasing, transparent background"*

#### 6.9 `ui.rahmen.9slice` — 48×48
- **Funktion:** skalierbarer Panel-Rahmen (9-Slice) für Dialoge/Tooltips.
- **Aussehen:** **geschnitzter Holzrahmen** mit Blatt-Kerben in den Ecken, Pergament-Füllung; Ränder exakt 16 px (Slice-Grid 16/16/16).
- **Prompt:** > *"a 48x48 pixel art 9-slice panel frame: a carved wooden border 16 pixels thick with tiny leaf notches in each corner, parchment fill in the center, designed to be sliced into a 3x3 grid and stretched, cozy folk-tale pixel art, wood brown #8a5a3b, dark bark #3d2a1e, parchment #e8dcc0, no anti-aliasing"*

#### 6.10 `overlay.gespiegelt` — 32×32 (aus 08 §4.3)
- **Funktion:** Rahmen-Overlay, wenn der Endboss die Spieler-Würfel spiegelt (Phase 3).
- **Aussehen:** kalter, leicht **verzerrter Spiegel-Rahmen** um ein Würfel-Feld: dünne graue Doppellinie, oben ein Riss, Innenfläche minimal invertiert schimmernd.
- **Animation:** 2 Frames (Schimmer wandert), 4 fps.
- **Prompt:** > *"a 32x32 pixel art overlay frame, sprite sheet 2 frames side by side: a cold thin double-line mirror frame with a hairline crack at the top, faint grey-blue shimmer inside that shifts position between frames, meant to overlay a die sprite, desaturated grey-blue and ink tones, no anti-aliasing, transparent background"*

---

## 7. Gegner — Regionen 1–6 (08 §4.3, Roster aus `data.js`/05)

Normal `48×48`, Elite `64×64`. **Je Gegner 3 Sheets:** `idle` (4 F, Muster 0.3) · `angriff` (6 F) · `treffer` (2 F). Gegner mit `sieche`-Muster: `angriff` zeigt das **Status-Ausatmen** (Sporen/Glut/Grau-Wolke Richtung Betrachter-Unterkante) statt eines Hiebs. `rasende` (Mehrfach-Treffer): `angriff` = 8 F Wirbel-Kombination. `waechter`: Zusatz-Sheet `block` (4 F, Muster 0.3). Ton (01 §6): **verdorrte, verängstigte Kreaturen — traurig, nie Monster zum Auslachen.**

Prompt-Gerüst (an jeden Eintrag den Motiv-Text setzen):

> *"sprite sheet, [4|6|8|2] frames in a horizontal strip, same creature every frame, <MOTIV>, [idle: weight shifting, breathing one pixel | attack: wind-up, lunge, strike pose, recovery | exhaling a slow cloud toward the lower edge | hit reaction: white flash and one pixel knockback], 48x48 pixel grid [Elite: 64x64], cozy folk-tale pixel art, a withered frightened woodland creature, sad not monstrous, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

### Region 1 — Saumhain (frühlingsgrün, noch fast heil)

| Key | Name / Rolle / Verhalten | Motiv für den Prompt | Anim-Sheets |
|---|---|---|---|
| `gegner.r1.astbeisser` | Astbeißer — Schläger (11–12) | *"a small feisty branch creature, its head one snapping jaw of two interlocking twigs with leaf tufts, body a knot of green wood, hopping stance"* | idle 4 · angriff 6 (Schnapp-Ausfall) · treffer 2 |
| `gegner.r1.borkenkriecher` | Borkenkriecher — Wächter, blockt Zug 1 | *"a slow pill-bug-like crawler armored in overlapping bark plates, tiny shy eyes under the front plate, low wide silhouette"* | idle 4 · angriff 6 (Ramm-Schub) · block 4 · treffer 2 |
| `gegner.r1.moosgnom` | Moosgnom — Schläger, schwankender Angriff | *"a round moss-covered gnome with a pebble nose and an oversized knotted wooden club, unsteady tipsy stance"* | idle 4 (schwankt) · angriff 6 (weiter Rundumschlag) · treffer 2 |
| `gegner.elite.dornalter` | Dornalter — **Elite**, Angriff/Block-Rotation | *"a gaunt old briar elder, a hunched humanoid tangle of thorny vines leaning on a thorn staff, a few dry white blossoms, dignified and weary"* (64×64) | idle 4 · angriff 6 (Stab-Stoß) · block 4 (Dornenmantel schließt) · treffer 2 |

### Region 2 — Moderbruch (feucht, Fäule/Morsch)

| Key | Name / Rolle / Verhalten | Motiv | Anim-Sheets |
|---|---|---|---|
| `gegner.r2.faeulnisqualle` | Fäulnisqualle — Sieche (Fäule 2) | *"a translucent brown-green jelly dome drifting just above the ground, mossy tendrils hanging beneath, slow sad pulsing"* | idle 4 (Puls) · angriff 6 (Sporen-Ausatmen) · treffer 2 |
| `gegner.r2.sporenbalg` | Sporenbalg — Schläger+Sieche | *"a swollen leathery spore sack on two stubby root legs, seams straining, tiny puffs escaping at the top"* | idle 4 · angriff 6 (Balg presst Sporenstoß) · treffer 2 |
| `gegner.r2.schimmelwicht` | Schimmelwicht — Rasende, 2 Treffer | *"a scrawny quick imp coated in patchy grey-green mold fuzz, long thin arms, jittery crouched stance"* | idle 4 (zappelig) · angriff 8 (Doppel-Kratz-Wirbel) · treffer 2 |
| `gegner.elite.modermutter` | Modermutter — **Elite**, Fäule 3 mit Angriff | *"a large brooding fungus matron, a wide toadstool cap like a hood over a soft rounded body, many small caps growing on her shoulders, arms folded protectively"* (64×64) | idle 4 · angriff 6 (Sporenschlag) · treffer 2 |
| `gegner.elite.pilzhort` | Pilzhort — **Elite**, Wächter | *"a walking hoard of stacked mushrooms and rotten planks fused into a squat living wall, small eyes peeking from a gap"* (64×64) | idle 4 · angriff 6 · block 4 · treffer 2 |

### Region 3 — Schwelgrund (Herbstrot, Brand)

| Key | Name / Rolle / Verhalten | Motiv | Anim-Sheets |
|---|---|---|---|
| `gegner.r3.glutkorn` | Glutkorn — Sieche (Brand 3) | *"a big smoldering seed pod cracked open, ember light pulsing inside, thin smoke thread rising, resting on curled root feet"* | idle 4 (Glut-Puls) · angriff 6 (Funken-Ausatmen) · treffer 2 |
| `gegner.r3.aschekriecher` | Aschekriecher — Schläger (Brand mit Angriff) | *"a low salamander-like crawler of charred wood and ash flakes, ember cracks along its spine, leaves a faint ash trail"* | idle 4 · angriff 6 (glühender Biss) · treffer 2 |
| `gegner.r3.funkenschwarm` | Funkenschwarm — Rasende, 3 Treffer, Kraft-Selbstbuff | *"a loose swarm of a dozen ember sparks orbiting a scorched twig core, swarm shape shifting every frame"* | idle 4 (Orbit) · angriff 8 (drei Stich-Wellen) · treffer 2 |
| `gegner.elite.schwelbrand_ur` | Schwelbrand-Ur — **Elite**, Rasende 2, Brand 4 | *"an ancient smolder beast, a bear-sized hulk of charcoal logs held together by inner ember glow, embers breathing brighter as it moves"* (64×64) | idle 4 · angriff 8 (Doppel-Pranke) · treffer 2 |
| `gegner.elite.glutwaechter` | Glutwächter — **Elite**, Wächter, Brand 4 | *"a solemn upright guardian of blackened beams like a charred watchman statue, a single steady flame burning where its heart would be"* (64×64) | idle 4 · angriff 6 · block 4 (Balken verschränken) · treffer 2 |

### Region 4 — Dürrmark (ausgebleichtes Ocker, Welk/Scharte)

| Key | Name / Rolle / Verhalten | Motiv | Anim-Sheets |
|---|---|---|---|
| `gegner.r4.duerrgeist` | Dürrgeist — Sieche (Welk 2) | *"a faint hollow ghost of dry husks and dust, tattered sheet-like body of bleached ochre, empty drooping eye holes, hovering"* | idle 4 (Schweben) · angriff 6 (Staub-Ausatmen) · treffer 2 |
| `gegner.r4.zehrranke` | Zehrranke — Schläger+Sieche (Welk+Scharte) | *"a leeching vine serpent of dry cracked tendrils, small thorn hooks along its length, head a splitting seed husk"* | idle 4 (Winden) · angriff 6 (Peitschen-Hieb) · treffer 2 |
| `gegner.r4.aschgabler` | Aschgabler — Rasende, 2 Treffer | *"a lanky scarecrow-like figure with a two-pronged wooden pitchfork, jerky puppet movements, straw and dust falling"* | idle 4 (ruckelig) · angriff 8 (Gabel-Doppelstoß) · treffer 2 |
| `gegner.elite.auszehrer` | Auszehrer — **Elite**, Welk 3 + Morsch | *"a tall emaciated tree spirit, ribs of bare branches, bark stretched thin, long draining fingers, sorrowful bowed head"* (64×64) | idle 4 · angriff 6 (Zehr-Griff) · treffer 2 |
| `gegner.elite.rissmark_alter` | Rissmark-Alter — **Elite**, Wächter, Scharte 2 | *"an old cracked marrow golem of dry heartwood blocks, deep fissures crossing its body, moves with heavy patience"* (64×64) | idle 4 · angriff 6 · block 4 · treffer 2 |

### Region 5 — Graupforte (fast monochrom, Schreck/Riss/Klemme)

| Key | Name / Rolle / Verhalten | Motiv | Anim-Sheets |
|---|---|---|---|
| `gegner.r5.furchtwisp` | Furchtwisp — Sieche (Riss) | *"a small quivering wisp of grey mist with two wide frightened eyes, its own body flinching away from the player"* | idle 4 (Flackern) · angriff 6 (Angst-Welle) · treffer 2 |
| `gegner.r5.klemmzange` | Klemmzange — Schläger+Sieche (Klemme) | *"a beetle-like creature whose front is one oversized wooden vise clamp, grey chitin of dead bark, snapping slowly"* | idle 4 (Zange öffnet 1 px) · angriff 6 (Zangen-Schnapp) · treffer 2 |
| `gegner.r5.scharkant` | Scharkant — Schläger (Scharte) | *"an angular flint-and-deadwood creature, all sharp chipped edges, drags one bladed forearm that notches everything it touches"* | idle 4 · angriff 6 (Kanten-Hieb) · treffer 2 |
| `gegner.r5.stillewicht` | Stillewicht — Rasende, 2 Treffer (Welk+Riss) | *"a slight grey figure with a smooth featureless face and a finger raised to where a mouth should be, unnervingly calm"* | idle 4 (fast reglos, 1 px) · angriff 8 (zwei lautlose Schnitte) · treffer 2 |
| `gegner.elite.graupfoertnerin` | Graupförtnerin — **Elite**, Wetterwechsler (Klemme+Scharte) | *"a stern tall gatekeeper woman of grey weathered wood, robe like a closed gate of planks, holding a great key-shaped staff"* (64×64) | idle 4 · angriff 6 (Schlüssel-Stoß) · block 4 (Plankenrobe schließt) · treffer 2 |
| `gegner.elite.rissfuerst` | Rissfürst — **Elite**, Rasende 2 (Riss+Welk 3) | *"a proud shattered princeling of splintered grey wood, a crown of broken shards, cracks glowing faint cold blue, cloak of dust"* (64×64) | idle 4 · angriff 8 (Splitter-Doppelhieb) · treffer 2 |

### Region 6 — Hohles Herz (farblos, alles gebündelt)

| Key | Name / Rolle / Verhalten | Motiv | Anim-Sheets |
|---|---|---|---|
| `gegner.r6.hohlenwaechter` | Hohlenwächter — Wetterwechsler (Scharte+Brand) | *"a hollow suit of bark armor with nothing inside, held together by habit, a dim ember still glowing deep in its empty chest"* | idle 4 · angriff 6 · block 4 · treffer 2 |
| `gegner.r6.duerre_echo` | Dürre-Echo — Sieche (Welk 3 + Klemme 2) | *"a translucent after-image of a tree that no longer exists, colorless outline slowly repeating the same swaying motion"* | idle 4 (Nachbild versetzt) · angriff 6 (graues Ausatmen) · treffer 2 |
| `gegner.r6.schreckborke` | Schreckborke — Rasende, 2 Treffer (Riss+Fäule 4) | *"a mask of screaming bark on spindly root legs, the face a natural knot pattern resembling terror, moves in sudden skitters"* | idle 4 (Stakkato) · angriff 8 (Kratz-Wirbel) · treffer 2 |
| `gegner.elite.rindenhohl` | Rindenhohl — **Elite**, Wächter (Morsch+Scharte) | *"a colossal hollowed trunk section walking on two root stumps, its cavity a dark doorway, moss beard, immense and slow"* (64×64) | idle 4 · angriff 6 (Stampf) · block 4 · treffer 2 |
| `gegner.elite.letzter_schatten` | Letzter Schatten — **Elite**, Wetterwechsler (Klemme+Scharte+Welk 4) | *"the last shadow of a keeper, a flat dark silhouette peeled off the ground, edges frayed like burnt paper, no face, holding a shadow of a staff"* (64×64) | idle 4 (Ränder wehen) · angriff 6 · block 4 · treffer 2 |

---

## 8. Bosse — 96×96, Endboss 128×128 (08 §4.3, 05 §6–§8)

**Je Boss 4 Sheets:** `idle` (6 F) · `angriff` (8 F) · `phase` (8 F, Übergangs-Verwandlung bei der HP-Schwelle) · `treffer` (2 F). Twist-spezifische Zusatz-Sheets am Eintrag. Bosse sind **groß, würdevoll, bedauernswert** — die Kamera bleibt auf Augenhöhe des Tischs (Untersicht angedeutet).

#### 8.1 `boss.1.saumhueter` — Der Saumhüter (R1)
- **Funktion:** Boss 1. Schläger; Twist „Erste Geduld" (jede 3. Runde zwingend Block); Phase 2 (<50 %): Doppel-Treffer.
- **Aussehen:** **hirschartiger Wächter des Waldrands**: aufrecht, schlank, Geweih aus jungen Ästen mit letzten grünen Blättern, Fell aus Moosflechten, Augen müde-freundlich. Er bewacht, er hasst nicht.
- **Animation:** idle 6 (Atmen, Geweih-Blatt zittert) · angriff 8 (Geweih-Stoß) · **`geduld` 4 F** (senkt Kopf, Geweih wird Schutzschirm — Twist-Signal) · phase 8 (scharrt, Haltung kampflustiger, ein Blatt fällt) · treffer 2.
- **Prompt (idle):** > *"sprite sheet, 6 frames in a horizontal strip, same character every frame, a tall stag-like forest warden standing upright, antlers of young branches still carrying a few green leaves, body of moss and lichen over bark, tired kind eyes, calm guarding idle with slow breath and one trembling leaf, 96x96 pixel grid, cozy folk-tale pixel art, dignified not monstrous, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 8.2 `boss.2.modermutter_brut` — Die Modermutter-Brut (R2)
- **Funktion:** Boss 2. Sieche-Muster; Twist „Ausbreitung" (Fäule decayt nicht, solange >30 % HP); Phase 2 (<60 %): eskalierende Fäule.
- **Aussehen:** **wandernde Pilz-Kolonie**: ein Berg aus Dutzenden Pilzkappen über einem weichen Mutterkörper, kleine Brut-Pilze lösen sich und krabbeln zurück; ein großes, sanftes Augenpaar tief im Geflecht.
- **Animation:** idle 6 (Kappen heben sich versetzt, 2 Brutlinge krabbeln) · angriff 8 (Sporen-Woge) · phase 8 (Kolonie blüht dunkler auf, Brutlinge schwärmen) · treffer 2.
- **Prompt (idle):** > *"sprite sheet, 6 frames in a horizontal strip, same creature every frame, a slow walking fungus colony boss: a mound of dozens of overlapping toadstool caps over a soft mother body, two or three tiny mushroom offspring crawling over it and back inside, one pair of large gentle eyes deep in the weave, caps rising in offset waves as it breathes, 96x96 pixel grid, cozy folk-tale pixel art, melancholic not gross, damp green-brown over warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 8.3 `boss.3.schwelbrand` — Der Schwelbrand (R3)
- **Funktion:** Boss 3. Twist „Auflodern" (+1 Grundschaden je 2 Runden); Brand auf ihm zündet doppelt (Gegengewicht). 3 Phasen (Kraft/Brand-Spitzen).
- **Aussehen:** **fiebriger Herzbrand des Hains**: ein zusammengesunkener Riesen-Wurzelstock, in dessen Innerem ein Feuer seit Jahren schwelt; Glut-Adern kriechen über die Rinde, Rauch statt Atem. Kein loderndes Monster — ein **Schwelen, das nicht sterben darf**.
- **Animation:** idle 6 (Glut-Adern pulsieren, Rauchfaden) · angriff 8 (Glut-Woge rollt nach vorn) · **`auflodern` 4 F** (Adern flammen kurz heller — Twist-Signal alle 2 Runden) · phase 8 (Stock richtet sich auf, mehr Adern zünden) · treffer 2.
- **Prompt (idle):** > *"sprite sheet, 6 frames in a horizontal strip, same creature every frame, a huge collapsed root stock boss with a fire smoldering inside it for years, ember veins crawling across its bark and pulsing bright and dim, a thin smoke thread instead of breath, heavy sunken posture, 96x96 pixel grid, cozy folk-tale pixel art, feverish and weary not raging, warm earthy limited palette with ember accents (wood brown #8a5a3b, dark bark #3d2a1e, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 8.4 `boss.4.auszehrer_fuerst` — Der Auszehrer-Fürst (R4)
- **Funktion:** Boss 4. Twist „Auszehrung" (passiv Welk 1 je Rundenbeginn, Cap 4); Phase 2 (<50 %): Sieche + Morsch-Spitze.
- **Aussehen:** **verhungerter Adel des Hains**: hochgewachsene Gestalt aus ausgebleichtem Ocker-Holz, Mantel aus raschelndem toten Laub, eine dünne Krone aus dürren Zweigen; er saugt sichtbar Farbe aus dem Boden — unter seinen Füßen ist alles grau.
- **Animation:** idle 6 (Mantel-Laub rieselt, Boden-Grau pulsiert) · angriff 8 (ausgestreckte Zehr-Hand, Farbsog-Linien) · phase 8 (sinkt in sich, Krone kippt, Morsch-Flecken blühen) · treffer 2.
- **Prompt (idle):** > *"sprite sheet, 6 frames in a horizontal strip, same character every frame, a tall starving noble tree spirit of bleached ochre wood, a mantle of rustling dead leaves shedding one leaf per frame, a thin crown of dry twigs, the ground under his feet drained to grey while faint color streams toward him, sorrowful regal posture, 96x96 pixel grid, cozy folk-tale pixel art, tragic not evil, desaturated ochre over warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 8.5 `boss.5.graupfoertnerin` — Die Graupförtnerin (R5)
- **Funktion:** Boss 5. Twist „Enge Pforte" (Übermut > 0 ins Rundenende → +1 Schreck auf einen Würfel — rein spieler-erzeugt); Wetterwechsler mit Klemme/Scharte.
- **Aussehen:** **das Tor selbst ist die Wächterin**: eine monumentale Frau aus grauem, verwittertem Holz, deren Leib ein zweiflügeliges Tor ist (Robe = Torflügel mit Beschlägen); sie hält einen Schlüssel-Stab. Durch den Torspalt: Dunkelheit und ein schmaler Lichtstreif. Streng, nicht grausam.
- **Animation:** idle 6 (Torflügel-Robe knarrt 1 px, Lichtstreif flackert) · angriff 8 (Schlüssel-Stab-Stoß) · **`pforte` 4 F** (Torflügel ziehen sich enger — Twist-Signal bei getragenem Übermut) · phase 8 (Tor öffnet einen Spalt weiter, kaltes Licht) · treffer 2.
- **Prompt (idle):** > *"sprite sheet, 6 frames in a horizontal strip, same character every frame, a monumental stern gatekeeper woman whose body is a weathered grey wooden double gate, her robe formed by the two gate wings with iron fittings, holding a long key-shaped staff, a narrow strip of pale light in the gap between the wings flickering softly, patient severe presence, 96x96 pixel grid, cozy folk-tale pixel art, austere not cruel, desaturated grey wood over warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, dew blue #7fb7c4, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

#### 8.6 `boss.6.frueherer_hueter` — Der frühere Hüter (R6, Endboss, 128×128)
- **Funktion:** Endboss, 3 Phasen. P1/P2: Twist „Hohles Echo" (Rest-Übermut heilt ihn). P3 „Dein Spiegel": Module aus den ängstlichsten Spieler-Würfeln (rendert die `wuerfel.*.aengstlich`-Sprites mit `overlay.gespiegelt` — **kein eigenes Sprite-Set**, 08 §4.3). Befriedbar: Pflege-Seiten senken sein Schreck-Konto → Ende ohne Kill.
- **Aussehen:** **ein Hüter wie der Spieler, nur ausgehöhlt**: gleicher Mantel-Schnitt, aber die Kapuze umschließt Dunkelheit mit zwei müden Lichtpunkten; aus Rücken und Schultern wächst die Rinde der toten Eiche, als wüchse er seit Jahren fest; am Gürtel hängen **stumme, graue Würfel** (seine eigenen, längst verängstigt). Haltung: einladend-vernünftig, nie drohend.
- **Animation:** idle 6 (Mantel weht staublos, Lichtpunkte blinzeln asynchron) · angriff 8 (greift mit Rinden-Arm) · **`echo` 4 F** (saugt einen warmen Schimmer ein, Twist „Hohles Echo") · **`phase` 8 × 2** (P1→P2: Rinde bricht weiter auf; P2→P3: er kniet, hebt die Hand — die Spiegel-Module erscheinen) · **`befriedet` 8 F** (die Rinde löst sich, er sackt erleichtert, Lichtpunkte schließen sich — Frühling-Auflösung) · treffer 2.
- **Prompt (idle):** > *"sprite sheet, 6 frames in a horizontal strip, same character every frame, a former forest keeper as the final boss: same cloak silhouette as a young keeper hero but hollow, the hood enclosing darkness with two tired points of light blinking out of sync, dead oak bark grown over his back and shoulders as if rooted in place for years, a belt of small silent grey dice, posture reasonable and inviting rather than threatening, dust-still cloak, 128x128 pixel grid, cozy folk-tale pixel art, tragic mirror of the player, desaturated with faint warm remnants, limited palette (wood brown #8a5a3b, dark bark #3d2a1e, dew blue #7fb7c4, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*
- **Prompt (`befriedet`):** > *"sprite sheet, 8 frames in a horizontal strip, same character every frame, the hollow former keeper being comforted: the dead bark grown over his shoulders loosens and falls away piece by piece, his posture sinks with relief not defeat, the two points of light in his hood soften and close like falling asleep, one young leaf appears where the bark broke off, 128x128 pixel grid, cozy folk-tale pixel art, quiet emotional release, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, parchment #e8dcc0, ink #2a2018), clean silhouette, dark outlines, no anti-aliasing, transparent background"*

---

## 9. Hintergründe / Hain-Tisch — Breite 224 (08 §4.4)

Der Tisch ist der **konstante Anker** (eigener Slot `--holz-tisch`, entsättigt schwächer); die Kulisse trägt die Regions-Stimmung und wird per Welk-System entfärbt — **alle Kulissen in S0-Vollfarbe malen!** Kulissen: statisch + je ein 4-F-Ambient-Loop-Overlay (fallendes Blatt/Nebel/Funken — separat, 32×32, additiv platziert).

#### 9.1 `bg.tischplatte` — 224×96
- **Funktion:** Kampf-Bühne; Hand, Pools, Buttons liegen darauf.
- **Aussehen:** warme Holztischplatte in leichter Aufsicht, ehrliche Gebrauchsspuren (Würfel-Dellen, ein Brandfleck, geschnitzte Kerb-Reihe am Rand), Maserung parallel zur Breite.
- **Prompt:** > *"a 224x96 pixel art game background: a warm wooden tabletop seen from a slight top-down angle, honest wear marks (dice dents, one small burn spot, a row of carved notches along the front edge), wood grain running horizontally, soft warm light from the upper left, cozy folk-tale pixel art, wood brown #8a5a3b with dark bark #3d2a1e shading, no anti-aliasing"*

#### 9.2 `bg.tischrand` — 224×16
- **Funktion:** Kante Tisch→Kulisse; Standlinie des Gegners.
- **Prompt:** > *"a 224x16 pixel art strip: the far rounded edge of a wooden table dropping off into soft focus, a darker bark-colored rim line, cozy pixel art, wood brown #8a5a3b, dark bark #3d2a1e, no anti-aliasing"*

#### 9.3–9.8 `bg.kulisse.r1` … `bg.kulisse.r6` — je 224×160
- **Funktion:** Parallaxe-Kulisse hinter dem Tisch, eine je Region; trägt die visuelle Erzählung der Dürre (01 §7).
- **Gemeinsamer Prompt-Rahmen:** > *"a 224x160 pixel art game backdrop seen from a table in the woods, layered depth for parallax (near trees, mid grove, far haze), no characters, cozy folk-tale pixel art, painted only with a warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), no anti-aliasing"* + je Region:

| Key | Region / Stimmung | Regions-Zusatz für den Prompt |
|---|---|---|
| `bg.kulisse.r1` | Saumhain — frühlingsgrün, Morgenlicht | *"spring-green forest edge in soft morning light, dew sparkles, young birches, everything still whole and welcoming"* |
| `bg.kulisse.r2` | Moderbruch — feucht, Nebel | *"damp green-brown broken grove, low fog banks between mossy fallen trunks, shelf mushrooms on stumps, air heavy with moisture"* |
| `bg.kulisse.r3` | Schwelgrund — Herbstrot, Glut | *"autumn-red smoldering ground, thin smoke columns, ember glow in root hollows, dry crackling foliage, feverish warmth"* |
| `bg.kulisse.r4` | Dürrmark — ausgebleichtes Ocker | *"bleached ochre dried-out land, cracked earth, bare trees like ribs, heat shimmer, a single dry leaf drifting"* |
| `bg.kulisse.r5` | Graupforte — fast monochrom, kalt | *"an almost monochrome cold grey pass between towering silent trunks, thin mist, no movement, oppressive stillness"* |
| `bg.kulisse.r6` | Hohles Herz — farblos, Leere | *"a colorless hollow heart of the forest: the giant dead grandmother oak, split and empty inside, bare ground, faint grey light from its cavity"* |

- **Ambient-Overlays** (je 32×32, 4 F, Loop): `fx.ambient.r1` fallendes Blatt · `r2` Nebelschwade · `r3` aufsteigende Funken · `r4` Staubwirbel · `r5` Nebelfetzen · `r6` einzelner grauer Ascheflock. Prompt-Muster: > *"sprite sheet, 4 frames in a horizontal strip, a single drifting [green leaf | fog wisp | ember spark pair | dust swirl | grey mist shred | ash flake] falling one step further each frame, 32x32, pixel art, limited palette, transparent background"*

#### 9.9 `bg.vignette` — 224×400
- **Funktion:** Rahmen-Abdunkelung über allem (per Slot getönt).
- **Prompt:** > *"a 224x400 pixel art vignette overlay: transparent center, soft dithered darkening toward all four edges using coarse pixel dither patterns instead of smooth gradients, dark bark color #3d2a1e, transparent background"*

---

## 10. VFX — Frame-Sequenzen (08 §4.9)

Sparsame Pixel-Effekte; alle einmalig (kein Loop), 12 fps sofern nicht anders vermerkt.

| Key | Größe / Frames | Funktion + Ablauf | Prompt |
|---|---|---|---|
| `fx.tischsturz` | 224×96, **10 F** | Straf-Feedback Übermut > 6: Tisch ruckt, alle Würfel kippen und springen vom Tisch, Staub | > *"sprite sheet, 10 frames in a horizontal strip, a pixel art tabletop scene effect: the table jolts, several small wooden dice tip over and bounce off the front edge with tumbling rotation, a puff of dust, frames flow as one continuous motion, 224x96 per frame, cozy folk-tale pixel art, warm earthy palette, no anti-aliasing, transparent background"* |
| `fx.vollmond` | 64×64, **8 F** | Vollmond-Burst (exzeptionell): runder Mond blendet auf, ein heller Ring läuft aus, Glitzer | > *"sprite sheet, 8 frames in a horizontal strip, a pixel art full moon burst: a round parchment-white moon fades in, one bright ring expands outward and dissolves into four sparkles, 64x64 per frame, limited palette with dew blue #7fb7c4 and parchment #e8dcc0, no anti-aliasing, transparent background"* |
| `fx.kristallisation` | 32×32, **6 F** | Kampfende: Rest-Übermut erstarrt als Schreck auf einem Würfel — kalte Kristallnadeln wachsen und setzen sich fest | > *"sprite sheet, 6 frames in a horizontal strip, a pixel art crystallization effect: cold pale grey-blue frost needles grow from the corners toward the center of an invisible 32x32 die and lock in place with a final glint, unsettling and quiet, no anti-aliasing, transparent background"* |
| `fx.troesten` | 32×32, **6 F**, 8 fps | Trösten/+Gemüt: warmer Puls — Tau-Ring + zwei weiche Funken steigen | > *"sprite sheet, 6 frames in a horizontal strip, a pixel art comfort effect: a soft dew-blue ring pulses outward once while two gentle warm sparks rise and fade, tender and calm, 32x32 per frame, dew blue #7fb7c4 and parchment #e8dcc0, no anti-aliasing, transparent background"* |
| `fx.treffer` | 32×32, **4 F** | generischer Schaden-Impact: kurzer Kerb-Blitz + 3 Splitter | > *"sprite sheet, 4 frames in a horizontal strip, a pixel art hit impact: a quick slash flash with three small wood splinters flying and fading, 32x32 per frame, ember orange #c8552e and parchment #e8dcc0, no anti-aliasing, transparent background"* |
| `fx.heilung_tau` | 32×32, **6 F**, 8 fps | Tau/Labung: ein Tropfen fällt, zerspringt weich, kurzer grüner Schimmer | > *"sprite sheet, 6 frames in a horizontal strip, a pixel art healing effect: one dew drop falls, lands and splashes softly into a brief leaf-green shimmer, 32x32 per frame, dew blue #7fb7c4 and leaf green #6a8f3c, no anti-aliasing, transparent background"* |

---

## 11. Szenen-Illustrationen (D4 — Wendung & Enden, neu gegenüber 08)

Vollbild-Vignetten `224×160` über der Kulisse, **statisch mit 2-F-Mikro-Loop** (ein Detail atmet: Lichtpunkt, Blatt, Staub — 2 fps). Ton 01 §6: ruhig, würdevoll, nie Fail-Screen.

#### 11.1 `szene.wendung` — Die Wendung (Schwelle zu Region 6)
- **Funktion:** Hintergrund der einmaligen Wendungs-Szene (`ui/main.js` Modus `wendung`).
- **Aussehen:** die riesige **tote Großmutter-Eiche**, aufgebrochen; aus dem hohlen Stamm tritt der frühere Hüter, noch halb Silhouette; am Boden verstreut die Reste der „Stimme" (abgefallene Rindenstücke wie Maskenscherben).
- **Prompt:** > *"a 224x160 pixel art story vignette: a colossal dead hollow grandmother oak cracked open, a cloaked keeper figure stepping out of the hollow half in silhouette, pieces of bark lying around like fragments of a broken mask, cold grey light from the cavity meeting the last warm light from the left, no text, cozy folk-tale pixel art, quiet dread and sorrow, limited palette (wood brown #8a5a3b, dark bark #3d2a1e, dew blue #7fb7c4, parchment #e8dcc0, ink #2a2018), no anti-aliasing"* — Mikro-Loop: Lichtpunkt in der Kapuze blinzelt (2 F).

#### 11.2 `szene.ende.fruehling` — Der neue Frühling
- **Funktion:** Enden-Screen (Pflege-Ende).
- **Aussehen:** der hohle Stamm, aus dem ein **einzelner unverschämt grüner Trieb** bricht; davor kniet der junge Hüter, die Würfel drängen sich an seine Hände; der alte Hüter liegt friedlich in den Wurzeln.
- **Prompt:** > *"a 224x160 pixel art story vignette: a young cloaked keeper kneeling before the dead hollow oak, one thin defiantly green sprout breaking through the bark, small wooden dice creatures huddling against the keeper's hands, an old keeper resting peacefully among the roots, first morning color returning at the edges, no text, cozy folk-tale pixel art, gentle hope, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, parchment #e8dcc0, ink #2a2018), no anti-aliasing"* — Mikro-Loop: der Trieb richtet sich 1 px auf.

#### 11.3 `szene.ende.stiller_hain` — Der stille Hain
- **Funktion:** Enden-Screen (Default-Ende).
- **Aussehen:** die zur Ruhe gebettete Eiche unter aufgeschichteten Steinen und Zweigen; der Hüter drückt einen **Samen in die Erde**; der Hain grau vernarbt, aber der Himmel eine Spur heller.
- **Prompt:** > *"a 224x160 pixel art story vignette: the great dead oak laid to rest under stacked stones and branches, a young cloaked keeper pressing a single seed into the earth at its base, the grove scarred and grey but the sky one shade brighter at the horizon, wind in the grass, no text, cozy folk-tale pixel art, bittersweet quiet, muted earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, parchment #e8dcc0, ink #2a2018), no anti-aliasing"* — Mikro-Loop: ein Grashalm wiegt sich.

#### 11.4 `szene.ende.hohles_erbe` — Das hohle Erbe
- **Funktion:** Enden-Screen (Dürre-Ende) — still, würdevoll, nicht als Game-Over.
- **Aussehen:** der junge Hüter **sitzt bereits im hohlen Stamm**, die Rinde schließt sich ohne Eile um ihn; seine Würfel stehen in einer Reihe davor, mit Abstand; sein Gesicht ist ruhig, fast erleichtert. Zwei warme Lichtpunkte beginnen in der Dunkelheit der Höhlung.
- **Prompt:** > *"a 224x160 pixel art story vignette: a young cloaked keeper already seated inside the hollow of the great oak, bark slowly closing around him without haste, his face calm almost relieved, his small wooden dice standing in a line before the tree keeping their distance, two warm points of light beginning to glow in the hollow's darkness, no text, cozy folk-tale pixel art, tragic serenity, desaturating palette from warm wood tones to grey (wood brown #8a5a3b, dark bark #3d2a1e, parchment #e8dcc0, ink #2a2018), no anti-aliasing"* — Mikro-Loop: die Lichtpunkte blinzeln asynchron.

#### 11.5 `szene.titel` — Titelbild (Merkposten, kein 08-Slot)
- **Funktion:** Start-/Menü-Screen hinter dem Logo.
- **Aussehen:** der Hain-Tisch von vorn: Tischplatte mit wartenden Würfel-Kreaturen (neugierig zum Betrachter geneigt), dahinter der grüne Saumhain in Morgenlicht — und ganz hinten, kaum sichtbar, die graue Silhouette der toten Eiche (Eisberg: die Tiefe ist von Anfang an da).
- **Prompt:** > *"a 224x400 vertical pixel art title screen: a warm wooden table in the foreground with five small living dice creatures leaning curiously toward the viewer, behind it a spring-green forest edge in morning light, and far in the background barely visible through haze the grey silhouette of a giant dead oak, space at the top for a logo, cozy folk-tale pixel art, warm earthy limited palette (wood brown #8a5a3b, dark bark #3d2a1e, leaf green #6a8f3c, dew blue #7fb7c4, ember orange #c8552e, parchment #e8dcc0, ink #2a2018), no anti-aliasing"*

---

## 12. Zählung & Produktions-Reihenfolge

| Kategorie | Assets | Sheets/Frames (Richtwert) |
|---|---|---|
| §1 Würfel-Kreaturen | 9 Typen | 36 Sheets (à 4–6 F) |
| §2 Seiten-Icons | 16 | statisch |
| §3 Status/Combo | 15 (8 neu + 7 Dedup) | statisch |
| §4 Währung/Meta | 6 | statisch |
| §5 Karte/Knoten | 10 | 9 statisch + 1×2 F |
| §6 UI/HUD | 13 | überwiegend statisch, 3×2 F |
| §7 Gegner R1–R6 | 26 | ~85 Sheets (idle/angriff/treffer/block) |
| §8 Bosse | 6 | ~30 Sheets (inkl. Twist-/Phasen-/Befriedet-Sheets) |
| §9 Hintergründe | 9 + 6 Ambient | 6×4-F-Ambient |
| §10 VFX | 6 | 40 Frames gesamt |
| §11 Szenen | 5 | statisch + 2-F-Mikro-Loop |
| **Summe** | **~121 Assets** | **~200 Sheets/Boxen** |

**Empfohlene Reihenfolge** (nach Sichtbarkeit im Spiel): 1. Würfel-Kreaturen ruhig/aengstlich → 2. Tischplatte + Kulisse R1 → 3. R1-Gegner + Saumhüter → 4. Seiten-/Status-Icons → 5. UI-Kern (Atem/Übermut/Buttons) → 6. restliche Regionen/Bosse → 7. VFX → 8. Szenen/Endboss.

## 13. Offene Punkte

- **Konsistenz zwischen Generierungen:** Bildgeneratoren halten Charaktere zwischen Sheets nur begrenzt konsistent. Praxis-Empfehlung: je Kreatur zuerst das `idle`-Sheet erzeugen, bestes Ergebnis als Referenzbild für die weiteren Sheets mitgeben (img2img / character reference), erst dann `angriff`/`treffer`.
- **Nachquantisierung:** Alle Ergebnisse auf das logische Zielmaß herunterrechnen (Nearest-Neighbor) und auf die 7 Rollen-Farben quantisieren — erst dann greift der Welk-Palette-Swap (08 §3.4 B) verlustfrei.
- **Frame-Zahlen sind `[PROVISORISCH]`** — bei der Integration gegen das Spielgefühl eichen (besonders `fx.tischsturz` 10 F und Boss-Phasen-Übergänge 8 F).
- Die Platzhalter-Keys aus 08 §4 bleiben verbindlich; dieses Artefakt ergänzt nur `szene.*`, `fx.ambient.*` und die Anim-Sheet-Suffixe.
