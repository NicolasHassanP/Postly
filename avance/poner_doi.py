# -*- coding: utf-8 -*-
"""Escribe en el documento los DOI de los dos registros del deposito.

Existe para que insertar el identificador sea un paso mecanico y no una edicion a
mano, que es como se cuelan las erratas: el marcador vive en un solo parrafo y este
script lo reemplaza por el DOI ya formateado, verificando antes que resuelva.

Uso:
    python poner_doi.py "<entrada.docx>" "<salida.docx>" \\
        --abierto 10.5281/zenodo.XXXXXXX --restringido 10.5281/zenodo.YYYYYYY

    --sin-verificar   salta la consulta a doi.org (util sin red)
"""
import json
import sys
import urllib.error
import urllib.request

import docx

from _util_docx import Doc

MARCADORES = {
    '--abierto': '[DOI-ABIERTO-PENDIENTE]',
    '--restringido': '[DOI-RESTRINGIDO-PENDIENTE]',
}


def arg(flag):
    if flag not in sys.argv:
        return None
    return sys.argv[sys.argv.index(flag) + 1]


def resuelve(doi):
    """True si doi.org conoce el identificador; False si no; None si no se pudo consultar.

    La distincion importa: un 404 del servicio de handles significa «este DOI no
    existe», y confundirlo con una caida de red hacia escribir sin verificar un DOI
    que podia estar mal tipeado. Un DOI recien publicado tarda un rato en propagar,
    y para ese caso esta `--sin-verificar`.
    """
    req = urllib.request.Request(
        'https://doi.org/api/handles/' + doi,
        headers={'User-Agent': 'postly-deposito/1.0'})
    try:
        d = json.load(urllib.request.urlopen(req, timeout=25))
        return d.get('responseCode') == 1
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False
        print(f'    (no se pudo consultar: {e})')
        return None
    except (urllib.error.URLError, ValueError, TimeoutError) as e:
        print(f'    (no se pudo consultar: {e})')
        return None


def main():
    src, out = sys.argv[1], sys.argv[2]
    d = Doc(docx.Document(src))
    verificar = '--sin-verificar' not in sys.argv
    puestos = 0

    for flag, marcador in MARCADORES.items():
        doi = arg(flag)
        if not doi:
            print(f'  {marcador}: sin {flag}, se deja como esta')
            continue
        doi = doi.strip().removeprefix('https://doi.org/').removeprefix('doi:')
        if verificar:
            ok = resuelve(doi)
            if ok is False:
                print(f'*** {doi} no resuelve en doi.org. No se escribe nada.')
                print('    Si el registro se acaba de publicar, el DOI tarda en propagar:')
                print('    comprobalo en zenodo.org y volvé a correr esto con --sin-verificar.')
                return 1
            print(f'  {doi}: {"resuelve" if ok else "sin verificar"}')
        i = d.buscar(marcador, obligatorio=False)
        if i is None:
            print(f'  {marcador}: no esta en el documento (ya reemplazado?)')
            continue
        d.sustituir_en(i, marcador, f'(https://doi.org/{doi})')
        print(f'  p{i}: {marcador} -> https://doi.org/{doi}')
        puestos += 1

    if not puestos:
        print('\nNo se reemplazo ningun marcador.')
        return 1
    d.guardar(out)
    return d.informe()


if __name__ == '__main__':
    sys.exit(main())
