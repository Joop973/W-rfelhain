# tools/pixel_maler.py — eigener Pixel-Art-Maler (D6): erzeugt Sprites rein
# programmatisch, ohne Vorlage. Native Kleinauflösung (scharfe Pixel), dann
# ganzzahlig nearest-hochskaliert. Licht kommt oben links (08-Konvention),
# dunkle Kontur, kein Anti-Aliasing. Nutzt den RGBA-Encoder aus sprite_freistellen.
import sys, math, random
sys.path.insert(0, '/home/user/W-rfelhain/tools')
from sprite_freistellen import encode_rgba, encode_rgb, composite_over

class Canvas:
    def __init__(self, w, h):
        self.w = w; self.h = h
        self.px = bytearray(w * h * 4)  # RGBA, alles transparent

    def set(self, x, y, rgba):
        x = int(round(x)); y = int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h:
            o = (y * self.w + x) * 4
            r, g, b = rgba[0], rgba[1], rgba[2]
            a = rgba[3] if len(rgba) > 3 else 255
            self.px[o] = int(r) & 255; self.px[o+1] = int(g) & 255
            self.px[o+2] = int(b) & 255; self.px[o+3] = int(a) & 255

    def get(self, x, y):
        x = int(x); y = int(y)
        if 0 <= x < self.w and 0 <= y < self.h:
            o = (y * self.w + x) * 4
            s = self.px[o:o+4]
            if len(s) == 4:
                return tuple(s)
        return (0, 0, 0, 0)

    def opaque(self, x, y):
        return self.get(x, y)[3] > 0

    # Gefüllte Ellipse mit Kugel-Schattierung: Grundfarbe, Highlight oben-links,
    # Schatten unten-rechts. lightdir wählt die Highlight-Ecke.
    def ellipse_shaded(self, cx, cy, rx, ry, base, hi, sh, lx=-0.5, ly=-0.6):
        for y in range(int(cy - ry - 1), int(cy + ry + 2)):
            for x in range(int(cx - rx - 1), int(cx + rx + 2)):
                nx = (x - cx) / max(rx, 0.5)
                ny = (y - cy) / max(ry, 0.5)
                d = nx * nx + ny * ny
                if d <= 1.0:
                    # Lichtwert: Skalarprodukt der Flächennormale mit Lichtrichtung
                    lv = -(nx * lx + ny * ly)
                    if lv > 0.45: col = hi
                    elif lv < -0.35: col = sh
                    else: col = base
                    self.set(x, y, (*col, 255))

    # Volumetrische Ellipse mit N-Stufen-Farbrampe (dunkel→hell) und Bayer-
    # Dithering an den Bandgrenzen — der Schlüssel zu „rundem" Pixel-Art-Look.
    _BAYER8 = [[0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],[12,44,4,36,14,46,6,38],
               [60,28,52,20,62,30,54,22],[3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],
               [15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]]

    def ellipse_rampe(self, cx, cy, rx, ry, rampe, lx=-0.55, ly=-0.62, dither=True, wobble=0.0):
        n = len(rampe); B = self._BAYER8
        for y in range(int(cy - ry - 1), int(cy + ry + 2)):
            for x in range(int(cx - rx - 1), int(cx + rx + 2)):
                nx = (x - cx) / max(rx, 0.5); ny = (y - cy) / max(ry, 0.5)
                d = nx*nx + ny*ny
                if d > 1.0: continue
                nz = math.sqrt(max(0.0, 1.0 - d))  # Kugelnormale z
                lv = (-(nx*lx) - (ny*ly)) * 0.7 + nz * 0.5
                t = max(0.0, min(0.999, (lv + 0.5)))
                fi = t * (n - 1)
                idx = int(fi); frac = fi - idx
                if dither and idx < n - 1 and B[y & 7][x & 7] / 64.0 < frac:
                    idx += 1
                self.set(x, y, (*rampe[idx], 255))

    def circle_fill(self, cx, cy, r, col):
        for y in range(int(cy - r - 1), int(cy + r + 2)):
            for x in range(int(cx - r - 1), int(cx + r + 2)):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                    self.set(x, y, (*col, 255))

    def rect(self, x0, y0, x1, y1, col):
        for y in range(int(y0), int(y1) + 1):
            for x in range(int(x0), int(x1) + 1):
                self.set(x, y, (*col, 255))

    def line(self, x0, y0, x1, y1, col, dick=1, clip=False):
        # clip=True: nur auf bereits opake Pixel malen (Binnendetail bleibt in der Silhouette)
        x0, y0, x1, y1 = map(float, (x0, y0, x1, y1))
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for i in range(n + 1):
            t = i / max(n, 1)
            x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t
            for dy in range(dick):
                for dx in range(dick):
                    if not clip or self.opaque(x + dx, y + dy):
                        self.set(x + dx, y + dy, (*col, 255))

    # Kegelstumpf/„Wurst" zwischen zwei Punkten mit Radien (Gliedmaßen, Tentakel).
    # rampe: 3er-Rampe [schatten, base, licht] — Licht sitzt auf der linken Flanke.
    def taper(self, x0, y0, r0, x1, y1, r1, base, hi=None, sh=None, rampe=None):
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for i in range(n + 1):
            t = i / max(n, 1)
            x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t
            r = r0 + (r1 - r0) * t
            for yy in range(int(y - r - 1), int(y + r + 2)):
                for xx in range(int(x - r - 1), int(x + r + 2)):
                    dd = (xx - x) ** 2 + (yy - y) ** 2
                    if dd > r * r: continue
                    seite = (xx - x) / max(r, 0.5)  # -1 links .. +1 rechts
                    if rampe:
                        k = 0 if seite > 0.35 else (2 if seite < -0.35 else 1)
                        self.set(xx, yy, (*rampe[k], 255))
                    elif hi and seite < -0.3:
                        self.set(xx, yy, (*hi, 255))
                    elif sh and seite > 0.3:
                        self.set(xx, yy, (*sh, 255))
                    else:
                        self.set(xx, yy, (*base, 255))

    # Streu-Textur: setzt `col` mit Wahrscheinlichkeit p auf bereits opake Pixel
    # in einer Ellipsen-Region (Moos/Flecken/Sporen).
    def sprenkel(self, cx, cy, rx, ry, col, p, rng):
        for y in range(int(cy - ry), int(cy + ry + 1)):
            for x in range(int(cx - rx), int(cx + rx + 1)):
                nx = (x - cx) / max(rx, 0.5); ny = (y - cy) / max(ry, 0.5)
                if nx * nx + ny * ny <= 1.0 and self.opaque(x, y) and rng.random() < p:
                    self.set(x, y, (*col, 255))

    def augen(self, x, y, abstand, r, weiss=(232, 236, 224), pupille=(24, 20, 30), glanz=(255, 255, 255)):
        for sx in (x - abstand, x + abstand):
            self.circle_fill(sx, y, r, weiss)
            self.circle_fill(sx + 0.3, y + 0.4, max(1, r - 1), pupille)
            self.set(sx - r * 0.4, y - r * 0.4, (*glanz, 255))

    # --- Handgemalt-Look: Cel-Shading über Metaball-Körper ---------------------
    # balls: [(cx,cy,rx,ry,gewicht)]. Rendert eine organische Silhouette mit
    # HARTEN Shading-Bändern (kein Dithering), Wölbung aus dem Feld-Wert. Der
    # Aufrufer legt danach Kantenlicht/Kernschatten/Detail drüber.
    def koerper_cel(self, balls, rampe, lx=-0.62, ly=-0.72, schwelle=1.0, glanz_t=0.9):
        W, H, n = self.w, self.h, len(rampe)
        feld = [0.0] * (W * H)
        for (cx, cy, rx, ry, w) in balls:
            for y in range(max(0,int(cy-ry-3)), min(H,int(cy+ry+4))):
                for x in range(max(0,int(cx-rx-3)), min(W,int(cx+rx+4))):
                    nx = (x-cx)/rx; ny = (y-cy)/ry
                    d = nx*nx + ny*ny
                    if d < 3.2:
                        feld[y*W+x] += w * math.exp(-d*1.05)
        self._feld = feld  # für Folge-Operationen (Binnenkontur)
        for y in range(H):
            for x in range(W):
                f = feld[y*W+x]
                if f < schwelle: continue
                h = min(1.0, (f-schwelle)*1.15 + 0.18)      # Wölbungshöhe
                nz = math.sqrt(max(0.05, h))
                fx = feld[y*W+min(W-1,x+1)] - feld[y*W+max(0,x-1)]
                fy = feld[min(H-1,y+1)*W+x] - feld[max(0,y-1)*W+x]
                gl = math.hypot(fx, fy) + 1e-5
                gnx, gny = -fx/gl, -fy/gl                    # Oberflächennormale xy
                slope = 1.0 - h
                lv = (gnx*lx + gny*ly)*slope + nz*0.55
                t = max(0.0, min(0.999, lv*glanz_t + 0.16))
                self.set(x, y, (*rampe[int(t*(n-1))], 255))  # HART, kein Dither

    # Harte helle Kantenlinie auf der Lichtseite (volle Highlight-Farbe → knackig).
    # y_max/x-box begrenzt den Bereich (z. B. nur der Körper, nicht die Gliedmaßen).
    def kantenlicht(self, col, lx=-1, ly=-1, y_min=0, y_max=None, x_min=0, x_max=None):
        y_max = self.h if y_max is None else y_max
        x_max = self.w if x_max is None else x_max
        tr = []
        for y in range(max(0,y_min), min(self.h,y_max)):
            for x in range(max(0,x_min), min(self.w,x_max)):
                if not self.opaque(x, y): continue
                if not (self.opaque(x+lx, y) and self.opaque(x, y+ly) and self.opaque(x+lx, y+ly)):
                    tr.append((x, y))
        for x, y in tr:
            self.set(x, y, (*col, 255))

    # Kernschatten-Linie an inneren „Tälern" des Metaball-Feldes (wo Teilformen
    # sich treffen) — die dunklen Trennlinien handgemalter Sprites.
    def binnenkontur(self, col, tief=0.55):
        if not hasattr(self, '_feld'): return
        W, H, f = self.w, self.h, self._feld
        tr = []
        for y in range(1, H-1):
            for x in range(1, W-1):
                if not self.opaque(x, y): continue
                c0 = f[y*W+x]
                # lokales Minimum in einer Richtung + genug „innen" → Sattel
                lap = (f[y*W+x-1]+f[y*W+x+1]+f[(y-1)*W+x]+f[(y+1)*W+x]) - 4*c0
                if lap > tief and c0 > 1.0:
                    tr.append((x, y))
        for x, y in tr:
            r,g,b,a = self.get(x,y); self.set(x, y, (int(r*0.62), int(g*0.62), int(b*0.62)))

    # Kontakt-/Bodenschatten: unterste ~3 Zeilen der Silhouette abdunkeln.
    def kontaktschatten(self, faktor=0.7):
        for x in range(self.w):
            tiefste = -1
            for y in range(self.h-1, -1, -1):
                if self.opaque(x, y): tiefste = y; break
            if tiefste < 0: continue
            for y in range(max(0,tiefste-2), tiefste+1):
                if self.opaque(x, y):
                    r,g,b,a=self.get(x,y); self.set(x,y,(int(r*faktor),int(g*faktor),int(b*faktor)))

    # Rim-Light: heller Saum auf der Lichtseite (oben-links) — lässt Sprites
    # „poppen". Setzt col auf opake Pixel, die zur Lichtseite hin an Transparenz
    # grenzen. staerke = wie tief der Saum reicht.
    def rim_light(self, col, lx=-1, ly=-1, staerke=1):
        treffer = []
        for y in range(self.h):
            for x in range(self.w):
                if not self.opaque(x, y): continue
                # Blick Richtung Licht: ist dort (in 1..staerke) Leere?
                for s in range(1, staerke + 1):
                    if not self.opaque(x + lx*s, y + ly*s) or \
                       not self.opaque(x + lx*s, y) or not self.opaque(x, y + ly*s):
                        treffer.append((x, y)); break
        for x, y in treffer:
            r, g, b, a = self.get(x, y)
            self.set(x, y, (min(255,(r+col[0])//2+18), min(255,(g+col[1])//2+18), min(255,(b+col[2])//2+18)))

    # Innere Ambient Occlusion: dunkelt Pixel nahe der Schattenseiten-Kante
    # (unten-rechts) ab — Erdung, Volumen.
    def innen_ao(self, faktor=0.72, lx=1, ly=1, tiefe=2):
        treffer = []
        for y in range(self.h):
            for x in range(self.w):
                if not self.opaque(x, y): continue
                for s in range(1, tiefe + 1):
                    if not self.opaque(x + lx*s, y + ly*s):
                        treffer.append((x, y, s)); break
        for x, y, s in treffer:
            r, g, b, a = self.get(x, y)
            f = faktor + (1 - faktor) * (s - 1) / max(1, tiefe)
            self.set(x, y, (int(r*f), int(g*f), int(b*f)))

    # Gerichteter Farbverlauf über eine Form (schon gemalte opake Pixel), von
    # oben (hell) nach unten (dunkel) — feines Zusatz-Shading via 8×8-Bayer.
    def vertikal_schattung(self, cx, cy, rx, ry, rampe):
        n = len(rampe)
        B = [[0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],[12,44,4,36,14,46,6,38],
             [60,28,52,20,62,30,54,22],[3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],
             [15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]]
        for y in range(int(cy-ry), int(cy+ry+1)):
            for x in range(int(cx-rx), int(cx+rx+1)):
                if not self.opaque(x, y): continue
                t = (y - (cy-ry)) / max(1, 2*ry)
                fi = t*(n-1); idx = int(fi); frac = fi-idx
                if idx < n-1 and B[y&7][x&7]/64.0 < frac: idx += 1
                self.set(x, y, (*rampe[idx], 255))

    # Dunkle Kontur um die Silhouette (jeder transparente Pixel neben opakem).
    def outline(self, col=(26, 18, 12), diag=True):
        rand = []
        nb = [(-1,0),(1,0),(0,-1),(0,1)]
        if diag: nb += [(-1,-1),(1,-1),(-1,1),(1,1)]
        for y in range(self.h):
            for x in range(self.w):
                if not self.opaque(x, y):
                    if any(self.opaque(x+dx, y+dy) for dx, dy in nb):
                        rand.append((x, y))
        for x, y in rand:
            self.set(x, y, (*col, 255))

    # Sanfter Schlagschatten-Kern innen unten (Erdung, optional).
    def bodenschatten(self):
        pass

    def scale(self, faktor):
        w2, h2 = self.w * faktor, self.h * faktor
        out = Canvas(w2, h2)
        for y in range(h2):
            for x in range(w2):
                out.px[(y*w2+x)*4:(y*w2+x)*4+4] = bytes(self.get(x//faktor, y//faktor))
        return out

    def speichere_rgba(self, pfad):
        open(pfad, 'wb').write(encode_rgba(bytes(self.px), self.w, self.h))

    def speichere_magenta(self, pfad):
        comp = composite_over(bytes(self.px), self.w, self.h, (255, 0, 255))
        open(pfad, 'wb').write(encode_rgb(comp, self.w, self.h))
