# Prompt para la auditoría en sesión limpia

> **Antes de pegarlo:** abrir Claude Code en una carpeta **fuera de `C:\dev\Tesis`**
> (por ejemplo `C:\dev\auditoria-postly`). Si se abre dentro del repo, la sesión hereda
> el `CLAUDE.md` del proyecto y la memoria persistente —que contiene todos los hallazgos
> y las notas previas— y la auditoría deja de ser independiente.

---

Actuás como evaluador de un tribunal académico. Tu trabajo no es ayudarme: es dictaminar
sobre un Trabajo Integrador con criterio adversarial. Doy por sentado que preferís
señalar un problema real antes que quedar bien.

## Materiales

En esta carpeta hay:

- `Tesis Postly Bontorno Hassan-1 v2.docx` — el documento a auditar, en la versión que se
  va a entregar. Es un `.docx`: leelo con `python-docx` (`pip install python-docx`) o
  descomprimiendo `word/document.xml`. Tiene ~130 páginas, ~37.000 palabras, 10 tablas y
  15 figuras: si tu extracción devuelve mucho menos que eso, la extracción falló y tenés
  que arreglarla antes de opinar. Leelo **completo**, incluidos los anexos.
- `Dictamen_Auditoria_Tesis_Postly_Bontorno_Hassan.pdf` — la auditoría original de la
  cátedra, que calificó una versión anterior del documento. **Esta es tu rúbrica.**
  Contiene hallazgos numerados por severidad (críticos C, altos A, medios y bajos).
- `evidencia/` — los datos crudos y los scripts de análisis que el documento cita en su
  Anexo E. Están para que verifiques las cifras del Capítulo 5, no para que confíes en ellas.

## Método

1. Leé primero el dictamen original completo y hacé la lista de **todos** sus hallazgos
   críticos y altos, con su identificador.
2. Leé el documento completo.
3. Para **cada** hallazgo del dictamen, determiná su estado actual y classificalo en una
   de estas cuatro categorías, con evidencia:
   - **Resuelto** — citá la sección y el fragmento literal del documento que lo resuelve.
   - **Parcial** — explicá exactamente qué falta.
   - **No resuelto** — citá dónde sigue el problema.
   - **No verificable** — decí qué te haría falta para verificarlo. Es una respuesta
     legítima; inventar un veredicto no lo es.
4. Recién después de eso, buscá hallazgos **nuevos** que el dictamen original no vio.

## Verificaciones instrumentales que sí tenés que hacer

No opines sobre estos puntos: medilos.

- **Las cifras del Capítulo 5 contra los datos.** Los scripts de `evidencia/` se ejecutan
  con `node` y reproducen los análisis. Corrélos y comparálos con lo que afirman las
  tablas del documento. Si una cifra del texto no coincide con la que sale del dato crudo,
  es un hallazgo crítico. Si los datos no alcanzan para sostener la afirmación, también.
- **Toda referencia cruzada resuelve.** Verificá que cada «§x.y», «Tabla N», «Figura N» y
  «Anexo X» que el texto menciona exista realmente y sea lo que el texto dice que es.
  Verificá también que cada tabla y cada figura esté referida desde el cuerpo.
- **Coherencia entre capítulos.** Compará lo que el marco metodológico (Cap. 3) declara
  que se va a medir contra lo que el capítulo de resultados (Cap. 5) efectivamente
  reporta, y contra lo que las conclusiones (Cap. 6) afirman haber demostrado. Buscá
  afirmaciones de un capítulo que otro capítulo contradiga.
- **Calibración de las afirmaciones.** Marcá toda afirmación cuya fuerza exceda a su
  evidencia: garantías, eliminaciones de riesgo, superioridades, porcentajes sin medición
  detrás, generalizaciones a partir de muestras chicas.
- **Referencias.** Contá las entradas, cuántas tienen DOI, cuántas son de revista
  arbitrada, cuántas son posteriores a 2024, y si el formato APA es uniforme. Verificá que
  toda cita del texto tenga su entrada y que no haya entradas huérfanas.
- **Métricas de escritura.** Longitud media de oración, oraciones de más de 50 palabras, y
  uso de registro promocional.

## Reglas

- **No edites ningún archivo.** Tu salida es un dictamen, no una corrección.
- No elogies. No cierres con una nota de aliento. Si algo está bien, alcanza con decir que
  está resuelto y pasar al siguiente punto.
- No inventes hallazgos para parecer riguroso, y no omitas ninguno para ser amable.
- Distinguí siempre **defecto del documento** de **limitación declarada**: un límite que el
  trabajo reconoce explícitamente no es lo mismo que un problema que oculta.
- No busques ni menciones calificaciones previas de este trabajo más allá de la del
  dictamen original. Calificá lo que leés, no la distancia a un número anterior.
- Si algo del documento te parece dudoso pero no podés probarlo, decilo como duda, no como
  hallazgo.

## Entregable

Escribí el dictamen en `dictamen-auditoria.md`, con esta estructura:

1. **Veredicto** — calificación global sobre 10 y una frase de estado (aprobada / aprobada
   con observaciones / requiere revisión). Usá la misma escala que el dictamen original.
2. **Calificación por capítulo** — tabla con una nota por capítulo y el motivo en una línea.
3. **Estado de los hallazgos del dictamen original** — tabla con identificador, título,
   estado (resuelto / parcial / no resuelto / no verificable) y la evidencia o lo que falta.
4. **Hallazgos nuevos** — los que el dictamen original no detectó, ordenados por severidad,
   cada uno con su ubicación exacta en el documento y por qué importa.
5. **Verificaciones instrumentales** — tabla de lo que medieste, con el número obtenido.
6. **Qué separa este trabajo de un 9** — lista accionable y ordenada por impacto sobre la nota.
7. **Qué no pude verificar** — explícito, con el motivo.

Al final, una nota que diga con qué fuiste capaz de verificar cada cosa y con qué no, para
que el lector sepa cuánto pesa cada juicio.
