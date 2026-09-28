# -*- coding: utf-8 -*-
"""Recomputa desde el dato crudo cada tabla empirica del Capitulo 6.

Por que existe
--------------
El Anexo E promete que un tercero puede reproducir las matrices desde los CSV. Esa
promesa se rompio dos veces sin que nada avisara:

  - la fila `V20` de `Casos_Compliance_Imagen*.csv` llevaba una coma sin comillar
    dentro de un campo, de modo que un lector con un parser estandar leia diez campos
    donde hay nueve, perdia el veredicto de esa fila y obtenia VN = 9 en lugar de 10:
    la Tabla 12 no le cerraba;
  - `Sensibilidad_cronometraje_resultados.csv` escribia los decimales con coma y sin
    comillar, de modo que sus filas de cinco campos se leian como siete.

Los dos datos eran correctos; los archivos estaban mal formados. Este script hace lo
que haria ese lector: carga cada CSV con `csv.DictReader`, exige que todas las filas
tengan el mismo numero de campos, y recomputa cada cifra que el documento publica
contra el valor esperado. Si algo se desvia, sale con codigo 1.

Uso: python verificar_csv.py
"""
import csv
import io
import math
import statistics as st
import sys
from collections import Counter
from pathlib import Path

# Corre desde avance/ durante el desarrollo y desde la raiz del deposito una vez
# empaquetado, donde los CSV son hermanos suyos y no viven en una subcarpeta.
_aqui = Path(__file__).parent
EV = _aqui / 'evidencia' if (_aqui / 'evidencia').is_dir() else _aqui
fallos = []


def bloque(t):
    print(f'\n── {t}')


def check(etiqueta, valor, esperado, tol=0.0):
    ok = (abs(valor - esperado) <= tol) if isinstance(valor, float) else valor == esperado
    print(f'   {etiqueta:<52} {valor}{"" if ok else f"   *** esperado {esperado}"}')
    if not ok:
        fallos.append(f'{etiqueta}: {valor} (esperado {esperado})')


# El deposito tiene dos niveles y el abierto no lleva el corpus de campo, porque lo
# redactaron participantes identificables. Que falte ahi no es un defecto: es la
# consecuencia declarada del recorte. Se distingue de un archivo roto por que la
# ausencia sea completa —estamos en el nivel abierto— y no parcial.
# Las planillas de la ampliación tampoco van al repositorio público (datos de personas):
# el PDF transcribe los 32 pares en el Anexo E.2, y fuera del equipo se recalcula de ahí.
RESTRINGIDOS = {'Compliance_Campo.csv', 'Cronometraje_datos_v2.csv', 'TAM_respuestas_v2.csv'}
NIVEL_ABIERTO = not any((EV / r).exists() for r in RESTRINGIDOS)


def leer(rel):
    """Carga un CSV exigiendo que todas las filas tengan los campos de la cabecera."""
    p = EV / rel
    if not p.exists() and (_aqui / 'instrumentos' / rel).exists():
        p = _aqui / 'instrumentos' / rel
    if not p.exists():
        if rel in RESTRINGIDOS and NIVEL_ABIERTO:
            print(f'   {rel}: no está en este nivel del depósito (acceso restringido) — se omite')
            return []
        fallos.append(f'falta {rel}')
        return []
    with io.open(p, encoding='utf-8-sig', newline='') as f:
        crudas = list(csv.reader(f))
    if not crudas:
        fallos.append(f'{rel}: vacio')
        return []
    n = len(crudas[0])
    malas = [i + 1 for i, r in enumerate(crudas) if r and len(r) != n]
    if malas:
        fallos.append(f'{rel}: {len(malas)} filas con distinto numero de campos '
                      f'(lineas {malas[:5]}) — revisar comillado')
        print(f'   *** {rel}: filas mal formadas en {malas[:5]}')
    cab = crudas[0]
    return [dict(zip(cab, r)) for r in crudas[1:] if r and any(x.strip() for x in r)]


