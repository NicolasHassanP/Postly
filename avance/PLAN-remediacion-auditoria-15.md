# Plan de remediación del dictamen 15 (29-09-2026, 6,9/10)

Dictamen: `C:\Users\Nico\Downloads\dictamen-auditoria-15.md` (copiarlo a `avance/` al empezar, no está en el repo).
Estado de partida: PDF de 165 págs (commit 75654a5), 4 verificadores en verde, carpeta `C:\dev\auditoria-postly-15`.
Resultado de la 15: 0 críticos, **5 altos, 15 medios, 18 bajos**. Subió de 6,6 a 6,9.

## Restricciones de esta tanda (decididas por Nico el 29-09)

1. **No hay más sesiones con consultoras, ni con las de siempre ni con nuevas.** Todo lo que el dictamen
   pide con «replicar con personas nuevas» (etiquetadores, participantes, recolectar pies de foto de
   consultoras) queda **fuera**: se declara como límite y se propone como trabajo futuro.
2. **Sí se puede** desplegar el bot desde la máquina local y correr pruebas los propios autores. Ese tiempo
   es aceptable; el de coordinar terceros, no.
3. Ningún cambio al sistema si invalida la versión que midió las matrices, salvo decisión explícita (ver D-2).

## Decisiones que tiene que tomar Nico al abrir la sesión

- **D-1. ¿Se repite el recorrido de las 14 Historias para la Tabla 9 (N-01)?** Recomendado: **sí**, sobre E2
  local, hecho por los autores, anotando el número de ejecución de cada Historia. Cuesta una tarde y cuota de
  Gemini (activar el pago o repartir en dos días; el nivel gratuito da 20 peticiones/día, ver
  `postly-n8n-local-mediciones`). Requiere `.\start-n8n.ps1`, el túnel de ngrok arriba y **bajarlo al terminar**.
- **D-2. ¿Se refactoriza el compliance a un sub-workflow único (N-05)?** Recomendado: **no en esta tanda**.
  Cambiaría el sistema que midieron las matrices y obligaría a repetir los harnesses y a redesplegar. En su
  lugar: redibujar la Figura 4 y reescribir el §5.1.3 y el B.2 para decir lo que es (un conjunto de reglas
  copiado en cuatro nodos, con un script que lo sincroniza y otro que verifica la identidad). Si Nico prefiere
  refactorizar, es un trabajo aparte de varios días: refactor + `verificar_patrones_desplegados.mjs` +
  repetir los conjuntos de casos + actualizar Figura 4, B.2, B.4, E.4 y la Tabla de versiones.
- **D-3. ¿Se corrige la URL de retorno OAuth de E2 (N-01)?** Hace falta cambiar el redirect en el panel de
  Meta (lo hace Nico) y en los botones «Pedir vinculación» / «HU3: Re-vincular». Es opcional: si no se hace,
  el B.1 ya lo declara y solo se refuerza esa frase.

## Orden de trabajo

### Bloque A — solo texto (lo que más mueve la nota; sin sistema ni personas)

