# -*- coding: utf-8 -*-
"""Arma el deposito con identificador persistente que cierra N-06 (dictamen 10).

Por que en DOS niveles y no en uno
----------------------------------
El §5.1 declaraba que «todo el material que este capitulo cita se deposita como
conjunto de datos con identificador persistente». Eso no se puede cumplir tal cual,
y el propio LEEME de la carpeta lo dice en su apartado «Material de terceros»: el
material grafico «no lo fotografiaron ellas», es arte oficial de la marca sobre el
que el equipo compuso las placas de precio. El Anexo D transcribe ademas la regla
de la fuente: las imagenes de la Compania «no deben ni modificarse, ni en modo
alguno» (p. 8). Publicar ese material en abierto seria redistribuir obra de un
tercero, modificada, bajo una licencia que el equipo no puede otorgar.

Lo mismo, por otra razon, con los 29 textos de `Compliance_Campo.csv`: los
redactaron tres participantes identificables y el consentimiento registrado en el
Anexo E.2 es verbal y para esta evaluacion, no para su publicacion como dato
abierto.

De ahi los dos niveles:

  ABIERTO (CC-BY-4.0)   todo lo que es obra del equipo y no lleva material de
                        terceros: los scripts, los conjuntos de casos disenados,
                        todos los archivos de resultados, los extractos de nodos y
                        prompts, y las planillas de cronometraje y TAM, que ya
                        estan seudonimizadas (C1, C2, C3). Con esto solo, las
                        Tablas 3, 4, 6, 7, 8 y 10 a 14 y la divergencia de HU10 son
                        reproducibles por cualquiera.

  RESTRINGIDO           el material de terceros y el de las participantes: las
                        cinco carpetas de imagenes y video, y el corpus de campo.
                        Zenodo lo publica con DOI propio y acceso bajo solicitud,
                        de modo que el tribunal y cualquier revisor lo obtienen sin
                        que el equipo lo redistribuya.

La fuente normativa (el PDF de las Pautas) no se deposita en ningun nivel: es
material corporativo de un tercero y el Anexo D ya transcribe con su pagina las dos
reglas sobre las que se construye el modulo.

Uso:
    python armar_deposito.py            arma deposito/abierto y deposito/restringido
    python armar_deposito.py --verificar   solo audita, no escribe nada
"""
import json
import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
ORIGEN = RAIZ / 'evidencia'
DESTINO = RAIZ / 'deposito'

# ── material de terceros o de las participantes: nunca al nivel abierto ────────
CARPETAS_RESTRINGIDAS = ['casos_imagen', 'casos_imagen_corrida2', 'casos_video',
                         'casos_carrusel', 'casos_repost']
ARCHIVOS_RESTRINGIDOS = ['Compliance_Campo.csv']
# dentro de las carpetas restringidas, los manifiestos y resultados SI son texto
# del equipo y viajan al nivel abierto: sin ellos las Tablas 12 y 14 no se pueden
# recomputar, y no contienen ninguna imagen.
EXT_ABIERTAS_EN_CARPETA = {'.csv', '.md'}

# no se deposita en ningun nivel
EXCLUIDOS = ['Pautas Mary Kay para el uso en las Redes Sociales.pdf']

AUTORES = [
    {"name": "Bontorno, Jeremías", "affiliation": "Universidad Tecnológica Nacional, Facultad Regional Mendoza"},
    {"name": "Hassan, Nicolás", "affiliation": "Universidad Tecnológica Nacional, Facultad Regional Mendoza"},
]

DESC_ABIERTO = """<p>Datos crudos, scripts de análisis y extractos de configuración del sistema
<strong>Postly</strong>, artefacto del Trabajo Integrador &laquo;Postly: Sistema de Automatización
Inteligente para la Generación y Publicación de Contenido en Redes Sociales mediante n8n e
IA&raquo; (Tecnicatura Universitaria en Programación, UTN Facultad Regional Mendoza, 2026).</p>

<p>Este registro contiene el material que permite <strong>recomputar desde el dato crudo</strong> las
Tablas 3, 4, 6, 7, 8 y 10 a 14 del Capítulo 6 y la divergencia de reglas entre flujos del
Anexo E.1.4: los conjuntos de casos diseñados y sus archivos de resultados, los scripts que
los producen, el extracto redactado de los nodos de compliance del workflow desplegado con su
SHA-256, los cuatro prompts de generación en sus dos estados, y las planillas de cronometraje
y de aceptación tecnológica (seudonimizadas como C1, C2 y C3).</p>

<p>El material de terceros y el generado por las participantes &mdash;las carpetas de imágenes y
video y el corpus de campo&mdash; se deposita por separado, con acceso restringido, por las
razones que el archivo <code>LEEME.md</code> detalla en su apartado &laquo;Material de
terceros&raquo;. El documento corporativo que fija la normativa auditada no se deposita: el
Anexo D de la tesis transcribe con su página las dos reglas sobre las que se construye el
módulo.</p>

<p>Punto de entrada: <code>LEEME.md</code>, que indica el comando exacto que reproduce cada
tabla.</p>"""

