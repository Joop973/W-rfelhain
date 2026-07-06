# Würfelhain — Design-Platzhalter (Artefakt 08)

*Kunst-Richtung, Audio-Richtung, Entsättigungs-System, vollständige Asset-Liste mit Platzhalter-Specs. Alles `[PROVISORISCH]` — Richtungsvorgabe und baubare Platzhalter, keine fertige Art. Aaron liefert Sprites, Palette-Endwerte, Audio-Stems selbst; dieses Artefakt legt nur Raster, Rollen, Größen und die technische Umsetzung fest. Mechanik-Anker aus Index 00 §3, 01 §6/§7, 09 §2.10.*

*Stand: 2026-07-04. Erstfassung + Entscheidungsrunde eingearbeitet: Tisch-Sonder-Slot ja (schwächerer Swap), Kopplung strikt Region−1, Slice startet mit Filter-MVP (C), Trösten-Audio-Rückkehr ja, logische Breite 224 px. Alle Hex-Werte, Instrumentierungen und Zählungen bleiben Platzhalter zur Eichung.*

---

## 0. Zweck & Geltung

- Dieses Artefakt ist die **Produktions-Vorgabe**, nicht das Endprodukt. Jede konkrete Grafik/Klangdatei ersetzt später einen hier definierten Platzhalter mit **identischer Größe und identischem Rollen-Slot**.
- **Regel: Claude/Claude Code produzieren nur beschriftete Platzhalter-Boxen und einfache Formen — nie fertige Kunst.** Jeder Asset-Eintrag hat feste Maße; der Platzhalter füllt genau diese Maße als beschriftete Box (§4.0).
- **Namenskollision `Welk`** (kritisch, durchgängig beachten):
  - **Welk (Status)** = Kampf-Debuff, −10 %/Stapel auf den Schaden-Pool (Index 00 §3, 03 §138). Nur im Kampf.
  - **Welk-Grad / `globalerWelkGrad`** = kampf-übergreifender Entsättigungs-State (09 §2.10), treibt den Palette-Swap. **Rein visuell, keine Spielmechanik.** In §3 heißt die visuelle Achse durchgängig **Welk-Stufe**, nie „Welk-Status".

---

## 1. Kunst-Richtung `[PROVISORISCH]`

### 1.1 Leitbild

- **Cozy Pixel-Art**, warm-erdig, Volksmärchen statt Fantasy-Hochglanz. Entspricht dem Ton aus 01 §6: Holz, Rinde, Tau, Moos; keine Standard-Fantasy-Floskeln, kein Grimdark.
- **Begrenzte, kuratierte Palette** (Rollen-basiert, §1.4) — nicht fotorealistisch, nicht farbüberladen. Wenige, gut gesetzte Farben tragen die Stimmung.
- **Lesbarkeit vor Detail:** mobiler Browser, Hochformat, kleiner Bildschirm. Silhouetten und Gemüt-Ausdruck müssen bei 100 % Zoom auf dem Handy erkennbar sein.
- **Der Eisberg gilt auch visuell:** Oberfläche einladend-warm (Region 1), Tiefe zunehmend farblos und hohl (Region 6). Die Entsättigung (§3) *ist* die visuelle Erzählung der Dürre.

### 1.2 Hain-Tisch-Konzept (Rahmen)

Das gesamte Spiel wird als **Tisch im Hain** inszeniert: eine hölzerne Tischplatte, auf der die Würfel-Kreaturen liegen, geworfen und gepflegt werden — im Vordergrund einer Hain-Kulisse.

- **Kampf = Tischplatte.** Die Hand liegt auf dem Tisch, Pools sind Bereiche/Felder der Platte (links→rechts), der Gegner steht/hockt jenseits des Tischrands.
- **Kulisse = der Hain dahinter** (Parallaxe, region-abhängig, §4.4). Die Kulisse trägt die Palette-Stimmung (§3), die Tischplatte bleibt konstanter Fokus.
- **Diegetischer Rahmen:** Menü, Karte, Belohnungen wirken wie Gegenstände auf/an diesem Tisch (Pergament, Holzschale mit Eicheln, Tau-Fläschchen), nicht wie abstrakte UI-Panels. UI ist „Zeug auf dem Tisch", nicht HUD-Overlay — soweit ohne Lesbarkeits-Verlust umsetzbar.
- Der Tisch ist der **konstante, ruhige Anker**, während der Hain ringsum verwelkt — verstärkt narrativ, dass der Verfall außen liegt und der Spieler ihn hereinträgt.

