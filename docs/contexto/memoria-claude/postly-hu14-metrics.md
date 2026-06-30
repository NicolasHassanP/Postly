---
name: postly-hu14-metrics
description: "HU14 (métricas de engagement / Feedback Loop) — reescritura del workflow, diseño y validación e2e"
metadata: 
  node_type: memory
  type: project
  originSessionId: 841cf4f8-9cd8-4ca6-b962-60c8d96ca038
---

HU14 ("Consulta de Métricas de Engagement y Bucle de Retroalimentación", Módulo E). Implementada y validada e2e el 2026-06-30, tras [[postly-hu10-scheduling]]. Vas 13/14 HU; queda solo HU13 (FFmpeg) + carruseles agendados (fast-follow de HU10).

## Qué se hizo
El workflow `Postly - Feedback Loop` (VPS id `OysyuGLsr13qSxWB`) estaba viejo/bugueado (hecho al inicio, nunca retocado): capturaba mal las métricas (parseaba formato *insights* pero pedía `?fields=`), no persistía Likes/Comments (solo `Metricas_Enviadas`), bug de `row_number` (`.first()`), y token global `$env`. Se **reescribió entero** (5 nodos) y se activó:
1. **Schedule Trigger** diario 10:00 (cumple ≥24h).
2. **Leer publicados** (Sheets gid=0, `Status=Publicado`, `alwaysOutputData`).
3. **Leer usuarios** (Sheets Usuarios, todas).
4. **Traer métricas** (Code, run-once-all): arma mapa `TelegramUserID→token` descifrando AES-256-GCM, y por cada post con `PostID_IG` hace `await this.helpers.httpRequest` GET `graph.facebook.com/v19.0/{PostID_IG}?fields=like_count,comments_count` con el token **por-usuaria**. Errores por post se saltean (quedan `N/D`), no rompe la corrida. Devuelve `{row_number, Likes, Comments}`.
5. **Guardar métricas** (Sheets update por `row_number`): `Likes`, `Comments`, `Metricas_Enviadas=Si`.

También se modificó el nodo **`Armar tarjetas`** del workflow principal (`0aclc0NlBheOGHvI`) para que "Mi Agenda" muestre `❤️ likes · 💬 comments` en los posts publicados.

## Decisiones de diseño
- **Token por-usuaria** (descifrado), no `$env` global → multi-tenant.
- **Refresco recurrente** (no one-shot): cada corrida actualiza los contadores; la lectura es por **Mi Agenda** (pull). Se quitó el push de "reporte" del boceto viejo.
- **Patrón robusto sin pairing**: todo el join posts+usuarias + HTTP se hace en un solo Code node con `this.helpers.httpRequest` (evita la fragilidad de pairing a través de lookups filtrados / httpRequest).
- IG-only (solo se guarda `PostID_IG`); la "normalización IG/FB" queda trivialmente satisfecha.

## Validación
Corrida manual: 20 posts publicados procesados; un post de prueba con 1 like + 1 comentario (agregados por Nico) se reflejó correcto; posts viejos sin resolución → `N/D` sin romper. Mi Agenda mostró los íconos con número. Commit `d314299`.

## Gotcha
- `this.helpers.httpRequest` + `crypto` funcionan en el Code node del VPS (requiere `NODE_FUNCTION_ALLOW_BUILTIN=crypto` y helpers built-in, ya seteado — ver [[postly-vps-migration]]).
- Algunos `PostID_IG` viejos devuelven error de Meta (token/cuenta distinta) → `N/D`; es esperado.
- **Columna `Reach`: placeholder sin uso.** HU14 v1 solo trae `like_count` + `comments_count`; nada escribe ni lee `Reach` (solo aparece en los `schema` de los nodos). Para poblarla habría que extender HU14 con el endpoint `/{ig-media-id}/insights?metric=reach` (frágil con media viejo). Decisión pendiente de Nico (dejarla / borrarla / hacerla funcionar).
- **Gemini free tier = 20 requests/día** (`gemini-2.5-flash`). Se agota rápido probando; para una demo fluida (defensa) conviene habilitar billing en la API key.