DESC_RESTRINGIDO = """<p>Material complementario de acceso restringido del Trabajo Integrador
&laquo;Postly: Sistema de Automatización Inteligente para la Generación y Publicación de
Contenido en Redes Sociales mediante n8n e IA&raquo; (UTN Facultad Regional Mendoza, 2026).
Complementa al registro de acceso abierto, que contiene los scripts y los datos tabulares.</p>

<p>Contiene las imágenes y videos de los conjuntos del canal visual del Módulo Centinela
(Anexos E.6 y E.8 a E.11) y el corpus de 29 piezas de contenido real redactadas por tres
Consultoras de Belleza Independientes (Anexo E.1.2).</p>

<p><strong>Por qué el acceso es restringido.</strong> El material gráfico de base es arte comercial
oficial de una marca de venta directa, recibido por las participantes a través del canal interno
de la compañía; las placas de precio de los casos infractores las compusieron los autores sobre
ese material. Las pautas de uso de esa marca prohíben modificar sus imágenes, de modo que los
autores no están en condiciones de otorgar una licencia de redistribución. Los 29 textos, por su
parte, los redactaron participantes identificables bajo un consentimiento verbal circunscripto a
esta evaluación.</p>

<p>El acceso se concede a evaluadores académicos y a personas que revisen el trabajo, a través del
mecanismo de solicitud de Zenodo.</p>"""


def clasificar():
    """Devuelve (abierto, restringido, excluido) como listas de rutas relativas."""
    abierto, restringido, excluido = [], [], []
    for p in sorted(ORIGEN.rglob('*')):
        if not p.is_file():
            continue
        rel = p.relative_to(ORIGEN)
        if rel.name in EXCLUIDOS:
            excluido.append(rel)
        elif rel.parts[0] in CARPETAS_RESTRINGIDAS:
            (abierto if p.suffix.lower() in EXT_ABIERTAS_EN_CARPETA else restringido).append(rel)
        elif rel.name in ARCHIVOS_RESTRINGIDOS:
            restringido.append(rel)
        else:
            abierto.append(rel)
    return abierto, restringido, excluido


def fugas(abierto):
    """Ningun binario de imagen o video puede haber caido en el nivel abierto."""
    prohibidas = {'.jpg', '.jpeg', '.png', '.mp4', '.mov', '.webp', '.pdf'}
    return [r for r in abierto if r.suffix.lower() in prohibidas]


def zenodo(titulo, descripcion, acceso):
    meta = {
        "title": titulo,
        "upload_type": "dataset",
        "creators": AUTORES,
        "description": descripcion,
        "language": "spa",
        "keywords": ["compliance automatizado", "RegTech", "modelos de lenguaje multimodales",
                     "n8n", "automatización de procesos", "venta directa",
                     "design science research", "trabajo final de grado"],
        "contributors": [{"name": "Cortez, Alberto", "type": "Supervisor",
                          "affiliation": "Universidad Tecnológica Nacional, Facultad Regional Mendoza"}],
        "version": "1.0.0",
    }
    if acceso == 'abierto':
        meta["access_right"] = "open"
        meta["license"] = "cc-by-4.0"
    else:
        meta["access_right"] = "restricted"
        meta["access_conditions"] = (
            "El material incluye arte comercial de una marca de venta directa y contenido "
            "redactado por participantes identificables. Se concede acceso a evaluadores "
            "académicos y revisores del trabajo que lo soliciten indicando su vinculación "
            "institucional.")
    return meta


CITATION = """cff-version: 1.2.0
title: >-
  Postly: datos, scripts y extractos de configuración de la validación
  empírica del Módulo Centinela
message: >-
  Si utiliza este conjunto de datos, cítelo con los metadatos de este archivo.
type: dataset
authors:
  - family-names: Bontorno
    given-names: Jeremías
    affiliation: Universidad Tecnológica Nacional, Facultad Regional Mendoza
  - family-names: Hassan
    given-names: Nicolás
    affiliation: Universidad Tecnológica Nacional, Facultad Regional Mendoza
version: 1.0.0
license: CC-BY-4.0
abstract: >-
  Conjuntos de casos, archivos de resultados, scripts de análisis y extractos
  redactados del workflow desplegado que sostienen las tablas empíricas del
  Capítulo 6 del Trabajo Integrador sobre el sistema Postly.
"""