def matriz(filas, campo='Veredicto'):
    c = Counter((f.get(campo) or '').strip().upper() for f in filas)
    return c['VP'], c['FN'], c['FP'], c['VN']


def f1(vp, fn, fp):
    rec = vp / (vp + fn) if vp + fn else 0.0
    pre = vp / (vp + fp) if vp + fp else 0.0
    return (2 * pre * rec / (pre + rec)) if pre + rec else 0.0, rec, pre


def num(s):
    return float(str(s).replace('.', '').replace(',', '.')) if ',' in str(s) else float(s)


# ═══════════════════════════════════════ canal textual: Tablas 3, 4 y 10
bloque('canal textual — Tablas 3, 4 y 10')
for rel, etiqueta, esp in (
    ('Casos_Compliance_Representativo_resultados_v1.csv', 'Tabla 3 representativo', (17, 3, 3, 17)),
    ('Casos_Compliance_resultados_v1.csv', 'Tabla 4 estres', (14, 6, 8, 12)),
    ('Casos_Compliance_Limite_resultados_v1.csv', 'Tabla 10 limite antes', (7, 10, 4, 4)),
    ('Casos_Compliance_Limite_resultados.csv', 'Tabla 10 limite despues', (12, 5, 4, 4)),
):
    filas = leer(rel)
    if filas:
        check(f'{etiqueta} VP/FN/FP/VN', matriz(filas), esp)

# la correccion no debe alterar los dos conjuntos anteriores (§6.1)
for base in ('Casos_Compliance_Representativo_resultados', 'Casos_Compliance_resultados'):
    v1, v2 = leer(base + '_v1.csv'), leer(base + '.csv')
    if v1 and v2:
        distintos = sum(1 for a, b in zip(v1, v2)
                        if (a.get('Veredicto') or '') != (b.get('Veredicto') or ''))
        check(f'{base[:34]}: casos que la correccion altera', distintos, 0)

# ═══════════════════════════════════════════ contenido real: Tabla 5
bloque('contenido real — Tabla 5')
campo = leer('Compliance_Campo.csv')
if campo:
    def panel(col):
        vp = fn = fp = vn = 0
        for f in campo:
            infractor = (f[col] or '').strip().upper() == 'INFRACTOR'
            bloqueo = 'BLOQUE' in (f['Resultado_sistema'] or '').upper()
            if infractor:
                vp, fn = (vp + 1, fn) if bloqueo else (vp, fn + 1)
            else:
                fp, vn = (fp + 1, vn) if bloqueo else (fp, vn + 1)
        return vp, fn, fp, vn
    check('n del corpus', len(campo), 29)
    check('panel A (referencia monetaria)', panel('Ground_truth_monetario'), (12, 0, 0, 17))
    check('panel B («publicable»)', panel('Ground_truth'), (12, 2, 0, 15))
    ac = sum(1 for f in campo
             if (f['Etiqueta_consultora'] or '').strip() == (f['Etiqueta_externa'] or '').strip())
    check('acuerdo entre evaluadoras (kappa = 1,00)', ac, len(campo))

# ═════════════════════════════════════ canal de imagen: Tablas 12 y 14
bloque('canal de imagen — Tablas 12 y 14')
img = leer('casos_imagen/Casos_Compliance_Imagen_resultados.csv')
if img:
    check('n del conjunto completo', len(img), 29)
    habituales = [f for f in img if f['ID'].startswith('V') and int(f['ID'][1:]) <= 20]
    dificiles = [f for f in img if f not in habituales]
    check('Tabla 12 (V01-V20) VP/FN/FP/VN', matriz(habituales), (10, 0, 0, 10))
    check('Tabla 14 (dificiles + R01) VP/FN/FP/VN', matriz(dificiles), (5, 1, 1, 2))
    v, r, p = f1(*matriz(dificiles)[:3])
    check('Tabla 14 F1', round(v, 2), 0.83)
    v, _, _ = f1(*matriz(img)[:3])
    check('agregado de los 29 F1 (§E.8)', round(v, 2), 0.94)

