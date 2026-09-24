# Cuestionario de aceptación tecnológica — TAM v2

Adaptado de Davis (1989). Reemplaza al instrumento del piloto (Anexo E.3 de la tesis), que
tenía diez ítems **todos redactados en sentido favorable al sistema**. El §3.5.5 declaró esa
falla: sin ítems invertidos, un puntaje alto es compatible con la aceptación y también con
la tendencia a acordar, y ampliar la muestra no lo corrige.

Esta versión tiene **doce ítems, tres de ellos invertidos** (marcados `r`), más un ítem de
control de atención que no puntúa.

---

## Administración

Se aplica **inmediatamente después de la sesión de uso**, con el sistema recién utilizado.
Esa inmediatez es condición para que el instrumento mida aceptación y no expectativa.

**Enunciado que se lee a la participante:**

> Indicá tu grado de acuerdo con cada afirmación, del 1 al 5, donde 1 es «muy en desacuerdo»
> y 5 es «muy de acuerdo». No hay respuestas correctas. Algunas afirmaciones están escritas
> al revés a propósito: leelas con atención.

La advertencia va porque un ítem invertido no leído produce un dato peor que su ausencia.

---

## Los doce ítems, en el orden en que se administran

| # | Código | Afirmación | Constructo |
|---|---|---|---|
| 1 | PU1 | Usar Postly me permite crear y publicar contenido más rápido. | Utilidad |
| 2 | PEOU1 | Aprender a usar Postly me resultó fácil. | Facilidad |
| 3 | PU2 | Usar Postly reduce el esfuerzo que dedico a gestionar mis redes. | Utilidad |
| 4 | **PEOU2r** | **Tuve que pensar demasiado para entender qué me estaba pidiendo el bot.** | Facilidad (invertido) |
| 5 | PU3 | Postly me ayuda a cumplir las normas de la marca sin revisar todo a mano. | Utilidad |
| 6 | PEOU3 | No necesito conocimientos técnicos para usar Postly. | Facilidad |
| 7 | **PU4r** | **Termino haciendo por mi cuenta buena parte del trabajo que esperaba que Postly resolviera.** | Utilidad (invertido) |
| 8 | AT1 | Para verificar que estás leyendo, marcá el número 2 en esta afirmación. | Control, no puntúa |
| 9 | PEOU4 | En general, Postly es fácil de usar. | Facilidad |
| 10 | BI1 | Tengo intención de seguir usando Postly para gestionar mis publicaciones. | Intención |
| 11 | **BI2r** | **Si tuviera que elegir hoy, volvería a publicar como lo hacía antes.** | Intención (invertido) |
| 12 | PU5 | En general, Postly es útil para mi actividad como consultora. | Utilidad |

Campo de comentario libre al final: *¿Qué le cambiarías?* En el piloto quedó sin completar en
las tres administraciones; se conserva porque su costo es nulo y una sola respuesta útil
vale más que su ausencia.

---

## Puntuación

1. **Recodificar los tres invertidos** antes de cualquier cálculo: `valor = 6 − respuesta`.
   `run_tam_v2.mjs` lo hace solo y avisa qué ítems recodificó.
2. **Descartar AT1** del puntaje. Si una participante no respondió 2, **no se descarta su
   cuestionario**: se informa cuántas fallaron el control, que es un dato sobre el
   instrumento y no sobre ellas.
3. Media por constructo, media global, y α de Cronbach por constructo con su n.

## Lo que el análisis informa aunque incomode

- **Correlación entre los ítems directos y los invertidos de un mismo constructo.** Si es
  positiva —es decir, si quien acuerda con el ítem favorable acuerda también con el
  contrario—, hay aquiescencia y el puntaje no mide aceptación. El script lo calcula y lo
  dice con esas palabras.
- **Varianza nula.** Si un constructo vuelve a dar 5,00 sin variación, el α queda indefinido
  y así se informa, como en el piloto.
- **α por debajo de 0,70.** Se informa el valor, sin adjetivos y sin omitirlo.