### 1.3 Pixel-Regime & Auflösung `[PROVISORISCH]`

- **Basiseinheit `b` = 16 px.** Alle Sprite-Maße sind Vielfache von `b` (Ausnahmen nur, wo begründet markiert).
- **Virtuelle Auflösung (logisch):** Hochformat, logische Breite **224 px** (= 14 b) `[ENTSCHIEDEN 2026-07-04: statt 192 — Hand aus 5 Würfeln à 32 px braucht Luft]`, Höhe geräteabhängig (Scroll/Fit, Ziel ~400 px = 25 b).
- **Integer-Scaling:** logische Fläche wird per Nearest-Neighbor auf ×2/×3/×4 hochskaliert (`image-rendering: pixelated`). Nie fraktionaler Zoom (verwischt Pixel).
- **Ein Pixel-Grid für alles:** Sprites werden im logischen Raum authored, nie im gescalten. Kein Mischen von Auflösungen.

### 1.4 Palette-Rollen `[PROVISORISCH: Hex sind Platzhalter]`

Statt fester Farben pro Sprite werden **Farb-Rollen (Slots)** authored. Jeder Sprite nutzt nur Rollen-Farben; der Welk-Stufen-Swap (§3) tauscht die Rollen-Werte global aus. Das macht Entsättigung trivial und hält die Palette kuratiert.

| Slot | Rolle | Stufe-0-Platzhalter |
|---|---|---|
| `--holz` | Tischplatte, Rahmen, warmes Braun | `#8a5a3b` |
| `--rinde` | dunkle Struktur, Konturen, Schatten | `#3d2a1e` |
| `--laub` | Grün-Akzent, Leben, Region-1-Stimmung | `#6a8f3c` |
| `--tau` | kühler Akzent, Highlight, Pflege/Heilung | `#7fb7c4` |
| `--glut` | warmer Akzent, Schaden/Brand/Gefahr | `#c8552e` |
| `--pergament` | UI-Grund, Text-Flächen, Karten | `#e8dcc0` |
| `--tinte` | Text, feinste Konturen | `#2a2018` |

- **Regel:** kein Sprite verwendet Hex-Literale — nur Rollen-Slots. Final-Sprites werden gegen die **Stufe-0-Palette als Index** gemalt (§3.4).
- Gemüt-Ausdruck der Würfel nutzt `--tau` (fröhlich/ruhig) vs. `--glut`/entsättigt (ängstlich) als Signal — konsistent mit der Achse (Pflege = kühl-ruhig, Gier/Furcht = warm-hektisch → verblassend).

### 1.5 Würfel-als-Kreatur (Ausdrucks-Vorgabe, keine Endart) `[PROVISORISCH]`

- Jeder Würfel ist eine kleine Kreatur mit **Gemüt** (01 §6): sparsame Reaktionen, keine schwatzhafte Vermenschlichung.
- **Drei Ausdrucks-Zustände** als Sprite-Varianten pro Würfel-Typ (§4.1): `ruhig` (Gemüt ≥ 0), `froh` (Fröhlich-Bonus aktiv), `aengstlich` (Schreck > 0, Seiten gesperrt sichtbar).
- Ausdruck über **Augen/Haltung**, nicht über Text. `aengstlich` = eingezogen, entsättigt, gesperrte Seiten sichtbar abgedunkelt.
- Platzhalter zeigen nur den **Zustands-Label** in der Box, keine gezeichnete Mimik.

---

## 2. Audio-Richtung `[PROVISORISCH]`

### 2.1 Leitbild

- **Folk / akustisch:** Fiedel, gezupfte Saiten (Laute/Zither-artig), Holz-Perkussion, kleine Idiophone (Holzblöcke, Glöckchen). Warm, handgemacht, kein Orchester, kein Synth-Pad.
- Stimmung wie 01 §6: warm-melancholisch, märchenhaft, unheimlicher Unterton — **nie zynisch oder edgy**.
- **Glöckner-Klasse** (06) hat Glocken-Flavor im Combo/Echo — Audio darf klassenspezifische Motive tragen `[PROVISORISCH]`.

