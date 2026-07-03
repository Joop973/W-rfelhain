# Würfelhain — Würfel & Blaupausen (Artefakt 04)

*Würfel-Schema, Start-Arsenale, Verzauber-/Gravur-Katalog, 16 Blaupausen. Gesperrte Werte aus Index 00 §3 und Artefakt 02/03 wörtlich. `[GESPERRT]` = bestätigt. `[PROVISORISCH]` = baubar, Werte offen (Sim/03 entscheidet). Echo- und Glanz-Seiten exakt nach 02 §9–§10 / 03 §2–§3.*

*Stand: 2026-07-02. Update: §2 Eichwart-Arsenal 6→12 (8+4, `[GESPERRT-OVERRIDE]`), §3.2 Ermutigungs-Gravur, §4 Sanftholz auf Ermutigungs-Seiten umgestellt. Vorheriges Update: §1.1 Kristallisation.*

---

## 1. Würfel-Schema

Ein **Würfel** ist:

```
Würfel {
  id            // eindeutig im Arsenal
  name          // Anzeigename
  typ           // primärer Pool: Schaden | Rinde | Fäule | Brand | Stütze | …
  atem          // Standard-Atemkosten je gespielter Seite (Start 1, Vollendet 0)
  gemüt         // pro Würfel, Start 0 (→ Schreck = max(0,−Gemüt))
  blaupause     // null oder aktive Basis-Identität (überschreibt alle 6 Seiten)
  seiten[6]     // Index 0–5, je { wert, effekt[] }
  stufen[6]     // Verzauber-Stufe je Seite, 0–3 (harter Cap 3)
}
```

Eine **Seite** ist:

```
Seite {
  wert          // Zahlenwert (0 erlaubt, z. B. reine Effekt-Seiten)
  effekt[]      // Liste von Seiten-Effekten, in Auflöse-Reihenfolge §4/02
}
```

### 1.1 Regeln zum Schema `[GESPERRT]`

- **Typ ≠ Seitenwirkung zwingend gleich:** der Typ benennt den primären Pool; einzelne Seiten können per Verzauberung andere Effekte tragen.
- **Atem ist Würfel-Eigenschaft**, nicht Seiten-Eigenschaft. Vollendet senkt Atem um 1 (Untergrenze 0). `[GESPERRT]`
- **Gemüt liegt am Würfel**, nicht an der Seite — Schreck sperrt die höchsten *freien* Seiten dieses Würfels (02 §6.2). Gemüt haftet am Würfel unabhängig von der Kampf-Zone (Ziehstapel/Hand/Ablage, 02 §2.2 / 09 §2.11).
- **Verzauberung wirkt per Seite** (`stufen[i]`), harter Cap **3 Stufen/Seite**, global. `[GESPERRT]`
- **Blaupause wirkt am ganzen Würfel:** überschreibt alle 6 Seiten als neue Basis-Identität, verbraucht sich beim Anwenden. `[GESPERRT]`
- **Effekt-Seiten-Werte (1c) `[PROVISORISCH]`:** reine Effekt-Seiten (Gift, Brand, Echo, Glanz, Fläche, Beruhigung, Ermutigung, Prägung, Labung) tragen je Seite einen eigenen Wert — teils **0** (reiner Effekt), teils kleiner Schadenswert. Pro Blaupause/Gravur einzeln festgelegt, Sim eicht. Konsequenz: manche Effekt-Seiten zählen für Gleichklang/Vollmond/Schreck mit, andere nicht. **Ermutigungs-Seiten tragen Wert 0** (reiner Effekt).
- **Schreck-Sperr-Tiebreak (4b) `[GESPERRT]`:** Schreck sperrt die höchsten freien Seiten; **bei wertgleichen Seiten entscheidet der niedrigere Seiten-Index** (links zuerst), nicht Zufall. Damit ist die Sperrung auch bei Wert-0-Seiten deterministisch.
- **Kristallisation (1d) `[GESPERRT — Sim-bestätigt 2026-06-30]`:** Übermut resettet weiterhin pro Kampf für die Sofort-Mechanik (Tischsturz bei Übermut > 6, 02 §7 unverändert). **Zusätzlich** wird bei Kampfende restliches Übermut (>0) **1:1 in `gemüt`-Abzug** auf die zuletzt gespielten Würfel verteilt, statt einfach zu verfallen. Dies ist ein Eingriff in das vormals `[GESPERRT]`-Prinzip „Übermut-Reset auf 0 bei Kampfbeginn und nach Tischsturz" (02 §7/03 §4) — der Reset gilt fortan nur für die Sofort-Wirkung, nicht mehr für die Langzeit-Konsequenz. Grund: ohne Kristallisation hat Rerollen unter optimalem Spiel keine run-lange Kosten (Welle-1-Tor-Befund, s. `Wuerfelhain_Welle1_Tor_Befund.md`). Schreck-Akkumulation durch Push (02 §6) bleibt unverändert zusätzlich bestehen — Kristallisation ist eine zweite, unabhängige Schreck-Quelle.
- **Blaupausen-Würfel sind verzauberbar (2a) `[GESPERRT-Prinzip]`:** Blaupause setzt die Basis-Seiten, Verzauberungen werden danach normal pro Seite gelegt (auch auf Quell/Hort).
- **Reihenfolge:** Blaupause setzt die Basis-Seiten; Verzauberungen werden *danach* auf einzelne Seiten gelegt. Eine erneute Blaupause setzt alle Seiten *und* deren Stufen zurück.

