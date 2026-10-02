# -*- coding: utf-8 -*-
"""Figura 4 (diagrama C4 de contexto y componentes) para página apaisada — N-11 de la devolución del
29-09-2026: dibujada a 1421 px e impresa a 15 cm de ancho, los rótulos de las flechas quedaban en
~3,3 pt y los de las cajas en ~4,5 pt.

Mismo contenido que redibujar_figura4.py (pasadas 135 y 172), redistribuido y dibujado en tamaño de
impresión: 20 cm de ancho a 300 ppp, cajas a 8,5 pt y rótulos a 7,5 pt. Se incrusta girada 90° en
una página propia. El orquestador pasa de «~207 nodos» a 213, los que tiene el workflow principal
desde N-08 y N-09. La nota sigue siendo texto bajo la figura.

Uso: python redibujar_figura4_apaisada.py <salida.png>
"""
import math
import sys

from PIL import Image, ImageDraw, ImageFont

SALIDA = sys.argv[1]
PPP = 300
pt = lambda x: round(x / 72 * PPP)
cm = lambda x: round(x / 2.54 * PPP)

W, H = cm(20), cm(11.2)
REGULAR = 'C:/Windows/Fonts/segoeui.ttf'
NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'
ITALICA = 'C:/Windows/Fonts/segoeuii.ttf'
f_caja = ImageFont.truetype(NEGRITA, pt(8.5))
f_ext = ImageFont.truetype(REGULAR, pt(8.5))
f_sub = ImageFont.truetype(ITALICA, pt(7.5))
f_flecha = ImageFont.truetype(REGULAR, pt(7.5))

TINTA = (60, 60, 60)
AZUL_B, AZUL_F = (31, 78, 121), (222, 235, 247)
ROJO_B, ROJO_F = (192, 0, 0), (253, 233, 233)
GRIS_B, GRIS_F = (120, 120, 120), (240, 240, 240)
NARANJA_B, NARANJA_F = (191, 143, 0), (255, 242, 204)
VERDE_B, VERDE_F = (84, 130, 53), (233, 245, 229)
VIOLETA_B, VIOLETA_F = (112, 96, 180), (238, 236, 252)
G = max(2, pt(0.7))

im = Image.new('RGB', (W, H), 'white')
dr = ImageDraw.Draw(im)


def partir(texto, fuente, ancho):
    """Reparte el texto en los renglones que hagan falta para no pasar del ancho."""
    lineas = []
    for parrafo in texto.split('\n'):
        actual = ''
        for p in parrafo.split():
            prueba = f'{actual} {p}'.strip()
            if actual and dr.textlength(prueba, font=fuente) > ancho:
                lineas.append(actual)
                actual = p
            else:
                actual = prueba
        lineas.append(actual)
    return lineas


def bloque(cx, cy, renglones):
    """renglones = [(texto, fuente)], centrados en (cx, cy)."""
    alto = [f.size * 1.3 for _, f in renglones]
    y = cy - sum(alto) / 2
    for (t, f), a in zip(renglones, alto):
        dr.text((cx, y + a / 2), t, font=f, fill=TINTA, anchor='mm')
        y += a


def caja(x0, y0, x1, y1, borde, relleno, titulo, sub=None, f_tit=f_caja):
    x0, y0, x1, y1 = cm(x0), cm(y0), cm(x1), cm(y1)
    dr.rounded_rectangle([x0, y0, x1, y1], radius=pt(4), fill=relleno, outline=borde, width=G)
    util = x1 - x0 - pt(10)
    r = [(l, f_tit) for l in partir(titulo, f_tit, util)]
    if sub:
        r += [(l, f_sub) for l in partir(sub, f_sub, util)]
    bloque((x0 + x1) / 2, (y0 + y1) / 2, r)


def etiqueta(x, y, texto, ancla='mm'):
    """Rótulo con halo blanco, para que se lea aunque lo cruce una línea (x, y en cm)."""
    x, y = cm(x), cm(y)
    a = dr.textbbox((x, y), texto, font=f_flecha, anchor=ancla)
    dr.rectangle([a[0] - pt(1.5), a[1] - pt(0.8), a[2] + pt(1.5), a[3] + pt(0.8)], fill='white')
    dr.text((x, y), texto, font=f_flecha, fill=TINTA, anchor=ancla)


def flecha(p0, p1, texto=None, en_x=None, dy=0.0):
    (x0, y0), (x1, y1) = (cm(p0[0]), cm(p0[1])), (cm(p1[0]), cm(p1[1]))
    dr.line([(x0, y0), (x1, y1)], fill=(40, 40, 40), width=G)
    ang = math.atan2(y1 - y0, x1 - x0)
    largo = pt(5)
    dr.polygon([(x1, y1),
                (x1 - largo * math.cos(ang + 0.38), y1 - largo * math.sin(ang + 0.38)),
                (x1 - largo * math.cos(ang - 0.38), y1 - largo * math.sin(ang - 0.38))],
               fill=(40, 40, 40))
    if texto:
        t = 0.5 if en_x is None else (en_x - p0[0]) / (p1[0] - p0[0])
        etiqueta(p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t + dy, texto)


