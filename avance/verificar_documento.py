# -*- coding: utf-8 -*-
"""
Verificación instrumental del documento, replicando lo que el dictamen mide.

Comprueba, sin opinar:
  · que toda referencia «§x.y», «Tabla N», «Figura N» y «Anexo X» resuelva;
  · que toda tabla y toda figura estén referidas desde el cuerpo;
  · que no queden entradas bibliográficas huérfanas ni citas sin entrada;
  · que no reaparezcan las frases que el dictamen marcó;
  · las métricas de escritura, contra el objetivo de 25-28 palabras por oración.

Uso: python verificar_documento.py "<archivo.docx>"
"""
import re
import sys
from collections import Counter

import docx

from medir_escritura import bloques, oraciones

RUTA = sys.argv[1] if len(sys.argv) > 1 else 'Tesis Postly Bontorno Hassan-1 v2.docx'
doc = docx.Document(RUTA)
EXCLUIR = ('table of figures', 'TOC Heading')

parrafos, encabezados = [], []
for p in doc.paragraphs:
    if p.style.name in EXCLUIR or p.style.name.startswith('toc'):
        continue
    parrafos.append(p)
    if p.style.name.startswith('Heading'):
        encabezados.append(p.text.strip())

texto = '\n'.join(p.text for p in parrafos)
fallos = []


def bloque(titulo):
    print(f'\n── {titulo}')


def check(etiqueta, valor, esperado=None):
    ok = esperado is None or valor == esperado
    marca = '' if ok else '   ***'
    print(f'   {etiqueta:<56} {valor}{marca}')
    if not ok:
        fallos.append(f'{etiqueta}: {valor} (esperado {esperado})')


# ══════════════════════════════════════════════ referencias internas §x.y
bloque('referencias de sección')
secciones = set()
for h in encabezados:
    m = re.match(r'^(\d+(?:\.\d+)*)', h.strip())
    if m:
        secciones.add(m.group(1))
refs = sorted(set(re.findall(r'§(\d+(?:\.\d+)+)', texto)))
huerfanas = [r for r in refs
             if r not in secciones and not any(s.startswith(r + '.') for s in secciones)
             and not any(r.startswith(s + '.') for s in secciones)]
check('referencias «§x.y» distintas', len(refs))
check('que no resuelven a una sección existente', len(huerfanas), 0)
for h in huerfanas:
    print(f'      §{h}')

# ══════════════════════════════════════════════════════ tablas y figuras
bloque('tablas y figuras')
rotulos_tabla = {int(m) for m in re.findall(r'^Tabla (\d+)\.', texto, re.M)}
rotulos_figura = {int(m) for m in re.findall(r'^Figura (\d+)\.', texto, re.M)}
cuerpo_sin_rotulos = '\n'.join(
    p.text for p in parrafos
    if not re.match(r'^(Tabla|Figura) \d+\.', p.text.strip()))
tab_ref = {n for n in rotulos_tabla
           if re.search(rf'Tablas? {n}\b', cuerpo_sin_rotulos)
           or re.search(rf'Tablas \d+ a (\d+)', cuerpo_sin_rotulos)
           and any(a <= n <= b for a, b in
                   [(int(x), int(y)) for x, y in
                    re.findall(r'Tablas (\d+) a (\d+)', cuerpo_sin_rotulos)])}
fig_ref = set()
for n in rotulos_figura:
    if re.search(rf'Figuras? {n}\b', cuerpo_sin_rotulos):
        fig_ref.add(n)
    for a, b in re.findall(r'Figuras (\d+) a (\d+)', cuerpo_sin_rotulos):
        if int(a) <= n <= int(b):
            fig_ref.add(n)
check('tablas rotuladas en el cuerpo', len(rotulos_tabla))
check('objetos tabla en el documento', len(doc.tables))
check('tablas referidas desde el cuerpo', f'{len(tab_ref)} / {len(rotulos_tabla)}')
for n in sorted(rotulos_tabla - tab_ref):
    print(f'      Tabla {n} sin llamada'); fallos.append(f'Tabla {n} sin llamada')
