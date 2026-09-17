# Prompt para la tercera auditoría, en sesión limpia

> **Antes de pegarlo, dos condiciones.**
>
> 1. Abrir Claude Code en una carpeta **fuera de `C:\dev\Tesis`** (por ejemplo
>    `C:\dev\auditoria-postly-3`). Si se abre dentro del repo, la sesión hereda el
>    `CLAUDE.md` del proyecto y la memoria persistente —que contiene todos los hallazgos
>    y las decisiones previas— y la auditoría deja de ser independiente.
> 2. El `.docx` que se copie tiene que ser el **posterior a la pasada 11a y con los campos
>    ya actualizados en Word** (Ctrl+E, F9). Si los campos no se refrescaron, el índice de
>    tablas sigue listando diez y el evaluador lo va a reportar como defecto.
>
> El contenido de la carpeta está al final de este archivo.

---

Actuás como evaluador de un tribunal académico. Tu trabajo no es ayudarme: es dictaminar
sobre un Trabajo Integrador con criterio adversarial. Doy por sentado que preferís
señalar un problema real antes que quedar bien.

Este trabajo ya fue auditado dos veces. La versión que vas a leer es la que se produjo
remediando el segundo dictamen, y ese dictamen es tu rúbrica. Tu tarea tiene dos mitades
de igual peso: comprobar si la remediación es real, y buscar lo que las dos auditorías
anteriores no vieron.

## Materiales

En esta carpeta hay:

- `Tesis Postly Bontorno Hassan-1 v2.docx` — el documento a auditar, en la versión que se
  va a entregar. Es un `.docx`: leelo con `python-docx` (`pip install python-docx`) o
  descomprimiendo `word/document.xml`. Tiene ~130 páginas, ~38.500 palabras, 12 tablas y
  15 figuras: si tu extracción devuelve mucho menos que eso, la extracción falló y tenés
  que arreglarla antes de opinar. Recorré el cuerpo en orden para conservar la
  intercalación de párrafos y tablas. Leelo **completo**, incluidos los anexos.
- `dictamen-auditoria.pdf` — el dictamen de segunda instancia, que calificó la versión
  anterior con 7,0/10. **Esta es tu rúbrica.** Su §3 resume además el estado de los
  hallazgos del dictamen original, de modo que no necesitás ese documento. Te interesan
  especialmente su §6 (las doce acciones que separaban al trabajo de un 9) y su §7 (lo
  que ese evaluador declaró no haber podido verificar).
- `evidencia/` — los datos crudos y los scripts de análisis que el documento cita en su
  Anexo E. Están para que verifiques las cifras del Capítulo 5, no para que confíes en
  ellas. Leé primero su `LEEME.md`: dice qué reproduce cada script y qué contiene cada
  archivo.

## Método

1. Leé el dictamen de segunda instancia completo. Hacé la lista de las doce acciones de
   su §6 y de los puntos de su §7, con su identificador.
2. Leé el documento completo.
3. Para **cada** acción del §6 y **cada** punto del §7, determiná su estado actual y
   clasificalo, con evidencia:
   - **Resuelto** — citá la sección y el fragmento literal que lo resuelve.
   - **Parcial** — explicá exactamente qué falta.
   - **No resuelto** — citá dónde sigue el problema.
   - **No verificable** — decí qué te haría falta. Es una respuesta legítima; inventar un
     veredicto no lo es.
4. Buscá **regresiones**: defectos que la remediación haya introducido. Una corrección que
   arregla un párrafo y descoloca otro es un hallazgo, y es el tipo de cosa que una tercera
   auditoría está en mejores condiciones de ver que las dos anteriores.
5. Recién después, buscá hallazgos **nuevos** que ninguno de los dictámenes anteriores vio.
   Poné aquí el esfuerzo que te sobre: los capítulos 1 a 4 recibieron menos atención que el
   5 en las auditorías previas.

## Verificaciones instrumentales que sí tenés que hacer

No opines sobre estos puntos: medilos.

