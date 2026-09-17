# -*- coding: utf-8 -*-
"""
Puebla Compliance_Campo.csv con el contenido verbatim de los 29 casos de campo.

El dictamen de segunda instancia dejó este punto en su §7 («qué no pude verificar»): la
planilla registraba los 15 casos LIMPIO con un mismo texto de relleno, «Publicación
informativa de feed», de modo que la Precisión de 1,00 de la Tabla 5 dependía de que
ninguno de ellos trajera un separador de miles ni un término polisémico —justo los
disparadores de falso positivo que el propio trabajo identifica— y eso era plausible pero
no comprobable. Los 14 casos INFRACTOR estaban descritos, no transcritos.

Este script toma el pie de foto que cada consultora entregó y lo escribe en la columna
Contenido_real, de modo que un tercero pueda ejecutar el detector sobre el mismo texto que
vio el bot. El contenido es verbatim; lo único que se normaliza es el espacio en blanco,
porque la planilla tiene una fila por caso.

No recalcula la matriz: run_compliance_field.mjs tabula desde Resultado_sistema, que es el
veredicto que el bot en producción devolvió para cada caso. La Tabla 5 no cambia.

Las carpetas de origen («infractoras/» y «pub consultoras/») quedan fuera del repositorio
por ser material de terceros; este script las consume pero no las publica.

Uso: python poblar_campo_verbatim.py [--verificar]
"""
import csv
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
PLANILLA = RAIZ / 'Compliance_Campo.csv'
COPIA = RAIZ / 'evidencia' / 'Compliance_Campo.csv'
ORIGEN = {'inf': RAIZ / 'infractoras', 'pub': RAIZ / 'pub consultoras'}
# el archivo que explica por qué el evaluador externo marcó el caso, no el pie de foto
RAZON = 'razon infraccion.txt'


def carpeta_de(caso_id):
    """c1inf3 → infractoras/c1inf3 · c2pub4 → pub consultoras/c2pub4"""
    clase = 'inf' if 'inf' in caso_id else 'pub'
    return ORIGEN[clase] / caso_id


def leer(ruta):
    for enc in ('utf-8-sig', 'utf-8', 'cp1252', 'latin-1'):
        try:
            return ruta.read_text(encoding=enc)
        except UnicodeDecodeError:
            continue
    sys.exit(f'*** no se pudo decodificar {ruta}')


def pie_de_foto(caso_id):
    d = carpeta_de(caso_id)
    if not d.is_dir():
        sys.exit(f'*** falta la carpeta de origen: {d}')
    textos = [p for p in sorted(d.glob('*.txt')) if p.name.lower() != RAZON]
    if len(textos) != 1:
        sys.exit(f'*** {d.name}: se esperaba un único .txt de pie de foto, hay '
                 f'{[p.name for p in textos]}')
    # verbatim; sólo se colapsa el espacio en blanco, porque la planilla es de una
    # fila por caso y el detector opera sobre el pie de foto concatenado
    return re.sub(r'\s+', ' ', leer(textos[0])).strip()


def razon_del_defecto(caso_id):
    p = carpeta_de(caso_id) / RAZON
    return re.sub(r'\s+', ' ', leer(p)).strip() if p.exists() else ''


def main():
    filas = list(csv.DictReader(PLANILLA.open(encoding='utf-8')))
    campos = list(filas[0].keys())
    print(f'=== {len(filas)} casos de campo ===')

    for f in filas:
        texto = pie_de_foto(f['ID'])
        anterior = f['Contenido_real']
        f['Contenido_real'] = texto
        # los dos casos que el evaluador externo marcó por un defecto del producto
        razon = razon_del_defecto(f['ID'])
        if razon and f['Notas'].rstrip().endswith(':'):
            f['Notas'] = f'{f["Notas"].rstrip()} {razon}'
        print(f'  {f["ID"]:<8} {len(texto):>5} caracteres   {texto[:58]}')
        if anterior.strip() and anterior.strip() not in texto:
            print(f'           (descripción anterior: {anterior[:58]})')

    if '--verificar' in sys.argv:
        print('\n(--verificar: no se escribió nada)')
        return 0

    for destino in (PLANILLA, COPIA):
        if not destino.parent.is_dir():
            continue
        with destino.open('w', newline='', encoding='utf-8') as fh:
            w = csv.DictWriter(fh, fieldnames=campos)
            w.writeheader()
            w.writerows(filas)
        print(f'\nescrito {destino}')

    # ───────────────────────────────────────────────── verificación
    print('\n--- verificación ---')
    releidas = list(csv.DictReader(PLANILLA.open(encoding='utf-8')))
    fallos = []
    if len(releidas) != len(filas):
        fallos.append(f'se releyeron {len(releidas)} filas de {len(filas)}')
    vacias = [r['ID'] for r in releidas if not r['Contenido_real'].strip()]
    relleno = [r['ID'] for r in releidas
               if r['Contenido_real'].strip() == 'Publicación informativa de feed']
    distintos = len({r['Contenido_real'] for r in releidas})
    print(f'   filas                      {len(releidas)}')
    print(f'   sin contenido              {len(vacias)}')
    print(f'   con el texto de relleno    {len(relleno)}')
    print(f'   textos distintos           {distintos} (esperado {len(releidas)})')
    if vacias:
        fallos.append(f'sin contenido: {vacias}')
    if relleno:
        fallos.append(f'sigue el texto de relleno: {relleno}')
    if distintos != len(releidas):
        fallos.append(f'{len(releidas) - distintos} casos comparten texto')
    for r in releidas:
        if r['ID'] in ('c1inf3', 'c2inf3') and r['Notas'].rstrip().endswith(':'):
            fallos.append(f'{r["ID"]}: la nota quedó sin la razón del defecto')
    if fallos:
        print('\n*** FALLOS ***')
        for x in fallos:
            print('  -', x)
        return 1
    print('\nsin fallos')
    return 0


if __name__ == '__main__':
    sys.exit(main())