---

## 2. Eichwart — Start-Arsenal `[GESPERRT-OVERRIDE: Anzahl 2026-07-02 · GESPERRT: Identitäten/Passiv]`

Arsenal-Start **12 Würfel** (vorher 6 `[GESPERRT]`; Override sanktioniert 2026-07-02, `06_Aenderungen.md` — StS-Ziehen bei 6 Würfeln sinnlos, Hand 5 aus 6 inkohärent). Handgröße **5 unverändert `[GESPERRT]`** (03 §1). Ziehen im **StS-Stil** über Ziehstapel/Ablage (02 §2.2). **2:1-Verhältnis Schaden:Rinde erhalten; Würfel-Identitäten und Passiv unverändert gesperrt — nur die Anzahl skaliert.**

| # | Name | Typ | Seiten (1–6) | Atem |
|---|---|---|---|---|
| 1–8 | Astschneide | Schaden | 1, 2, 3, 4, 5, 6 | 1 |
| 9–12 | Borkenschild | Rinde | 1, 1, 2, 2, 3, 3 | 1 |

- **Alle Seiten reintypisch** (kein Misch-/Leer-Gesicht). Schmieden = schwache Seiten *aufwerten*, nicht Lücken füllen.
- **Klassen-Passiv:** +2 Schaden auf **jede gespielte Schaden-Seite** (additive Stufe, §4.1/02). `[GESPERRT]`
- **Reserve (falls zu fragil):** Rindenwürfel auf **1, 2, 2, 3, 3, 4** (Ø 2,5). Erst zünden, wenn Sim Region-1-Block zu dünn zeigt. `[GESPERRT als Fallback]`

### 2.1 Erwartungswerte (Sanity)

- Schaden-Seite Ø-Wurf 3,5 → +2 Passiv = **5,5/Seite** vor Mult.
- 3 Atem, alle auf Schaden → ~16,5 roh, deckt Region-1-Anker ~15–17/Zug (03 §12). **Output/Zug bleibt Atem-gedeckelt (3 Seiten) — das 12er-Arsenal ändert den Korridor nicht**, es liefert Deckbau/Rotation/Thinning. `[GESPERRT-konsistent]`
- Schaden-Anteil **8/12** → Ø **3,3 Schaden-Würfel je 5er-Hand** — ~3 spielbare Schaden-Seiten sind konsistent verfügbar (Konsistenz-Anker, 06 §1.1).
- Rinde Ø 2,0/Seite; 3 Seiten Block = 6 Rinde/Zug, verfällt je Zug (02 §2.2).

---

## 3. Verzauber-/Gravur-Katalog

Jede Verzauberung **überschreibt eine Seite** und legt einen Effekt darauf. 3 Stufen, harter Cap **3 Stufen/Seite** (global, 02/03). Preis in **Münzen**, sofern nicht anders vermerkt. Atemkosten gelten je gespielter Seite, additiv zur Würfel-Atemkosten *nur wenn explizit* — Standard: Verzauberung ändert Atem nicht.

### 3.1 Wucht (Schaden-Mult) `[GESPERRT]`

| Stufe | Effekt | Preis |
|---|---|---|
| 1 | Schaden-Pool **×1,5** | 40 |
| 2 | ×2,0 | 60 |
| 3 | ×2,5 | 80 |

