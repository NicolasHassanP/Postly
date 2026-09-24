# Protocolo de la evaluación ampliada — Postly

Este documento fija el procedimiento **antes** de medir. Esa anterioridad es su función: un
protocolo escrito después de ver los datos no protege de nada. Se redacta para cerrar las
cuatro amenazas que la evaluación piloto declaró y no pudo resolver (§3.5.5 de la tesis):
el tamaño muestral, el orden no contrabalanceado, la subtarea de adaptación que no se
registró y el cuestionario sin ítems invertidos.

**Fecha de redacción:** 23 de septiembre de 2026. **Revisado:** 24 de septiembre de 2026, por
el acceso real a participantes (§2). **Estado:** sin ejecutar.

---

## 0 · Por qué este protocolo cambió antes de correr una sola sesión

La versión del 23-09 dimensionaba el estudio en 24 participantes, calculado para tener
potencia del 80 % contra el umbral del 70 %. El acceso real del equipo a Consultoras de
Belleza Independientes fuera de su círculo es acotado: **8 participantes en total, las 3 del
piloto más 5 nuevas**, es el techo, no una meta conservadora.

Con 8 no se alcanza la potencia para un contraste confirmatorio (§2 lo calcula: 37,3 %). Dos
caminos:

- **(a) Correr igual con 24 «de nombre»** y llegar con menos, informando la potencia
  efectiva post-hoc. Es lo que decía la versión anterior de este protocolo.
- **(b) Reformular el objetivo del estudio *ahora*, antes de medir**, para que sea el que 8
  participantes sí pueden responder: no «¿la reducción supera el 70 %?», sino «¿cuánto reduce
  Postly el tiempo, con qué precisión, y sigue el margen contra el 70 % siendo compatible con
  la hipótesis?».

**Se elige (b).** Reformular antes de ver datos es una revisión legítima del diseño; hacerlo
después sería ajustar el análisis al resultado, que es exactamente lo que este documento
existe para impedir. El cambio queda declarado acá, con fecha, y el motivo es verificable: no
hay más participantes disponibles, no que el n = 24 resultara incómodo.

## 1 · Qué se mide y contra qué umbral

| Variable | Instrumento | Qué se declara de antemano |
|---|---|---|
| (a) Tiempo operativo de publicación | Cronometraje intra-sujeto, manual contra Postly | **Se estima**, con su intervalo de confianza del 95 %; no se contrasta como confirmación (§2) |
| (b) Aceptación tecnológica | Cuestionario TAM v2, 12 ítems, con 3 invertidos | Sin umbral: se informa con su intervalo |
| (c) Efecto de aprendizaje y de orden | Los dos contrastes del §6 de este protocolo | Sin umbral: se informa aunque no sea significativo |

La variable (b) del piloto —la tasa de acierto del Módulo Centinela— no se remide acá: su
evidencia es de conjuntos de casos y no de participantes.

**El contraste H₀: reducción = 0** (que la herramienta reduce el tiempo, sin decir cuánto) sí
tiene potencia suficiente con n = 8 —el piloto ya lo ganaba con n = 3, t(2) = 9,15— y es el
que sostiene el objetivo del §4.2 en esta ronda. El contraste contra el umbral del 70 % se
informa igual, con su p y su intervalo, pero **no es la prueba de la que depende la
conclusión**: es una estimación, declarada como tal.

## 2 · Cuántas participantes y por qué

**8 Consultoras de Belleza Independientes** —las 3 del piloto más 5 nuevas—, con 4
publicaciones cada una (32 pares). No hay margen de reclutamiento por encima de este número;
no rige criterio de parada por tiempo, el techo es de acceso.

**Lo que este n cambia respecto del piloto, con las cifras del propio conjunto piloto**
(reducción media 73,85 %, DE 6,94 puntos entre consultoras, d = 0,556 frente al 70 %):

