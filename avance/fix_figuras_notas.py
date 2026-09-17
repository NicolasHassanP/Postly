# -*- coding: utf-8 -*-
"""
Parcha las notas internas de las Figuras 2, 4 y 5 dentro del .docx (N-15 y N-19).

N-15: las notas de las Figuras 2 y 5 cruzan mal la referencia.
  - Figura 2 remite la columna Estado a la "Figura 4" (el C4); esta en la Figura 5.
  - Figura 5 remite el diagrama de estados a la "Figura 5" (se autorreferencia);
    es la Figura 2.
N-19: la nota de la Figura 4 dice "ausente en versiones previas del diagrama
  conceptual del cuerpo" — es una anotacion sobre el historial de revision del
  propio documento, dirigida al corrector y no al lector, y queda impresa.
  Se elimina esa coletilla y el encabezado "Notas de fidelidad al texto:".

Las figuras son PNG embebidos, de modo que el parche es sobre el bitmap: se blanquea
la linea y se vuelve a dibujar con la misma tipografia (Segoe UI Italic 12 px, que
reproduce el trazado y el ancho del original con error < 1 %).

Uso: python fix_figuras_notas.py "<entrada.docx>" "<salida.docx>"
"""
import io
import sys

import docx
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from docx.oxml.ns import qn

ITALICA = 'C:/Windows/Fonts/segoeuii.ttf'
TAM = 12

SRC, OUT = sys.argv[1], sys.argv[2]


def bbox_tinta(arr, y0, y1, umbral=180):
    """Caja de tinta dentro de la banda de filas [y0, y1)."""
    sub = arr[y0:y1]
    ys, xs = np.where(sub < umbral)
    if len(ys) == 0:
        return None
    return xs.min(), y0 + ys.min(), xs.max(), y0 + ys.max()


def color_texto(im, caja):
    """Color medio de los pixeles de tinta de la caja (para no meter un negro ajeno)."""
    rec = np.array(im.convert('RGB').crop(caja))
    gris = np.array(im.convert('L').crop(caja))
    # solo el nucleo del trazo: los bordes suavizados sesgan la media hacia el blanco
    px = rec[gris <= np.percentile(gris[gris < 200], 5)]
    return tuple(int(v) for v in px.mean(axis=0)) if len(px) else (60, 60, 60)


def reescribir_linea(im, banda, texto, fuente=ITALICA, tam=TAM):
    """Blanquea la banda de filas y redibuja `texto` alineado a la tinta original."""
    y0, y1 = banda
    arr = np.array(im.convert('L'))
    caja = bbox_tinta(arr, y0, y1)
    if caja is None:
        raise SystemExit(f'sin tinta en las filas {banda}')
    x_ini, y_ini, x_fin, y_fin = caja
    col = color_texto(im, caja)

    ft = ImageFont.truetype(fuente, tam)
    if texto:
        # se dibuja aparte para medir la tinta real y alinearla con la original
        tmp = Image.new('L', (im.width, y1 - y0 + 40), 255)
        ImageDraw.Draw(tmp).text((20, 10), texto, font=ft, fill=0)
        ct = bbox_tinta(np.array(tmp), 0, tmp.height)
        dx, dy = 20 - ct[0], 10 - ct[1]

    ImageDraw.Draw(im).rectangle([x_ini - 2, y0 - 2, x_fin + 3, y1 + 2], fill=(255, 255, 255))
    if texto:
        ImageDraw.Draw(im).text((x_ini + dx, y_ini + dy), texto, font=ft, fill=col)
    print(f'  filas {y0}-{y1}: tinta x{x_ini}-{x_fin} color {col} -> {texto[:60]!r}')
    return im


NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'

# ─────────────────────────────────────────────── parches, por figura
# (banda de filas, texto nuevo, fuente). Texto vacio = solo blanquear.
PARCHES = {
    # N-15: la nota remite la columna Estado al C4 (Figura 4); vive en la Figura 5
    'Figura 2': [
        ((696, 712),
         '- El estado se persiste en la columna Estado de Hoja 1 (Figura 5) y se sincroniza '
         'también leyendo Instagram (Anexo B.8).', ITALICA),
    ],
    # N-15: la nota se autorreferencia; el diagrama de estados es la Figura 2
    'Figura 5': [
        ((554, 570),
         '- El campo Estado alimenta el diagrama de estados de la Figura 2.', ITALICA),
    ],
    # N-19: coletilla sobre el historial de revision del documento + encabezado
    # dirigido al corrector. El resto de las figuras encabeza con «Nota.» (APA).
    'Figura 4': [
        ((548, 562), 'Nota.', NEGRITA),
        ((629, 645),
         '- Cloudinary es un paso intermedio obligatorio para el flujo de video '
         '(Anexo B.9, C.6).', ITALICA),
    ],
    'Figura 1': [((653, 668), 'Nota.', NEGRITA)],
    'Figura 6': [((708, 723), 'Nota.', NEGRITA)],
    # no lo marca el dictamen, pero la nota interna repite la contradiccion de N-01/N-02:
    # declara «pendiente de medición formal» lo que el §5.1 mide
    'Figura 3': [
        ((590, 606),
         '  se midió en un 73,6 % (n = 12; §5.1), por encima del 70 % planteado como hipótesis '
         'en §4.2 (protocolo en Anexo E).', ITALICA),
    ],
}


doc = docx.Document(SRC)

# mapa parrafo-con-imagen -> rotulo de la figura que le sigue
rotulos = {i: p.text.strip().split('.')[0]
           for i, p in enumerate(doc.paragraphs)
           if p.style.name == 'Normal' and p.text.strip().startswith('Figura ')}

hechas = []
for i, p in enumerate(doc.paragraphs):
    if 'graphicData' not in p._p.xml:
        continue
    posteriores = [k for k in rotulos if k > i]
    if not posteriores:
        continue
    rotulo = rotulos[min(posteriores)]
    if rotulo not in PARCHES:
        continue
    blip = p._p.find('.//' + qn('a:blip'))
    part = doc.part.related_parts[blip.get(qn('r:embed'))]
    im = Image.open(io.BytesIO(part.blob)).convert('RGB')
    print(f'{rotulo} (parrafo {i}, {im.size[0]}x{im.size[1]}):')
    for banda, texto, fuente in PARCHES[rotulo]:
        reescribir_linea(im, banda, texto, fuente=fuente)
    buf = io.BytesIO()
    im.save(buf, format='PNG')
    part._blob = buf.getvalue()
    hechas.append(rotulo)

doc.save(OUT)
print(f'\nparcheadas: {hechas}')
print(f'GUARDADO: {OUT}')
if sorted(hechas) != sorted(PARCHES):
    print('*** FALTAN FIGURAS ***')
    sys.exit(1)
