# -*- coding: utf-8 -*-
"""Arma la version 2.2.0 del registro ABIERTO de Zenodo (05-10-2026).

Parte de la 2.1.0 (deposito/v2.1.0/abierto) y agrega las respuestas de la tercera evaluadora (Ev4) a los
Estudios 1 y 4 del OE2, mas el script que calcula el acuerdo entre los dos evaluadores. Las filas de Ev1
quedan identicas. El registro restringido no cambia.
Salida: deposito/v2.2.0/ (carpeta abierto y zip).
"""
import re, shutil, zipfile, hashlib
from pathlib import Path

RAIZ = Path(__file__).parent
BASE = RAIZ / 'deposito' / 'v2.1.0' / 'abierto'
DEST = RAIZ / 'deposito' / 'v2.2.0'
INSTR = RAIZ / 'instrumentos'
VERSION = '2.2.0'

LEEME_V22 = """

## Versión 2.2.0 (5 de octubre de 2026)

Agrega un segundo juicio independiente de los Estudios 1 y 4 del Objetivo Específico 2 (Anexo E.14).
Una tercera evaluadora, ajena al proyecto y que no había visto copys de Postly, juzgó a ciegas el mismo
material, con el mismo orden y la misma letra A/B, sin conocer las respuestas del primer evaluador.

| Archivo | Qué cambia |
|---|---|
| `OE2_estudio1_respuestas.csv` | 16 filas nuevas con `Evaluadora = Ev4`; las de `Ev1` no cambian |
| `OE2_estudio4_respuestas.csv` | 71 filas nuevas con `Evaluador = Ev4`; las de `Ev1` no cambian |
| `acuerdo_evaluadores.py` | resultados de cada evaluador con el criterio del Anexo E.14 y acuerdo entre ambos (κ de Cohen en la preferencia, κ ponderado cuadrático en los puntajes) |

`Ev2` y `Ev3` ya designaban al evaluador de los Estudios 2 y 3; por eso la nueva evaluadora es `Ev4`.
Se corre con `python acuerdo_evaluadores.py` en esta carpeta.
"""

if DEST.exists():
    shutil.rmtree(DEST)
shutil.copytree(BASE, DEST / 'abierto')
ab = DEST / 'abierto'
for n in ('OE2_estudio1_respuestas.csv', 'OE2_estudio4_respuestas.csv'):
    viejo = (BASE / n).read_bytes().decode('utf-8').replace('\r\n', '\n').strip('\n').split('\n')
    nuevo = (INSTR / n).read_bytes().decode('utf-8').replace('\r\n', '\n').strip('\n').split('\n')
    assert nuevo[:len(viejo)] == viejo, f'{n}: las filas de Ev1 cambiaron'
    assert all(l.startswith('Ev4,') for l in nuevo[len(viejo):]), n
    (ab / n).write_bytes(('\r\n'.join(nuevo) + '\r\n').encode('utf-8'))
    print(n, len(viejo) - 1, '+', len(nuevo) - len(viejo))
shutil.copy2(INSTR / 'acuerdo_evaluadores.py', ab / 'acuerdo_evaluadores.py')
leeme = ab / 'LEEME.md'
leeme.write_text(leeme.read_text(encoding='utf-8') + LEEME_V22, encoding='utf-8')
cff = ab / 'CITATION.cff'
cff.write_text(re.sub(r'^version:.*$', f'version: {VERSION}', cff.read_text(encoding='utf-8'), flags=re.M), encoding='utf-8')
assert not [p for p in ab.rglob('*') if p.suffix.lower() in ('.jpg', '.png', '.mp4')]
z = DEST / f'Postly_abierto_v{VERSION}.zip'
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in sorted(ab.rglob('*')):
        if p.is_file():
            zf.write(p, p.relative_to(ab))
n = sum(1 for p in ab.rglob('*') if p.is_file())
print(f'{z.name}: {n} archivos, {z.stat().st_size/1e6:.2f} MB, sha256 {hashlib.sha256(z.read_bytes()).hexdigest()[:16]}')
