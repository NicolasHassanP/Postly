# -*- coding: utf-8 -*-
"""Arma la version 2.1.0 del registro ABIERTO de Zenodo (04-10-2026).

Parte del contenido de la 2.0.1 (deposito/v2.0.0/abierto) y agrega la repeticion de los 29
casos del canal de imagen con la respuesta cruda del modelo (casos_imagen_cruda/). El
registro restringido no cambia: las imagenes de esa corrida son identicas, byte a byte, a las
que ya estan en su casos_imagen/.
Salida: deposito/v2.1.0/ (carpeta abierto, zip y descripcion).
"""
import re, shutil, zipfile, hashlib
from pathlib import Path

RAIZ = Path(__file__).parent
BASE = RAIZ / 'deposito' / 'v2.0.0' / 'abierto'
DEST = RAIZ / 'deposito' / 'v2.1.0'
NUEVO = RAIZ / 'casos_imagen_cruda'
VERSION = '2.1.0'

LEEME_V21 = """

## Versión 2.1.0 (4 de octubre de 2026)

Agrega la repetición de los 29 casos del canal de imagen (Anexos E.6 y E.8) con la respuesta
cruda del modelo, que las dos corridas anteriores no conservaban.

| Carpeta | Qué es |
|---|---|
| `casos_imagen_cruda/` | planilla de casos y archivo de resultados de la repetición. El resultado agrega `Respuesta_cruda` (lo que devolvió el modelo, sin parsear) y `JSON_valido` (si el parseo fail-open del nodo habría podido leerla) |

Resultado: 29 de 29 respuestas son un JSON válido y los 29 veredictos coinciden con los de
`casos_imagen/` (VP 15, FN 1, FP 1, VN 12). Se corre con
`node run_compliance_vision.mjs casos_imagen_cruda`, con las imágenes del registro restringido
(`casos_imagen/`, que son las mismas) copiadas a esa carpeta.
"""

DESC = ("<p><strong>Versión 2.1.0.</strong> Agrega la repetición de los 29 casos del canal de imagen "
        "con la respuesta cruda del modelo (carpeta casos_imagen_cruda/). Ver la sección «Versión 2.1.0» "
        "de LEEME.md.</p>\n\n")

if DEST.exists():
    shutil.rmtree(DEST)
shutil.copytree(BASE, DEST / 'abierto')
(DEST / 'abierto' / 'casos_imagen_cruda').mkdir()
for n in ('Casos_Compliance_Imagen.csv', 'Casos_Compliance_Imagen_resultados.csv'):
    shutil.copy2(NUEVO / n, DEST / 'abierto' / 'casos_imagen_cruda' / n)
leeme = DEST / 'abierto' / 'LEEME.md'
leeme.write_text(leeme.read_text(encoding='utf-8') + LEEME_V21, encoding='utf-8')
cff = DEST / 'abierto' / 'CITATION.cff'
t = cff.read_text(encoding='utf-8')
cff.write_text(re.sub(r'^version:.*$', f'version: {VERSION}', t, flags=re.M), encoding='utf-8')
# control: ninguna imagen en el abierto
assert not [p for p in (DEST / 'abierto').rglob('*') if p.suffix.lower() in ('.jpg', '.png', '.mp4')]
z = DEST / f'Postly_abierto_v{VERSION}.zip'
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in sorted((DEST / 'abierto').rglob('*')):
        if p.is_file():
            zf.write(p, p.relative_to(DEST / 'abierto'))
n = sum(1 for p in (DEST / 'abierto').rglob('*') if p.is_file())
print(f'{z.name}: {n} archivos, {z.stat().st_size/1e6:.2f} MB')
print('sha256', hashlib.sha256(z.read_bytes()).hexdigest()[:16])
(DEST / 'descripcion_abierto_v21.html').write_text(DESC, encoding='utf-8')
