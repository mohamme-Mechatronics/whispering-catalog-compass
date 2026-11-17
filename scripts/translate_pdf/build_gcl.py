# Usage: python3 build_gcl.py <workdir>  (workdir has g710.pdf, g715.pdf, ocr/g710-1.png ... rendered at 300dpi)
import sys,os,pymupdf as fitz
sys.path.insert(0,os.path.dirname(__file__))
from engine import Page
import gcl_items as I
W=sys.argv[1]
for v,pages in [("710",[(0,lambda P:I.p1(P,"710")),(1,I.p2_710)]),("715",[(0,lambda P:I.p1(P,"715")),(1,I.p2_715),(2,I.p3_715)])]:
  d=fitz.open(f"{W}/g{v}.pdf")
  for pno,fn in pages:
    P=Page(d,pno,f"{W}/ocr/g{v}-{pno+1}.png");fn(P);P.run()
  d.save(f"{W}/out/a{v}.pdf",garbage=3,deflate=True);print(v,"ok")
