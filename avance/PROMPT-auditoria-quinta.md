# Prompt para la quinta auditoría, en sesión limpia

> **Antes de pegarlo, dos condiciones.**
>
> 1. Abrir Claude Code en una carpeta **fuera de `C:\dev\Tesis`** (es decir,
>    `C:\dev\auditoria-postly-5`). Si se abre dentro del repo, la sesión hereda el
>    `CLAUDE.md` del proyecto y la memoria persistente —que contiene todos los hallazgos,
>    las decisiones y las cifras previas— y la auditoría deja de ser independiente.
> 2. El `.docx` que se copie tiene que tener los **campos ya actualizados en Word**
>    (Ctrl+E, F9). En la copia que acompaña a este prompt ya lo están: el índice de tablas
>    lista las catorce, de la p. 22 a la 146, y el de figuras las quince, de la 32 a la 98.
>    Si se reemplaza el `.docx` por otro, hay que refrescar los campos antes.
>
> El contenido de la carpeta está al final de este archivo.

---

Actuás como evaluador de un tribunal académico. Tu trabajo no es ayudarme: es dictaminar
sobre un Trabajo Integrador con criterio adversarial. Doy por sentado que preferís señalar
un problema real antes que quedar bien.

Este trabajo ya fue auditado cuatro veces. La versión que vas a leer es la que se produjo
remediando el cuarto dictamen, y ese dictamen es tu rúbrica. Tu tarea tiene dos mitades de
igual peso: comprobar si la remediación es real, y buscar lo que las cuatro auditorías
anteriores no vieron.

Dos advertencias, y las dos importan más en esta instancia que en las anteriores.

**La primera: no des por buena una corrección porque el documento diga que la hizo.** Es el
mismo aviso que recibió el evaluador anterior y encontró tres regresiones con él. Varios
hallazgos se remedian cambiando frases, y una frase se corrige más fácil de lo que se
corrige el dato que la sostiene. Donde haya una cifra, andá al dato crudo.

**La segunda: esta remediación disputa dos hallazgos del dictamen que tenés, y te toca
arbitrar.** No las trates como correcciones aceptadas ni como excusas; verificá cuál de las
dos partes tiene razón. Están en la sección «Puntos en disputa», más abajo. Si el trabajo
tiene razón, decilo y anotá que el dictamen anterior se equivocó. Si no la tiene, es un
hallazgo agravado: el trabajo desestimó un hallazgo válido.

## Materiales

En esta carpeta hay:

- `Tesis Postly Bontorno Hassan-1 v2.docx` — el documento a auditar, en la versión que se
  va a entregar. Es un `.docx`: leelo con `python-docx` (`pip install python-docx`) o
  descomprimiendo `word/document.xml`. Son ~148 páginas, **1.174 párrafos**, **~47.600
  palabras en párrafos** más ~1.700 en celdas de tabla, **14 tablas** y **15 figuras** (con
  quince hashes MD5 distintos). Si tu extracción devuelve mucho menos que eso, falló y
  tenés que arreglarla antes de opinar. Recorré el cuerpo en orden para conservar la
  intercalación de párrafos y tablas. Leelo **completo**, incluidos los anexos, que son
  cinco (A a E) y donde está casi toda la evidencia.
- `dictamen-auditoria-4.md` — el dictamen de cuarta instancia, que calificó la versión
  anterior con 8,3/10. **Esta es tu rúbrica.** Sus §3 a §6 resumen además el estado de los
  hallazgos de los tres dictámenes anteriores, de modo que no necesitás esos documentos.
  Te interesan especialmente:
  - su **§7** (tres regresiones nuevas, `R4-01` a `R4-03`),
  - su **§8** (doce hallazgos nuevos, `H-01` a `H-12`, más dos «dudas, no hallazgos»),
  - su **§10** (los doce puntos que separaban al trabajo de un 10),
  - su **§11** (los trece puntos que ese evaluador declaró no haber podido verificar),
  - y, para no perder de vista lo anterior, los identificadores que sus §3 a §6 dejaron
    sin cerrar: `N3-13` (no verificable) y `N3-20` (no resuelto — ver «Puntos en disputa»).
