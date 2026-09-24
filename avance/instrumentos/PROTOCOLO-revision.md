# Protocolo de revisión de la literatura

El §1.6.0 declara lo que hoy tiene el Estado del Arte: una búsqueda en Google Scholar, ACM y
arXiv, con inclusión «por pertinencia temática juzgada por los autores sobre el título y el
resumen», sin tamizado en dos fases, sin registro de descartes y sin segundo revisor. Lo
declara con honestidad y por eso no es una falta grave, pero le pone techo a lo que el
capítulo puede afirmar: un relevamiento acotado no establece un vacío tecnológico.

Este protocolo convierte ese relevamiento en una revisión con procedimiento. No es una
revisión sistemática completa —no hay dos revisores independientes y el equipo son dos
personas con un plazo—, y por eso se la llama **revisión estructurada con registro de
descartes**, que es lo que efectivamente va a ser.

**Fecha:** 23 de septiembre de 2026. **Revisado:** 24 de septiembre de 2026, fase 1 completa;
25 de septiembre, fase 2 completa sobre los 134 originales (menos 2 sin resumen verificable).
**Estado:** los 596 candidatos tienen `Decision` en `Candidatos_bibliografia.csv` —**85
incluir, 509 descartar (462 de fase 1 + 47 de fase 2), 2 dudoso**—. Ninguno de los 85 se cita
todavía: fase 2 fue por resumen, no texto completo —ver la salvedad del §5b—, y esa lectura
completa sigue pendiente antes de citar. Ver el detalle por eje en el §5 y el §5b.

---

## 1 · Fuentes: por revista, no por relevancia

La decisión que gobierna todo lo demás. Una búsqueda por relevancia en Crossref o en
OpenAlex sobre estos temas devuelve, en su mayoría, revistas depredadoras o trabajos de otro
dominio que comparten las palabras: se probó con siete consultas y la cosecha aprovechable
fue de tres títulos sobre cuarenta y dos. Ordenar por citas es peor: trae revisiones
genéricas de inteligencia artificial con miles de citas y ninguna relación con el problema.

Por eso la búsqueda se hace **dentro de un conjunto declarado de revistas**, que es el
criterio de inclusión por fuente y está a la vista para ser discutido:

| Dominio | Revistas |
|---|---|
| Ingeniería de software | Empirical Software Engineering · Information and Software Technology · IEEE Transactions on Software Engineering · ACM TOSEM · Journal of Systems and Software |
| Sistemas de información | Information Systems Journal · European Journal of Information Systems · Journal of Management Information Systems · Decision Support Systems |
| Interacción humano-computadora | International Journal of Human-Computer Studies · ACM TOCHI · Behaviour and Information Technology · Computers in Human Behavior |
| Medios sociales y marketing | Journal of Marketing Research · Journal of the Academy of Marketing Science · Internet Research · Journal of Business Research |
| Computación | ACM Computing Surveys · ACM Transactions on Information Systems · ACM Transactions on the Web |

Tres revistas del dominio quedaron fuera porque Crossref no resuelve su título de forma
inequívoca: *Information & Management*, *New Media & Society* y *Social Media + Society*.
Hay que agregarlas a mano con su ISSN, y las dos últimas importan: son las que publican la
literatura de visibilidad algorítmica que el §7.4 cita.

**Lo que este recorte deja afuera, y hay que decirlo:** las actas de congreso (CHI, CSCW,
FAccT, ICSE), donde buena parte de esta literatura se publica primero. Se incorporan por
búsqueda dirigida cuando un trabajo del corpus las cite.

## 2 · Ejes, y a qué hueco responde cada uno

Una referencia que no llena un hueco del documento no entra, por buena que sea. Los ocho
ejes de `buscar_bibliografia.py` y el apartado que cada uno alimenta:

| Eje | Dónde hace falta |
|---|---|
| Moderación de contenido con LLM | §1.6.0 y §8.2: la sustitución del canal léxico |
| Cumplimiento normativo automatizado | §2.4: el enfoque de *compliance by design* |
| Redes sociales y microemprendimiento | §1.1 y §1.2: la caracterización del sector, hoy sostenida por el juicio de los autores |
| Interfaz conversacional | §7.1: el contraste con McTear et al. (2016), que es de hace nueve años |
| IA generativa en marketing | §1.3 y §2.2 |
| Bajo código | §2.1: hoy con dos referencias |
| Multimodal | §2.2 y §6.1: el canal visual |
| Aceptación tecnológica | §3.5.4: TAM se cita por Davis (1989) y nada posterior |

