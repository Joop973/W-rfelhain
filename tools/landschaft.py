# tools/landschaft.py — prozeduraler Landschafts-Renderer (D6): Böden + Kulissen
# je Region, komplett programmatisch (kohärentes fBm-Value-Noise, atmosphärische
# Tiefenstaffelung, gestaffelte Beleuchtung). Kein KI-Bildmodell — reine Mathe.
# Aufruf: python3 tools/landschaft.py [r2 r3 ...]  → assets/szene/{boden,bg.kulisse}.rN.png
import sys, random, math
sys.path.insert(0, '/home/user/W-rfelhain/tools')
from sprite_freistellen import encode_rgb

ASSETS = '/home/user/W-rfelhain/assets/szene'

# --- kohärentes Value-Noise + fBm -------------------------------------------
def noise_sampler(w, h, gitter, seed):
    rng = random.Random(seed)
    gw = w // gitter + 3; gh = h // gitter + 3
    kn = [[rng.random() for _ in range(gw)] for _ in range(gh)]
    def smooth(t): return t * t * (3 - 2 * t)
    def sample(x, y):
        gx = x / gitter; gy = y / gitter
        x0 = int(gx); y0 = int(gy)
        fx = smooth(gx - x0); fy = smooth(gy - y0)
        v00 = kn[y0][x0]; v10 = kn[y0][x0+1]; v01 = kn[y0+1][x0]; v11 = kn[y0+1][x0+1]
        return (v00*(1-fx)+v10*fx)*(1-fy) + (v01*(1-fx)+v11*fx)*fy
    return sample

def fbm(w, h, seed, oktaven=4, gitter0=64):
    samplers = []; g = gitter0; amp = 1.0; norm = 0.0
    for o in range(oktaven):
        samplers.append((noise_sampler(w, h, max(2, g), seed + o*97), amp))
        norm += amp; g //= 2; amp *= 0.5
    def f(x, y):
        s = 0.0
        for smp, a in samplers: s += smp(x, y) * a
        return s / norm
    return f

def lerp(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))
def rampe_at(rampe, t):
    t = max(0.0, min(0.999, t)); n = len(rampe)-1
    i = int(t*n); f = t*n - i
    return lerp(rampe[i], rampe[i+1], f)
def clampc(c): return tuple(max(0, min(255, int(v))) for v in c)

