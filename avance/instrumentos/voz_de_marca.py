# -*- coding: utf-8 -*-
"""Voz de la Compañía en los copys generados (§6.1.3).

Cuenta los copys que hablan en primera persona del plural de la marca («Nuestro Limpiador»,
«Te presentamos el Sistema…»). Las Pautas piden no representar inadecuadamente la relación de
contratista independiente (p. 2) ni insinuar que Mary Kay respalda el contenido (p. 9).

El detector es léxico y está declarado acá. Se excluye la primera persona de la clienta
(«a nuestra edad», «para nosotras»), que aparece en copys manuales y no habla por la marca.

Uso (desde avance/):  python instrumentos/voz_de_marca.py
Lee CTA_generacion_resultados.csv (E.12) e instrumentos/OE2_estudio4_material.csv (Estudio 4,
registro restringido) y escribe instrumentos/Voz_marca_resultados.csv.
"""
import csv
import math
import re
import sys
from pathlib import Path

VOZ = re.compile(r"\b(nuestr[oa]s?|nosotr[oa]s|te ofrecemos|ofrecemos|creamos|hemos creado|"
                 r"te presentamos|presentamos)\b", re.I)
CLIENTA = re.compile(r"\b(?:a nuestra edad|para nosotras)\b", re.I)

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent


def es_voz_marca(texto):
    limpio = CLIENTA.sub('', texto)
    return [m.group(0) for m in VOZ.finditer(limpio)]


def wilson(k, n, z=1.959964):
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return max(0.0, c - h), min(1.0, c + h)


def main():
    filas = []
    for x in csv.DictReader(open(RAIZ / 'CTA_generacion_resultados.csv', encoding='utf-8-sig')):
        filas.append(('E.12 ' + x['Estado'], f"{x['Caso']}/{x['Opcion']}", x['Texto']))
    for x in csv.DictReader(open(AQUI / 'OE2_estudio4_material.csv', encoding='utf-8-sig')):
        clave = f"{x['Participante']}/{x['Publicacion']}"
        filas.append(('Estudio 4 Postly', clave, x['Copy_postly']))
        filas.append(('Estudio 4 manual', clave, x['Copy_manual']))

    out = AQUI / 'Voz_marca_resultados.csv'
    with open(out, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['Conjunto', 'Caso', 'Voz_marca', 'Coincidencias'])
        for conj, caso, texto in filas:
            hits = es_voz_marca(texto)
            w.writerow([conj, caso, 'SI' if hits else 'NO', ' | '.join(hits)])

    for conj in dict.fromkeys(c for c, _, _ in filas):
        sub = [t for c, _, t in filas if c == conj]
        k = sum(1 for t in sub if es_voz_marca(t))
        lo, hi = wilson(k, len(sub))
        print(f'{conj}: {k}/{len(sub)}  Wilson [{lo:.3f}; {hi:.3f}]')
    print(f'escrito: {out}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