### 2.2 Diegetisches Ausdünnen `[PROVISORISCH: das Kern-Audio-System]`

Direkte Kopplung an die Welk-Stufe (§3.2, `globalerWelkGrad`). Musik ist **stem-basiert**; mit steigender Welk-Stufe fallen Ebenen weg — der Klang *verarmt hörbar*, statt Verfall zu behaupten (01 §6, §109).

- **Stem-Ebenen (Beispiel-Schichtung):** `1` Grund-Puls (Perkussion/Bass) · `2` Harmonie (gezupft) · `3` Melodie (Fiedel) · `4` Zier (Glöckchen/Ornament).
- **Ausdünn-Kurve je Welk-Stufe** `[PROVISORISCH]`:

| Welk-Stufe | aktive Stems | Tempo | Hall/Raum | Charakter |
|---|---|---|---|---|
| 0 Saumhain | 1+2+3+4 | voll | warm, weich | lebendig, vollständig |
| 1 Moderbruch | 1+2+3 | −5 % | leicht dumpfer | Zier verstummt |
| 2 Schwelgrund | 1+2+3 (fiebrig) | +5 % | trockener | fiebrige Unruhe |
| 3 Dürrmark | 1+2 | −10 % | trocken | Melodie bricht ab |
| 4 Graupforte | 1 | −15 % | fast trocken | nur noch Puls |
| 5 Hohles Herz | (Puls sehr spärlich / Stille) | schleppend | tot | Leere, einzelne Anschläge |

- **Übergänge:** Stem-Wechsel an **Region-Grenzen**, weich (Fade over Stem, ~1–2 s), nicht per Zug. Deckungsgleich mit dem Palette-Swap-Timing (§3.4).
- **Trösten/Pflege-Feedback `[ENTSCHIEDEN 2026-07-04]`:** ein einzelner warmer Stem/Ornament-Anschlag kehrt bei Trösten kurz zurück — hörbare Belohnung der Pflege. Reines UI-Event, **kein** State-Reset, Welk-Stufe unberührt.

### 2.3 SFX-Leitlinien `[PROVISORISCH]`

- **Taktil-hölzern:** Würfel = Holz auf Holz (Wurf, Legen, Sammeln). Rinde/Block = dumpfer Holzschlag. Tau/Heilung = weicher, feuchter Tropfen. Münzen = kaltes Metall (bewusst kühler, 01 §8).
- **Push/Reroll:** trockenes Klacken, mit Übermut zunehmend hektischer/schärfer.
- **Tischsturz:** harter Umkipp-/Poltersturz (Würfel fallen vom Tisch) — deutlich unangenehm, Kern-Straf-Feedback.
- **Kristallisation** (Kampfende, Übermut→Schreck): leises, kaltes „Erstarren"/Knistern auf den betroffenen Würfeln — subtil, unheimlich.
- **Vollmond:** einzelner heller, voller Akkord/Glockenschlag — seltenes Hoch (03: Vollmond soll exzeptionell bleiben).

### 2.4 Audio-Technik `[PROVISORISCH]`

- Statische Web-App, kein Build (09 §1). **Web Audio API** für Stem-Mixing/Crossfades und SFX-Overlap; HTML5-`<audio>` nur als Fallback.
- **Formate:** `.ogg` primär, `.m4a`/`.mp3` Fallback (iOS-Safari). Stems als kurze, nahtlos loopende Clips; Layer synchron gestartet, per Gain-Node ein-/ausgeblendet.
- Assets in `/assets/audio/` (§4.10). Keine Laufzeit-Logik in `data.js` — Audio-Steuerung liegt in `ui/` bzw. einem `audio.js` (DOM-/Browser-seitig, nicht in engine/rng/push).
- Lautstärke-Master + Mute in Settings; respektiert `prefers-reduced-*` wo sinnvoll.

---

## 3. Entsättigungs-System — Palette-Swap je Welk-Stufe `[PROVISORISCH]`

### 3.1 Begriffsklärung

Siehe §0: **Welk-Stufe** hier = visuelle Entsättigungs-Achse, gespeist aus `globalerWelkGrad` (09 §2.10). Nichts davon berührt den Kampf-Status „Welk". Die Achse ist **monoton steigend** über den Run (01 §7) und **diskret** (keine Zwischen-Interpolation — die Pixel-Art bleibt kuratiert).

