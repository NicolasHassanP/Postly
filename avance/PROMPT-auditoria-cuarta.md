# Prompt para la cuarta auditoría, en sesión limpia

> **Antes de pegarlo, dos condiciones.**
>
> 1. Abrir Claude Code en una carpeta **fuera de `C:\dev\Tesis`** (es decir,
>    `C:\dev\auditoria-postly-4`). Si se abre dentro del repo, la sesión hereda el
>    `CLAUDE.md` del proyecto y la memoria persistente —que contiene todos los hallazgos,
>    las decisiones y las cifras previas— y la auditoría deja de ser independiente.
> 2. El `.docx` que se copie tiene que tener los **campos ya actualizados en Word**
>    (Ctrl+E, F9). En la copia que acompaña a este prompt ya lo están: el índice de tablas
>    lista las catorce y la entrada 11 dice «del sistema». Si se reemplaza el `.docx` por
>    otro, hay que refrescar los campos antes.
>
> El contenido de la carpeta está al final de este archivo.

---

Actuás como evaluador de un tribunal académico. Tu trabajo no es ayudarme: es dictaminar
sobre un Trabajo Integrador con criterio adversarial. Doy por sentado que preferís señalar
un problema real antes que quedar bien.

Este trabajo ya fue auditado tres veces. La versión que vas a leer es la que se produjo
remediando el tercer dictamen, y ese dictamen es tu rúbrica. Tu tarea tiene dos mitades de
igual peso: comprobar si la remediación es real, y buscar lo que las tres auditorías
anteriores no vieron.

Una advertencia sobre la tercera mitad, que no existe: **no des por buena una corrección
porque el documento diga que la hizo.** Varios de los hallazgos del dictamen anterior se
remediaron cambiando frases, y una frase se corrige más fácil de lo que se corrige el dato
que la sostiene. Donde haya una cifra, andá al dato crudo.

## Materiales

En esta carpeta hay:

- `Tesis Postly Bontorno Hassan-1 v2.docx` — el documento a auditar, en la versión que se
  va a entregar. Es un `.docx`: leelo con `python-docx` (`pip install python-docx`) o
  descomprimiendo `word/document.xml`. Son ~145 páginas, 1.167 párrafos, ~45.900 palabras
  en párrafos más ~1.700 en celdas de tabla, **14 tablas** y **15 figuras**. Si tu
  extracción devuelve mucho menos que eso, falló y tenés que arreglarla antes de opinar.
  Recorré el cuerpo en orden para conservar la intercalación de párrafos y tablas. Leelo
  **completo**, incluidos los anexos, que son cinco (A a E) y donde está casi toda la
  evidencia nueva.
- `dictamen-auditoria-3.md` — el dictamen de tercera instancia, que calificó la versión
  anterior con 7,5/10. **Esta es tu rúbrica.** Sus §3 y §4 resumen además el estado de los
  hallazgos de los dos dictámenes anteriores, de modo que no necesitás esos documentos.
  Te interesan especialmente:
  - su **§5** (cuatro regresiones, `R-01` a `R-04`),
  - su **§6** (veinte hallazgos nuevos, `N3-01` a `N3-20`),
  - su **§8** (las doce acciones que separaban al trabajo de un 10),
  - su **§9** (los once puntos que ese evaluador declaró no haber podido verificar).
- `evidencia/` — los datos crudos y los scripts de análisis que el documento cita en su
  Anexo E. Están para que verifiques las cifras del Capítulo 5, no para que confíes en
  ellas. Leé primero su `LEEME.md`: dice qué reproduce cada script y qué contiene cada
  archivo.

## Método

1. Leé el dictamen de tercera instancia completo. Hacé la lista de los veinte hallazgos de
   su §6, las cuatro regresiones de su §5, las doce acciones de su §8 y los once puntos de
   su §9, cada uno con su identificador.
2. Leé el documento completo.
3. Para **cada** identificador de esas cuatro listas, determiná su estado actual y
   clasificalo, con evidencia:
   - **Resuelto** — citá la sección y el fragmento literal que lo resuelve.
   - **Parcial** — explicá exactamente qué falta.
   - **No resuelto** — citá dónde sigue el problema.
   - **Resuelto en la letra pero no en el dato** — la afirmación cambió y el dato que
     debería respaldarla no. Es la categoría que más importa en esta instancia.
   - **No verificable** — decí qué te haría falta. Es una respuesta legítima; inventar un
     veredicto no lo es.