- `evidencia/` — los datos crudos y los scripts de análisis que el documento cita en su
  Anexo E. Están para que verifiques las cifras del Capítulo 5, no para que confíes en
  ellas. Leé primero su `LEEME.md`: dice qué reproduce cada script y qué contiene cada
  archivo.

## Método

1. Leé el dictamen de cuarta instancia completo. Hacé la lista de las tres regresiones de
   su §7, los doce hallazgos de su §8, las doce acciones de su §10 y los trece puntos de su
   §11, cada uno con su identificador.
2. Leé el documento completo.
3. Para **cada** identificador de esas cuatro listas, determiná su estado actual y
   clasificalo, con evidencia:
   - **Resuelto** — citá la sección y el fragmento literal que lo resuelve.
   - **Parcial** — explicá exactamente qué falta.
   - **No resuelto** — citá dónde sigue el problema.
   - **Resuelto en la letra pero no en el dato** — la afirmación cambió y el dato que
     debería respaldarla no.
   - **No verificable** — decí qué te haría falta. Es una respuesta legítima; inventar un
     veredicto no lo es.
4. Buscá **regresiones**: defectos que esta remediación haya introducido. Las dos rondas
   anteriores encontraron cuatro y tres respectivamente, casi todas del mismo tipo —una
   cifra o una frase corregida en un lugar y no en los otros—, así que vale la pena
   rastrear cada número y cada formulación que cambió hasta **todas** sus apariciones. Esta
   pasada tocó texto en los seis capítulos y en dos anexos.
5. Recién después, buscá hallazgos **nuevos** que ninguno de los cuatro dictámenes vio.
   Poné aquí el esfuerzo que te sobre. Los capítulos 1, 2 y 7 siguen habiendo recibido
   menos atención que el 4, el 5 y el 6.

## Puntos en disputa

Dos hallazgos del dictamen que tenés fueron desestimados por esta remediación, con
argumento. Verificá los dos y dictaminá.

### 1. `N3-20` — el `webhookId` de producción en `run_baterias.mjs`

El dictamen de cuarta instancia lo declara **no resuelto** y sostiene que el `webhookId`
del Telegram Trigger y el chat ID por defecto «siguen escritos en el código» —los dos
valores concretos están en su §3, fila `N3-20`, y no se repiten aquí a propósito—. La
remediación afirma que el hallazgo es falso y que se arrastró de la tercera instancia sin
reverificar: que esos identificadores no están en el script, ni estaban en el paquete que
se auditó.

Comprobalo con un barrido sobre `evidencia/` y decí cuál de las dos partes tiene razón. Si
el script lee esos valores de un entorno, verificá que aborte cuando faltan y que no traiga
un valor por defecto. Y comprobá si el `LEEME.md` declara el punto con precisión o lo
sobreafirma.

### 2. `H-02` — la causa del modo *fail-open* del canal de imagen

El dictamen sostiene que el canal visual falla en abierto y que la cuota agotada de la API
es una de las condiciones que producen ese fallo: «el Anexo C.8 documenta que la cuota del
nivel gratuito se agotó en más de una ocasión —exactamente la condición que produce una
respuesta ausente o degradada—».

La remediación acepta el hallazgo de fondo —el cuerpo ahora declara el modo de falla— pero
disputa esa causa: sostiene que ante un error de la API el nodo de detección reintenta y,
agotados los reintentos, la ejecución **aborta sin publicar**, de modo que la ventana
*fail-open* es más angosta que «se agotó la cuota»: una respuesta válida cuyo texto no es un
JSON parseable. El §4.5.1 está redactado con esa distinción.

No tenés el workflow, de modo que no podés verificar la configuración del nodo. Lo que sí
podés hacer es juzgar si la distinción es coherente con lo que el script de evidencia
implementa y con lo que el documento afirma, y si el documento la declara como afirmación
propia o la presenta como verificada. Si no podés dirimirla, decilo: es una respuesta
legítima y el punto importa.

### 3. El *title case* de Schwaber & Sutherland

El §9.5 del dictamen registra «1 residuo de title case» en esa entrada. La remediación
sostiene que la entrada es APA 7 correcta —mayúscula inicial tras los dos puntos del
subtítulo— y por eso no la tocó. Dictaminá.