- Typgebunden: multipliziert **nur den Schaden-Pool**. Greift an Position 3 in §4/02 (×Mult), zündet **1× pro Auflösung**, kein Selbst-Stapeln. `[GESPERRT]`
- **Selbstbremse:** additiver Zuwachs **+0,5/Stufe** (nicht multiplikativ-explosiv), harter Cap 3 Stufen. `[GESPERRT]`
- **Lernfehler:** Wucht-Seite *vor* additiven Schaden-Seiten platziert → Mult auf leeren Pool = 0 (02 §3). `[GESPERRT]`

### 3.2 Übriger Katalog `[PROVISORISCH]`

Werte sind Startpunkte; Sim eicht. Preise grob an Wucht-Anker (40/60/80) gestaffelt; Effekt-Seiten ohne Mult oft günstiger.

| Name | Überschreibt zu | St. 1 | St. 2 | St. 3 | Atem | Preis (M) | Bremse / Cap |
|---|---|---|---|---|---|---|---|
| **Schärfe** | Schaden, fester Aufschlag auf Seitenwert | +2 | +3 | +4 | 1 | 25/40/55 | additiv, läuft in §4-Stufe 1 (vor Mult) |
| **Borke** | Rinde, fester Block | +2 | +3 | +4 | 1 | 25/40/55 | Block verfällt je Zug (kein Stapeln) |
| **Gift** | Fäule auflegen | 2 Stapel | 3 | 4 | 1 | 35/50/65 | Fäule ignoriert Mult, tickt −1/Runde |
| **Zunder** | Brand auflegen | 2 Stapel | 3 | 4 | 1 | 35/50/65 | Brand tickt −2/Runde, einmal-Zugende |
| **Fäulnis-Hauch** | Morsch auflegen | 1 Stapel | 2 | 2 | 1 | 30/45/55 | Ziel-Cap 4 (max +80 %), Decay −1/Runde |
| **Dürre-Hauch** | Welk auflegen | 1 Stapel | 2 | 2 | 1 | 30/45/55 | Angreifer-Cap 4, Decay −1/Runde |
| **Markhärtung** | Kraft (kampf-lang) | +1 | +1 | +2 | 1 | 45/60/80 | Reset bei Kampfende; additive Stufe |
| **Echo-Gravur** | Echo-Seite (s. §3.3) | — | — | — | 1 | 60 (1 Stufe) | Cap 1× Quellbeitrag, kein Ketten-Echo |
| **Glanz-Gravur** | Glanz-Seite (s. §3.4) | — | — | — | 1 | 55 (1 Stufe) | verbraucht sich, Basis ×2 vor Mult |
| **Beruhigungs-Gravur** | Beruhigungs-Seite | +2 Gemüt | — | — | 1 | 30 (1 Stufe) | nur Würfel mit Schreck > 0 (reaktiv); 1 Trösten = +2 |
| **Ermutigungs-Gravur** | Ermutigungs-Seite (Wert 0, s. §3.5) | +2 Gemüt | — | — | 1 | 35 (1 Stufe) | universell (auch Gemüt ≥ 0, proaktiv); zählt **nicht** auf Frühling-Trösten-Zahl (01 §5) |
| **Doppelschlag** | Schaden, zwei Teilwerte statt einem | 1+1 | 2+2 | 2+3 | 1 | 30/45/60 | zählt als **zwei volle Schaden-Seiten** (beide +2 Passiv, beide für Gleichklang), aber **eine** Atemzahlung — Lawine mit Wucht/Gleichklang per Sim prüfen |
| **Bruchstelle** | Riss auf Ziel (Debuff am Gegner) | — | — | — | 1 | 50 (1 Stufe) | 25 % Aussetzer 2 Runden — auf Gegner gespiegelt; Sim klärt, ob als Offensiv-Tool sinnvoll |

**Einschränkungen `[GESPERRT-Prinzip]`:**

- **Echo-, Glanz-, Beruhigungs-, Ermutigungs- und Bruchstellen-Gravur sind 1-Stufen-Seiten** (kein 3-Stufen-Pfad) — sie tragen Mechanik, nicht Skalierung.
- **Mult-Seiten** (nur Wucht im Slice) sind die einzige Quelle multiplikativer Skalierung über Verzauberung; alles andere ist additiv oder Status-basiert (Anti-Lawine, 03 §14).
- Eine Seite trägt **einen** Verzauber-Effekt; erneutes Verzaubern derselben Seite hebt die Stufe (bis Cap 3). **Effekt-Typ-Wechsel** auf einer schon verzauberten Seite ist erlaubt **gegen Aufpreis** (überschreibt den alten Effekt, setzt auf Stufe 1 der neuen Gravur zurück). `[PROVISORISCH]`
  - **Aufpreis-Default:** +50 % auf den Stufe-1-Preis der neuen Gravur (Sim eicht). Verhindert kostenloses Umbauen, ohne Experimentieren zu blocken.