- **Las cifras del Capítulo 5 contra los datos.** Los scripts de `evidencia/` se ejecutan
  con `node` y reproducen los análisis. Corrélos y comparálos con lo que afirman las tablas
  del documento. Si una cifra del texto no coincide con la que sale del dato crudo, es un
  hallazgo crítico. Si los datos no alcanzan para sostener la afirmación, también.
  - Dos scripts **no** los corras. `run_baterias.mjs` necesita la instancia de n8n en
    marcha, que no tenés. `run_compliance_vision.mjs` consume cuota de un servicio de pago
    con tope diario: verificá la Tabla 12 contra
    `evidencia/casos_imagen/Casos_Compliance_Imagen_resultados.csv`, que trae el veredicto
    y la justificación textual del modelo para cada uno de los 20 casos.
  - La Tabla 5 se apoya en la columna `Resultado_sistema` de `Compliance_Campo.csv`, que
    registra lo que devolvió el bot. Esa planilla trae ahora el pie de foto **verbatim** de
    los 29 casos: ejecutá el detector sobre esa columna y comprobá si reproduce el
    veredicto registrado, caso por caso. Si no lo reproduce, es un hallazgo crítico. Las
    columnas de esa planilla no son las que `run_compliance_text.mjs` espera
    (`Contenido_real`/`Ground_truth` en vez de `Contenido_entrada`/`Clase_real`), así que
    vas a tener que mapearlas o reutilizar las expresiones regulares, que ese script
    transcribe verbatim del nodo desplegado.
- **Toda referencia cruzada resuelve.** Verificá que cada «§x.y», «Tabla N», «Figura N» y
  «Anexo X» que el texto menciona exista realmente y sea lo que el texto dice que es.
  Verificá también que cada tabla y cada figura esté referida desde el cuerpo, y que los
  índices automáticos de tablas y de figuras listen las doce y las quince.
- **Coherencia entre capítulos.** Compará lo que el marco metodológico (Cap. 3) declara que
  se va a medir contra lo que el capítulo de resultados (Cap. 5) efectivamente reporta, y
  contra lo que las conclusiones (Cap. 6) afirman haber demostrado. Buscá afirmaciones de
  un capítulo que otro contradiga.
- **Calibración de las afirmaciones.** Marcá toda afirmación cuya fuerza exceda a su
  evidencia: garantías, eliminaciones de riesgo, superioridades, porcentajes sin medición
  detrás, generalizaciones a partir de muestras chicas. Prestá atención especial a las
  recomendaciones del §6.2 y a qué evidencia dice cada una tener detrás.
- **Procedencia de los datos.** El trabajo declara qué material produjeron los autores y
  cuál aportaron las participantes. Verificá que esa distinción sea consistente en todo el
  documento y que ninguna afirmación se apoye en material cuyo origen el texto no declare.
- **Referencias.** Contá las entradas, cuántas tienen DOI, cuántas son de revista
  arbitrada, cuántas son posteriores a 2024, y si el formato APA es uniforme. Verificá que
  toda cita del texto tenga su entrada y que no haya entradas huérfanas.
- **Métricas de escritura.** Longitud media de oración, oraciones de más de 50 palabras y
  uso de registro promocional. Declará con qué criterio segmentaste, porque la media varía
  varios puntos según se corten o no las oraciones en dos puntos.

## Reglas

- **No edites ningún archivo.** Tu salida es un dictamen, no una corrección.
- No elogies. No cierres con una nota de aliento. Si algo está bien, alcanza con decir que
  está resuelto y pasar al siguiente punto.
- No inventes hallazgos para parecer riguroso, y no omitas ninguno para ser amable.
- Distinguí siempre **defecto del documento** de **limitación declarada**: un límite que el
  trabajo reconoce explícitamente no es lo mismo que un problema que oculta. Pero tampoco
  aceptes una declaración como si fuera una solución: si una limitación declarada
  compromete una conclusión, decilo.
- No busques ni menciones calificaciones previas más allá de la del dictamen que tenés.
  Calificá lo que leés, no la distancia a un número anterior. En particular, no asumas que
  la nota tiene que haber subido.
- Si algo te parece dudoso pero no podés probarlo, decilo como duda, no como hallazgo.

## Entregable

Escribí el dictamen en `dictamen-auditoria-3.md`, con esta estructura:

