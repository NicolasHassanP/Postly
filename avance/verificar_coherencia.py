# -*- coding: utf-8 -*-
"""Verificador de coherencia interna del documento.

`verificar_documento.py` comprueba frases concretas: las que un dictamen mandó sacar y las
que lo cierran. Esto comprueba otra cosa, que ningún dictamen enumera y que es donde el
documento se rompe solo: que **las remisiones apunten a algo que existe** y que **las cifras
que aparecen en más de un lugar digan lo mismo en todos**.

Nace del patrón que se repitió en las siete auditorías y en las pasadas propias: una
corrección puntual deja viva la afirmación vieja en otro capítulo. Un remito a un apartado
inexistente, una tabla que nadie cita, un número que se actualizó en el §5.1 y no en el
Resumen. Nada de eso lo ve un verificador de frases.

Uso: python verificar_coherencia.py "<documento.docx>"
"""
import re
import sys
from collections import defaultdict

import docx
from docx.oxml.ns import qn

RUTA = sys.argv[1] if len(sys.argv) > 1 else 'Tesis Postly Bontorno Hassan-1 v2.docx'
doc = docx.Document(RUTA)

# El índice general y los de tablas y figuras son campos de Word: repiten cada título y
# cada rótulo, de modo que contarlos como texto duplica todo. Se los excluye por estilo.
ESTILOS_INDICE = {'toc 1', 'toc 2', 'toc 3', 'toc 4', 'table of figures', 'TOC Heading'}
cuerpo = [p for p in doc.paragraphs if p.style.name not in ESTILOS_INDICE]
texto = '\n'.join(p.text for p in cuerpo)
titulos = [p.text.strip() for p in cuerpo if p.style.name.startswith('Heading')]

fallos = []


def check(etq, ok, detalle=''):
    print(f'   {etq:<54} {"OK" if ok else "***"}  {detalle}')
    if not ok:
        fallos.append(f'{etq}: {detalle}')


# ── 1. remisiones a apartados ────────────────────────────────────────────────
print('\n── remisiones a apartados (§)')
# los títulos empiezan con su numeración: «5.1 Validación…», «1.5.2 …»
numeros = set()
for t in titulos:
    m = re.match(r'(\d+(?:\.\d+)*)\s', t)
    if m:
        numeros.add(m.group(1))
        # un remito al §5 vale si existe el §5.1
        partes = m.group(1).split('.')
        for i in range(1, len(partes)):
            numeros.add('.'.join(partes[:i]))
# los capítulos se titulan «CAPÍTULO 5: …» y no «5 …»
for m in re.finditer(r'CAP[IÍ]TULO\s+(\d+)', texto):
    numeros.add(m.group(1))

citados = defaultdict(int)
for m in re.finditer(r'§\s?(\d+(?:\.\d+)*)', texto):
    citados[m.group(1)] += 1
rotos = sorted(n for n in citados if n not in numeros)
check(f'{len(citados)} apartados distintos citados', not rotos,
      'sin destino: ' + ', '.join(f'§{r} (×{citados[r]})' for r in rotos) if rotos else '')

# ── 2. remisiones a anexos ───────────────────────────────────────────────────
print('\n── remisiones a anexos')
anexos = set()
for t in titulos:
    m = re.match(r'(?:Anexo\s+)?([A-E])\.(\d+(?:\.\d+)*)\s', t)
    if m:
        anexos.add(f'{m.group(1)}.{m.group(2)}')
        anexos.add(m.group(1))
    # el Anexo D no tiene apartados: su título es «Anexo D — Pautas…»
    m2 = re.match(r'Anexo\s+([A-E])\s*[—-]', t)
    if m2:
        anexos.add(m2.group(1))
for m in re.finditer(r'Anexo\s+([A-E])\b', texto):
    pass
citados_a = defaultdict(int)
for m in re.finditer(r'Anexos?\s+([A-E](?:\.\d+(?:\.\d+)*)?)(?:\s*(?:y|a|,)\s*([A-E]?\.?\d+(?:\.\d+)*))?', texto):
    citados_a[m.group(1)] += 1
    if m.group(2):
        seg = m.group(2)
        if not seg[0].isalpha():
            seg = m.group(1)[0] + (seg if seg.startswith('.') else '.' + seg)
        citados_a[seg] += 1
rotos_a = sorted(a for a in citados_a if a not in anexos)
check(f'{len(citados_a)} anexos distintos citados', not rotos_a,
      'sin destino: ' + ', '.join(f'{r} (×{citados_a[r]})' for r in rotos_a) if rotos_a else '')

