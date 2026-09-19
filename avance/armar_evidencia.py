# -*- coding: utf-8 -*-
"""
Arma la carpeta evidencia/ que acompaña a la entrega (N-03 del dictamen).

El paquete auditado en la segunda instancia contenía los CSV de casos pero no los
scripts del Anexo E.4 ni los archivos de resultados, de modo que las Tablas 3, 4, 6 y
10 no eran reproducibles por el lector: sólo podía confirmar que reconstruían desde la
columna de predicción. Este script deja en evidencia/ todo lo que el Anexo E nombra,
ejecuta los análisis y verifica que las cifras del §5.1 salgan del dato crudo.

Uso: python armar_evidencia.py
"""
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
DESTINO = RAIZ / 'evidencia'

DATOS = [
    'Casos_Compliance_Representativo.csv',
    'Casos_Compliance.csv',
    'Casos_Compliance_Limite.csv',
    'Compliance_Campo.csv',
    'Cronometraje_datos.csv',
    'TAM_respuestas.csv',
    # La fuente normativa del Anexo D. Desde que esta disponible, las dos reglas del
    # Modulo Centinela se contrastan contra su letra y no solo contra la elicitacion.
    'Pautas Mary Kay para el uso en las Redes Sociales.pdf',
    # extracto REDACTADO del workflow desplegado: solo el codigo de los cuatro nodos
    # de compliance, el prompt de vision y el SHA-256 de cada uno. Lo produce
    # verificar_patrones_desplegados.mjs --extraer y no lleva ningun identificador.
    'Nodos_compliance_desplegados.json',
    # el mismo extracto, pero del workflow ANTERIOR a la correccion: es el detector que
    # produjo las Tablas 3, 4 y 5 y el conjunto divergente de HU10 (M-1 de la 6a auditoria)
    'Nodos_compliance_desplegados_v1.json',
    # los cuatro prompts de generacion en sus dos estados, antes y despues de retirar el
    # llamado a la accion obligatorio, con el SHA-256 de cada uno (Anexo E.12). Como el
    # extracto de compliance, no lleva credenciales ni identificadores de la instancia.
    'Prompts_generacion.json',
]
SCRIPTS = [
    'run_compliance_text.mjs',
    'run_compliance_field.mjs',
    'run_compliance_hu10.mjs',
    'run_compliance_vision.mjs',
    'run_cronometraje.mjs',
    'run_tam.mjs',
    'armar_casos_imagen.py',
    'armar_casos_imagen_dificiles.py',
    # la prueba de que los dos scripts de compliance corren los detectores del
    # sistema desplegado y no una copia divergente (Anexo E.4)
    'verificar_patrones_desplegados.mjs',
    # el contraste de representatividad del conjunto principal contra el corpus real
    'run_representatividad.mjs',
    # mide el llamado a la accion que produce el generador, antes y despues de la
    # correccion de N-02 (Anexo E.12)
    'run_cta_generacion.mjs',
    # acota el efecto de la asimetria de la tarea manual sobre la hipotesis del 70 %
    # (N-03, Anexo E.2): no mide la subtarea, recorre sus valores posibles
    'run_sensibilidad_cronometraje.mjs',
]
# Artefactos que se MANTIENEN DIRECTAMENTE EN LA ENTREGA y no tienen original vigente
# aca. Se conservan tal cual: copiarlos desde RAIZ los haria retroceder, porque las
# copias que quedaron en avance/ son anteriores. `run_baterias.mjs` es el caso claro:
# la version de la entrega es la que ya no lleva el webhookId de produccion (N3-20).
EN_DESTINO = [
    'run_baterias.mjs',
    'run_umbrales.mjs',
    'fix-compliance-patterns.mjs',
    '_extraer_foto.mjs',
    '_foto_patron.json',
    '_desglose_b1b.mjs',
    'Baterias_resultados.csv',
    'Umbrales_HU_resultados.csv',
    'B1b_desglose.csv',
    # Los textos que el modelo devolvio en las dos corridas del Anexo E.12. NO se regenera:
    # volver a pedirlos daria otros textos y consumiria cupo. `run_cta_generacion.mjs
    # --rescorar` solo vuelve a puntuar los que estan guardados, de modo que la corrida es
    # reproducible y el dato, estable.
    'CTA_generacion_resultados.csv',
]
# subcarpetas que se conservan tal cual: las imagenes del canal HU8 y sus planillas, que
# no se regeneran aqui (las producen armar_casos_imagen*.py y las puntua el modelo)
CARPETAS = ['casos_imagen', 'casos_imagen_corrida2', 'casos_video', 'casos_carrusel',
            'casos_repost']