### 3.2 Welk-Stufen-Definition `[PROVISORISCH]`

- **6 diskrete Stufen `0–5`**, 1:1 an die 6 Regionen gekoppelt (01 §7). `globalerWelkGrad` wird beim Region-Eintritt auf die Stufe gesetzt.
- Innerhalb einer Region **kein** Swap — Stimmung bleibt stabil, damit der Verfall als Reise lesbar bleibt, nicht als Flackern.
- Kopplung `[ENTSCHIEDEN 2026-07-04]`: strikt `welkStufe = clamp(region − 1, 0, 5)`, Swap ausschließlich bei Region-Eintritt. **Keine** Zwischenstufen an Boss-Knoten.

| Stufe | Region | Ziel-Stimmung (01 §7) |
|---|---|---|
| 0 | Saumhain | frühlingsgrün, Morgenlicht — volle Sättigung |
| 1 | Moderbruch | feucht Grün-Braun, Nebel |
| 2 | Schwelgrund | Herbstrot, Rauch, Glut |
| 3 | Dürrmark | ausgebleichtes Ocker |
| 4 | Graupforte | fast monochrom, kalt |
| 5 | Hohles Herz | farblos, Rinde und Leere |

### 3.3 Palette-Ramps je Stufe `[PROVISORISCH: Hex sind Platzhalter]`

Jede Stufe definiert die **Rollen-Slots** aus §1.4 neu. Tendenz: sinkende Sättigung, kühler/grauer werdend, `--laub`/`--tau` verblassen zuerst, `--glut` hält in R2/R3 (Fieber) und erlischt dann, alles konvergiert gegen Grau.

| Slot | S0 | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|---|
| `--holz` | `#8a5a3b` | `#7e553a` | `#795038` | `#6f4d39` | `#5c4c40` | `#4a4642` |
| `--rinde` | `#3d2a1e` | `#3a2a20` | `#382b22` | `#332a24` | `#2e2b28` | `#28282a` |
| `--laub` | `#6a8f3c` | `#5f7f43` | `#5c6d3f` | `#5a5c44` | `#565450` | `#50504f` |
| `--tau` | `#7fb7c4` | `#79a8b2` | `#7a9aa0` | `#77898c` | `#6f767a` | `#666a6c` |
| `--glut` | `#c8552e` | `#c25630` | `#c85a2c` | `#a9583a` | `#8a5c50` | `#6a5f5b` |
| `--pergament` | `#e8dcc0` | `#e2d7bc` | `#ddd2ba` | `#d4ccbb` | `#c9c6bd` | `#bebdba` |
| `--tinte` | `#2a2018` | `#2a211b` | `#2b2320` | `#2b2724` | `#2a2928` | `#2a2a2b` |

- **Design-Zielbild, nicht Endwerte:** S0 warm/gesättigt → S5 nahezu neutralgrau. Aaron eicht die exakten Hex nach Spielgefühl; das System bleibt gleich.
- **Tisch-Sonder-Slot `[ENTSCHIEDEN 2026-07-04]`:** Der **Hain-Tisch** (Vordergrund) nutzt einen eigenen Slot `--holz-tisch`, der **schwächer entsättigt** als `--holz` (ruhiger Anker, §1.2). Richtwert: `--holz-tisch(SN) ≈ --holz(max(0, N−2))` — der Tisch hinkt zwei Stufen hinterher, erreicht S5-Grau nie ganz. Exakte Hex eicht Aaron.

### 3.4 Technische Umsetzung `[PROVISORISCH]`

Zwei Wege, gestaffelt nach Projektphase. Beide nutzen dieselben Rollen-Slots.

**A) CSS Custom Properties (mit echten Sprites / verfeinerter Platzhalter-Phase).**
- Rollen-Slots sind CSS-Variablen auf einem Wurzel-Container `#hain`. Welk-Stufe = eine Klasse `welk-0 … welk-5` an `#hain`, gesetzt aus `globalerWelkGrad`.

