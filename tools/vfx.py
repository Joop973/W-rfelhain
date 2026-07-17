# tools/vfx.py — prozeduraler VFX-Renderer (D6, Artefakt 11 §10): erzeugt die
# Effekt-Sprite-Sheets (horizontale Frame-Streifen) komplett programmatisch
# (Partikel/Glüh-Mathematik, transparenter Hintergrund). Kein KI-Bildmodell.
# Aufruf: python3 tools/vfx.py  → assets/fx/fx.*.png  (+ .gif-Vorschau falls PIL)
import sys, math, random
sys.path.insert(0, '/home/user/W-rfelhain/tools')
from pixel_maler import Canvas
from sprite_freistellen import encode_rgba
OUT = '/home/user/W-rfelhain/assets/fx'
import os; os.makedirs(OUT, exist_ok=True)

TAU=(127,183,196); PERG=(232,220,192); GLUT=(200,85,46); LAUB=(106,143,60)
FROST=(176,196,214); HELL=(245,250,255)

def blend(c, x, y, col, a):
    r0,g0,b0,a0 = c.get(x,y)
    if a<=0: return
    a=min(1,a); nr=int(col[0]*a+r0*(1-a)); ng=int(col[1]*a+g0*(1-a)); nb=int(col[2]*a+b0*(1-a))
    c.set(x,y,(nr,ng,nb,max(a0,int(a*255))))

def ring(c, cx, cy, r, col, a, dick=1):
    if r<0.5: return
    steps=int(2*math.pi*r)+8
    for i in range(steps):
        ang=i/steps*2*math.pi
        for dd in range(dick):
            blend(c, cx+math.cos(ang)*(r+dd), cy+math.sin(ang)*(r+dd), col, a)

def scheibe(c, cx, cy, r, col, a):
    for y in range(int(cy-r-1),int(cy+r+2)):
        for x in range(int(cx-r-1),int(cx+r+2)):
            d=math.hypot(x-cx,y-cy)
            if d<=r: blend(c,x,y,col,a*(1-0.15*(d/max(r,1))))

def funken(c, cx, cy, col, a, gr=1.4):
    for dx,dy in ((0,0),(-1,0),(1,0),(0,-1),(0,1)):
        blend(c,cx+dx,cy+dy,col,a*(1 if dx==0 and dy==0 else 0.6))
    if gr>1.2:
        for dx,dy in ((-2,0),(2,0),(0,-2),(0,2)): blend(c,cx+dx,cy+dy,col,a*0.4)

def sheet(frames):
    w=frames[0].w; h=frames[0].h; s=Canvas(w*len(frames),h)
    for i,f in enumerate(frames):
        for y in range(h):
            for x in range(w): s.set(i*w+x,y,f.get(x,y))
    return s

# --- Effekte ----------------------------------------------------------------
def vollmond():
    N=8; fs=[]
    for i in range(N):
        t=i/(N-1); c=Canvas(64,64); cx=cy=32
        # Mond fadet ein (0..0.5), bleibt, verblasst leicht
        ma = min(1, t*3) * (1 - max(0,(t-0.7))*1.5)
        scheibe(c,cx,cy,13,PERG,ma*0.95); scheibe(c,cx,cy,13,HELL,ma*0.4)
        ring(c,cx,cy,13,TAU,ma*0.7,1)
        # heller Ring expandiert 0.15..0.85
        rt=(t-0.15)/0.7
        if 0<rt<1:
            ring(c,cx,cy,6+rt*24, TAU, (1-rt)*0.8, 2)
            ring(c,cx,cy,6+rt*24, HELL, (1-rt)*0.4, 1)
        # 4 Funkeln erscheinen spät
        if t>0.55:
            fa=(t-0.55)/0.45*(1-max(0,(t-0.85))*3)
            for ang in (0.6,2.2,3.8,5.4):
                fx=cx+math.cos(ang)*22; fy=cy+math.sin(ang)*22
                funken(c,fx,fy,HELL,fa,1.5)
        fs.append(c)
    return fs

def kristallisation():
    N=6; fs=[]
    for i in range(N):
        t=i/(N-1); c=Canvas(32,32); cx=cy=16
        # Frost-Nadeln von 4 Ecken zur Mitte
        L=t*13
        for ex,ey in ((3,3),(28,3),(3,28),(28,28)):
            dx=cx-ex; dy=cy-ey; d=math.hypot(dx,dy); ux,uy=dx/d,dy/d
            for k in range(int(L)):
                px=ex+ux*k; py=ey+uy*k
                sha=0.5+0.5*(k/max(L,1))
                blend(c,px,py,FROST,0.85); blend(c,px+uy*0.6,py-ux*0.6,HELL,0.4*sha)
                if k%3==0: blend(c,px+uy*1.6,py-ux*1.6,FROST,0.5)  # Seitenzacke
        # finaler Glint
        if t>0.82:
            funken(c,cx,cy,HELL,(t-0.82)/0.18,1.6); scheibe(c,cx,cy,2,FROST,0.8)
        fs.append(c)
    return fs

def troesten():
    N=6; fs=[]
    for i in range(N):
        t=i/(N-1); c=Canvas(32,32); cx=cy=16
        # weicher Tau-Ring pulst einmal aus
        ring(c,cx,cy,2+t*12, TAU, (1-t)*0.85, 2)
        ring(c,cx,cy,2+t*12, PERG, (1-t)*0.4, 1)
        # zwei warme Funken steigen
        for off in (-5,5):
            fy=22-t*16; fa=math.sin(min(1,t*1.1)*math.pi)
            funken(c,cx+off,fy,PERG,fa*0.9,1.3); blend(c,cx+off,fy,HELL,fa*0.6)
        fs.append(c)
    return fs