check('figuras rotuladas en el cuerpo', len(rotulos_figura))
check('figuras referidas desde el cuerpo', f'{len(fig_ref)} / {len(rotulos_figura)}')
for n in sorted(rotulos_figura - fig_ref):
    print(f'      Figura {n} sin llamada'); fallos.append(f'Figura {n} sin llamada')

# ════════════════════════════════════════════════════════════ anexos
bloque('anexos')
anexos = set(re.findall(r'^Anexo ([A-E])\b', '\n'.join(encabezados), re.M))
sub = set(re.findall(r'^([A-E]\.\d+)', '\n'.join(encabezados), re.M))
cit_anexo = set(re.findall(r'Anexo ([A-E])\b', texto))
cit_sub = set(re.findall(r'Anexo ([A-E]\.\d+)', texto)) | \
          set(re.findall(r'\b([A-E]\.\d+)\b', texto)) & sub
check('anexos citados que existen', f'{len(cit_anexo & anexos)} / {len(cit_anexo)}')
check('subsecciones de anexo citadas que existen',
      f'{len(cit_sub & sub)} / {len(cit_sub)}')
for s in sorted(cit_sub - sub):
    print(f'      {s} citado y ausente'); fallos.append(f'{s} citado y ausente')

# ═══════════════════════════════════════════════════════ bibliografía
bloque('bibliografía')
i_ref = next(i for i, p in enumerate(parrafos)
             if p.style.name == 'Heading 1' and 'REFERENCIAS' in p.text.upper())
i_anx = next(i for i, p in enumerate(parrafos)
             if p.style.name == 'Heading 1' and 'ANEXOS' in p.text.upper())
entradas = [p.text.strip() for p in parrafos[i_ref:i_anx]
            if p.text.strip() and re.search(r'\((\d{4}|s\.f\.)', p.text)]
cuerpo = '\n'.join(p.text for p in parrafos[:i_ref])
sin_cita = []
for e in entradas:
    apellido = re.split(r'[,.]', e)[0].strip()
    if len(apellido) > 2 and apellido not in cuerpo:
        sin_cita.append(e[:60])
check('entradas bibliográficas', len(entradas))
check('entradas nunca citadas en el cuerpo', len(sin_cita), 0)
for s in sin_cita:
    print(f'      {s}'); fallos.append(f'entrada huérfana: {s}')
con_doi = sum(1 for e in entradas if 'doi.org' in e)
check('entradas con DOI', f'{con_doi} ({100 * con_doi // max(1, len(entradas))} %)')

