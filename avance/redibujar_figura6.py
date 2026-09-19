# -*- coding: utf-8 -*-
"""Redibuja la Figura 6 (diagrama de secuencia de creación y publicación) — M9 del dictamen 8.

Qué estaba mal. El diagrama ponía la auditoría de la imagen en el paso 6, **después** de que
la usuaria elige el tono, y junto con la auditoría del texto: «6. audita texto + imagen
(RegEx + OCR)». La implementación no hace eso. La detección visual de HU8 corre **antes** de
generar los copys: si la imagen trae un precio incrustado, el flujo se interrumpe ahí y no se
gasta una inferencia en redactar un texto que no se va a publicar (Anexo B.4, Tabla 9 HU8, y
la cadena que el Anexo E.5 documenta). El canal textual, en cambio, sí corre al publicar.

Un diagrama de secuencia que invierte dos pasos no es un detalle de dibujo: es la afirmación
de que el sistema hace algo que no hace, en la figura que el Cap. 4 usa para explicarlo.

Qué se hace. Se redibuja con la misma paleta, la misma tipografía y los mismos cinco
participantes, con la secuencia real en once pasos: la auditoría visual se separa en los
pasos 2 y 3, la generación de copys pasa a 4 y 5, y la auditoría textual queda en 7, junto a
la firma que el paso 8 concatena por código.

Uso: python redibujar_figura6.py <salida.png>
"""
import sys

from PIL import Image, ImageDraw, ImageFont

SALIDA = sys.argv[1] if len(sys.argv) > 1 else '_figuras/Figura_6_corregida.png'

W, H = 1334, 793
REGULAR = 'C:/Windows/Fonts/segoeui.ttf'
NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'
ITALICA = 'C:/Windows/Fonts/segoeuii.ttf'

f_caja = ImageFont.truetype(NEGRITA, 14)
f_msg = ImageFont.truetype(REGULAR, 12)
f_nota_tit = ImageFont.truetype(NEGRITA, 12)
f_nota = ImageFont.truetype(ITALICA, 12)

AZUL_BORDE = (31, 78, 121)
AZUL_RELLENO = (222, 235, 247)
LINEA = (120, 120, 120)
IDA = (40, 40, 40)
VUELTA = (0, 110, 70)

im = Image.new('RGB', (W, H), 'white')
d = ImageDraw.Draw(im)

# ── participantes ───────────────────────────────────────────────────────────
PARTICIPANTES = [
    ('Usuaria', 182),
    ('Bot (n8n)', 446),
    ('Gemini 2.5 Flash', 710),
    ('Módulo Centinela', 974),
    ('Meta Graph API', 1238),
]
CAJA_Y0, CAJA_Y1 = 18, 54
VIDA_Y1 = 686

for nombre, x in PARTICIPANTES:
    ancho = d.textlength(nombre, font=f_caja) + 36
    d.rounded_rectangle((x - ancho / 2, CAJA_Y0, x + ancho / 2, CAJA_Y1), radius=6,
                        fill=AZUL_RELLENO, outline=AZUL_BORDE, width=2)
    d.text((x, (CAJA_Y0 + CAJA_Y1) / 2), nombre, font=f_caja, fill=AZUL_BORDE, anchor='mm')
    d.line((x, CAJA_Y1 + 6, x, VIDA_Y1), fill=LINEA, width=1)

X = {nombre: x for nombre, x in PARTICIPANTES}


def flecha(y, desde, hasta, texto, vuelta=False):
    """Traza un mensaje entre dos participantes, con su rótulo encima."""
    x0, x1 = X[desde], X[hasta]
    color = VUELTA if vuelta else IDA
    d.line((x0, y, x1, y), fill=color, width=1)
    punta = 7 if x1 > x0 else -7
    d.polygon([(x1, y), (x1 - punta, y - 5), (x1 - punta, y + 5)], fill=color)
    d.text(((x0 + x1) / 2, y - 9), texto, font=f_msg, fill=color, anchor='mm')


# ── la secuencia, en el orden en que el sistema la ejecuta ──────────────────
PASOS = [
    (80, 'Usuaria', 'Bot (n8n)', '1. envía imagen(es) del producto', False),
    (135, 'Bot (n8n)', 'Módulo Centinela', '2. audita la imagen (HU8, visión)', False),
    (190, 'Módulo Centinela', 'Bot (n8n)', '3. veredicto visual: sin precio incrustado', True),
    (245, 'Bot (n8n)', 'Gemini 2.5 Flash', '4. solicita 3 copys', False),
    (300, 'Gemini 2.5 Flash', 'Bot (n8n)', '5. copys generados (JSON)', True),
    (355, 'Bot (n8n)', 'Usuaria', '6. presenta 3 opciones de tono (HITL)', True),
    (410, 'Usuaria', 'Bot (n8n)', '7. selecciona tono / edita texto', False),
    (465, 'Bot (n8n)', 'Módulo Centinela', '8. audita el texto final (HU7, RegEx)', False),
    (520, 'Módulo Centinela', 'Bot (n8n)', '9. veredicto textual: aprobado', True),
    (575, 'Bot (n8n)', 'Meta Graph API', '10. publica con la firma concatenada', False),
    (630, 'Meta Graph API', 'Bot (n8n)', '11. ID de publicación', True),
    (670, 'Bot (n8n)', 'Usuaria', '12. confirma publicación (estado: Publicado)', True),
]
for y, desde, hasta, texto, vuelta in PASOS:
    flecha(y, desde, hasta, texto, vuelta)

# ── nota ────────────────────────────────────────────────────────────────────
d.text((20, 706), 'Nota.', font=f_nota_tit, fill=(40, 40, 40))
LINEAS = [
    '- El orden es el del sistema desplegado: la auditoría visual corre ANTES de generar los '
    'copys, de modo que una imagen con precio incrustado interrumpe el flujo',
    '  sin gastar una inferencia de redacción (Anexo B.4; Tabla 9, HU8). Si cualquiera de las '
    'dos auditorías detecta un precio, se notifica a la usuaria.',
    '- El flujo de video agrega una tercera respuesta —avisar sin bloquear— cuando el recorte '
    'a 9:16 elimina el precio del material publicado (§4.5.1, §5.1).',
    '- La firma legal se concatena por código antes de la publicación: no depende de que el '
    'modelo la incluya (Anexo B.4).',
]
for k, linea in enumerate(LINEAS):
    d.text((20, 728 + k * 16), linea, font=f_nota, fill=(70, 70, 70))

im.save(SALIDA)
print(f'escrita: {SALIDA}  ({im.size[0]}×{im.size[1]})')
