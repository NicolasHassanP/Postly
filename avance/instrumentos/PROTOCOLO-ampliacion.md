# Protocolo de la evaluación ampliada — Postly

Este documento fija el procedimiento **antes** de medir. Esa anterioridad es su función: un
protocolo escrito después de ver los datos no protege de nada. Se redacta para cerrar las
cuatro amenazas que la evaluación piloto declaró y no pudo resolver (§3.5.5 de la tesis):
el tamaño muestral, el orden no contrabalanceado, la subtarea de adaptación que no se
registró y el cuestionario sin ítems invertidos.

**Fecha de redacción:** 23 de septiembre de 2026. **Estado:** sin ejecutar.

---

## 1 · Qué se mide y contra qué umbral

| Variable | Instrumento | Umbral declarado de antemano |
|---|---|---|
| (a) Tiempo operativo de publicación | Cronometraje intra-sujeto, manual contra Postly | Reducción **> 70 %** (hipótesis del §4.2) |
| (b) Aceptación tecnológica | Cuestionario TAM v2, 12 ítems, con 3 invertidos | Sin umbral: se informa con su intervalo |
| (c) Efecto de aprendizaje y de orden | Los dos contrastes del §6 de este protocolo | Sin umbral: se informa aunque no sea significativo |

La variable (b) del piloto —la tasa de acierto del Módulo Centinela— no se remide acá: su
evidencia es de conjuntos de casos y no de participantes.

## 2 · Cuántas participantes y por qué

**24 Consultoras de Belleza Independientes**, con 4 publicaciones cada una (96 pares).

El número no es una aspiración: sale del piloto. Con el tamaño del efecto observado frente
al umbral (d = 0,52 sobre las medias por consultora), una potencia del 80 % a α = 0,05
unilateral exige **≈ 24 unidades independientes** (§7.7). Con menos de ese número, el
margen por encima del 70 % vuelve a no ser distinguible de cero, que es exactamente la
limitación que esta ampliación existe para levantar.

**Criterio de parada:** se cierra el reclutamiento al llegar a 24, o a las ocho semanas de
iniciado, lo que ocurra primero. Si se cierra por tiempo con menos de 24, se informa el n
alcanzado y la potencia efectiva que ese n da, sin reformular la hipótesis.

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
los autores, y esa proximidad es una amenaza declarada. En la ampliación **al menos 16 de
las 24 deben tener relación «Ninguna»**, y el análisis informa la reducción media por
estrato de relación. Si los dos estratos difieren, se informa; no se descarta a nadie.

## 4 · La tarea, idéntica en las dos condiciones

Crear y publicar **una publicación de feed en Instagram y Facebook** para un producto dado,
cumpliendo las normas de la marca: sin precio en el copy ni en la imagen, y con la firma de
identidad al pie.

Cada participante hace **4 publicaciones: 2 de imagen única y 2 de carrusel**, en ambas
condiciones. El tipo se registra en la planilla, dato que el piloto no tuvo y que le impidió
ponderar la asimetría del carrusel.

El material gráfico se entrega ya elegido. La búsqueda o creación de contenido no entra en
ninguna condición, igual que en el piloto, para que el tramo medido sea el mismo.

## 5 · Qué se cronometra, y el cronómetro partido

El tramo es «material en mano → publicación confirmada en ambas redes». **Lo lleva quien
observa, no la participante.**

La novedad respecto del piloto es que el tiempo manual se toma **en dos tramos separados**:

1. **Adaptación** — desde que recibe la imagen hasta que la tiene en el formato con que va a
   publicar (recorte, encuadre, reencuadre para feed).
2. **Producción y publicación** — redacción del copy, verificación de cumplimiento y
   publicación en cada red.

El motivo es que Postly no ejecuta la adaptación (§4.4.2 de la tesis), de modo que incluirla
en la condición manual infla la reducción. El piloto no registró su duración y tuvo que
acotar su efecto con un análisis de sensibilidad. Acá se mide, y **la reducción principal se
calcula sobre el tramo 2**, que es el que las dos condiciones comparten. La reducción sobre
el total se informa al lado, rotulada como tal.

## 6 · Orden de las condiciones: contrabalanceado

Cada participante recibe un orden asignado por bloques alternos al ingresar al estudio:

- **Secuencia MP** (12 participantes): primero la condición manual, después Postly.
- **Secuencia PM** (12 participantes): primero Postly, después la manual.

Dentro de la sesión, las 4 publicaciones alternan el orden de condición. Esto no elimina el
aprendizaje: lo distribuye entre las dos condiciones, de modo que deje de confundirse con el
efecto de la herramienta.

**Dos contrastes se informan siempre**, den lo que den:

- **Efecto de orden:** reducción media de MP contra PM (t de Welch para muestras
  independientes).
- **Efecto de aprendizaje:** tiempo con Postly en la primera publicación contra la cuarta,
  dentro de cada participante (t pareada).

## 7 · Consentimiento

**Por escrito**, con el formulario `CONSENTIMIENTO.md` de esta carpeta, firmado antes de la
sesión. El piloto usó consentimiento verbal y lo declaró como carencia del procedimiento;
esta ampliación la corrige.

La participante recibe copia. Los formularios firmados **no se depositan** con el material
complementario: contienen nombre y firma. Se conservan en poder de los autores y se informa
su número.

## 8 · El análisis, fijado antes de ver los datos

Para que el contraste no dependa de decisiones tomadas después:

1. **Unidad de análisis:** la participante. Los estadísticos se calculan sobre la reducción
   media de cada una, no sobre los 96 pares, porque las publicaciones de una misma persona
   no son observaciones independientes.
2. **Contraste principal:** t pareada unilateral con H₀: reducción = 70 %, α = 0,05, sobre
   el tramo 2. Es el contraste que le corresponde a la hipótesis del §4.2, y no el de
   reducción nula, que el piloto tuvo que aclarar que era otra cosa.
3. **Contraste secundario:** t pareada con H₀: reducción = 0, que establece que la
   herramienta reduce el tiempo, sin decir cuánto.
4. **Se informan siempre:** medias y DE por condición, reducción media con su intervalo del
   95 %, d de Cohen para muestras pareadas, los dos contrastes del §6, el n por estrato de
   relación previa, y la reducción calculada sobre el total además del tramo 2.
5. **Sin descartes:** ninguna observación se excluye por ser extrema. Si una sesión se
   interrumpe, se informa y su par no entra; el motivo se registra en la planilla.

## 9 · Qué archivos produce

| Archivo | Qué lleva |
|---|---|
| `Cronometraje_datos_v2.csv` | Un renglón por publicación: participante, secuencia, tipo, producto, orden dentro de la sesión, adaptación, manual, Postly |
| `TAM_respuestas_v2.csv` | Un renglón por participante, una columna por ítem, con los invertidos sin recodificar |
| `Reclutamiento_v2.csv` | Un renglón por participante con los seis criterios del §3 |

Los tres se analizan con `run_cronometraje_v2.mjs` y `run_tam_v2.mjs`, que ya están escritos
y corren sobre las plantillas vacías. Al cargar los datos reales, las Tablas 7 y 8 de la
tesis se recalculan sin tocar ningún análisis.

## 10 · Lo que este protocolo no corrige

Conviene decirlo acá y no dejarlo para el capítulo de limitaciones. La condición manual sigue
siendo autoadministrada en su ritmo, de modo que la participante puede imprimirle la
velocidad que quiera; el cronómetro en manos del observador acota esa amenaza sin
eliminarla. Y la evaluación sigue siendo de una sola marca y un solo ecosistema de
publicación: ampliar la muestra no amplía el alcance normativo del artefacto.