## Lo que esta remediación cambió, y que conviene mirar con atención

No es una lista de cosas por aprobar: es dónde está el trabajo nuevo, y por lo tanto dónde
es más probable que haya defectos nuevos.

- **La regla de video del Anexo D.** El dictamen encontró que el anexo atribuía a las
  Pautas un alcance que no tienen. El anexo se reescribió. Tenés el PDF: comprobá que la
  nueva formulación sea fiel a las páginas 7 y 8, que las citas sean verbatim, y que la
  conclusión que el trabajo extrae —auditar el video con el mismo criterio que el texto— se
  siga de la regla que ahora invoca.
- **El modo de falla del canal visual.** Se declara en cinco ubicaciones y el rótulo
  «Fail-Safe» del §4.5.1 se renombró. Comprobá que no quede ninguna afirmación de cobertura
  total sin condicionar, y que el «100 % de las ejecuciones» de HU9 —que es otro asunto— no
  se haya tocado por error.
- **Los dos cortes del canal de imagen.** El §5.4 y el §6.2 se reescribieron para reportar
  1,00 sobre los 20 casos habituales y 0,83 sobre los nueve difíciles, en lugar del 0,94
  agregado. Recalculá los tres números desde los dos archivos de resultados y comprobá que
  ninguna afirmación del cuerpo vuelva a apoyarse en el agregado. Ojo con un detalle: el
  caso `R01` no tiene veredicto en la segunda corrida, de modo que el corte de nueve toma su
  resultado de la primera; comprobá que las cifras del documento sean consistentes con esa
  composición y que el documento la declare.
- **La trazabilidad del criterio de HU2.** El §4.1.1 declara ahora que el criterio de
  aceptación original fijaba 60 días y que se reformuló después de medir. Comprobá que la
  Tabla 9 y la Tabla 13 sean coherentes con esa declaración.
- **La Tabla 13, fila HU6**, pasó de «Sí» a «Parcial». Comprobá que el motivo esté en la
  tabla y no sólo en la prosa.
- **La procedencia de la segunda recolección (Anexo E.6).** Es el tramo con la afirmación
  nueva que más peso carga, y merece el escrutinio más duro de esta auditoría. El trabajo
  declara ahora tres cosas: que esas nueve piezas las aportó una **cuarta** consultora,
  ajena al estudio de campo y **madre de uno de los dos autores**; que se recurrió a ella
  por una razón de plazos; y, como **testimonio de esa única informante**, que parte del
  material de marca son originales que las propias consultoras editan —texto, color,
  descripciones— para volverlos publicitarios, y parte son fotografías que ellas mismas
  toman de los productos en físico. Sobre eso, contestá cuatro preguntas:
  1. ¿El vínculo familiar está declarado donde corresponde, y afecta a alguna conclusión?
     El trabajo sostiene que no introduce sesgo de etiquetado porque la clase de `R01` no
     depende de un juicio del equipo. Evaluá el argumento.
  2. Las tres participantes del estudio de campo **no** tienen vínculo con el equipo, y por
     eso el §3.5.5 no incorporó una amenaza nueva. ¿Es correcta esa decisión, o el §3.5.2 y
     el §3.5.5 deberían declarar algo sobre la proximidad de la muestra?
  3. El trabajo usa ese testimonio para sostener que componer una placa de precio sobre
     arte de catálogo **reproduce la práctica del canal** en lugar de ser una operación de
     laboratorio, y con eso refuerza la validez ecológica del conjunto de prueba. ¿Aguanta
     esa inferencia sobre una sola informante? ¿Está declarada con la fuerza adecuada?
  4. El párrafo siguiente cita la letra de las Pautas que prohíbe modificar las imágenes de
     la Compañía. Junto al testimonio, ¿el trabajo termina afirmando que las consultoras
     reales infringen la norma? Si lo afirma sin sostenerlo, es un hallazgo.
- **La atribución del precio de `R01`.** El documento antes decía que estaba «impreso en la
  pieza por la propia marca» y ahora dice sólo que llegó impreso y que no lo compuso el
  equipo. Comprobá que ninguna ubicación conserve la atribución anterior, incluido el
  `LEEME.md` y las notas de las Tablas 12 y 14.
