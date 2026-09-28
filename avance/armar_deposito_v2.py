# -*- coding: utf-8 -*-
"""Arma la versión 2.0.0 de los dos registros de Zenodo (28-09-2026).

Por qué hace falta. La versión 1.0.0 (23-09-2026) se armó antes de la evaluación ampliada: su
registro abierto trae la planilla de cronometraje del piloto (C1 a C3) y nada de lo que vino
después: la ampliación a ocho participantes, el tiempo del motor que corrige el cronómetro
(dictamen 13, A-01), los cuatro estudios del OE2 y la medición del llamado a la acción en las
sesiones. La tesis afirma que el depósito permite recomputar el Capítulo 6 desde el dato crudo,
y con la 1.0.0 eso ya no es cierto.

Qué agrega. Parte de lo mismo que la 1.0.0 —armar_deposito.clasificar() sobre evidencia/— y le
suma lo de instrumentos/, con el mismo criterio de dos niveles:

  ABIERTO       los scripts de la ampliación y del OE2, las respuestas de los evaluadores y
                las claves, los resultados agregados, el cuestionario TAM y el modelo de
                consentimiento (en blanco). Nada escrito por una participante.
  RESTRINGIDO   lo que es de las participantes o de la marca: las planillas de la ampliación
                (cronometraje, TAM con sus comentarios, reclutamiento), los copys manuales del
                Estudio 4 y las imágenes de los estudios del OE2.

No van a ningún nivel: los formularios .docx de cada sesión (pueden tener datos personales),
las Pautas de Mary Kay, las capturas del workflow y los tres protocolos. Los protocolos tienen
su anterioridad fijada por el hash del commit en GitHub (Anexo E.4), y un contenido que no se
puede editar sin perder esa prueba, de modo que se citan desde allí.

Uso:  python armar_deposito_v2.py
Salida: deposito/v2.0.0/  (dos carpetas, dos zips y PARA-JERE.md)
"""
import shutil
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import armar_deposito as v1

RAIZ = Path(__file__).parent
INS = RAIZ / 'instrumentos'
DEST = RAIZ / 'deposito' / 'v2.0.0'
VERSION = '2.0.0'

INS_ABIERTO = [
    'run_cronometraje_v2.mjs', 'run_tam_v2.mjs', 'tiempos_motor_v2.mjs',
    'run_oe2.mjs', 'run_cta_estudios_oe2.mjs', 'run_copy_pareado.mjs', 'armar_material_estudio4.mjs',
    'OE2_copys_material.csv', 'OE2_estudio1_respuestas.csv',
    'OE2_estudio2_clave.csv', 'OE2_estudio2_respuestas.csv',
    'OE2_estudio3_clave.csv', 'OE2_estudio3_respuestas.csv',
    'OE2_estudio4_clave.csv', 'OE2_estudio4_respuestas.csv',
    'CTA_estudios_OE2_resultados.csv', 'TAM_v2_cuestionario.md', 'CONSENTIMIENTO.md',
]
INS_RESTRINGIDO = [
    'Cronometraje_datos_v2.csv', 'TAM_respuestas_v2.csv', 'Reclutamiento_v2.csv',
    'OE2_estudio4_material.csv', 'OE2_estudio4_ciego.csv',
]
INS_CARPETAS_RESTRINGIDAS = ['Imagenes', 'Imagenes carrusel']
# de evidencia/: además de lo que la 1.0.0 ya excluía
EXCLUIR_EVIDENCIA = {'captura worflow'}
# el verificador vigente es el de avance/, no la copia vieja de evidencia/
REEMPLAZOS = {'verificar_csv.py': RAIZ / 'verificar_csv.py'}

