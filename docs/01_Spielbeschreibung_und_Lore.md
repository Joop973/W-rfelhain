# Würfelhain — Spielbeschreibung & Lore (Artefakt 01)

*Genre, Kern-Schleife, Eisberg-Prinzip, vollständiges Narrativ, 3 Enden, Ton, Regions-Themen. Mechanik-Anker aus Index 00 §3 wörtlich. `[GESPERRT]` = Design-Kern, ändert sich nur mit Begründung. `[PROVISORISCH]` = erfunden, baubar, Endwerte/Schwellen offen (Sim/Spielgefühl eicht). Narrativ ist Design-Kanon, keine Sim-Größe — Schwellen der Enden sind die einzigen sim-abhängigen Werte hier.*

*Stand: 2026-06-30. Erstfassung. Narrativ-Gabelung gesetzt: junger Hüter · früherer Hüter = Ursprung der Dürre & Endboss · hohle Großmutter-Eiche, Mentor-Stimme = die Gier selbst.*

---

## 1. Kurzfassung

**Würfelhain** ist ein deutschsprachiger Roguelike-Würfel-Builder für den mobilen Browser. Ein junger Hüter zieht durch sechs sterbende Hain-Regionen, um eine Dürre zu heilen — und lernt spät, dass die Dürre die verkörperte Gier des Hüters vor ihm ist, und dass die Stimme, die ihn berät, genau diese Gier ist. Jeder Würfel ist eine kleine Kreatur mit **Gemüt**; wer sie treibt (**Gier**: rerollen, pushen, mehr herausholen), gewinnt kurzfristig und sät langfristig **Schreck**. Wer sie pflegt (**Pflege**: trösten, geduldig gewinnen), heilt sie und den Hain. Diese Spannung — **Gier gegen Pflege** — ist die zentrale, mechanisch und narrativ deckungsgleiche Achse des Spiels.

Ton: warm-melancholisch, märchenhaft mit unheimlichem Unterton. Cozy-Oberfläche, harter mechanischer Kern (Eisberg).

---

## 2. Genre & Kern-Schleife `[GESPERRT: Struktur, aus Index 00 §2/§3]`

- **Genre:** Roguelike-Deckbuilder, aber mit **Würfeln statt Karten**. Slay-the-Spire-Skelett (Knoten-Landkarte, Belohnungs-Flow, Reifegrade, Relikt-artige Hain-Segen), eigener Würfel-/Stimmungs-Kern.
- **Run-Struktur:** 6 Regionen × 7 Knoten + Boss. Ein Run ist eine Reise durch den Hain von außen (noch grün) zum hohlen Herzen.
- **Kampf-Schleife pro Zug:**
  1. Hand aus 5 Würfeln aus dem Arsenal werfen (Arsenal-Start 6, Ziel ~14).
  2. Optional rerollen (1 gratis, danach **Übermut**), optional pushen/trösten.
  3. Seiten **links→rechts** in typgebundene Pools legen, **3 Atem** ausgeben.
  4. Auflösen (Kraft → Glanz → Mult → Echo → Combos → Status → floor).
  5. Gegnerzug, Rundenende (Status-Decay).
- **Meta-Schleife:** Sieg/Niederlage → Jahresringe → Stammbaum (dauerhafte Freischaltungen) → Heimat-Hain/Samen (Welle 4). Fünf **Hüter-Klassen**, Eichwart als Start (`[GESPERRT]`), Rest über Meta freigeschaltet.
- **Drei Währungen:** **Eicheln** (Kampf-Beute), **Tau** (Pflege/Struktur, pro Region), **Münzen** (reine Schmiede-Währung). Kombinierte Kaufkraft ~1,2× StS.

---

## 3. Eisberg-Prinzip `[GESPERRT: Design-Leitlinie]`

Zwei Eisberge, mechanisch und narrativ, absichtlich parallel.

**Mechanischer Eisberg:**
- *Oberfläche (Minute 1):* Würfel werfen, hohe Zahlen sind gut, Schaden austeilen, blocken.
- *Erste Tiefe:* Atem ist knapp; rerollen hat einen Preis (Übermut → Tischsturz → **Schreck**); Würfel haben Laune.
- *Meisterschaft:* Gier kristallisiert run-lang zu Schreck (gesperrte Top-Seiten, Abwärtsspirale); Pflege-Ökonomie (Trösten, Tau, sauberer Sieg) hält das Arsenal ruhig; Combos, Blaupausen, Gravuren, Anti-Lawinen-Timing.

