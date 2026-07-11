# Geräte-Matrix — Befund (E2, automatisierter Teil)

*Stand 2026-07-09. Werkzeug: `node tools/geraete_smoke.mjs` (wiederholbar; Chromium mit Mobil-Emulation: Viewport, DPR, Touch, User-Agent). **Grenze:** echtes iOS-Safari (WebKit) ist in dieser Umgebung nicht installiert — die iPhone-Zeile ist Emulation. Was nur real prüfbar ist, steht in der Checkliste unten (Plan 10 E2: „du testest real").*

## Automatisierte Messung — alles grün

| Prüfpunkt | Android-Emulation (393×851 @2.75x) | iPhone-Emulation (390×844 @3x) |
|---|---|---|
| Laden bis Karte interaktiv | ✓ ~550 ms | ✓ ~350 ms |
| Kein horizontaler Overflow | ✓ 0 px | ✓ 0 px |
| Kampf per Touch (Knoten → Würfel → Auflösen) | ✓ Tap-Render ~60 ms | ✓ ~50 ms |
| Touch-Ziele ≥ 32 px | ✓ kleinstes 38 px | ✓ 38 px |
| LocalStorage-Save + Kampf-Resume (v7-Seed) | ✓ selber Gegner nach Reload | ✓ |
| Keine Seitenfehler (pageerror) | ✓ | ✓ |

## Dafür eingebaute Fixes (E2)

- **Audio-Format-Fallback** (`ui/audio.js`): iOS Safari spielt kein OGG/Vorbis — einmalige `canPlayType`-Probe wählt `.ogg` oder `.m4a` (08 §2.4). **Folge für Aaron:** alle Stems/SFX in *beiden* Formaten liefern (`mus.rN.stemK.ogg` + `.m4a`, `sfx.*.ogg` + `.m4a`).
- **Touch-Grundlagen** (`index.html`): `touch-action: manipulation` (kein Doppeltipp-Zoom/300-ms-Delay), kein grauer Tap-Blitz, keine Textauswahl auf Bedienelementen.

## Manuelle Checkliste — deine realen Geräte-Tests

**iPhone / iOS Safari** (nichts davon ist emulierbar):
1. **Audio:** Erster Tipp entsperrt den Ton (Autoplay-Policy)? Sobald Aaron Dateien liefert: spielt `.m4a`? Stem-Wechsel am Regionstor hörbar weich?
2. **LocalStorage im Privatmodus:** Safari privat wirft bei `setItem` — Spiel muss trotzdem laufen (Save schlägt still fehl; unser try/catch fängt das — bitte real bestätigen).
3. **Tab-Rauswurf:** Spiel in den Hintergrund, 10+ Minuten warten, zurückholen → Kampf-Resume greift (derselbe Kampf beginnt von vorn)?
4. **Safari-UI-Leisten:** verdeckt die untere Leiste Buttons? (100vh-Problem — falls ja, melden, dann stelle ich auf `100dvh` um.)
5. **Text-Zoom:** iOS-Einstellung „Größerer Text" — bleibt das Layout benutzbar?
6. **Performance:** Karte + Kampf flüssig auf deinem ältesten Ziel-iPhone?

**Android / Chrome:**
1. Zurück-Geste/-Taste: verlässt sie die Seite mitten im Run? (Erwartet: ja — akzeptables Verhalten? Sonst History-Guard einbauen.)
2. Tab-Discard wie oben (Punkt 3).
3. Audio nach erstem Tipp (sobald Dateien da sind).
4. Performance auf einem Mittelklasse-Gerät.

**Beide:** „Zum Startbildschirm hinzufügen" — startet und läuft die App standalone? (Kein Manifest vorhanden; falls gewünscht, ist ein Web-App-Manifest ein kleiner E6-Nachtrag.)

## Offen

- Echtes WebKit automatisiert testen wäre nur mit installiertem Playwright-WebKit möglich — lohnt erst, wenn ein konkreter iOS-Bug auftaucht.
- Ergebnisse deiner realen Tests bitte hier nachtragen; gefundene Bugs werden E-Punkte.