LEEME_V2 = """

## Versión 2.0.0 (28 de septiembre de 2026)

La 1.0.0 se armó antes de la evaluación ampliada. Esta versión agrega lo que vino después.

**Evaluación ampliada (§6.1.6 y §6.1.7, Anexos E.2 y E.3).** Las planillas de las ocho
participantes están en el registro restringido, porque son datos de personas; el PDF de la
tesis transcribe los 32 pares y las ocho respuestas, de modo que las Tablas 7 y 8 se
recalculan también desde ahí.

| Archivo | Nivel | Qué es |
|---|---|---|
| `Cronometraje_datos_v2.csv` | restringido | 32 pares. `Postly_mmss` es el cronómetro; `Sistema_mmss`, el intervalo que el motor registró entre la llegada de la primera foto y el fin de la publicación, con el par de ejecuciones en `Ejecuciones`; `Postly_corregido_mmss`, el mayor de los dos, que es el que se analiza |
| `TAM_respuestas_v2.csv` | restringido | 8 respuestas de 12 ítems y comentario libre |
| `Reclutamiento_v2.csv` | restringido | criterios de inclusión y relación previa de cada participante |
| `run_cronometraje_v2.mjs` | abierto | Tabla 7 y §6.1.6: reducción con el tiempo corregido y, rotulada, con el cronómetro |
| `tiempos_motor_v2.mjs` | abierto | recalcula `Sistema_mmss` desde la API de ejecuciones de n8n (requiere la instancia) |
| `run_tam_v2.mjs` | abierto | Tabla 8 y §6.1.7 |

```
node run_cronometraje_v2.mjs Cronometraje_datos_v2.csv Reclutamiento_v2.csv
node run_tam_v2.mjs TAM_respuestas_v2.csv
```

**Objetivo Específico 2 (§6.1.8, Anexo E.14).** Las respuestas de los evaluadores y las claves
están en el registro abierto; los copys manuales que escribieron las participantes del Estudio
4, en el restringido.

```
node run_oe2.mjs
node run_cta_estudios_oe2.mjs
```

**Verificación.** `verificar_csv.py` es la versión vigente. Corrido sobre el registro abierto,
declara omitidos los archivos del restringido y recomputa el resto.
"""

DESC_V2 = ("<p><strong>Versión 2.0.0.</strong> Agrega la evaluación ampliada a ocho participantes "
           "—con el tiempo del motor que corrige el cronómetro de la condición Postly—, los cuatro "
           "estudios del Objetivo Específico 2 y la medición del llamado a la acción en las sesiones. "
           "Ver la sección «Versión 2.0.0» de LEEME.md.</p>\n\n")


def copiar(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def main():
    if DEST.exists():
        shutil.rmtree(DEST)
    ab, re_, ex = v1.clasificar()
    ab = [r for r in ab if r.parts[0] not in EXCLUIR_EVIDENCIA]
    for r in ab:
        copiar(REEMPLAZOS.get(r.name, v1.ORIGEN / r), DEST / 'abierto' / r)
    for r in re_:
        copiar(v1.ORIGEN / r, DEST / 'restringido' / r)
    for n in INS_ABIERTO:
        copiar(INS / n, DEST / 'abierto' / n)
    for n in INS_RESTRINGIDO:
        copiar(INS / n, DEST / 'restringido' / n)
    for c in INS_CARPETAS_RESTRINGIDAS:
        for p in (INS / c).rglob('*'):
            if p.is_file():
                copiar(p, DEST / 'restringido' / 'OE2_imagenes' / c / p.relative_to(INS / c))
    # LEEME y CITATION con la versión nueva
    leeme = (v1.ORIGEN / 'LEEME.md').read_text(encoding='utf-8') + LEEME_V2
    (DEST / 'abierto' / 'LEEME.md').write_text(leeme, encoding='utf-8')
    (DEST / 'abierto' / 'CITATION.cff').write_text(v1.CITATION.replace('version: 1.0.0', f'version: {VERSION}'),
                                                   encoding='utf-8')
    # controles: ningún binario al abierto, nada de las participantes al abierto
    abierto = [p.relative_to(DEST / 'abierto') for p in (DEST / 'abierto').rglob('*') if p.is_file()]
    malos = v1.fugas(abierto) + [a for a in abierto if a.name in INS_RESTRINGIDO + v1.ARCHIVOS_RESTRINGIDOS]
    if malos:
        sys.exit(f'FUGA al registro abierto: {malos}')
    for nivel in ('abierto', 'restringido'):
        z = DEST / f'Postly_{nivel}_v{VERSION}.zip'
        with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
            for p in sorted((DEST / nivel).rglob('*')):
                if p.is_file():
                    zf.write(p, p.relative_to(DEST / nivel))
        n = sum(1 for p in (DEST / nivel).rglob('*') if p.is_file())
        print(f'  {z.name}: {n} archivos, {z.stat().st_size / 1e6:.2f} MB')
    (DEST / 'descripcion_abierto_v2.html').write_text(DESC_V2 + v1.DESC_ABIERTO, encoding='utf-8')
    (DEST / 'descripcion_restringido_v2.html').write_text(DESC_V2 + v1.DESC_RESTRINGIDO, encoding='utf-8')


if __name__ == '__main__':
    main()