def treffer():
    N=4; fs=[]; rng=random.Random(7)
    dirs=[(-1,-0.6),(1,-0.3),(0.3,1)]
    for i in range(N):
        t=i/(N-1); c=Canvas(32,32); cx=cy=16
        # Kerb-Blitz (früh)
        if t<0.5:
            fa=1-t*2
            for k in range(-8,9):
                blend(c,cx+k,cy-k*0.5,HELL,fa); blend(c,cx+k,cy-k*0.5+1,GLUT,fa*0.8)
        # 3 Splitter fliegen
        for (dx,dy) in dirs:
            px=cx+dx*t*13; py=cy+dy*t*13; sa=1-t
            blend(c,px,py,GLUT,sa); blend(c,px+dx,py+dy,PERG,sa*0.7)
        fs.append(c)
    return fs

def heilung_tau():
    N=6; fs=[]
    for i in range(N):
        t=i/(N-1); c=Canvas(32,32); cx=16
        if t<0.5:  # Tropfen fällt
            dy=4+t*2*18
            scheibe(c,cx,dy,2,TAU,0.9); blend(c,cx,dy-2,HELL,0.7); blend(c,cx,dy+2,TAU,0.6)
        else:  # spritzt + grüner Schimmer
            st=(t-0.5)/0.5
            ring(c,cx,26,2+st*10,TAU,(1-st)*0.8,1)
            for off in (-4,4,-2,2):
                blend(c,cx+off,26-st*5,TAU,(1-st)*0.7)
            scheibe(c,cx,24,3+st*6,LAUB,(1-st)*0.35)
        fs.append(c)
    return fs

def tischsturz():
    N=10; fs=[]; rng=random.Random(3)
    # 4 Würfel: start auf dem Tisch, kippen und springen zum Vorderrand
    wuerfel=[(60,54),(104,50),(150,56),(186,52)]
    holz=(150,110,66); holzd=(96,68,40); pip=(40,28,18); staub=(200,190,170)
    for i in range(N):
        t=i/(N-1); c=Canvas(224,96)
        # Tischkante (ruckelt in den ersten Frames)
        ruck = math.sin(t*20)* (3 if t<0.25 else 0)
        for x in range(0,224):
            for y in range(70,74):
                blend(c,x+ruck,y,holzd if y>71 else holz,1.0)
        # Würfel kippen/springen mit Rotation
        for wi,(wx,wy) in enumerate(wuerfel):
            tt=max(0,min(1,(t-wi*0.05)*1.3))
            # Parabel-Sprung nach vorn-unten + Rotation
            px=wx+tt*tt*18*(1 if wi%2 else -1)+ruck
            py=wy - math.sin(tt*math.pi)*22 + tt*tt*40
            rot=tt*6.0
            # Würfelkörper (rotierendes Quadrat, ~12px)
            for a in range(4):
                ang=rot+a*math.pi/2
                for b_ in range(4):
                    ang2=rot+b_*math.pi/2
                    cxp=px+math.cos(ang)*7; cyp=py+math.sin(ang)*7
                    for k in range(8):
                        ex=px+math.cos(ang)*7*(k/8)+math.cos(ang2)*7*0
            # einfacher: gefülltes rotiertes Quadrat
            for dy in range(-7,8):
                for dx in range(-7,8):
                    rx=dx*math.cos(rot)-dy*math.sin(rot); ry=dx*math.sin(rot)+dy*math.cos(rot)
                    if abs(rx)<=6 and abs(ry)<=6:
                        shade = holz if (rx-ry)<0 else holzd
                        blend(c,px+dx,py+dy,shade,1.0)
            # ein paar Pips
            blend(c,px,py,pip,1.0); blend(c,px-3,py-3,pip,1.0); blend(c,px+3,py+3,pip,1.0)
        # Staubwölkchen am Vorderrand
        if t>0.3:
            for _ in range(int((t-0.3)*40)):
                sx=rng.randint(40,200); sy=rng.randint(74,92)
                blend(c,sx,sy,staub,(1-t)*0.5*rng.random())
        fs.append(c)
    return fs

EFFEKTE={'fx.vollmond':vollmond,'fx.kristallisation':kristallisation,'fx.troesten':troesten,
         'fx.treffer':treffer,'fx.heilung_tau':heilung_tau,'fx.tischsturz':tischsturz}

if __name__=='__main__':
    try:
        from PIL import Image
        _pil=True
    except Exception:
        _pil=False
    for name,fn in EFFEKTE.items():
        frames=fn(); s=sheet(frames)
        open(f'{OUT}/{name}.png','wb').write(encode_rgba(bytes(s.px),s.w,s.h))
        if _pil:
            gifs=[]
            for f in frames:
                im=Image.new('RGB',(f.w,f.h),(46,44,52))
                fim=Image.frombytes('RGBA',(f.w,f.h),bytes(f.px)); im.paste(fim,(0,0),fim)
                gifs.append(im.resize((f.w*4,f.h*4),Image.NEAREST))
            gifs[0].save(f'{OUT}/{name}.gif',save_all=True,append_images=gifs[1:],duration=90,loop=0,disposal=2)
        print(name,'→',s.w,'x',s.h,f'({len(frames)}F)')