```css
#hain { --holz:#8a5a3b; --rinde:#3d2a1e; --laub:#6a8f3c;
        --tau:#7fb7c4; --glut:#c8552e; --pergament:#e8dcc0; --tinte:#2a2018; }
#hain.welk-3 { --holz:#6f4d39; --rinde:#332a24; --laub:#5a5c44;
        --tau:#77898c; --glut:#a9583a; --pergament:#d4ccbb; --tinte:#2b2724; }
/* … je Stufe … */
```

- **Vorteil:** Da alle Platzhalter-Boxen (§4.0) über Rollen-Slots gefärbt sind, ist der Rollen-gezielte Swap auf Platzhaltern testbar, sobald von C auf A gewechselt wird — ohne Refactoring, weil die Slots von Anfang an existieren.

**B) Pixel-Sprite-Phase (später) — indizierte Umfärbung.**
- Final-Sprites werden gegen die **S0-Palette als Index** gemalt (nur Rollen-Farben, §1.4). Beim Laden erzeugt ein einmaliger Canvas-Pass je Stufe eine umgefärbte Variante: Quell-Hex → Ziel-Hex-Mapping aus der Ramp-Tabelle (§3.3), Ergebnis als `ImageBitmap`/Cache.
- Präzise, behält die kuratierte Palette; Kosten: einmaliges Vorberechnen pro Stufe beim Start/Region-Wechsel.

**C) MVP-Weg — globaler CSS-`filter`. `[ENTSCHIEDEN 2026-07-04: C ist der Slice-Start]`**
- `#hain { filter: saturate(x) brightness(y) sepia(z); }` je Stufe. Billig, global, sofort wirksam. Nachteil bewusst akzeptiert: **verliert die authored Ramp** (muddert Farben, kein Rollen-gezieltes Verblassen) — für den Slice egal, da nur Platzhalter-Boxen sichtbar sind.
- **Reihenfolge:** Slice startet mit **C**; **A** (CSS-Variablen) und **B** (Sprite-Umfärbung) folgen erst mit echten Sprites. Die Rollen-Slots (§1.4) werden trotzdem von Anfang an authored, damit der Umstieg C→A/B kein Refactoring ist.

**Übergänge:**
- Swap **an Region-Grenzen**, weich über ~400–800 ms. CSS-`transition` auf Custom Properties ist uneinheitlich unterstützt → **Crossfade-Overlay**: kurz ein `<div>` mit der Ziel-Palette einblenden, dann Klasse hart wechseln. Timing deckungsgleich mit dem Audio-Ausdünnen (§2.2).

### 3.5 Kopplung an `globalerWelkGrad` (09 §2.10)

- Quelle: `globalerWelkGrad` / `quelle:"region"`. `ui/` liest den Wert, setzt Klasse `welk-N` an `#hain` und triggert (Phase B) die Sprite-Umfärbung.
- **Keine Rückkopplung in engine/push** — rein präsentationsseitig (09 §1: `ui/` liest nur). Trösten-Audio-Rückkehr (§2.2) ist ein UI-Event, kein State-Reset.
- Offen: ob R6-Boss-Phasen (05) eine eigene Sub-Stufe/„Puls" bekommen (z. B. kurzzeitige Farb-Rückkehr in der personalisierten Phase) → mit 05 abzustimmen.

---

## 4. Asset-Liste mit Platzhalter-Specs `[PROVISORISCH]`

### 4.0 Platzhalter-Konvention

- **Ein Platzhalter = beschriftete Box.** DOM-`<div class="ph ph--<kat>" data-key="…">` mit **exakt** den Ziel-Maßen, gestrichelter Rand, Füllung aus dem passenden Rollen-Slot, zentriertes Monospace-Label = `Key` + `BxH`.
- **Nie fertige Kunst, nie gezeichnete Formen über einfache Rechtecke/Kreise hinaus.** Aaron ersetzt die Box später durch das echte Sprite gleicher Größe/gleichen Slots.

```html
<div class="ph ph--wuerfel" data-key="wuerfel.schaden.ruhig"
     style="width:32px;height:32px">wuerfel.schaden.ruhig 32×32</div>
```
```css
.ph{border:1px dashed var(--tinte);background:var(--pergament);
    color:var(--tinte);font:8px/1 monospace;display:flex;
    align-items:center;justify-content:center;text-align:center;
    image-rendering:pixelated}
```