4. Buscá **regresiones**: defectos que esta remediación haya introducido. La ronda
   anterior encontró cuatro, todas del mismo tipo —una cifra corregida en un lugar y no en
   los otros tres—, así que vale la pena rastrear cada número que cambió hasta todas sus
   apariciones.
5. Recién después, buscá hallazgos **nuevos** que ninguno de los tres dictámenes vio. Poné
   aquí el esfuerzo que te sobre. Los capítulos 1, 2 y 7 recibieron menos atención que el
   5 y el 6 en las auditorías previas.

## Verificaciones instrumentales que sí tenés que hacer

No opines sobre estos puntos: medilos.

### Qué correr y qué no

Los scripts de `evidencia/` se ejecutan con `node` y reproducen los análisis. Corré los
que puedas y compará su salida con lo que afirman las tablas del documento. Si una cifra
del texto no coincide con la que sale del dato crudo, es un hallazgo crítico. Si los datos
no alcanzan para sostener la afirmación, también.

**Cuatro scripts no los corras**, y no porque sí:

| Script | Por qué no | Qué verificar en su lugar |
|---|---|---|
| `run_baterias.mjs` | Necesita la instancia de n8n en marcha, su clave de API y un token de Meta. No los tenés. | La Tabla 11 contra `Baterias_resultados.csv`, que es lo que el script produce. |
| `_desglose_b1b.mjs` | Lee el historial de ejecuciones de esa misma instancia. | `B1b_desglose.csv`, que es lo que deja. |
| `run_umbrales.mjs` | Ídem: lee el workflow desplegado y su historial. | La Tabla 13 contra `Umbrales_HU_resultados.csv`. |
| `run_compliance_vision.mjs` | Consume cuota de un servicio de pago con tope de 20 peticiones por día. | Las Tablas 12 y 14 contra `casos_imagen/Casos_Compliance_Imagen_resultados.csv` y `casos_imagen_corrida2/`, que traen el veredicto y la justificación textual del modelo caso por caso. |

### La batería de integración multimodal (fila `B1b` de la Tabla 11)

Es la cifra que el dictamen anterior reclamó y la que esta versión agrega, así que
verificala con particular cuidado:

- La media, el desvío, el mínimo y el máximo del documento contra la fila `B1b` de
  `Baterias_resultados.csv`.
- **La `n`.** El documento reporta nueve repeticiones donde el resto de las baterías
  reporta diez, y da una razón. Comprobá que la razón esté declarada y que sea la que el
  archivo respalda.
- **La afirmación sobre dónde está la dispersión.** El §5.1 sostiene que la variabilidad
  es del modelo y no de la orquestación, y apoya eso en `B1b_desglose.csv`. Recalculá los
  rangos de ese archivo y comprobá si sostienen la afirmación con esa fuerza.
- **La consistencia del JSON.** El documento la reporta como `n/n`. Preguntate qué es el
  denominador: si excluye las ejecuciones que no completaron la cadena, decilo.
- Y la pregunta de fondo: **¿mide lo que el §3.4.2 declara?** Ese apartado promete latencia
  *y* consistencia en la comunicación bidireccional con el modelo, con extracción de JSON.
  Contrastá la promesa contra la métrica, que es exactamente el defecto que el dictamen
  anterior encontró en la versión previa de esta misma tabla.

### La premisa normativa (Anexo D)

El dictamen anterior declaró no haber podido contrastar las dos reglas codificadas contra
el documento corporativo, porque el documento no estaba. **Ahora está**, en
`evidencia/Pautas Mary Kay para el uso en las Redes Sociales.pdf`, diez páginas. Leelo y
contrastá:

- La regla de **precios**: el Anexo D afirma transcribirla de la letra. Comprobalo.
- La regla de la **firma**: el Anexo D afirma que el documento corporativo **no** la exige
  con el alcance que el sistema le da, y que Postly la aplica igual como lectura
  conservadora. Comprobá las dos mitades de esa afirmación: que el documento no la exija, y
  que el trabajo lo declare sin sobreafirmar.
- Qué audita el módulo y qué no audita la norma, y si el trabajo declara esa diferencia.

### El canal de imagen (Tablas 12 y 14, Anexos E.6 y E.8)

- Las dos tablas son cortes de conjuntos distintos y el documento dice no promediarlos.
  Comprobá que ninguna afirmación del cuerpo los promedie de hecho.
