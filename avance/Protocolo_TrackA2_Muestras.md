# Track A2 — Ampliación de muestras (sacar la etiqueta «piloto»)

> Sucesor de `Protocolo_TrackA.md`. Ese protocolo consiguió lo difícil: evidencia **real y externa**
> (eliminó R-01 y llevó la nota de 8,2 a 8,7). Este apunta a lo único que queda:
> **precisión estadística** — que los intervalos de confianza sean lo bastante angostos para
> que el tribunal lea «validado» en vez de «piloto» (R-01b).

## 0. Por qué hace falta (el número que delata al piloto)

No es la exactitud global, que ya se ve bien. Es el **Recall**, la métrica crítica del Centinela
(qué fracción de infracciones atrapa), calculada sobre solo 14 casos infractores:

| Métrica | Hoy | IC 95 % (Wilson) | Semiamplitud |
|---|---|---|---|
| Exactitud A1 | 27/29 = 0,931 | [0,780 – 0,981] | **± 10,0 pts** |
| **Recall A1** | 12/14 = 0,857 | [0,601 – 0,960] | **± 18,0 pts** |
| Media TAM | 4,57 (n=3) | ± 0,68 Likert | muy ancha |
| Reducción de tiempo | 73,6 % (n=12) | — | potencia ya sobra |

Un Recall con IC de ±18 puntos significa, textualmente, «entre 60 % y 96 %»: no se puede
afirmar nada firme. Con los targets de abajo baja a ±9-10 puntos, que ya es un resultado.

**Dato importante para no gastar esfuerzo al vacío:** en A3 (cronometraje) la potencia estadística
**ya sobra** (potencia 0,93 con n=12 incluso asumiendo un efecto cuatro veces menor al observado).
Sumar repeticiones ahí no mejora nada. Lo que A3 necesita es **más participantes** (generalización)
y **contrabalanceo de orden** (control del efecto aprendizaje que la auditoría marcó). Es un cambio
de diseño, no de volumen.

## 1. Criterio de suficiencia (cuándo parar)

| Estudio | Hoy | Meta | Qué desbloquea |
|---|---|---|---|
| A1 compliance | 29 casos, 3 consultoras, 1 evaluador externo | **100 casos (50 infractores / 50 limpios), 10 consultoras, 2 evaluadores externos** | Recall ±9,6 pts; κ inter-evaluador real |
| A2 TAM | n = 3 | **n ≥ 20** | α de Cronbach reportable; media ±0,26 |
| A3 cronometraje | 12 pares, 3 consultoras, orden sin contrabalancear | **30 pares, 10 consultoras, orden contrabalanceado** | Generalización + control del aprendizaje |

Con eso se puede escribir «validación de campo» sin la palabra «piloto» y sin exagerar.

## 2. Prerrequisitos técnicos (resolver ANTES de convocar gente)

1. **VPS de producción pago y levantado.** Hoy está dado de baja. Diez consultoras no se pueden
   coordinar contra un ngrok local que depende de que la máquina de Nico esté encendida.
2. **Acceso de las consultoras a la app de Meta.** Si la app sigue en modo desarrollo, solo operan
   las personas con rol asignado: hay que **agregar a cada consultora como tester** (o pasar la app
   a Live con App Review, que tarda). Verificar esto antes que nada — es el bloqueo más probable.
3. **Cuenta IG/FB de prueba dedicada para A1.** Los 50 casos limpios de A1 **se publican de verdad**
   contra esa cuenta y se borran después: así se valida el flujo completo sin ensuciar el feed real
   de nadie. El veredicto de compliance no depende de la cuenta destino.

## 3. A1 — Compliance de campo ampliado (n = 100)

**Insight operativo que abarata todo:** A1 **no requiere que la consultora use el bot**. Solo
requiere que **aporte contenido real suyo**. El bot lo corre Nico contra la cuenta de prueba.
O sea: A1 escala a 10 consultoras por WhatsApp, sin onboarding, sin OAuth, sin coordinar agendas.
Es lo más barato y lo que más sube la nota. **Empezar por acá.**

**Pedido a cada consultora (10 casos, ~15 min de su tiempo):**
- 5 publicaciones reales que **sí** subiría al feed (informativas → se espera LIMPIO).
- 5 mensajes reales que mandaría **por privado** a una clienta (con precio/oferta → se espera INFRACTOR).
- Que incluya **al menos 2 con imagen** (placa o etiqueta de precio real), no solo texto.

**Estratificación (esto es lo que hace que κ signifique algo).** El κ = 1,00 actual es honesto pero
sospechoso: acuerdo perfecto sugiere que los casos eran obvios. Hay que incluir casos donde el
desacuerdo sea plausible. Cuota por consultora:

| Estrato | Casos por consultora | Total |
|---|---|---|
| E1 Precio explícito en texto | 2 | 20 |
| E2 Precio incrustado en imagen | 2 | 20 |
| E3 Informativo limpio | 4 | 40 |
| E4 **Caso límite** (especificaciones tipo «SPF 50, 50 ml», «12 cuotas de belleza» metafórico, números que no son precio) | 2 | 20 |

**Etiquetado de la verdad de base — dos evaluadores externos, a ciegas.**
Cambio respecto de la ronda 1: los dos etiquetadores deben ser **independientes del equipo de
desarrollo Y del dueño del contenido**. La etiqueta de la consultora se conserva como tercera
referencia, pero el **κ que se reporta es el de los dos externos entre sí** (así es un estadístico
de fiabilidad inter-evaluador de verdad, no un acuerdo con los autores).
Los desacuerdos los resuelve un tercero; se reporta cuántos hubo.

