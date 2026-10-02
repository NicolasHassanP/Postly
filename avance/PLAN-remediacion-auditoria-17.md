# Plan de remediación — auditoría interna 17 (tercera instancia simulada, 02-10-2026)

Devolución: `C:\Users\Nico\Downloads\devolucion-3ra-instancia.md` — **8,2/10** (escritura 7,3), «Aprobada con
observaciones menores», 0 críticos, 0 altos, 6 medios, 9 bajos. Gate real: **≥ 9**.
Documento auditado: PDF de 157 págs. (`Tesis Postly Bontorno Hassan-1 v2`), versión `defensa-v2` (2455c1f).

## Verificación contra el texto (02-10)

| # | Sev. | ¿Real? | Dónde está en el texto |
|---|---|---|---|
| T-01 | Medio | **Real** (salió de la pasada 199) | §6 intro «se midió sobre E2»; §3.5.5 «corrieron sobre E2»; B.1 «Sobre E3 no se repitió ninguna medición»; nota Tabla 9 «provienen del historial de E2»; Tabla 16 fila c740bad; E.15 «la última medición, del 27 de septiembre» |
| T-02 | Medio | Real | Tabla 15 fila OE3: «1,00 … etiquetados por conocidos» (el 1,00 es el panel A, re-etiquetación de los autores) |
| T-03 | Medio | Real | §6.1.6: 81,2 % «con la adaptación incluida» (los 16 carruseles no se adaptan, §4.4.2); nota Fig. 3 |
| T-04 | Medio | Real | Anexo D: «aún más explícita en su página 1» cita una regla de Facebook; la autorización de la marca es de pp. 3 y 6 y es condicional |
| T-05 | Medio | Real | §8.1 OE-3: «no asocian a ninguna consecuencia contractual (§3.7.4)» |
| T-06 | Medio | Real | §3.6.2: «su ventana de contexto admite hasta 10 imágenes (§2.2)»; el 10 es de Telegram/Instagram |
| T-07 | Bajo | Real, **no se toca** | Figs. 2, 3, 5 con rótulos ≈ 4 pt; Fig. 7 con seis capturas. Nico ya decidió ignorar la Fig. 5 en la ronda 16; ver decisión D-1 |
| T-08..T-15 | Bajo | A verificar uno por uno al aplicar | ver Bloque B |

## Decisiones de Nico (02-10)

- **D-1:** de acuerdo — Figs. 2 y 3 apaisadas; Fig. 5 y Fig. 7 quedan.
- **D-2:** recalcular el 81,2 % imputando la adaptación solo en los 16 pares de imagen única.
- **D-3:** las imágenes de las Figs. 8–10 son **fotos propias de las consultoras** → declararlo en las notas, sin difuminar.
- **D-4 (T-08):** lo de C7 (publicación duplicada) ocurrió en una primera sesión que se cortó por **falta de cuota de Gemini**;
  al día siguiente se repitió sin errores, y el tiempo analizado es el de la repetición. El comentario se conservó
  porque motivó una mejora del prototipo. **El texto se equivoca con C8**: no tuvo intento fallido; sin mensaje de
  éxito fueron C2 y C6, y C6 además tuvo `Error: Problem in node 'HU5: Crear hijo' — Bad request - please check
  your parameters` en un carrusel. Hay un solo intento fallido descontado (C6), no dos.
  Pendiente de confirmar con la planilla: que el tiempo de C8 no tenga ningún descuento aplicado.

## Bloque A — decisiones de Nico (ya resueltas arriba)

- **D-1 (T-07).** Figs. 2, 3 y 5 apaisadas (como 1, 4 y 6) y Fig. 7 en dos. Cuesta regenerar figuras y
  agrega páginas. Recomendación: Figs. 2 y 3 sí (son de arquitectura y se defienden); Fig. 5 y Fig. 7, no.
- **D-2 (T-03).** Recomputar el total con la adaptación imputada solo en los 16 pares de imagen única, o
  declarar que en el carrusel se omite. Recomendación: **recomputar**, porque el dato crudo está en E.2.
- **D-3 (T-15).** Origen de las imágenes de las Figs. 8–10: Nico dice si son arte oficial (difuminar) o
  fotos propias de las consultoras (declararlo en la nota).
- **D-4 (T-08).** Cómo se cronometró la publicación duplicada de C7 y si C8 también perdió una ventana
  (Nico lo sabe de la sesión; no está en los datos).

Operativos (no son del documento): consentimientos al expediente de defensa; OAuth con una cuenta ajena al
equipo el día anterior; grabación de la ejecución 25 como plan B; `defensa-v2` + `SHA256SUMS` a mano.

## Bloque B — texto (Claude, por pasadas desde la 204)

Orden: primero lo que contradice la propia evidencia, después lo que excede la fuente, al final forma.

1. **Pasada 204 — T-01.** Reescribir las seis frases: la notificación de HU2 es la única cifra tomada en E3
   (ejec. 25, n = 1, cuenta del equipo). Decisión: **sí es medición del Cap. 6** (el §6.1.5 y la Tabla 13 ya
   la cuentan), así que se corrigen §6, §3.5.5, B.1, nota Tabla 9, Tabla 16 y E.15.
2. **Pasada 205 — T-02, T-05, T-06, T-10.** Celda OE3 de la Tabla 15 con panel A y B; «no fija una sanción»
   en el §8.1; límite de 10 imágenes atribuido al canal; Resumen en singular.
3. **Pasada 206 — T-04.** Anexo D: la cita de la p. 1 es la política de Facebook; la autorización de la
   marca está en pp. 3 y 6 con su condición; la decisión de bloquear es una resolución conservadora de una
   ambigüedad de la fuente. Propagar a §8.1 y §8.2.3. Releer las pp. 1, 3 y 6 de las Pautas antes de escribir.
4. **Pasada 207 — T-03 (según D-2)**, con script de recómputo sobre los 32 pares de E.2.
5. **Pasada 208 — T-08, T-09, T-11, T-12, T-13, T-14, T-15** (según D-3 y D-4).
6. T-07 solo si D-1 lo manda.

## Cierre

Pasada de lectura de punta a punta (las correcciones de último momento fueron la fuente de T-01), `verificar_documento.py`,
PDF, y la auditoría 18 en sesión limpia. Duda (a), (b), (c) del dictamen: confirmar con Nico si el
consentimiento cubre al aportante de los videos del E.9; leer el resumen de Abendroth (2026); revisar el
artículo 223 de Das et al. (2026) en la fuente.