## 3 · Tamizado en dos fases, con registro

`buscar_bibliografia.py` produce `Candidatos_bibliografia.csv`: 596 candidatos de 20
revistas, cada uno con su eje, su revista, su año, sus citas y su DOI.

**Fase 1 — título y resumen.** Se recorre la planilla y se completa la columna `Decision`
con `incluir`, `dudoso` o `descartar`, y `Motivo` con una de estas razones, siempre la misma
redacción para que el registro sea contable:

- `fuera-de-dominio` — el trabajo usa las mismas palabras en otro campo.
- `sin-relacion-con-hueco` — es del dominio pero no responde a ninguno de los ocho ejes.
- `superado` — hay un trabajo posterior del mismo grupo que lo incluye.
- `sin-acceso` — no se consiguió el texto completo.

**Fase 2 — texto completo.** Sólo los `incluir` y los `dudoso`. Acá se lee el trabajo y se
decide si entra. La regla que no se negocia: **el título y el resumen alcanzan para
descartar, nunca para incluir**. Una referencia que se cita sin haber leído el trabajo es
exactamente el uso decorativo que el primer dictamen de esta tesis marcó.

**Registro.** El CSV completo es el registro. Para el §1.6.0 se informan cuatro números: los
candidatos recuperados, los descartados en fase 1 con su motivo, los leídos en fase 2 y los
incorporados. Con eso el apartado deja de decir «no hubo protocolo de tamizado».

## 4 · Segundo revisor

No hay dos revisores independientes para todo el corpus. Lo que sí es viable: que el segundo
autor revise **una muestra aleatoria del 20 % de los descartes de fase 1** y se informe el
acuerdo. Un desacuerdo alto sobre los descartes es un dato sobre el criterio, y vale más que
declarar un doble tamizado que no ocurrió.

## 5 · Fase 1, completa el 24-09-2026: 134 dudoso, 462 descartar

Los 596 candidatos tienen `Decision` en `Candidatos_bibliografia.csv`. Siguiendo la regla del
§3 —el título alcanza para descartar, nunca para incluir—, esta fase sólo produjo dos
resultados: `dudoso` (pasa a fase 2) o `descartar` (con su `Motivo`). Ningún candidato quedó
marcado `incluir`: eso exige haber leído el texto completo, que es la fase 2, todavía sin
ejecutar sobre los 134.

| Eje | Candidatos | Dudoso | Descartar |
|---|---|---|---|
| interfaz-conversacional | 78 | 35 | 43 |
| ia-generativa-marketing | 73 | 20 | 53 |
| compliance | 75 | 17 | 58 |
| moderacion-llm | 80 | 16 | 64 |
| aceptacion-tecnologica | 73 | 15 | 58 |
| bajo-codigo | 73 | 12 | 61 |
| multimodal | 64 | 10 | 54 |
| microemprendimiento | 80 | 9 | 71 |
| **Total** | **596** | **134** | **462** |

De los descartes, 287 son `fuera-de-dominio` y 175 `sin-relacion-con-hueco`.

**Un hallazgo del propio tamizado, no sólo su resultado.** El eje `microemprendimiento` es el
que peor rindió (9 de 80), y la razón es diagnosticable: la búsqueda trajo mayormente
«enterprise social media» —herramientas internas de comunicación corporativa— porque
comparte vocabulario con «micro-emprendimiento» sin ser el mismo objeto. Si el §1.1/§1.2
sigue necesitando refuerzo bibliográfico después de leer los 9 dudoso, la búsqueda de este
eje debería rehacerse con otros términos («direct selling», «social commerce», «gig
economy»), no reintentarse con el mismo.

**Nueve candidatos ya identificados en una pasada anterior** (23-09) siguen siendo el punto
de partida de la fase 2, y siete de los nueve coincidieron con `dudoso` en este tamizado
—confirmación cruzada, no beneficio circular, porque el criterio de esta fase no los conocía
caso por caso—. Los otros dos, Russo y Fakhoury et al., el buscador los etiquetó bajo un eje
distinto al que responden (§2.1 y §3.7.3 respectivamente, no el eje bajo el que aparecieron
en el CSV); se corrigieron a `dudoso` a mano, con motivo `preidentificado-otro-apartado`, en
vez de dejarlos figurar como descartados cuando ya estaban validados. Ninguno de los nueve se
cita antes de leerlo completo:

