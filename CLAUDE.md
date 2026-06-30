# CLAUDE.md — Postly (Tesis n8n)

Contexto de proyecto para Claude Code. Se carga automáticamente al abrir este repo.
**Para el detalle completo, leer `docs/contexto/` (empezando por `ESTADO-Y-ROADMAP.md`).**

> ⚠️ **ACCIÓN PENDIENTE (asignada a Nico, abierta desde 2026-06-29):** se migró n8n a un VPS real
> (DonWeb) pero la migración **no está cerrada**. Si estás arrancando una sesión nueva y esto sigue
> sin resolverse, **avisale al usuario de esto antes de ponerte a hacer cualquier otra cosa** —
> es la tarea con prioridad sobre todo lo demás en este repo hasta que se cierre. Detalle completo
> y paso a paso en [`docs/contexto/memoria-claude/postly-vps-migration.md`](docs/contexto/memoria-claude/postly-vps-migration.md)
> (sección "Pendiente — próximos pasos"). Resumen: reconectar credenciales (Telegram/Sheets/Gemini)
> en la nueva instancia, actualizar redirect URIs en Meta App y Google Cloud Console, re-registrar
> el webhook de Telegram, activar los workflows, y apagar la instancia local. Una vez resuelto,
> borrar este bloque.

## Qué es

Postly: una **Consultora de Belleza Independiente (Mary Kay)** genera y publica contenido de Instagram/Facebook
conversando con un **bot de Telegram**. La IA (Gemini) genera el copy, un **Compliance Sentinel** valida reglas
legales (sin precios, firma obligatoria) y se publica vía **Meta Graph API**. Orquestado en **n8n**; persistencia
en **Google Sheets**.

`Telegram → n8n → Gemini → Compliance → Meta Graph API → Google Sheets`

> **La tesis `docs/Tesis Postly Bontorno Hassan.docx` es la FUENTE DE LA VERDAD.** No desviarse de lo documentado.

## Estado (11/14 HU)

✅ HU1, HU2, HU3 (Módulo A) · HU4, **HU5**, HU6 (B, **completo**) · HU7, HU8, HU9 (C, **completo**) · HU11, HU12 (D).
✅ HU5 (carruseles) — *validada e2e el 2026-06-28: publica, edita y guarda en Sheets*.
❌ HU10, HU13, HU14 — *requieren migración a VPS (Cron/FFmpeg 24/7)*.
Las 3 deudas técnicas accionables (cifrado del token AES-256-GCM, gateo de agenda, firma desde BD) están saldadas.
Detalle: `docs/contexto/ESTADO-Y-ROADMAP.md`.

## Cómo operar n8n (IMPORTANTE)

> **2026-06-29: migración a VPS real completada** (DonWeb, Docker + Caddy + SSL en
> `vps-6120781-x.dattaweb.com`). Pasa a ser el entorno principal, reemplazando el setup local + ngrok.
> Pendiente: reconectar credenciales y redirect URIs — detalle paso a paso en
> `docs/contexto/memoria-claude/postly-vps-migration.md`. El setup local de abajo queda como
> referencia para desarrollo, ya no es el entorno de producción.

- n8n self-hosted local (v2.15.1). Arranque: `.\start-n8n.ps1` (carga `.env` y levanta n8n).
- URL pública estable: ngrok dominio fijo `https://viewable-zombie-linked.ngrok-free.dev` → localhost:5678.
- **Editar workflows por la API**, no a mano: script Node que hace `GET /workflows/{id}` (header `X-N8N-API-KEY`),
  muta nodos/conexiones en JS, escribe el `.json` al repo y hace `PUT`. En el `PUT`, enviar `settings` solo con
  `{ executionOrder: "v1" }` (`binaryMode` da 400). Activar con `POST /workflows/{id}/activate`.
- Tras editar por API el versionId cambia → **refrescar (F5)** la pestaña de n8n antes de tocarla.

### Workflows
- `VOgbHGLELJfRgVO5` — **"Postly - Entrega Final Sprint 1 v2"** (principal, ~129 nodos). NO se llama "main".
- `vy60xNtAvcVKRdAx` — "Postly - HU2 OAuth Callback" (endpoint `/oauth-callback`).
- `sDIBkXAXzhZo76Ez` — "Postly - Feedback Loop" (inactivo; base de HU14).

### Gotchas
- Google Sheets read: usar `alwaysOutputData: true` para que "0 filas" no corte la rama. `sheetName.value` = gid **sin** prefijo (`"600115356"`).
- Si insertás un nodo que cambia `$json` (ej. un Sheets read), los nodos siguientes deben referenciar `$('Telegram Trigger').first().json...` en vez de `$json`.
- Switch v3.4: regla = `{ conditions: { options, conditions:[...], combinator } }` — NO doble-anidar.
- `$env` en expresiones requiere `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` en `.env`.

## Convenciones

- Se trabaja **directo sobre `main`** (proyecto chico, sin PRs).
- **Secretos (`.env`) nunca van a git.** La publicación usa el token **por-usuaria** de la hoja Usuarios (no `$env`).
- DB = Google Sheets `Postly_DB` (id `1b85sqw...`): hoja `Hoja 1` (posts, gid=0) y `Usuarios` (credenciales, gid=600115356).
