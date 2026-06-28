---
name: postly-n8n-ops
description: "Cómo operar el n8n de Postly — API, arranque, $env, gotchas de edición"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 75b3d179-6c35-423c-88e9-068d5ba0fea8
---

Operación del n8n vivo de Postly (self-hosted, v2.15.1, local en la PC de Nico).

**Arranque:** `.\start-n8n.ps1` (en `C:\dev\Tesis`) carga todas las vars del `.env` al entorno del proceso y corre `n8n start`. Reemplaza el `$env:WEBHOOK_URL=...; n8n start` manual. Cualquier cambio en `.env` (token, flags) requiere reiniciar con este script.

**Editar workflows por API (sin tocar la UI):**
- Base `http://localhost:5678/api/v1`, header `X-N8N-API-KEY: <N8N_API_KEY del .env>`.
- Workflows vivos: **`VOgbHGLELJfRgVO5` = "Postly - Entrega Final Sprint 1 v2"** (principal, active) y **`sDIBkXAXzhZo76Ez` = "Postly - Feedback Loop"** (inactive). OJO: el principal NO se llama "main".
- `PUT /workflows/{id}` solo acepta `name, nodes, connections, settings(, staticData)`. Hay que **filtrar `settings`** a claves permitidas (p.ej. `executionOrder`); `binaryMode` la rechaza con 400.
- Activar: `POST /workflows/{id}/activate`.
- Editar por API **bumpea el versionId** → las pestañas del navegador abiertas quedan viejas y tiran "someone else just updated this workflow". Tras editar por API, **refrescar (F5)** la pestaña antes de tocar. Coordinar quién edita (API vs UI) para no pisarse.
- **⚠️ ENCODING — NO usar PowerShell `Get-Content` para leer el `.json` y re-PUTearlo.** PS 5.1 lo lee como ANSI (Windows-1252), no UTF-8, y corrompe TODOS los emojis/acentos del workflow (mojibake tipo `ðŸš€`, `Â¡Hola`, `QuÃ©`) al hacer el PUT. Pasó el 2026-06-28 y rompió todos los mensajes del bot. **Editar siempre con un script Node** (`fs.readFileSync(...,'utf8')` + `fetch` PUT, ambos UTF-8 safe). Script de referencia: GET/mutate-por-nombre-de-nodo/PUT. Si algo corrompió el texto, recuperar la base limpia con `git show "HEAD:workflows/<archivo>.json"` y re-aplicar los cambios solo con Node.
- El `.json` del repo trae un bloque `activeVersion` (snapshot viejo de solo-lectura) que **duplica los nodos** → editar por texto plano puede pegar en la copia equivocada o fallar por no-unicidad. Mutar **objetos de `wf.nodes` por `name`** (no string-replace global). El PUT solo manda los `nodes`/`connections` top-level.

**$env en expresiones:** n8n bloquea `$env` por defecto. Hace falta `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` en `.env` (ya puesto), sino tira "access to env vars denied".

**Vars de entorno agregadas (2026-06): `.env` (NO en git) — requieren reiniciar con `.\start-n8n.ps1`:**
- `POSTLY_ENC_KEY=<hex 32 bytes>` — clave AES-256-GCM del cifrado del token de Meta (HU2). Si se pierde, los tokens guardados quedan ilegibles → se arregla re-vinculando.
- `NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs` — habilita `require('crypto')` (cifrado del token) y `require('fs')` (buffer de carrusel HU5) en los Code nodes.

**Buffer de carrusel (HU5):** archivo local `C:/Users/Nico/AppData/Local/Temp/postly_carrusel_buffer.tsv` (vía `fs.appendFileSync`, serializado por el proceso Node). NO usar Google Sheets como buffer concurrente (clobberea). Ver [[postly-critical-path]].

**Rate limit Gemini:** free tier de gemini-2.5-flash topea en 20 requests (compartido por todo el proyecto). Mitigado con retry 4x35s en los nodos Gemini. Para demo fluida: habilitar billing en la API key.

**Estado workflows (2026-06-28):** principal `VOgbHGLELJfRgVO5` = 129 nodos (se agregó `HU5: Crear pendiente`). Pestañas `Config` (gid 1036323678, firma/contacto) y `CarruselBuffer` (gid 305649968, sin uso tras pivot a fs) en Postly_DB.

**Backups:** antes de parchear se bajan a `.backups/` (gitignored, pueden tener tokens viejos). Ver [[postly-critical-path]].