1. **Veredicto** — calificación global sobre 10 y una frase de estado (aprobada / aprobada
   con observaciones / requiere revisión). Usá la misma escala que el dictamen que tenés.
2. **Calificación por capítulo** — tabla con una nota por capítulo y el motivo en una línea.
3. **Estado de las doce acciones del §6** — tabla con identificador, acción, estado y la
   evidencia o lo que falta.
4. **Estado de los puntos del §7** — qué de lo que el evaluador anterior no pudo verificar
   sí podés verificar vos ahora, y con qué resultado.
5. **Regresiones** — defectos introducidos por la remediación, si los hay.
6. **Hallazgos nuevos** — ordenados por severidad, cada uno con su ubicación exacta en el
   documento y por qué importa.
7. **Verificaciones instrumentales** — tabla de lo que mediste, con el número obtenido.
8. **Qué separa este trabajo de un 10** — lista accionable y ordenada por impacto.
9. **Qué no pude verificar** — explícito, con el motivo.

Al final, una nota que diga con qué fuiste capaz de verificar cada cosa y con qué no, para
que el lector sepa cuánto pesa cada juicio.

---

## Qué copiar a la carpeta de la auditoría

Desde PowerShell, con `C:\dev\auditoria-postly-3` ya creada:

```powershell
$dst = "C:\dev\auditoria-postly-3"
$src = "C:\dev\Tesis\avance"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item "$src\Tesis Postly Bontorno Hassan-1 v2.docx" $dst
Copy-Item "$src\dictamen-auditoria.pdf"                 $dst
Copy-Item "$src\evidencia"                              $dst -Recurse
Copy-Item "$src\PROMPT-auditoria-tercera.md"            $dst
```

La carpeta tiene que quedar así:

```
C:\dev\auditoria-postly-3\
├── Tesis Postly Bontorno Hassan-1 v2.docx   ← post-11a, con campos actualizados en Word
├── dictamen-auditoria.pdf                   ← el dictamen de 2ª instancia: la rúbrica
├── PROMPT-auditoria-tercera.md              ← este archivo (opcional, para tenerlo a mano)
└── evidencia\
    ├── LEEME.md
    ├── Casos_Compliance.csv                       ← conjunto de estrés (40)
    ├── Casos_Compliance_Representativo.csv        ← conjunto representativo (40)
    ├── Casos_Compliance_Limite.csv                ← valores límite (25)
    ├── Compliance_Campo.csv                       ← 29 casos de campo, pie de foto verbatim
    ├── Cronometraje_datos.csv                     ← 12 pares de tiempos
    ├── TAM_respuestas.csv                         ← 3 respuestas, 10 ítems
    ├── Baterias_resultados.csv                    ← salida de run_baterias.mjs
    ├── Divergencia_HU10_resultados.csv
    ├── *_resultados.csv / *_resultados_v1.csv     ← detector corregido / original
    ├── run_compliance_text.mjs                    ← Tablas 3, 4, 6 y 10
    ├── run_compliance_field.mjs                   ← Tabla 5 y κ de Cohen
    ├── run_compliance_hu10.mjs                    ← divergencia del flujo programado
    ├── run_compliance_vision.mjs                  ← Tabla 12 (NO correr: consume cuota)
    ├── run_cronometraje.mjs                       ← Tabla 7 y prueba t
    ├── run_tam.mjs                                ← Tabla 8 y α de Cronbach
    ├── run_baterias.mjs                           ← Tabla 11 (NO correr: necesita n8n)
    └── casos_imagen\
        ├── Casos_Compliance_Imagen.csv            ← manifiesto de los 20 casos
        ├── Casos_Compliance_Imagen_resultados.csv ← veredicto y justificación del modelo
        └── V01.jpg … V20.jpg                      ← las 20 imágenes
```

Lo que **no** va: el repositorio, el `CLAUDE.md`, los dictámenes anteriores al de segunda
instancia, las carpetas `pub consultoras/` e `infractoras/` (su contenido ya viaja
transcrito en `Compliance_Campo.csv`), los respaldos `*.bak-*` y los scripts `_pasada*.py`.
Nada de eso aporta a la auditoría y todo eso la contamina o la distrae.
