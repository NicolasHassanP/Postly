# -*- coding: utf-8 -*-
"""Figura 3 (As-Is frente a To-Be) en tamaño de impresión — T-07 y T-03 de la auditoría 17.

Dibujada a 1441 px e impresa a 15 cm, los rótulos quedaban en ~3,7 pt. Mismo contenido, dibujado a 300 ppp
en 22 × 9,6 cm para una página apaisada: cajas a 8,5 pt, anotaciones a 7,5 pt. Cambia una anotación: la
adaptación de la imagen la hace el sistema sólo en la imagen única, no en el carrusel (§4.4.2).

Uso: python redibujar_figura3_impresion.py <salida.png>
"""
import sys

from PIL import Image, ImageDraw, ImageFont

SALIDA = sys.argv[1]
PPP = 300
pt = lambda x: round(x / 72 * PPP)
cm = lambda x: round(x / 2.54 * PPP)

W, H = cm(22), cm(9.6)
REGULAR = 'C:/Windows/Fonts/segoeui.ttf'
NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'
ITALICA = 'C:/Windows/Fonts/segoeuii.ttf'
f_carril = ImageFont.truetype(NEGRITA, pt(9))
f_caja = ImageFont.truetype(REGULAR, pt(8.5))
f_nota = ImageFont.truetype(ITALICA, pt(7.5))

TINTA = (50, 50, 50)
ROJO = (160, 50, 40)
AMBAR_B, AMBAR_C = (150, 110, 0), (253, 248, 233)
AZUL_B, AZUL_C = (31, 78, 121), (234, 243, 252)
G = max(2, pt(0.8))

im = Image.new('RGB', (W, H), 'white')
dr = ImageDraw.Draw(im)


def partir(texto, fuente, ancho):
    lineas, actual = [], ''
    for p in texto.split():
        prueba = f'{actual} {p}'.strip()
        if actual and dr.textlength(prueba, font=fuente) > ancho:
            lineas.append(actual)
            actual = p
        else:
            actual = prueba
    lineas.append(actual)
    return lineas


def texto_centrado(texto, cx, cy_sup, fuente, color, ancho, interlinea=1.25):
    y = cy_sup
    for ln in partir(texto, fuente, ancho):
        dr.text((cm(cx), y), ln, font=fuente, fill=color, anchor='mt')
        y += round(fuente.size * interlinea)


def caja(cx, cy, w, h, texto, borde):
    dr.rounded_rectangle([cm(cx - w / 2), cm(cy - h / 2), cm(cx + w / 2), cm(cy + h / 2)],
                         radius=cm(0.25), fill='white', outline=borde, width=G)
    lineas = partir(texto, f_caja, cm(w - 0.4))
    alto = len(lineas) * round(f_caja.size * 1.25)
    y = cm(cy) - alto // 2
    for ln in lineas:
        dr.text((cm(cx), y), ln, font=f_caja, fill=TINTA, anchor='mt')
        y += round(f_caja.size * 1.25)


def flecha(x1, x2, y):
    X1, X2, Y = cm(x1), cm(x2), cm(y)
    dr.line([(X1, Y), (X2, Y)], fill=TINTA, width=G)
    L = pt(6)
    dr.polygon([(X2, Y), (X2 - L, Y - L * 0.45), (X2 - L, Y + L * 0.45)], fill=TINTA)


def fin(cx, cy):
    r = cm(0.33)
    dr.ellipse([cm(cx) - r, cm(cy) - r, cm(cx) + r, cm(cy) + r], fill='white', outline=(25, 25, 25), width=G + 1)


def carril(y0, y1, titulo, fondo, borde):
    dr.rectangle([cm(0.1), cm(y0), cm(21.9), cm(y1)], fill=fondo, outline=borde, width=max(1, G // 2))
    dr.text((cm(0.45), cm(y0 + 0.3)), titulo, font=f_carril, fill=borde, anchor='lt')


def nota(texto, cx, y, ancho, color=ROJO):
    texto_centrado(texto, cx, cm(y), f_nota, color, cm(ancho), 1.2)


# As-Is
carril(0.1, 4.6, 'As-Is (manual)', AMBAR_C, AMBAR_B)
dr.text((cm(21.5), cm(0.4)), '≈ 9,3 min medidos por publicación (tramo operativo; §6.1.6)', font=f_nota,
        fill=(70, 70, 70), anchor='rt')
xs = [2.1, 6.05, 10.0, 13.95, 17.9]
textos = ['Seleccionar y descargar la imagen del producto', 'Adaptar la imagen al formato de feed',
          'Redactar el copy a mano', 'Revisar precios y firma manualmente', 'Publicar en cada red por separado']
for x, t in zip(xs, textos):
    caja(x, 2.35, 3.2, 1.6, t, AMBAR_B)
for a, b in zip(xs, xs[1:]):
    flecha(a + 1.6, b - 1.6, 2.35)
flecha(xs[-1] + 1.6, 20.25, 2.35)
fin(20.6, 2.35)
nota('no computa en el cronometraje', xs[0], 3.3, 3.6)
nota('en el To-Be la hace el sistema, sólo en la imagen única', xs[1], 3.3, 3.6)

# To-Be
carril(5.0, 9.5, 'To-Be (Postly)', AZUL_C, AZUL_B)
xs = [1.9, 5.3, 8.7, 12.1, 15.5, 18.9]
textos = ['Enviar la(s) foto(s) al bot de Telegram', 'Auditoría visual del Centinela (HU8)',
          'La IA genera 3 copys (Gemini)', 'La usuaria elige el tono (HITL)',
          'Auditoría textual del Centinela (HU7)', 'Publicación automática en las dos redes']
for x, t in zip(xs, textos):
    caja(x, 7.35, 2.8, 1.6, t, AZUL_B)
for a, b in zip(xs, xs[1:]):
    flecha(a + 1.4, b - 1.4, 7.35)
flecha(xs[-1] + 1.4, 20.6, 7.35)
fin(21.0, 7.35)
nota('bloquea antes de redactar', xs[1], 8.3, 3.2)
nota('sobre el texto final', xs[4], 8.3, 3.2)

im.save(SALIDA, dpi=(PPP, PPP))
print(f'{SALIDA}: {W}x{H} px')