### 3.3 Echo-Seite (Definition exakt nach 02 §10.2 / 03 §2) `[GESPERRT]`

- Kopiert den **Beitrag der unmittelbar links platzierten Schaden-Seite inklusive deren Multiplikatoren** (Wucht, Glanz).
- **Hart gedeckelt auf 1× Quellbeitrag** — Echo bringt nie mehr ein als das Original, auch wenn die Echo-Seite selbst zusätzliche Mults (z. B. Gleichklang) abgreift.
- **Max 1 Wiederholung je Echo-Seite, kein Ketten-Echo.**
- **Position 1** (nichts links) = 0. **Echo nach Nicht-Schaden-Seite** = 0.
- Echo-Seite **zählt für Gleichklang mit**, profitiert davon aber nur bis zum Quellbeitrags-Cap.

### 3.4 Glanz-Seite (Definition exakt nach 02 §8.1 / 03 §2) `[GESPERRT-Prinzip]`

- Die **nächste gespielte Seite** zählt doppelt: **Basis ×2**, *bevor* §4-Multiplikatoren (Wucht/Gleichklang/Morsch/Welk) greifen.
- Verbraucht sich bei der nächsten Seite (kein multiplikativ-stapelbarer Dauereffekt).
- Verdoppelt den **additiven** Wert (Seitenwert + Kraft + Passiv), nicht das Endprodukt.

### 3.5 Ermutigungs-Seite (Definition exakt nach 02 §6.4/§9) `[PROVISORISCH]`

- **+2 Gemüt universell** auf einen Hand-Würfel — wirkt **auch bei Gemüt ≥ 0** (baut Richtung Fröhlich). Kosten **1 Atem**.
- **Abgrenzung zu Beruhigung (§3.2/02 §6.3):** Beruhigung ist reaktiv (nur Schreck > 0), Ermutigung proaktiv (immer). Beide folgen der Trösten-Regel +2 Gemüt.
- **Seiten-Wert 0** (reiner Effekt): zählt nicht in Pools, **bricht Vollmond** als Nicht-Schaden-Seite (02 §10.3), Schreck-Sperrung per Tiebreak deterministisch (§1.1).
- **Zählt nicht auf die Frühling-Trösten-Zahl** (01 §5, Default gegen Trivialisierung).
- Träger im Slice: diese Gravur + Sanftholz-Blaupause (§4) + Dorfschamane-Start-Kit (06 §3).

---

## 4. Blaupausen (16)

Blaupause = **ganzer Würfel als Basis-Identität**, überschreibt alle 6 Seiten, **verbraucht sich** beim Anwenden (Index 00 §3). Seltenheit: **Häufig / Selten / Episch**. Quelle: Belohnung, Händler, Event, Boss.

Quell (Tau/Labung) und Hort (Münzen/Prägung) sind `[GESPERRT]`; restliche Werte `[PROVISORISCH]`.

