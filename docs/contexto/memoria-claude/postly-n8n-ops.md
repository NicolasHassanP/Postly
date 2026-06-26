---
name: postly-n8n-ops
description: "Cómo operar el n8n de Postly — API, arranque, $env, gotchas de edición"
metadata:
  node_type: memory
  type: reference
---

Operación del n8n vivo de Postly (self-hosted, v2.15.1, local en la PC de Nico).

**Arranque:** `.\start-n8n.ps1` (en `C:\dev\Tesis`) carga todas las vars del `.env` al entorno del proceso y corre `n8n start`. Cualquier cambio en `.env` (token, flags) requiere reiniciar con este script.

**Editar workflows por API (sin tocar la UI):**
- Base `http://localhost:5678/api/v1`, header `X-N8N-API-KEY: <N8N_API_KEY del .env>`.
- Workflows vivos: **`VOgbHGLELJfRgVO5` = "Postly - Entrega Final Sprint 1 v2"** (principal, active), **`vy60xNtAvcVKRdAx` = "Postly - HU2 OAuth Callback"** (callback OAuth) y **`sDIBkXAXzhZo76Ez` = "Postly - Feedback Loop"** (inactive). OJO: el principal NO se llama "main".
- Patrón usado en este proyecto: un script Node (`.mjs`) que baja el workflow vivo por API (`GET /workflows/{id}`), lo muta en JS (agrega/edita nodos y conexiones), lo escribe al repo y lo vuelve a subir con `PUT`. Evita romper el JSON a mano.
- `PUT /workflows/{id}` solo acepta `name, nodes, connections, settings(, staticData)`. Hay que **filtrar `settings`** a claves permitidas (enviar solo `{ executionOrder: "v1" }`); `binaryMode` lo rechaza con 400.
- Activar: `POST /workflows/{id}/activate`.
- Editar por API **bumpea el versionId** → las pestañas del navegador abiertas quedan viejas y tiran "someone else just updated this workflow". Tras editar por API, **refrescar (F5)** la pestaña antes de tocar. Coordinar quién edita (API vs UI) para no pisarse.

**$env en expresiones:** n8n bloquea `$env` por defecto. Hace falta `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` en `.env` (ya puesto), sino tira "access to env vars denied".

**Gotchas de nodos frecuentes:**
- Google Sheets read: poner **`alwaysOutputData: true`** si necesitás que el caso "0 filas" siga el flujo (sino la rama se corta).
- `sheetName.value` = gid **sin** prefijo (`"600115356"`, no `"gid=600115356"`).
- Telegram: tras insertar un nodo que cambia `$json` (ej. un Sheets read), los nodos siguientes que usaban `$json.message...` deben pasar a `$('Telegram Trigger').first().json.message...`.
- Switch v3.4: la regla es `{ conditions: { options, conditions:[...], combinator } }` — NO doble-anidar (`{conditions:{conditions:{...}}}`) o matchea todo en la salida 0.

Ver [[postly-critical-path]].
