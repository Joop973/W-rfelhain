# Würfelhain — Sprite-Backlog (offene Assets)

*Stand 2026-07-09. Was fertig freigestellt in `assets/` liegt, ist unten unter „Erledigt" vermerkt. Alle Bildgenerierungs-Prompts stehen in `docs/11_Bild_Prompts.md`; Export-Regeln (Alpha, kein Nebel, mittig) in `docs/Sprite_Freistellung_Befund.md`. Prioritäts-Reihenfolge: was den spielbaren R1-Kampf blockiert zuerst.*

## Erledigt (12)
Würfel: `schaden` · `faeule` · `brand` · `rinde` · `schliff` · `stuetze` · `ermutigung` · `zuversicht`
Gegner: `astbeisser` · `borkenkriecher` · `moosgnom` · `dornalter`

---

## Priorität 1 — blockiert die Kampfszene (R1 spielbar)

**Neuexport (Motiv abgenommen, nur technisch nachliefern — mit Alpha):**
- `wuerfel.widerhall` — dunkler Würfel war farbgleich zum dunklen Hintergrund.
- `boss.saumhueter` — Nebel-Hintergrund verschmolz mit dem Körper (ohne Nebel exportieren).

**Neuer Bedarf (steht noch in keinem Artefakt):**
- `hueter.kampf` — **Hüter-Kampf-Sprite** (Charakter links in der Arena). ~Elite-Größe, Licht oben links, Ruhe-Idle; optional Treffer-Zucken. *Fehlt in Artefakt 11 — Prompt noch zu schreiben.*

**Boden-Ebene je Region (aus der Zwei-Ebenen-Entscheidung, Artefakt 12):**
- `boden.r1` … `boden.r6` (6) — die Standfläche, je Region austauschbar (nicht nur der Hintergrund).

**Hintergrund-Ebene (Kulisse) je Region:**
- `bg.kulisse.r1` … `bg.kulisse.r6` (6).

---

## Priorität 2 — Gegner & Bosse Region 2–6 (Inhalt)

**Region 2 — Moderbruch:** `faeulnisqualle` · `sporenbalg` · `schimmelwicht` · `modermutter` (Elite) · `pilzhort` (Elite) · **Boss** `modermutter_brut`
**Region 3 — Schwelgrund:** `glutkorn` · `aschekriecher` · `funkenschwarm` · `schwelbrand_ur` (Elite) · `glutwaechter` (Elite) · **Boss** `schwelbrand`
**Region 4 — Dürrmark:** `duerrgeist` · `zehrranke` · `aschgabler` · `auszehrer` (Elite) · `rissmark_alter` (Elite) · **Boss** `auszehrer_fuerst`
**Region 5 — Graupforte:** `furchtwisp` · `klemmzange` · `scharkant` · `stillewicht` · `graupfoertnerin` (Elite) · `rissfuerst` (Elite) · **Boss** `graupfoertnerin`
**Region 6 — Hohles Herz:** `hohlenwaechter` · `duerre_echo` · `schreckborke` · `rindenhohl` (Elite) · `letzter_schatten` (Elite) · **Endboss** `frueherer_hueter`

→ **26 Normal/Elite + 5 Bosse + Endboss = 32 Gegner-Sprites.** (Alle Prompts + Verhalten in Artefakt 11 §7/§8.)

---

## Priorität 3 — Gemüt-Varianten der Würfel (Persönlichkeit)

Je Würfel drei Ausdrucks-Zustände (04 §4.1): `ruhig` (= die gelieferte Basis-Pose) · `froh` · `aengstlich`.
- **Offen: `froh` + `aengstlich` für alle 9 Würfeltypen = 18 Sprites.**
- *MVP-Hinweis:* Idle-/Gemüt-Bewegung läuft vorerst über CSS-Transforms auf der Basis-Pose (bob/hop/tremble, im Mockup zu sehen) — echte Frames sind die spätere Aufwertung, kein Blocker.
- *Optional später:* Wurf-/Roll-Sheets je Würfel (Ziehen/Neu-Werfen-Animation).

---

## Priorität 4 — UI-Icons (klein, 16×16)

- ~~**Seiten-Icons (16)**~~ — **ERLEDIGT** (`assets/icons/seite.*`, 2026-07-09).
- ~~**Status-/Combo-Icons**~~ — **ERLEDIGT**: die 8 eigenen (`status.wetzung/scharte/freilauf/klemme`, `combo.gleichklang/echo/vollmond`, `fx.kristallisation_marke`, 2026-07-09). Die restlichen 7 (faeule/brand/morsch/welk/kraft/riss/glanz) nutzen die `seite.*`-Icons wieder — keine eigenen nötig.
- ~~**Währung/Meta (6)**~~ — **ERLEDIGT** (`assets/icons/waehrung.*`, `meta.*`, 2026-07-09).
- ~~**Karte/Knoten (10)**~~ — **ERLEDIGT** (`assets/icons/knoten.*`, 2026-07-09). `knoten.aktuell` als ein Ring (Basis) — die 2-Frame-Puls-Animation ist ein späterer Nachzug.

**→ Alle UI-Icons (Priorität 4) sind fertig.** *(Prompts in Artefakt 11 §2–§5.)*

---

## Priorität 5 — HUD, VFX, Szenen

- **HUD (~13):** Atem-Pip (voll/leer) · Gemüt-Leiste · Schreck-Marke · overlay.gesperrt · Pool-Feld · Übermut-Leiste · Knöpfe (Wurf/Reroll/Trösten) · Karten-Pergament · 9-Slice-Rahmen · overlay.gespiegelt. *(Im Mockup als CSS gebaut — echte Sprites optional, wo diegetisch gewünscht.)*
- **VFX (6 Sequenzen):** tischsturz · vollmond · kristallisation · troesten · treffer · heilung_tau. (Prompts Artefakt 11 §10.)
- **Szenen-Illustrationen (5):** `szene.wendung` · `szene.ende.fruehling` · `szene.ende.stiller_hain` · `szene.ende.hohles_erbe` · `szene.titel`. (Artefakt 11 §11.)

---

## Nicht mehr nötig (Richtungswechsel)
- `bg.tischplatte` / `bg.tischrand` — der „Tisch-von-vorn"-Aufbau wurde zugunsten der StS-Arena (Boden-Ebene + Kulisse) verworfen (Artefakt 12 §7). Die Boden-Ebenen (Priorität 1) ersetzen sie.

---

## Zusammenfassung der offenen Zahlen
| Kategorie | Offen |
|---|---|
| Würfel (Basis-Neuexport) | 1 (widerhall) |
| Würfel Gemüt-Varianten | 18 |
| Hüter-Kampf-Sprite | 1 (neu) |
| Gegner & Bosse | 32 (inkl. Saumhüter-Neuexport) |
| Boden-Ebenen | 6 |
| Kulissen | 6 |
| Seiten-/Status-/Währung-/Knoten-Icons | ~47 |
| HUD | ~13 |
| VFX | 6 Sequenzen |
| Szenen | 5 |

**Empfohlene Reihenfolge:** Priorität 1 (Hüter + widerhall + R1-Boss + R1-Boden/Kulisse) → damit ist der R1-Kampf voll bebildert → dann Region für Region (P2 + zugehörige Boden/Kulisse) → Icons/HUD/VFX/Szenen parallel nach Bedarf.