| # | Hallazgo | Acción concreta |
|---|---|---|
| A1 | **N-02** (alto) | Presentar el corpus de campo como **comprobación de cobertura**: «12/12 mensajes con precio detenidos; 0/15 bloqueos indebidos sobre pies sin cifra». Retirar el F1 de 0,923 del Resumen, del §8.1 y de la Tabla 15, o dejarlo solo con la frase del §6.1.3 que lo relativiza. El panel A (1,00) se rotula como reetiquetación posterior. |
| A2 | **N-03** (alto) | Reescribir la conclusión del OE3 (§8.1: hoy abre con «se cumplió») y el §7.5 («cubre ese vacío funcionalmente») con la cobertura medida, 12/25. Examinar la **firma con la marca en Instagram** frente a las dos reglas de la p. 1 del Anexo D (única página de negocios con la marca = Facebook; permiso escrito para usar las marcas): dejar de llamarla «sobrecumplimiento» sin más. La línea de contacto ya está declarada abierta (§4.3.2): agregarla al §7.5. |
| A3 | **N-04** (alto) | No se puede replicar. Agregar en el §3.5.5 una **tabla de procedencia de la evidencia** (quién enunció las reglas, quién aportó, quién etiquetó, quién juzgó, quién cronometró, para cada resultado) y declarar la acumulación como amenaza única con su límite. Mover la replicación con terceros a §8.2 como trabajo futuro. |
| A4 | **N-01** (alto), parte de texto | Tabla **«versión → evidencia»** (en el Anexo B o en el §6.1): qué estado del sistema (E1/E2, antes o después del 19-09 y del 28-09; commit o hash del workflow) produjo cada tabla del Cap. 6 y cada captura. Advertir en las Figs. 7–10 que son de E1 y en N-15 que el bot mostraba un límite que ya no es el vigente. Con D-1 hecho, la Tabla 9 gana números de ejecución. |
| A5 | **N-05** (alto), versión sin refactor | Ver D-2. Redibujar la Figura 4 (`redibujar_figura4.py`), reescribir §5.1.1, §5.1.3 y B.2 sin «alta cohesión» ni DRY para el compliance. |
| A6 | N-08, N-19, N-28 | Pasada terminológica: definir el constructo una sola vez (§2.4, §4.3.1, §6.1.3); «norma», «normativa» y «RegTech» pasan a «pautas corporativas» donde corresponda; corregir el encabezado del §2.4 que su texto contradice. |
| A7 | N-07 | El §3.4.1 dice «confirmó» y el Anexo D «no la corroboran»: alinear. |
| A8 | N-09 | Informar el TAM de PU **por ítem** (el alfa de PU es 0,29) y retirar o condicionar «alta». Datos ya en E.3. |
| A9 | N-13, N-17 | Separar el criterio original de cada HU de su resultado (el resultado va a la Tabla 13); reformular HU4.1; declarar el 70 % como convención de partida, no como resultado de un cálculo. |
| A10 | N-16 | Contraste de magnitudes en la Discusión (Kumar et al., Kunstmann et al., referencias TAM) con lo que ya se leyó completo. |
| A11 | N-18 | Anexo con el piloto (12 pares, TAM de 10 ítems) con los datos que ya existen en `Cronometraje_datos.csv`. |
| A12 | N-06 | Documentar el protocolo de la revisión amplia (revistas, ejes, cadenas, incluidos) desde `instrumentos/PROTOCOLO-revision.md` y `Candidatos_bibliografia.csv`; cerrar el inventario del §1.6.0. |
| A13 | N-10 | Declarar que la especificidad visual no es identificable (el archivo no conserva la respuesta cruda) y quitar su reutilización sin salvedad. Opcional con cuota: repetir los 20 casos guardando la respuesta cruda (no requiere personas). |
| A14 | N-12 | Declarar el descarte a partir de la 11.ª imagen y que ningún carrusel de más de 6 se procesó. Opcional: probar uno de 10 imágenes (lo hacen los autores). |
| A15 | N-20, N-32, N-36, N-37 | N-20: la conducta de investigación frente a la letra de la pauta, con su difusión efectiva, va a limitaciones; N-32: quitar «ajenas al desarrollo» y «fuera de su círculo» donde no valen; N-36: rotular los criterios de la Tabla 1 como autoevaluación; N-37: describir la seguridad de E2 (túnel, sin autenticación de webhooks, ver CLAUDE.md). |

### Bloque B — bajos y forma (rápidos)

- **N-26 (real, nuestro):** los Wilcoxon del texto (0,027 y 0,191) salen de los tiempos **exactos** de la planilla;
  desde los tiempos redondeados al segundo que transcribe el E.2 dan 0,039 y 0,156, y la brecha máxima es 68 s
  contra 69 s. Elegir: (a) reportar lo que el lector recalcula y aclarar que la planilla tiene decimales, o
  (b) transcribir los tiempos con decimales. Transcribir además las secuencias MP/PM (C1–C4 MP, C5–C8 PM).
  Actualizar `sensibilidad_tiempo_omitido.mjs` para leer el mismo redondeo, si se elige (a).