README = """# Depósito de evidencia — Postly

Material complementario del Trabajo Integrador **«Postly: Sistema de Automatización
Inteligente para la Generación y Publicación de Contenido en Redes Sociales mediante n8n
e IA»** (Bontorno y Hassan, Tecnicatura Universitaria en Programación, UTN Facultad
Regional Mendoza, 2026).

El depósito son **dos registros**:

| Registro | Contenido | Acceso |
|---|---|---|
| **Abierto** | Scripts, conjuntos de casos diseñados, todos los archivos de resultados, extractos de nodos y prompts, planillas de cronometraje y TAM | CC-BY-4.0 |
| **Restringido** | Imágenes y videos del canal visual, y el corpus de 29 piezas reales | Bajo solicitud |

Con el registro abierto solo, son reproducibles las Tablas 3, 4, 6, 7, 8 y 10 a 14 y la
divergencia de reglas del Anexo E.1.4: los archivos de resultados de los casos de imagen
son texto y viajan en este registro. El registro restringido hace falta para la Tabla 5,
cuyo dato crudo es el corpus de las participantes, y para volver a ejecutar el clasificador
de imagen sobre los casos, que necesita las imágenes.

**Por qué el segundo registro no es abierto.** El material gráfico de base es arte comercial
oficial de la marca, y las placas de precio de los casos infractores las compusieron los
autores sobre él; las pautas de esa marca prohíben modificar sus imágenes, de modo que los
autores no pueden otorgar una licencia de redistribución. Los 29 textos los redactaron
participantes identificables con un consentimiento circunscripto a esta evaluación. El
archivo `LEEME.md` lo desarrolla en su apartado «Material de terceros».

El documento corporativo que fija la normativa auditada **no se deposita en ningún registro**.
El Anexo D de la tesis transcribe con su página las dos reglas sobre las que se construye el
Módulo Centinela.

**Por dónde empezar:** `LEEME.md` indica el comando exacto que reproduce cada tabla del
documento.
"""


def main():
    solo_auditar = '--verificar' in sys.argv
    if not ORIGEN.exists():
        print(f'*** No existe {ORIGEN}'); return 1

    abierto, restringido, excluido = clasificar()
    fuga = fugas(abierto)

    print(f'  nivel abierto      {len(abierto):3d} archivos')
    print(f'  nivel restringido  {len(restringido):3d} archivos')
    print(f'  no se deposita     {len(excluido):3d} archivos  ' +
          ', '.join(r.name for r in excluido))
    if fuga:
        print('\n*** FUGA: binarios de terceros en el nivel abierto:')
        for r in fuga:
            print('   -', r)
        return 1
    print('  sin fugas: ningun binario de imagen, video o PDF en el nivel abierto')

    if solo_auditar:
        print('\n--verificar: no se escribio nada')
        return 0

    for nivel, archivos, titulo, desc in (
        ('abierto', abierto,
         'Postly: datos, scripts y extractos de configuración de la validación empírica del Módulo Centinela',
         DESC_ABIERTO),
        ('restringido', restringido,
         'Postly: material complementario de acceso restringido (canal visual y corpus de campo)',
         DESC_RESTRINGIDO),
    ):
        base = DESTINO / nivel
        if base.exists():
            shutil.rmtree(base)
        for rel in archivos:
            dst = base / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ORIGEN / rel, dst)
        (base / '.zenodo.json').write_text(
            json.dumps(zenodo(titulo, desc, nivel), ensure_ascii=False, indent=2),
            encoding='utf-8')
        print(f'\n  {base}: {len(archivos)} archivos + .zenodo.json')

    (DESTINO / 'abierto' / 'README.md').write_text(README, encoding='utf-8')
    (DESTINO / 'abierto' / 'CITATION.cff').write_text(CITATION, encoding='utf-8')
    (DESTINO / 'restringido' / 'README.md').write_text(README, encoding='utf-8')
    print(f'\n  README.md y CITATION.cff escritos')
    print(f'\nGUARDADO: {DESTINO}')
    print('\nSiguiente paso (lo hace una persona, no este script):')
    print('  1. Subir deposito/abierto a Zenodo como dataset; los metadatos los toma de .zenodo.json')
    print('  2. Subir deposito/restringido igual, con Access = Restricted')
    print('  3. python poner_doi.py <docx entrada> <docx salida> --abierto 10.5281/... --restringido 10.5281/...')
    return 0


if __name__ == '__main__':
    sys.exit(main())
