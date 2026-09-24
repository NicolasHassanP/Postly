# Protocolo de evaluación del Objetivo Específico 2

El §8.1 de la tesis declara que el OE2 «se cumplió en la integración y queda no evaluado en
la calidad». Tres capacidades quedaron sin medición: la calidad del copy (HU4), la
correspondencia entre el copy y el tono que se le pidió (HU6) y el ordenamiento del carrusel
(HU5). A eso se suma que sobre las alucinaciones el Capítulo 7 declara que no hay «ni
siquiera evidencia cualitativa».

Este protocolo define **cuatro** estudios. Los tres primeros son pequeños, comparten las
mismas evaluadoras y se pueden ejecutar en una sola sesión de unos 40 minutos por
participante. El cuarto se agregó el 24-09-2026, sobre material que ya produce la evaluación
ampliada (`PROTOCOLO-ampliacion.md`) sin costo de generación aparte.

**Fecha de redacción:** 23 de septiembre de 2026. **Revisado:** 24 de septiembre de 2026,
agregado el Estudio 4. **Estado:** sin ejecutar.

---

## Lo que los cuatro tienen en común

**Evaluadoras.** Para los Estudios 1 a 3: las mismas Consultoras de Belleza Independientes de
la evaluación ampliada, más —donde se indique— un evaluador externo. Para el Estudio 4: sólo
evaluadores ajenos a las 8 participantes (§ ahí abajo, la salvaguarda es específica de ese
estudio). Un mínimo de 5 evaluadores por estudio; con menos, los intervalos no dicen nada.

**A ciegas, y qué significa acá.** La evaluadora no sabe qué copy produjo qué sistema, ni
qué orden propuso la IA. El material se presenta con etiquetas neutras (A/B) y el orden de
presentación se aleatoriza por evaluadora. Quien administra la sesión **no puede ser quien
generó el material**, porque conoce la asignación.

**Nada se descarta después.** El material se genera una vez, antes de la primera sesión, y
se congela. Si una generación sale mal, se informa; no se vuelve a generar hasta que salga
bien, que sería elegir el resultado.

---

## Estudio 1 — Calidad del copy frente a un generador genérico (HU4)

**Pregunta.** ¿El copy de Postly es mejor que el que produce el mismo modelo sin las
instrucciones de sistema de Postly?

Ésa es la comparación que importa. El §8.1 declara que «no hubo comparación alguna con un
generador de texto genérico, de modo que este trabajo no está en condiciones de concluir
cuál de los dos resulta más adecuado». Comparar Postly contra nada no responde nada: el
modelo ya sabe escribir. Lo que hay que establecer es si el trabajo de ingeniería de prompts
aporta algo por encima del modelo crudo.

**Material.** 12 imágenes de producto, de las que las consultoras aportaron. Para cada una,
dos copys: el del prompt desplegado de Postly y el de un prompt genérico
(«Escribí un pie de foto para esta imagen de producto para Instagram»), con el mismo modelo
y la misma temperatura. Los produce `run_copy_pareado.mjs`, que exige un manifiesto
`Imagenes_manifiesto.csv` (`Imagen,Producto,Aportada_por`) para que la procedencia de cada
foto quede declarada antes de generar nada —no vuelve a pasar lo que corrigieron N3-02/N3-10.

El prompt desplegado devuelve tres tonos en una sola llamada; para el pareo se usa **uno por
imagen, por rotación fija** (Informativo, Vendedor, Divertido, …), no el que mejor salió. La
letra A/B también se fija de antemano, por paridad del índice de la imagen, y no se sortea al
imprimir el material: las dos reglas están en el script, así que cualquiera puede
reconstruirlas sin tener que confiar en que no se eligió nada después de ver un resultado.

**Tarea.** La evaluadora ve la imagen y los dos copys rotulados A y B —el orden de qué letra
es cada sistema varía de imagen a imagen, según la regla fija de arriba, no al azar en el
momento— y puntúa cada uno del 1 al 5 en cuatro dimensiones:

