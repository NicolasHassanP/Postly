# Protocolo de evaluación del Objetivo Específico 2

El §8.1 de la tesis declara que el OE2 «se cumplió en la integración y queda no evaluado en
la calidad». Tres capacidades quedaron sin medición: la calidad del copy (HU4), la
correspondencia entre el copy y el tono que se le pidió (HU6) y el ordenamiento del carrusel
(HU5). A eso se suma que sobre las alucinaciones el Capítulo 7 declara que no hay «ni
siquiera evidencia cualitativa».

Este protocolo define tres estudios que cierran esas cuatro cosas. Los tres son pequeños,
comparten las mismas evaluadoras y se pueden ejecutar en una sola sesión de unos 40 minutos
por participante.

**Fecha de redacción:** 23 de septiembre de 2026. **Estado:** sin ejecutar.

---

## Lo que los tres tienen en común

**Evaluadoras.** Las mismas Consultoras de Belleza Independientes de la evaluación ampliada,
más —donde se indique— un evaluador externo. Un mínimo de 5 evaluadoras por estudio; con
menos, los intervalos no dicen nada.

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

## Archivos

| Archivo | Qué lleva |
|---|---|
| `OE2_copys_material.csv` | Lo produce `run_copy_pareado.mjs`: imagen, sistema (postly/generico), tono, texto, y la clave de la asignación A/B |
| `OE2_estudio1_respuestas.csv` | Evaluadora, imagen, etiqueta, cuatro puntajes, preferencia, afirmaciones no verificables |
| `OE2_estudio2_respuestas.csv` | Evaluadora, conjunto, copy, tono asignado |
| `OE2_estudio3_respuestas.csv` | Evaluadora, conjunto, secuencia preferida |

Los tres se analizan con `run_oe2.mjs`, que corre sobre las plantillas vacías y dice qué
falta cargar.

## Cuánto mueve esto la nota

Cierra el único Objetivo Específico que hoy se declara no evaluado y da la primera evidencia
sobre alucinaciones. No toca la muestra de la hipótesis principal, de modo que por sí solo no
levanta el carácter piloto de la evaluación: es condición necesaria y no suficiente.
