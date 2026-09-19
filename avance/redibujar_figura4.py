# -*- coding: utf-8 -*-
"""Redibuja la Figura 4 (diagrama C4 de contexto y contenedores) — B-3 del dictamen.

Qué estaba mal. El «Bot de Telegram (CUI)» y la «Persistencia (Google Sheets)» estaban
dibujados DENTRO del recuadro «Sistema Postly (VPS auto-hospedado)», y ninguno de los dos
corre ahí: el bot vive en la infraestructura de Telegram y la persistencia, en la de Google.
Y la flecha «publica» salía del Módulo Centinela hacia Meta, cuando el §4.3.1 asigna esa
responsabilidad a la capa de integración, que en esta arquitectura es el propio orquestador.

Qué se hace. Se redibuja la figura entera con la misma paleta y la misma tipografía: el
recuadro del VPS contiene sólo lo que corre en el VPS —orquestador, Módulo Centinela y los
dos Cron— y todo lo demás pasa a la columna de servicios externos. La flecha «publica» sale
del orquestador. La nota conserva sus cuatro líneas y suma una quinta que declara la
frontera.

Uso: python redibujar_figura4.py <salida.png>
"""
import sys

from PIL import Image, ImageDraw, ImageFont

SALIDA = sys.argv[1] if len(sys.argv) > 1 else '_figuras/Figura_4_corregida.png'

W, H = 1421, 706
REGULAR = 'C:/Windows/Fonts/segoeui.ttf'
NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'
ITALICA = 'C:/Windows/Fonts/segoeuii.ttf'

f_caja = ImageFont.truetype(NEGRITA, 15)
f_sub = ImageFont.truetype(ITALICA, 13)
f_ext = ImageFont.truetype(REGULAR, 15)
f_borde = ImageFont.truetype(NEGRITA, 15)
f_flecha = ImageFont.truetype(REGULAR, 11)
f_nota = ImageFont.truetype(ITALICA, 12)
f_nota_tit = ImageFont.truetype(NEGRITA, 12)

TINTA = (60, 60, 60)
AZUL_B, AZUL_F = (31, 78, 121), (222, 235, 247)
ROJO_B, ROJO_F = (192, 0, 0), (253, 233, 233)
GRIS_B, GRIS_F = (120, 120, 120), (240, 240, 240)
NARANJA_B, NARANJA_F = (191, 143, 0), (255, 242, 204)
VERDE_B, VERDE_F = (84, 130, 53), (233, 245, 229)
VIOLETA_B, VIOLETA_F = (112, 96, 180), (238, 236, 252)

im = Image.new('RGB', (W, H), 'white')
dr = ImageDraw.Draw(im)


def caja(x0, y0, x1, y1, borde, relleno, titulo, sub=None, f_tit=f_caja):
    dr.rounded_rectangle([x0, y0, x1, y1], radius=10, fill=relleno, outline=borde, width=2)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    if sub:
        dr.text((cx, cy - 10), titulo, font=f_tit, fill=TINTA, anchor='mm')
        dr.text((cx, cy + 10), sub, font=f_sub, fill=TINTA, anchor='mm')
    else:
        lineas = titulo.split(chr(10))
        for k, l in enumerate(lineas):
            dr.text((cx, cy - 9 * (len(lineas) - 1) + k * 18), l, font=f_tit, fill=TINTA,
                    anchor='mm')


def etiqueta_en(x, y, texto):
    """Rótulo con halo blanco, para que se lea aunque lo cruce una línea."""
    a = dr.textbbox((x, y), texto, font=f_flecha, anchor='mm')
    dr.rectangle([a[0] - 3, a[1] - 2, a[2] + 3, a[3] + 2], fill='white')
    dr.text((x, y), texto, font=f_flecha, fill=TINTA, anchor='mm')


def flecha(p0, p1, etiqueta=None, t=0.5, dy=-10, en_x=None):
    import math
    dr.line([p0, p1], fill=(40, 40, 40), width=2)
    ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
    for s in (0.42, -0.42):
        dr.line([p1, (p1[0] - 11 * math.cos(ang + s), p1[1] - 11 * math.sin(ang + s))],
                fill=(40, 40, 40), width=2)
    if not etiqueta:
        return
    if en_x is not None and p1[0] != p0[0]:      # rótulo a una abscisa fija del trazo
        t = (en_x - p0[0]) / (p1[0] - p0[0])
    mx = p0[0] + (p1[0] - p0[0]) * t
    my = p0[1] + (p1[1] - p0[1]) * t + dy
    etiqueta_en(mx, my, etiqueta)


