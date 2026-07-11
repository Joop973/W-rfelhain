# Sprite-Freistellung — Befund (D6, erste Asset-Charge)

*Stand: 2026-07-09. Aaron lieferte 16 Rohbilder mit korrekten Platzhalter-Namen. Verarbeitet mit `tools/sprite_freistellen.py` (reines Python, kein PIL): PNG-Decode → randbasierter Referenzfarben-Flood-Fill → Entfernen eingeschlossener Hintergrund-Taschen → größte zusammenhängende Komponente → enges Quadrat-Crop → flächengemittelte Verkleinerung → PNG-32 (RGBA). Jedes Ergebnis einzeln über Magenta/Weiß/Dunkel sichtgeprüft; Browser-Decode + Alpha in Chromium bestätigt.*

## Ergebnis: 12 von 16 einsatzbereit

**Freigestellt, sauber, in `assets/` (256×256, RGBA, transparent):**

| Würfel (8) | Gegner (4) |
|---|---|
| schaden, faeule, brand, rinde | astbeisser, borkenkriecher |
| schliff, stuetze, ermutigung, zuversicht | moosgnom, dornalter |

Alle Motive treffen Artefakt 11. Kanten halten über Magenta ohne Halo; eingeschlossene Schachbrett-Taschen (Moosgnom Keule/Bauch, Dornalter Bein) entfernt; helle Würfel verlieren nichts.

## 4 nicht einsetzbar — brauchen Neuexport

| Asset | Ursache | Fix |
|---|---|---|
| **wuerfel.widerhall** | Dunkelbrauner Würfelkörper liegt farblich im dunklen Hintergrund — der Körper wird beim Freistellen mitentfernt, übrig bleibt nur die Glocken-Kappe. | Neuexport mit **echtem Alpha** ODER hellem/kontrastreichem Hintergrund. |
| **boss.saumhueter** | Nebel-/Dunst-Overlay im Hintergrund verschmilzt mit dem Körper; das dünne Geweih geht verloren, der Körper wird löchrig. | Neuexport **ohne Nebel**, mit Alpha. |
| **bg.tischrand** | Falsches Motiv: ganze Tischecke (2,36:1) statt schmaler 224×16-Kantenstreifen (14:1). | Als Streifen neu, oder Key umdefinieren. |
| **bg.tischplatte** | Technisch ok (opak, kein Alpha nötig), aber noch nicht integriert — wartet auf das Kampfszenen-Layout (Artefakt 12). | Nach Layout-Konzept einsetzen. |

## Grundsätzliche Hinweise für die weiteren Chargen

- **Am besten direkt mit Alpha exportieren** (PNG-32, transparenter Hintergrund). Dann entfällt das Freistellen ganz und die Kanten bleiben verlustfrei. Schachbrett/Weiß/Dunkel als Hintergrund sind alle nachbearbeitbar — **außer** wenn das Motiv farbgleich zum Hintergrund ist (dunkler Würfel auf dunkel) oder ein Dunst-/Verlaufs-Overlay im Hintergrund liegt.
- **Kein Nebel/Glow/Vignette im Hintergrund** — das verschmilzt mit der Figur.
- Motiv mittig, mit etwas Rand, **eine** Figur pro Bild (freischwebende Funken/Deko gehen beim „größte Komponente"-Schritt verloren — das ist gewollt).
- Die Aufbereitung ist reproduzierbar: `python3 tools/sprite_freistellen.py <bild.png> 256 72 <ausgabeordner> <name>`.

**Nächster Schritt:** Kampfszenen-Layout (Artefakt 12) — legt fest, wo Kreaturen, Würfel, Tisch, Effekte und Zustände hingehören, bevor weitere Assets in Serie gehen.

## Nachtrag 2026-07-11 — HUD-Charge (20 Sprites, 6 Blätter)

Neue Fälle gegenüber den Kreaturen-/Icon-Chargen:

- **Automatische Segmentierung:** Blätter werden jetzt als Ganzes geflutet und
  in Zusammenhangs-Komponenten zerlegt (Treiber über `tools/sprite_freistellen.py`);
  Beschriftungstext fällt durch den Flächen-Filter (< 1500 px) heraus. Kein
  manuelles Boxen-Setzen mehr.
- **Echtes Alpha erkannt und genutzt:** das Atem/Gemüt-Blatt kam als RGBA mit
  echter Transparenz (weiche Glow-Kanten) — hier wird das Alpha direkt als
  Gewicht übernommen statt geflutet. **Für Aaron: genau so liefern, das ist
  der Idealfall.**
- **Rechteckige Ausgabe:** UI-Elemente (Leisten 4:1, Knöpfe 2:1, Pergament)
  werden nicht mehr quadratisch gepolstert — längste Seite = Zielgröße,
  Seitenverhältnis bleibt.
- **JPEG-Quelle (Pool-Feld):** einmalig via Pillow nach PNG gewandelt,
  Flood-Toleranz 52 gegen die Kompressions-Artefakte — Ergebnis kantensauber.
  **Bitte trotzdem PNG liefern**, JPEG bleibt ein Risiko.
- **Gemalte Boden-Schattenlinien** (Übermut-Leisten): frei schwebende
  Schatten-Streifen unter dem Motiv werden spaltenweise entfernt (unterster
  dünner Lauf nach Lücke); direkt angewachsene Unterkanten-Schattierung
  bleibt als Teil des Motivs. **Bitte ohne Boden-Schatten exportieren.**
