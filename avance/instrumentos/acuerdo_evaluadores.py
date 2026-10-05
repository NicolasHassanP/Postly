# -*- coding: utf-8 -*-
"""Estudios 1 y 4 con dos evaluadoras (Ev1 sept-2026, Ev4 05-oct-2026): resultados de cada una con el criterio
de E.14 y acuerdo entre ambas. Lee OE2_estudio1_respuestas.csv, OE2_estudio4_respuestas.csv y la clave del 4."""
import csv, math
from collections import defaultdict
D = ['Fidelidad', 'Utilidad', 'Voz_marca', 'Cumplimiento']
def wilson(k, n, z=1.959964):
    p = k / n; den = 1 + z*z/n; c = (p + z*z/(2*n)) / den; h = z*math.sqrt(p*(1-p)/n + z*z/(4*n*n)) / den
    return max(0, c-h), min(1, c+h)
def binom2(k, n):
    pk = lambda i: math.comb(n, i) / 2**n
    obs = pk(k); return min(1, sum(pk(i) for i in range(n+1) if pk(i) <= obs*(1+1e-9)))
def kappa(a, b):
    n = len(a); po = sum(x == y for x, y in zip(a, b)) / n
    cats = set(a) | set(b); pe = sum((a.count(c)/n) * (b.count(c)/n) for c in cats)
    return po, (po - pe) / (1 - pe) if pe < 1 else float('nan'), 2*po - 1
def kw(x, y, K=5):
    n = len(x); O = [[0]*K for _ in range(K)]
    for a, b in zip(x, y): O[a-1][b-1] += 1
    r = [sum(R) for R in O]; c = [sum(O[i][j] for i in range(K)) for j in range(K)]; w = lambda i, j: (i-j)**2
    return 1 - sum(w(i, j)*O[i][j] for i in range(K) for j in range(K)) / sum(w(i, j)*r[i]*c[j]/n for i in range(K) for j in range(K))
f = lambda v: f'{v:.3f}'.replace('.', ',')

# ── Estudio 1
e1 = list(csv.DictReader(open('OE2_estudio1_respuestas.csv', encoding='utf-8')))
pref = {}; punt = defaultdict(list)
print('── Estudio 1')
for ev in ('Ev1', 'Ev4'):
    filas = [r for r in e1 if r['Evaluadora'] == ev]
    prods = sorted({r['Producto'] for r in filas})
    pref[ev] = [next(r['Sistema'] for r in filas if r['Producto'] == p and r['Preferido'] == 'si') for p in prods]
    k = pref[ev].count('postly'); lo, hi = wilson(k, 8)
    dif = {d: sum(int(next(r[d] for r in filas if r['Producto'] == p and r['Sistema'] == 'postly')) - int(next(r[d] for r in filas if r['Producto'] == p and r['Sistema'] == 'generico')) for p in prods) / 8 for d in D}
    nv = sum(int(r['No_verificables']) for r in filas if r['Sistema'] == 'postly')
    print(f'  {ev}: Postly {k}/8, Wilson [{f(lo)}; {f(hi)}], binomial bilateral p = {f(binom2(k, 8))}; dif. medias', {d: round(v, 2) for d, v in dif.items()}, f'; no verificables Postly {nv}/8')
    for p in prods:
        for s in ('postly', 'generico'):
            r = next(r for r in filas if r['Producto'] == p and r['Sistema'] == s); punt[ev] += [int(r[d]) for d in D]
po, k, pabak = kappa(pref['Ev1'], pref['Ev4'])
print(f'  acuerdo en la preferencia {round(po*8)}/8, κ = {f(k)} (Ev1 sin variación), PABAK = {f(pabak)}; puntajes κw cuadrático = {f(kw(punt["Ev1"], punt["Ev4"]))}, exacto {sum(a==b for a,b in zip(punt["Ev1"],punt["Ev4"]))}/64, ±1 {sum(abs(a-b)<=1 for a,b in zip(punt["Ev1"],punt["Ev4"]))}/64')

# ── Estudio 4
cl = {r['Par']: r for r in csv.DictReader(open('OE2_estudio4_clave.csv', encoding='utf-8'))}
e4 = list(csv.DictReader(open('OE2_estudio4_respuestas.csv', encoding='utf-8')))
print('── Estudio 4')
P = {}; O = {}; S = defaultdict(list)
for ev in ('Ev1', 'Ev4'):
    cop = [r for r in e4 if r['Evaluador'] == ev and r['Tipo'] == 'copy']
    pares = sorted({r['Par'] for r in cop}, key=lambda c: int(c[1:]))
    P[ev] = [next(r['Letra'] for r in cop if r['Par'] == c and r['Preferida'] == 'si') == cl[c]['Letra_postly'] for c in pares]
    k = sum(P[ev]); lo, hi = wilson(k, 32)
    porp = defaultdict(list)
    for c, v in zip(pares, P[ev]): porp[cl[c]['Participante']].append(v)
    may = sum(sum(v) > len(v)/2 for v in porp.values()); emp = sum(sum(v) == len(v)/2 for v in porp.values())
    dif = {d: sum(int(next(r[d] for r in cop if r['Par'] == c and r['Letra'] == cl[c]['Letra_postly'])) - int(next(r[d] for r in cop if r['Par'] == c and r['Letra'] == cl[c]['Letra_manual'])) for c in pares) / 32 for d in D}
    for c in pares:
        for L in ('A', 'B'):
            r = next(r for r in cop if r['Par'] == c and r['Letra'] == L); S[ev] += [int(r[d]) for d in D]
    orden = [r for r in e4 if r['Evaluador'] == ev and r['Tipo'] == 'orden']
    O[ev] = [r['Letra'] == cl[r['Par']]['Letra_postly'] for r in sorted(orden, key=lambda r: int(r['Par'][1:]))]
    ko = sum(O[ev]); lo2, hi2 = wilson(ko, 7)
    print(f'  {ev}: copy Postly {k}/32 ({100*k/32:.1f} %), Wilson [{f(lo)}; {f(hi)}]; mayoritario en {may} participantes, empate en {emp}, binomial bilateral sobre {may}: p = {f(binom2(may, may))}; dif. medias', {d: round(v, 2) for d, v in dif.items()})
    print(f'       orden Postly {ko}/7, Wilson [{f(lo2)}; {f(hi2)}], binomial bilateral p = {f(binom2(ko, 7))}')
po, k, pabak = kappa(P['Ev1'], P['Ev4']); print(f'  copy: acuerdo {round(po*32)}/32 ({100*po:.1f} %), κ = {f(k)}, PABAK = {f(pabak)}; ambas Postly en {sum(a and b for a,b in zip(P["Ev1"],P["Ev4"]))}, ambas manual en {sum((not a) and (not b) for a,b in zip(P["Ev1"],P["Ev4"]))}')
po, k, pabak = kappa(O['Ev1'], O['Ev4']); print(f'  orden: acuerdo {round(po*7)}/7, κ = {f(k)}, PABAK = {f(pabak)}')
print(f'  puntajes κw cuadrático = {f(kw(S["Ev1"], S["Ev4"]))}, exacto {sum(a==b for a,b in zip(S["Ev1"],S["Ev4"]))}/256, ±1 {sum(abs(a-b)<=1 for a,b in zip(S["Ev1"],S["Ev4"]))}/256')
