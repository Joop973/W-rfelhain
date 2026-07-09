# tools/sprite_freistellen.py — Sprite-Freistellung ohne PIL (D6).
# Aufruf: python3 tools/sprite_freistellen.py <bild.png> <zielpx> <tol> <ausgabeordner> <name>
# Erzeugt <name>.rgba.png (transparent) + Sicht-Komposite. Befund: docs/Sprite_Freistellung_Befund.md
# Sprite-Aufbereitung ohne PIL, v2: Referenzfarben-Flood + groesste Komponente.
import struct, zlib, os
from collections import deque, Counter

def read_png(path):
    d=open(path,'rb').read(); assert d[:8]==b'\x89PNG\r\n\x1a\n'
    off=8; W=H=bd=ct=None; idat=b''
    while off<len(d):
        ln=struct.unpack('>I',d[off:off+4])[0]; typ=d[off+4:off+8]; ch=d[off+8:off+8+ln]
        if typ==b'IHDR': W,H,bd,ct=struct.unpack('>IIBB',ch[:10])
        elif typ==b'IDAT': idat+=ch
        elif typ==b'IEND': break
        off+=12+ln
    return W,H,bd,ct,idat

def decode_rgb(W,H,ct,idat):
    ch={0:1,2:3,3:1,4:2,6:4}[ct]; raw=zlib.decompress(idat); stride=W*ch
    out=bytearray(); prev=bytearray(stride); p=0
    def paeth(a,b,c):
        pp=a+b-c; pa=abs(pp-a); pb=abs(pp-b); pc=abs(pp-c)
        return a if pa<=pb and pa<=pc else (b if pb<=pc else c)
    for y in range(H):
        f=raw[p]; p+=1; line=bytearray(raw[p:p+stride]); p+=stride
        for i in range(stride):
            a=line[i-ch] if i>=ch else 0; b=prev[i]; c=prev[i-ch] if i>=ch else 0; x=line[i]
            if f==1: line[i]=(x+a)&255
            elif f==2: line[i]=(x+b)&255
            elif f==3: line[i]=(x+((a+b)>>1))&255
            elif f==4: line[i]=(x+paeth(a,b,c))&255
        out+=line; prev=line
    if ch==3: return out
    rgb=bytearray(W*H*3)
    for i in range(W*H):
        if ch==4: rgb[i*3:i*3+3]=out[i*4:i*4+3]
        elif ch in (1,2): v=out[i*ch]; rgb[i*3]=rgb[i*3+1]=rgb[i*3+2]=v
    return rgb

def refs_from_border(rgb,W,H,k=6):
    c=Counter()
    def add(x,y):
        o=(y*W+x)*3; c[(rgb[o]>>4,rgb[o+1]>>4,rgb[o+2]>>4)]+=1
    for x in range(0,W,2): add(x,0); add(x,H-1)
    for y in range(0,H,2): add(0,y); add(W-1,y)
    return [ (r*16+8,g*16+8,b*16+8) for (r,g,b),_ in c.most_common(k) ]

def flood_bg(rgb,W,H,refs,tol):
    bg=bytearray(W*H); dq=deque()
    def isbg(o):
        r,g,b=rgb[o],rgb[o+1],rgb[o+2]
        for rr,gg,bb in refs:
            if abs(r-rr)+abs(g-gg)+abs(b-bb)<=tol: return True
        return False
    def push(x,y):
        i=y*W+x
        if not bg[i] and isbg(i*3): bg[i]=1; dq.append((x,y))
    for x in range(W): push(x,0); push(x,H-1)
    for y in range(H): push(0,y); push(W-1,y)
    while dq:
        x,y=dq.popleft()
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny=x+dx,y+dy
            if 0<=nx<W and 0<=ny<H:
                j=ny*W+nx
                if not bg[j] and isbg(j*3): bg[j]=1; dq.append((nx,ny))
    return bg

def kill_enclosed(rgb,bg,W,H,refs,tol_inner):
    # Markiere zusaetzlich JEDE bg-farbige Insel (auch eingeschlossen), streng.
    for i in range(W*H):
        if bg[i]: continue
        o=i*3; r,g,b=rgb[o],rgb[o+1],rgb[o+2]
        for rr,gg,bb in refs:
            if abs(r-rr)+abs(g-gg)+abs(b-bb)<=tol_inner: bg[i]=1; break
    return bg

def largest_component(bg,W,H):
    # groesste 4-zusammenhaengende Vordergrund-Komponente -> Maske keep[]
    keep=bytearray(W*H); seen=bytearray(W*H); best=[]; bestn=0
    for sy in range(H):
        for sx in range(W):
            i0=sy*W+sx
            if bg[i0] or seen[i0]: continue
            comp=[]; dq=deque([(sx,sy)]); seen[i0]=1
            while dq:
                x,y=dq.popleft(); comp.append(y*W+x)
                for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    nx,ny=x+dx,y+dy
                    if 0<=nx<W and 0<=ny<H:
                        j=ny*W+nx
                        if not bg[j] and not seen[j]: seen[j]=1; dq.append((nx,ny))
            if len(comp)>bestn: bestn=len(comp); best=comp
    for i in best: keep[i]=1
    return keep,bestn