# ═══════════════════════════════════════════ cronometraje: Tabla 7
bloque('cronometraje del PILOTO — antecedente del §6.1.6 (n = 12)')
cr = leer('Cronometraje_datos.csv')
if cr:
    def mmss(s):
        m, sec = s.split(':')
        return int(m) + int(sec) / 60
    pares = [(f['Participante'], mmss(f['Manual_mmss']), mmss(f['Postly_mmss'])) for f in cr]
    red = [(m - p) / m * 100 for _, m, p in pares]
    check('n de pares', len(pares), 12)
    check('manual (min)', round(st.mean([m for _, m, _ in pares]), 1), 9.4)
    check('Postly (min)', round(st.mean([p for _, _, p in pares]), 1), 2.4)
    check('reduccion media (%)', round(st.mean(red), 1), 73.6)
    check('DE de la reduccion', round(st.stdev(red), 1), 8.2)
    suj = sorted({p for p, _, _ in pares})
    A = [st.mean([m for q, m, _ in pares if q == s]) for s in suj]
    B = [st.mean([p for q, _, p in pares if q == s]) for s in suj]
    dif = [a - b for a, b in zip(A, B)]
    t2 = st.mean(dif) / (st.stdev(dif) / math.sqrt(len(dif)))
    check('t pareada sobre medias por consultora', round(t2, 2), 9.15)
    d12 = [m - p for _, m, p in pares]
    t11 = st.mean(d12) / (st.stdev(d12) / math.sqrt(len(d12)))
    check('t pareada sobre los 12 pares', round(t11, 2), 14.21)
    rs = [st.mean([(m - p) / m * 100 for q, m, p in pares if q == s]) for s in suj]
    check('contraste contra el umbral del 70 %',
          round((st.mean(rs) - 70) / (st.stdev(rs) / math.sqrt(3)), 2), 0.91)

# ═══════════════════════════════════════════════════ TAM: Tabla 8
bloque('aceptacion tecnologica del PILOTO — antecedente (n = 3)')
tam = leer('TAM_respuestas.csv')
if tam:
    g = {'Utilidad percibida': ['PU1', 'PU2', 'PU3', 'PU4'],
         'Facilidad de uso percibida': ['PEOU1', 'PEOU2', 'PEOU3', 'PEOU4'],
         'Intencion de uso': ['BI1', 'BI2']}
    esperado = {'Utilidad percibida': 4.50, 'Facilidad de uso percibida': 4.42,
                'Intencion de uso': 5.00}
    check('n de participantes', len(tam), 3)
    for k, items in g.items():
        check(k, round(st.mean([int(f[i]) for f in tam for i in items]), 2), esperado[k])
    todos = [i for its in g.values() for i in its]
    check('puntaje TAM global', round(st.mean([int(f[i]) for f in tam for i in todos]), 2), 4.57)

