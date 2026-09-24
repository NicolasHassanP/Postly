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

**Extras (más allá de las 14 HU):** publicación en **Facebook** (imagen/carrusel/video), **sincronización desde Instagram** al abrir Mi Agenda, **métricas de ambas redes** en las tarjetas (`📷 IG` · `📘 FB`), **anti-duplicación** (dedup por callback_id + candado atómico `editMessageText` para carruseles), y **compliance de precios reforzado** (detecta `$`, "100 pesos", "cuesta X", "oferta", "2x1", %off… en los **4** flujos que publican, al publicar).

> **2026-09-19: el CTA obligatorio se RETIRÓ de los 4 prompts.** Antes, la regla 4 exigía que
> los 3 copys cerraran con una invitación a contactar. Las Pautas de la marca consideran
> comercial todo mensaje que invite a comprar o a contactar, de modo que el generador producía,
> en cada publicación de feed, justo la infracción que el Centinela existe para evitar (§5.4 de
> la tesis). `scripts/fix-cta-mensaje-comercial.mjs` invierte la regla. Medido en el Anexo E.12:
> **15/15 opciones con solicitud de contacto antes, 0/15 después.**

✅ **Análisis de valores límite del Centinela** (2026-09-14): 25 casos diseñados regla por regla sobre el detector
determinista expusieron 4 defectos corregidos (plurales, `precio es N`, espaciado, y la **divergencia de HU10**) y
2 límites inherentes al enfoque léxico. Documentado en §5.1 y en el **Anexo E** de la tesis (que antes se
referenciaba 8 veces y no existía). Datos y harness en `avance/`.

Las 3 deudas técnicas accionables (cifrado del token AES-256-GCM, gateo de agenda, firma desde BD) están saldadas.
Detalle: `docs/contexto/ESTADO-Y-ROADMAP.md`.

## Cómo operar n8n (IMPORTANTE)

> **2026-09-14: el VPS quedó dado de baja y NO se reactiva.** El entorno de trabajo es **n8n local
> expuesto por ngrok**. La migración al VPS de DonWeb (2026-06-29) sí ocurrió y sobre ella se validaron
> e2e las 14 HU —por eso la tesis la documenta en pretérito y en el Anexo B.1—, pero el servidor ya no
> está contratado. Si algún día se reactiva, los scripts aceptan `N8N_BASE_URL` y no hardcodean host.
> Detalle histórico de la migración: `docs/contexto/memoria-claude/postly-vps-migration.md`.

- n8n self-hosted local (v2.15.1). Arranque: `.\start-n8n.ps1` (carga `.env` y levanta n8n).
- URL pública estable: ngrok dominio fijo → localhost:5678. **El host no va en el repo** (es un túnel a
  una máquina personal y el repo es público): vive en `.env` como `N8N_BASE_URL`.
- **La API key es por instancia** (es un JWT firmado con el secreto de ese n8n): la del VPS da 401 en local.
  La local está en `.env` como `N8N_API_KEY_LOCAL`; se genera en *Settings → n8n API → Create an API key*.
  Conviene mandar el header `ngrok-skip-browser-warning: true`.
- **Bajar ngrok cuando no se usa.** Los `webhookId` están en los workflows del repo público y los webhooks
  de n8n no tienen autenticación: mientras el túnel esté arriba, cualquiera que lea el repo puede
  dispararlos. El riesgo real es ejecuciones no deseadas y quema de cuota de Gemini, no robo de cuentas
  (los tokens por-usuaria están cifrados en la hoja y el webhook no los expone).
- **Editar workflows por la API**, no a mano: script Node que hace `GET /workflows/{id}` (header `X-N8N-API-KEY`),
  muta nodos/conexiones en JS, escribe el `.json` al repo y hace `PUT`. En el `PUT`, enviar `settings` solo con
  `{ executionOrder: "v1" }` (`binaryMode` da 400). Activar con `POST /workflows/{id}/activate`.
- Tras editar por API el versionId cambia → **refrescar (F5)** la pestaña de n8n antes de tocarla.

### Workflows (IDs en la instancia LOCAL, que es la que se usa)
- `VOgbHGLELJfRgVO5` — **"Postly - Entrega Final Sprint 1 v2"** (principal, **195 nodos**, ACTIVO). NO se llama "main".
- `vy60xNtAvcVKRdAx` — "Postly - HU2 OAuth Callback" (endpoint `/oauth-callback`, ACTIVO).
- `6tnvgjAZT6MajxcU` — "Postly - Programador" (Cron cada 5 min, HU10). **Inactivo a propósito:** publica de
  verdad, y activarlo con filas pendientes de fecha pasada publica de inmediato. Revisar la hoja antes.
