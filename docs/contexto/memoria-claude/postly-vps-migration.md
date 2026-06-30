---
name: postly-vps-migration
description: "Migración a VPS real (DonWeb) — intentos fallidos (Oracle, Azure, DigitalOcean) y despliegue exitoso con Docker+n8n+Caddy"
metadata:
  node_type: memory
  type: project
---

Migración del n8n local (PC + ngrok) a un **VPS real con IP fija**, el paso que la tesis define como NFR "innegociable" y que destraba HU10 (Cron a futuro) y HU14 (métricas 24h) — HU13 (FFmpeg) además necesita el VPS pero falta implementarla aparte. Retomado el 2026-06-29 después de quedar pendiente por el bloqueo de tarjeta de Oracle (ver [[postly-critical-path]]).

## Intentos que NO funcionaron (documentados a propósito — útiles para la defensa de tesis)

**1. Oracle Cloud Free Tier — descartado de nuevo.** Rechaza tarjetas virtuales prepagas (MercadoPago/Lemon) en la verificación, igual que en el intento original (ver [[postly-critical-path]]). Sin tarjeta real/familiar, camino cerrado.

**2. Microsoft Azure for Students — agotado, contradicción estructural.** Se consiguió el crédito de USD 100 (sin tarjeta) vía GitHub Student Developer Pack → beneficio "Azure for Students". Pero:
- La cuenta solo tiene **cuota de cómputo (vCPU) asignada en una región** (Chile Central), y esa región está **bloqueada para desplegar recursos** por una política interna de Azure ("best available regions" — error `RequestDisallowedByAzure`, sin excepción posible salvo contactar soporte).
- En regiones sí desplegables (East US, Brazil South) la cuota de la familia B (burstable, incluidos los tamaños "gratuitos") está en **cero**, y pedir aumento de cuota está **bloqueado de raíz** para este tipo de suscripción ("la suscripción no es válida para un aumento... soporte solo para suscripciones de pago por uso").
- Conclusión: tenés cuota donde no podés desplegar, y podés desplegar donde no tenés cuota. Sin tarjeta (que habilitaría pago por uso y el aumento de cuota), no hay salida dentro de Azure for Students.

**3. DigitalOcean — rechazo categórico de tarjetas prepagas.** Crédito de USD 200 vía GitHub Student Pack (con un bug conocido y reportado por la comunidad desde mayo 2026 en el flujo de redención — la página `/github-students` redirige a la home). Se consiguió entrar a la cuenta por el link directo de registro, pero al cargar la tarjeta virtual, DO la **rechaza explícitamente por ser prepaga** (no es un check de fraude como Oracle, es una política declarada).

**Patrón identificado:** las tarjetas virtuales prepagas (MercadoPago/Lemon) chocan contra **cualquier proveedor cloud internacional grande** — no fue mala suerte puntual con Oracle, es estructural. PayPal, una tarjeta de débito bancaria real, o una tarjeta de un familiar habrían esquivado el problema, pero ninguna estaba disponible para este proyecto.

## Solución que funcionó: DonWeb (hosting argentino)

Proveedor argentino, cobra en **pesos** vía Mercado Pago, transferencia bancaria o efectivo (Rapipago/Pago Fácil) — cero fricción de tarjeta internacional. Plan **Cloud Server: 2 vCPU / 2 GB RAM / 20 GB SSD**, ~$7.469 ARS/mes.

- Requiere **verificación de identidad** (no de medio de pago) vía *Persona*: escaneo de DNI + selfie en vivo, aprobación instantánea. La puede hacer cualquiera con acceso a la cuenta.
- Imagen elegida: **"Instalación Mínima Con UEFI"**, Ubuntu 24.04 LTS, sin panel de control (cPanel/CloudPanel/etc.) — limpio para instalar Docker manualmente.
- Autenticación: usuario `root` + contraseña generada por el wizard (no SSH key, por simplicidad).
- DonWeb asigna automáticamente un **hostname fijo con DNS ya resuelto** (`vps-6120781-x.dattaweb.com`, A record IPv4 + AAAA IPv6) — se usó ese en vez de registrar un dominio nuevo.

## Detalle del despliegue (Docker + n8n + Caddy)

**Servidor:** ver credenciales de acceso en la memoria de engram `infra/donweb-vps` (host, IP, puerto SSH). Importante: `sshd` escucha simultáneamente en el puerto 22 **y** en un puerto custom asignado por DonWeb — se permitieron ambos en `ufw` para no arriesgar quedar bloqueado afuera.

**Stack instalado** (`/opt/n8n/`), usando como base la skill `n8n-self-hosting` del repo, modo **single** (SQLite, sin queue — bajo tráfico, un solo bot):
- Docker Engine 29.6.1 + Compose v5.2.0 (`get.docker.com`).
- `docker-compose.yml`: servicios `caddy` (80/443 públicos) + `n8n` (sin puerto publicado, solo accesible vía Caddy). Dos desvíos deliberados respecto a la plantilla estándar de la skill (que por seguridad defaultea distinto):
  - `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` (no `true`) — los Code nodes de Postly leen `$env` (token Meta, claves).
  - Agregado `NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs` — necesario para el cifrado AES-256-GCM del token (HU2) y el buffer de carrusel en archivo (HU5).
  - Se agregaron al `environment` del servicio n8n las variables propias del proyecto (`POSTLY_ENC_KEY`, `META_ACCESS_TOKEN`, `META_APP_ID`, `META_APP_SECRET`, `META_CONFIG_ID`, `META_PAGE_ID`, `IG_BUSINESS_ID`), leídas desde `.env`.