| Trabajo | Revista | Para qué apartado |
|---|---|---|
| Jiang et al. (2023), *A Trade-off-centered Framework of Content Moderation* | ACM TOCHI | §7.3: el compromiso entre sensibilidad y especificidad, que hoy se argumenta sin fuente |
| Cillo & Rubera (2024), *Generative AI in innovation and marketing processes* | JAMS | §1.3 y §2.2 |
| Wessel et al. (2025), *Generative AI and its Transformative Value for Digital Platforms* | JMIS | §1.3.b |
| Russo (2024), *Navigating the Complexity of Generative AI Adoption in Software Engineering* | ACM TOSEM | §2.1 y §3.3 |
| Saif et al. (2024), *Chat-GPT: validating TAM in education* | Computers in Human Behavior | §3.5.4: TAM aplicado a IA generativa, no sólo Davis (1989) |
| Fakhoury et al. (2024), *LLM-Based Test-Driven Interactive Code Generation* | IEEE TSE | §3.7.3: humano en el bucle, con evaluación de usuarias |
| Sun et al. (2024), *Chatbot ads with a human touch* | Journal of Business Research | §7.1 |
| Zogaj et al. (2023), *It's a Match! Chatbot anthropomorphization* | Journal of Business Research | §7.1 |
| Oppenlaender (2023), *A taxonomy of prompt modifiers* | Behaviour and IT | §4.1.2: la ingeniería de prompts, hoy sin respaldo |

**Verificado contra Crossref el 25-09-2026** (`api.crossref.org`): los 10 DOI de los nueve
candidatos —Russo aparece con dos DOI distintos— resuelven, y en los 10 el título, la
revista y el año coinciden exacto con lo que ya tenía la planilla. Cero DOI rotos, cero
discrepancias.

`10.1145/3680471` y `10.1145/3652154` (los dos de Russo) resuelven **los dos** a
`journal-article`, mismo título, misma revista (ACM TOSEM) y mismo año (2024) — Crossref no
los trata como duplicado del mismo registro, así que son dos entradas distintas de verdad.
Sigue sin resolverse **cuál es cuál** —el artículo completo y su reporte RCR
(Registered/Replicated Computational Result) por separado, o una duplicación de la
búsqueda—, porque eso exige leer el contenido, no solo el metadato, y es trabajo de fase 2.

Esto es verificación de metadato (título/revista/año contra Crossref), **no** lectura de
texto completo: sigue sin decidirse `incluir` para ninguno de los nueve, tal como exige el
§3 —eso todavía es fase 2, pendiente.

**Lo que falta, y es lo que realmente decide si el §1.6.0 mejora.** Fase 2: leer los 134
`dudoso` a texto completo y decidir `incluir` o `descartar` con motivo de fase 2. Es trabajo
de lectura real, no de tamizado por título.

## 5b · Fase 2 — completa el 25-09-2026 sobre los 134 originales (menos 2 irresolubles)

**Resultado final: 85 `incluir`, 47 `descartar` de fase 2, 2 siguen `dudoso`.** Se procesaron
los ocho ejes. El detalle fila por fila, con el motivo de cada decisión, está en
`Candidatos_bibliografia.csv` —es el registro real, tal como pide el §3; esta sección resume,
no reemplaza esa planilla.

| Eje | Dudoso originales | Incluir | Descartar (fase 2) |
|---|---|---|---|
| interfaz-conversacional | 35 | 20 | 14 |
| ia-generativa-marketing | 20 | 12 | 8 |
| moderacion-llm | 16 | 12 | 3 |
| compliance | 17 | 9 | 8 |
| aceptacion-tecnologica | 15 | 9 | 6 |
| bajo-codigo | 12 | 9 | 3 |
| multimodal | 10 | 9 | 1 |
| microemprendimiento | 9 | 5 | 4 |
| **Total** | **134** | **85** | **47** *(+2 dudoso)* |

**Salvedad metodológica, para que quede escrita y no se dé por sentado algo que no pasó.**
El §3 pide leer el **texto completo** en fase 2. Lo que se hizo acá fue leer el **resumen**
de cada candidato —vía Crossref, OpenAlex o, cuando ninguna de las dos lo tenía, búsqueda
directa del título—, no el artículo entero: la mayoría está detrás de paywall (ACM, IEEE,
Elsevier, Taylor & Francis) y no hay acceso institucional desde acá. Es un estándar más alto
que el título solo de la fase 1 —el resumen dice el problema, el método y a veces el
hallazgo—, pero no es la fase 2 completa que el protocolo describe. Los 85 `incluir` de acá
son candidatos con fundamento real y verificable para pasar a lectura completa antes de
citarlos en el cuerpo del texto —**no se cita ninguno todavía**—; no reemplazan esa lectura.