# ═══════════════════════════ cronometraje de la AMPLIACION: Tabla 7 y §6.1.6
# Hasta el 28-09-2026 este script solo verificaba el piloto, y el texto de la
# ampliacion arrastraba el 9,4 min del piloto (el dato da 9,33) sin que nada avisara.
bloque('cronometraje de la ampliacion — Tabla 7 y §6.1.6 (n = 32)')
cr2 = leer('Cronometraje_datos_v2.csv')
if cr2:
    def amin(s):
        m, sec = s.split(':')
        return int(m) + float(sec) / 60
    # 28-09-2026 (dictamen 13, A-01): el tiempo con Postly es el corregido —el mayor entre el
    # cronómetro y el tiempo del sistema leído del historial de n8n—. El cronómetro crudo se
    # verifica aparte, porque el texto lo sigue reportando rotulado.
    def pares(col):
        P = [dict(part=f['Participante'], man=amin(f['Manual_mmss']),
                  ad=amin(f['Adaptacion_mmss']), po=amin(f[col])) for f in cr2]
        for x in P:
            x['comp'] = x['man'] - x['ad']
            x['red'] = (x['comp'] - x['po']) / x['comp'] * 100
            x['redT'] = (x['man'] - x['po']) / x['man'] * 100
        return P
    P2 = pares('Postly_corregido_mmss')
    suj2 = sorted({x['part'] for x in P2})
    por = {s: [x for x in P2 if x['part'] == s] for s in suj2}
    med = lambda s, k: st.mean([x[k] for x in por[s]])
    check('n de pares', len(P2), 32)
    check('n de participantes', len(suj2), 8)
    check('manual TOTAL, adaptacion incluida (min)', round(st.mean([x['man'] for x in P2]), 1), 9.3)
    check('adaptacion (min)', round(st.mean([x['ad'] for x in P2]), 1), 1.8)
    check('manual, tramo comparable (min) — fila global', round(st.mean([x['comp'] for x in P2]), 1), 7.6)
    check('Postly corregido (min)', round(st.mean([x['po'] for x in P2]), 1), 1.7)
    check('ahorro medio (min)', round(st.mean([x['comp'] - x['po'] for x in P2]), 1), 5.9)
    tabla7 = {'C1': (7.8, 1.9, 75.5), 'C2': (7.2, 1.7, 75.4), 'C3': (7.1, 1.5, 78.7),
              'C4': (10.0, 2.2, 77.1), 'C5': (8.0, 1.3, 83.0), 'C6': (6.0, 1.7, 71.8),
              'C7': (7.0, 1.9, 71.9), 'C8': (7.5, 1.5, 80.0)}
    for s, esp in tabla7.items():
        check(f'Tabla 7 fila {s} (comparable, Postly, reduccion)',
              (round(med(s, 'comp'), 1), round(med(s, 'po'), 1), round(med(s, 'red'), 1)), esp)
    R = [med(s, 'red') for s in suj2]
    RT = [med(s, 'redT') for s in suj2]
    D = [med(s, 'comp') - med(s, 'po') for s in suj2]
    se = st.stdev(R) / math.sqrt(8)
    check('reduccion media (%)', round(st.mean(R), 1), 76.7)
    check('DE de la reduccion', round(st.stdev(R), 1), 3.9)
    check('IC 95 % (t de 7 gl)', (round(st.mean(R) - 2.3646 * se, 1), round(st.mean(R) + 2.3646 * se, 1)), (73.5, 79.9))
    check('t(7) contra el 70 %', round((st.mean(R) - 70) / se, 2), 4.90)
    check('d frente al umbral', round((st.mean(R) - 70) / st.stdev(R), 2), 1.73)
    check('t(7) pareada sobre los tiempos', round(st.mean(D) / (st.stdev(D) / math.sqrt(8)), 2), 15.73)
    check('d de Cohen pareada', round(st.mean(D) / st.stdev(D), 2), 5.56)
    check('reduccion sobre el tiempo total (%)', round(st.mean(RT), 1), 81.2)
    # el cronómetro crudo, que el texto informa rotulado
    Pc = pares('Postly_mmss')
    Rc = [st.mean([x['red'] for x in Pc if x['part'] == s]) for s in suj2]
    sec_ = st.stdev(Rc) / math.sqrt(8)
    check('cronometro sin corregir: reduccion (%)', round(st.mean(Rc), 1), 81.8)
    check('cronometro sin corregir: t(7)', round((st.mean(Rc) - 70) / sec_, 2), 8.51)
    check('cronometro por debajo del tiempo del sistema (pares)',
          sum(amin(f['Postly_mmss']) < amin(f['Sistema_mmss']) for f in cr2), 23)

