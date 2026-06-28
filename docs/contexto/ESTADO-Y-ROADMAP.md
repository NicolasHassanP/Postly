# Postly — Estado de implementación y Roadmap

> Documento de handoff para el equipo de tesis (Bontorno · Hassan).
> Última actualización: **2026-06-28**. Fuente de la verdad: `docs/Tesis Postly Bontorno Hassan.docx`.

Este documento mapea las **14 Historias de Usuario (HU)** de la tesis contra lo realmente implementado
en los workflows de n8n, lista las **deudas técnicas** dentro de lo ya hecho, y propone el **orden de trabajo**.

---

## Resumen ejecutivo

**11 de 14 HU implementadas (79%).**

- ✅ **Módulo A — Seguridad/Onboarding/Auth:** completo (HU1, HU2, HU3).
- ✅ **Módulo B — Creación con IA:** completo (HU4, HU5, HU6).
- ✅ **Módulo C — Compliance:** completo (HU7, HU8, HU9).
- 🟡 **Módulo D — Publicación y Agenda:** parcial (HU11, HU12 ✅ · HU10 ❌).
- ❌ **Módulo E — Multimedia y Analítica:** sin hacer (HU13, HU14 ❌).

> Las 3 HU restantes (HU10, HU13, HU14) están **todas bloqueadas por la migración a VPS** (Cron o FFmpeg 24/7). No queda feature accionable sin el servidor.

---

## Tabla de cumplimiento (14 HU)

| HU | Módulo | Título | Estado | ¿Cumple lo documentado? |
|----|--------|--------|--------|--------------------------|
| HU1 | A | Registro e identificación (`/start`) | ✅ | Sí — gateo por Chat ID, nuevo vs recurrente |
| HU2 | A | Vinculación OAuth 2.0 | ✅ | Sí — botón → Meta → callback → token en Sheets |
| HU3 | A | Validación preventiva del token | ✅ | Sí — ping antes de crear, bloqueo + reconectar |
| HU4 | B | Análisis de imagen única | ✅ | Sí — foto → Gemini → 3 copys (JSON) |
| HU5 | B | Carruseles (hasta 10 imágenes) | ✅ | Sí — validada e2e (2026-06-28): ingesta media group + orden IA + confirmar/editar + publicación de carrusel en IG + guardado en Sheets |
| HU6 | B | Selección de tono (3 estilos) | ✅ | Sí — Informativa/Vendedora/Divertida + HITL |
| HU7 | C | Detección de precios en TEXTO (RegEx) | ✅ | Sí — bloquea y avisa |
| HU8 | C | Detección de precios en IMAGEN (visión Gemini) | ✅ | Sí — gate visual antes de generar copys, bloquea y avisa |
| HU9 | C | Inyección de firma legal | ✅ | Sí (con matices, ver deudas) |
| HU10 | D | **Programación a futuro (Cron)** | ❌ | **No implementado — requiere VPS** |
| HU11 | D | Visualización de agenda | ✅ | Sí — tarjetas con estados, paginación |
| HU12 | D | Smart Re-post | ✅ | Sí + extensión "Retomar borrador" |
| HU13 | E | **Normalización de video (FFmpeg)** | ❌ | **No implementado — requiere VPS** |
| HU14 | E | **Métricas de engagement (Cron 24h)** | ❌ | **No implementado — requiere VPS** |

---

## Lo que falta (detalle)

### Se puede hacer YA (no depende de la migración a VPS)

**Nada pendiente.** HU5 era el último ítem libre de VPS y quedó **validada e2e el 2026-06-28**. Todo lo que
resta (HU10, HU13, HU14) depende del servidor 24/7.

> Avances posibles *sin* VPS sobre las HU bloqueadas (opcionales, adelantan trabajo):
> - **HU14:** construir y testear con **disparo manual** la lógica de métricas (GET Graph API → likes/comments
>   → Sheets → leer en "Mi Agenda"); solo el Cron de 24h necesita el VPS. Base: workflow `Postly - Feedback Loop`.
> - **HU13:** evaluar **Cloudinary** (ya en uso) para transformar video (9:16, H.264, recorte) en lugar de FFmpeg
>   — destrabaría HU13 sin VPS, pero **se desvía de lo documentado** (la tesis especifica FFmpeg); requiere visto bueno del director.

### Depende de la migración a VPS (Cron / FFmpeg 24/7)

#### HU10 — Programación a futuro (Cron Scheduling)
Elegir fecha/hora futura → guardar "Pendiente" → un **Cron Job** dispara la publicación sola al llegar el timestamp
+ notificación Push. Necesita el servidor corriendo 24/7 (con la PC + ngrok no es confiable).

#### HU13 — Normalización de video con FFmpeg (Módulo E)
Reels/video forzados a 9:16, H.264, ≤60s vía **FFmpeg** en el backend Linux del VPS. Hoy se hace solo un
ajuste de **imagen** (Cloudinary `c_pad,ar_1:1`), no de video.

#### HU14 — Métricas de engagement (Módulo E)
Cron cada 24h → GET a la Graph API por likes/comments → normaliza y guarda en Sheets → se leen desde "Mi Agenda".
Existe el workflow `Postly - Feedback Loop` (inactivo) como base. Necesita Cron 24/7.

---

## Deudas técnicas dentro de lo ya hecho

