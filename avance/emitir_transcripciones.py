# -*- coding: utf-8 -*-
"""Emite, desde el extracto del workflow, las cadenas que el documento transcribe.

Por que existe
--------------
El trabajo apoya su credibilidad en que los detectores de los scripts son, carácter
por carácter, los del sistema desplegado, y `verificar_patrones_desplegados.mjs` lo
comprueba. Pero las transcripciones que aparecen en la PROSA —el inventario de
símbolos monetarios del §2.4, del §4.5.1 y del Anexo B.4, y la guarda de HU13 que
la Tabla 13 y el Anexo E.4 citan entre comillas— se habían escrito a mano, y las
cuatro divergían del código:

  - el §2.4 enumeraba «$», «AR$», «U$S», «€», «£» y omitía `us$`;
  - el §4.5.1 listaba «$», «ARS», «USD» como símbolos, cuando `ARS` y `USD` no
    pertenecen al patrón de símbolos sino al que asocia una cifra a una palabra de
    moneda;
  - el Anexo B.4 repetía ese error al describir la primera familia;
  - la guarda de HU13 se citaba como «if (dur === null || dur > 60)» y el nodo dice
    `if(!Number.isFinite(dur) || dur>60)`.

Ninguna cambia un resultado. Las cuatro son del tipo que un evaluador comprueba en
diez segundos abriendo el workflow, y en un documento que invoca la identidad
literal como garantía, una comilla que no es literal cuesta más que el error.

La corrección de fondo no es reescribirlas a mano de nuevo: es que las emita un
script desde el mismo extracto que ya respalda a los detectores, y que
`verificar_documento.py` falle si el documento no las contiene. Eso convierte la
transcripción en algo comprobable y no en algo que hay que recordar actualizar.

Uso:
    python emitir_transcripciones.py            imprime las cadenas
    python emitir_transcripciones.py --json     las escribe en Transcripciones.json
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
EXTRACTO = RAIZ / 'evidencia' / 'Nodos_compliance_desplegados.json'
SALIDA = RAIZ / 'Transcripciones.json'

# el patrón de símbolos es el primero de la cascada; de él sale el inventario que
# los tres pasajes enumeran
SIMBOLOS = {'\\$': '$', 'u\\$s': 'U$S', 'us\\$': 'US$', 'ar\\$': 'AR$',
            '€': '€', '£': '£'}


def cargar():
    if not EXTRACTO.exists():
        sys.exit(f'*** Falta {EXTRACTO}. Regenerarlo con\n'
                 f'    node verificar_patrones_desplegados.mjs --extraer "<workflow.json>"')
    return json.loads(EXTRACTO.read_text(encoding='utf-8'))


def inventario_de_simbolos(patron):
    """Lee la alternancia del primer patrón y devuelve los símbolos, en su orden."""
    m = re.match(r'/\(([^)]*)\)', patron)
    if not m:
        sys.exit(f'*** El primer patrón no tiene la forma esperada: {patron}')
    piezas = m.group(1).split('|')
    faltan = [p for p in piezas if p not in SIMBOLOS]
    if faltan:
        sys.exit('*** El patrón desplegado trae símbolos que este script no sabe '
                 f'nombrar: {faltan}. Actualizar SIMBOLOS y el documento.')
    return [SIMBOLOS[p] for p in piezas]


def main():
    d = cargar()
    nodos = d['nodos']
    conjuntos = {n: info['patrones'] for n, info in nodos.items()}

    # la identidad entre los cuatro nodos ya la comprueba verificar_patrones_desplegados.mjs;
    # acá se vuelve a exigir porque de ella depende que el inventario sea uno solo
    distintos = {tuple(v) for v in conjuntos.values()}
    if len(distintos) != 1:
        sys.exit('*** Los cuatro nodos no llevan el mismo conjunto de patrones. '
                 'Correr fix-compliance-patterns.mjs antes de emitir nada.')
    patrones = list(distintos.pop())

    simbolos = inventario_de_simbolos(patrones[0])
    guarda = d['corte_hu13']['guarda'].split('){')[0] + ')'

    t = {
        'simbolos_monetarios': simbolos,
        # la forma en que los tres pasajes los enumeran, para pegarla tal cual
        'simbolos_en_prosa': ', '.join(f'«{s}»' for s in simbolos[:-1]) +
                             f' y «{simbolos[-1]}»',
        'patrones': patrones,
        'cantidad_de_patrones': len(patrones),
        'guarda_hu13': guarda,
        'nodo_hu13': d['corte_hu13']['nodo'],
        'nodos_con_el_conjunto': sorted(conjuntos),
        'sha256_por_nodo': {n: info['sha256_del_codigo'] for n, info in nodos.items()},
    }

    if '--json' in sys.argv:
        SALIDA.write_text(json.dumps(t, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f'GUARDADO: {SALIDA}')

    print(f'\n  símbolos del patrón 1 ({len(simbolos)}): ' + t['simbolos_en_prosa'])
    print(f'  guarda de HU13 en «{t["nodo_hu13"]}»: {guarda}')
    print(f'  {len(patrones)} patrones, idénticos en {len(conjuntos)} nodos:')
    for i, p in enumerate(patrones, 1):
        print(f'    R{i}  {p}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