| n | Potencia contra H₀: red. = 70 % (α = 0,05, unilateral) | Semiancho del IC 95 % | Intervalo de la reducción |
|---|---|---|---|
| 3 (piloto) | 2,5 % | ± 17,2 puntos | [56,6 % ; 91,1 %] |
| **8 (esta ampliación)** | **37,3 %** | **± 5,8 puntos** | **[68,1 % ; 79,7 %]** |
| 16 | 68,1 % | ± 3,7 puntos | [70,2 % ; 77,6 %] |
| 24 (diseño original) | 84,3 % | ± 2,9 puntos | [70,9 % ; 76,8 %] |

Con n = 8 el intervalo sigue conteniendo el 70 %, de modo que **el contraste confirmatorio no
se gana ni se pierde con este diseño**: cualquier resultado en esa banda es indistinguible del
umbral con esta muestra, y decir lo contrario sería sobre-interpretar. Lo que sí se gana,
frente al piloto, es que el intervalo se achica de ± 17,2 a ± 5,8 puntos —tres veces más
preciso— y deja de incluir valores como 56 % o 91 %, que no describen de forma creíble lo que
el sistema hace.

**Ampliar de 4 a 6 publicaciones por participante no compensa el n bajo**: con la varianza del
piloto, el semiancho del IC baja de ± 5,80 a ± 5,43 puntos, porque la dispersión está
predominantemente entre consultoras y no dentro de cada una. No se adopta: no justifica media
hora más de sesión por participante.

## 3 · A quién se incluye, y registrado

El piloto declaró cuatro criterios de selección y no registró el valor de ninguno, de modo
que un lector no podía comprobar cómo se aplicaron. Acá cada criterio es una columna de la
planilla y se completa **antes** de la sesión.

| Criterio | Cómo se registra | Inclusión |
|---|---|---|
| Actividad comercial vigente en el modelo de venta directa | Sí / No | Obligatorio |
| Publicaciones propias en los últimos 30 días | Número | ≥ 4 |
| Cuenta de Instagram profesional o de empresa | Sí / No | Obligatorio |
| Página de Facebook vinculada | Sí / No | Obligatorio |
| Uso previo de herramientas de programación de contenido | Ninguno / Ocasional / Habitual | Se registra, no excluye |
| Relación previa con el equipo de desarrollo | Ninguna / Conocida / Familiar | Se registra, no excluye |

La última fila importa más que las otras. El piloto midió sobre tres personas conocidas de
los autores —el 100 % de la muestra—, y esa proximidad es una amenaza declarada que **no se
cierra con más n si todas siguen siendo conocidas**. En esta ampliación las 3 del piloto
conservan su relación «Conocida»; de las 5 nuevas, **las 5 deben tener relación «Ninguna»**.
Con eso el estrato «Ninguna» pasa de 0 sobre 3 a 5 sobre 8 (62,5 %), y el análisis informa la
reducción media por estrato. Si los dos estratos difieren, se informa; no se descarta a nadie.

## 4 · La tarea, idéntica en las dos condiciones salvo el destino de publicación

Crear y publicar **una publicación de feed en Instagram y Facebook** para un producto dado,
cumpliendo las normas de la marca: sin precio en el copy ni en la imagen, y con la firma de
identidad al pie.

Cada participante hace **4 publicaciones: 2 de imagen única y 2 de carrusel**, en ambas
condiciones. El tipo se registra en la planilla, dato que el piloto no tuvo y que le impidió
ponderar la asimetría del carrusel.

El material gráfico se entrega ya elegido. La búsqueda o creación de contenido no entra en
ninguna condición, igual que en el piloto, para que el tramo medido sea el mismo.

**Salvedad declarada de antemano: el destino de publicación difiere entre condiciones.** La
condición manual publica en la cuenta real de la participante, como en el piloto. La
condición Postly publica en la **cuenta de prueba del equipo**, porque el sistema hoy sólo
tiene vinculada esa cuenta por OAuth (HU2) y no la de cada una de las 8 participantes. La
tarea que se cronometra —los pasos hasta que el sistema confirma la publicación— es idéntica
en ambos casos; lo que cambia es a dónde llega el resultado, y eso se declara como amenaza en
el §10, no se oculta ni se corrige con esta ronda.