> **Actualización 2026-06-26:** las 3 deudas accionables fueron **saldadas** (commits `9c5483e`, `df1bce5`, `7f0c83a`).

1. **Cifrado del token (HU2):** ✅ **RESUELTO.** El Page Token se guarda **cifrado con AES-256-GCM** en la hoja
   *Usuarios* (formato `enc:` + base64). El callback OAuth cifra al guardar; el principal descifra al leer
   (3 Code nodes `Descifrar *`). Requiere `POSTLY_ENC_KEY` + `NODE_FUNCTION_ALLOW_BUILTIN=crypto` en `.env`.
   Convive con texto plano (passthrough) para migración suave.
2. **HU3 en agenda:** ✅ **RESUELTO.** "Mi Agenda" ahora valida el token antes de abrirse (mini-gate clonado:
   Leer token → Validar `/me` → ¿Vigente?). Token caído → mensaje de reconectar.
3. **HU9 desde BD + contacto:** ✅ **RESUELTO.** La firma se lee de la pestaña **`Config`** de `Postly_DB`
   (columnas `firma`/`contacto`), con fallback a la línea legal. Se normaliza y reinserta limpia (la IA a veces
   la escribe inline) y se suma el contacto en su renglón.
4. **Publish "última fila":** ⏸️ **Fuera de alcance (sin cambios).** En el flujo *fresco*, publicar apunta al
   **último** post del usuario (el `append` de n8n no devuelve el `row_number` al crear). En uso normal es
   correcto; el caso raro (crear A, crear B, publicar A) queda fuera de alcance. El **"Retomar borrador"** sí es
   de fila exacta (row-aware).

---

## Roadmap propuesto

1. ✅ **HU8 (detección visual de precios)** — **hecha** (2026-06-26). Cerró el Módulo C.
2. ✅ **Deudas técnicas** (cifrado del token, gateo de agenda, firma desde BD) — **hechas** (2026-06-26).
3. ✅ **HU5 (carruseles)** — **completa y validada e2e** (Etapa 1 2026-06-26 + Etapa 2 2026-06-27 + validación + fixes 2026-06-28): ingesta de media group (buffer en archivo local), orden narrativo IA, gate de compliance visual, confirmar/reordenar, editar caption, y publicación de carrusel real en IG (Graph API multi-contenedor). Cerró el Módulo B.
4. **Migración a VPS** (Docker + proxy inverso + SSL) — destraba **HU10, HU13, HU14** de una sola vez.
   Bloqueada por Oracle Cloud (rechazo de tarjetas virtuales); pendiente de resolver el medio de pago.
   Único frente que queda. Mientras tanto se puede adelantar la lógica no-Cron de HU14 con disparo manual.

---

## Fixes de la validación de HU5 (2026-06-28)

Al probar el carrusel e2e surgieron varios bugs/inconsistencias, ya corregidos en el workflow principal:

1. **Link del post vacío** en el mensaje de éxito del carrusel: `HU5: Pub éxito` leía `$json.permalink`, pero su
   nodo de entrada es el de Google Sheets (sin ese campo). Ahora referencia `$('HU5: Pub permalink')`.
2. **Carrusel no guardaba los 3 tonos:** el post simple guarda `Copy_Op1/2/3` (fila Pendiente al ingestar) y el
   carrusel solo hacía un `append` al publicar con `Copy_Final`. Se unificó:
   - Nuevo nodo **`HU5: Crear pendiente`** (append, `Status: Pendiente`) tras `HU5: Parsear copys` → crea la fila
     con los 3 tonos al ingestar, igual que el post simple.
   - **`HU5: Pub guardar`** pasó de `append` a **`appendOrUpdate` matcheando por `ImageURL`**: al publicar
     actualiza esa misma fila (Pendiente → Publicado, con `PostID_IG`), sin duplicar.
3. **Firma centralizada:** se editaron los prompts de imagen única (`Analyze an image`, `Repost: Analizar imagen`)
   para que la IA **no** agregue la firma; del agregado se encarga el nodo dedicado (Compliance Sentinel / `Config`),
   igual que ya hacía el carrusel. `Copy_Op*` quedan crudos; `Copy_Final` lleva la firma.

> **Gotcha de edición por API (Windows):** NO leer el `.json` con PowerShell `Get-Content` para re-PUTearlo —
> PS 5.1 lo lee como ANSI y corrompe todos los emojis/acentos (mojibake). Editar siempre con script **Node**
> (`readFileSync('utf8')` + `fetch`). Si se corrompe, recuperar con `git show "HEAD:workflows/<archivo>.json"`.

---

## Mapa rápido de los workflows (para ubicarse)

- **`Postly - Entrega Final Sprint 1 v2`** (id `VOgbHGLELJfRgVO5`, ~74 nodos) — workflow principal:
  onboarding, vinculación, validación, creación con IA, compliance, publicación y agenda.
- **`Postly - HU2 OAuth Callback`** (id `vy60xNtAvcVKRdAx`) — endpoint `/oauth-callback` que cierra el OAuth.
- **`Postly - Feedback Loop`** (inactivo) — base para HU14 (métricas).

Para el detalle operativo (cómo editar por API, variables de entorno, gotchas), ver
`memoria-claude/` en esta misma carpeta y el `CLAUDE.md` de la raíz del repo.