- `k2EpyyF5cY7w5tC5` / `y9qgQeFhe7gAFzla` — sub-workflows "Publicar Post" / "Publicar Carrusel" (los invoca
  el Programador; no necesitan estar activos).
- `sDIBkXAXzhZo76Ez` — "Postly - Feedback Loop" (Cron diario 10:00, HU14). Tiene 7 nodos = **versión vieja**;
  el repo tiene la reescritura de HU14 (5 nodos), sin sincronizar.
- *(IDs del VPS, ya inexistentes: principal `0aclc0NlBheOGHvI`, OAuth `QFo4nOvKD0BmrltV`, Programador
  `opWLm9uOQUebGmRD`, sub-workflows `E2Ot8wCDiuj8SZnK`/`Ig7Od1NzQu1zzkLQ`, Feedback `OysyuGLsr13qSxWB`.)*

### Desplegar al local
`scripts/deploy-main-workflow.mjs` apuntaba al VPS y quedó **obsoleto**. Usar:
- `node scripts/probe-local-n8n.mjs` — solo lectura: qué workflows hay y diff del principal contra el repo.
- `node scripts/deploy-local-n8n.mjs [--deploy]` — despliega el JSON del repo al local. **Credenciales y
  `webhookId` son por instancia**, así que arma un mapa `tipo::nombre → id` leyendo las credenciales que ya
  usan los nodos locales y reescribe las referencias del repo; y conserva los `webhookId` locales, para que
  el webhook de Telegram ya registrado siga siendo válido. Respalda el estado local antes de escribir.
- `node scripts/import-local-workflows.mjs [--deploy]` — crea el Programador y los sub-workflows si faltan,
  remapeando las referencias entre ellos.
- `node scripts/fix-compliance-patterns.mjs [--deploy]` — set canónico de patrones del Centinela en los 4 nodos.

### Gotchas
- Google Sheets read: usar `alwaysOutputData: true` para que "0 filas" no corte la rama. `sheetName.value` = gid **sin** prefijo (`"600115356"`).
- Si insertás un nodo que cambia `$json` (ej. un Sheets read), los nodos siguientes deben referenciar `$('Telegram Trigger').first().json...` en vez de `$json`.
- Switch v3.4: regla = `{ conditions: { options, conditions:[...], combinator } }` — NO doble-anidar.
- `$env` en expresiones requiere `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` en `.env`.
- **HU13 / FFmpeg:** el nodo Execute Command está deshabilitado; se ejecuta FFmpeg con `require('child_process')` desde un Code node (`NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs,child_process`). El código lo invoca **por nombre** (`ffmpeg ...`), no por ruta absoluta, así que resuelve por PATH: en el VPS era el bind-mount de `/usr/local/bin/ffmpeg`, en local es el `ffmpeg.exe` del PATH de Windows. En el Code sandbox NO existen `fetch` ni `URLSearchParams` (solo `this.helpers.httpRequest`); `setTimeout` sí (se usa para el polling del Reel). `ffprobe` no está — la duración se parsea de `ffmpeg -i ... -f null - 2>&1` con `indexOf('Duration: ')`.
- **HU13 en local (Windows):** los temporales del código son `/tmp/vid_*.mp4`, y Node en Windows resuelve `/tmp` como `C:\tmp`. **Esa carpeta tiene que existir** o `fs.writeFileSync` falla con ENOENT.
- **Compliance de precios:** el set de patrones está duplicado en **4** nodos (`Code in JavaScript1` HU7/HU9, `HU5: Pub preparar` carrusel, `Sched: Procesar` HU10, `Video: pub publicar` HU13). Si se toca uno, tocar los cuatro: `Sched: Procesar` tenía un set propio más débil y HU10 dejaba pasar contenido que el flujo inmediato bloqueaba. Para eso está `scripts/fix-compliance-patterns.mjs`, que los unifica y es idempotente.
- **Patchear regex por script:** NO usar heredoc de bash. Python interpreta `\b` como escape válido (backspace 0x08) y lo convierte en carácter de control, dejando la regla muerta, mientras deja `\d`/`\s` intactos. Usar la herramienta de edición de archivos, `String.raw` o `r"""`. Y validar (`node --check`, o correr el harness) **antes** de desplegar.
- **Cloudinary desde Code:** subir con `body:{upload_preset,file:'data:...;base64,...'}` + header `content-type: application/x-www-form-urlencoded` + `json:true`. La opción `form:` da 400.

## Convenciones

- Se trabaja **directo sobre `main`** (proyecto chico, sin PRs).
- **Secretos (`.env`) nunca van a git.** La publicación usa el token **por-usuaria** de la hoja Usuarios (no `$env`).
- DB = Google Sheets `Postly_DB` (id `1b85sqw...`): hoja `Hoja 1` (posts, gid=0) y `Usuarios` (credenciales, gid=600115356).
