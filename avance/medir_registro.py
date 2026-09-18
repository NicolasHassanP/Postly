# -*- coding: utf-8 -*-
"""Densidad de intensificadores por capítulo (B-6 del dictamen de la sexta auditoría).

El dictamen midió que el Capítulo 1 lleva 7,03 intensificadores por mil palabras y los
anexos 0,22: diez veces más promocional. El problema no es cada palabra suelta sino la
densidad, de modo que hace falta medirla para saber cuánto hay que bajar y dónde.

Qué cuenta como intensificador: el adjetivo o adverbio que sube el tono sin agregar
información verificable. No entran los términos técnicos («determinista», «asincrónico»)
ni los que el documento usa con un sentido medido («crítico» en «ruta crítica» no, pero sí
en «hito técnico crítico»); por eso la lista es cerrada y explícita, y se puede discutir
entrada por entrada.

Uso:  python medir_registro.py "<archivo.docx>" [--listar CAPITULO]
"""
import re
import sys
from collections import Counter

import docx

INTENSIFICADORES = [
    # adjetivos de magnitud
    'innegociable', 'insoslayable', 'inobjetable', 'inmutable', 'ineludible',
    'crítico', 'críticos', 'crítica', 'críticas', 'crucial', 'cruciales',
    'severo', 'severa', 'severos', 'severas', 'profundo', 'profunda',
    'robusto', 'robusta', 'robustos', 'robustas', 'riguroso', 'rigurosa',
    'rigurosos', 'rigurosas', 'exhaustivo', 'exhaustiva', 'exhaustivos',
    'exhaustivas', 'estricto', 'estricta', 'estrictos', 'estrictas',
    'sinérgico', 'sinérgica', 'plétora', 'medular', 'medulares',
    'inmenso', 'inmensa', 'enorme', 'enormes', 'radical', 'radicales',
    'pronunciado', 'pronunciada', 'contundente', 'contundentes',
    'sofisticado', 'sofisticada', 'avanzadísimo', 'imperioso', 'imperiosa',
    # adverbios y locuciones
    'drásticamente', 'exponencialmente', 'altamente', 'sumamente',
    'enteramente', 'absolutamente', 'completamente', 'totalmente',
    'radicalmente', 'notablemente', 'significativamente', 'profundamente',
    'rigurosamente', 'estrictamente', 'plenamente', 'ampliamente',
    'satisfactoriamente', 'exitosamente', 'eficazmente', 'proactivamente',
    'sinérgicamente', 'algorítmicamente', 'estratégicamente',
    # sustantivos de énfasis
    'excelencia', 'maestría', 'hito', 'hitos', 'paradigma', 'paradigmas',
    # ── ampliación tras el dictamen 7 (B-8) ──────────────────────────────────
    # La lista original era demasiado cerrada: medía intensificadores y no veía los verbos
    # de garantía ni los adjetivos de venta, que son la otra mitad del registro de folleto.
    # Con ella el Cap. 1 daba 0,67 por mil y el dictamen, con un léxico más ancho, 4,4.
    'anular', 'anula', 'holísticamente', 'holístico', 'holística', 'subyugar', 'subyugue',
    'garantiza', 'garantizan', 'garantizando', 'asegura', 'aseguran', 'asegurando',
    'elimina', 'eliminan', 'eliminando', 'imperdible', 'inigualable', 'revolucionario',
    'revolucionaria', 'potente', 'poderoso', 'poderosa', 'óptimo', 'óptima', 'excepcional',
    'insuperable', 'definitivo', 'definitiva', 'total', 'totales', 'pleno', 'plena',
]
# Estas dos son legítimas en la voz del requisito («el sistema debe garantizar…») y en la
# descripción de una operación real («elimina la condición de carrera»), de modo que la
# densidad que la lista mide es una señal para revisar, no un veredicto por ocurrencia.
# «significativamente» y «significativa» son términos estadísticos cuando acompañan a una
# prueba: se excluyen si la oración menciona una t, una p o la palabra «estadísticamente».
ESTADISTICO = re.compile(r'\bt\(|\bp\s*=|estadísticamente', re.I)

PATRON = re.compile(r'\b(' + '|'.join(sorted(INTENSIFICADORES, key=len, reverse=True)) + r')\b',
                    re.I)
EXCLUIR = ('table of figures', 'TOC Heading')
ROTULO = re.compile(r'^(Tabla|Figura|Nota\.)\s')


def bloques_por_capitulo(doc):
    """[(rótulo, [párrafos])] con Resumen, los 6 capítulos de cuerpo y los anexos."""
    marcas = []
    for i, p in enumerate(doc.paragraphs):
        if p.style.name != 'Heading 1':
            continue
        t = p.text.strip().upper()
        if t == 'RESUMEN':
            marcas.append((i, 'Resumen'))
        elif t.startswith('CAPÍTULO'):
            m = re.match(r'CAPÍTULO\s*(\d+)', t)
            marcas.append((i, f'Cap. {m.group(1)}' if m else t[:12]))
    marcas.append((len(doc.paragraphs), None))

    fuera = []
    for (ini, nombre), (fin, _) in zip(marcas, marcas[1:]):
        if nombre is None:
            continue
        ps = []
        for p in doc.paragraphs[ini:fin]:
            if p.style.name in EXCLUIR or p.style.name.startswith('toc'):
                continue
            t = p.text.strip()
            if not t or ROTULO.match(t):
                continue
            ps.append(t)
        fuera.append((nombre, ps))
    # el Capítulo 8 es «ANEXOS»: se rotula como tal
    return [('Anexos' if n == 'Cap. 8' else n, ps) for n, ps in fuera]


def contar(parrafos):
    encontrados = Counter()
    for t in parrafos:
        for m in PATRON.finditer(t):
            palabra = m.group(0).lower()
            if palabra.startswith('significativ'):
                ini = max(0, m.start() - 160)
                if ESTADISTICO.search(t[ini:m.end() + 160]):
                    continue
            encontrados[palabra] += 1
    return encontrados


def main():
    ruta = sys.argv[1] if len(sys.argv) > 1 else 'Tesis Postly Bontorno Hassan-1 v2.docx'
    listar = sys.argv[sys.argv.index('--listar') + 1] if '--listar' in sys.argv else None
    doc = docx.Document(ruta)

    print(f'\n════ DENSIDAD DE INTENSIFICADORES ({ruta}) ════\n')
    print(f'  {"bloque":<10} {"palabras":>9} {"intens.":>8} {"por mil":>9}')
    filas = []
    for nombre, ps in bloques_por_capitulo(doc):
        palabras = sum(len(t.split()) for t in ps)
        c = contar(ps)
        n = sum(c.values())
        mil = 1000 * n / palabras if palabras else 0
        filas.append((nombre, palabras, n, mil, c))
        print(f'  {nombre:<10} {palabras:>9} {n:>8} {mil:>9.2f}')
        if listar and nombre.replace('Cap. ', '') == listar.replace('Cap. ', ''):
            print('     ' + ' · '.join(f'{w}×{k}' for w, k in c.most_common()))

    peor = max(filas, key=lambda f: f[3])
    mejor = min(filas, key=lambda f: f[3])
    print(f'\n  más alto: {peor[0]} ({peor[3]:.2f}) · más bajo: {mejor[0]} ({mejor[3]:.2f}) '
          f'· razón {peor[3] / mejor[3]:.1f}×' if mejor[3] else '')
    return filas


if __name__ == '__main__':
    main()
