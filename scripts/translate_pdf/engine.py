# Arabic copy of an English PDF datasheet: erase English labels from the page (inpainting the
# 300dpi render, so backgrounds stay intact) and write Arabic text in the same place as real text.
# Fonts: static instances of Noto Sans Arabic / Noto Sans (regular+bold) in FONT_DIR.
import pymupdf as fitz, numpy as np, cv2, io, re, os
from PIL import Image
S=300/72
FONT_DIR=os.environ.get("AR_FONT_DIR","/tmp/g/fonts")
ARCH=fitz.Archive(FONT_DIR)
CSS="@font-face{font-family:ar;src:url(fonts_arR.ttf);} @font-face{font-family:ar;src:url(fonts_arB.ttf);font-weight:bold;} @font-face{font-family:la;src:url(fonts_laR.ttf);} @font-face{font-family:la;src:url(fonts_laB.ttf);font-weight:bold;} body{margin:0;padding:0;font-family:ar;line-height:1.3;} .l{font-family:la}"
LAT=re.compile(r"[A-Za-z0-9][A-Za-z0-9.,:/%°+\-~×*_&=±²' ]*[A-Za-z0-9%°²*)]?|[A-Za-z0-9]")
def esc(s): return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
def html(t):
  out=[];i=0
  for m in LAT.finditer(t):
    out.append(esc(t[i:m.start()]));out.append(f'<span class="l">{esc(m.group())}</span>');i=m.end()
  out.append(esc(t[i:]));return "".join(out)
def frag(t,fs,color,bold,d):
  return f'<div dir="{d}" style="font-size:{fs:.2f}px;color:{color};{"font-weight:bold;" if bold else ""}white-space:nowrap">{html(t)}</div>'
_scr=fitz.open()
def measure(t,fs,bold,d):
  sp=_scr.new_page(width=3000,height=400)
  sp.insert_htmlbox(fitz.Rect(0,0,3000,400),frag(t,fs,"#000",bold,d),css=CSS,archive=ARCH)
  xs=[]
  for b in sp.get_text("rawdict")["blocks"]:
    for l in b.get("lines",[]):
      for s in l["spans"]:
        for c in s["chars"]:
          if c["c"].strip(): xs+=[c["bbox"][0],c["bbox"][2]]
  return (min(xs),max(xs)) if xs else (0,0)