def bbox(keep,W,H):
    x0,y0,x1,y1=W,H,-1,-1
    for y in range(H):
        row=y*W
        for x in range(W):
            if keep[row+x]:
                if x<x0:x0=x
                if x>x1:x1=x
                if y<y0:y0=y
                if y>y1:y1=y
    return x0,y0,x1,y1

def downscale(rgb,keep,W,H,box,target,marginfrac=0.06):
    x0,y0,x1,y1=box; bw=x1-x0+1; bh=y1-y0+1
    side=max(bw,bh); m=int(side*marginfrac); side+=2*m
    ox=x0-(side-bw)//2; oy=y0-(side-bh)//2
    T=target; out=bytearray(T*T*4)
    for ty in range(T):
        sy0=oy+ty*side//T; sy1=oy+(ty+1)*side//T
        if sy1<=sy0: sy1=sy0+1
        for tx in range(T):
            sx0=ox+tx*side//T; sx1=ox+(tx+1)*side//T
            if sx1<=sx0: sx1=sx0+1
            ar=ag=ab=aa=n=0
            for sy in range(sy0,sy1):
                inb_y = 0<=sy<H
                for sx in range(sx0,sx1):
                    n+=1
                    if not inb_y or sx<0 or sx>=W: continue
                    i=sy*W+sx
                    if not keep[i]: continue
                    p=i*3; ar+=rgb[p]; ag+=rgb[p+1]; ab+=rgb[p+2]; aa+=1
            o=(ty*T+tx)*4
            if aa==0: out[o:o+4]=b'\x00\x00\x00\x00'
            else:
                out[o]=ar//aa; out[o+1]=ag//aa; out[o+2]=ab//aa; out[o+3]=int(255*aa/n)
    return out

def _chunk(typ,data):
    return struct.pack('>I',len(data))+typ+data+struct.pack('>I',zlib.crc32(typ+data)&0xffffffff)
def encode_rgba(px,W,H):
    raw=bytearray()
    for y in range(H): raw.append(0); raw+=px[y*W*4:(y+1)*W*4]
    return b'\x89PNG\r\n\x1a\n'+_chunk(b'IHDR',struct.pack('>IIBBBBB',W,H,8,6,0,0,0))+_chunk(b'IDAT',zlib.compress(bytes(raw),9))+_chunk(b'IEND',b'')
def encode_rgb(px,W,H):
    raw=bytearray()
    for y in range(H): raw.append(0); raw+=px[y*W*3:(y+1)*W*3]
    return b'\x89PNG\r\n\x1a\n'+_chunk(b'IHDR',struct.pack('>IIBBBBB',W,H,8,2,0,0,0))+_chunk(b'IDAT',zlib.compress(bytes(raw),9))+_chunk(b'IEND',b'')
def composite_over(px,W,H,bgcol):
    out=bytearray(W*H*3)
    for i in range(W*H):
        a=px[i*4+3]/255
        for c in range(3): out[i*3+c]=int(px[i*4+c]*a+bgcol[c]*(1-a))
    return out

def process(inp,target,tol,verify_dir=None,name=None,krefs=6,tol_inner=44):
    W,H,bd,ct,idat=read_png(inp); rgb=decode_rgb(W,H,ct,idat)
    refs=refs_from_border(rgb,W,H,krefs)
    bg=flood_bg(rgb,W,H,refs,tol)
    bg=kill_enclosed(rgb,bg,W,H,refs,tol_inner)
    keep,nkeep=largest_component(bg,W,H)
    box=bbox(keep,W,H)
    if box[2]<0: return None,"leer",refs
    px=downscale(rgb,keep,W,H,box,target)
    if verify_dir:
        for tag,col in (("mag",(255,0,255)),("wht",(245,245,240)),("drk",(30,30,34))):
            comp=composite_over(px,target,target,col)
            open(os.path.join(verify_dir,f"{name}.{tag}.png"),'wb').write(encode_rgb(comp,target,target))
        open(os.path.join(verify_dir,f"{name}.rgba.png"),'wb').write(encode_rgba(px,target,target))
    fillfrac=nkeep/(W*H)
    return px,f"refs={refs[:3]} keep={fillfrac:.0%} bbox={box}",refs

if __name__=='__main__':
    import sys
    inp,target,tol,vd,name=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4],sys.argv[5]
    px,info,refs=process(inp,target,tol,vd,name)
    print(f"{name}: {info}")
