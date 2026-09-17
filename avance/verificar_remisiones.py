# -*- coding: utf-8 -*-
"""
Barrido de REMISIONES ATRIBUTIVAS: las que dicen que otra sección afirma algo.

Es la clase de defecto que ningún verificador de referencias cruzadas detecta, porque la
remisión resuelve —la sección existe— y lo que falla es su contenido. Produjo R4-01 y H-04
en la cuarta instancia, G-02 en la quinta, y una tercera que este mismo barrido encontró
en el Anexo E.4 después de la pasada 17.

No decide: enumera cada remisión con su destino y vuelca el texto de la sección apuntada,
para que la comprobación sea de lectura y no de fe. Correr después de cada pasada.

Uso: python verificar_remisiones.py "<archivo.docx>" [fragmento-para-ver-el-destino]
"""
import re
import sys

import docx

RUTA = sys.argv[1] if len(sys.argv) > 1 else 'Tesis Postly Bontorno Hassan-1 v2.docx'
doc = docx.Document(RUTA)
ps = [p for p in doc.paragraphs
      if not p.style.name.startswith('toc') and p.style.name != 'table of figures']

VERBOS = (r'(?:declara|dice|recoge|menciona|establece|reconoce|documenta|detalla|reporta|'
          r'afirma|describe|registra|invoca|explica|señala|acota|fija|enumera|contrasta)')
DEST = r'(§\d+(?:\.\d+)*|Anexos? [A-E](?:\.\d+)*|Tabla \d+|Figura \d+)'
PAT = [re.compile(r'(?:el |la |los |las )?' + DEST + r'\s+' + VERBOS, re.I),
       re.compile(VERBOS + r'\s+(?:en |el |la )?' + DEST, re.I)]


def nivel(p):
    m = re.search(r'Heading (\d)', p.style.name)
    return int(m.group(1)) if m else None


def cuerpo_de(destino):
    """Texto de la sección apuntada, hasta el siguiente encabezado de igual o menor nivel."""
    clave = destino.replace('§', '').replace('Anexos', 'Anexo').strip()
    num = clave.replace('Anexo ', '')
    out, cap, niv = [], False, None
    for p in ps:
        n = nivel(p)
        if n is not None:
            if not cap and re.match(r'^' + re.escape(num) + r'[ \u00a0—-]', p.text.strip()):
                cap, niv = True, n
                continue
            if cap and n <= niv:
                break
            if cap:
                out.append('### ' + p.text)
                continue
        if cap and p.text.strip():
            out.append(p.text)
    return ' '.join(out)


vistos, sec = [], set()
for p in ps:
    for pat in PAT:
        for m in pat.finditer(p.text):
            ini = max(0, m.start() - 100)
            vistos.append((m.group(1), p.text[ini:m.end() + 130].strip()))
            sec.add(m.group(1))

print(f'remisiones atributivas: {len(vistos)}  ·  destinos distintos: {len(sec)}\n')
for destino, frag in vistos:
    print(f'[{destino}]  …{frag}…\n')

if len(sys.argv) > 2:
    filtro = sys.argv[2]
    print('=' * 72)
    print(f'CONTENIDO DE {filtro}:\n')
    print(cuerpo_de(filtro)[:4000] or '*** no pude aislar esa sección')