- **La aritmética del cupo del modelo.** El dictamen dejó como duda que la explicación de
  la `n = 9` no cerraba: nueve repeticiones a dos peticiones son dieciocho de un cupo de
  veinte. El Anexo E.5 se reescribió. Comprobá si ahora cierra o si la explicación nueva
  introduce otro problema.
- **La Figura 2.** La diagonal `Pendiente ↔ Fallido` era una sola línea con dos puntas y
  dos rótulos. Se partió en dos flechas y la de error va en rojo. Abrí `word/media/image2.png`
  a tamaño completo y comprobá que cada rótulo corresponda a su transición, que las cuatro
  transiciones restantes no se hayan dañado y que los estados sigan siendo cuatro.

## El mecanismo nuevo: la correspondencia con el nodo desplegado

El §11 del dictamen abre su lista de puntos no verificables con este: que las seis
expresiones regulares, los cuatro patrones de HU10 y el prompt de visión sean los del nodo
desplegado, «y todo el Capítulo 5 del canal textual descansa en esa transcripción».

La entrega incorpora ahora `verificar_patrones_desplegados.mjs` y
`Nodos_compliance_desplegados.json`, y el Anexo E.4 los documenta. **Corré el script** —es
instantáneo, no necesita la instancia y no consume cuota— y después evaluá el mecanismo con
criterio, porque no es una prueba completa y el documento no debería presentarla como tal:

- Lo que el script sí establece: que los patrones y el prompt de los scripts de evidencia
  coinciden carácter por carácter con los del extracto, y que los cuatro nodos de
  compliance llevan el mismo conjunto.
- Lo que **no** establece: que el extracto provenga del workflow que está efectivamente en
  marcha. El extracto se genera desde un workflow exportado, y ese workflow no acompaña a
  esta carpeta. La cadena de confianza se corta ahí.
- Preguntas para el dictamen: ¿el Anexo E.4 declara ese límite, o afirma más de lo que el
  mecanismo da? ¿El extracto contiene algún identificador de la instancia —webhook,
  credencial, URL— que no debería viajar? ¿Se puede regenerar el extracto con lo que hay en
  la carpeta, y si no, el documento lo dice?

## Verificaciones instrumentales que sí tenés que hacer

No opines sobre estos puntos: medilos.

### Qué correr y qué no

Los scripts de `evidencia/` se ejecutan con `node` y reproducen los análisis. Corré los que
puedas y compará su salida con lo que afirman las tablas del documento. Si una cifra del
texto no coincide con la que sale del dato crudo, es un hallazgo crítico. Si los datos no
alcanzan para sostener la afirmación, también.

| Script | Correr | Por qué / qué verificar en su lugar |
|---|---|---|
| `run_compliance_text.mjs` (con y sin `--v1`) | **Sí** | Tablas 3, 4, 6 y 10. |
| `run_compliance_field.mjs` | **Sí** | Tabla 5 y κ de Cohen. |
| `run_compliance_hu10.mjs` | **Sí** | §5.1 y E.1.4, divergencia del flujo programado. |
| `run_cronometraje.mjs` | **Sí** | Tabla 7 y prueba t. |
| `run_tam.mjs` | **Sí** | Tabla 8 y α de Cronbach. |
| `verificar_patrones_desplegados.mjs` | **Sí** | Ver la sección anterior. |
| `run_baterias.mjs` | No | Necesita la instancia de n8n, su clave de API y un token de Meta. Verificá la Tabla 11 contra `Baterias_resultados.csv`. |
| `_desglose_b1b.mjs` | No | Lee el historial de esa instancia. Verificá `B1b_desglose.csv`. |
| `run_umbrales.mjs` | No | Ídem. Verificá la Tabla 13 contra `Umbrales_HU_resultados.csv`. |
| `run_compliance_vision.mjs` | No | Consume cuota de un servicio de pago con tope de 20 peticiones por día. Verificá las Tablas 12 y 14 contra `casos_imagen/…_resultados.csv` y `casos_imagen_corrida2/`, que traen el veredicto y la justificación textual del modelo caso por caso. |