**Slice-Umfang (5a):** Alle 16 liegen als Datenkatalog vor. Im Welle-1-Slice sind aktiv nur **Quell, Hort** sowie **Hartholz (#3), Eichenwall (#5), Markstein (#10)** — genug zum Testen von Schaden, Block und Kraft-Aufbau ohne Combo-Tiefe. Rest bleibt Daten, wird ab Welle 3 freigeschaltet.

| # | Name | Typ | Seiten (1–6) | Effekt-Kern | Seltenheit | Quelle | Status |
|---|---|---|---|---|---|---|---|
| 1 | **Quell** | Stütze | Labung-Seiten (s. §4.1) | Tau-Engine: Basis 3, +1 je Trösten, Cap +8 | Episch | Boss/Event | `[GESPERRT]` |
| 2 | **Hort** | Stütze | Prägung-Seiten (s. §4.2) | Münzen-Engine: 3 Münzen/Spiel, 1 Atem | Episch | Boss/Event | `[GESPERRT]` |
| 3 | **Hartholz** | Schaden | 3,3,4,4,5,5 | hohe, enge Schaden-Spanne (Ø 4,0) | Häufig | Belohnung | `[PROVISORISCH]` |
| 4 | **Splitterklinge** | Schaden | 1,2,3,6,6,6 | hohe Varianz, Gleichklang-fähig oben | Selten | Händler | `[PROVISORISCH]` |
| 5 | **Eichenwall** | Rinde | 3,3,4,4,5,5 | dicker Block (Ø 4,0) | Häufig | Belohnung | `[PROVISORISCH]` |
| 6 | **Giftranke** | Fäule | 2,2,3,3,4,F | mehrere Fäule-Stapel-Seiten | Selten | Belohnung | `[PROVISORISCH]` |
| 7 | **Schwelbrand** | Brand | 2,2,3,3,4,B | Brand-Stapel-Seiten | Selten | Belohnung | `[PROVISORISCH]` |
| 8 | **Morschmacher** | Schaden | 2,3,4,M,M,M | legt Morsch beim Spielen | Selten | Händler | `[PROVISORISCH]` |
| 9 | **Dürrhauch** | Stütze | W,W,W,1,1,2 | legt Welk auf Gegner | Selten | Event | `[PROVISORISCH]` |
| 10 | **Markstein** | Schaden | 2,3,4,K,K,5 | Kraft-Aufbau + solider Schaden | Selten | Belohnung | `[PROVISORISCH]` |
| 11 | **Hallklinge** | Schaden | 3,4,5,5,E,E | Echo-Seiten integriert | Episch | Boss | `[PROVISORISCH]` |
| 12 | **Glanzkorn** | Schaden | 2,3,4,5,G,G | Glanz-Seiten integriert | Episch | Boss | `[PROVISORISCH]` |
| 13 | **Weitwurf** | Schaden | 2,3,4,4,Fl,Fl | Fläche-Seiten (trifft alle) | Selten | Belohnung | `[PROVISORISCH]` |
| 14 | **Gleichmaß** | Schaden | 4,4,4,4,2,3 | 4× gleicher Wert (Gleichklang-Anker, nicht garantiert) | Episch | Händler/Event | `[PROVISORISCH]` |
| 15 | **Sanftholz** | Stütze | Erm(0),Erm(0),2,2,3,3 | Ermutigungs- + Block-Mix (Pflege-Stütze, proaktiv ab Zug 1) | Häufig | Belohnung | `[PROVISORISCH]` |
| 16 | **Wildwuchs** | Schaden | 2,3,6,6,6,Riss | brachiale Hochwert-Spanne, Eigen-Riss-Risiko | Episch | Event (Fluch-nah) | `[PROVISORISCH]` |

*Legende der Effekt-Seiten: F=Fäule auflegen, B=Brand, M=Morsch, W=Welk, K=Kraft, E=Echo, G=Glanz, Fl=Fläche, Erm(0)=Ermutigung (Wert 0, §3.5), Riss=Eigen-Riss.*

**Sanftholz-Änderung 2026-07-02:** vormals Beruhigungs-Seiten (Ber,Ber) — auf **Ermutigung** umgestellt, weil Beruhigung self-gated ist (nur Schreck > 0) und die Pflege-Stütze unter sauberem Spiel sonst tot wäre (02 §6.4). Die 2/3-Seiten bleiben Block. Sanftholz ist zugleich das Start-Kit-Element des Dorfschamanen (06 §3).

### 4.1 Quell / Labung (Tau-Engine) `[GESPERRT]`

- **Blaupause Quell** ersetzt den Würfel durch **Labung-Seiten**.
- **Keyword Labung:** Basiswert **3**, **+1 je Trösten** (kampfübergreifend gezählt), **harter Cap +8** (also max 11). Run-lang akkumulierend, **selbstbremsend** durch den Cap.
- **Bremse:** Wachstum nur über Trösten-Ereignisse (knappe Ressource); Cap +8 deckelt die Engine hart. `[GESPERRT]`
- Tau-Einkommen ~6/Region (03 §8) — Quell ist Pflege-Pfad, nicht Schaden-Avalanche.
- **Offene Kopplungsfrage (Sim):** ob Ermutigungs-Ereignisse den Labung-Zähler („+1 je Trösten") speisen — Default: **ja** (Labung zählt Gemüt-Pflege-Ereignisse, nicht die Frühling-Trösten-Zahl; die Nicht-Anrechnung aus 01 §5 betrifft nur das Ende). `[PROVISORISCH]`

### 4.2 Hort / Prägung (Münzen-Engine) `[GESPERRT]`

- **Blaupause Hort** ersetzt den Würfel durch **Prägung-Seiten**.
- **Keyword Prägung:** **3 Münzen je gespielter Seite**, Kosten **1 Atem**.
- **Bremse:** Atemkonkurrenz (jede Prägung kostet einen Schaden-/Block-Zug) + Headroom **~16–18 Verzauberungen/Run** als ökonomische Decke. `[GESPERRT]`
- Münzen bleiben **reine Währung** (Index 00 §3) — Prägung beschleunigt die Schmiede, generiert keinen Direktschaden.

---

## 5. Anti-Lawinen je Engine (Zusammenfassung)

| Engine / Seite | Skaliert über | Eingebaute Bremse |
|---|---|---|
| Wucht | Verzauber-Stufe | +0,5/Stufe additiv, Cap 3 Stufen, 1× pro Auflösung |
| Schärfe/Borke/Status-Gravuren | Stufe | rein additiv, Status-Caps (Morsch/Welk 4), Block-Verfall |
| Echo | Nachbarschaft | Cap **1× Quellbeitrag**, max 1 Wiederholung, kein Ketten-Echo |
| Glanz | Einzelseite | verbraucht sich, verdoppelt **Basis** (vor Mult), nicht Endprodukt |
| Quell/Labung | Trösten-Anzahl | **Cap +8**, Wachstum an knappe Pflege-Ressource gebunden |
| Hort/Prägung | Spiel-Häufigkeit | Atemkosten 1, Headroom ~16–18 Verz./Run |
| Beruhigung/Ermutigung | — | flach +2 Gemüt, 1 Atem — Atemkonkurrenz ist die Bremse; keine Skalierung |
| Gleichmaß/Doppelschlag (Gleichklang-Futter) | gleiche Werte | Gleichklang **hart ×1,75 max** (03 §3) — Sim prüft Doppelschlag-Wechselwirkung |
| **Übermut/Reroll (Kristallisation)** | **Reroll-Anzahl je Kampf** | **Übermut kristallisiert am Kampfende zu Gemüt-Abzug** (s. §1.1) — Anti-Lawine für Reroll-Gier, nicht für Schaden, aber Teil des Anti-Avalanche-Prinzips |

**Grundsatz (03 §14):** keine pauschale Skalier-Grenze; jede run-lange Engine bringt **eigene Bremse** mit (StS-Stil). Multiplikative Skalierung existiert im Slice **nur** über Wucht und die fest gedeckelten Combos.

---

## 6. Offene Punkte für die Sim

- Alle `[PROVISORISCH]`-Verzauberwerte (§3.2): Aufschläge, Status-Stapel, Preise — inkl. Ermutigungs-Gravur-Preis (35) gegen Beruhigung (30).
- **Ermutigungs-Häufigkeit** (Gravur + Sanftholz + Dorfschamane) gegen die Frühling-Schwelle (01 §5) und die Labung-Kopplung (§4.1) prüfen.
- **Doppelschlag** als Gleichklang-Enabler: Lawinen-Risiko mit Wucht + Gleichklang gegenchecken.
- Blaupausen-Seitenverteilungen (§4): Ø-Werte und Effekt-Seiten-Anteil gegen Region-1-Pacing eichen — **jetzt auf 12er-Arsenal-Basis** (Verdünnungs-Effekt: eine Blaupause ist 1/12 statt 1/6 des Decks; Thinning/Entfernen-Senken gewinnen an Wert).
- **Gleichmaß** (4× Wert 4): Gleichklang nicht mehr garantiert, aber starker Anker — prüfen, ob in Kombination mit Doppelschlag/Wucht zu konsistent den ×1,75-Cap zieht.
- **Wildwuchs** Eigen-Riss: Ist das Risiko-Reward-Verhältnis tragbar oder Brick-Gefahr?
- Echo-/Glanz-Blaupausen (Hallklinge/Glanzkorn): Seiten-Dichte gegen Cap-Wirkung testen.
- Vier 1-Stufen-Effekt-Gravuren (Echo/Glanz/Ermutigung/Bruchstelle): Preis-Sinn gegen 3-Stufen-Pfade.
- **Kristallisations-Wechselwirkung mit Trösten-Gravuren** (Beruhigungs-/Ermutigungs-Gravur, Quell/Labung): prüfen, ob ausreichend Trösten-Zugang in Region 1 verfügbar ist, um kristallisierten Schreck abzubauen, bevor die Spirale kippt (s. Welle-1-Tor-Befund, Nebenbefund zur Nichtlinearität).