- N-14 (B.9 con la rama de más de 60 s y la de duración ilegible, y corregir la remisión del §1.5.2), N-21
  (§1.1 remite al §3.4.1 por «cuatro roles» que no están), N-22 (§6.2 anuncia tres y enumera dos, ya cambié
  «Dos» por «Tres» y ahora enumera dos: cerrar), N-23 (las «tres» limitaciones del §7.7), N-24 (incidencia del
  mensaje de éxito también en C7 y cómo se cronometró la publicación duplicada), N-25 (Tabla 15 contra 13 en
  HU6; justificar n = 6), N-27 («Estudio 4» antes de definirse; definir «Track A2»), N-29 (Tabla 7, nota partida
  de la Fig. 14, Resumen a ≤250 palabras —hoy 304—, «Director de Tesis» en la carátula), N-30 (dos defectos
  gramaticales en §4.1 y B.1), N-31 (C.3 «más de 180 nodos» → ~207), N-33 (Scrum: retitular «Sprints»),
  N-34 y N-35 (APA menores y seis atribuciones dudosas: Abendroth, Falcão y Canedo, Stegeman, Richardson y
  Rymer, Reddy, Wang 2026 → leer o suavizar), N-38 (§3.7.1 y Fig. 5 cuentan distinto las hojas).
- N-11: retirar del cuerpo la narrativa de versiones y correcciones; concentrar los nombres de archivo en una
  tabla del E.4. Es de estilo y ya quedó parcialmente declarado; hacerlo solo si sobra tiempo.

### Bloque C — cierre (siempre igual)

1. Cada corrección es un `avance/_pasadaNNN.py` (van por la **179**); copiar el .docx a `.bak-pre-pasadaNNN` antes.
2. Cuatro verificadores con `PYTHONIOENCODING=utf-8`: `verificar_documento.py`, `verificar_coherencia.py`,
   `verificar_csv.py`, `verificar_patrones_desplegados.mjs`. Además `medir_escritura.py` (oraciones >50 = 0).
3. Re-exportar el PDF con Word COM (script `export.ps1` en el TEMP: abre, `Fields.Update`, actualiza índices,
   `ExportAsFixedFormat`, guarda, cierra). Comprobar que no queden `WINWORD` colgados y que solo haya Arial.
4. `git add` explícito (no `-A`), commit y **no** subir `avance/instrumentos/lectura_obras_recientes/`.
5. Carpeta `C:\dev\auditoria-postly-16` con el PDF, el prompt (copiar `PROMPT-auditoria-decimoquinta.md` y
   actualizar la sección «Qué cambió») y `md_a_pdf.py`; lanzar la auditoría en sesión limpia **fuera** de
   `C:\dev\Tesis`.

## Trampas conocidas (no repetir)

- `reemplazar_parrafo` aplasta el formato: en párrafos con rótulo en negrita hay que rehacer los runs a mano.
- Tras re-exportar con Word, los rótulos de Tabla 11–15 pasan a `w:fldSimple`: `p.text` de python-docx pierde el
  número. `verificar_coherencia.py` ya usa `_texto()`; los scripts nuevos que busquen «Tabla 11.» tienen que usarlo.
- Un carácter con tilde puede venir descompuesto (NFD): si un `sustituir` no encuentra un texto que se ve
  idéntico, comparar `[hex(ord(c)) ...]`.
- Los datos reales de cada ejecución están en `~/.n8n/database.sqlite` (copiar con `-wal` y `-shm`, formato
  flatted): sirve para verificar hechos del sistema antes de escribirlos.
- Buscar cada afirmación corregida en TODO el documento (cuerpo y anexos): una corrección puntual deja la misma
  afirmación viva en otro capítulo.
- Zenodo: la 2.0.1 del abierto (29-09) sigue vigente. Los scripts nuevos (`sensibilidad_tiempo_omitido.mjs`,
  `estudio4_por_secuencia.mjs`) están solo en el repo y la tesis lo dice. Si se agrega algo al depósito hace falta
  un token de API del dueño de los registros (`deposit:write` + `deposit:actions`); dejarlo como borrador y
  revocarlo al terminar.

## Expectativa honesta

Con el Bloque A y B, lo razonable es pasar de 6,9 a algo entre 7,2 y 7,5. **El 9 no sale de acá:** lo separan
N-01, N-04 y N-05, que son límites de la evidencia y del diseño y no se cierran escribiendo ni sin personas
nuevas. Si el profesor exige >9, esa conversación es aparte de esta tanda.