| Dimensión | Pregunta que se le hace |
|---|---|
| Fidelidad | ¿Describe lo que realmente se ve en la foto? |
| Utilidad comercial | ¿Lo publicarías tal cual en tu cuenta? |
| Voz de marca | ¿Suena a cómo se comunica la marca? |
| Cumplimiento | ¿Podrías publicarlo sin que te traiga problemas con la normativa? |

Y elige cuál de los dos prefiere, sin empate.

**Análisis.** Diferencia pareada por imagen en cada dimensión (t pareada sobre las medias por
evaluadora, con su intervalo), proporción de preferencia por Postly con intervalo de Wilson,
y acuerdo entre evaluadoras (α de Krippendorff sobre las puntuaciones). La unidad es la
evaluadora, no la imagen.

**La fidelidad mide también las alucinaciones.** Un copy que atribuye al producto algo que
no está en la imagen es una alucinación, y la dimensión la captura. Además, quien evalúa
marca con una casilla cada afirmación que no puede verificar contra la foto; la tasa de
copys con al menos una marca es la primera evidencia sobre alucinaciones que el trabajo
tendría.

---

## Estudio 2 — Correspondencia con el tono pedido (HU6)

**Pregunta.** ¿Los tres copys que el sistema devuelve corresponden a los tres tonos que se le
pidieron?

El criterio de aceptación de HU6 pedía «el tono semántico esperado para su categoría de
prompt», y la Tabla 13 declara que esa parte no fija umbral y no se evaluó.

**Material.** Los mismos 12 conjuntos de tres copys (Informativo, Vendedor, Divertido) que
produce el sistema, con el rótulo quitado y el orden mezclado dentro de cada conjunto.

**Tarea.** La evaluadora asigna cada copy a uno de los tres tonos. Asignación forzada: los
tres tonos se usan una vez por conjunto.

**Análisis.** Proporción de asignaciones correctas con intervalo de Wilson, contra el azar
—que con asignación forzada de tres elementos es 1/3—, y prueba binomial exacta. Matriz de
confusión de 3 × 3 para ver qué par de tonos se confunde: es más informativo que el
porcentaje global. Acuerdo entre evaluadoras con κ de Fleiss.

**Umbral declarado de antemano:** una correspondencia por debajo del 60 % de aciertos
significa que los tres tonos no se distinguen en la práctica, y así hay que informarlo,
aunque contradiga el diseño.

---

## Estudio 3 — Ordenamiento del carrusel (HU5)

**Pregunta.** ¿El orden que propone la IA es mejor que el orden en que se enviaron las
imágenes?

**Material.** 8 conjuntos de 4 a 6 imágenes. Para cada uno, dos secuencias: la que propuso el
sistema y la del envío original. Si para un conjunto ambas coinciden, se informa y el
conjunto queda fuera del contraste; esa coincidencia es un dato en sí.

**Tarea.** La evaluadora ve las dos secuencias, rotuladas A y B en orden aleatorio, y elige
cuál publicaría. Una sola pregunta, sin escalas: la decisión real que toma una consultora.

**Análisis.** Proporción de preferencia por la secuencia de la IA, con intervalo de Wilson y
prueba binomial contra 0,5. Con 8 conjuntos y 5 evaluadoras son 40 decisiones, y la unidad de
análisis vuelve a ser la evaluadora: se promedia dentro de cada una antes de contrastar.

**Lo que este estudio no puede decir.** Que una consultora prefiera una secuencia no
establece que rinda mejor en la plataforma. El alcance de la medición es la preferencia
declarada, y así hay que reportarlo.

---

## Estudio 4 — Manual contra Postly, a ciegas (agregado el 24-09-2026)

**Pregunta.** ¿Lo que produce Postly compite con lo que produce la propia consultora a mano?

Es la comparación que le falta a los Estudios 1 y 3: ésos miden a Postly contra un prompt
genérico y contra el orden de envío, nunca contra el trabajo real de una CBI. Es también la
que responde más directo al argumento central de la tesis, y no cuesta generación aparte: el
material sale solo de la evaluación ampliada, donde cada una de las 4 publicaciones por
participante ya se hace **dos veces**, una a mano y otra con Postly (`PROTOCOLO-
ampliacion.md`, §4).