- **Namens-Schema:** `<kategorie>.<sub>.<variante>`, klein, Punkt-getrennt. Datei später `assets/<kategorie>/<key>.png`.
- **Maße immer in logischen px** (§1.3), Vielfache von `b=16`.

### 4.1 Würfel-Körper — `32×32` (2 b) `[PROVISORISCH]`

Pro Würfel-Typ 3 Gemüt-Varianten (§1.5): `ruhig` / `froh` / `aengstlich`.

| Key-Präfix | Typ (04) | Varianten | Boxen |
|---|---|---|---|
| `wuerfel.schaden` | Schaden (Eichwart-Basis) | ruhig/froh/aengstlich | 3 |
| `wuerfel.rinde` | Rinde/Block | ruhig/froh/aengstlich | 3 |
| `wuerfel.faeule` | Fäule | ×3 | 3 |
| `wuerfel.brand` | Brand | ×3 | 3 |
| `wuerfel.quell` | Quell/Tau (Blaupause) | ×3 | 3 |
| `wuerfel.echo` | Echo | ×3 | 3 |
| `wuerfel.beruhigung` | Beruhigung/Pflege | ×3 | 3 |

- **Erweiterbar:** je weitere Blaupause/Klassen-Sonderwürfel (04/06) +3 Boxen. Zähl-Platzhalter: **~7 Typen × 3 = 21** `[PROVISORISCH]`.
  - **Stand Code (Etappe B):** der Slice instanziiert bereits 9 Würfel-Typen (`schaden`, `rinde`, `faeule`, `brand`, `schliff`, `stuetze`, `widerhall`, `zuversicht`, `ermutigung`) → **9 × 3 = 27 Boxen** real. `quell`/`beruhigung` aus der Tabelle sind Alias-Rollen der Blaupausen-Würfel; die verbindliche Liste ergibt sich aus 04, sobald alle 16 Blaupausen verdrahtet sind (B4).
- Gesperrte Seiten (Schreck) werden **nicht** als eigener Würfel-Sprite gebaut, sondern als Overlay auf `aengstlich` (§4.5, `overlay.gesperrt`).

### 4.2 Seiten-Icons — `16×16` (1 b) `[PROVISORISCH]`

Effekt-Glyph, auf Würfelseite und im Pool identisch. Deckt alle Effekt-Typen aus 09 §2.1.

`icon.seite.schaden` · `…rinde` · `…faeule` · `…brand` · `…morsch` · `…welk` · `…kraft` · `…riss` · `…echo` · `…glanz` · `…flaeche` · `…beruhigung` · `…praegung` · `…labung` · `…leer` (Wert-0-Seite) · `…wucht` (Mult-Gravur, 04)

→ **16 Boxen.** Zahlwerte (1–6) werden als Text/Bitmap-Font über das Icon gelegt, kein eigener Sprite je Zahl.

### 4.3 Gegner & Bosse `[PROVISORISCH — Roster/Zahlen aus 05]`

Größen nach Rolle. Zustands-Varianten minimal (`normal` / optional `verletzt`).

| Key-Präfix | Größe | Menge (Platzhalter) |
|---|---|---|
| `gegner.r1.*` … `gegner.r6.*` | `48×48` (3 b) | ~4–6 je Region → **~30** |
| `gegner.elite.*` | `64×64` (4 b) | ~1–2 je Region → **~8** |
| `boss.1` … `boss.5` | `96×96` (6 b) | 5 |
| `boss.6.frueherer_hueter` | `128×128` (8 b) | 1 |
| `boss.6.phase_personalisiert` | Overlay/Recolor auf `boss.6` | 0 neue (nutzt Würfel-Sprites §4.1) |

- **Personalisierte Endphase (05, 01 §4.4):** kein eigenes Sprite-Set — sie **spiegelt das ängstlichste Arsenal** und rendert die vorhandenen `wuerfel.*.aengstlich`-Sprites gegen den Boss. Nur ein Rahmen/Overlay `overlay.gespiegelt` nötig.
- Exakte Anzahl/Namen strikt aus Artefakt 05 übernehmen, sobald als Projektdatei vorliegt.

### 4.4 Hintergründe / Hain-Tisch `[PROVISORISCH]`

Geschichtet (§1.2), volle logische Breite `224`. Palette via Rollen-Slots → entsättigt automatisch (§3).

