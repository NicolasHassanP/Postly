# -*- coding: utf-8 -*-
"""Figura 2 (diagrama de estados de una publicación) en tamaño de impresión — T-07 de la auditoría 17.

Dibujada a ~1200 px e impresa a 15 cm, los rótulos de las transiciones quedaban en ~4 pt. Mismo contenido
(cuatro estados y seis transiciones), dibujado a 300 ppp en 15,5 × 8,4 cm: transiciones a 8 pt y estados a
9 pt. Las dos viñetas que el bitmap llevaba al pie ya están en la nota del documento, y se quitan.

Uso: python redibujar_figura2_impresion.py <salida.png>
"""
import math
import sys

from PIL import Image, ImageDraw, ImageFont

SALIDA = sys.argv[1]
PPP = 300
pt = lambda x: round(x / 72 * PPP)
cm = lambda x: round(x / 2.54 * PPP)
P = lambda x, y: (cm(x), cm(y))

W, H = cm(15.5), cm(8.4)
REGULAR = 'C:/Windows/Fonts/segoeui.ttf'
NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'
f_estado = ImageFont.truetype(NEGRITA, pt(9))
f_flecha = ImageFont.truetype(REGULAR, pt(8))

TINTA = (60, 60, 60)
ROJO = (170, 40, 40)
ESTADOS = {
    'Pendiente': ((2.5, 4.0), (237, 237, 237), (90, 90, 90)),
    'Programado': ((7.75, 1.0), (221, 232, 246), (31, 78, 121)),
    'Publicado': ((13.2, 4.0), (216, 238, 224), (40, 110, 70)),
    'Fallido': ((7.75, 7.4), (249, 219, 219), (170, 40, 40)),
}
BW, BH = 3.0, 1.0  # cm

im = Image.new('RGB', (W, H), 'white')
dr = ImageDraw.Draw(im)
G = max(2, pt(0.8))


def caja(nombre):
    (cx, cy), relleno, borde = ESTADOS[nombre]
    caja_xy = [cm(cx - BW / 2), cm(cy - BH / 2), cm(cx + BW / 2), cm(cy + BH / 2)]
    dr.rounded_rectangle(caja_xy, radius=cm(0.4), fill=relleno, outline=borde, width=G)
    dr.text((cm(cx), cm(cy)), nombre, font=f_estado, fill=(25, 25, 25), anchor='mm')


def flecha(p, q, color=TINTA):
    (x1, y1), (x2, y2) = P(*p), P(*q)
    dr.line([(x1, y1), (x2, y2)], fill=color, width=G)
    ang = math.atan2(y2 - y1, x2 - x1)
    L, A = pt(7), math.radians(24)
    punta = [(x2, y2),
             (x2 - L * math.cos(ang - A), y2 - L * math.sin(ang - A)),
             (x2 - L * math.cos(ang + A), y2 - L * math.sin(ang + A))]
    dr.polygon(punta, fill=color)


def rotulo(texto, centro, color=TINTA, ancla='mm'):
    x, y = P(*centro)
    caja_t = dr.textbbox((x, y), texto, font=f_flecha, anchor=ancla)
    pad = pt(2)
    dr.rectangle([caja_t[0] - pad, caja_t[1] - pad, caja_t[2] + pad, caja_t[3] + pad], fill='white')
    dr.text((x, y), texto, font=f_flecha, fill=color, anchor=ancla)


# transiciones primero, para que las cajas queden encima
flecha((3.45, 3.5), (6.3, 1.25))                         # Pendiente -> Programado
flecha((9.2, 1.25), (12.2, 3.5))                         # Programado -> Publicado
flecha((4.0, 4.0), (11.7, 4.0))                          # Pendiente -> Publicado
flecha((7.75, 1.5), (7.75, 6.9), ROJO)                   # Programado -> Fallido
flecha((2.8, 4.5), (6.3, 7.3), ROJO)                     # Pendiente -> Fallido
flecha((6.9, 6.95), (3.9, 4.5))                          # Fallido -> Pendiente
# estado inicial
dr.ellipse([cm(0.35), cm(3.85), cm(0.65), cm(4.15)], fill=(25, 25, 25))
flecha((0.7, 4.0), (1.0, 4.0))

for n in ESTADOS:
    caja(n)

rotulo('usuaria agenda fecha/hora', (4.55, 2.15), ancla='rm')
rotulo('Cron ejecuta a la hora fijada', (11.3, 2.4), ancla='lm')
rotulo('publicación inmediata exitosa', (5.8, 3.72))
rotulo('error en la ejecución programada', (7.95, 5.5), ROJO, 'lm')
rotulo('error de red / token revocado', (0.6, 6.35), ROJO, 'lm')
rotulo('usuaria reintenta', (6.15, 5.15))

im.save(SALIDA, dpi=(PPP, PPP))
print(f'{SALIDA}: {W}x{H} px')
