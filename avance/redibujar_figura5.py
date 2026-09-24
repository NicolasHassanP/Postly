# -*- coding: utf-8 -*-
"""Redibuja la Figura 5 (modelo de datos) con el esquema que la hoja tiene de verdad.

**Dos cosas estaban mal, y la segunda no la vio el dictamen.**

La que sí vio (§7): la figura mostraba dos hojas y la persistencia tiene tres. La hoja
`Config` —que guarda la firma y el contacto de la consultora, y que el §3.7.1 y el Anexo B.4
describen— no aparecía.

La que no: los nombres de los campos eran conceptuales y no los de la hoja. La figura ponía
`UUID_Usuaria (PK)` y `ChatID_Telegram` como dos campos distintos, y en la hoja hay uno solo:
`TelegramUserID`, que es el identificador de Telegram y a la vez la clave por la que se filtra
la multitenencia. De ahí salía el hallazgo M-10 del dictamen, que contaba tres nombres para
una misma clave —«UUID», «Chat ID» e «ID del usuario de Telegram»—: dos de los tres venían de
esta figura. Un modelo de datos que nombra campos que la tabla no tiene no es una
simplificación de notación, es otra tabla.

Los nombres de este archivo se leen del workflow desplegado: de las columnas que los nodos de
Google Sheets escriben y de la `lookupColumn` con que filtran.

Uso: python redibujar_figura5.py <salida.png>
"""
import sys

from PIL import Image, ImageDraw, ImageFont

SALIDA = sys.argv[1] if len(sys.argv) > 1 else '_figuras/Figura_5_v3.png'

W, H = 1104, 572
REGULAR = 'C:/Windows/Fonts/segoeui.ttf'
NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'
ITALICA = 'C:/Windows/Fonts/segoeuii.ttf'

f_tit = ImageFont.truetype(NEGRITA, 13)
f_campo = ImageFont.truetype(REGULAR, 12)
f_pk = ImageFont.truetype(NEGRITA, 12)
f_nota = ImageFont.truetype(ITALICA, 12)
f_card = ImageFont.truetype(NEGRITA, 12)

AZUL = (31, 60, 94)
FILA_A, FILA_B = (255, 255, 255), (244, 247, 252)
TINTA = (40, 40, 40)

im = Image.new('RGB', (W, H), 'white')
d = ImageDraw.Draw(im)


def tabla(x, y, ancho, titulo, campos):
    alto_fila = 30
    d.rectangle((x, y, x + ancho, y + alto_fila), fill=AZUL)
    d.text((x + ancho / 2, y + alto_fila / 2), titulo, font=f_tit, fill='white', anchor='mm')
    for k, (campo, es_pk) in enumerate(campos):
        fy = y + alto_fila + k * alto_fila
        d.rectangle((x, fy, x + ancho, fy + alto_fila),
                    fill=FILA_A if k % 2 == 0 else FILA_B, outline=(220, 224, 230))
        d.text((x + 14, fy + alto_fila / 2), campo,
               font=f_pk if es_pk else f_campo, fill=TINTA, anchor='lm')
    return y + alto_fila + len(campos) * alto_fila


USUARIOS = [('TelegramUserID (PK)', True), ('AccessToken (cifrado AES-256-GCM)', False),
            ('ExpiresAt', False), ('IGAccountID', False), ('PageID', False),
            ('PageName', False)]
POSTS = [('UserID (FK → TelegramUserID)', True), ('Timestamp', False),
         ('ImageURL · Carousel_URLs', False), ('Copy_Op1 · Copy_Op2 · Copy_Op3', False),
         ('Copy_Final', False), ('Status (Pendiente/Programado/Publicado/Fallido)', False),
         ('Fecha_Programada', False), ('PostID_IG · PostID_FB', False),
         ('Likes · Comments · Reach', False), ('Metricas_Enviadas', False)]
CONFIG = [('firma', False), ('contacto', False)]

fin_u = tabla(30, 30, 420, 'Usuarios (gid = 600115356)', USUARIOS)
fin_p = tabla(650, 30, 424, 'Hoja 1 — Posts (gid = 0)', POSTS)
fin_c = tabla(30, fin_u + 40, 420, 'Config (gid = 1036323678)', CONFIG)

# ── la relación 1–N ─────────────────────────────────────────────────────────
y = 30 + 30 + 15
d.line((450, y, 650, y + 30), fill=(60, 60, 60), width=1)
d.text((478, y - 6), '1', font=f_card, fill=TINTA, anchor='mm')
d.text((624, y + 22), 'N', font=f_card, fill=TINTA, anchor='mm')

# ── nota ────────────────────────────────────────────────────────────────────
NY = max(fin_p, fin_c) + 34
d.text((30, NY), 'Nota.', font=ImageFont.truetype(NEGRITA, 12), fill=TINTA)
LINEAS = [
    '- Los nombres son los de las columnas de la hoja, leídos del workflow desplegado '
    '(Anexo B.4). TelegramUserID es el identificador que Telegram asigna a la',
    '  conversación, y es a la vez la clave por la que se filtra la multitenencia: no hay un '
    'identificador interno distinto de él (§4.4.2).',
    '- No es un modelo relacional con integridad referencial declarada ni transacciones ACID: '
    'la relación UserID → TelegramUserID se resuelve por lookup en',
    '  tiempo de ejecución y no por una restricción de clave foránea del motor (§2.3, '
    'Anexo B.5).',
    '- AccessToken se cifra con AES-256-GCM antes de escribirse en la hoja (Anexo B.3). '
    'Config tiene una sola fila de datos y alimenta la firma y el contacto',
    '  que el sistema concatena a cada publicación (Anexo B.4).',
    '- El campo Status alimenta el diagrama de estados de la Figura 2.',
]
for k, linea in enumerate(LINEAS):
    d.text((30, NY + 24 + k * 17), linea, font=f_nota, fill=(70, 70, 70))

im.save(SALIDA)
print(f'escrita: {SALIDA}  ({im.size[0]}×{im.size[1]})')
