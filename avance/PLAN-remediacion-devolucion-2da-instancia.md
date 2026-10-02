# Plan de remediación — Devolución del profesor, 2.ª instancia (29-09-2026, 8,0/10)

Fuente: `C:\Users\Nico\Downloads\Devolucion_Postly_Bontorno_Hassan_2da_instancia.pdf` (8 págs; copiar a
`avance/` al empezar). Auditó el PDF de 165 págs (commit 75654a5).

**Dictamen: «Aprobada con observaciones menores — apta para la defensa». 8,0/10** (antes 4,4); escritura 7,0.
Los 41 críticos/altos del 01-08: 38 resueltos, 3 con salvedad (C06→N-11, C08→N-10, A41→N-12), 0 pendientes.
Nuevos: 0 críticos, **3 altos**, 6 medios, 3 bajos. Recalculó toda la estadística: **0 inconsistencias**.

## Lo que el §9 de la devolución dice sobre los tiempos (leerlo antes de planificar)

- **Requisitos operativos, ANTES de la defensa (no alteran la nota):** (1) despliegue con callback OAuth
  vigente o plan de demostración aprobado (N-01); (2) versión del workflow congelada con hash + tabla de
  trazabilidad versión ↔ medición (N-02); (3) consentimientos escritos + ejemplar de las Pautas en el
  expediente (N-03, N-10).
- **Correcciones menores, «post-defensa, sin nueva instancia de evaluación»:** N-05, N-06, N-07, N-08,
  N-09, N-11, N-12.

> **D-0 RESUELTA (01-10): el gate ≥ 9 sigue vigente**, aunque el texto diga «apta para la defensa» (es la
> plantilla de su prompt). Prueba: en la planilla de devoluciones solo van en verde «Aprobado — Presentar
> video» los grupos con 9,3 (Morgui-Rivas, 8,1 → 9,3) y 9,1 (Pujada-Vernier) en la **tercera instancia**;
> el de 8,5 no está aprobado y dos grupos quedaron 8,2 → 8,2. **Consecuencia: TODO lo del §9, incluido lo
> «post-defensa», se hace ahora, antes de subir la tercera corrección.**
>
> Camino completo: **3.ª devolución ≥ 9 → video mostrando el prototipo → si aprueban el video, defensa.**
> No hay fecha fijada.
>
> De dónde sale el +1,0: los componentes están entre 7,8 y 8,5 y el índice de escritura en 7,0; el propio
> profesor dice que la escritura **no sube más por N-05 y N-06**. Condensar y limpiar el cuerpo es la
> palanca que toca todos los componentes a la vez; Desarrollo (7,8) sube con N-01 y N-08.

## Estado al 01-10 (noche)

- **Hecho en el sistema (VPS E3):** 1.1 OAuth (ejec. 24-25), 2.2 N-08 (ejec. 19/23), 2.3 N-09 (ejec. 27),
  y dos bugs que aparecieron probando: texto sin contexto pisaba la última fila; lecturas de Config
  repetidas por cada post (429 de Sheets). Workflow vigente: commit c740bad, 213 nodos, SHA-256 24075a38fa52.
- **Hecho en el .docx (pasadas 180-182):** 1.2 (B.1, §3.5.5, §5.1.1, §8.1 OE1, §8.2, Resumen), 1.3 (Anexo E.15
  + Tabla 16), 2.1 (OE3 «con alcance acotado»), 2.3 texto (§3.7.1, §8.2, Fig. 6), N-08 texto (§3.7.1, §7.7,
  Fig. 5 redibujada), 2.8 (binomiales bilaterales, carruseles de dos imágenes). Además: el B.9 y la Fig. 6
  decían que el video se sube después de la detección; se sube antes. Verificadores en verde.
- **Falta:** 1.4 tag + hash (al final), 1.5/1.6 (terceros), 2.4+2.5 condensar y rastros, 2.6, 2.7, 2.9,
  Bloque 3, re-exportar el PDF.

## Bloque 1 — Requisitos previos a la defensa (obligatorios)

