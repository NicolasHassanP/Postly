# Prompt para retomar (16/09/2026)

Copiar y pegar todo lo que sigue en una sesión nueva de Claude Code abierta en `C:\dev\Tesis`.

---

Retomamos la remediación del dictamen de auditoría de la tesis Postly. Leé primero
`C:\Users\Nico\.claude\projects\C--dev-Tesis\memory\postly-dictamen-segunda-instancia.md`,
que tiene el estado completo y las decisiones tomadas.

## Dónde quedamos

De las 12 acciones del §6 del dictamen quedan **11 cerradas y 1 abierta**: N-04, el canal
de imagen del Módulo Centinela, que descansaba en 4 casos y sobre esa base el §6.2 apoyaba
su recomendación de arquitectura.

El conjunto ampliado de 20 casos está en `avance/evidencia/casos_imagen/` y **van 18
puntuados (V01 a V18), los 18 correctos: 10 VP y 8 VN.** Faltan V19 («Vitamina C 10%»,
porcentaje que no es descuento) y V20 («TimeWise Repair Volu-Firm», nombre de línea con
cifra romana), los dos LIMPIOS. El cupo gratuito de Gemini son **20 peticiones por día**
—y los reintentos cuentan contra el mismo tope—, así que la corrida del 15/09 se quedó sin
cupo en V19. La tarea programada «Postly-canal-imagen» vuelve a correr el 16/09 a las
07:10; el script es reanudable.

**Cerrado el 15/09 (aparte de N-04):** el §7 del dictamen —«qué no pude verificar»—
señalaba que la Precisión de 1,00 de la Tabla 5 no era auditable, porque
`Compliance_Campo.csv` registraba los 15 casos LIMPIO con un mismo texto de relleno.
`poblar_campo_verbatim.py` pobló los 29 con el pie de foto verbatim (de `infractoras/` y
`pub consultoras/`, que quedan fuera del repo), y el detector sobre ese texto reproduce
caso por caso el veredicto que registró el bot: la Tabla 5 no se movió (VP 12 / FN 2 /
FP 0 / VN 15, κ = 1,00, F1 0,923) y ahora es reproducible. `_pasada11b.py` —**ya
aplicada**— lo declara en el E.1.2 y precisa en el §5.1 que el material lo redactaron las
consultoras pero **no se publicó en sus cuentas**: se reunió para esta evaluación.

**El trabajo de escritura ya está hecho y ensayado**: `avance/_pasada11a.py` toma las
cifras del archivo de resultados (no las escribe a mano), revierte la acotación
provisional de `_pasada10k.py` en §5.1, §5.4 y §6.2, agrega el bloque de prosa del
conjunto ampliado en el §5.1, y crea el **Anexo E.6** con el protocolo, la declaración de
que las placas las compusieron los autores, y la **Tabla 12** al final del documento
—después de la Tabla 11, para que el campo `SEQ` le asigne el 12 sin renumerar nada—.
Se ensayó de punta a punta —encadenada sobre el documento con la 11b ya aplicada—
contra un CSV completado de forma sintética: verificación propia limpia,
`verificar_documento.py` sin puntos abiertos, media del cuerpo 27,4 y ninguna oración de
más de 50 palabras.

## Qué hacer

1. **Confirmá que estén los 20 puntuados:**
   ```
   cd C:\dev\Tesis\avance
   type _vision_tarea.log
   python armar_evidencia.py
   ```
   `armar_evidencia.py` ahora corta si el canal de imagen tiene casos sin veredicto y dice
   cuáles. Si faltan, corré `node run_compliance_vision.mjs evidencia/casos_imagen`.

2. **Aplicá la pasada** (comprobando antes la marca de tiempo del .docx y que no haya lock
   `~$…docx`, porque Nico lo edita a mano entre pasadas):
   ```
   copy "Tesis Postly Bontorno Hassan-1 v2.docx" "Tesis Postly Bontorno Hassan-1 v2.bak-pre-pasada11a.docx"
   python _pasada11a.py "Tesis Postly Bontorno Hassan-1 v2.docx" "_salida11a.docx"
   ```
   **Ojo:** la prosa de `_pasada11a.py` está redactada para un conjunto **sin errores**. Si
   V19 o V20 salen FP, el script **se detiene a propósito** y muestra cuáles fallaron: hay
   que reescribir §5.1, §5.4 y §6.2 calibrados a lo que digan los datos antes de aplicarla.
   Un error en el canal de imagen cambia el argumento del §6.2.

3. **Verificá el documento** con
   `python verificar_documento.py "Tesis Postly Bontorno Hassan-1 v2.docx"` — tiene que
   seguir saliendo sin puntos abiertos, con la media del cuerpo en 25-28 y sin oraciones de
   más de 50 palabras.

4. **En Word**: abrir el documento y actualizar los campos (Ctrl+E, F9) para que la Tabla 12
   aparezca en el índice de tablas.

5. Cuando esté, borrá la tarea programada:
   `schtasks /Delete /TN "Postly-canal-imagen" /F`

## Reglas de trabajo que ya acordamos

- **Nico edita el .docx a mano en Word entre pasadas.** Antes de escribir sobre el archivo,
  comprobá la marca de tiempo y el lock `~$…docx`. Si él tocó algo, la pasada se reaplica
  sobre SU versión; nunca se pisa con una copia propia.
- Cada cambio va en un script `_pasadaNN.py` con verificación propia al final, usando
  `_util_docx.py`. Nada de ediciones a mano sin dejar rastro.
- Ante una disyuntiva entre una lectura que mejora las cifras y otra que las empeora, se
  toma la defendible aunque empeore el número, y se declara.
- El repo es público: las imágenes de las consultoras y el PDF del dictamen están en
  `.gitignore`. No commitear sin que Nico lo pida.