- `Caddyfile`: tal cual la plantilla de la skill (domain-free, usa `{$N8N_SUBDOMAIN}.{$N8N_DOMAIN}` desde `.env`).
- `.env`: `N8N_ENCRYPTION_KEY` se generó **fresca en el servidor** con `openssl rand -base64 32` (regla de seguridad de la skill: nunca reusar una clave de cifrado de n8n entre instancias). En cambio, `POSTLY_ENC_KEY` y las 6 variables `META_*`/`IG_BUSINESS_ID` se **copiaron tal cual del `.env` local** (NO se regeneraron) — `POSTLY_ENC_KEY` ya cifró tokens reales guardados en la hoja *Usuarios* de Sheets, y las `META_*` son credenciales reales de la App, no secretos para inventar.

**Gotcha de DNS:** `getent hosts <hostname>` devolvía solo el registro IPv6 (AAAA) y parecía que faltaba el A record (IPv4) — preocupante porque Docker no publica puertos en IPv6 por default. Se confirmó con `getent ahostsv4 <hostname>` que el A record sí existía (glibc prioriza IPv6 en la salida combinada de `getent hosts`); no hizo falta ningún ajuste extra.

**Verificación (todo OK):** `docker compose ps` (ambos contenedores `Up`) → `docker compose exec n8n wget -qO- http://localhost:5678/healthz` (`{"status":"ok"}` interno) → `docker compose logs caddy | grep "certificate obtained"` (cert Let's Encrypt emitido para el hostname) → `curl https://<hostname>/healthz` desde afuera (`{"status":"ok"}` público). Cuenta *owner* creada en la primera visita a `https://vps-6120781-x.dattaweb.com`.

**Workflows:** los 3 `.json` de `workflows/` se importaron manualmente vía la UI (Build a workflow → ⋯ → Import from File) — las credenciales **no viajan en el JSON**, hay que recrearlas en la instancia nueva.

## Cierre de la migración (COMPLETADA — 2026-06-29)

Todos los pasos pendientes se ejecutaron y el bot quedó validado e2e respondiendo desde el VPS (flujo de nueva publicación pidiendo fotos OK):

1. ✅ **Credenciales recreadas** en la instancia del VPS:
   - **Telegram** (Bot Token) — recuperado de BotFather (`/mybots → API Token`; OJO: el valor que muestra n8n en una credencial ya guardada es un placeholder `__n8n_BLANK_VALUE_...`, NO el token real — no se puede copiar de una instancia a otra).
   - **Google Gemini (PaLM) API** — API key propia.
   - **Google Sheets OAuth2** — con el redirect URI `https://vps-6120781-x.dattaweb.com/rest/oauth2-credential/callback` ya agregado en Google Cloud Console.
2. ✅ **Credenciales mapeadas por la API del VPS** (no a mano): 72 nodos en total (principal: 43 Telegram + 19 Sheets + 5 Gemini = 67; Feedback Loop: 3; HU2 OAuth Callback: 2). IDs de credencial en el VPS: Telegram `IIn3wwgzKv4iGZkP`, Gemini `QElexXPnmOFhjG7S`, Sheets `4iefueJJLW6dNhpt`. **Gotcha:** al importar por la UI, n8n borra las referencias de credencial (quedan en 0); hubo que reconstruirlas, no remapear. Además el workflow principal importado estaba 1 nodo desactualizado (faltaba `HU5: Crear pendiente`, 128 vs 129) → se pisó con la versión completa del repo. IDs de workflow en el VPS: principal `0aclc0NlBheOGHvI`, Feedback Loop `OysyuGLsr13qSxWB`, HU2 OAuth `QFo4nOvKD0BmrltV`.
3. ✅ **Meta App** actualizada: `https://vps-6120781-x.dattaweb.com/webhook/oauth-callback` en *Valid OAuth Redirect URIs*.
4. ✅ **Webhook de Telegram** apuntando al VPS — se registra automáticamente al activar el workflow con Telegram Trigger.
5. ✅ **Workflows activados**: *Entrega Final* y *HU2 OAuth Callback* activos; *Feedback Loop* queda inactivo (base de HU14).
6. ✅ **Instancia local apagada** (`start-n8n.ps1` + ngrok).

**Gotcha al editar por API:** si la pestaña del workflow está abierta en la UI con una versión vieja cacheada, al tocarla la guarda encima y revierte el PUT (nos pasó: el principal volvió a 128 nodos / 0 credenciales). Cerrar la pestaña o F5 antes; e idealmente PUT + activate en una sola corrida.

Ver [[postly-n8n-ops]] (arranque/edición del n8n local, ya obsoleto como producción tras esta migración) y [[postly-meta-setup]] (config original de la App de Meta).