| # | Hallazgo | Estado | Acción | Quién |
|---|---|---|---|---|
| 1.1 | **N-01** (alto) despliegue | **Casi cerrado el 01-10** | VPS nuevo de DonWeb (E3) con TLS y redirect de Meta y Google al dominio nuevo; 6 workflows desplegados y publicación e2e validada (ejec. 6-10). **Falta: recorrer el OAuth completo en E3 con la cuenta de prueba que ya existe vía «Re-vincular» (HU3)**, anotando los números de ejecución. No hace falta una cuenta nueva: Meta marca como spam las cuentas recién creadas (ya pasó), y la re-vinculación ejercita el mismo callback que la devolución dice que no funciona. | Nico (Telegram) + Claude (verifica ejecuciones) |
| 1.2 | N-01, texto | Pendiente | Actualizar §3.5.5, §5.1.1, §8.1 (OE1) y B.1: E1 dado de baja → **E3 vigente desde el 01-10**; el callback ya no apunta al dominio muerto. Matizar el OE-1: las 8 consultoras publicaron sobre una cuenta ya vinculada (la devolución lo pide). | Claude |
| 1.3 | **N-02** (alto) trazabilidad | Pendiente | **Tabla «versión del workflow (commit, fecha, n.º de nodos) × medición × resultado»** en el Anexo B (o al cierre del §6.1). Filas mínimas: detector previo al 19-09 (Tablas 3-5), unificación del canal visual + inversión del CTA (19-09), guarda de duración (19-09), candado de grupo (28-09), y **el fix de texto sin contexto del 01-10 (207 → 210 nodos)**, que también es posterior a todas las mediciones. Sacar los datos de `git log -- workflows/`. | Claude |
| 1.4 | N-02, congelar | Pendiente, **va AL FINAL del Bloque 1** | Tag `defensa-v1` en git + SHA-256 del JSON del principal y de los 5 restantes, citado en la tesis. Cualquier cambio al sistema (N-08, N-09) va ANTES del tag, o queda para después de la defensa. | Claude |
| 1.5 | **N-03** (alto) ética | Pendiente | (a) **Consentimiento escrito retroactivo** del evaluador externo y de las autoras del corpus: Claude redacta el modelo, Nico/Jere lo hacen firmar. (b) **Consultar con el director** si las Figs. 12-15 pueden conservar arte de la marca; si no, pixelar/reemplazar. (c) Verificar si la pieza con precio de E.11 sigue publicada en la cuenta real y, si sigue, **borrarla** (y decirlo en §3.7.6). | Nico/Jere (firmas, director, cuenta) · Claude (modelo, texto) |
| 1.6 | **N-10** (bajo) fuente | Pendiente | Adjuntar el ejemplar de las Pautas al expediente de defensa, con fecha/versión si el ejemplar la tiene. | Nico/Jere |

## Bloque 2 — Correcciones de la versión final