| Key | Größe | Rolle |
|---|---|---|
| `bg.tischplatte` | `224×96` (14×6 b) | konstanter Vordergrund, alle Regionen |
| `bg.tischrand` | `224×16` | Kante zur Kulisse, Ziel-Ablage-Zone Gegner |
| `bg.kulisse.r1` … `bg.kulisse.r6` | `224×160` (14×10 b) | Parallaxe-Hintergrund je Region → **6** |
| `bg.vignette` | `224×400` | Rahmen/Abdunkelung, 1× (per Slot getönt) |

→ **~9 Boxen** (+ Kulisse skaliert mit Regionszahl). Kulisse trägt die Stimmung; Tischplatte bleibt Fokus.

### 4.5 UI / HUD `[PROVISORISCH]`

Diegetisch als „Zeug auf dem Tisch" (§1.2), wo ohne Lesbarkeits-Verlust möglich.

| Key | Größe | Zweck |
|---|---|---|
| `ui.atem.pip` | `16×16` | 1 Atem-Einheit (3 fix nebeneinander) |
| `ui.atem.pip_leer` | `16×16` | verbraucht |
| `ui.gemuet.leiste` | `48×16` | Gemüt-Anzeige je Hand-Würfel |
| `ui.schreck.marke` | `16×16` | Schreck-Indikator |
| `overlay.gesperrt` | `16×16` | gesperrte Seite (Schreck), über Icon/Würfel |
| `ui.pool.feld` | `48×48` | Pool-Ablagefeld (Schaden/Rinde/…) |
| `ui.uebermut.leiste` | `64×16` | Übermut 0–6, Kipp-Punkt markiert |
| `ui.knopf.wurf` | `48×24` | Werfen/Bestätigen |
| `ui.knopf.reroll` | `48×24` | Reroll (Übermut-Warnung ab frei verbraucht) |
| `ui.knopf.troesten` | `48×24` | Trösten/Beruhigen |
| `ui.karte.pergament` | `96×48` | Belohnungs-/Segen-Karte (Grundfläche) |
| `ui.rahmen.9slice` | `48×48` | 9-Slice-Panel-Rahmen (skalierbar) |

→ **~12 Boxen.** Bitmap-Font separat (§4.10-Hinweis: Font ist kein Sprite-Asset hier, aber einplanen).

### 4.6 Status- & Combo-Icons — `16×16` `[PROVISORISCH]`

Für Anzeige an Gegner/Würfel und in Tooltips.

`status.faeule` · `status.brand` · `status.morsch` · `status.welk` · `status.kraft` · `status.riss` · `status.glanz` · `status.wetzung` · `status.scharte` · `status.freilauf` · `status.klemme` · `combo.gleichklang` · `combo.echo` · `combo.vollmond` · `fx.kristallisation.marke`

→ **15 Boxen.** (Teils Doppelnutzung mit §4.2-Icons möglich — bei Umsetzung deduplizieren.)
- **Eigen-Status (B2):** `wetzung`/`scharte` (effektiver Wurf-Wert ±) und `freilauf`/`klemme` (Reroll-Ökonomie) sind seit Etappe B in der UI als Badges aktiv (09 §2.11) und brauchen eigene Icons — in der Erst-Zählung (§4.11: 11) noch nicht enthalten.

### 4.7 Währungs- & Meta-Icons — `16×16` `[PROVISORISCH]`

`waehrung.eicheln` · `waehrung.tau` · `waehrung.muenzen` · `meta.jahresring` · `meta.samen` · `meta.stammbaum_knoten`

→ **6 Boxen.** Münzen bewusst kühl/metallisch (01 §8), Eicheln/Tau warm.

### 4.8 Karten-/Knoten-Icons — `16×16` (Knoten), Karte skaliert `[PROVISORISCH]`

Knoten-Typen der Hain-Karte (07, 3-breite Reihen im StS-Merge-Stil).

`knoten.kampf` · `knoten.elite` · `knoten.boss` · `knoten.haendler` · `knoten.schmiede` · `knoten.event` · `knoten.hain_segen` · `knoten.rast` · `knoten.pfad` (Verbindungslinie/Segment) · `knoten.aktuell` (Marker)

→ **10 Boxen.** Karten-Fläche selbst = gescrollte `--pergament`-Fläche, kein eigenes Bild.

