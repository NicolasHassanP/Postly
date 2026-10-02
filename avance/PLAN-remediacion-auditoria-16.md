# Plan de remediación — auditoría interna 16 (tercera instancia simulada, 02-10-2026)

Devolución: `C:\dev\auditoria-postly-16\devolucion-3ra-instancia.md` — **8,2/10** (escritura 7,2),
«Aprobada con observaciones menores», 0 críticos, 1 alto, 5 medios, 10 bajos. Gate real: **≥ 9**.

## Verificación de los hallazgos (antes de tocar nada)

| # | Sev. | ¿Real? | Qué se comprobó |
|---|---|---|---|
| T-01 | Alto | **Real en el nombre, no en la lógica** | El IF «HU8: ¿Imagen limpia?» evalúa `tiene_precio == true` y manda *true* al bloqueo: el comportamiento es correcto, el nombre dice lo contrario. Igual en otros cuatro: «HU5: ¿Carrusel limpio?», «HU5: ¿Pub limpio?» (`blocked`), «Video: ¿frame limpio?», «Repost: ¿imagen limpia?» |
| T-02 | Medio | Real | B.1 declara la validación en E3 sin ids de ejecución |
| T-03 | Medio | Real | §3.5.3 (p485) atribuye al Anexo E «un mínimo de 3 consultoras con 3 publicaciones», que no está; el piloto se cita sin resultados |
| T-04 | Medio | Real | Tabla 13 HU2 «no verificado… sin flujo OAuth real» (y se recorrió en E3 el 01-10); A.2 (p1234) habla de «cuatro Sprints»; B.4 (p1267) «configuración centralizada» |
| T-05 | Medio | Real (interpretación) | §6.1.3 (p968) «según las Pautas basta» para el «escribime»; p. 5 de las Pautas no se discute; condición omitida de la p. 1 en el Anexo D |
| T-06 | Medio | Real | Notas de las Figs. 12–15 justifican el difuminado con la regla que prohíbe modificar |
| T-07 | Bajo | Real | Resumen (p214) «29 piezas reales, mensajes privados trasladados al feed» |
| T-08 | Bajo | Real | §1.6.0 (p294-295): 596 − 462 = 134 ≠ 85; «once… leyeron completos… nueve accesibles»; E.6 «unas setenta» vs cupo de 100 en 5 días |
| T-09 | Bajo | Real | Tabla 16: filas con rango de fecha/nodos |
| T-10 | Bajo | Real | Estudio 4 por par y no por participante; definición de reducción individual |
| T-11 | Bajo | Real | p987: «dos de ellos» → son cuatro por configuración |
| T-12 | Bajo | Real | Paréntesis abiertos (p459, p772, p774…) + ítem truncado del §3.4.2 (p456) |
| T-13 | Bajo | Real | Fig. 6 (y 5) con rótulos ~5 pt; «exportado en vectorial» pero embebido como imagen |
| T-14 | Bajo | Real | «Track A2» (p1350) y «protocolo…, §n» |
| T-15 | Bajo | Real | «cuenta de prueba» / «cuenta real» para la misma cuenta |
| T-16 | Bajo | A verificar en Crossref | Cimino et al. (2026) ya con volumen y páginas |

## Bloque A — sistema (decisión de Nico)

- **A-1 (T-01)** Renombrar los cinco IF a lo que evalúan (p. ej. «HU8: ¿Imagen con precio?», «HU5: ¿Carrusel
  con precio?», «HU5: ¿Pub bloqueado?», «Video: ¿frame con precio?», «Repost: ¿imagen con precio?»), sin
  tocar la lógica. Revisar que ninguna expresión `$('…')` los nombre. Desplegar a E3 → **etiqueta
  `defensa-v2`** + SHA256SUMS + fila nueva en la Tabla 16 + E.15. Reexportar el canvas (v8) y regenerar las
  Figs. 11 y 16.
- **A-2 (T-01, T-02)** Demostración en E3 con ids de ejecución: una imagen con precio (bloquea) y una limpia
  (genera copys). **Nico, por Telegram.** Se registran en B.1 junto con las Historias recorridas el 01-10.
- **A-3 (T-04.1)** Medir la notificación de HU2 (< 5 s) desde el historial de E3 de la re-vinculación del
  01-10, si la ejecución sigue en el historial; si no, una re-vinculación más.

## Bloque B — texto (Claude, por pasadas)

T-03 piloto (un párrafo en E.2 con fecha, entorno, n y resultado, o retirar las comparaciones) · T-04 ·
T-05 (transcribir los once cierres en E.1.2, cobertura como intervalo, p. 5, condición de la p. 1) · T-06 ·
T-07 · T-08 · T-09 · T-10 · T-11 · T-12 · T-13 (Fig. 6 apaisada; «reproducido aquí como imagen») · T-14 ·
T-15 · T-16 · la duda sobre Yao et al. (2025) · preguntas 2, 4 y 9 del §10 de la 2.ª instancia que
quedaron «en parte».

## Cierre

Pasada final de lectura de punta a punta (las costuras del recorte son la fuente de T-03/T-04), verificadores,
PDF, y una auditoría 17 en sesión limpia antes de subir la tercera corrección.
