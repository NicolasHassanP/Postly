# -*- coding: utf-8 -*-
"""Corrige la nota de la Figura 11 — M9 del octavo dictamen.

Qué estaba mal. La nota decía que «el workflow es idéntico al desplegado en producción», y
el rótulo del panel (a) dice «~185 nodos», mientras el §4.3, el Anexo B.2 y la Figura 4
dicen ~195. Las dos cosas no pueden ser ciertas a la vez: la captura es anterior a la
corrección del canal visual del 19 de septiembre de 2026, que agregó diez nodos.

Qué se hace. El rótulo «~185 nodos» **no se toca**, porque describe correctamente lo que la
captura muestra. Lo que se reescribe es la nota, que es donde vivía la afirmación falsa: pasa
a fechar la captura y a declarar que el workflow desplegado tiene hoy ~195 nodos.

Uso: python corregir_figura11.py <figura_entrada.png> <figura_salida.png>
"""
import sys

from PIL import Image, ImageDraw, ImageFont

ENTRADA = sys.argv[1]
SALIDA = sys.argv[2]

im = Image.open(ENTRADA).convert('RGB')
if im.size != (1370, 592):
    sys.exit(f'la figura mide {im.size} y se esperaba (1370, 592)')

# La nota ocupa una sola línea entre y=570 y y=590, desde x=25.
CAJA = (20, 568, im.size[0] - 20, 592)
ImageDraw.Draw(im).rectangle(CAJA, fill=(255, 255, 255))

NOTA = ('Nota. Capturado en el entorno local de desarrollo el 18 de septiembre de 2026, '
        'antes de la corrección del canal visual. El workflow desplegado tiene hoy ~195 '
        'nodos (§4.3, Anexo B.2); su archivo JSON está versionado en el repositorio.')

fuente = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 11)
d = ImageDraw.Draw(im)
d.text((25, 572), NOTA, font=fuente, fill=(60, 60, 60))

im.save(SALIDA)
print(f'escrita: {SALIDA}')
