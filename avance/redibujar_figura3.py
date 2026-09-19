# -*- coding: utf-8 -*-
"""Redibuja la Figura 3 (As-Is frente a To-Be) — M-02 y N-03 del décimo dictamen.

**Qué estaba mal.** El carril To-Be mostraba cinco pasos: enviar la foto, la IA genera tres
copys, la usuaria elige el tono, auditoría automática y publicación. Es una cuarta descripción
del flujo de creación, distinta de las otras tres del documento, y le falta lo principal: la
**auditoría visual corre antes de generar los copys**, no después de elegir el tono. Una
imagen con el precio incrustado interrumpe el flujo sin gastar una inferencia de redacción,
que es justamente el orden que la Figura 6, el §4.4.1 y el Anexo B.4 describen.

**Y una segunda cosa.** El segundo paso del carril As-Is —adaptar la imagen al formato de
feed— no tiene equivalente en el To-Be: Postly no normaliza imágenes (§4.7.2). El cronometraje
lo incluye en la condición manual, de modo que parte de la reducción medida corresponde a
trabajo que el sistema no reemplaza. La figura lo marca, porque es más honesto verlo que
leerlo tres capítulos después.

La nota se reescribe además con el entorno real (E1, Anexo B.1) en lugar de «producción».

Uso: python redibujar_figura3.py <salida.png>
"""
import sys

from PIL import Image, ImageDraw, ImageFont

SALIDA = sys.argv[1] if len(sys.argv) > 1 else '_figuras/Figura_3_v3.png'

W, H = 1441, 660
REGULAR = 'C:/Windows/Fonts/segoeui.ttf'
NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'
ITALICA = 'C:/Windows/Fonts/segoeuii.ttf'

f_carril = ImageFont.truetype(NEGRITA, 14)
f_caja = ImageFont.truetype(REGULAR, 12)
f_nota = ImageFont.truetype(ITALICA, 12)
f_marca = ImageFont.truetype(ITALICA, 11)

TINTA = (70, 70, 70)
AMBAR_BORDE, AMBAR_FONDO, AMBAR_CARRIL = (166, 124, 0), (255, 255, 255), (253, 248, 233)
AZUL_BORDE, AZUL_FONDO, AZUL_CARRIL = (31, 78, 121), (255, 255, 255), (234, 243, 252)

im = Image.new('RGB', (W, H), 'white')
d = ImageDraw.Draw(im)


def carril(y0, y1, titulo, fondo, tinta):
    d.rectangle((20, y0, W - 20, y1), fill=fondo, outline=(215, 215, 215))
    d.text((32, y0 + 12), titulo, font=f_carril, fill=tinta)


def envolver(texto, ancho_max, fuente):
    lineas, actual = [], ''
    for palabra in texto.split():
        prueba = (actual + ' ' + palabra).strip()
        if d.textlength(prueba, font=fuente) <= ancho_max:
            actual = prueba
        else:
            lineas.append(actual)
            actual = palabra
    if actual:
        lineas.append(actual)
    return lineas


def cadena(pasos, y_centro, x0, x1, borde, fondo, alto=86):
    """Dibuja los pasos en fila, con flechas entre ellos y un círculo de fin."""
    n = len(pasos)
    hueco, fin = 40, 46
    ancho = (x1 - x0 - fin - hueco * n) / n
    cajas = []
    for k, (texto, marca) in enumerate(pasos):
        cx0 = x0 + k * (ancho + hueco)
        d.rounded_rectangle((cx0, y_centro - alto / 2, cx0 + ancho, y_centro + alto / 2),
                            radius=7, fill=fondo, outline=borde, width=2)
        lineas = envolver(texto, ancho - 20, f_caja)
        for j, linea in enumerate(lineas):
            d.text((cx0 + ancho / 2, y_centro - 7 * (len(lineas) - 1) + j * 15),
                   linea, font=f_caja, fill=(40, 40, 40), anchor='mm')
        if marca:
            d.text((cx0 + ancho / 2, y_centro + alto / 2 + 13), marca,
                   font=f_marca, fill=(176, 58, 46), anchor='mm')
        cajas.append((cx0, cx0 + ancho))
    for k in range(n - 1):
        xa, xb = cajas[k][1] + 6, cajas[k + 1][0] - 6
        d.line((xa, y_centro, xb, y_centro), fill=(40, 40, 40), width=1)
        d.polygon([(xb, y_centro), (xb - 8, y_centro - 5), (xb - 8, y_centro + 5)],
                  fill=(40, 40, 40))
    xf = cajas[-1][1] + 6
    d.line((xf, y_centro, xf + 26, y_centro), fill=(40, 40, 40), width=1)
    d.ellipse((xf + 26, y_centro - 15, xf + 56, y_centro + 15), outline=(30, 30, 30), width=3)


# ── As-Is ───────────────────────────────────────────────────────────────────
carril(20, 250, 'As-Is (manual)', AMBAR_CARRIL, (140, 100, 0))
cadena([('Tomar la foto del producto', 'no computa en el cronometraje'),
        ('Adaptar la imagen al formato de feed', 'sin equivalente en el To-Be'),
        ('Redactar el copy a mano', ''),
        ('Revisar precios y firma manualmente', ''),
        ('Publicar en cada red por separado', '')],
       y_centro=140, x0=70, x1=W - 60, borde=AMBAR_BORDE, fondo=AMBAR_FONDO)
d.text((W - 120, 66), '≈ 15–30 min estimados por publicación (§1.2.a; sin instrumento)',
       font=f_marca, fill=TINTA, anchor='rm')

# ── To-Be ───────────────────────────────────────────────────────────────────
carril(268, 498, 'To-Be (Postly)', AZUL_CARRIL, (25, 62, 97))
cadena([('Enviar la(s) foto(s) al bot de Telegram', ''),
        ('Auditoría visual del Centinela (HU8)', 'bloquea antes de redactar'),
        ('La IA genera 3 copys (Gemini)', ''),
        ('La usuaria elige el tono (HITL)', ''),
        ('Auditoría textual del Centinela (HU7)', 'sobre el texto final'),
        ('Publicación automática en las dos redes', '')],
       y_centro=388, x0=70, x1=W - 60, borde=AZUL_BORDE, fondo=AZUL_FONDO)

# ── nota ────────────────────────────────────────────────────────────────────
LINEAS = [
    '- El flujo As-Is se reconstruye a partir de §1.2.a y §3.4.1 (observación no participante, '
    'sin instrumento cronometrado publicado).',
    '- El flujo To-Be es el del sistema desplegado, recorrido de extremo a extremo sobre el '
    'entorno E1 (Anexo A, Anexo B.1). El orden de las dos auditorías',
    '  es el que la Figura 6 y el Anexo B.4 describen: la visual antes de generar los copys, '
    'la textual sobre el texto que la usuaria confirma.',
    '- El 73,6 % de reducción (n = 12; §5.1) se midió sobre el tramo «material en mano hasta '
    'publicación confirmada». La toma de la foto no computa en',
    '  ninguna de las dos condiciones; la adaptación de la imagen sí computa en la manual y '
    'Postly no la ejecuta, asimetría que el §5.1 acota (Anexo E.2).',
]
d.text((28, 522), 'Nota.', font=ImageFont.truetype(NEGRITA, 12), fill=(40, 40, 40))
for k, linea in enumerate(LINEAS):
    d.text((28, 546 + k * 18), linea, font=f_nota, fill=TINTA)

im.save(SALIDA)
print(f'escrita: {SALIDA}  ({im.size[0]}×{im.size[1]})')