Hay un punto declarado en el `LEEME.md` que conviene comprobar: dos celdas de
`Umbral_declarado` de `Baterias_resultados.csv` conservan una atribución que la Tabla 11
descartó, y el `LEEME.md` sostiene que el documento es más conservador que su propio archivo
de evidencia. Verificá que sea así y no al revés.

### La premisa normativa (Anexo D)

Tenés el documento corporativo en `evidencia/Pautas Mary Kay para el uso en las Redes
Sociales.pdf`, diez páginas. Contrastá:

- La regla de **precios**, que el Anexo D afirma transcribir de la letra.
- La regla de la **firma**: el Anexo D afirma que el documento corporativo **no** la exige
  con el alcance que el sistema le da, y que Postly la aplica igual como lectura
  conservadora. Comprobá las dos mitades.
- La regla de **video**, reescrita en esta versión. Ver más arriba.
- La restricción sobre **modificar imágenes de la Compañía**, que el Anexo E.6 cita ahora.
  Comprobá que la cita sea verbatim y que el alcance que el trabajo le atribuye sea el que
  el documento le da.
- Qué audita el módulo y qué no audita la norma, y si el trabajo declara esa diferencia en
  los dos lugares donde dice declararla (Anexo D y §5.4, «Transferibilidad»).

### Lo demás

- **La Tabla 5** se apoya en la columna `Resultado_sistema` de `Compliance_Campo.csv`, que
  trae el pie de foto **verbatim** de los 29 casos. Ejecutá el detector sobre esa columna y
  comprobá si reproduce el veredicto registrado, caso por caso. Las columnas de esa planilla
  no son las que `run_compliance_text.mjs` espera, así que vas a tener que mapearlas o
  reutilizar las expresiones regulares.
- **Toda referencia cruzada resuelve.** Verificá que cada «§x.y», «Tabla N», «Figura N» y
  «Anexo X» exista y sea lo que el texto dice que es. Y con particular atención a lo que el
  dictamen anterior tipificó como el defecto más difícil de detectar: **remisiones que
  resuelven a una sección existente pero afirman un contenido que ahí no está**. Encontró
  dos. Andá al destino de cada remisión y leé si dice lo que el origen promete.
- **Coherencia entre capítulos.** Compará lo que el Cap. 3 declara que se va a medir contra
  lo que el Cap. 5 reporta y contra lo que el Cap. 6 afirma haber demostrado.
- **Calibración.** Marcá toda afirmación cuya fuerza exceda a su evidencia: garantías,
  eliminaciones de riesgo, superioridades, porcentajes sin medición detrás,
  generalizaciones a partir de muestras chicas. Esta pasada retiró varias; comprobá si
  quedaron otras y si alguna de las nuevas formulaciones incurre en lo mismo.
- **Los umbrales de las Historias de Usuario (Tabla 13).** El trabajo declara seis de nueve
  verificados y distingue «medición» de «configuración». Comprobá que la distinción se
  sostenga fila por fila, incluida la descripción que el §5.1 hace de ella.
- **Referencias.** Contá las entradas, cuántas tienen DOI o identificador, cuántas son de
  revista arbitrada, cuántas posteriores a 2024, y si el formato APA es uniforme. Verificá
  que toda cita tenga su entrada y que no haya entradas huérfanas. Si tenés acceso a bases
  de editores, comprobá que los identificadores resuelvan y que los metadatos sean
  correctos; si no lo tenés, decilo y limitate a la coherencia interna.
- **Métricas de escritura.** Longitud media de oración, oraciones de más de 50 palabras,
  párrafos de más de 250 palabras y uso de registro promocional. Declará con qué criterio
  segmentaste, porque la media varía varios puntos según se corten o no las oraciones en dos
  puntos.
- **`N3-13`**, que el dictamen anterior no pudo verificar: si tres leyendas de figura están
  en el mismo párrafo que la imagen. Si tampoco podés, declaralo no verificable otra vez en
  lugar de darlo por resuelto.

## Reglas

- **No edites ningún archivo.** Tu salida es un dictamen, no una corrección.
- No elogies. No cierres con una nota de aliento. Si algo está bien, alcanza con decir que
  está resuelto y pasar al siguiente punto.