# ── frontera del VPS: sólo lo que corre en el VPS ─────────────────────────────
VX0, VY0, VX1, VY1 = 500, 20, 945, 470
dr.rectangle([VX0, VY0, VX1, VY1], outline=(31, 78, 121), width=2)
dr.text((VX0 + 14, VY0 + 12), 'Sistema Postly (instancia auto-hospedada)', font=f_borde,
        fill=(31, 78, 121))

# ── lo que NO corre en el VPS ─────────────────────────────────────────────────
caja(20, 60, 215, 130, NARANJA_B, NARANJA_F, 'Consultora de Belleza' + chr(10) + 'Independiente')
caja(255, 60, 455, 130, AZUL_B, AZUL_F, 'Bot de Telegram (CUI)', f_tit=f_ext)
dr.text((355, 142), 'infraestructura de Telegram', font=f_sub, fill=TINTA, anchor='mm')

dr.text((1195, 34), 'Servicios externos (infraestructura de terceros)', font=f_sub,
        fill=TINTA, anchor='mm')
caja(990, 60, 1400, 122, VERDE_B, VERDE_F, 'Google Gemini 2.5 Flash', f_tit=f_ext)
caja(990, 150, 1400, 212, ROJO_B, ROJO_F, 'Meta Graph API (Instagram / Facebook)',
     f_tit=f_ext)
caja(990, 240, 1400, 302, VIOLETA_B, VIOLETA_F,
     'Cloudinary (almacenamiento intermedio de imagen y video)', f_tit=f_ext)
caja(990, 330, 1400, 392, GRIS_B, GRIS_F,
     'Persistencia (Google Sheets)' + chr(10) + 'almacenamiento tabular', f_tit=f_ext)

# ── dentro del VPS ────────────────────────────────────────────────────────────
caja(525, 65, 920, 135, AZUL_B, AZUL_F, 'Orquestador n8n', '~195 nodos, 1 proceso, SQLite')
caja(525, 195, 790, 265, ROJO_B, ROJO_F, 'Módulo Centinela', 'RegEx + OCR/visión')
caja(525, 330, 920, 398, GRIS_B, GRIS_F,
     'Cron: Programador (5 min) · Feedback Loop (24 h)', f_tit=f_ext)

# ── flujos ────────────────────────────────────────────────────────────────────
flecha((217, 95), (251, 95))
etiqueta_en(234, 82, 'usa')
flecha((457, 82), (521, 88), 'webhook', dy=-12)
flecha((521, 112), (457, 106), 'mensajes', dy=6)
flecha((620, 137), (620, 193))
etiqueta_en(596, 165, 'audita')
flecha((700, 193), (700, 137), None)
etiqueta_en(735, 165, 'veredicto')
flecha((860, 328), (860, 137), None)
etiqueta_en(886, 240, 'dispara')
flecha((922, 82), (986, 91), 'analiza / genera', en_x=963, dy=-12)
flecha((922, 98), (986, 181), 'publica', en_x=963, dy=0)
flecha((922, 112), (986, 271), 'sube el activo', en_x=963, dy=0)
flecha((922, 126), (986, 361), 'lee/escribe', en_x=963, dy=0)

# ── nota ──────────────────────────────────────────────────────────────────────
NY = 520
dr.text((20, NY), 'Nota.', font=f_nota_tit, fill=TINTA)
LINEAS = [
    '- Un único workflow principal orquesta todo el flujo (§4.3, Anexo B.2); no hay '
    'despliegue independiente por contenedor.',
    '- El Módulo Centinela se ejecuta como nodos de función dentro del mismo proceso n8n, '
    'no como un servicio separado.',
    '- El bot de Telegram y la persistencia corren en infraestructura de terceros: quedan '
    'fuera de la frontera del sistema.',
    '- La publicación la emite el orquestador, que cumple el papel de capa de integración '
    '(§4.3.1); el Centinela audita y no publica.',
    '- Cloudinary es un paso intermedio obligatorio en todos los flujos que publican: cada '
    'imagen y cada video se suben allí para que la Graph API',
    '  pueda descargarlos (§4.7.2; Anexos B.9, C.6 y E.5). La persistencia no es una base '
    'relacional (Anexo B.5).',
]
for k, l in enumerate(LINEAS):
    dr.text((20, NY + 26 + k * 26), l, font=f_nota, fill=TINTA)

im.save(SALIDA)
print(f'GUARDADO: {SALIDA}  ({im.size[0]}x{im.size[1]})')