# ═══════════════════════════════════ TAM de la AMPLIACION: Tabla 8 y §6.1.7
bloque('aceptacion tecnologica de la ampliacion — Tabla 8 y §6.1.7 (n = 8)')
tam2 = leer('TAM_respuestas_v2.csv')
if tam2:
    val = lambda f, c: 6 - float(f[c]) if c.endswith('r') else float(f[c])
    G2 = {'Utilidad percibida': ['PU1', 'PU2', 'PU3', 'PU4r', 'PU5'],
          'Facilidad de uso percibida': ['PEOU1', 'PEOU2r', 'PEOU3', 'PEOU4'],
          'Intencion de uso': ['BI1', 'BI2r']}
    esp2 = {'Utilidad percibida': 4.68, 'Facilidad de uso percibida': 4.38, 'Intencion de uso': 3.94}

    def alfa(cols):
        X = [[val(f, c) for c in cols] for f in tam2]
        k = len(cols)
        iv = sum(st.variance([x[j] for x in X]) for j in range(k))
        return k / (k - 1) * (1 - iv / st.variance([sum(x) for x in X]))

    check('n de participantes', len(tam2), 8)
    for k, its in G2.items():
        check(k, st.mean([val(f, c) for f in tam2 for c in its]), esp2[k], tol=0.0051)
    todos2 = [c for its in G2.values() for c in its]
    check('puntaje TAM global', round(st.mean([val(f, c) for f in tam2 for c in todos2]), 2), 4.43)
    for k, esp in zip(G2, (0.29, 0.70, 0.95)):
        check(f'alfa de Cronbach — {k}', round(alfa(G2[k]), 2), esp)
    pu = G2['Utilidad percibida']
    check('alfa de Utilidad percibida sin PU1', round(alfa([c for c in pu if c != 'PU1']), 2), 0.31)
    check('alfa de Utilidad percibida sin PU3', round(alfa([c for c in pu if c != 'PU3']), 2), 0.55)
    for k, esp in zip(G2, (-0.33, -0.61, -0.90)):
        inv = next(c for c in G2[k] if c.endswith('r'))
        dire = [c for c in G2[k] if c != inv]
        r = st.correlation([st.mean(float(f[c]) for c in dire) for f in tam2],
                           [float(f[inv]) for f in tam2])
        check(f'r directos/invertido — {k}', round(r, 2), esp)

# ══════════════════════════════ sensibilidad del cronometraje (Anexo E.2)
bloque('sensibilidad del cronometraje — Anexo E.2')
sen = leer('Sensibilidad_cronometraje_resultados.csv')
if sen:
    base = next((f for f in sen if f['Adaptacion_supuesta_s'] == '0'), None)
    cruce = next((f for f in sen if f['Adaptacion_supuesta_s'].startswith('cruce')), None)
    if base:
        check('reduccion con adaptacion = 0 s', round(num(base['Reduccion_media_pct']), 1), 73.6)
    if cruce:
        check('cruce del umbral del 70 % (s)', int(float(cruce['Reduccion_media_pct'])), 65)
    check('todas las filas siguen siendo significativas',
          all(f['Sigue_siendo_significativa'] == 'Si' for f in sen if f is not cruce), True)

# ═══════════════════════════════════════ desglose de la bateria B1b (HU12)
bloque('desglose B1b — el umbral de HU12')
b1b = leer('B1b_desglose.csv')
if b1b:
    gen = [num(f['Generacion_copys_s']) for f in b1b]
    check('n de repeticiones', len(gen), 9)
    check('media de la llamada de generacion (s)', round(st.mean(gen), 1), 31.2)
    check('DE', round(st.stdev(gen), 1), 28.3)
    check('repeticiones por debajo de los 15 s', sum(1 for x in gen if x < 15), 2)

print()
if fallos:
    print(f'*** {len(fallos)} DIVERGENCIAS ***')
    for f in fallos:
        print('  -', f)
    sys.exit(1)
print('cada tabla del Capitulo 6 reproduce desde el dato crudo')
