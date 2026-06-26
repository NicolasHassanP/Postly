# Postly — Estado de implementación y Roadmap

> Documento de handoff para el equipo de tesis (Bontorno · Hassan).
> Última actualización: **2026-06-25**. Fuente de la verdad: `docs/Tesis Postly Bontorno Hassan.docx`.

Este documento mapea las **14 Historias de Usuario (HU)** de la tesis contra lo realmente implementado
en los workflows de n8n, lista las **deudas técnicas** dentro de lo ya hecho, y propone el **orden de trabajo**.

---

## Resumen ejecutivo

**9 de 14 HU implementadas (64%).**

- ✅ **Módulo A — Seguridad/Onboarding/Auth:** completo (HU1, HU2, HU3).
- 🟡 **Módulo B — Creación con IA:** parcial (HU4, HU6 ✅ · HU5 ❌).
- 🟡 **Módulo C — Compliance:** parcial (HU7, HU9 ✅ · HU8 ❌).
- 🟡 **Módulo D — Publicación y Agenda:** parcial (HU11, HU12 ✅ · HU10 ❌).
- ❌ **Módulo E — Multimedia y Analítica:** sin hacer (HU13, HU14 ❌).

---

## Tabla de cumplimiento (14 HU)

| HU | Módulo | Título | Estado | ¿Cumple lo documentado? |
|----|--------|--------|--------|--------------------------|
| HU1 | A | Registro e identificación (`/start`) | ✅ | Sí — gateo por Chat ID, nuevo vs recurrente |
| HU2 | A | Vinculación OAuth 2.0 | ✅ | Sí — botón → Meta → callback → token en Sheets |
| HU3 | A | Validación preventiva del token | ✅ | Sí — ping antes de crear, bloqueo + reconectar |
| HU4 | B | Análisis de imagen única | ✅ | Sí — foto → Gemini → 3 copys (JSON) |
| HU5 | B | **Carruseles (hasta 10 imágenes)** | ❌ | **No implementado** |
| HU6 | B | Selección de tono (3 estilos) | ✅ | Sí — Informativa/Vendedora/Divertida + HITL |
| HU7 | C | Detección de precios en TEXTO (RegEx) | ✅ | Sí — bloquea y avisa |
| HU8 | C | **Detección de precios en IMAGEN (OCR)** | ❌ | **No implementado** |
| HU9 | C | Inyección de firma legal | ✅ | Sí (con matices, ver deudas) |
| HU10 | D | **Programación a futuro (Cron)** | ❌ | **No implementado — requiere VPS** |
| HU11 | D | Visualización de agenda | ✅ | Sí — tarjetas con estados, paginación |
| HU12 | D | Smart Re-post | ✅ | Sí + extensión "Retomar borrador" |
| HU13 | E | **Normalización de video (FFmpeg)** | ❌ | **No implementado — requiere VPS** |
| HU14 | E | **Métricas de engagement (Cron 24h)** | ❌ | **No implementado — requiere VPS** |

---

## Lo que falta (detalle)

### Se puede hacer YA (no depende de la migración a VPS)

#### HU5 — Carruseles (Módulo B)
Hoy el bot solo procesa **una** imagen. La tesis pide recibir un **media group de Telegram (hasta 10 imágenes)**,
que la IA proponga un **orden estético** (portada/hook + secuencia narrativa) y un **Wait** para que la usuaria
confirme/reordene antes de generar el texto. Es una feature grande del módulo de creación.

#### HU8 — Detección de precios en imágenes / OCR (Módulo C)
Hoy el Compliance Sentinel solo escanea el **texto** (HU7, RegEx en el nodo `Code in JavaScript1`).
La tesis pide que **Gemini analice visualmente la imagen** y **bloquee** la publicación si detecta un precio
o promoción incrustada en los píxeles (placa gráfica). El prompt actual le pide a la IA "no inventar precios",
pero **no existe un gate de compliance visual** que frene la publicación. Cierra el Módulo C. Es puro Gemini
(ya existe el nodo de visión), de esfuerzo acotado.

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

Cosas que funcionan pero no son 100% fieles a la letra de la tesis:

1. **Cifrado del token (HU2):** la tesis dice "credenciales **cifradas** en Google Sheets" (lo repite).
   Hoy el Page Token se guarda en **texto plano** en la hoja *Usuarios*. Para ser literal: cifrar (ej. AES con
   clave en `.env`) al guardar y descifrar al leer.
2. **HU3 en agenda:** el criterio dice "cada evento de publicación **o de gestión de agenda**". Hoy la validación
   corre al **crear** contenido, no al abrir la agenda (decisión de alcance consciente).
3. **HU9 desde BD + contacto:** la firma está **hardcodeada** en el nodo Code; la tesis sugiere leerla de la
   base de datos centralizada y sumar **hipervínculos de contacto**.
4. **Publish "última fila":** en el flujo *fresco*, publicar apunta al **último** post del usuario (el `append`
   de n8n no devuelve el `row_number` al crear). En uso normal es correcto; el caso raro (crear A, crear B,
   publicar A) queda fuera de alcance. El **"Retomar borrador"** sí es de fila exacta (row-aware).

---

## Roadmap propuesto

1. **HU8 (OCR de precios en imagen)** — mejor relación esfuerzo/cierre; completa el Módulo C. *(sin VPS)*
2. **HU5 (carruseles)** — más grande; completa el Módulo B. *(sin VPS)*
3. **Deudas técnicas** (cifrado del token, firma desde BD) si se busca rigor con el doc.
4. **Migración a VPS** (Docker + proxy inverso + SSL) — destraba **HU10, HU13, HU14** de una sola vez.
   Bloqueada por Oracle Cloud (rechazo de tarjetas virtuales); pendiente de resolver el medio de pago.

---

## Mapa rápido de los workflows (para ubicarse)

- **`Postly - Entrega Final Sprint 1 v2`** (id `VOgbHGLELJfRgVO5`, ~74 nodos) — workflow principal:
  onboarding, vinculación, validación, creación con IA, compliance, publicación y agenda.
- **`Postly - HU2 OAuth Callback`** (id `vy60xNtAvcVKRdAx`) — endpoint `/oauth-callback` que cierra el OAuth.
- **`Postly - Feedback Loop`** (inactivo) — base para HU14 (métricas).

Para el detalle operativo (cómo editar por API, variables de entorno, gotchas), ver
`memoria-claude/` en esta misma carpeta y el `CLAUDE.md` de la raíz del repo.