# ═══════════════════════════════════════ frases que el dictamen marcó
bloque('frases retiradas por el dictamen')
PROHIBIDAS = [
    'pendiente de medición', 'pendientes de medición', 'mitigar a cero',
    '100% de los casos', 'escasos segundos', 'no es un bloque monolítico',
    'base relacional', 'persistencia relacional', 'microservicios externos',
    'Hashmi et al., 2006', 'Pautasso et al., 2014', 'Recuperado de',
    'docs/anexos/', 'matemáticamente', 'inobjetable', 'Parte 3', 'Parte 4, 4.1',
    'Notas de fidelidad al texto',
    # ── tercera instancia ────────────────────────────────────────────────────
    '10 de 12',                     # N3-01: el flujo programado bloqueó los doce
    'DE 0,04',                      # N3-03: el desvío real es 0,21
    'reducen drásticamente la carga cognitiva',   # N3-04 OE-1: no se midió
    'mitigando exitosamente la fatiga de decisión',  # N3-04 OE-2: no es efecto medido
    'demostró ser la estrategia correcta',        # N3-04 OE-5
    # N3-11: el material de campo nunca se publicó. Ojo: «las publicaciones reales
    # de la cuenta vinculada» del §4.4 sí son posts en línea y es uso correcto.
    '29 publicaciones reales',
    'publicaciones reales del estudio de campo',
    'publicaciones reales de las consultoras',
    'aproximadamente 9,8 minutos',  # R-01: la media de los doce pares es 9,4
    'descarta categóricamente',     # R-02: hay dos mecanismos de sondeo
    'únicos evaluadores',           # R-03: hay evaluador externo desde el §5.1
    'estados booleanos',            # N3-08: la máquina tiene cuatro estados
    'estado booleano',              # N3-08
    'consulta relacional',          # N3-15
    'compatibilidad absoluta',      # N3-15
    'garantía técnica',             # N3-15
    'insuperables',                 # N3-15
    'análisis exhaustivo',          # N3-15
    'no informativo en los demás',  # N3-16: el α de PU es calculable
    'Cronometraje_70pct',           # N3-14: la planilla es Cronometraje_datos.csv
    # N3-10: el conjunto HABITUAL (E.6, V01-V20) no es adversarial. Los casos difíciles
    # del E.8 sí lo son, pero se describen como tales y en su propio apartado.
    'construidos para tensionarlo',
    # ── N3-02: procedencia de las imágenes del canal visual ──────────────────
    # El material de base NO son fotografías tomadas por las consultoras: es arte
    # oficial de la marca que ellas reenvían. Ojo: los 29 casos de TEXTO sí los
    # redactaron ellas, y decirlo del texto es correcto — estas dos frases apuntan
    # sólo a la afirmación sobre las fotografías.
    'fotografías reales de las consultoras',
    'fotografías de base son las que las tres consultoras aportaron',
    # ── cuarta instancia ─────────────────────────────────────────────────────
    'no admite la distinción por canal',   # H-01: la regla de video es del bloque YouTube
    'transacciones de contenido sin excepción',  # H-02: la capa visual falla en abierto
    'determinista que procesa estructuralmente el 100%',  # H-02
    'Interrupción Fail-Safe',       # H-02: el rótulo cubría sólo la rama positiva
    'interrupción fail-safe',       # H-02
    'que el §4.1.1 menciona',       # R4-01: la cifra vive en el §2.3
    'Resolvió, por lo tanto',       # R4-03: el FP V27 ES «el número que no es un precio»
    'más los 20 del conjunto ampliado (Anexo E.6). Sobre esos 20',  # R4-02: faltan los 9
    'con una serie de tiempos tomada sobre el sistema',  # H-05: dos de las cuatro no lo son
    'precio manuscrito',            # H-10: es tipografía de estilo caligráfico
    'monto manuscrito',             # H-10
    'superioridad de la IA multimodal',  # H-11: el ordenamiento no se midió
    'En escasos milisegundos',      # H-11: el tramo no tiene medición
    'garantizar la privacidad (Multitenencia segura)',  # H-11: es un filtro de consulta
    'garantizando el aislamiento de datos (Multitenencia)',  # H-11
    'más honesta que el 1,00',      # R4-03: el agregado no es más honesto, es otro corte
    # H-09: la segunda recolección iba en pasiva y sin agente
    'Una segunda recolección, posterior',
    # R01: el trabajo puede establecer que no la compuso, no quién imprimió el precio
    'impreso en la pieza por la propia marca',
]
for f in PROHIBIDAS:
    n = texto.count(f)
    check(f'«{f}»', n, 0)

# ═══════════════════════════════════════════════════ escritura
bloque('métricas de escritura')
cuerpo_p, anexos_p = bloques(doc)
for nombre, ps, objetivo in (('cuerpo', cuerpo_p, 28), ('anexos', anexos_p, None)):
    ors = [o for p in ps for o in oraciones(p)]
    largos = [len(o.split()) for o in ors]
    media = sum(largos) / len(largos)
    n50 = sum(1 for x in largos if x > 50)
    print(f'   {nombre}: {sum(largos)} palabras · {len(ors)} oraciones · '
          f'media {media:.1f} · >50 palabras: {n50} · máxima {max(largos)}')
    if objetivo and media > objetivo:
        fallos.append(f'media de {nombre}: {media:.1f} > {objetivo}')
    if n50:
        fallos.append(f'{nombre}: {n50} oraciones de más de 50 palabras')

# ════════════════════════════════════════════════════════════ cierre
print()
if fallos:
    print(f'*** {len(fallos)} PUNTOS ABIERTOS ***')
    for f in fallos:
        print('  -', f)
    sys.exit(1)
print('sin puntos abiertos')