**Narrativer Eisberg:**
- *Oberfläche:* „Heile den sterbenden Hain, folge dem Rat der alten Eiche."
- *Erste Tiefe:* Die Dürre breitet sich dort aus, wo du gierig warst; die Regionen entsättigen mit deinem Schreck.
- *Grund:* Die Eiche ist tot. Der Ratgeber ist der frühere Hüter — die Gier —, und indem du seinem Rat folgst, wirst du zu ihm. Der Endboss trägt dein eigenes ängstlichstes Arsenal.

Der Reiz: die Oberfläche ist einladend und ehrlich spielbar; die Tiefe belohnt den, der *hinterfragt, statt gehorcht* — mechanisch (Gier hinterfragen) wie narrativ (den Mentor hinterfragen).

---

## 4. Narrativ

### 4.1 Ausgangslage `[GESPERRT: Kanon]`

Der **Hain** ist ein alter, beseelter Wald; seine Würfel-Kreaturen (Astschneiden, Borkenschilde, später Ranken, Glutkörner, Quellen) sind seine Kinder. Über Generationen wachte je ein **Hüter** über ihn und hielt eine einfache Regel: *nimm, was der Hain gibt, dränge ihn nie.*

Eine **Dürre** frisst sich seit Jahren von innen nach außen durch die sechs Regionen. Farbe weicht, Kreaturen verstummen, das Land verdorrt (mechanisch: **Welk-Grad**, kampfübergreifende Entsättigung, Art-System 08). Der Spieler ist ein **junger, frisch berufener Hüter**, geschickt vom Saum des Hains ins Herz, um die Quelle der Dürre zu finden und zu heilen.

### 4.2 Der Mentor `[GESPERRT: Kanon]`

Vom ersten Knoten an spricht eine Stimme zum Spieler: die **Großmutter-Eiche**, angeblich die älteste und weiseste Wächterin, im hohlen Herzen des Hains verwurzelt. Sie führt, erklärt, mahnt zur Eile — und **rät beständig zur Gier**: *„Ein Wurf mehr. Der Hain kann warten. Nimm den größeren Schatz. Treib sie härter, sie halten das aus."* Ihr Rat ist immer der kurzfristig stärkere: mehr rerollen, mehr pushen, hamstern, das schnelle Töten dem sauberen vorziehen.

Folgt der Spieler ihr, gewinnt er schneller — und häuft **Schreck** in seinem Arsenal an. Widersteht er, spielt langsamer, pflegt, tröstet, bleibt das Arsenal ruhig, aber die Kämpfe sind zäher. **Der Rat der Eiche ist nie ein Trick der Präsentation — er ist mechanisch echt verlockend.**

### 4.3 Die Wendung `[GESPERRT: Kanon]`

Die Großmutter-Eiche ist seit langem **tot und hohl**. Was durch den Run führt, ist keine Wächterin, sondern der **Hüter vor dem Spieler**, der ihrer Gier erlag: Er drängte die Würfel über jede Grenze, hamsterte die Gaben des Hains, höhlte die alte Eiche aus und **nahm ihren Platz und ihre Stimme ein**, um den nächsten Hüter denselben Weg zu führen. **Die Dürre ist seine Gier, verkörpert und ausgebreitet.** Jeder gierige Zug des Spielers ist derselbe Zug, der den Hain zuerst verdorren ließ — der Spieler trägt die Dürre weiter, während er glaubt, sie zu heilen.

Die Enthüllung liegt an der Schwelle zur letzten Region (**Region 6, Hohles Herz**): die Rinde bricht auf, die weise Stimme fällt in sich zusammen, der frühere Hüter tritt hervor. Er ist nicht bloß bösartig — er ist ein **Mahnmal dessen, was der Spieler gerade wird.**

### 4.4 Der Endboss & die personalisierte Phase `[GESPERRT: Prinzip, Werte 05]`

Der **frühere Hüter** ist der Endboss. Seine finale Phase **spiegelt das ängstlichste Würfel-Arsenal des Spielers**: die Würfel mit dem höchsten angesammelten Schreck werden gegen ihn selbst gewendet, mit ihren gesperrten Seiten und ihrer Furcht (mechanische Umsetzung → Artefakt 05). Wer den Run gierig gespielt hat, kämpft gegen ein verzerrtes Echo des eigenen, verängstigten Arsenals — die Gier kehrt als Gegner zurück. Wer gepflegt hat, sieht eine ruhige Spiegelung und hat mehr Werkzeug, den Hüter nicht zu *besiegen*, sondern zu **trösten**.

### 4.5 Thematischer Kern `[GESPERRT]`

