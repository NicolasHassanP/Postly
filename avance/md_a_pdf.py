# -*- coding: utf-8 -*-
"""
Convierte el dictamen en Markdown a PDF, para lectura cómoda.

No hay pandoc en esta máquina; esto usa reportlab, que sí está. Cubre lo que un dictamen
usa: encabezados de tres niveles, párrafos, listas, tablas, citas en bloque, reglas
horizontales, negrita, cursiva y `código`. Las tablas se ajustan al ancho de la página y
parten entre páginas.

Uso: python md_a_pdf.py <archivo.md> [salida.pdf]
"""
import html
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (HRFlowable, KeepTogether, PageBreak, Paragraph,
                                SimpleDocTemplate, Spacer, Table, TableStyle)

ENTRADA = Path(sys.argv[1])
SALIDA = Path(sys.argv[2]) if len(sys.argv) > 2 else ENTRADA.with_suffix('.pdf')

ss = getSampleStyleSheet()
BASE = ParagraphStyle('base', parent=ss['BodyText'], fontName='Helvetica', fontSize=9.2,
                      leading=13.2, alignment=TA_JUSTIFY, spaceAfter=6)
H = {
    1: ParagraphStyle('h1', parent=BASE, fontName='Helvetica-Bold', fontSize=17, leading=21,
                      spaceBefore=16, spaceAfter=9, alignment=0,
                      textColor=colors.HexColor('#111111')),
    2: ParagraphStyle('h2', parent=BASE, fontName='Helvetica-Bold', fontSize=13, leading=17,
                      spaceBefore=14, spaceAfter=7, alignment=0,
                      textColor=colors.HexColor('#1a1a1a')),
    3: ParagraphStyle('h3', parent=BASE, fontName='Helvetica-Bold', fontSize=10.8, leading=14,
                      spaceBefore=11, spaceAfter=5, alignment=0,
                      textColor=colors.HexColor('#333333')),
}
for n in (4, 5, 6):
    H[n] = H[3]
LISTA = ParagraphStyle('li', parent=BASE, leftIndent=13, bulletIndent=3, spaceAfter=3)
CITA = ParagraphStyle('cita', parent=BASE, leftIndent=14, rightIndent=8, fontName='Helvetica-Oblique',
                      textColor=colors.HexColor('#444444'), spaceBefore=4, spaceAfter=6)
CELDA = ParagraphStyle('td', parent=BASE, fontSize=7.9, leading=10.2, alignment=0, spaceAfter=0)
CELDA_H = ParagraphStyle('th', parent=CELDA, fontName='Helvetica-Bold')


def inline(t):
    """Marcado de línea a las etiquetas que entiende reportlab."""
    t = html.escape(t, quote=False)
    t = re.sub(r'`([^`]+)`', r'<font face="Courier" size="8.4">\1</font>', t)
    t = re.sub(r'\*\*\*(.+?)\*\*\*', r'<b><i>\1</i></b>', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<i>\1</i>', t)
    t = re.sub(r'(?<![\w*])_(?!_)(.+?)(?<!_)_(?![\w*])', r'<i>\1</i>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<link href="\2" color="#1a56a8">\1</link>', t)
    return t


def fila(linea):
    partes = [c.strip() for c in linea.strip().strip('|').split('|')]
    return partes


def tabla(bloque, ancho):
    filas = [fila(l) for l in bloque if not re.match(r'^\s*\|?[\s:|-]+\|[\s:|-]*$', l)]
    if not filas:
        return None
    ncol = max(len(f) for f in filas)
    filas = [f + [''] * (ncol - len(f)) for f in filas]
    datos = [[Paragraph(inline(c), CELDA_H if i == 0 else CELDA) for c in f]
             for i, f in enumerate(filas)]
    # ancho proporcional al contenido, con mínimo y máximo
    largos = [max(len(f[j]) for f in filas) for j in range(ncol)]
    tot = sum(largos) or 1
    anchos = [max(1.6 * cm, min(ancho * 0.55, ancho * l / tot)) for l in largos]
    k = ancho / sum(anchos)
    anchos = [a * k for a in anchos]
    t = Table(datos, colWidths=anchos, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eef1f5')),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#c2c8d0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3), ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fafbfc')]),
    ]))
    return t


