# -*- coding: utf-8 -*-
"""Redibuja la Figura 1 (secuencia de vinculación OAuth 2.0) — M9 del dictamen 8.

Qué estaba mal. El diagrama fundía dos canjes en uno y omitía el tercero. Mostraba «5. POST:
intercambia código por access token» y «6. access token de larga duración», como si el código
se canjeara directamente por el token largo, y no mostraba en ningún paso el **token de
página**, que es con el que el sistema publica y el único cuya vigencia el §5.1 midió.

El flujo real está en el workflow «Postly - HU2 OAuth Callback» y tiene tres peticiones
encadenadas: `Intercambiar code` (código → token de usuaria de corta duración), `Token largo`
(`grant_type=fb_exchange_token` → token de usuaria de larga duración) y `Page Token`
(`GET /{page-id}?fields=access_token` → token de página). Recién ese tercero se cifra y se
persiste.

Que el diagrama omitiera el token de página no era un detalle: el §6.1 y la Tabla 13 discuten
justamente su vigencia, y la figura que explica el flujo no lo mostraba.

Uso: python redibujar_figura1.py <salida.png>
"""
import sys

from PIL import Image, ImageDraw, ImageFont

SALIDA = sys.argv[1] if len(sys.argv) > 1 else '_figuras/Figura_1_corregida.png'

W, H = 1355, 738
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

PARTICIPANTES = [
    ('Usuaria', 215),
    ('Bot (n8n)', 546),
    ('Meta (Auth. Server)', 876),
    ('Meta Graph API (Resource Server)', 1205),
]
CAJA_Y0, CAJA_Y1 = 18, 54
VIDA_Y1 = 632

for nombre, x in PARTICIPANTES:
    ancho = d.textlength(nombre, font=f_caja) + 30
    d.rounded_rectangle((x - ancho / 2, CAJA_Y0, x + ancho / 2, CAJA_Y1), radius=6,
                        fill=AZUL_RELLENO, outline=AZUL_BORDE, width=2)
    d.text((x, (CAJA_Y0 + CAJA_Y1) / 2), nombre, font=f_caja, fill=AZUL_BORDE, anchor='mm')
    d.line((x, CAJA_Y1 + 6, x, VIDA_Y1), fill=LINEA, width=1)

X = {nombre: x for nombre, x in PARTICIPANTES}


def flecha(y, desde, hasta, texto, vuelta=False, punteada=False):
    x0, x1 = X[desde], X[hasta]
    color = VUELTA if vuelta else IDA
    if punteada:
        paso, pos = 12, min(x0, x1)
        while pos < max(x0, x1):
            d.line((pos, y, min(pos + 7, max(x0, x1)), y), fill=color, width=1)
            pos += paso
    else:
        d.line((x0, y, x1, y), fill=color, width=1)
    punta = 7 if x1 > x0 else -7
    d.polygon([(x1, y), (x1 - punta, y - 5), (x1 - punta, y + 5)], fill=color)
    d.text(((x0 + x1) / 2, y - 9), texto, font=f_msg, fill=color, anchor='mm')


def auto(y, quien, texto):
    """Mensaje del participante a sí mismo: un lazo a la derecha de su línea de vida."""
    x = X[quien]
    d.line((x, y, x + 58, y), fill=IDA, width=1)
    d.line((x + 58, y, x + 58, y + 22), fill=IDA, width=1)
    d.line((x + 58, y + 22, x + 6, y + 22), fill=IDA, width=1)
    d.polygon([(x, y + 22), (x + 8, y + 17), (x + 8, y + 27)], fill=IDA)
    d.text((x + 68, y + 11), texto, font=f_msg, fill=IDA, anchor='lm')


PASOS = [
    (82, 'Usuaria', 'Bot (n8n)', '1. /start → solicita vincular cuenta', False, False),
    (124, 'Bot (n8n)', 'Usuaria', '2. botón Inline Keyboard (deep link)', True, False),
    (166, 'Usuaria', 'Meta (Auth. Server)', '3. inicia sesión y autoriza el acceso', False, False),
    (208, 'Meta (Auth. Server)', 'Bot (n8n)', '4. redirect con código de autorización (callback)', True, False),
    (250, 'Bot (n8n)', 'Meta (Auth. Server)', '5. POST: canjea el código por un token de usuaria', False, False),
    (292, 'Meta (Auth. Server)', 'Bot (n8n)', '6. token de usuaria, de corta duración', True, False),
    (334, 'Bot (n8n)', 'Meta (Auth. Server)', '7. POST fb_exchange_token: pide la versión larga', False, False),
    (376, 'Meta (Auth. Server)', 'Bot (n8n)', '8. token de usuaria de larga duración', True, False),
    (418, 'Bot (n8n)', 'Meta Graph API (Resource Server)', '9. GET /{page-id}?fields=access_token', False, False),
    (460, 'Meta Graph API (Resource Server)', 'Bot (n8n)', '10. token de página, sin campo de expiración', True, False),
]
for y, desde, hasta, texto, vuelta, punteada in PASOS:
    flecha(y, desde, hasta, texto, vuelta, punteada)

auto(496, 'Bot (n8n)', '11. cifra el token de página (AES-256-GCM) y lo persiste en Sheets')
flecha(556, 'Bot (n8n)', 'Usuaria', '12. confirmación de vinculación exitosa', vuelta=True)
flecha(600, 'Bot (n8n)', 'Meta Graph API (Resource Server)',
       '13. usa el token de página en cada publicación posterior', punteada=True)

# ── nota ────────────────────────────────────────────────────────────────────
d.text((20, 658), 'Nota.', font=f_nota_tit, fill=(40, 40, 40))
LINEAS = [
    '- Los tres canjes son peticiones distintas del workflow de callback: código → token de '
    'usuaria, token de usuaria → versión larga, y de ahí al token de página.',
    '- El token que el sistema usa al publicar es el de página, y es el único cuya vigencia '
    'mide el §5.1: la Graph API lo devuelve sin campo de expiración (Tabla 13, HU2).',
    '- El token nunca es visible ni ingresado manualmente por la usuaria (Anexo B.3). OAuth '
    '2.0 delega autorización; no provee no repudio ni autenticación del bot ante ella (§2.3).',
]
for k, linea in enumerate(LINEAS):
    d.text((20, 680 + k * 17), linea, font=f_nota, fill=(70, 70, 70))

im.save(SALIDA)
print(f'escrita: {SALIDA}  ({im.size[0]}×{im.size[1]})')