### 4.9 VFX `[PROVISORISCH]`

Sparsame Pixel-/Partikel-Effekte, als kleine Frame-Sequenzen oder Overlays.

| Key | Größe | Anlass |
|---|---|---|
| `fx.tischsturz` | `224×96` (Overlay Tischplatte) | Übermut > 6, Straf-Feedback |
| `fx.vollmond` | `64×64` | Vollmond-Burst (exzeptionell) |
| `fx.kristallisation` | `32×32` je Würfel | Kampfende, Übermut→Schreck |
| `fx.troesten` | `32×32` | Trösten/+Gemüt, warmer Puls |
| `fx.treffer` | `32×32` | generischer Schaden-Impact |
| `fx.heilung_tau` | `32×32` | Tau/Labung |

→ **~6 Sequenzen.** Frame-Zahl je Effekt offen (Platzhalter = statische Box mit Label).

### 4.10 Audio-Assets `[PROVISORISCH]`

Keine Bild-Platzhalter — Datei-Slots. `.ogg` + Fallback (§2.4). Platzhalter = kurze Stille/Ton-Stubs gleicher Länge.

- **Musik-Stems je Region:** `mus.rN.stemK` für Region 1–6 × Stems 1–4 → bis zu **~24** Slots (R4/R5/R6 nutzen weniger, §2.2). Nahtlos loopend, synchron.
- **SFX (§2.3):** `sfx.wurf` · `sfx.legen` · `sfx.sammeln` · `sfx.rinde` · `sfx.tau` · `sfx.muenze` · `sfx.reroll` · `sfx.tischsturz` · `sfx.kristallisation` · `sfx.vollmond` · `sfx.troesten` · `sfx.treffer` · `sfx.knopf` → **~13** Slots.
- **Bitmap-Font** (kein Audio, hier als Produktions-Merkposten): 1 Pixel-Font-Sheet, Ziffern + deutsche Umlaute (äöüß) Pflicht.

### 4.11 Zusammenfassung / Zählung `[PROVISORISCH]`

| Kategorie | Boxen/Slots (Richtwert) |
|---|---|
| Würfel-Körper (§4.1) | ~21 |
| Seiten-Icons (§4.2) | 16 |
| Gegner & Bosse (§4.3) | ~45 |
| Hintergründe/Tisch (§4.4) | ~9 |
| UI/HUD (§4.5) | ~12 |
| Status/Combo (§4.6) | ~15 (inkl. 4 Eigen-Status aus B2) |
| Währung/Meta (§4.7) | 6 |
| Karte/Knoten (§4.8) | 10 |
| VFX (§4.9) | ~6 |
| Audio (§4.10) | ~37 |
| **Summe (grob)** | **~173** |

Alle Zahlen sind Planungs-Richtwerte; verbindlich werden sie erst mit 04/05/06/07 als Projektdateien.

---

## 5. Offene Punkte (für Sim / Folge-Arbeit)

- **Palette-Endwerte (§3.3):** Hex sind Platzhalter — Aaron eicht S0–S5 (inkl. `--holz-tisch`-Nachlauf) nach Spielgefühl; das Rollen-/Swap-System bleibt fix.
- **Umstieg C→A/B (§3.4):** Zeitpunkt des Wechsels vom Filter-MVP auf Rollen-Swap; Performance-Test B auf Ziel-Handy, sobald echte Sprites existieren.
- **R6-Farb-Puls (§3.5):** Kopplung der personalisierten Endphase (05) an einen optionalen kurzen Sättigungs-Rückkehr-Effekt — mit 05 abzustimmen.
- **Gegner-/Boss-Zählung (§4.3):** exakte Keys aus Artefakt 05 übernehmen, sobald als Projektdatei vorhanden.
- **Stem-Detailschichtung (§2.2):** genaue Instrumentierung je Region und Trösten-Rückkehr-Regel — Audio-Prototyp nötig.
- **Bitmap-Font (§4.10):** Umlaut-Abdeckung (äöüß) verbindlich, sonst bricht deutsche UI/Lore.
- **Index-Nachzug:** Artefakt 00 §1-Karte für 08 auf „✓ 2026-07-04" setzen; §3 braucht keinen neuen gesperrten Wert (08 ist rein `[PROVISORISCH]`).