**Columnas nuevas en `Compliance_Campo.csv`** (mantener las existentes):
`Estrato` (E1-E4) · `Etiqueta_externa_2` · `Desacuerdo` (S/N) · `Resuelto_por`

**Procedimiento de ejecución:** cada caso se envía al bot en producción (cuenta de prueba) y se
anota en `Resultado_sistema` **Bloqueo** o **Publicó**. Análisis: `node run_compliance_field.mjs`.

## 4. A2 — TAM (n ≥ 20)

El cuestionario ya existe y está validado en uso (`TAM_Encuesta.md` / `TAM_Encuesta_Postly.pdf`,
10 ítems Likert 1-5: 4 de Utilidad, 4 de Facilidad, 2 de Intención).

- **Pasarlo a formulario online** (Google Forms con los 10 ítems, en el mismo orden) y distribuirlo
  por el grupo de consultoras. Exportar a CSV con el mismo formato: `Participante,PU1..BI2`.
- **Condición para que la respuesta valga:** que la consultora **haya usado el bot al menos una vez**.
  Un TAM respondido por quien no lo usó no mide aceptación, mide expectativa — y eso lo detecta
  cualquier evaluador. Agregar un ítem filtro: «¿Publicaste al menos una vez con Postly?».
- Con n ≥ 20 el α de Cronbach pasa a ser reportable y la media queda con IC de ±0,26.
  Análisis: `node run_tam.mjs`.

## 5. A3 — Cronometraje (30 pares, 10 consultoras, contrabalanceado)

Es el estudio caro: requiere onboarding real (OAuth), cuenta propia y ~40 min de agenda por persona.

- **Diseño: 10 consultoras × 3 publicaciones = 30 pares**, no más repeticiones por persona.
- **Contrabalanceo (el fix metodológico):** la columna `Orden` de `Cronometraje_datos.csv` existe
  y **está vacía** — por eso la auditoría pudo objetar el efecto aprendizaje. Ahora se llena:
  - 5 consultoras hacen **primero manual, después Postly** → `Orden = MP`
  - 5 consultoras hacen **primero Postly, después manual** → `Orden = PM`
  - Al analizar se compara si el orden movió el resultado. Si no lo movió, el efecto aprendizaje
    queda descartado con datos y no como declaración.
- Mantener el diseño intra-sujeto (cada consultora es su propio control) y el mismo tramo medido
  que la ronda 1: **material ya disponible → publicado en ambas redes** (no incluye crear el contenido).
- Registrar `Producto` para poder descartar que un producto puntual sesgue los tiempos.

## 6. Reparto de esfuerzo y orden de ejecución

| Paso | Quién | Esfuerzo | Depende de |
|---|---|---|---|
| 0. Verificar modo de la app de Meta + pagar VPS | Nico | 1-2 h | — |
| 1. **A1: pedir 10 casos a 10 consultoras** (WhatsApp) | Nico + Jeremías | 2 h de gestión | nada (¡arrancar ya!) |
| 2. A1: correr los 100 casos por el bot | Nico | ~3 h | paso 0 |
| 3. A1: etiquetado de los 2 externos | 2 conocidos ajenos | ~1 h cada uno | paso 1 |
| 4. A2: armar el Form y distribuirlo | Jeremías | 1 h + espera | — |
| 5. A3: agendar y cronometrar 10 consultoras | Nico + Jeremías | ~40 min × 10 | paso 0 |
| 6. Análisis + reescritura del Cap. 5, §3.5 y §5.4 | el asistente | — | CSVs completos |

**Camino crítico real:** el paso 0. Sin VPS y sin permisos de Meta, los pasos 2 y 5 no existen.
Pero el **paso 1 (juntar el contenido real) se puede hacer hoy mismo**, en paralelo, sin nada técnico.

## 7. Qué devolver para que yo documente

Los tres CSV, con las columnas nuevas:
- `Compliance_Campo.csv` — 100 filas, con `Estrato`, `Etiqueta_externa`, `Etiqueta_externa_2`, `Desacuerdo`
- `TAM_respuestas.csv` — ≥ 20 filas
- `Cronometraje_datos.csv` — 30 filas, con `Orden` (MP/PM) **completo**

Con eso: re-corro los tres análisis, agrego los IC de Wilson a las tres matrices, analizo el efecto
de orden en A3, reescribo §5.1 / §5.4 / §6 y §3.5.2-3.5.3, y hacemos la re-auditoría final.

## 8. Riesgos y qué hacer

| Riesgo | Mitigación |
|---|---|
| La app de Meta está en modo desarrollo y no se pueden sumar 10 consultoras | Agregarlas como testers una por una; si no alcanza, **A1 se salva igual** (corre en la cuenta de prueba) y A3 se reduce a las consultoras que sí se puedan habilitar |
| Deserción: prometen y no mandan contenido | Sobre-reclutar: pedir a 14 para cerrar 10 |
| Sesgo de selección (todas del mismo círculo) | Declararlo explícitamente: muestreo no probabilístico por bola de nieve. Es honesto y aceptable; lo que no es aceptable es no declararlo |
| Los 50 casos limpios publican en un feed real | Cuenta de prueba dedicada (prerrequisito 3) |
| κ vuelve a salir 1,00 | Es el síntoma de casos demasiado obvios → por eso el estrato E4 de casos límite es obligatorio |
| Aparecen más casos fuera de alcance (defectos de producto, como los 2 FN de la ronda 1) | Se clasifican aparte y se reportan como límite de alcance, no como error del Centinela. Ya hay precedente redactado en §5.1 |