## 5 · Qué se cronometra, y el cronómetro partido

El tramo es «material en mano → publicación confirmada» —en la cuenta real para la condición
manual, en la cuenta de prueba para Postly (§4)—. **Lo lleva quien observa, no la
participante.**

La novedad respecto del piloto es que el tiempo manual se toma **en dos tramos separados**:

1. **Adaptación** — desde que recibe la imagen hasta que la tiene en el formato con que va a
   publicar (recorte, encuadre, reencuadre para feed).
2. **Producción y publicación** — redacción del copy, verificación de cumplimiento y
   publicación en cada red.

El motivo es que Postly no ejecuta la adaptación (§4.4.2 de la tesis), de modo que incluirla
en la condición manual infla la reducción. El piloto no registró su duración y tuvo que
acotar su efecto con un análisis de sensibilidad, que fijó el punto de cruce en 65 segundos de
adaptación. **Con n = 8 este dato importa más que en el diseño de 24**: si el tramo 2 arroja
una reducción cercana o por debajo del umbral, el margen que hoy existe puede no sobrevivir a
la partición del cronómetro, y este protocolo está escrito para que ese resultado se informe
igual que uno favorable. La reducción principal se calcula sobre el tramo 2, que es
el que las dos condiciones comparten; la reducción sobre el total se informa al lado, rotulada
como tal.

## 6 · Orden de las condiciones: contrabalanceado

Cada participante recibe un orden asignado por bloques alternos al ingresar al estudio:

- **Secuencia MP** (4 participantes): primero la condición manual, después Postly.
- **Secuencia PM** (4 participantes): primero Postly, después la manual.

Dentro de la sesión, las 4 publicaciones alternan el orden de condición. Esto no elimina el
aprendizaje: lo distribuye entre las dos condiciones, de modo que deje de confundirse con el
efecto de la herramienta.

**Dos contrastes se informan siempre**, den lo que den —con n = 4 por secuencia, ninguno de
los dos tiene potencia para ser concluyente, y así se rotula el resultado—:

- **Efecto de orden:** reducción media de MP contra PM (t de Welch para muestras
  independientes).
- **Efecto de aprendizaje:** tiempo con Postly en la primera publicación contra la cuarta,
  dentro de cada participante (t pareada).

## 7 · Consentimiento

**Por escrito**, con el formulario `CONSENTIMIENTO.md` de esta carpeta, firmado antes de la
sesión. El piloto usó consentimiento verbal y lo declaró como carencia del procedimiento;
esta ampliación la corrige. Aplica a las 8 participantes, incluidas las 3 del piloto: el
consentimiento verbal original no cubre esta sesión nueva.

La participante recibe copia. Los formularios firmados **no se depositan** con el material
complementario: contienen nombre y firma. Se conservan en poder de los autores y se informa
su número.

## 8 · El análisis, fijado antes de ver los datos

Para que el contraste no dependa de decisiones tomadas después:

1. **Unidad de análisis:** la participante. Los estadísticos se calculan sobre la reducción
   media de cada una, no sobre los 32 pares, porque las publicaciones de una misma persona
   no son observaciones independientes.
2. **Resultado principal:** reducción media sobre el tramo 2 con su intervalo de confianza
   del 95 % (§1, §2). Es una estimación, no un contraste binario de umbral.
3. **Contraste que sostiene el objetivo del §4.2:** t pareada con H₀: reducción = 0, α = 0,05.
   Establece que la herramienta reduce el tiempo; no establece cuánto ni que supere el 70 %.