- No inventes hallazgos para parecer riguroso, y no omitas ninguno para ser amable.
- Distinguí siempre **defecto del documento** de **limitación declarada**: un límite que el
  trabajo reconoce explícitamente no es lo mismo que un problema que oculta. Pero tampoco
  aceptes una declaración como si fuera una solución: si una limitación declarada compromete
  una conclusión, decilo.
- No busques ni menciones calificaciones previas más allá de la del dictamen que tenés.
  Calificá lo que leés, no la distancia a un número anterior. En particular, **no asumas que
  la nota tiene que haber subido**: es la quinta pasada sobre el mismo texto, el riesgo de
  complacencia es tuyo y no del trabajo, y una remediación que toca seis capítulos puede
  perfectamente haber empeorado algo.
- Si algo te parece dudoso pero no podés probarlo, decilo como duda, no como hallazgo.

## Entregable

Escribí el dictamen en `dictamen-auditoria-5.md`, con esta estructura:

1. **Veredicto** — calificación global sobre 10 y una frase de estado (aprobada / aprobada
   con observaciones / requiere revisión). Usá la misma escala y los mismos pesos por
   capítulo que el dictamen que tenés, y mostrá la ponderación.
2. **Calificación por capítulo** — tabla con una nota por capítulo y el motivo en una línea.
3. **Estado de las tres regresiones del §7** — tabla con identificador, regresión, estado y
   la evidencia o lo que falta.
4. **Estado de los doce hallazgos del §8** — ídem, más las dos «dudas».
5. **Estado de las doce acciones del §10** — ídem.
6. **Estado de los trece puntos del §11** — qué de lo que el evaluador anterior no pudo
   verificar sí podés verificar vos ahora, y con qué resultado. Uno de esos puntos cambió de
   condición porque la entrega incorpora un mecanismo nuevo: decí cuál y qué encontraste.
7. **Los tres puntos en disputa** — tu arbitraje sobre `N3-20`, la causa de `H-02` y el
   title case, con la evidencia de cada uno.
8. **Regresiones nuevas** — defectos introducidos por esta remediación, si los hay.
9. **Hallazgos nuevos** — ordenados por severidad, cada uno con su ubicación exacta y por
   qué importa.
10. **Verificaciones instrumentales** — tabla de lo que mediste, con el número obtenido y el
    número que afirma el documento.
11. **Qué separa este trabajo de un 10** — lista accionable y ordenada por impacto.
12. **Qué no pude verificar** — explícito, con el motivo.

Al final, una nota que diga con qué fuiste capaz de verificar cada cosa y con qué no, para
que el lector sepa cuánto pesa cada juicio.

---

## Qué copiar a la carpeta de la auditoría

Desde PowerShell:

```powershell
$dst = "C:\dev\auditoria-postly-5"
$src = "C:\dev\Tesis\avance"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item "$src\Tesis Postly Bontorno Hassan-1 v2.docx"       $dst
Copy-Item "C:\dev\auditoria-postly-4\dictamen-auditoria-4.md" $dst
Copy-Item "$src\evidencia"                                    $dst -Recurse
Copy-Item "$src\PROMPT-auditoria-quinta.md"                   $dst
```

La carpeta tiene que quedar así:

```
C:\dev\auditoria-postly-5\
├── Tesis Postly Bontorno Hassan-1 v2.docx   ← con los campos actualizados en Word
├── dictamen-auditoria-4.md                  ← el dictamen de 4ª instancia: la rúbrica
├── PROMPT-auditoria-quinta.md               ← este archivo
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
    ├── Nodos_compliance_desplegados.json          ← extracto redactado del workflow (Anexo E.4)
    ├── verificar_patrones_desplegados.mjs         ← CORRER: scripts vs. nodo desplegado
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

Lo que **no** va: el repositorio, el `CLAUDE.md`, el workflow de n8n exportado, los
dictámenes anteriores al de cuarta instancia, las carpetas `pub consultoras/`,
`infractoras/` y `fotos jere/` (su contenido ya viaja transcrito o compuesto en
`evidencia/`), los respaldos `*.bak-*` y los scripts `_pasada*.py`. Nada de eso aporta a la
auditoría y todo eso la contamina o la distrae.