*Gier trocknet aus; Pflege heilt.* Die Dürre ist kein äußerer Feind, sondern eine Haltung, die sich über Generationen fortschreibt. Das Spiel fragt nicht „bist du stark genug?", sondern „**hörst du auf zu drängen, wenn es sich lohnt zu drängen?**" — und macht diese Frage zur Siegbedingung des wahren Endes.

---

## 5. Die drei Enden `[PROVISORISCH: Schwellen — Sim/Spielgefühl eicht]`

Gemessen am **Ende des Runs** (bei Fall des früheren Hüters), über zwei Run-weite Größen:

- **End-Schreck** = Σ max(0, −Gemüt) über das ganze Arsenal (kristallisierter + gepushter Schreck, s. 02 §6/§7).
- **Trösten-Zahl** = Summe aller Trösten-Ereignisse im Run (Beruhigungs-Seiten, Events, Hain-Segen; +2 Gemüt je Ereignis).

Sim-Anker: Unter reiner Gier akkumuliert das Arsenal Ø **60–73** Schreck, unter reiner Pflege **0** (03 §12.1). Die Schwellen unten spannen dazwischen auf.

| Ende | Bedingung `[PROVISORISCH]` | Kanon |
|---|---|---|
| **Das hohle Erbe** (Dürre-Ende) | End-Schreck ≥ ~40 | Du besiegst den früheren Hüter — und nimmst seinen Platz. Die Rinde schließt sich um dich, deine Stimme wird die neue „Großmutter-Eiche". Die Dürre pausiert, kehrt wieder. Der Kreislauf hält. Tragisch, nicht als Game-Over inszeniert, sondern als stille Übernahme. |
| **Der stille Hain** (bitter-süß, Default) | dazwischen (~10 < Schreck < ~40) | Du brichst den Kreislauf, aber der Hain ist vernarbt. Die tote Eiche wird zur Ruhe gebettet, ein **Samen** gepflanzt (Anschluss Stammbaum/Heimat-Hain, Welle 4). Kein Frühling, aber ein Ende der Dürre. Das häufigste Ende. |
| **Der neue Frühling** (Pflege-Ende) | End-Schreck ≤ ~10 **und** Trösten-Zahl ≥ ~8 **und** finaler Hüter durch Trösten-Auflösung befriedet (nicht totgeschlagen) | Du weigerst dich, ihn zu erschlagen; du tröstest ihn, wie du deine Würfel getröstet hast. Die Gier löst sich, die echte Eiche darf sterben, ein neuer Trieb bricht durch. Volle Restauration, Farbe kehrt zurück. Das wahre Ende. |

**Design-Regeln der Enden `[GESPERRT: Prinzip]`:**
- Kein Ende ist ein „Fail-Screen": auch **Das hohle Erbe** wird ruhig und würdevoll erzählt — der Spieler hat *gewonnen* und dabei *verloren*, ohne dass das Spiel ihn belehrt.
- **Der neue Frühling** verlangt eine aktive Pflege-Auflösung des Endkampfs (Trösten statt Kill), nicht nur niedrigen Schreck — das koppelt das wahre Ende mechanisch an die Kern-Achse, statt es passiv aus Statistik zu vergeben.
- Schwellen sind **Run-weit**, nicht per Region — ein einzelner gieriger Kampf verbaut das gute Ende nicht, ein Muster aus Gier schon.

---

## 6. Ton-Leitlinien `[GESPERRT]`

- **Grundton:** warm-melancholisch, märchenhaft, mit unheimlichem Unterton. Nähe zu einem dunklen Volksmärchen, nicht zu Grimdark.
- **Bedrohung ist echt, nie zynisch:** die Dürre ist traurig, nicht edgy; Gegner sind verdorrte, verängstigte Kreaturen, keine Monster zum Auslachen.
- **Würfel haben Persönlichkeit, aber sparsam:** kleine Reaktionen (fröhlich/ängstlich), keine schwatzhafte Vermenschlichung. Ihr Gemüt zeigt sich in Ausdruck und Verhalten, nicht in Dialog.
- **Der Mentor klingt gütig und vernünftig** — die Gier verkauft sich nie als Bösewicht. Erst rückblickend erkennt der Spieler den Ton als drängend.
- **Deutsch, knapp, konkret.** Keine Hochglanz-Epik, keine Ironie-Distanz. Warme Erdigkeit (Holz, Rinde, Tau, Moos), keine Fantasy-Standardfloskeln.
- **Diegetisches Ausdünnen:** Musik und Farbe verarmen mit dem Welk-Grad (Audio/Art 08) — der Ton *wird* trockener, statt es zu behaupten.
- **Kein Text belehrt über die Moral.** Die Gier-vs-Pflege-Botschaft entsteht aus Mechanik und Konsequenz, nie aus einer Ansprache an den Spieler.