def quebrada(puntos, texto=None, en=None):
    """Flecha ortogonal por los puntos dados (cm); rótulo en el punto `en`."""
    for a, b in zip(puntos[:-2], puntos[1:-1]):
        dr.line([(cm(a[0]), cm(a[1])), (cm(b[0]), cm(b[1]))], fill=(40, 40, 40), width=G)
    flecha(puntos[-2], puntos[-1])
    if texto:
        etiqueta(en[0], en[1], texto)


# ── frontera de la instancia: sólo lo que corre en ella ───────────────────────
VX0, VY0, VX1, VY1 = 5.9, 0.25, 13.0, 10.9
dr.rectangle([cm(VX0), cm(VY0), cm(VX1), cm(VY1)], outline=AZUL_B, width=G)
dr.text((cm(VX0) + pt(6), cm(VY0) + pt(5)), 'Sistema Postly (instancia auto-hospedada)',
        font=f_caja, fill=AZUL_B)

# ── lo que NO corre en la instancia ───────────────────────────────────────────
caja(0.3, 1.4, 4.0, 2.8, NARANJA_B, NARANJA_F, 'Consultora de Belleza Independiente')
dr.text((cm(2.15), cm(6.05)), 'infraestructura de Telegram', font=f_sub, fill=TINTA, anchor='mm')
caja(0.3, 4.3, 4.0, 5.7, AZUL_B, AZUL_F, 'Bot de Telegram (CUI)', f_tit=f_ext)

caja(15.2, 1.6, 19.7, 2.9, VERDE_B, VERDE_F, 'Google Gemini 2.5 Flash', f_tit=f_ext)
caja(15.2, 3.5, 19.7, 4.8, ROJO_B, ROJO_F, 'Meta Graph API\n(Instagram / Facebook)', f_tit=f_ext)
caja(15.2, 5.4, 19.7, 6.7, VIOLETA_B, VIOLETA_F,
     'Cloudinary\n(almacenamiento intermedio de imagen y video)', f_tit=f_ext)
caja(15.2, 7.3, 19.7, 8.6, GRIS_B, GRIS_F, 'Persistencia (Google Sheets)\nalmacenamiento tabular',
     f_tit=f_ext)
bloque(cm(17.45), cm(9.3), [('Servicios externos', f_sub), ('(infraestructura de terceros)', f_sub)])

# ── dentro de la instancia ────────────────────────────────────────────────────
caja(10.5, 1.4, 12.6, 8.6, AZUL_B, AZUL_F, 'Orquestador n8n', '213 nodos en un único proceso')
caja(6.2, 1.4, 9.0, 2.8, ROJO_B, ROJO_F, 'Módulo Centinela', 'canal textual: RegEx')
caja(6.2, 6.4, 9.0, 8.6, GRIS_B, GRIS_F, 'Cron', 'Programador (5 min)\nFeedback Loop (24 h)')
caja(6.2, 9.3, 9.0, 10.5, GRIS_B, GRIS_F, 'Sub-workflows de publicación', f_tit=f_sub)
caja(10.5, 9.3, 12.6, 10.5, GRIS_B, GRIS_F, 'Callback OAuth (aparte)', f_tit=f_sub)

# ── flujos ────────────────────────────────────────────────────────────────────
flecha((2.15, 2.8), (2.15, 4.3))
etiqueta(2.3, 3.4, 'usa', ancla='lm')
flecha((4.0, 4.75), (10.5, 4.75))
etiqueta(4.95, 4.5, 'webhook')
flecha((10.5, 5.25), (4.0, 5.25))
etiqueta(4.95, 5.5, 'mensajes')

flecha((10.5, 1.85), (9.0, 1.85))
etiqueta(9.75, 1.6, 'audita')
flecha((9.0, 2.35), (10.5, 2.35))
etiqueta(9.75, 2.6, 'veredicto')

flecha((9.0, 7.5), (10.5, 7.5))
etiqueta(9.75, 7.25, 'dispara')
flecha((7.6, 8.6), (7.6, 9.3))
etiqueta(7.75, 8.95, 'invoca', ancla='lm')

for y, texto in ((2.25, 'analiza / genera'), (4.15, 'publica'), (6.05, 'sube el activo'),
                 (7.95, 'lee/escribe')):
    flecha((12.6, y), (15.2, y))
    etiqueta(14.05, y - 0.25, texto)
quebrada([(7.6, 1.4), (7.6, 1.05), (15.7, 1.05), (15.7, 1.6)], 'canal visual', en=(14.05, 1.05))

im.save(SALIDA, dpi=(PPP, PPP))
print(f'escrita: {SALIDA} ({W}×{H} px = 20 × {H / PPP * 2.54:.1f} cm a {PPP} ppp)')
