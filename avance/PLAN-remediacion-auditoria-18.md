# Plan de remediación — auditoría interna 18 (cuarta instancia simulada, 06-10-2026)

Devolución: `C:\dev\auditoria-postly-18\devolucion-4ta-instancia.md`. **8,5/10** (media exacta 8,458), escritura 7,5.
0 críticos, 0 altos, 3 medios (U-01 a U-03), 9 bajos (U-04 a U-12). Documento auditado: PDF de 158 págs. (01a2931).

## Verificación contra el documento (06-10)

| # | Sev. | ¿Real? | Diagnóstico |
|---|---|---|---|
| U-12 | Bajo, pero el más visible | **Real, lo causamos nosotros** | 30 págs. de prosa apaisadas (pp. 24–53). La condensación (pasada 231) fusionó el párrafo «El MVP debía permitir contrastar…» (p693 del bak-pre-231), que llevaba el `sectPr` vertical que cerraba la sección. Hasta b39927c había 4 páginas apaisadas, y desde 25f4adc hay 33 |
| U-07 | Bajo | **Real, lo causamos nosotros** | Las pasadas 225 y 230 cambiaron el `a:ext` con `uri` (extLst del blip) en lugar del `a:xfrm/a:ext`, que quedó con las proporciones viejas. Por eso Word deforma las cuatro capturas |
| U-01 | Medio | A aclarar con Nico | C.9: «el 1 de octubre se subió a mano una imagen con precio y se intentó republicarla desde Mi Agenda». ¿Se publicó en IG? |
| U-02 | Medio | Real | Resumen: «independientes». La tercera evaluadora es conocida de los autores y trabajó en la PC de Nico |
| U-03 | Medio | Real | Repetición de 29 casos el 4 de octubre contra el «cupo de 20/día» que se declara en cinco lugares; el recuento del E.6 («unas cien… el bloque de cinco días») quedó desactualizado |
| U-04 a U-06, U-08 a U-11 | Bajo | Reales | Ver bloque B |

## Bloque A — decisiones y datos de Nico

- **D-1 (U-01):** ¿qué fue exactamente lo del 1 de octubre? ¿Se publicó una imagen con precio en la cuenta de IG del
  proyecto para que la sincronización la trajera a la agenda? ¿Cuánto tiempo estuvo publicada y cuándo se borró?
- **D-2 (U-02):** ¿estuviste presente durante la sesión de la tercera evaluadora? ¿Qué le dijiste antes de empezar,
  además de pasarle los documentos?
- **D-3 (U-03):** el 4 de octubre, ¿con cuántas claves de Gemini se corrieron los 29 casos y en cuántas tandas?
- **D-4 (U-04):** la consultora de la vinculación, ¿era una de las ocho participantes? ¿Qué relación tiene con ustedes?
  ¿La observó Jere solo?
- **D-5 (duda del tribunal sobre la rotación de claves):** los términos de la API de Google prohíben eludir los límites
  de uso. Propuesta: dejar los hechos («con una clave de otro proyecto…») y sacar del C.8 la rotación de claves
  presentada como mitigación («porque la cuota es por proyecto»).
- **D-6 (§9.3, opcional):** repetir en E3 un video de 1080×1920 y unos 60 s para medir el pico real de FFmpeg (cierra la
  salvedad (a) de T-02 y la pregunta 5). Se puede hacer sin publicar.
- **D-7 (§9.1, expediente):** el director no se consulta (decisión del 05-10). Opción: subir al Drive, junto con las
  Pautas, los consentimientos escaneados, y que el §3.7.6 lo diga.

## Bloque B — texto (Claude, pasadas desde la 236)

1. **Pasada 236 — U-12 y U-07 (mecánicas, primero).** Reponer el `sectPr` vertical en el párrafo que hoy precede a la
   Fig. 3; poner `a:xfrm/a:ext` igual a `wp:extent` en las Figs. 12 a 15. Título de la Fig. 14 sin «tres» (muestra
   dos), y el punto huérfano de la p. 77 («—. Los limpios»). Verificar con PyMuPDF que queden 4 páginas apaisadas y la
   proporción de las cuatro capturas.
2. **Pasada 237 — U-02, U-04, U-11, U-09, U-10.**
   - Resumen: «dos evaluadores externos al equipo, conocidos de los autores».
   - E.14.1: quién estuvo presente (D-2).
   - B.1/§8.1: relación de la consultora y quién la observó (D-4).
   - §8.1 OE-2: el orden frente al manual también tuvo dos evaluadores.
   - §8.2(2): «la polisemia y el separador de miles».
   - B.2: armonizar la frase de los sub-workflows.
   - Terminología: título y enunciado de la HU1, «base central» en el A.2 y «base propia» en el §3.7.2.
   - §1.6.0: la segunda búsqueda filtró desde 2023 (`DESDE = '2023-01-01'` en buscar_bibliografia.py).
3. **Pasada 238 — U-05, U-06.**
   - Tabla 13 HU2: n = 5 (ejecuciones 25, 111, 119, 1050 y 1220; 2,9–3,8 s).
   - Tabla 16: el saneo del mensaje de éxito para Telegram (HTML) en su fila.
   - B.1: Tabla 10 → Tabla 11.
   - C.9: inventariar la prueba de lecturas multiplicadas en la Tabla 17, o corregir la remisión.
   - §2.3: la remisión a B.5 sólo para la no atomicidad.
4. **Pasada 239 — U-08 (norma; releer pp. 3, 7 y 10 de las Pautas antes de escribir).**
   - §2.4 y §4.3.2: separar la nomenclatura de la página de negocio de la identificación al comentar.
   - Páginas de «violación grave» (p. 7) y «seria» (p. 10).
   - Agregar a la definición y al §7.8 la categoría de mensajes que invitan a empezar un negocio Mary Kay.
5. **Pasada 240 — U-01 y U-03 (según D-1, D-3 y D-5).**
   - C.9 y §3.7.6 con lo que haya pasado el 1 de octubre.
   - §6.1.2/E.6: con qué claves y en cuántas jornadas se hizo la repetición; rehacer el párrafo del recuento separando el
     bloque del 14 al 18 de septiembre de lo posterior.
   - C.8: sacar la rotación de claves como mitigación.

Cada pasada: `verificar_recorte` (sin pérdidas), los verificadores, `medir_escritura` (0 oraciones nuevas de más de
40 palabras) y el PDF revisado con PyMuPDF (**que la cantidad de páginas apaisadas siga en 4**). Regla nueva: **antes
de borrar o fusionar un párrafo, verificar que no tenga un `w:sectPr`** (agregarlo a `_condensar.borrar`).

## Lo que no se toca

N-05 (anexos tan extensos como el cuerpo) y N-08 (multitenencia en la misma página): declarados y aceptados por el
tribunal. No se agrega texto para las preguntas del §10, que se preparan aparte para la defensa.
