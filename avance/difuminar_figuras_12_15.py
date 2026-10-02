# -*- coding: utf-8 -*-
"""Difumina el arte de la marca en las capturas de las Figuras 12 a 15 (N-03 de la devolución del
29-09-2026). Las Pautas prohíben modificar el material de la Compañía «en modo alguno», y estas
capturas muestran ese material con placas de precio compuestas por los autores.

Se difumina el recuadro de la imagen dentro del chat y se dejan nítidos sólo los recuadros que la
figura necesita mostrar: la placa o la etiqueta de precio que el detector bloquea (12 y 13) y las
especificaciones técnicas que no confunde con un precio (15). En la 14 se difumina la foto entera:
lo que la figura muestra son los copys. Los mensajes del bot no se tocan.

Uso: python difuminar_figuras_12_15.py <carpeta_entrada> <carpeta_salida>
     (las entradas son fig12_0.png … fig15_0.png extraídas del .docx)
"""
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ENT, SAL = Path(sys.argv[1]), Path(sys.argv[2])
SAL.mkdir(parents=True, exist_ok=True)

# (izq, arriba, der, abajo) en píxeles de cada captura
FIGURAS = {
    12: {'imagen': (50, 40, 481, 471), 'nitido': [(276, 280, 470, 420)]},
    13: {'imagen': (50, 82, 479, 511), 'nitido': [(218, 402, 292, 458)]},
    14: {'imagen': (48, 3, 479, 433), 'nitido': []},
    15: {'imagen': (50, 5, 481, 436), 'nitido': [(160, 262, 250, 290), (296, 266, 378, 292),
                                                 (150, 314, 248, 334), (296, 314, 372, 334)]},
}
RADIO = 16

for n, cfg in FIGURAS.items():
    im = Image.open(ENT / f'fig{n}_0.png').convert('RGB')
    caja = cfg['imagen']
    original = im.crop(caja)
    difuminada = original.filter(ImageFilter.GaussianBlur(RADIO))
    for (x0, y0, x1, y1) in cfg['nitido']:        # coordenadas absolutas → relativas a la caja
        rel = (x0 - caja[0], y0 - caja[1], x1 - caja[0], y1 - caja[1])
        difuminada.paste(original.crop(rel), rel[:2])
    im.paste(difuminada, caja[:2])
    im.save(SAL / f'Figura_{n}.png')
    print(f'Figura {n}: {im.size}, {len(cfg["nitido"])} recuadros nítidos')
