# Würfelhain — Folgeänderungen aus Artefakt 06

*Alle Nachzüge, die durch 06 (Klassen) in anderen Artefakten entstehen. Abzuarbeiten, wenn der jeweilige Artefakt-Chat geöffnet wird. `[GESPERRT-OVERRIDE]` = ändert einen vormals gesperrten Wert (sanktioniert durch Session-Beschluss 2026-07-02: Arsenal-Größe 12).*

*Stand: 2026-07-02. Auslöser: Arsenal-Start 6 → 12 (StS-Ziehstapel), Eichwart-Skalierung, neues Keyword „Ermutigung", Schleiferin-Vollmond-Ausnahme, Klassen-Namen.*

---

## A. Arsenal-Größe 6 → 12 `[GESPERRT-OVERRIDE]`

Sanktioniert, weil StS-Ziehen bei 6 Würfeln sinnlos ist und Hand 5 aus 6 inkohärent war. **Output/Zug bleibt Atem-gedeckelt (3 Seiten) — Korridor 15–17 unverändert.**

| Artefakt | Stelle | Alt | Neu |
|---|---|---|---|
| **00** | §3 „Kampf & Auflösung" / Eichwart | Arsenal-Start 6 | **12** |
| **00** | §3 Eichwart | 4× Schaden, 2× Rinde | **8× Schaden, 4× Rinde** (2:1 erhalten) |
| **01** | §2 Kern-Schleife | „Arsenal-Start 6, Ziel ~14" | **Start 12, Ziel ~22–24** |
| **03** | §1 Tabelle | Arsenal-Start 6 | **12** |
| **03** | §1 Tabelle | Arsenal-Ziel ~14 | **~22–24** |
| **04** | §2 Eichwart-Arsenal | 6 Würfel (4+2) | **12 Würfel (8+4)**, Passiv/Reserve unverändert |

- **Handgröße 5 bleibt `[GESPERRT]`** — unverändert.
- Passiv „Wehrhaftigkeit" +2, Atem 1, Würfel-Identitäten (Astschneide/Borkenschild) **unverändert gesperrt** — nur die Anzahl skaliert.

---

## B. Ziehstapel-/Ablage-Modell (neu) `[PROVISORISCH]`

Bei 12 Würfeln + Hand 5 braucht es ein explizites Zieh-Modell (StS-Stil). Bisher nirgends spezifiziert.

