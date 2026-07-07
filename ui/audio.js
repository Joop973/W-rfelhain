// ui/audio.js — Audio-Technik (D5, 08 §2.2/§2.4): stem-basiertes Mixing mit
// diegetischem Ausdünnen je Welk-Stufe, Trösten-Rückkehr, SFX-Slots.
// Browser-only (Web Audio API), von ui/main.js aufgerufen — nie aus der
// Spiellogik (09 §1). OHNE Audio-Dateien (D6 ausstehend) ist jedes API
// ein stiller No-Op: fetch-404s werden geschluckt, die Verdrahtung steht.

// Ausdünn-Kurve (08 §2.2): aktive Stems je Welk-Stufe. Stufe 5 = Puls sehr
// spärlich (Gain gedrosselt statt eigener Stem-Datei). Tempo/Charakter
// ("fiebrig") liegen in den Stem-Aufnahmen selbst, nicht im Code.
const STEMS_JE_STUFE = {
  0: { aktiv: [1, 2, 3, 4], pegel: 1.0 },
  1: { aktiv: [1, 2, 3], pegel: 1.0 },
  2: { aktiv: [1, 2, 3], pegel: 1.0 },
  3: { aktiv: [1, 2], pegel: 1.0 },
  4: { aktiv: [1], pegel: 1.0 },
  5: { aktiv: [1], pegel: 0.4 },
};
const STEM_FADE_S = 1.5; // weicher Stem-Wechsel an Region-Grenzen (08 §2.2)
const TROESTEN_ORNAMENT_S = 2.0; // kurze Rückkehr des Zier-Stems (Stem 4)

let ctx = null; // AudioContext — erst nach User-Geste (Autoplay-Policy)
let master = null;
let stems = []; // { quelle, gain, k } der laufenden Region
let aktiveRegion = 0;
let sfxCache = new Map();
let stumm = false;
let assetsProbe = null; // einmalige Manifest-Probe (Promise-Cache) — gate für alle fetches

// Solange D6 (Audio-Produktion) aussteht, existiert kein Audio-Verzeichnis.
// Eine einzelne Probe auf assets/audio/manifest.json verhindert 404-Spam:
// Aaron legt das Manifest zusammen mit den Stems/SFX ab (08 §4.10). Das
// Promise wird gecacht, damit parallele Stem-Loads nur EINE Probe auslösen.
function pruefeAssets() {
  assetsProbe ??= fetch('assets/audio/manifest.json', { method: 'HEAD' })
    .then((r) => r.ok)
    .catch(() => false);
  return assetsProbe;
}

// Erste User-Geste entsperrt den Context (ui/main.js bindet das einmalig).
export function entsperreAudio() {
  if (ctx || typeof AudioContext === 'undefined') return;
  try {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = stumm ? 0 : 1;
    master.connect(ctx.destination);
  } catch {
    ctx = null; // kein Audio verfügbar — alle Aufrufe bleiben No-Ops
  }
}

export function setzeStumm(an) {
  stumm = an;
  if (master) master.gain.value = an ? 0 : 1;
}

async function ladePuffer(url) {
  if (!(await pruefeAssets())) return null;
  try {
    const antwort = await fetch(url);
    if (!antwort.ok) return null;
    return await ctx.decodeAudioData(await antwort.arrayBuffer());
  } catch {
    return null; // Datei fehlt (D6) oder Decode-Fehler — still ignorieren
  }
}

// Startet die Stems einer Region synchron (08 §2.4) und blendet nach der
// Welk-Stufe. Gleiche Region erneut → nur die Stufe nachziehen.
export async function spieleRegion(region, welkStufe) {
  if (!ctx) return;
  if (region === aktiveRegion) return setzeWelkStufe(welkStufe);
  aktiveRegion = region;

  const alte = stems;
  stems = [];
  for (const s of alte) {
    s.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + STEM_FADE_S);
    setTimeout(() => { try { s.quelle.stop(); } catch { /* schon gestoppt */ } }, STEM_FADE_S * 1000 + 100);
  }

  const puffer = await Promise.all(
    [1, 2, 3, 4].map((k) => ladePuffer(`assets/audio/mus.r${region}.stem${k}.ogg`))
  );
  if (region !== aktiveRegion) return; // Region hat inzwischen gewechselt
  const start = ctx.currentTime + 0.05;
  puffer.forEach((buf, i) => {
    if (!buf) return;
    const quelle = ctx.createBufferSource();
    quelle.buffer = buf;
    quelle.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    quelle.connect(gain).connect(master);
    quelle.start(start); // alle synchron (08 §2.4)
    stems.push({ quelle, gain, k: i + 1 });
  });
  setzeWelkStufe(welkStufe);
}

// Diegetisches Ausdünnen: blendet Stems gemäß Kurve, weich über STEM_FADE_S.
export function setzeWelkStufe(stufe) {
  if (!ctx) return;
  const kurve = STEMS_JE_STUFE[Math.max(0, Math.min(5, stufe))] ?? STEMS_JE_STUFE[0];
  for (const s of stems) {
    const ziel = kurve.aktiv.includes(s.k) ? kurve.pegel : 0;
    s.gain.gain.linearRampToValueAtTime(ziel, ctx.currentTime + STEM_FADE_S);
  }
}

// Trösten-Rückkehr (08 §2.2 [ENTSCHIEDEN]): der Zier-Stem (4) kehrt kurz
// zurück — hörbare Belohnung der Pflege, reines UI-Event, kein State-Reset.
export function troestenRueckkehr() {
  if (!ctx) return;
  const zier = stems.find((s) => s.k === 4);
  if (!zier || zier.gain.gain.value > 0.5) return; // spielt ohnehin (Stufe 0)
  const t = ctx.currentTime;
  zier.gain.gain.linearRampToValueAtTime(0.8, t + 0.3);
  zier.gain.gain.linearRampToValueAtTime(0, t + 0.3 + TROESTEN_ORNAMENT_S);
}

// One-Shot-SFX aus den 08-§4.10-Slots (sfx.wurf, sfx.tischsturz, …).
export async function sfx(name) {
  if (!ctx) return;
  if (!sfxCache.has(name)) sfxCache.set(name, await ladePuffer(`assets/audio/sfx.${name}.ogg`));
  const buf = sfxCache.get(name);
  if (!buf) return;
  const quelle = ctx.createBufferSource();
  quelle.buffer = buf;
  quelle.connect(master);
  quelle.start();
}