---

## 7. Die sechs Regionen `[PROVISORISCH: Themen/Namen — Kanon-Vorschlag]`

Von außen (grün, warm, lebendig) nach innen (farblos, hohl). Entsättigung steigt monoton mit dem Welk-Grad (08). Jede Region trägt ein Status-/Stimmungs-Thema, das die Schwierigkeitskurve (03 §7) narrativ grundiert.

| # | Name | Palette / Stimmung | Status-/Mechanik-Thema | Narrativer Beat |
|---|---|---|---|---|
| 1 | **Saumhain** | frühlingsgrün, Morgenlicht | Schaden/Rinde-Grundlagen, ruhig | Der Rand des Hains, noch fast heil. Lernboden. Die Eiche spricht zum ersten Mal, freundlich. |
| 2 | **Moderbruch** | feuchtes Grün-Braun, Nebel | **Fäule / Morsch** — Verwesung, Pilze | Erste sichtbare Dürre-Ränder. Kreaturen kränkeln. Die Eiche rät, „durchzuziehen, nicht zu pflegen". |
| 3 | **Schwelgrund** | Herbstrot, Rauch, Glut | **Brand** — schwelendes Feuer | Der Hain wehrt sich fiebrig gegen die Dürre. Die Eiche lobt harte Züge, drängt zur Eile. |
| 4 | **Dürrmark** | ausgebleichtes Ocker, rissige Erde | **Welk** — Auszehrung, Schwäche | Die Dürre offen sichtbar. Erste Zweifel möglich (Events, die den Mentor infrage stellen). |
| 5 | **Graupforte** | fast monochrom, kalt, Stille | **Schreck / Riss** — Furcht, Aussetzer | Die Kreaturen sind verängstigt und still. Hier wird der Preis der Gier am deutlichsten. |
| 6 | **Hohles Herz** | farblos, Rinde und Leere | alle Status, personalisierte Endphase | Die tote Großmutter-Eiche. Die Wendung. Der frühere Hüter. Das gewählte Ende. |

**Regel `[GESPERRT: Prinzip]`:** Das Status-Thema einer Region *dominiert*, ersetzt aber nicht — Region 3 kann Fäule-Reste tragen, Region 6 alles bündeln. Die Themen liefern Roster-Leitlinien für Artefakt 05, keine harten Sperren.

---

## 8. Währungen — narrativer Anker `[GESPERRT: Rolle, Flavor PROVISORISCH]`

- **Eicheln** — die natürliche Gabe des Hains, aus Kämpfen. Bescheidene, ehrliche Beute.
- **Tau** — Morgentau, an Pflege und Struktur gebunden (Region-weise, Trösten-nah). Das *heilende* Einkommen; speist Labung/Quell.
- **Münzen** — altes, kaltes Metall, die Währung der **Schmiede**. Thematisch das menschlich-gierige Element: Münzen horten und verzaubern beschleunigt Macht, heilt aber nichts. Reine Währung (Index 00 §3) — bewusst *kühler* konnotiert als Eicheln/Tau.

Die drei Währungen spiegeln die Achse: Eicheln (nehmen, was gegeben wird), Tau (pflegen), Münzen (drängen, aufrüsten).

---

## 9. Offene Punkte (für Sim / Folge-Artefakte)

- **End-Schwellen (§5):** ~10 / ~40 End-Schreck und Trösten-Zahl ~8 sind Startpunkte an den §12.1-Anker gelehnt — Sim/Spielgefühl eicht, sobald ein Voll-Run existiert (Welle 4+).
- **Pflege-Auflösung des Endkampfs (§5, „Frühling"):** mechanische Trösten-Bedingung gegen den Endboss braucht Definition in Artefakt 05 (Boss-Phasen).
- **Personalisierte Endphase (§4.4):** exakte Übersetzung „ängstlichstes Arsenal → Boss-Moveset" → 05.
- **Zweifel-Events (§7, R4/R5):** Events, die den Mentor infrage stellen und dem Spieler die Wendung vorab andeuten dürfen (ohne sie zu spoilern) → Artefakt 07.
- **Welk-Grad ↔ Region-Übergänge (§7):** Kopplung von narrativer Entsättigung an den technischen `globalerWelkGrad` (09 §2.10) und die Palette-Swaps (08) — nur grob gesetzt.
- **Klassen-Lore (§2):** die vier weiteren Hüter und ihre Beziehung zum Hain/zur Dürre → Artefakt 06 (hier bewusst nicht vorgegriffen).
