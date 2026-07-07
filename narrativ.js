// narrativ.js — Mentor-Stimme, Zweifel-Hinweise, Wendung, Enden-Inszenierung (D4).
// DOM-frei: liefert ausschließlich Text-Keys und pflegt narrative Run-Felder
// (run.hinweise, run.wendungGesehen). Alle Texte in i18n/ — Kanon 01 §4/§5/§6.
//
// Ton-Regel (01 §6): der Mentor klingt gütig und vernünftig, rät aber beständig
// zur Gier; kein Text belehrt über die Moral. Die Wendung (01 §4.3) wird vor
// Region 6 nie ausgesprochen — die Zweifel-Events (07 §5.3) säen nur Risse.

// --- Mentor-Stimme (01 §4.2) ----------------------------------------------------

// Eine Zeile je Regions-Eintritt. Region 6 hat keine Mentor-Zeile mehr —
// dort übernimmt die Wendungs-Szene (die Stimme fällt in sich zusammen).
export function mentorBeiRegionEintritt(region) {
  if (region >= 6) return null;
  return `mentor.region.${region}`;
}

// Situative Mentor-Zeile: die Stimme wiegelt nach dem Tischsturz ab und drängt
// weiter. Rein tonal, keine Mechanik (01 §4.2: der Rat ist mechanisch echt
// verlockend, die Reaktion nur Färbung).
export function mentorBeiTischsturz() {
  return 'mentor.tischsturz';
}

// --- Zweifel-Hinweise (07 §5.3) ---------------------------------------------------

// Zweifel-Optionen tragen effekt.hinweis (zweifel_1/zweifel_2). Der Hinweis
// wird run-weit gemerkt — die Wendung färbt sich, wenn der Spieler geahnt hat.
export function merkeHinweis(run, hinweisId) {
  run.hinweise = [...(run.hinweise ?? []), hinweisId];
  return `hinweis.${hinweisId}`;
}

// --- Die Wendung (01 §4.3) --------------------------------------------------------

// An der Schwelle zu Region 6: die Rinde bricht auf, die Stimme fällt in sich
// zusammen, der frühere Hüter tritt hervor. Wer den Zweifel-Events gefolgt ist
// (run.hinweise), bekommt eine zusätzliche "du hast es geahnt"-Zeile.
export function wendungSzene(run) {
  const szenen = ['wendung.szene1', 'wendung.szene2', 'wendung.szene3'];
  if ((run.hinweise ?? []).length > 0) szenen.push('wendung.geahnt');
  return szenen;
}

// Einmaligkeit: die UI ruft das beim Betreten von Region 6 ab; gesehen = nie wieder.
export function wendungSteht(run) {
  return (run.region ?? 1) >= 6 && !run.wendungGesehen && !run.abgeschlossen && !run.verloren;
}

// --- Welk-Stufe (08 §3.1/§3.2, D5) --------------------------------------------------

// Visuelle Entsättigungs-Achse: 6 diskrete Stufen 0–5 aus run.welkGrad
// (normal = region − 1; der Dürre-Same-Haken treibt ihn schneller). Rein
// präsentationsseitig — ui/ liest den Wert und setzt die Klasse `welk-N`
// bzw. das Audio-Ausdünnen; keine Rückkopplung in die Spiellogik (08 §3.5).
export function welkStufe(run) {
  return Math.max(0, Math.min(5, run?.welkGrad ?? 0));
}

// --- Enden-Inszenierung (01 §5) -----------------------------------------------------

// Drei Absätze je Ende, ruhig erzählt — kein Ende ist ein Fail-Screen
// [GESPERRT: Prinzip]. Der dritte Absatz gehört jeweils der Stimme/Stille.
export function endeSzenen(endeId) {
  return [`ende.${endeId}.szene1`, `ende.${endeId}.szene2`, `ende.${endeId}.szene3`];
}