# (script, argumentos) — cada corrida deja su propio archivo de resultados
CORRIDAS = [
    ('run_compliance_text.mjs', ['Casos_Compliance_Representativo.csv', '--v1']),
    ('run_compliance_text.mjs', ['Casos_Compliance.csv', '--v1']),
    ('run_compliance_text.mjs', ['Casos_Compliance_Limite.csv', '--v1']),
    ('run_compliance_text.mjs', ['Casos_Compliance_Representativo.csv']),
    ('run_compliance_text.mjs', ['Casos_Compliance.csv']),
    ('run_compliance_text.mjs', ['Casos_Compliance_Limite.csv']),
    ('run_compliance_hu10.mjs', []),
    ('run_compliance_field.mjs', []),
    ('run_cronometraje.mjs', []),
    ('run_tam.mjs', []),
    ('run_representatividad.mjs', []),
    # No lleva --extraer: regenerar Prompts_generacion.json exige el workflow exportado,
    # que no forma parte de la entrega. Y no vuelve a llamar al modelo: --rescorar
    # re-puntua los textos ya guardados, de modo que la corrida es reproducible sin cupo.
    ('run_cta_generacion.mjs', ['--rescorar']),
    ('run_sensibilidad_cronometraje.mjs', []),
]

# El LEEME de la entrega NO se embebe aca. Estuvo embebido y eso lo volvio una trampa:
# al corregir `evidencia/LEEME.md` a mano, este script quedaba con el texto viejo y
# cualquier reejecucion revertia la correccion sin avisar. Ahora vive en un archivo
# versionado y este script solo lo copia.
LEEME_FUENTE = RAIZ / 'LEEME-evidencia.md'


def generados():
    """Los archivos que producen las CORRIDAS; se pueden borrar porque se rehacen."""
    return {p.name for p in DESTINO.glob('*_resultados*.csv')}


def auditar():
    """Qué haría una ejecución, sin tocar nada.

    Existe porque este script borra la carpeta de entrega antes de rehacerla, y la
    carpeta acumuló artefactos que él no conocía —los scripts de umbrales y de
    compliance, la segunda corrida del canal de imagen— que una reejecución habría
    borrado sin decirlo.
    """
    conocidos = set(DATOS) | set(SCRIPTS) | set(EN_DESTINO) | set(CARPETAS) | {'LEEME.md'}
    actuales = {p.name for p in DESTINO.iterdir()} if DESTINO.exists() else set()
    huerfanos = sorted(actuales - conocidos - generados())
    faltantes = [n for n in DATOS + SCRIPTS if not (RAIZ / n).exists()]
    if not LEEME_FUENTE.exists():
        faltantes.append(LEEME_FUENTE.name)
    # Un original más viejo que su copia en la entrega significa que la copia buena es
    # la de la entrega y que copiar la haría retroceder.
    retrocesos = [n for n in DATOS + SCRIPTS
                  if (RAIZ / n).exists() and (DESTINO / n).exists()
                  and (RAIZ / n).stat().st_mtime < (DESTINO / n).stat().st_mtime - 2]
    return huerfanos, faltantes, retrocesos


