# -*- coding: utf-8 -*-
"""Figura 6 (secuencia de creación asistida por IA y publicación) para página apaisada — T-13 de la
auditoría 16: dibujada a 1334 px e impresa a 15 cm, sus rótulos quedaban en ~4,5–5 pt.

Mismo contenido que redibujar_figura6.py (pasadas 158 y 169), con el trazado de
redibujar_figura1_apaisada.py: 20 cm de ancho a 300 ppp, mensajes a 7,5 pt, cajas a 8,5 pt, y un
rótulo que no entra entre dos líneas de vida se parte en dos renglones. Va en una página apaisada
propia; la nota es texto bajo la figura.

Uso: python redibujar_figura6_apaisada.py <salida.png>
"""
import sys

from PIL import Image, ImageDraw, ImageFont

SALIDA = sys.argv[1]
PPP = 300
pt = lambda x: round(x / 72 * PPP)            # puntos tipográficos → píxeles a 300 ppp
cm = lambda x: round(x / 2.54 * PPP)

W, H = cm(20), cm(12.9)
REGULAR = 'C:/Windows/Fonts/segoeui.ttf'
NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'
f_caja = ImageFont.truetype(NEGRITA, pt(8.5))
f_msg = ImageFont.truetype(REGULAR, pt(7.5))

AZUL_BORDE, AZUL_RELLENO = (31, 78, 121), (222, 235, 247)
LINEA, IDA, VUELTA = (120, 120, 120), (40, 40, 40), (0, 110, 70)
G = max(2, pt(0.6))                            # grosor de línea

im = Image.new('RGB', (W, H), 'white')
d = ImageDraw.Draw(im)

PARTICIPANTES = [('Usuaria', 0.06), ('Bot (n8n)', 0.235), ('Gemini 2.5 Flash', 0.415),
                 ('Módulo Centinela', 0.59), ('Cloudinary', 0.76), ('Meta Graph API', 0.915)]
X = {n: round(f * W) for n, f in PARTICIPANTES}
CAJA_Y0, CAJA_Y1 = pt(4), pt(22)
VIDA_Y1 = H - pt(6)

