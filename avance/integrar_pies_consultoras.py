# -*- coding: utf-8 -*-
"""Reemplaza los quince pies de foto del corpus de campo por los que escribieron las consultoras.

POR QUÉ EXISTE
El hallazgo N-A2 de la novena auditoría: los quince casos «limpios» del estudio de campo
llevaban literalmente el `FIRMA_FALLBACK` del nodo «Code in JavaScript1» —
«-- Consultora de Belleza Independiente Mary Kay --» — justo antes de los hashtags, y los
quince, de tres autoras distintas, seguían una sola plantilla. El auditor estableció la
huella y no la autoría; la autoría la confirmaron los autores: esos textos **no los
escribieron las consultoras**, los generó un modelo de lenguaje ajeno al sistema para
acelerar la recolección. El §5.1 y el E.1.2 afirmaban lo contrario.

QUÉ SE HACE
Se pidió a las tres consultoras que escribieran el pie de foto que le pondrían a cada una de
las quince imágenes de `pub consultoras/`, sin mostrarles los textos anteriores y sin
decirles qué busca el detector, para no sesgar el corpus. El evaluador externo re-etiquetó
los quince. Este script sustituye la columna `Contenido_real` conservando los identificadores,
y deja intactos los catorce infractores, que sí eran conversaciones reales.

Los catorce mensajes privados NO se tocan.

Uso: python integrar_pies_consultoras.py [--escribir]
"""
import csv
import glob
import io
import os
import re
import sys

CSV = 'Compliance_Campo.csv'
BASE = 'pub consultoras'

# ── leer los pies de foto nuevos ────────────────────────────────────────────
nuevos = {}
for carpeta in sorted(os.listdir(BASE)):
    archivos = glob.glob(os.path.join(BASE, carpeta, '*.txt'))
    if not archivos:
        sys.exit(f'{carpeta}: no tiene archivo de texto')
    crudo = io.open(archivos[0], 'rb').read()
    for enc in ('utf-8', 'cp1252', 'latin-1'):
        try:
            texto = crudo.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    else:
        sys.exit(f'{carpeta}: no pude decodificar el texto')
    # el CSV guarda el pie de foto en una celda: se normalizan los blancos, se conserva el texto
    texto = re.sub(r'\s+', ' ', texto).strip()
    if not texto:
        sys.exit(f'{carpeta}: el archivo de texto está vacío')
    nuevos[carpeta] = texto

print(f'pies de foto leídos: {len(nuevos)}')

# ── sustituir en la planilla ────────────────────────────────────────────────
crudo = io.open(CSV, encoding='utf-8', newline='').read()
filas = list(csv.reader(io.StringIO(crudo)))
cab = filas[0]
iID, iTxt, iGT = cab.index('ID'), cab.index('Contenido_real'), cab.index('Ground_truth')

tocadas, sin_tocar = 0, []
for f in filas[1:]:
    if not f or not f[iID]:
        continue
    if f[iID] not in nuevos:
        sin_tocar.append(f[iID])
        continue
    if f[iGT].strip().upper() != 'LIMPIO':
        sys.exit(f'{f[iID]}: se esperaba clase real LIMPIO y es {f[iGT]!r}')
    viejo = f[iTxt]
    f[iTxt] = nuevos[f[iID]]
    tocadas += 1
    print(f'  {f[iID]}: {len(viejo)} -> {len(f[iTxt])} caracteres')

print(f'\nfilas sustituidas: {tocadas}')
print(f'filas intactas ({len(sin_tocar)}): {" ".join(sin_tocar)}')
if tocadas != 15:
    sys.exit(f'se esperaban 15 sustituciones y hubo {tocadas}')

# ── la huella que motivó el hallazgo no puede sobrevivir ────────────────────
FIRMA = '-- Consultora de Belleza Independiente Mary Kay --'
quedan = [f[iID] for f in filas[1:] if f and f[iID] and FIRMA in f[iTxt]]
print(f'filas que aún llevan la firma de respaldo del nodo: {len(quedan)} {quedan}')
if quedan:
    sys.exit('la huella de N-A2 sigue presente')

if '--escribir' not in sys.argv:
    print('\n(dry-run: no se escribió el CSV. Agregá --escribir para aplicar)')
    sys.exit(0)

salida = io.StringIO()
w = csv.writer(salida, lineterminator='\n')
w.writerows(filas)
io.open(CSV, 'w', encoding='utf-8', newline='').write(salida.getvalue())
print(f'\nescrito: {CSV}')