- La **procedencia** de las imágenes fue el hallazgo crítico anterior. El trabajo declara
  ahora qué material es de la marca, cuál compusieron los autores y cuál es una pieza
  auténtica sin componer. Verificá que esa distinción sea consistente en **todas** sus
  apariciones —cuerpo, anexos, notas de tabla, `LEEME.md` y los docstrings de
  `armar_casos_imagen*.py`— y que ninguna afirmación se apoye en material cuyo origen el
  texto no declare.
- El documento reporta que una corrida de repetición alcanzó ocho de nueve casos y declara
  por qué. Comprobá que los archivos lo respalden y que la conclusión sobre variabilidad no
  exceda a lo que ocho casos permiten.

### Lo demás

- **La Tabla 5** se apoya en la columna `Resultado_sistema` de `Compliance_Campo.csv`, que
  trae el pie de foto **verbatim** de los 29 casos. Ejecutá el detector sobre esa columna y
  comprobá si reproduce el veredicto registrado, caso por caso. Las columnas de esa
  planilla no son las que `run_compliance_text.mjs` espera, así que vas a tener que
  mapearlas o reutilizar las expresiones regulares, que ese script transcribe verbatim del
  nodo desplegado.
- **Toda referencia cruzada resuelve.** Verificá que cada «§x.y», «Tabla N», «Figura N» y
  «Anexo X» que el texto menciona exista y sea lo que el texto dice que es. Verificá que
  cada tabla y cada figura esté referida desde el cuerpo, y que los índices automáticos
  listen las catorce tablas y las quince figuras. Comprobá también que cada rótulo de tabla
  sea un campo `SEQ` y no texto plano: una tabla rotulada a mano queda fuera del índice sin
  que nada lo avise.
- **Coherencia entre capítulos.** Compará lo que el marco metodológico (Cap. 3) declara que
  se va a medir contra lo que el capítulo de resultados (Cap. 5) reporta, y contra lo que
  las conclusiones (Cap. 6) afirman haber demostrado. Buscá afirmaciones de un capítulo que
  otro contradiga.
- **Calibración de las afirmaciones.** Marcá toda afirmación cuya fuerza exceda a su
  evidencia: garantías, eliminaciones de riesgo, superioridades, porcentajes sin medición
  detrás, generalizaciones a partir de muestras chicas. Prestá atención a las
  recomendaciones del §6.2 y a qué evidencia dice cada una tener detrás.
- **Los umbrales de las Historias de Usuario (Tabla 13).** El trabajo declara seis de nueve
  verificados, distingue «medición» de «configuración» y deja tres como no verificados.
  Comprobá que esa distinción se sostenga: una comprobación estructural no es una medición
  de latencia, y el documento no debería tratarlas como equivalentes. Revisá también los
  casos que la tabla reporta como cumplimiento parcial o condicionado.
- **Referencias.** Contá las entradas, cuántas tienen DOI o identificador, cuántas son de
  revista arbitrada, cuántas son posteriores a 2024, y si el formato APA es uniforme.
  Verificá que toda cita del texto tenga su entrada y que no haya entradas huérfanas. Si
  tenés acceso a bases de editores, comprobá que los identificadores resuelvan y que los
  metadatos sean correctos; si no lo tenés, decilo y limitate a la coherencia interna.
- **Métricas de escritura.** Longitud media de oración, oraciones de más de 50 palabras,
  párrafos de más de 250 palabras y uso de registro promocional. Declará con qué criterio
  segmentaste, porque la media varía varios puntos según se corten o no las oraciones en
  dos puntos.

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
  Calificá lo que leés, no la distancia a un número anterior. En particular, **no asumas
  que la nota tiene que haber subido**: es la cuarta pasada sobre el mismo texto y el
  riesgo de complacencia es tuyo, no del trabajo.
- Si algo te parece dudoso pero no podés probarlo, decilo como duda, no como hallazgo.

## Entregable

Escribí el dictamen en `dictamen-auditoria-4.md`, con esta estructura:

1. **Veredicto** — calificación global sobre 10 y una frase de estado (aprobada / aprobada
   con observaciones / requiere revisión). Usá la misma escala que el dictamen que tenés.
2. **Calificación por capítulo** — tabla con una nota por capítulo y el motivo en una línea.
3. **Estado de los veinte hallazgos del §6** — tabla con identificador, hallazgo, estado y
   la evidencia o lo que falta.
4. **Estado de las cuatro regresiones del §5** — ídem.
5. **Estado de las doce acciones del §8** — ídem.
6. **Estado de los once puntos del §9** — qué de lo que el evaluador anterior no pudo
   verificar sí podés verificar vos ahora, y con qué resultado. Tres de esos puntos
   cambiaron de condición porque el material que faltaba ahora está en la carpeta: decí
   cuáles y qué encontraste.