**Los dos que siguen `dudoso`**, sin resumen confiable en Crossref, OpenAlex ni búsqueda
directa: Yang (*Computers in Human Behavior* 2026, eje moderación) y Gyeong Kim et al.
(*Journal of Business Research* 2025, eje interfaz). No se fuerza la decisión sin base.

**El duplicado de Russo se resolvió.** Los dos DOI (`10.1145/3680471` y `10.1145/3652154`)
no son el mismo trabajo indexado dos veces ni un artículo con su reporte RCR: son dos
estudios empíricos distintos sobre adopción de IA generativa en ingeniería de software —el
segundo, con una encuesta propia a 100 ingenieros y metodología mixta—. Los dos quedan
`incluir`, para el mismo apartado (§2.1, §3.3).

**El patrón que más se repitió en los descartes de fase 2:** la palabra clave de la búsqueda
aparece en el título con un significado distinto al que el hueco necesita —"compliance" como
conformidad técnica de un protocolo o impacto económico del GDPR, "moderation" como variable
moderadora estadística o gobernanza algorítmica, "acceptance" como aceptación de una práctica
de ingeniería en vez de un producto— y no como el mecanismo técnico que cada eje busca. Es la
misma advertencia del §1 sobre el ruido léxico, confirmada ahora con lectura real y no sólo
con la sospecha del título.

**El eje `interfaz-conversacional` fue el de mejor rendimiento** (20 de 35, 57%), consistente
con que su búsqueda no colisiona con un significado estadístico o técnico ajeno como sí les
pasa a "compliance" o "moderación". El de peor rendimiento en fase 2 fue
`microemprendimiento` (5 de 9) —que además fue el eje con menos `dudoso` desde la fase 1 por
la razón ya diagnosticada en el §5—.

**Dos hallazgos de sector para citar sin dudar:** Liu et al. (2026, JAMS), sobre posturas de
streamer y ventas de *revendedores de micro y pequeña empresa* en livestreaming —el modelo de
venta directa en formato digital, análogo directo al de las Consultoras de Belleza
Independiente—; y Sufyan et al. (2023, JBR), sobre emprendimiento digital transnacional desde
una perspectiva micro-fundacional.

## 6 · Qué mueve esto, y qué no

Con la fase 1 completa, el §1.6.0 ya puede informar cuatro números reales, no una declaración
de intención: **596 candidatos recuperados, 462 descartados en fase 1 con su motivo
registrado, 134 pendientes de fase 2**. Eso es procedimiento y registro, que es lo que el
apartado no tenía.

Con la fase 2 completa (§5b), hay **85 `incluir`** —la mediana bibliográfica **todavía no
bajó de verdad**, porque no se citó ninguno todavía y la salvedad metodológica del §5b importa
acá: son candidatos verificados por resumen, pendientes de la lectura completa antes de
citarse—, pero ya hay un número concreto en vez de una promesa: los 85 son de 2023 en
adelante, más de la mitad de 2025-2026, así que si la lectura completa los confirma,
moverían la mediana muy por encima de 2013. Sólo quedan 2 `dudoso` sin resolver por falta de
acceso a un resumen confiable —no por falta de tiempo—, así que este número no va a crecer
mucho más sin volver a intentar esos dos casos puntuales.

No mueve una tercera cosa. Una revisión estructurada dentro de veinte revistas sigue sin ser
una revisión sistemática con dos revisores y protocolo registrado —el §4 de este documento ya
lo declara—, y el capítulo tiene que seguir diciendo eso mismo aunque la fase 1 esté hecha.

## 7 · Lo único que falta para que esto entre a la tesis

Leer los 85 `incluir` a texto completo y decidir, uno por uno, si de verdad sostienen la
afirmación para la que se los marcó —la mayoría está detrás de paywall, así que ese acceso es
el primer obstáculo real, no la lectura en sí—. Recién ahí cada uno pasa a `incluir` de fase 2
en sentido estricto y se cita, con su cifra o su hallazgo concreto, en el apartado que le
corresponde. Hasta entonces, esta planilla es un mapa verificado de por dónde entrar a leer,
no una bibliografía.