def main():
    huerfanos, faltantes, retrocesos = auditar()
    if faltantes:
        sys.exit('FALTAN en avance/: ' + ', '.join(faltantes))
    if huerfanos:
        print('*** La entrega tiene archivos que este script no conoce y borraría:')
        for h in huerfanos:
            print('   -', h)
        sys.exit('Agregalos a DATOS, SCRIPTS, EN_DESTINO o CARPETAS antes de seguir.')
    if retrocesos:
        print('*** El original de avance/ es más viejo que la copia de la entrega:')
        for r in retrocesos:
            print('   -', r)
        sys.exit('Copiarlos haría retroceder la entrega. Resolvé cuál es el bueno.')
    if '--verificar' in sys.argv:
        print('sin huérfanos, sin faltantes y sin retrocesos: una corrida es segura')
        return

    intactos = {n: (DESTINO / n) for n in list(CARPETAS) + list(EN_DESTINO)
                if (DESTINO / n).exists()}
    if DESTINO.exists():
        for hijo in DESTINO.iterdir():
            if hijo.name in intactos:
                continue
            shutil.rmtree(hijo) if hijo.is_dir() else hijo.unlink()
    DESTINO.mkdir(exist_ok=True)

    for nombre in DATOS + SCRIPTS:
        shutil.copy2(RAIZ / nombre, DESTINO / nombre)
        print(f'  copiado {nombre}')

    for nombre in CARPETAS:
        origen = RAIZ / nombre
        if origen.exists() and not (DESTINO / nombre).exists():
            shutil.copytree(origen, DESTINO / nombre)
        print(f'  conservada la carpeta {nombre}/')

    for nombre in EN_DESTINO:
        print(f'  conservado {nombre} (se mantiene en la entrega)')

    shutil.copy2(LEEME_FUENTE, DESTINO / 'LEEME.md')
    print(f'  copiado LEEME.md desde {LEEME_FUENTE.name}')

    print('\n--- ejecutando los análisis en evidencia/ ---')
    for script, args in CORRIDAS:
        r = subprocess.run(['node', script, *args], cwd=DESTINO,
                           capture_output=True, text=True, encoding='utf-8')
        etiqueta = f'{script} {" ".join(args)}'.strip()
        if r.returncode != 0:
            print(f'  *** FALLÓ {etiqueta}\n{r.stderr}')
            sys.exit(1)
        resumen = [l.strip() for l in r.stdout.splitlines()
                   if 'Recall' in l or 'κ' in l or 'reducción media' in l
                   or 't(' in l or 'TAM global' in l]
        print(f'  {etiqueta}')
        for l in resumen[:3]:
            print(f'      {l}')

    faltan = [f for f in DATOS + SCRIPTS if not (DESTINO / f).exists()]
    resultados = sorted(p.name for p in DESTINO.glob('*_resultados*.csv'))
    print(f'\nevidencia/: {len(list(DESTINO.iterdir()))} archivos')
    print(f'  archivos de resultados generados: {len(resultados)}')
    for r in resultados:
        print(f'    {r}')
    if faltan:
        sys.exit(f'FALTAN: {faltan}')

    # toda celda de veredicto poblada en los casos de texto
    import csv
    from collections import Counter
    print('\n--- verificación: columnas de resultado pobladas ---')
    for f in sorted(DESTINO.glob('Casos_*_resultados*.csv')):
        filas = list(csv.DictReader(f.open(encoding='utf-8')))
        vacias = [r['ID'] for r in filas if not r['Veredicto'].strip()]
        print(f'  {f.name}: {len(filas)} casos, {len(vacias)} sin veredicto')
        if vacias:
            sys.exit(f'sin veredicto: {vacias}')

    # el canal de imagen vive en su subcarpeta y lo puntua el modelo, no un script
    imagen = DESTINO / 'casos_imagen' / 'Casos_Compliance_Imagen_resultados.csv'
    if not imagen.exists():
        sys.exit(f'FALTA: {imagen.relative_to(DESTINO)}')
    filas = list(csv.DictReader(imagen.open(encoding='utf-8')))
    vacias = [r['ID'] for r in filas if not r['Veredicto'].strip()]
    conteo = Counter(r['Veredicto'].strip() for r in filas if r['Veredicto'].strip())
    print(f'  casos_imagen/{imagen.name}: {len(filas)} casos, {len(vacias)} sin veredicto'
          f'  ({dict(conteo)})')
    if vacias:
        sys.exit(f'canal de imagen sin puntuar: {vacias}')


if __name__ == '__main__':
    main()
