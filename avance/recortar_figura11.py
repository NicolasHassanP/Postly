# -*- coding: utf-8 -*-
"""Figura 11 legible — N-11 de la devolución del 29-09-2026: el canvas completo del workflow principal,
encogido a una página, deja los nombres de los nodos en ~1 pt.

Se recorta una sola rama, la de creación con imagen única (foto → subida a Cloudinary → detección
visual de precio, HU8 → copys con Gemini → tres opciones), del PDF vectorial que imprime el editor de
n8n sobre E3 (canvas de 213 nodos, rótulos de 2,73 pt). La rama se parte en cuatro tramos de cuatro
columnas de nodos que se apilan; a 15 cm de ancho cada tramo queda a ×2,78 y los rótulos, en ~7,6 pt.
Una flecha gris, a la derecha, marca que el tramo sigue en el de abajo.

También genera el canvas completo (Figura 16, Anexo B.2), recortado a la zona de nodos.

Uso: python recortar_figura11.py <canvas.pdf> <carpeta_salida> [dx dy]
     dx, dy: corrimiento en pt de la exportación respecto de la v7 (la v8, tras el renombre de los
     IF del 02-10, salió con dx = 1 y dy = -3).
"""
import sys
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw

PDF, SAL = sys.argv[1], Path(sys.argv[2])
DX, DY = (float(sys.argv[3]), float(sys.argv[4])) if len(sys.argv) > 4 else (0.0, 0.0)
SAL.mkdir(parents=True, exist_ok=True)
PPP = 300
ANCHO_PX = round(15 / 2.54 * PPP)               # 15 cm, el ancho de texto de la página

# (x0, x1) en pt del PDF: cortes a mitad de camino entre columnas (separadas ~38,3 pt)
# (y0, y1): la franja que ocupa cada tramo
TRAMOS = [
    ((534, 687), (333, 366)),     # Bajar Foto · Code · HTTP Request (Cloudinary) · HU8: Detección visual
    ((687, 840), (296, 389)),     # HU8: Parsear · ¿Imagen limpia? · bloqueo + borrado | Analyze · Consistencia
    ((840, 993), (360, 389)),     # B: Parsear opciones · Intro · Opción 1 · Opción 2
    ((993, 1146), (360, 389)),    # Opción 3 · Grupo: registrar imagen
]
ESCALA = ANCHO_PX / (TRAMOS[0][0][1] - TRAMOS[0][0][0])   # px por pt
SEP = round(0.35 / 2.54 * PPP)
GRIS = (150, 150, 150)

doc = pymupdf.open(PDF)
pag = doc[0]
piezas = []
for (x0, x1), (y0, y1) in TRAMOS:
    pix = pag.get_pixmap(matrix=pymupdf.Matrix(ESCALA, ESCALA), clip=pymupdf.Rect(x0 + DX, y0 + DY, x1 + DX, y1 + DY))
    piezas.append(Image.frombytes('RGB', (pix.width, pix.height), pix.samples))

alto = sum(p.height for p in piezas) + SEP * (len(piezas) - 1)
lienzo = Image.new('RGB', (ANCHO_PX, alto), 'white')
d = ImageDraw.Draw(lienzo)
y = 0
fondo = piezas[0].getpixel((5, 5))
for k, p in enumerate(piezas):
    # el último tramo es más corto que los otros: se completa con el fondo del canvas
    caja = Image.new('RGB', (ANCHO_PX, p.height), fondo)
    caja.paste(p, (0, 0))
    lienzo.paste(caja, (0, y))
    d.rectangle((0, y, ANCHO_PX - 1, y + p.height - 1), outline=(200, 200, 200), width=2)
    y += p.height
    if k < len(piezas) - 1:                     # flecha de continuación entre tramos
        cx, cy, a = ANCHO_PX - 40, y + SEP // 2, SEP // 3
        d.polygon([(cx - a, cy - a), (cx + a, cy - a), (cx, cy + a)], fill=GRIS)
    y += SEP
lienzo.save(SAL / 'Figura_11.png', dpi=(PPP, PPP))
print(f'Figura 11: {lienzo.size} px = 15 × {alto / PPP * 2.54:.1f} cm; '
      f'×{ESCALA / (PPP / 72):.2f} → rótulos de {2.73 * ESCALA / (PPP / 72):.1f} pt')

# canvas completo, para el Anexo B.2
X0, Y0 = 185 + DX, 95 + DY
pix = pag.get_pixmap(dpi=PPP, clip=pymupdf.Rect(X0, Y0, 1162 + DX, 1290 + DY))
canvas = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
# tapa los botones del editor (zoom, búsqueda, paneles) que flotan arriba a la derecha
px = lambda v: round(v * PPP / 72)
ImageDraw.Draw(canvas).rectangle((px(1108 + DX - X0), 0, canvas.width, px(222 + DY - Y0)),
                                 fill=canvas.getpixel((px(1000 + DX - X0), px(110 + DY - Y0))))
canvas.save(SAL / 'Figura_16_canvas.png', dpi=(PPP, PPP))
print(f'canvas completo: {canvas.size} px')
