# -*- coding: utf-8 -*-
"""Cubre el usuario de Instagram visible en el fotograma original del caso de recorte.

A9 del octavo dictamen: la carpeta `casos_video/` excluye un fotograma porque en él aparece
el rostro de quien filmó, y al mismo tiempo entrega otro donde se lee la marca de agua
«@DANYGIL_MK», que identifica una cuenta real. El criterio tiene que ser el mismo para los dos.

Se cubre sólo en el material que se entrega. La imagen que el modelo recibió llevaba la marca
visible, y el Anexo E.9 lo declara: esta redacción es posterior a la medición y no la altera.
El fotograma es además el ORIGINAL sin recortar; los tres del video normalizado no la
muestran, porque el recorte a 9:16 se come justamente ese borde, que es lo que el caso prueba.

Uso: python anonimizar_marca_agua.py [--escribir]
"""
import sys

from PIL import Image, ImageDraw, ImageFilter

RUTA = 'evidencia/casos_video/V-RECORTE_orig.jpg'
# La marca de agua, en coordenadas del fotograma de 1080 × 608.
CAJA = (812, 138, 1018, 186)

im = Image.open(RUTA)
if im.size != (1080, 608):
    sys.exit(f'el fotograma mide {im.size} y se esperaba (1080, 608)')

recorte = im.crop(CAJA)
# Un desenfoque fuerte y no una caja sólida: mantiene el aspecto del fotograma —que es parte
# de lo que el caso muestra, la placa pegada al borde— y vuelve ilegible el usuario.
im.paste(recorte.filter(ImageFilter.GaussianBlur(14)), CAJA)
d = ImageDraw.Draw(im)
d.rectangle(CAJA, outline=(255, 255, 255), width=2)

if '--escribir' not in sys.argv:
    print('(dry-run: no se escribió nada. Agregá --escribir para aplicar)')
    sys.exit(0)

im.save(RUTA, quality=92)
print(f'escrito: {RUTA} — marca de agua cubierta en {CAJA}')