for nombre, _ in PARTICIPANTES:
    x = X[nombre]
    ancho = d.textlength(nombre, font=f_caja) + pt(12)
    d.rounded_rectangle((x - ancho / 2, CAJA_Y0, x + ancho / 2, CAJA_Y1), radius=pt(3),
                        fill=AZUL_RELLENO, outline=AZUL_BORDE, width=G)
    d.text((x, (CAJA_Y0 + CAJA_Y1) / 2), nombre, font=f_caja, fill=AZUL_BORDE, anchor='mm')
    d.line((x, CAJA_Y1 + pt(2), x, VIDA_Y1), fill=LINEA, width=max(1, G // 2))


def renglones(texto, ancho):
    if d.textlength(texto, font=f_msg) <= ancho:
        return [texto]
    palabras, mejor = texto.split(), None
    for k in range(1, len(palabras)):                       # el corte más parejo
        a, b = ' '.join(palabras[:k]), ' '.join(palabras[k:])
        m = max(d.textlength(a, font=f_msg), d.textlength(b, font=f_msg))
        if mejor is None or m < mejor[0]:
            mejor = (m, [a, b])
    return mejor[1]


def flecha(y, desde, hasta, texto, vuelta=False, punteada=False):
    x0, x1 = X[desde], X[hasta]
    color = VUELTA if vuelta else IDA
    if punteada:
        paso, pos = pt(5), min(x0, x1)
        while pos < max(x0, x1):
            d.line((pos, y, min(pos + pt(3), max(x0, x1)), y), fill=color, width=G)
            pos += paso
    else:
        d.line((x0, y, x1, y), fill=color, width=G)
    p = pt(4) if x1 > x0 else -pt(4)
    d.polygon([(x1, y), (x1 - p, y - pt(2.2)), (x1 - p, y + pt(2.2))], fill=color)
    lineas = renglones(texto, abs(x1 - x0) - pt(8))
    alto = pt(9.5)
    for k, linea in enumerate(lineas):
        cy = y - pt(7.5) - (len(lineas) - 1 - k) * alto
        caja = d.textbbox(((x0 + x1) / 2, cy), linea, font=f_msg, anchor='mm')
        d.rectangle((caja[0] - pt(1), caja[1], caja[2] + pt(1), caja[3]), fill='white')
        d.text(((x0 + x1) / 2, cy), linea, font=f_msg, fill=color, anchor='mm')
    return len(lineas)


def auto(y, quien, texto):
    x = X[quien]
    a, b = pt(20), pt(10)
    for seg in ((x, y, x + a, y), (x + a, y, x + a, y + b), (x + a, y + b, x + pt(2), y + b)):
        d.line(seg, fill=IDA, width=G)
    d.polygon([(x, y + b), (x + pt(4), y + b - pt(2.2)), (x + pt(4), y + b + pt(2.2))], fill=IDA)
    caja = d.textbbox((x + a + pt(4), y + b / 2), texto, font=f_msg, anchor='lm')
    d.rectangle((caja[0] - pt(1), caja[1], caja[2] + pt(1), caja[3]), fill='white')
    d.text((x + a + pt(4), y + b / 2), texto, font=f_msg, fill=IDA, anchor='lm')


PASOS = [
    ('Usuaria', 'Bot (n8n)', '1. envía la imagen del producto', False, False),
    ('Bot (n8n)', 'Cloudinary', '2. sube la imagen', False, False),
    ('Cloudinary', 'Bot (n8n)', '3. URL pública de la imagen', True, False),
    ('Bot (n8n)', 'Módulo Centinela', '4. invoca la auditoría visual (HU8) con esa URL', False, False),
    ('Módulo Centinela', 'Gemini 2.5 Flash', '5. analiza la imagen (llamada de visión)', False, False),
    ('Gemini 2.5 Flash', 'Módulo Centinela', '6. sin precio incrustado', True, False),
    ('Módulo Centinela', 'Bot (n8n)', '7. veredicto visual', True, False),
    ('Bot (n8n)', 'Gemini 2.5 Flash', '8. solicita 3 copys (segunda llamada)', False, False),
    ('Gemini 2.5 Flash', 'Bot (n8n)', '9. copys generados (JSON)', True, False),
    ('Bot (n8n)', 'Usuaria', '10. presenta 3 opciones de tono (HITL)', True, False),
    ('Usuaria', 'Bot (n8n)', '11. selecciona tono / edita texto', False, False),
    ('Bot (n8n)', 'Módulo Centinela', '12. audita el texto final (HU7, RegEx)', False, False),
    ('Módulo Centinela', 'Bot (n8n)', '13. veredicto textual: aprobado', True, False),
    ('Bot (n8n)', 'Meta Graph API', '14. publica con la firma; la API descarga la URL', False, False),
    ('Meta Graph API', 'Bot (n8n)', '15. ID de publicación', True, False),
    ('Bot (n8n)', 'Usuaria', '16. confirma la publicación (estado: Publicado)', True, False),
]
y, paso = CAJA_Y1 + pt(28), pt(16.5)
for k, (desde, hasta, texto, vuelta, punteada) in enumerate(PASOS):
    sig = PASOS[k + 1] if k + 1 < len(PASOS) else None
    flecha(y, desde, hasta, texto, vuelta, punteada)
    if sig is None:
        break
    dos = len(renglones(sig[2], abs(X[sig[1]] - X[sig[0]]) - pt(8))) > 1
    y += paso + (pt(9.5) if dos else 0)
assert y < VIDA_Y1 - pt(4), f'no entra: y={y}, fin={VIDA_Y1}'

im.save(SALIDA, dpi=(PPP, PPP))
print(f'escrita: {SALIDA} ({W}×{H} px = 20 × {H / PPP * 2.54:.1f} cm a {PPP} ppp)')