| # | Hallazgo | Acción | Notas |
|---|---|---|---|
| 2.1 | **N-07** (medio) OE-3 | §8.1: «cumplido» → **«cumplido con alcance acotado»** (cobertura 12/25 sobre la regla completa; más estricto que la norma en Facebook; cuenta de IG que la fuente no contempla). Coherente con «afirmativa en parte». Buscar la misma afirmación en Resumen, §7 y Tabla 15. | Texto, corto |
| 2.2 | **N-08** (medio) multitenencia | **D-1.** (a) Corregir: columna `TelegramUserID` en la hoja Config y que HU9 filtre por usuaria (cambio al sistema, hacerlo ANTES del tag 1.4 y probarlo con dos chats). (b) Declarar el sistema monousuario en §1.5 y en la respuesta a la pregunta 8. | Recomendado (a): es la pregunta 8 del §10 y con el VPS arriba se prueba en una tarde |
| 2.3 | **N-09** (medio) privacidad | En E3 el historial **ya tiene retención** (`EXECUTIONS_DATA_MAX_AGE=336` h = 14 días, configurado el 01-10): decirlo en §3.7.1 y §8.2(6). Falta el borrado en Cloudinary de las imágenes bloqueadas: script de limpieza o `destroy` en la rama de bloqueo. | Va antes del tag si toca el workflow |
| 2.4 | **N-05** (medio) extensión | **D-2.** Condensar el cuerpo de ~37.500 a **≤ 25.000 palabras** (−1/3): salvedades de segundo orden y detalle metodológico a los anexos; reducir las 335 remisiones «§» y las 246 a anexos. Por capítulo, con `medir_escritura.py` contando palabras y remisiones antes/después. | El trabajo más largo; mueve el índice de escritura (7,0) |
| 2.5 | **N-06** (medio) rastros | En la misma pasada que 2.4: quitar «versión del 1 de agosto de 2026» (p. 47), «Lectura_A26.md» (p. 17), «a diferencia del piloto», «el §8.1 se actualiza…» (p. 165) y todo código de hallazgo; los **88 nombres de archivo** pasan a una tabla única del Anexo E.4. | Grep exhaustivo primero |
| 2.6 | **N-04** (medio) independencia | Sin datos nuevos (restricción del 29-09: no más sesiones con consultoras). Verificar que el texto no presente el κ = 1,00 ni el F1 = 1,00 del panel A como validación independiente; tabla de procedencia de la evidencia en §3.5.5 (ya planificada como A3 del plan 15). | Texto |
| 2.7 | **N-11** (bajo) figuras | Figs. 1 y 4 a página completa/apaisada (rótulos ≥ 8 pt impresos); Fig. 11 recortada a una rama legible del canvas. | Regenerar imágenes |
| 2.8 | **N-12** (bajo) APA | Rotular «binomial exacta bilateral» (6/7 p = 0,125; 6/8 p = 0,289); declarar en el cuerpo que los carruseles de los Estudios 3 y 4 son de dos imágenes. | Texto, corto |
| 2.9 | N-26 del plan 15 (no lo vio el profesor, pero es real) | Wilcoxon: lo que el lector recalcula desde E.2 no coincide (0,039/0,156 vs 0,027/0,191). Transcribir tiempos con decimales o reportar el recalculable. | El profesor recalcula: que no lo encuentre en la defensa |

## Bloque 3 — Preparación de la defensa

1. **Respuestas escritas a las 9 preguntas del §10**, con la cifra y la página de la tesis que sostiene cada una
   (`avance/DEFENSA-respuestas.md`). Las más delicadas: 1 (qué versión se demuestra → tag de 1.4), 2 (OAuth →
   resultado de 1.1), 3 (CTA en junio-julio: la respuesta honesta es que aumentaba la exposición), 7
   (fail-open del canal visual sin respuesta cruda), 8 (→ 2.2), 9 (E.11 → 1.5).
2. **Guion de demostración en vivo sobre E3**: vinculación → publicación con imagen → bloqueo por precio →
   carrusel → programación → Mi Agenda con métricas. Con plan B grabado en video por si falla la red.
3. Activar el Programador (HU10) y el Feedback Loop (HU14) en E3 antes de la defensa, revisando antes que
   la hoja no tenga filas pendientes con fecha pasada.

## Bloque 4 — Cierre (igual que siempre)

Cada corrección en `avance/_pasadaNNN.py` (van por la **180**) con `.bak-pre-pasadaNNN`; los cuatro
verificadores + `medir_escritura.py`; re-exportar el PDF con Word COM; `git add` explícito; tag 1.4 al final.

## Bloque 5 — Video del prototipo (después de la 3.ª devolución ≥ 9)

Grabar sobre E3, con la versión del tag `defensa-v1`, siguiendo el guion del Bloque 3.2. Prepararlo en
paralelo para no perder días entre la aprobación y el envío.

## Orden propuesto

1. **Sistema primero**, porque después se congela: **1.1** (re-vinculación OAuth en E3) → **2.2** (N-08) → **2.3**.
2. Texto de requisitos y medios cortos: **1.2, 1.3, 2.1, 2.6, 2.8, 2.9**.
3. **2.4 + 2.5** (condensar a ≤ 25.000 y retirar rastros): ahora es OBLIGATORIO, es lo que más mueve la nota.
   Una pasada por capítulo, midiendo palabras y remisiones antes/después.
4. **2.7** figuras.
5. **1.4** tag y hash, con el PDF final.
6. Auditoría interna con el prompt del profesor (no el nuestro, que es más duro y predice mal) antes de subir.
7. Subir la 3.ª corrección.
- **1.5 y 1.6** corren en paralelo desde hoy (dependen de terceros). Bloque 3 en paralelo desde el punto 2.