4. **Se informa, sin tratarlo como confirmatorio:** t pareada unilateral con H₀: reducción =
   70 %, con su p, para que quede a la vista si el resultado puntual queda por encima o por
   debajo del umbral —consciente de que con n = 8 esa lectura no tiene la potencia para ser
   concluyente en ningún sentido.
5. **Se informan siempre:** medias y DE por condición, reducción media con su intervalo del
   95 %, d de Cohen para muestras pareadas, los dos contrastes del §6, el n por estrato de
   relación previa, y la reducción calculada sobre el total además del tramo 2.
6. **Sin descartes:** ninguna observación se excluye por ser extrema. Si una sesión se
   interrumpe, se informa y su par no entra; el motivo se registra en la planilla.

## 9 · Qué archivos produce

| Archivo | Qué lleva |
|---|---|
| `Cronometraje_datos_v2.csv` | Un renglón por publicación: participante, secuencia, tipo, producto, orden dentro de la sesión, adaptación, manual, Postly |
| `TAM_respuestas_v2.csv` | Un renglón por participante, una columna por ítem, con los invertidos sin recodificar |
| `Reclutamiento_v2.csv` | Un renglón por participante con los seis criterios del §3 |

Los tres se analizan con `run_cronometraje_v2.mjs` y `run_tam_v2.mjs`, que ya están escritos
y corren sobre las plantillas vacías —el cálculo de potencia, intervalo y contrastes es
dinámico sobre el n que se cargue, no asume 24. Al cargar los datos reales, las Tablas 7 y 8
de la tesis se recalculan sin tocar ningún análisis.

## 10 · Lo que este protocolo no corrige

Conviene decirlo acá y no dejarlo para el capítulo de limitaciones. La condición manual sigue
siendo autoadministrada en su ritmo, de modo que la participante puede imprimirle la
velocidad que quiera; el cronómetro en manos del observador acota esa amenaza sin
eliminarla. Y la evaluación sigue siendo de una sola marca y un solo ecosistema de
publicación: ampliar la muestra no amplía el alcance normativo del artefacto.

**Amenaza nueva, declarada el 24-09-2026: el destino de publicación no es el mismo en las dos
condiciones** (§4). La manual llega a la cuenta real de la participante; la de Postly llega a
la cuenta de prueba del equipo, porque el sistema aún no tiene vinculada por OAuth (HU2) la
cuenta de cada una de las 8. Tres consecuencias, declaradas y no corregidas por este diseño:

- **El cronómetro no se ve afectado.** Los pasos que se miden —del material en mano a la
  confirmación del sistema— son los mismos sin importar el destino; no hay razón para que el
  tiempo de la condición Postly cambie por esto.
- **El TAM sí puede verse afectado**, en particular `BI1` (intención de seguir usando) y `PU3`
  (cumplimiento de las normas de marca, que la participante no puede verificar sobre su propia
  cuenta): está evaluando un sistema cuyo resultado no le llega a su audiencia real. Se informa
  el puntaje igual, sin ajustarlo, y esta amenaza se cita al lado.
- **La comparación ciega manual-contra-Postly (Estudio 4 de `PROTOCOLO-OE2.md`) no se ve
  afectada**, porque lo que se muestra a quien evalúa es el texto del copy o el orden de las
  imágenes, nunca una captura de la cuenta de destino: no hay información de a dónde se
  publicó que pueda filtrarse y romper el cegamiento.

Corregirla de raíz exige que las 8 participantes completen la vinculación por OAuth de HU2
con sus propias cuentas antes de la sesión, lo que no está entre los recursos de esta ronda
(§0). Queda para una ronda posterior, si el acceso lo permite.

Y lo que se declara en el §0 no deja de ser una limitación por estar declarada: **el estudio
queda descriptivo, no confirmatorio**, frente al umbral del 70 %. Eso no lo resuelve una
redacción cuidadosa; lo resolvería únicamente llegar a las ≈ 24 unidades independientes que
§2 calcula, y ese acceso no existe. La tesis tiene que decir esto mismo, con estas cifras, y
no una versión atenuada.
