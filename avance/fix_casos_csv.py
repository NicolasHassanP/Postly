# -*- coding: utf-8 -*-
"""
Corrige los CSV de casos del Anexo E: N-20 y N-09 del dictamen de segunda instancia.

N-20 — cuatro filas (N03, L20, L21, L25) tienen comas sin entrecomillar en el campo
  Que_prueba_patron, de modo que un parser CSV estandar les desplaza las columnas.
  Se reescriben los seis archivos con entrecomillado minimo correcto.

N-09 — etiquetado inconsistente entre conjuntos. R18 («Escribime y te paso la lista de
  precios») esta etiquetado INFRACTOR y L04 («¿Precios? Te los paso por privado»)
  LIMPIO, siendo el mismo acto comunicativo: una referencia publica a precios que
  redirige al canal privado. La regla del Anexo D alcanza a «cualquier referencia a
  precios, descuentos u ofertas» en canal publico, de modo que la etiqueta correcta
  para ambos es INFRACTOR. Se corrige L04 (la correccion empeora las metricas del
  conjunto limite: el caso pasa de verdadero negativo a falso negativo).

Uso: python fix_casos_csv.py
"""
import csv
import glob
import os

CAMPOS = 9          # ID..Prediccion_a_confirmar
CAMPO_ROTO = 4      # Que_prueba_patron

RELABEL = {
    'Casos_Compliance_Limite.csv': {
        'L04': {
            'Clase_real': 'INFRACTOR',
            'Que_prueba_patron':
                'P6 borde: referencia publica a precios sin ningun digito; mismo acto '
                'comunicativo que R18 del conjunto representativo',
            'Resultado_esperado': 'Bloquear',
            'Prediccion_a_confirmar': 'Se escapa (FN)',
        },
    },
}


def leer(path):
    """Lee tolerando las comas sin entrecomillar del campo Que_prueba_patron."""
    filas = []
    with open(path, encoding='utf-8', newline='') as fh:
        for fila in csv.reader(fh):
            if not fila:
                continue
            if len(fila) > CAMPOS:
                sobra = len(fila) - CAMPOS
                fila = (fila[:CAMPO_ROTO]
                        + [','.join(fila[CAMPO_ROTO:CAMPO_ROTO + sobra + 1])]
                        + fila[CAMPO_ROTO + sobra + 1:])
                print(f'  {os.path.basename(path)} {fila[0]}: recompuesto '
                      f'Que_prueba_patron = {fila[CAMPO_ROTO]!r}')
            filas.append(fila)
    return filas


def escribir(path, filas):
    with open(path, 'w', encoding='utf-8', newline='') as fh:
        csv.writer(fh, quoting=csv.QUOTE_MINIMAL, lineterminator='\n').writerows(filas)


for path in sorted(glob.glob('Casos_Compliance*.csv')):
    if path.endswith('_resultados.csv'):
        continue
    filas = leer(path)
    cab = filas[0]
    cambios = RELABEL.get(os.path.basename(path), {})
    for fila in filas[1:]:
        for col, val in cambios.get(fila[0], {}).items():
            j = cab.index(col)
            print(f'  {os.path.basename(path)} {fila[0]}: {col}: {fila[j]!r} -> {val!r}')
            fila[j] = val
    escribir(path, filas)
    print(f'{path}: {len(filas) - 1} casos reescritos')

# ─── verificacion: todo campo con coma queda entrecomillado y el ancho es 9 ───
print('\n--- verificación ---')
for path in sorted(glob.glob('Casos_Compliance*.csv')):
    if path.endswith('_resultados.csv'):
        continue
    anchos = {len(f) for f in csv.reader(open(path, encoding='utf-8', newline='')) if f}
    print(f'  {path}: anchos {anchos} (esperado {{{CAMPOS}}})')
