# CLAUDE.md — Postly (Tesis n8n)

Contexto de proyecto para Claude Code. Se carga automáticamente al abrir este repo.
**Para el detalle completo, leer `docs/contexto/` (empezando por `ESTADO-Y-ROADMAP.md`).**

## Qué es

Postly: una **Consultora de Belleza Independiente (Mary Kay)** genera y publica contenido de Instagram/Facebook
conversando con un **bot de Telegram**. La IA (Gemini) genera el copy, un **Compliance Sentinel** valida reglas
legales (sin precios, firma obligatoria) y se publica vía **Meta Graph API**. Orquestado en **n8n**; persistencia
en **Google Sheets**.

`Telegram → n8n → Gemini → Compliance → Meta Graph API → Google Sheets`

> **La tesis `docs/Tesis Postly Bontorno Hassan.docx` es la FUENTE DE LA VERDAD.** No desviarse de lo documentado.

## Estado (14/14 HU ✅ — COMPLETO)

✅ HU1, HU2, HU3 (A) · HU4, **HU5**, HU6 (B) · HU7, HU8, HU9 (C) · **HU10**, HU11, HU12 (D) · **HU13**, **HU14** (E). **Los 5 módulos completos y validados e2e.**
✅ **HU13** (normalización de video / FFmpeg) — *validada e2e el 2026-07-02*: video → FFmpeg (`child_process` en Code node) fuerza 1080×1920/H.264/≤60s (pregunta si recortar cuando dura +60s) → frame → Gemini 3 copys (editables) → **Reel en IG** (con polling del contenedor) **+ video en FB**.
✅ **HU14** (métricas) — *validada e2e el 2026-06-30: Cron 24h trae likes/comentarios de Graph API, persiste en Sheets y se ven en Mi Agenda*.

**Extras (más allá de las 14 HU):** publicación en **Facebook** (imagen/carrusel/video), **sincronización desde Instagram** al abrir Mi Agenda, **métricas de ambas redes** en las tarjetas (`📷 IG` · `📘 FB`), **anti-duplicación** (dedup por callback_id + candado atómico `editMessageText` para carruseles), y **compliance de precios reforzado** (detecta `$`, "100 pesos", "cuesta X", "oferta", "2x1", %off… en los 3 flujos, al publicar) + CTA de contacto obligatorio en los 3 copys.

Las 3 deudas técnicas accionables (cifrado del token AES-256-GCM, gateo de agenda, firma desde BD) están saldadas.
Detalle: `docs/contexto/ESTADO-Y-ROADMAP.md`.

## Cómo operar n8n (IMPORTANTE)

> **2026-06-29: migración a VPS real COMPLETADA y OPERATIVA** (DonWeb, Docker + Caddy + SSL en
> `https://vps-6120781-x.dattaweb.com`). Es el entorno principal de producción: bot validado e2e
> respondiendo desde el VPS, credenciales reconectadas (Telegram/Gemini/Sheets), redirect URIs
> actualizados en Meta y Google Cloud Console, webhook de Telegram apuntando al VPS, workflows
> *Entrega Final* y *HU2 OAuth Callback* activos (*Feedback Loop* inactivo, base de HU14). El setup
> local + ngrok de abajo queda como referencia de desarrollo, **ya no es producción** (apagado).
> Detalle de la migración: `docs/contexto/memoria-claude/postly-vps-migration.md`.

- n8n self-hosted local (v2.15.1). Arranque: `.\start-n8n.ps1` (carga `.env` y levanta n8n).
- URL pública estable: ngrok dominio fijo `https://viewable-zombie-linked.ngrok-free.dev` → localhost:5678.
- **Editar workflows por la API**, no a mano: script Node que hace `GET /workflows/{id}` (header `X-N8N-API-KEY`),
  muta nodos/conexiones en JS, escribe el `.json` al repo y hace `PUT`. En el `PUT`, enviar `settings` solo con
  `{ executionOrder: "v1" }` (`binaryMode` da 400). Activar con `POST /workflows/{id}/activate`.
- Tras editar por API el versionId cambia → **refrescar (F5)** la pestaña de n8n antes de tocarla.

### Workflows (IDs en el VPS de producción)
- `0aclc0NlBheOGHvI` — **"Postly - Entrega Final Sprint 1 v2"** (principal, ~184 nodos). NO se llama "main". Se despliega con `scripts/deploy-main-workflow.mjs` (`N8N_API_KEY=<key> node scripts/deploy-main-workflow.mjs`).
- `QFo4nOvKD0BmrltV` — "Postly - HU2 OAuth Callback" (endpoint `/oauth-callback`).
- `E2Ot8wCDiuj8SZnK` / `Ig7Od1NzQu1zzkLQ` — sub-workflows "Publicar Post" / "Publicar Carrusel" (Cron HU10).
- `opWLm9uOQUebGmRD` — "Postly - Programador" (Cron cada 5 min, HU10).
- `OysyuGLsr13qSxWB` — "Postly - Feedback Loop" (Cron diario 10:00, HU14).
- *(IDs locales viejos, ya no productivos: principal `VOgbHGLELJfRgVO5`, OAuth `vy60xNtAvcVKRdAx`, Feedback `sDIBkXAXzhZo76Ez`.)*

### Gotchas
- Google Sheets read: usar `alwaysOutputData: true` para que "0 filas" no corte la rama. `sheetName.value` = gid **sin** prefijo (`"600115356"`).
- Si insertás un nodo que cambia `$json` (ej. un Sheets read), los nodos siguientes deben referenciar `$('Telegram Trigger').first().json...` en vez de `$json`.
- Switch v3.4: regla = `{ conditions: { options, conditions:[...], combinator } }` — NO doble-anidar.
- `$env` en expresiones requiere `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` en `.env`.
- **HU13 / FFmpeg:** el nodo Execute Command está deshabilitado; se ejecuta FFmpeg con `require('child_process')` desde un Code node (`NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs,child_process`). El binario está en `/usr/local/bin/ffmpeg` (bind-mount en docker-compose). En el Code sandbox NO existen `fetch` ni `URLSearchParams` (solo `this.helpers.httpRequest`); `setTimeout` sí (se usa para el polling del Reel). `ffprobe` no está — la duración se parsea de `ffmpeg -i ... -f null - 2>&1` con `indexOf('Duration: ')`.
- **Cloudinary desde Code:** subir con `body:{upload_preset,file:'data:...;base64,...'}` + header `content-type: application/x-www-form-urlencoded` + `json:true`. La opción `form:` da 400.

## Convenciones

- Se trabaja **directo sobre `main`** (proyecto chico, sin PRs).
- **Secretos (`.env`) nunca van a git.** La publicación usa el token **por-usuaria** de la hoja Usuarios (no `$env`).
- DB = Google Sheets `Postly_DB` (id `1b85sqw...`): hoja `Hoja 1` (posts, gid=0) y `Usuarios` (credenciales, gid=600115356).