DESC=set("gjpqy(),;[]|Q_")
class Page:
  def __init__(s,doc,pno,png):
    s.page=doc[pno];s.im=np.asarray(Image.open(png).convert('RGB')).copy();s.items=[];s.patches=[]
  def px(s,r): return [int(round(v*S)) for v in r]
  def tight(s,r):
    x0,y0,x1,y1=s.px([r[0]-.6,r[1]-.2,r[2]+.6,r[3]+.2]);a=s.im[y0:y1,x0:x1].astype(int)
    bg=np.median(np.concatenate([a[0],a[-1],a[:,0],a[:,-1]]),axis=0)
    m=(np.abs(a-bg).sum(2)>90);ys,xs=np.where(m)
    if len(xs)==0: return r,None
    t=[(x0+xs.min())/S,(y0+ys.min())/S,(x0+xs.max()+1)/S,(y0+ys.max()+1)/S]
    ink=a[m];lum=ink.sum(1);col=np.median(ink[lum<=np.percentile(lum,30)],axis=0)
    return t,col
  def erase(s,r):
    x0,y0,x1,y1=s.px([r[0]-1.2,r[1]-1.2,r[2]+1.2,r[3]+1.2])
    # stop the patch before nearby table rules: a raster copy of a hairline fades when the page is viewed small
    ty0,ty1=s.px(r)[1],s.px(r)[3];ref=s.im[ty0:ty1,x0:x1].astype(int)
    bgr=np.median(np.concatenate([ref[:,0],ref[:,-1]]),axis=0) if ref.size else 255
    def ruled(y): return (np.abs(s.im[y,x0:x1].astype(int)-bgr).sum(1)>36).mean()>0.3
    y=ty0-1
    while y>=y0-3 and not ruled(y): y-=1
    y0=min(max(y+3,y0),ty0) if y>=y0-3 else y0
    y=ty1
    while y<y1+3 and not ruled(y): y+=1
    y1=max(min(y-2,y1),ty1) if y<y1+3 else y1
    a=s.im[y0:y1,x0:x1].copy();ai=a.astype(int)
    ix0,iy0,ix1,iy1=s.px(r);ix0-=x0;ix1-=x0;iy0-=y0;iy1-=y0
    bg=np.median(np.concatenate([ai[0],ai[-1],ai[:,0],ai[:,-1]]),axis=0)
    m=np.zeros(a.shape[:2],np.uint8)
    ya,yb,xa,xb=iy0,iy1,max(ix0-2,0),ix1+2
    m[ya:yb,xa:xb]=(np.abs(ai[ya:yb,xa:xb]-bg).sum(2)>36).astype(np.uint8)
    m=cv2.dilate(m,np.ones((3,5),np.uint8))
    out=cv2.inpaint(a[:,:,::-1].copy(),m*255,4,cv2.INPAINT_TELEA)[:,:,::-1]
    s.im[y0:y1,x0:x1]=out
    buf=io.BytesIO();Image.fromarray(out).save(buf,"PNG")
    s.page.add_redact_annot(fitz.Rect(*r))
    s.patches.append((fitz.Rect(x0/S,y0/S,x1/S,y1/S),buf.getvalue()))
  def add(s,en,r,ar,**o): s.items.append(("L",en,r,ar,o))
  def block(s,r,lines,**o): s.items.append(("B",None,r,lines,o))
  def run(s):
    draws=[]
    for kind,en,r,ar,o in s.items:
      t,col=s.tight(r)
      c=o.get("color") or ('#%02x%02x%02x'%tuple(int(v) for v in col) if col is not None else '#333333')
      bold=o.get("b",False);d=o.get("dir","rtl")
      s.erase(t)
      if kind=="L":
        h=t[3]-t[1];desc=any(ch in DESC for ch in en) if en else False
        fs=o.get("fs") or (h/0.93 if desc else h/0.72)
        fs=min(fs,o.get("maxfs",99))*o.get("k",0.97)
        base=o.get("base") or (t[3]-(0.21*fs if desc else 0))+o.get("dy",0)
        lim=o.get("lim") or (t[2]+0.3*(t[2]-t[0])+8)
        draws.append((t,ar,fs,c,bold,d,base,lim,o))
      else:
        n=len(ar);pitch=o.get("pitch") or (t[3]-t[1])/n
        fs=o.get("fs") or pitch*0.78;lim=o.get("lim") or (t[2]+6)
        ws=[];f2=fs
        for _ in range(30):  # one size for the whole block, right-aligned like an Arabic paragraph
          ws=[(lambda ab:ab[1]-ab[0])(measure(l,f2,bold,d)) for l in ar]
          if t[0]+max(ws)<=lim or f2<2.5: break
          f2*=0.96
        xr=t[0]+max(ws)
        for i,line in enumerate(ar):
          draws.append((t,line,f2,c,bold,d,t[1]+pitch*(i+0.80)+o.get("dy",0),lim,dict(o,al="r",xr=xr)))
    s.page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE,graphics=fitz.PDF_REDACT_LINE_ART_NONE,text=fitz.PDF_REDACT_TEXT_REMOVE)
    for rect,png in s.patches: s.page.insert_image(rect,stream=png)
    for t,ar,fs,c,bold,d,base,lim,o in draws:
      x0=o.get("x0",t[0])
      for _ in range(30):
        a,b=measure(ar,fs,bold,d);w=b-a
        if x0+w<=lim or fs<2.5: break
        fs*=0.96
      al=o.get("al","l")
      X=x0 if al=="l" else (o.get("xr",t[2])-w if al=="r" else (t[0]+t[2])/2-w/2)
      top=base-0.95*fs
      if d=="rtl":  # rtl text is right-aligned inside its box
        right=X+w+(3000-b);rect=fitz.Rect(right-w-200,top,right,top+fs*1.6)
      else: rect=fitz.Rect(X-a,top,X-a+w+200,top+fs*1.6)
      s.page.insert_htmlbox(rect,frag(ar,fs,c,bold,d),css=CSS,archive=ARCH)
