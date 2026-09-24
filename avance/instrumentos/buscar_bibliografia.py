# -*- coding: utf-8 -*-
"""Busca candidatos bibliograficos DENTRO de un conjunto declarado de revistas.

Por que asi y no por relevancia. Una busqueda abierta en Crossref u OpenAlex sobre estos
temas devuelve, en su mayoria, revistas depredadoras o trabajos de otro dominio que
comparten las palabras: se comprobo con siete consultas y la cosecha util fue de tres
titulos sobre cuarenta y dos. Ordenar por citas es peor, porque trae los articulos mas
citados que contienen esas palabras, que suelen ser revisiones genericas de IA.

Este script invierte el orden: primero se declara en que revistas vale la pena buscar
—las del dominio, con revision por pares— y despues se busca dentro de cada una. La lista
de revistas es el criterio de inclusion por fuente del protocolo de revision, y esta a la
vista y es discutible, que es lo que una revision sistematica exige.

Los ISSN NO estan escritos a mano: se resuelven contra Crossref por el nombre de la
revista, y el script avisa cuando no puede resolver alguno. Asi no hay forma de citar un
identificador inventado.

Salida: Candidatos_bibliografia.csv, con una columna «Decision» vacia. Esa columna es el
registro de tamizado: se completa a mano con «incluir» o con el motivo del descarte, y es
lo que el §1.6.0 declara que la revision del Estado del Arte no tuvo.

Uso:
    python buscar_bibliografia.py                 busca con los ejes declarados abajo
    python buscar_bibliografia.py "otro tema"     agrega un eje puntual
"""
import csv
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

AQUI = Path(__file__).parent
SALIDA = AQUI / 'Candidatos_bibliografia.csv'
DESDE = '2023-01-01'
UA = {'User-Agent': 'tesis-postly/1.0 (mailto:noreply@example.org)'}

# ── las revistas en que se busca, por dominio ────────────────────────────────
REVISTAS = [
    # Ingenieria de software y sistemas de informacion
    'Empirical Software Engineering',
    'Information and Software Technology',
    'IEEE Transactions on Software Engineering',
    'ACM Transactions on Software Engineering and Methodology',
    'Journal of Systems and Software',
    'Information Systems Journal',
    'European Journal of Information Systems',
    'Journal of Management Information Systems',
    'Information and Management',
    'Decision Support Systems',
    # Interaccion humano-computadora
    'International Journal of Human-Computer Studies',
    'ACM Transactions on Computer-Human Interaction',
    'Behaviour and Information Technology',
    'Computers in Human Behavior',
    # Medios sociales y marketing
    'New Media and Society',
    'Social Media and Society',
    'Journal of Marketing Research',
    'Journal of the Academy of Marketing Science',
    'Internet Research',
    'Journal of Business Research',
    # Computacion y modelos de lenguaje
    'ACM Computing Surveys',
    'ACM Transactions on Information Systems',
    'ACM Transactions on the Web',
]

# ── los ejes tematicos del trabajo ───────────────────────────────────────────
# Cada uno nombra un hueco concreto del documento, y esa correspondencia se publica en la
# columna «Eje» de la salida: una referencia que no llena un hueco no entra.
EJES = {
    'moderacion-llm': 'large language model content moderation classification',
    'compliance': 'regulatory compliance automation rules business process',
    'microemprendimiento': 'social media small business micro enterprise adoption',
    'interfaz-conversacional': 'conversational interface chatbot user evaluation',
    'ia-generativa-marketing': 'generative AI marketing content creation',
    'bajo-codigo': 'low-code no-code development platform',
    'multimodal': 'vision language model image text detection',
    'aceptacion-tecnologica': 'technology acceptance model TAM intention to use',
}
if len(sys.argv) > 1:
    EJES['ad-hoc'] = ' '.join(sys.argv[1:])


def pedir(url, intentos=3):
    for i in range(intentos):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and i < intentos - 1:
                time.sleep(3 * (i + 1))
                continue
            raise
        except Exception:
            if i < intentos - 1:
                time.sleep(2)
                continue
            raise
    return None


def normalizar(t):
    t = t.lower().replace('&', 'and').replace('+', 'and')
    return ' '.join(c for c in ''.join(ch if ch.isalnum() else ' ' for ch in t).split())


def issn_de(nombre):
    """El ISSN sale de Crossref, nunca de la memoria de quien escribe esto.

    La comparacion es por titulo normalizado EXACTO. Con un emparejamiento por prefijo,
    «Computers in Human Behavior» resolvia a «Computers in Human Behavior: Artificial
    Humans» y «Journal of Business Research» a «Journal of Business Administration
    Researches»: se buscaba, sin avisar, en una revista que no era la declarada.
    """
    d = pedir('https://api.crossref.org/journals?' +
              urllib.parse.urlencode({'query': nombre, 'rows': 10}))
    clave = normalizar(nombre)
    for it in (d or {}).get('message', {}).get('items', []):
        if normalizar(it['title']) == clave:
            return it['ISSN'][0], it['title']
    return None, None


def main():
    print(f'  {len(REVISTAS)} revistas · {len(EJES)} ejes · desde {DESDE}\n')
    resueltas, sin_resolver = [], []
    for r in REVISTAS:
        issn, titulo = issn_de(r)
        (resueltas if issn else sin_resolver).append((r, issn, titulo))
        time.sleep(0.3)
    if sin_resolver:
        print('  ISSN no resuelto (se omiten, no se inventan):')
        for r, _, _ in sin_resolver:
            print(f'     {r}')
        print()

    vistos, filas = set(), []
    for nombre, issn, titulo in resueltas:
        hallados = 0
        for eje, consulta in EJES.items():
            d = pedir(f'https://api.crossref.org/journals/{issn}/works?' + urllib.parse.urlencode(
                {'query.bibliographic': consulta, 'rows': 4, 'sort': 'relevance',
                 'filter': f'from-pub-date:{DESDE},type:journal-article'}))
            for it in (d or {}).get('message', {}).get('items', []):
                doi = it.get('DOI', '')
                if not doi or doi in vistos:
                    continue
                vistos.add(doi)
                anio = (it.get('issued', {}).get('date-parts') or [[None]])[0][0]
                if not anio or anio < 2023:
                    continue
                autores = it.get('author', [])
                aut = autores[0].get('family', '—') if autores else '—'
                if len(autores) > 1:
                    aut += ' et al.'
                filas.append({
                    'Eje': eje, 'Revista': titulo, 'Autor': aut, 'Anio': anio,
                    'Titulo': (it.get('title') or ['—'])[0],
                    'DOI': doi, 'Citas': it.get('is-referenced-by-count', 0),
                    'Decision': '', 'Motivo': '',
                })
                hallados += 1
            time.sleep(0.35)
        print(f'  {titulo[:52]:54} {hallados} candidatos')

    filas.sort(key=lambda f: (f['Eje'], -f['Anio'], -f['Citas']))
    with open(SALIDA, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(filas[0].keys()) if filas else
                           ['Eje', 'Revista', 'Autor', 'Anio', 'Titulo', 'DOI', 'Citas',
                            'Decision', 'Motivo'])
        w.writeheader()
        w.writerows(filas)
    print(f'\n  {len(filas)} candidatos en {SALIDA.name}')
    print('  La columna Decision es el registro de tamizado: completala con «incluir» o')
    print('  con el motivo del descarte. Ese registro es lo que el §1.6.0 declara que falta.')
    print('\n  NINGUNO se cita sin leerlo. El titulo y el resumen alcanzan para descartar,')
    print('  nunca para incluir.')


if __name__ == '__main__':
    main()
