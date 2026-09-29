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

**Pasada 158 (dictamen 13, B-11).** Cloudinary entra como sexto participante: el activo
se sube allí y la Graph API lo descarga desde su URL pública (pasos 12 y 13). La nota sale
del bitmap.

**Pasada 169 (dictamen 14, N-06).** La subida a Cloudinary pasa de los pasos 12-13 a los 2-3:
en la imagen única el nodo «HTTP Request» sube la imagen antes de «HU8: Detección visual», que la
lee por su URL pública, y la Graph API descarga esa misma URL al publicar (workflow del repo:
Code in JavaScript → HTTP Request → HU8: Detección visual). En el video la subida sí es posterior
a la detección (Anexo B.9). El diagrama representa la imagen única.

Uso: python redibujar_figura6.py <salida.png>
"""
import sys

from PIL import Image, ImageDraw, ImageFont

SALIDA = sys.argv[1] if len(sys.argv) > 1 else '_figuras/Figura_6_corregida.png'

W, H = 1334, 784
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
    ('Usuaria', 110),
    ('Bot (n8n)', 330),
    ('Gemini 2.5 Flash', 560),
    ('Módulo Centinela', 790),
    ('Cloudinary', 1015),
    ('Meta Graph API', 1230),
]
CAJA_Y0, CAJA_Y1 = 18, 54
VIDA_Y1 = 770

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
    (76, 'Usuaria', 'Bot (n8n)', '1. envía la imagen del producto', False),
    (120, 'Bot (n8n)', 'Cloudinary', '2. sube la imagen', False),
    (164, 'Cloudinary', 'Bot (n8n)', '3. URL pública de la imagen', True),
    (208, 'Bot (n8n)', 'Módulo Centinela', '4. invoca la auditoría visual (HU8) con esa URL', False),
    (252, 'Módulo Centinela', 'Gemini 2.5 Flash', '5. analiza la imagen (llamada de visión)', False),
    (296, 'Gemini 2.5 Flash', 'Módulo Centinela', '6. sin precio incrustado', True),
    (340, 'Módulo Centinela', 'Bot (n8n)', '7. veredicto visual', True),
    (384, 'Bot (n8n)', 'Gemini 2.5 Flash', '8. solicita 3 copys (segunda llamada)', False),
    (428, 'Gemini 2.5 Flash', 'Bot (n8n)', '9. copys generados (JSON)', True),
    (472, 'Bot (n8n)', 'Usuaria', '10. presenta 3 opciones de tono (HITL)', True),
    (516, 'Usuaria', 'Bot (n8n)', '11. selecciona tono / edita texto', False),
    (560, 'Bot (n8n)', 'Módulo Centinela', '12. audita el texto final (HU7, RegEx)', False),
    (604, 'Módulo Centinela', 'Bot (n8n)', '13. veredicto textual: aprobado', True),
    (648, 'Bot (n8n)', 'Meta Graph API', '14. publica con la firma; la API descarga la URL', False),
    (692, 'Meta Graph API', 'Bot (n8n)', '15. ID de publicación', True),
    (736, 'Bot (n8n)', 'Usuaria', '16. confirma publicación (estado: Publicado)', True),
]
for y, desde, hasta, texto, vuelta in PASOS:
    flecha(y, desde, hasta, texto, vuelta)

# ── nota ──: desde la pasada 158 va como texto bajo la figura (APA), no en el bitmap.

im.save(SALIDA)
print(f'escrita: {SALIDA}  ({im.size[0]}×{im.size[1]})')