# ── 3. tablas y figuras: que existan y que alguien las cite ──────────────────
print('\n── tablas y figuras')
for clase in ('Tabla', 'Figura'):
    rotulos = {}
    for p in cuerpo:
        m = re.match(rf'{clase}\s+(\d+)\.\s', p.text.strip())
        if m:
            rotulos.setdefault(int(m.group(1)), p.text.strip())
    citas = defaultdict(int)
    for p in cuerpo:
        t = p.text.strip()
        if re.match(rf'{clase}\s+\d+\.\s', t):
            continue          # el rótulo no se cita a sí mismo
        if t.startswith('Nota.'):
            continue          # la nota al pie del cuadro tampoco
        # una remisión puede ser a un rango («las Figuras 12 a 15 ilustran…») o a un par
        # («las Tablas 3 y 4»), y ambas formas citan a cada uno de sus miembros
        for m in re.finditer(rf'\b{clase}s\s+(\d+)\s+(a|y)\s+(\d+)', t):
            a, b = int(m.group(1)), int(m.group(3))
            for n in (range(a, b + 1) if m.group(2) == 'a' else (a, b)):
                citas[n] += 1
        for m in re.finditer(rf'\b{clase}s?\s+(\d+)', t):
            citas[int(m.group(1))] += 1
    existentes = sorted(rotulos)
    esperado = list(range(1, len(existentes) + 1))
    check(f'{clase.lower()}s numeradas sin saltos ({len(existentes)})', existentes == esperado,
          f'numeración: {existentes}' if existentes != esperado else '')
    sin_cita = [n for n in existentes if citas.get(n, 0) < 1]
    check(f'{clase.lower()}s citadas desde el texto', not sin_cita,
          f'sin cita: {sin_cita}' if sin_cita else '')
    fantasma = sorted(n for n in citas if n not in rotulos)
    check(f'citas de {clase.lower()}s que existen', not fantasma,
          f'citadas y ausentes: {fantasma}' if fantasma else '')

    # El número de un rótulo no está escrito: lo calcula un campo `SEQ`. Una sustitución de
    # texto que abarque ese número lo destruye y deja el número escrito a mano, con lo que
    # todos los rótulos siguientes se corren uno. Pasó con la Tabla 5 en la pasada 48 y no
    # se vio hasta abrir Word, así que se comprueba acá.
    sin_campo = [i for i, p in enumerate(cuerpo)
                 if re.match(rf'^{clase} \d+\.', p.text.strip())
                 and not any('SEQ' in (e.text or '')
                             for e in p._p.iter(qn('w:instrText')))]
    check(f'{clase.lower()}s con su campo SEQ intacto', not sin_campo,
          f'rótulos escritos a mano: {sin_campo}' if sin_campo else '')

# ── 4. cifras que viven en más de un lugar ───────────────────────────────────
print('\n── cifras repetidas (deben coincidir en todas sus apariciones)')
CIFRAS = {
    'reducción de tiempo global': r'73,6\s?%',
    'tiempo manual': r'9,4\d?\s*(min|minutos)',
    'tiempo con Postly': r'2,4\d?\s*(min|minutos)',
    'F1 representativo': r'F1[^.]{0,30}0,85',
    'F1 de campo': r'0,923',
    'conjunto ampliado n=20': r'\bn\s*=\s*20\b',
    'casos difíciles n=9': r'\bn\s*=\s*9\b',
    'casos de campo n=29': r'\b29\s+casos\b',
    'casos controlados': r'\b130\s+casos\b',
    'nodos del workflow': r'\b19[0-9]\s*nodos\b',
    'expresiones del canal textual': r'seis expresiones',
    'cuota diaria': r'veinte peticiones|20 (peticiones|llamadas)',
}
for etq, pat in CIFRAS.items():
    n = len(re.findall(pat, texto, re.I))
    print(f'   {etq:<32} {n} apariciones')

# ── 5. números de nodos, que cambian cuando se corrige el sistema ────────────
print('\n── recuentos que dependen del sistema desplegado')
for pat, etq in [(r'(\d{3})\s*nodos', 'nodos del workflow principal'),
                 (r'(\w+|\d+)\s+workflows de n8n', 'workflows'),
                 (r'(cuatro|tres|cinco) flujos que publican', 'flujos que publican')]:
    # «más de 180 nodos» del Anexo C.3 es una cota inferior sobre el desarrollo, no un
    # recuento del sistema entregado: no entra en la comparación.
    vals = sorted({m.group(1) for m in re.finditer(pat, texto, re.I)
                   if 'más de' not in texto[max(0, m.start() - 10):m.start()]})
    check(f'{etq}: un solo valor', len(vals) <= 1, f'valores distintos: {vals}' if len(vals) > 1 else str(vals))

print()
if fallos:
    print(f'*** {len(fallos)} PUNTOS ABIERTOS ***')
    for f in fallos:
        print('  -', f)
    sys.exit(1)
print('sin incoherencias detectables')