| Artefakt | Nachzug |
|---|---|
| **02** | §2.2 („Werfen") ergänzen: Hand wird aus **Ziehstapel** gezogen; Gespieltes/Verworfenes → **Ablagestapel**; Ziehstapel leer → Ablage neu mischen. Reshuffle-Timing (bei Zugbeginn, wenn < 5 im Zieh) festlegen. |
| **09** | §3.1 `runState`: `arsenal` bleibt Gesamtmenge; neu `ziehstapel: [id,…]`, `hand: [id,…]`, `ablage: [id,…]` als Kampf-State. Prüfen, ob Mid-Kampf-Save den Ziehstapel-Order + RNG-Stream persistieren muss (koppelt an offene RNG-State-Frage 09 §4/§7). |
| **02** | Klären: wird die Hand **je Zug** komplett neu gezogen (alte Hand ablegen) oder nur aufgefüllt? Default-Vorschlag: **je Zug 5 frisch ziehen, Reste ablegen** (einfacher, StS-nah). |

---

## C. Neues Keyword „Ermutigung" `[PROVISORISCH]`

+2 Gemüt **universell** (auch bei Gemüt ≥ 0). Löst das Henne-Ei-Problem der Beruhigung (nur bei Schreck > 0, 02 §6.3), die unter sauberem Pflege-Spiel tot ist.

| Artefakt | Nachzug |
|---|---|
| **02** | §6 / §9 (Keywords): „Ermutigung" aufnehmen. Wirkung +2 Gemüt universell, 1 Atem. **Abgrenzung zu Beruhigung** notieren (Beruhigung nur Schreck > 0, Ermutigung immer). |
| **04** | Als Seiten-Effekt/Gravur katalogisieren (Sanftholz-Blaupause trägt Erm-Seiten; ggf. eigene Ermutigungs-Gravur analog Beruhigungs-Gravur §3.2). Effekt-Seiten-Wert 0. |
| **09** | §2.1 `effekt.typ`-Liste: `"ermutigung"` ergänzen. |
| **01** | §5: **Frühling-Schwelle (Trösten-Zahl ≥ 8) gegen Ermutigungs-Häufigkeit prüfen** — universelle Trösten-Quelle könnte die Bedingung trivialisieren. Ggf. Schwelle anheben oder Ermutigung nicht auf „Trösten-Zahl" zählen lassen. Sim/Design entscheidet. |

---

## D. Schleiferin-Vollmond-Ausnahme `[PROVISORISCH]`

Schliff-Passiv (+1 effektiver Wert alle Pools, permanent) würde Vollmond zur Norm machen. Fix: **Vollmond prüft den natürlich gewürfelten Wert, ignoriert das permanente Klassen-+1.** Der Wetzung-**Status** ermöglicht Vollmond weiterhin regulär.

| Artefakt | Nachzug |
|---|---|
| **02** | §10.3 Edge-Cases: Klausel ergänzen — permanente Klassen-Wertsockel (Schliff) zählen **nicht** für die Vollmond-Bedingung; Wetzung-**Status** dagegen schon. Bedingung bleibt „effektiver Wert ≥ Höchstwert", aber mit dieser Ausnahme für dauerhafte Klassen-Sockel. |
| **00** | §3 Vollmond: nur falls nötig als Halbsatz; primär eine 02-Präzisierung. |
| **03** | §2/§3.1: keine Zahlenänderung; nur Verweis, dass Schliff-Sockel Vollmond nicht speist. |

---

## E. Welle-1-Tor Re-Kalibrierung `[PROVISORISCH]`

Sandbox-Sim (03 §12.1) lief auf **6er-Arsenalen**. Struktur hält, Zahlen nicht.

| Artefakt | Nachzug |
|---|---|
| **03** | §12.1 / §13: Kennzeichnen, dass Siegraten-Zahlen von 6er-Läufen stammen. **Re-Run auf 12er-Arsenal** nötig. Erwartung: strukturelles Ergebnis (Pflege > Gier) bleibt (Atem-Deckel + Kristallisation sind arsenal-größen-unabhängig); absolute Siegraten & Schreck-Akkumulation verschieben sich. |
| **00** | §4 Build-Stand: Hinweis, dass die Kalibrierung auf altes Arsenal bezogen war. |
| **09** | §6 Build-Stand: dito; Portierung von `kristallisiereUebermut()` bleibt vorrangig, jetzt gegen 12er-Arsenal zu testen. |

---

## F. Klassen-Namen (nur 06-intern, minimaler Ripple)

Final: Eichwart · **Dorfschamane** (Pflege) · **Glöckner** (Gleichklang/Echo) · **Schleiferin** (Wetzung) · **Rodbauer** (Gier). Alte Arbeitsnamen Tauwart/Hallwart/Dornwart entfallen.

| Artefakt | Nachzug |
|---|---|
| **00** | §1 Karte: 06 auf ✓ setzen (Datum 2026-07-02). Optional Klassen-Namen in §3 spiegeln, falls dort eine Klassen-Liste geführt wird. |
| **05/07** | Kein Vorgriff nötig; falls später Klassen-spezifische Gegner/Events/Segen entstehen, diese Namen verwenden. |

---

## G. Zusammenfassung — was ist Override vs. additiv

- **Override gesperrter Werte (A):** Arsenal-Start 6→12, Arsenal-Ziel ~14→~22–24, Eichwart 6→12 Würfel. Handgröße 5, Passiv +2, Würfel-Identitäten, Atem 1 bleiben gesperrt-unverändert.
- **Additiv/neu (B–D):** Ziehstapel-Modell, Keyword Ermutigung, Schleiferin-Vollmond-Ausnahme.
- **Reine Nachkalibrierung (E):** Welle-1-Tor-Zahlen.
- **Kosmetisch (F):** Namen + Index-Häkchen.

**Reihenfolge der Abarbeitung (Vorschlag):** 00 (Karte + Override-Werte) → 02 (Ziehstapel + Ermutigung + Vollmond-Klausel) → 09 (State-Schema) → 04 (Eichwart 12 + Ermutigung katalogisieren) → 03 (Zahlen + Re-Run-Vermerk) → 01 (Frühling-Schwelle prüfen). Danach Sim-Re-Run.
