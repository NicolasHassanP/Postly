# Track A — Fortalecimiento de la evidencia empírica (ruta a nota > 9)

**Objetivo.** Elevar la evidencia de "piloto" a "validación con contenido real y evaluadores externos", que es lo único que separa la nota actual (8,2) de la banda superior. Son tres estudios independientes; se pueden correr en paralelo.

**Regla de oro (la que sube la nota):** que los datos NO los generen ni etiqueten los autores. Cuanto más externo sea el contenido y quién juzga, más fuerte la evidencia.

---

## A1 — Compliance con contenido REAL + evaluadora externa
Reemplaza la matriz de confusión actual (casos diseñados por los autores) por una sobre **contenido real de consultoras**, con la verdad de base etiquetada por **dos personas independientes** (mide fiabilidad con kappa).

**Insumos que aporta cada consultora (contenido real de su actividad):**
- **5 publicaciones que SÍ publicaría en el feed** (informativas → se espera LIMPIO).
- **5 mensajes que enviaría por privado a una clienta** (con precios/ofertas → se espera INFRACTOR).
- Mezcla de texto e imagen (algunas con placa/etiqueta de precio real).
→ 10 casos × 3 consultoras = **30 casos reales**, balanceados.

**Procedimiento:**
1. Se cargan los 30 casos en `Compliance_Campo.csv` (columna `Contenido_real`).
2. **Etiquetado de la verdad de base (a ciegas del sistema):** dos personas etiquetan cada caso como INFRACTOR/LIMPIO **sin ver qué hizo el bot**:
   - `Etiqueta_consultora`: la propia consultora (conoce las normas Mary Kay).
   - `Etiqueta_externa`: una persona **ajena al equipo de desarrollo** (no Nico ni Jeremías).
   - `Ground_truth`: la etiqueta de consenso (si difieren, se discute y se acuerda una).
3. **Ejecución:** cada caso se envía al bot en producción y se anota en `Resultado_sistema` si **Bloqueó** o **Publicó** (para los limpios, frenás antes de publicar de verdad; para los infractores ves el bloqueo).
4. Análisis: `node run_compliance_field.mjs` → kappa de acuerdo + matriz de confusión real + Recall/Precisión/F1.

**Meta:** ≥ 30 casos, kappa ≥ 0,6, y una matriz de confusión con contenido real. Esto elimina la crítica de "autoevaluación" (R-01).

---

## A2 — Encuesta de Aceptación Tecnológica (TAM)
Cierra la única variable declarada y no medida (§3.5.4, variable c). Es lo más barato en esfuerzo y alto en retorno.

**Procedimiento:**
1. Cada consultora que usó Postly completa `TAM_Encuesta.md` (10 ítems, Likert 1–5). Ideal: hacerlo **justo después del cronometraje**, con el sistema fresco.
2. Volcás los 10 números por consultora en `TAM_respuestas.csv`.
3. Análisis: `node run_tam.mjs` → medias por constructo (Utilidad, Facilidad, Intención) + alfa de Cronbach.

**Meta:** ≥ 3 respuestas (mejor 5+). Reportar medias y alfa. Cuantas más consultoras, más robusto el alfa.

---

## A3 — Ampliar el cronometraje
El piloto tiene n = 9 (3 consultoras × 3). Para robustecer el 72,3 %:
- Sumá **2 publicaciones más por consultora** (llegar a 5 c/u → n = 15), y/o **una 4ª consultora**.
- Cargá las filas nuevas en `Cronometraje_datos.csv` (mismas columnas) y re-corré `node run_cronometraje.mjs Cronometraje_datos.csv`.

**Meta:** n ≥ 15 pares. Mantener el diseño intra-sujeto y el contrabalanceo de orden.

---

## Roles (quién hace qué)
| Tarea | Responsable |
|---|---|
| Coordinar consultoras, correr el bot, cargar CSVs | Nico / Jeremías |
| Aportar contenido real (A1), usar el bot (A3), responder TAM (A2) | Las 3 consultoras |
| Etiqueta externa de compliance (A1) | Una persona ajena al equipo (conocida, colega) |
| Analizar datos + redactar en la tesis + re-auditar | El asistente (yo) |

## Qué me devolvés para que documente
Los tres CSV completos: `Compliance_Campo.csv`, `TAM_respuestas.csv`, `Cronometraje_datos.csv` (ampliado). Con eso corro los análisis, reescribo las subsecciones del Cap. 5 y actualizo §3.5, y hacemos la re-auditoría final.
