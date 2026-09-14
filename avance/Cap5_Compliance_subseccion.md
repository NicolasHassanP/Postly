# 5.X Validación empírica del Módulo Centinela de Compliance

> Texto listo para pegar en el Capítulo 5. Ajustar la numeración de tablas y figuras
> (aquí referidas como Tabla X / Figura X) a la que corresponda en el documento final.

---

En correspondencia con la fase de Evaluación del marco DSRM (§3.2) y con la operacionalización de la variable *tasa de acierto del Módulo Centinela* (§3.5.4), se ejecutó el protocolo de validación definido en el Anexo E sobre el detector de contenido comercial efectivamente desplegado en producción. El objetivo fue cuantificar el desempeño del módulo mediante una matriz de confusión y las métricas de Recall, Precisión y F1.

**Método.** El Módulo Centinela opera sobre dos canales complementarios (Anexo B.4): la auditoría de precios en texto (HU7), implementada mediante un conjunto de seis expresiones regulares evaluadas en cascada sobre el pie de foto final, y la detección de precios incrustados en imagen (HU8), delegada a la capacidad de visión artificial del modelo multimodal. La validación cubrió ambos canales.

Se construyó un conjunto de prueba de 40 casos, balanceado en 20 casos infractores —con precio, oferta o promoción, que el sistema debe bloquear— y 20 casos limpios —contenido informativo que el sistema debe publicar—. El etiquetado de la clase real de cada caso se realizó de forma manual conforme a las Pautas Mary Kay (Anexo D), distinguiendo los mensajes comerciales de los informativos. Los casos de texto se sometieron a la función de detección efectivamente desplegada —el conjunto de expresiones regulares del Anexo B.4, ejecutado mediante un script de verificación reproducible— y los casos con precio incrustado en imagen se enviaron al bot en producción, ejerciendo la ruta completa de visión artificial (HU8).

Cada resultado se clasificó como verdadero positivo (VP: infractor correctamente bloqueado), falso negativo (FN: infractor publicado), verdadero negativo (VN: limpio correctamente publicado) o falso positivo (FP: limpio bloqueado). A partir de estas frecuencias se calcularon Recall = VP/(VP+FN), Precisión = VP/(VP+FP) y F1 = 2·(Precisión·Recall)/(Precisión+Recall).

Con el fin de caracterizar el desempeño de manera equilibrada, se aplicaron dos configuraciones del conjunto de prueba: una configuración **representativa**, cuya distribución refleja la forma habitual en que las consultoras redactan sus publicaciones (mayoría de casos directos y una minoría de casos límite), tomada como medida principal; y una configuración de **estrés**, deliberadamente cargada de casos límite, orientada a exponer las fronteras de decisión del detector. El detalle caso por caso de ambas configuraciones se presenta en el Anexo E.

**Resultados.** La Tabla X presenta la matriz de confusión de la configuración representativa (n = 40).

*Tabla X. Matriz de confusión del Módulo Centinela — configuración representativa (n = 40)*

|                        | Sistema bloqueó | Sistema publicó |
|------------------------|:---------------:|:---------------:|
| **Clase real: Infractor** | VP = 17         | FN = 3          |
| **Clase real: Limpio**    | FP = 3          | VN = 17         |

En esta configuración el módulo alcanzó un **Recall de 0,85**, una **Precisión de 0,85**, una especificidad de 0,85 y un **F1 de 0,85** (exactitud global del 85 %). Es decir, detectó y bloqueó 17 de los 20 intentos de publicar contenido comercial, y permitió correctamente 17 de las 20 publicaciones informativas.

Bajo la configuración de estrés (Tabla Y), el desempeño desciende de forma esperable —Recall 0,70; Precisión 0,64; F1 0,67—, dado que aproximadamente un tercio de los casos fue diseñado específicamente para tensionar el detector. Este descenso no debe interpretarse como el rendimiento operativo del sistema, sino como una caracterización de sus condiciones de falla.

*Tabla Y. Matriz de confusión del Módulo Centinela — configuración de estrés (n = 40)*

|                        | Sistema bloqueó | Sistema publicó |
|------------------------|:---------------:|:---------------:|
| **Clase real: Infractor** | VP = 14         | FN = 6          |
| **Clase real: Limpio**    | FP = 8          | VN = 12         |

**Análisis de errores.** Los errores presentan un patrón consistente entre ambas configuraciones y de naturaleza estrictamente léxica:

- *Falsos negativos (precios no detectados):* se concentran en precios expresados en palabras sin dígitos ("tres mil quinientos"), en referencias comerciales sin cifra explícita ("a mitad de precio", "te paso la lista de precios") y en descuentos sin el token esperado ("30 % menos"). En todos los casos el precio existe, pero no adopta ninguna de las formas que las expresiones regulares reconocen, las cuales exigen la contigüidad de un dígito con un símbolo o palabra monetaria.
- *Falsos positivos (bloqueos indebidos):* se originan en números no monetarios con formato de miles ("más de 20.000 clientas", "el año 2.025") y en términos comerciales usados en acepción no comercial ("este sérum *rebaja* las líneas de expresión"). El detector, al operar por coincidencia de patrones sin análisis del contexto, no distingue el sentido del término.
- *Canal de imagen (HU8):* los cuatro casos evaluados se resolvieron correctamente (dos VP y dos VN), incluido el caso límite de un envase con las especificaciones técnicas "SPF 50" y "50 ml", que la visión artificial no confundió con un precio. La detección visual, además, fundamentó cada bloqueo indicando el texto y la ubicación del precio detectado (Figuras X y X+1). No obstante, el reducido tamaño de muestra de este canal (n = 4) constituye una limitación que se retoma en la discusión.

Las Figuras X a X+3 ilustran el comportamiento del módulo en producción: el bloqueo fundamentado de dos imágenes con precio incrustado (Figuras X y X+1) y la generación exitosa de tres variantes de copy para dos imágenes limpias (Figuras X+2 y X+3), una de ellas correspondiente al caso límite de números técnicos.

**Interpretación.** La evidencia muestra un módulo funcional cuyo desempeño global es satisfactorio (F1 = 0,85 en condiciones representativas), pero cuya principal debilidad reside en el canal de texto. La detección léxica por expresiones regulares, si bien determinista y de bajo costo computacional, no captura la semántica del precio y produce tanto omisiones (precios en lenguaje natural) como sobre-bloqueos (números y términos ambiguos). El contraste con el canal de imagen es revelador: la detección basada en un modelo multimodal, al operar sobre el significado y no sobre la forma superficial, generaliza mejor. Este hallazgo, coherente con la tensión entre sensibilidad y especificidad que documenta el Anexo B.4 y con la noción de arbitrariedad algorítmica descrita por Gómez et al. (2024), señala una línea de mejora concreta: sustituir o complementar la capa de detección textual por un clasificador basado en procesamiento de lenguaje natural o en un modelo de lenguaje, de forma análoga a la estrategia que HU8 ya aplica con éxito sobre las imágenes (véase §6.2, Recomendaciones).