**Material, por publicación de cada una de las 8 participantes:**

- **Copy** (las 4 publicaciones): el texto que escribió a mano contra el que usó de Postly.
- **Orden de carrusel** (las 2 publicaciones de carrusel): el orden en que ella armó el
  carrusel a mano contra el que propuso Postly.

Son hasta 32 pares de copy y 16 pares de orden. `armar_material_estudio4.mjs` los toma de
`OE2_estudio4_material.csv` —que se completa durante o después de cada sesión de
cronometraje, con la identidad de la participante— y produce la versión ciega para las
evaluadoras: quita la identidad, asigna la letra A/B **por paridad del índice del par**, la
misma regla fija que usa `run_copy_pareado.mjs`, y guarda aparte la clave real para quien
puntúa después.

**Quién evalúa, y la salvaguarda que hace falta acá y no en los otros tres.** Un evaluador
ajeno a las 8 participantes y al equipo de desarrollo —nunca una de las mismas 8, porque acá
sería juzgar en parte su propio trabajo, ni el equipo, porque conoce la asignación—. Mínimo 5
evaluadores, igual que los otros estudios.

**Tarea.** Para cada par de copy: puntuación 1–5 en las mismas cuatro dimensiones del Estudio
1 (fidelidad, utilidad comercial, voz de marca, cumplimiento) y preferencia sin empate. Para
cada par de orden: cuál de los dos publicaría, la misma pregunta del Estudio 3.

**Análisis.** El mismo que el Estudio 1 para el copy (diferencia pareada por dimensión,
proporción de preferencia con IC de Wilson, unidad = evaluador) y el mismo que el Estudio 3
para el orden. Se informan por separado: no hay razón para que el copy y el orden empujen en
la misma dirección.

**Lo que esto NO evalúa.** El destino de publicación difiere entre las dos condiciones que
generaron este material —la manual llegó a la cuenta real, la de Postly a la de prueba, por
la limitación declarada en `PROTOCOLO-ampliacion.md` §10—. Eso no afecta esta comparación,
porque lo que se muestra acá es el texto o el orden, nunca la cuenta de destino; se aclara
para que quede trazado de dónde sale el material.

---

## Archivos

| Archivo | Qué lleva |
|---|---|
| `OE2_copys_material.csv` | Lo produce `run_copy_pareado.mjs`: imagen, sistema (postly/generico), tono, texto, y la clave de la asignación A/B |
| `OE2_estudio1_respuestas.csv` | Evaluadora, imagen, etiqueta, cuatro puntajes, preferencia, afirmaciones no verificables |
| `OE2_estudio2_respuestas.csv` | Evaluadora, conjunto, copy, tono asignado |
| `OE2_estudio3_respuestas.csv` | Evaluadora, conjunto, secuencia preferida |
| `OE2_estudio4_material.csv` | Con identidad: participante, publicación, tipo, copy manual, copy Postly, orden manual, orden Postly. Se completa en las sesiones de cronometraje |
| `OE2_estudio4_ciego.csv` | Sin identidad. Lo produce `armar_material_estudio4.mjs` a partir del anterior: par, tipo, etiqueta A/B, contenido |
| `OE2_estudio4_respuestas.csv` | Evaluador, par, cuatro puntajes (si es copy), preferencia |

Los estudios 1 a 3 se analizan con `run_oe2.mjs`, que corre sobre las plantillas vacías y
dice qué falta cargar. El Estudio 4 usa el mismo script, más `armar_material_estudio4.mjs`
para pasar de `OE2_estudio4_material.csv` (con identidad) a la versión ciega.

## Cuánto mueve esto la nota

Los Estudios 1 a 3 cierran el único Objetivo Específico que hoy se declara no evaluado y dan
la primera evidencia sobre alucinaciones. El Estudio 4 responde algo distinto y más cercano
al argumento central: si lo que produce el sistema compite con el trabajo real de una CBI,
según un tercero que no sabe cuál es cuál. Ninguno de los cuatro toca la muestra de la
hipótesis principal, de modo que por sí solos no levantan el carácter piloto de la
evaluación: son condición necesaria y no suficiente.
