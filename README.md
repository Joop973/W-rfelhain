# Würfelhain

Ein deutschsprachiger Roguelike-Würfel-Builder für den mobilen Browser: Ein junger Hüter zieht durch sechs sterbende Hain-Regionen, um eine Dürre zu heilen — und jeder Würfel ist eine kleine Kreatur mit Gemüt. Wer sie **treibt** (Gier), gewinnt kurzfristig und sät Schreck; wer sie **pflegt**, heilt sie und den Hain.

## Spielen / Entwickeln

Statische Web-App ohne Build-Step — jeder Webserver genügt:

```bash
npx serve .          # oder: python3 -m http.server
# → http://localhost:3000 (index.html)
```

Tests (Node ≥ 20, keine Abhängigkeiten):

```bash
npm test
```

Balance-Sims (Monte-Carlo über den echten Spielcode):

```bash
node sim/vollrun.js                      # Voll-Run, 6 Regionen (Balance-Tor 3)
SIM_REIFEGRAD=10 node sim/vollrun.js     # Reifegrad-Kurve
SIM_POLITIK=gier node sim/vollrun.js     # "Gier darf nie dominieren"-Kriterium
```

## Deployment (GitHub Pages)

`.github/workflows/pages.yml` testet und deployt das Wurzelverzeichnis bei jedem Push auf `main`. Einmalige Aktivierung: **Settings → Pages → Source: „GitHub Actions"**.

## Struktur

- **Spiellogik (DOM-frei, läuft in Node & Browser):** `engine.js`, `push.js`, `kampf.js`, `karte.js`, `knoten.js`, `belohnung.js`, `segen.js`, `meta.js`, `reifegrad.js`, `enden.js`, `narrativ.js`, `save.js`, `data.js`
- **Präsentation:** `index.html`, `ui/main.js`, `ui/audio.js`, `i18n/`
- **Tests & Sims:** `tests/` (Node-Testrunner), `sim/`
- **Design-Dokumente:** `docs/` (Artefakte 00–11, Entwicklungsplan: `docs/10_Entwicklungsplan.md`)

Spielertexte laufen ausschließlich über Text-Keys (`i18n/de.js`, `i18n/en.js`); Sprites/Audio sind beschriftete Platzhalter nach `docs/08_Design_Platzhalter.md`, die Bildgenerierungs-Prompts dafür liegen in `docs/11_Bild_Prompts.md`.