def construir(texto, ancho):
    flow, i = [], 0
    lineas = texto.replace('\r\n', '\n').split('\n')
    while i < len(lineas):
        l = lineas[i]
        # bloque de código cercado: se vuelca monoespaciado, sin marcado
        if l.lstrip().startswith('```'):
            i += 1
            buf = []
            while i < len(lineas) and not lineas[i].lstrip().startswith('```'):
                buf.append(html.escape(lineas[i], quote=False)); i += 1
            i += 1
            if buf:
                flow.append(Paragraph(
                    '<font face="Courier" size="8">' + '<br/>'.join(buf) + '</font>',
                    ParagraphStyle('code', parent=BASE, alignment=0, leftIndent=8,
                                   backColor=colors.HexColor('#f6f7f9'), borderPadding=5)))
                flow.append(Spacer(1, 5))
            continue
        # tabla
        if l.strip().startswith('|') and i + 1 < len(lineas) and re.match(
                r'^\s*\|?[\s:|-]+\|[\s:|-]*$', lineas[i + 1]):
            bloque = []
            while i < len(lineas) and lineas[i].strip().startswith('|'):
                bloque.append(lineas[i]); i += 1
            t = tabla(bloque, ancho)
            if t is not None:
                flow.append(Spacer(1, 3)); flow.append(t); flow.append(Spacer(1, 8))
            continue
        # regla horizontal
        if re.match(r'^\s*(-{3,}|\*{3,}|_{3,})\s*$', l):
            flow.append(Spacer(1, 5))
            flow.append(HRFlowable(width='100%', thickness=0.6,
                                   color=colors.HexColor('#cccccc')))
            flow.append(Spacer(1, 7)); i += 1; continue
        # encabezado
        m = re.match(r'^(#{1,6})\s+(.*)$', l)
        if m:
            n = len(m.group(1))
            p = Paragraph(inline(m.group(2)), H[n])
            flow.append(p if n > 1 else KeepTogether([p]))
            i += 1; continue
        # cita en bloque
        if l.lstrip().startswith('>'):
            buf = []
            while i < len(lineas) and (lineas[i].lstrip().startswith('>') or
                                       (buf and lineas[i].strip())):
                buf.append(re.sub(r'^\s*>\s?', '', lineas[i])); i += 1
            flow.append(Paragraph(inline(' '.join(x.strip() for x in buf if x.strip())), CITA))
            continue
        # lista
        m = re.match(r'^(\s*)([-*+]|\d+[.)])\s+(.*)$', l)
        if m:
            sangria, marca, resto = m.group(1), m.group(2), m.group(3)
            buf = [resto]; i += 1
            while i < len(lineas) and lineas[i].strip() and not re.match(
                    r'^(\s*)([-*+]|\d+[.)])\s+|^#{1,6}\s|^\s*\||^\s*>', lineas[i]):
                buf.append(lineas[i].strip()); i += 1
            vin = '•' if marca in '-*+' else marca
            est = ParagraphStyle('li2', parent=LISTA,
                                 leftIndent=13 + len(sangria) // 2 * 11,
                                 bulletIndent=3 + len(sangria) // 2 * 11)
            flow.append(Paragraph(inline(' '.join(buf)), est, bulletText=vin))
            continue
        # párrafo
        if l.strip():
            buf = [l.strip()]; i += 1
            while i < len(lineas) and lineas[i].strip() and not re.match(
                    r'^#{1,6}\s|^\s*\||^\s*>|^(\s*)([-*+]|\d+[.)])\s+|^\s*(-{3,}|```)',
                    lineas[i]):
                buf.append(lineas[i].strip()); i += 1
            flow.append(Paragraph(inline(' '.join(buf)), BASE))
            continue
        i += 1
    return flow


def pie(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(colors.HexColor('#777777'))
    canvas.drawRightString(A4[0] - 2 * cm, 1.25 * cm, str(canvas.getPageNumber()))
    canvas.drawString(2 * cm, 1.25 * cm, ENTRADA.stem)
    canvas.restoreState()


def main():
    if not ENTRADA.exists():
        sys.exit(f'no existe {ENTRADA}')
    doc = SimpleDocTemplate(str(SALIDA), pagesize=A4,
                            leftMargin=2 * cm, rightMargin=2 * cm,
                            topMargin=1.9 * cm, bottomMargin=1.9 * cm,
                            title=ENTRADA.stem, author='Auditoría')
    ancho = A4[0] - 4 * cm
    doc.build(construir(ENTRADA.read_text(encoding='utf-8'), ancho),
              onFirstPage=pie, onLaterPages=pie)
    print(f'PDF escrito: {SALIDA}  ({SALIDA.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()