7. **Regresiones nuevas** — defectos introducidos por esta remediación, si los hay.
8. **Hallazgos nuevos** — ordenados por severidad, cada uno con su ubicación exacta en el
   documento y por qué importa.
9. **Verificaciones instrumentales** — tabla de lo que mediste, con el número obtenido y el
   número que afirma el documento.
10. **Qué separa este trabajo de un 10** — lista accionable y ordenada por impacto.
11. **Qué no pude verificar** — explícito, con el motivo.

Al final, una nota que diga con qué fuiste capaz de verificar cada cosa y con qué no, para
que el lector sepa cuánto pesa cada juicio.

---

## Qué copiar a la carpeta de la auditoría

Desde PowerShell, con `C:\dev\auditoria-postly-4` ya creada:

```powershell
$dst = "C:\dev\auditoria-postly-4"
$src = "C:\dev\Tesis\avance"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item "$src\Tesis Postly Bontorno Hassan-1 v2.docx"  $dst
Copy-Item "C:\dev\auditoria-postly-3\dictamen-auditoria-3.md" $dst
Copy-Item "$src\evidencia"                               $dst -Recurse
Copy-Item "$src\PROMPT-auditoria-cuarta.md"              $dst
```

La carpeta tiene que quedar así:

```
C:\dev\auditoria-postly-4\
├── Tesis Postly Bontorno Hassan-1 v2.docx   ← con los campos actualizados en Word
├── dictamen-auditoria-3.md                  ← el dictamen de 3ª instancia: la rúbrica
├── PROMPT-auditoria-cuarta.md               ← este archivo (opcional, para tenerlo a mano)
└── evidencia\
    ├── LEEME.md                                   ← leer primero
    ├── Pautas Mary Kay ... .pdf                   ← la fuente normativa del Anexo D
    ├── Casos_Compliance.csv                       ← conjunto de estrés (40)
    ├── Casos_Compliance_Representativo.csv        ← conjunto representativo (40)
    ├── Casos_Compliance_Limite.csv                ← valores límite (25)
    ├── Compliance_Campo.csv                       ← 29 casos de campo, pie de foto verbatim
    ├── Cronometraje_datos.csv                     ← 12 pares de tiempos
    ├── TAM_respuestas.csv                         ← 3 respuestas, 10 ítems
    ├── Baterias_resultados.csv                    ← Tabla 11
    ├── B1b_desglose.csv                           ← desglose por nodo de la batería multimodal
    ├── Umbrales_HU_resultados.csv                 ← Tabla 13
    ├── Divergencia_HU10_resultados.csv
    ├── *_resultados.csv / *_resultados_v1.csv     ← detector corregido / original
    ├── run_compliance_text.mjs                    ← Tablas 3, 4, 6 y 10
    ├── run_compliance_field.mjs                   ← Tabla 5 y κ de Cohen
    ├── run_compliance_hu10.mjs                    ← divergencia del flujo programado
    ├── run_compliance_vision.mjs                  ← Tablas 12 y 14 (NO correr: cuota)
    ├── run_cronometraje.mjs                       ← Tabla 7 y prueba t
    ├── run_tam.mjs                                ← Tabla 8 y α de Cronbach
    ├── run_baterias.mjs                           ← Tabla 11 (NO correr: necesita n8n)
    ├── run_umbrales.mjs                           ← Tabla 13 (NO correr: necesita n8n)
    ├── _desglose_b1b.mjs                          ← B1b_desglose.csv (NO correr: necesita n8n)
    ├── _extraer_foto.mjs / _foto_patron.json      ← auxiliares de la batería multimodal
    ├── fix-compliance-patterns.mjs                ← unifica los patrones en los cuatro nodos
    ├── armar_casos_imagen.py                      ← compone los 20 casos habituales
    ├── armar_casos_imagen_dificiles.py            ← agrega los 9 casos difíciles
    ├── casos_imagen\                              ← 29 casos: imágenes, manifiesto y resultados
    └── casos_imagen_corrida2\                     ← los 9 difíciles otra vez, para variabilidad
```

Lo que **no** va: el repositorio, el `CLAUDE.md`, los dictámenes anteriores al de tercera
instancia, las carpetas `pub consultoras/` e `infractoras/` (su contenido ya viaja
transcrito en `Compliance_Campo.csv`), los respaldos `*.bak-*` y los scripts `_pasada*.py`.
Nada de eso aporta a la auditoría y todo eso la contamina o la distrae.