class Bild:
    def __init__(s, w, h): s.w=w; s.h=h; s.px=bytearray(w*h*3)
    def set(s, x, y, c):
        x=int(x); y=int(y)
        if 0<=x<s.w and 0<=y<s.h:
            o=(y*s.w+x)*3; c=clampc(c); s.px[o]=c[0]; s.px[o+1]=c[1]; s.px[o+2]=c[2]
    def get(s, x, y):
        x=int(max(0,min(s.w-1,x))); y=int(max(0,min(s.h-1,y))); o=(y*s.w+x)*3
        return (s.px[o],s.px[o+1],s.px[o+2])
    def scale(s, f):
        b=Bild(s.w*f, s.h*f)
        for y in range(b.h):
            for x in range(b.w): b.set(x,y,s.get(x//f,y//f))
        return b
    def speichere(s, pfad): open(pfad,'wb').write(encode_rgb(bytes(s.px), s.w, s.h))

# --- Themen je Region -------------------------------------------------------
# erde: Boden-Grundrampe · akzent: Moos/Gras · boden_feat: 'pfuetzen'|'risse'|'platten'
# glut: Glühfarbe (risse) oder None · himmel: (oben,mitte,unten) · baum: Baum-Grundton
# nebel: Dunstfarbe · vibe: Spezial-Flags
THEMEN = {
    'r2': dict(seed=201, name='Moderbruch',
        erde=[(38,34,26),(52,46,32),(66,58,38),(80,72,46),(92,84,54)],
        akzent=[(52,66,40),(70,90,50),(92,116,62)], boden_feat='pfuetzen',
        feat_farbe=[(30,40,36),(44,58,50),(60,78,68)], glut=None,
        himmel=((96,104,86),(138,146,120),(164,168,146)), nebel=(150,158,140),
        baum=(60,58,44), rahmen=(30,32,24), extra='ranken'),
    'r3': dict(seed=303, name='Schwelgrund',
        erde=[(26,22,20),(40,32,28),(58,44,36),(78,58,42),(96,72,50)],
        akzent=[(70,44,30),(96,60,36),(120,76,44)], boden_feat='risse',
        feat_farbe=[(20,16,14)], glut=[(120,50,20),(200,90,28),(255,160,60)],
        himmel=((44,30,26),(96,60,44),(150,100,64)), nebel=(150,110,78),
        baum=(30,24,20), rahmen=(18,14,12), extra='glut'),
    'r4': dict(seed=404, name='Dürrmark',
        erde=[(96,80,52),(122,102,66),(148,124,80),(172,148,98),(196,172,120)],
        akzent=[(150,138,84),(176,162,104),(120,110,66)], boden_feat='risse',
        feat_farbe=[(70,54,34)], glut=None,
        himmel=((176,150,102),(206,182,132),(224,206,160)), nebel=(214,196,150),
        baum=(96,78,50), rahmen=(58,44,28), extra='staub'),
    'r5': dict(seed=505, name='Graupforte',
        erde=[(58,60,64),(78,82,86),(100,104,108),(122,126,130),(146,150,154)],
        akzent=[(88,96,92),(110,118,112),(72,80,78)], boden_feat='platten',
        feat_farbe=[(40,44,48)], glut=None,
        himmel=((92,96,102),(132,138,144),(162,168,174)), nebel=(158,164,170),
        baum=(74,78,82), rahmen=(44,46,50), extra='steinsaeulen'),
    'r6': dict(seed=606, name='Hohles Herz',
        erde=[(24,26,30),(36,38,44),(50,52,60),(64,66,78),(80,84,100)],
        akzent=[(48,54,70),(64,72,92),(38,42,56)], boden_feat='risse',
        feat_farbe=[(12,12,16)], glut=[(40,54,90),(70,92,140),(120,150,210)],
        himmel=((20,22,32),(48,52,72),(84,90,120)), nebel=(96,102,132),
        baum=(20,20,28), rahmen=(10,10,14), extra='fahllicht'),
}

# --- Boden ------------------------------------------------------------------
def boden(thema):
    T = THEMEN[thema]; W, H = 320, 136; b = Bild(W, H); rng = random.Random(T['seed'])
    grob = fbm(W, H, T['seed'], 5, 96); fein = fbm(W, H, T['seed']+50, 4, 20)
    erde = T['erde']; akz = T['akzent']
    for y in range(H):
        for x in range(W):
            g = grob(x,y); fn = fein(x,y); t = g*0.7 + fn*0.3
            col = rampe_at(erde, t)
            if g < 0.42 and fn > 0.45:
                col = lerp(col, rampe_at(akz, fn), min(0.8, (0.42-g)/0.42*1.4))
            licht = 1.0 - (x/W)*0.12 - (y/H)*0.10
            b.set(x, y, tuple(c*licht for c in col))
    feat = T['boden_feat']
    if feat == 'pfuetzen':
        pf = T['feat_farbe']
        for _ in range(7):
            cx=rng.randint(30,W-30); cy=rng.randint(H//2,H-14); rx=rng.randint(18,40); ry=rng.randint(7,13)
            for y in range(cy-ry-2,cy+ry+2):
                for x in range(cx-rx-2,cx+rx+2):
                    nx=(x-cx)/rx; ny=(y-cy)/ry; d=nx*nx+ny*ny
                    if d<=1.0:
                        wc=rampe_at(pf,0.3+fein(x,y)*0.5)
                        if d>0.82: wc=lerp(wc,(96,92,66),0.5)
                        b.set(x,y,wc)
                    elif d<=1.18: b.set(x,y,lerp(b.get(x,y),(60,54,38),0.5))
            for x in range(cx-rx+3,cx+rx-3):
                if rng.random()<0.5: b.set(x,cy-2,lerp(b.get(x,cy-2),(120,140,120),0.4))
    elif feat == 'risse':
        rc = T['feat_farbe'][0]; glut = T['glut']
        # verzweigte Risse (glühend oder trocken)
        for _ in range(11):
            x=rng.randint(10,W-10); y=rng.randint(H//3,H-6); L=rng.randint(30,80); dirx=rng.uniform(-1,1)
            for i in range(L):
                x+=dirx+rng.uniform(-0.6,0.6); y+=rng.choice([0,1,1,0])+rng.uniform(-0.3,0.5)
                b.set(x,y,rc); b.set(x+1,y,rc)
                if glut:  # Glut-/Kaltglut-Kern
                    gt=0.5+0.5*math.sin(i*0.4)
                    b.set(x,y,rampe_at(glut,gt))
                    b.set(x,y-1,lerp(b.get(x,y-1),glut[-1],0.3))
                if rng.random()<0.12: dirx=rng.uniform(-1,1)  # Verzweigung
    elif feat == 'platten':
        rc = T['feat_farbe'][0]
        # Steinplatten mit Fugen (voronoi-artiges Raster + Versatz)
        gz=34
        for gy in range(0,H+gz,gz):
            for gx in range(0,W+gz,gz):
                ox=rng.randint(-6,6); oy=rng.randint(-6,6)
                # Fuge dunkel, Platte leicht heller mit Textur
                for y in range(gy+oy,gy+oy+gz):
                    for x in range(gx+ox,gx+ox+gz):
                        if 0<=x<W and 0<=y<H:
                            rx=(x-(gx+ox))/gz; ry=(y-(gy+oy))/gz
                            if rx<0.08 or ry<0.08 or rx>0.92 or ry>0.92:
                                b.set(x,y,rc)
                            elif rng.random()<0.04:
                                b.set(x,y,lerp(b.get(x,y),rc,0.4))
    # gemeinsame Streu-Details, thematisch eingefärbt
    blattfarben = {'r2':[(94,82,46),(78,68,40),(70,84,46)],'r3':[(60,40,28),(40,28,22),(90,50,26)],
                   'r4':[(150,128,74),(128,108,60),(96,84,48)],'r5':[(96,100,96),(78,82,80),(60,64,64)],
                   'r6':[(50,54,70),(38,42,56),(64,70,92)]}[thema]
    for _ in range(22):
        x=rng.randint(4,W-6); y=rng.randint(H//3,H-4); lc=rng.choice(blattfarben); ang=rng.uniform(0,3.14)
        for t in range(-3,4):
            px=x+int(math.cos(ang)*t); py=y+int(math.sin(ang)*t*0.5)
            b.set(px,py,lc); b.set(px,py+1,lerp(lc,(20,18,14),0.4))
    for _ in range(13):  # Steine/Geröll
        x=rng.randint(4,W-6); y=rng.randint(H//3,H-4); r=rng.randint(2,4)
        for dy in range(-r,r+1):
            for dx in range(-r,r+1):
                if dx*dx+dy*dy<=r*r:
                    hell = lerp(erde[-1],(200,200,200),0.15)
                    b.set(x+dx,y+dy, hell if (dx+dy)<0 else erde[0])
    return b.scale(2)

# --- Kulisse ----------------------------------------------------------------
def baum(b, x0, ybas, hoehe, breite, farbe, aeste, rng, biege=0.0):
    for i in range(hoehe):
        t=i/hoehe; y=ybas-i; bw=max(1,breite*(1-t*0.6)); cx=x0+biege*(t*t)*breite
        for dx in range(int(-bw),int(bw)+1):
            sh=1.0-abs(dx)/(bw+0.5)*0.4-(0.15 if dx>0 else -0.05)
            b.set(cx+dx,y,tuple(c*sh for c in farbe))
    if aeste:
        for _ in range(max(1,int(hoehe/22))):
            ay=ybas-rng.randint(int(hoehe*0.5),int(hoehe*0.92)); ax=x0+biege*breite
            dirx=rng.choice([-1,1]); al=rng.randint(int(breite*3),int(breite*7)); px,py=ax,ay
            for k in range(al):
                px+=dirx*rng.choice([1,1,2]); py-=rng.choice([0,1,1]); aw=max(1,int(breite*0.6*(1-k/al)))
                for dx in range(-aw,aw+1): b.set(px+dx,py,tuple(c*0.85 for c in farbe))

def kulisse(thema):
    T=THEMEN[thema]; W,H=320,228; b=Bild(W,H); rng=random.Random(T['seed']+7)
    dunst=fbm(W,H,T['seed']+7,4,60); oben,mitte,bod=T['himmel']; nf0=T['nebel']
    for y in range(H):
        ty=y/H
        base=lerp(oben,mitte,min(1.0,ty*1.5)) if ty<0.66 else lerp(mitte,bod,(ty-0.66)/0.34)
        for x in range(W):
            d=dunst(x,y); b.set(x,y,lerp(base,(base[0]+18,base[1]+20,base[2]+14),d*0.5))
    def nebelfarbe(y): ty=y/H; return lerp(mitte,bod,max(0,(ty-0.5)/0.5))
    ebenen=[(7,int(H*0.72),(70,110),3,lerp(T['baum'],(160,160,160),0.4),0.68,0.15),
            (6,int(H*0.80),(95,150),5,lerp(T['baum'],(140,140,140),0.15),0.42,0.2),
            (4,int(H*0.90),(130,190),8,T['baum'],0.20,0.25)]
    for anzahl,ybas,(hmin,hmax),breite,gf,verblass,bmax in ebenen:
        for _ in range(anzahl):
            x0=rng.randint(-10,W+10); h=rng.randint(hmin,hmax)
            ff=lerp(gf,nebelfarbe(ybas-h//2),verblass)
            baum(b,x0,ybas,h,breite,ff,verblass<0.5,rng,rng.uniform(-bmax,bmax))
            if verblass<0.45 and T['extra']=='ranken':
                for _ in range(rng.randint(2,5)):
                    mx=x0+rng.randint(-breite,breite); my=ybas-rng.randint(int(h*0.4),int(h*0.85)); ml=rng.randint(6,16)
                    for k in range(ml): b.set(mx+int(math.sin(k*0.5)),my+k,lerp((70,90,50),nebelfarbe(my+k),0.3+k/ml*0.4))
    for x0,bg in ((rng.randint(2,24),0.2),(W-rng.randint(2,24),-0.2)):
        baum(b,x0,H+8,int(H*1.05),12,T['rahmen'],True,rng,bg)
    ex=T['extra']
    if ex=='ranken':
        for _ in range(10):
            x=rng.randint(6,W-6); L=rng.randint(20,70); y=0
            for k in range(L):
                x+=int(math.sin(k*0.3+x)*0.8); y+=1
                b.set(x,y,lerp((60,76,44),nebelfarbe(y),0.4))
    elif ex=='glut':  # aufsteigende Glut + Rauchschwaden
        for _ in range(60): b.set(rng.randint(0,W-1),rng.randint(int(H*0.4),H-1),rng.choice([(220,120,40),(255,180,80),(180,70,24)]))
        for _ in range(6):
            ny=rng.randint(int(H*0.2),int(H*0.7)); dick=rng.randint(6,14)
            for y in range(ny,ny+dick):
                a=(1-abs(y-(ny+dick/2))/(dick/2))*0.4
                for x in range(W):
                    if dunst(x,y)>0.45: b.set(x,y,lerp(b.get(x,y),(60,50,46),a))
    elif ex=='staub':  # tiefstehende Sonne + Staubschleier
        sx,sy=rng.randint(W//4,W*3//4),int(H*0.3)
        for y in range(H):
            for x in range(W):
                dd=((x-sx)**2+(y-sy)**2)**0.5
                if dd<70: b.set(x,y,lerp(b.get(x,y),(255,232,170),max(0,(70-dd)/70)*0.5))
    elif ex=='steinsaeulen':  # Ruinen-Säulen als Silhouetten
        for _ in range(5):
            x0=rng.randint(20,W-20); h=rng.randint(60,120); w=rng.randint(6,11)
            for y in range(H-h,H):
                for dx in range(-w,w+1): b.set(x0+dx,y,lerp(T['rahmen'],(90,94,98),0.2))
    elif ex=='fahllicht':  # fahler Mond/Riss am Himmel
        mx,my=rng.randint(W//4,W*3//4),int(H*0.25)
        for y in range(H):
            for x in range(W):
                dd=((x-mx)**2+(y-my)**2)**0.5
                if dd<50: b.set(x,y,lerp(b.get(x,y),(150,160,200),max(0,(50-dd)/50)*0.6))
    # Nebelbänder + Bodennebel (gemeinsam)
    for _ in range(5):
        ny=rng.randint(int(H*0.35),int(H*0.8)); dick=rng.randint(4,10)
        for y in range(ny,ny+dick):
            a=(1-abs(y-(ny+dick/2))/(dick/2))*0.32
            for x in range(W):
                if dunst(x,y)>0.4: b.set(x,y,lerp(b.get(x,y),lerp(nf0,(255,255,255),0.2),a*dunst(x,y)))
    for y in range(int(H*0.82),H):
        a=(y-H*0.82)/(H*0.18)*0.5
        for x in range(W): b.set(x,y,lerp(b.get(x,y),lerp(nf0,(255,255,255),0.05),a))
    return b.scale(2)

if __name__ == '__main__':
    import os; os.makedirs(ASSETS, exist_ok=True)
    regionen = sys.argv[1:] or list(THEMEN.keys())
    for r in regionen:
        boden(r).speichere(f'{ASSETS}/boden.{r}.png')
        kulisse(r).speichere(f'{ASSETS}/bg.kulisse.{r}.png')
        print(f'{r} ({THEMEN[r]["name"]}): boden + kulisse gerendert')
