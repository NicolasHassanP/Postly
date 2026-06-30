---
name: postly-hu10-scheduling
description: "HU10 (programación a futuro / Cron) — arquitectura, IDs de workflows en VPS y decisiones de diseño"
metadata: 
  node_type: memory
  type: project
  originSessionId: 841cf4f8-9cd8-4ca6-b962-60c8d96ca038
---

Implementación de HU10 ("Programación Asincrónica de Posteos / Cron Scheduling", Módulo D de la tesis). Arrancada 2026-06-29 tras cerrar la migración a VPS (ver [[postly-vps-migration]]). Alcance v1 acordado: **solo imagen única** (carrusel = fast-follow).

## Arquitectura (recomendación aprobada por Nico)
- Columna nueva en la hoja de posts (`gid=0`): **`Fecha_Programada`** (al final, tras `Metricas_Enviadas`) — timestamp ISO objetivo. La creó Nico a mano.
- Nuevo valor de `Status` = **`Programado`** (NO reusar `Pendiente`, que ya lo usa HU5 para borradores de carrusel → colisión).
- **Sub-workflow `Postly - Publicar Post`** (VPS id `E2Ot8wCDiuj8SZnK`): inputs `UserID, ImageURL, Caption, row_number`. Replica la cadena probada del flujo principal: Buscar usuario (Usuarios, filtra `TelegramUserID`) → Descifrar credenciales (AES-256-GCM con `$env.POSTLY_ENC_KEY`) → IG-Crear contenedor (`/media`) → Wait 5s → IG-Publicar (`/media_publish`) → Permalink → PP Salida (devuelve `ok,PostID_IG,permalink,UserID,row_number`). Solo usa credencial Sheets.
- **Workflow Cron `Postly - Programador`** (VPS id `opWLm9uOQUebGmRD`, INACTIVO): Schedule cada 5 min → Leer programados (Sheets filtra `Status=Programado`, `alwaysOutputData:true`) → Filtrar vencidos (Code: `Fecha_Programada <= now`) → Publicar (sub-wf, mode `each`, `onError:continueErrorOutput`) → éxito: Marcar Publicado + Telegram ✅ / error: Marcar Fallido + Telegram ⚠️. La notificación saca el chat id de `posts.UserID`.

## Decisión clave
El caption final (compliance HU7-9 + firma) hoy se arma **al publicar** (nodo `Code in JavaScript1`). Para lo agendado, **el compliance+firma se aplican AL MOMENTO DE AGENDAR (paso 4)** y se guardan en `Copy_Final`; el Cron publica contenido ya aprobado, NO re-corre compliance.

## Estado — HU10 imagen única COMPLETA y validada e2e (2026-06-30)
1. ✅ Columna `Fecha_Programada`. 2. ✅ Sub-workflow `Publicar Post` (`E2Ot8wCDiuj8SZnK`). 3. ✅ Cron `Programador` (`opWLm9uOQUebGmRD`, activo, cada 5 min). 4. ✅ Botón "🗓 Programar" en el principal (`0aclc0NlBheOGHvI`, 129→141 nodos).
- **Validado e2e por el bot**: agendar desde Telegram → fila `Programado` → el Cron publicó al llegar la hora (PostID real, fila→`Publicado`, push Telegram OK). Commits: `9f0459b` (sub-wf+cron), `4b06e74` (paso 4).
- Confirmado: offset `-03:00` en `Fecha_Programada` resuelve el timezone; `posts.UserID` == chat id de Telegram; el Cron tiene lag de hasta ~5 min (poll), es por diseño y alcanza para la tesis.
- **Estado conversacional**: `$getWorkflowStaticData('global')['schedulePending_'+chatId]` (set al tocar `prog_*`, check al llegar texto), mismo patrón que `editPending_` de HU5. El texto se intercepta en `Es Imagen?`(no-foto) → `Sched: Check pendiente` antes del flujo de edición.

## Gotchas
- **n8n VPS tiene concepto de "publicar"**: un workflow activo NO puede referenciar un sub-workflow en borrador. Activar/publicar primero el sub-workflow (POST /workflows/{id}/activate sirve aunque solo tenga Execute Workflow Trigger).
- El PUT del principal por API dejó el JSON del repo alineado con el VPS (más compacto, ids de credencial del VPS) — diff grande pero funcional, validado e2e.

## Carruseles agendados — COMPLETO y validado e2e (2026-06-30, commit `bffc51a`)
- Sub-workflow **`Postly - Publicar Carrusel`** (`Ig7Od1NzQu1zzkLQ`): crea hijos (`is_carousel_item`) → contenedor `CAROUSEL` → `media_publish` → permalink. Réplica de la cadena de HU5.
- Cron: IF **`¿Carrusel?`** (`Carousel_URLs` notEmpty) ramifica a Publicar Carrusel vs Publicar Post; ambos confluyen en NoOp **`Resultado OK`**/**`Resultado Fallo`** → Marcar Publicado/Fallido + notificación.
- Principal: botón `progCar_<gid>_<n>` en `HU5: Tono 1/2/3` + `HU5: Reconfirmar`. `Sched: Procesar` para carrusel lee `store['carousel_'+gid].copys[n-1]` (refleja la edición de `HU5: Aplicar edición`) y guarda **`Carousel_URLs`** (1 URL **por línea**) en la fila.

## Gotchas adicionales (de la sesión de carruseles)
- **n8n estripa las comillas** de `$('Nodo')` cuando el nombre es identificador JS válido (`PubOK` → `$(PubOK)` inválido → chat_id vacío). Usar nombres **con espacio** (`Resultado OK`) las conserva.
- Para hacer **merge de dos ramas** preservando el pairing (y que `$('Nodo').item` resuelva), usar **NoOp**, NO un Code `return $input.all()` (este último da "Invalid output format").
- `Carousel_URLs`: separar por **salto de línea** (no coma) para que Sheets las muestre/abra individualmente. (Las URLs de Cloudinary acá no tienen comas, pero newline es más robusto.)
- Regresiones de migración que aparecieron probando carruseles (ya fixeadas): ver [[postly-vps-migration]] — buffer `/tmp/`, OAuth→VPS, schema vacío en `HU5: Crear pendiente`.

## PENDIENTE del proyecto
- Última HU: **HU13 (FFmpeg)** — normalización de video. Necesita FFmpeg en el container del VPS (SSH/Docker). Ver [[postly-hu14-metrics]] para el estado general (13/14).
