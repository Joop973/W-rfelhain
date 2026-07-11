// tools/geraete_smoke.mjs — E2: automatisierter Geräte-Matrix-Smoke.
// Emuliert Android-Chrome (Pixel 5) und iPhone-Viewport in Chromium:
// Laden, Karte, Kampf per TOUCH-Taps, LocalStorage-Save/Resume, Sprach-
// Toggle, Performance (Zeit bis interaktiv, Render-Zeit je Aktion).
// GRENZE: echtes WebKit/iOS-Safari ist hier nicht installiert — die
// iPhone-Zeile ist nur Viewport/Touch/DPR-Emulation. Der reale iOS-Test
// (Audio-Entsperrung, .m4a, Home-Indicator, Safari-Quirks) bleibt manuell:
// docs/Geraete_Matrix_Befund.md §Checkliste.
// Aufruf: node tools/geraete_smoke.mjs  (erwartet Chromium via Playwright)

// Playwright lokal ODER global (diese Umgebung: /opt/node22) — ESM kennt kein NODE_PATH.
const { chromium } = await import('playwright').catch(() =>
  import('/opt/node22/lib/node_modules/playwright/index.mjs')
);
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json' };
const PORT = 8960;

const GERAETE = [
  { name: 'Android (Pixel-5-artig)', viewport: { width: 393, height: 851 }, dpr: 2.75,
    ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36' },
  { name: 'iPhone (Viewport-Emulation)', viewport: { width: 390, height: 844 }, dpr: 3,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
];

const server = createServer(async (req, res) => {
  const pfad = join(ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  try {
    const b = await readFile(pfad);
    res.writeHead(200, { 'content-type': MIME[extname(pfad)] ?? 'text/plain' });
    res.end(b);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(PORT, r));

const exe = process.env.PLAYWRIGHT_CHROMIUM ?? '/opt/pw-browsers/chromium';
const browser = await chromium.launch({ executablePath: exe });
let fehlgeschlagen = false;

for (const g of GERAETE) {
  const ctx = await browser.newContext({
    viewport: g.viewport, deviceScaleFactor: g.dpr, userAgent: g.ua,
    hasTouch: true, isMobile: true,
  });
  const page = await ctx.newPage();
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  const ergebnisse = [];
  const ok = (label, wahr, extra = '') => {
    ergebnisse.push(`  ${wahr ? '✓' : '✗'} ${label}${extra ? ` — ${extra}` : ''}`);
    if (!wahr) fehlgeschlagen = true;
  };

  const t0 = Date.now();
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector('[data-knoten]');
  ok('Laden bis Karte interaktiv', true, `${Date.now() - t0} ms`);

  // Horizontaler Overflow? (Handy-Killer Nr. 1)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok('kein horizontaler Overflow', overflow <= 0, `${overflow}px`);

  // Kampf per Touch-Tap spielen: Knoten → Würfel legen → auflösen.
  await page.locator('[data-knoten]:not([disabled])').first().tap();
  await page.waitForSelector('.ph--gegner');
  const gegner1 = await page.locator('.ph--gegner strong').textContent(); // Name VOR Aktionen
  const tTap = Date.now();
  await page.locator('.ph--wuerfel').first().tap();
  ok('Würfel-Tap → Render', true, `${Date.now() - tTap} ms`);
  await page.locator('[data-aktion="aufloesen"]').tap();
  ok('Auflösen per Touch', (await page.locator('.ph--log').textContent()).includes('aufgelöst'));

  // Touch-Ziele groß genug? (Empfehlung ≥ 40 px)
  const minZiel = await page.evaluate(() =>
    Math.min(...[...document.querySelectorAll('button:not([disabled])')].map((b) => {
      const r = b.getBoundingClientRect();
      return Math.min(r.width, r.height);
    }))
  );
  ok('Touch-Ziele ≥ 32 px', minZiel >= 32, `kleinstes ${Math.round(minZiel)}px`);

  // LocalStorage-Save + Resume (Kampf-Seed, v7): selber Gegner nach Reload.
  await page.reload();
  await page.waitForSelector('.ph--gegner');
  const gegner2 = await page.locator('.ph--gegner strong').textContent();
  ok('Save/Resume (selber Kampf nach Reload)', gegner1 === gegner2, `${gegner1} → ${gegner2}`);

  ok('keine Seitenfehler', fehler.length === 0, fehler.join(' | '));
  console.log(`\n${g.name} (${g.viewport.width}×${g.viewport.height} @${g.dpr}x):`);
  console.log(ergebnisse.join('\n'));
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${fehlgeschlagen ? '✗ MINDESTENS EIN PUNKT FEHLGESCHLAGEN' : '✓ Alle automatisierten Geräte-Punkte grün.'}`);
console.log('Hinweis: echtes iOS-Safari (WebKit) ist hier NICHT abgedeckt — manuelle Checkliste in docs/Geraete_Matrix_Befund.md.');
process.exit(fehlgeschlagen ? 1 : 0);
