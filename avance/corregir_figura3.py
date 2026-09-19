# -*- coding: utf-8 -*-
"""Corrige la nota de la Figura 3 — M9 del octavo dictamen.

Qué estaba mal. La nota decía que «la primera etapa del As-Is no computa (Anexo E.2)», y esa
primera etapa es la caja «Tomar/editar foto en apps externas». El E.2 no dice eso: dice que
«la búsqueda o creación del contenido no computa en ninguna de las dos condiciones», y en la
descripción de la tarea estándar agrega que, en la condición manual, «la participante **adapta
la imagen al formato de feed**, redacta el copy, verifica el cumplimiento y publica en cada red
por separado». La adaptación de la imagen, entonces, **sí** computa.

Dicho como estaba, la nota excluía del cronometraje un paso que el protocolo incluye, y con
ello hacía parecer menor el tramo medido. Se reescribe para que diga lo que el E.2 dice, y la
caja del As-Is se parte en las dos cosas que mezclaba.

Uso: python corregir_figura3.py <figura_entrada.png> <figura_salida.png>
"""
import sys

from PIL import Image, ImageDraw, ImageFont

ENTRADA, SALIDA = sys.argv[1], sys.argv[2]

im = Image.open(ENTRADA).convert('RGB')
if im.size != (1441, 624):
    sys.exit(f'la figura mide {im.size} y se esperaba (1441, 624)')

d = ImageDraw.Draw(im)
f_nota = ImageFont.truetype('C:/Windows/Fonts/segoeuii.ttf', 12)

# La nota ocupa de y=544 a y=603.
d.rectangle((20, 538, im.size[0] - 20, 612), fill=(255, 255, 255))

LINEAS = [
    '- El flujo As-Is se reconstruye a partir de §1.2.a y §3.4.1 (observación no participante, '
    'sin instrumento cronometrado publicado).',
    '- El flujo To-Be corresponde a los pasos validados end-to-end en producción (Anexo A); la '
    'usuaria envía la foto, elige uno de los tres copys y confirma.',
    '- El 73,6 % de reducción (n = 12; §5.1) se midió sobre el tramo «material en mano hasta '
    'publicación confirmada». De la primera etapa del As-Is, la toma o creación del',
    '  material no computa en ninguna de las dos condiciones; la adaptación de la imagen al '
    'formato de feed sí computa en la manual (Anexo E.2).',
]
for k, linea in enumerate(LINEAS):
    d.text((31, 542 + k * 17), linea, font=f_nota, fill=(70, 70, 70))

# La caja del As-Is mezclaba dos cosas que el protocolo separa. Se repinta sólo el interior,
# sin tocar el borde: la caja tiene esquinas redondeadas y un rectángulo hasta el borde se
# las come.
CAJA = (95, 90, 287, 182)
d.rectangle((CAJA[0] + 8, CAJA[1] + 8, CAJA[2] - 8, CAJA[3] - 8), fill=(255, 250, 235))
f_caja = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 12)
cx, cy = (CAJA[0] + CAJA[2]) / 2, (CAJA[1] + CAJA[3]) / 2
for k, linea in enumerate(('Tomar o buscar la foto', '(no computa) y adaptarla',
                           'al formato de feed')):
    d.text((cx, cy - 17 + k * 17), linea, font=f_caja, fill=(40, 40, 40), anchor='mm')

im.save(SALIDA)
print(f'escrita: {SALIDA}')
