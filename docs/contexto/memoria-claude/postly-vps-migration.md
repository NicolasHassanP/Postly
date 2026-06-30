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

## Pendiente — próximos pasos (para Nico)

1. **Recrear las 3 credenciales** en la nueva instancia (no se migran automáticamente):
   - **Telegram** (Bot Token) — Nico tiene el token original.
   - **Google Gemini (PaLM) API** — evaluar usar una API key **propia** en vez de la compartida (la de Nico venía con la cuota free agotada, ver [[postly-n8n-ops]]); así cada uno tiene sus 20 req/día separados.
   - **Google Sheets OAuth2** — **antes** de crear esta credencial, agregar en Google Cloud Console (Authorized redirect URIs) la nueva URL: `https://vps-6120781-x.dattaweb.com/rest/oauth2-credential/callback`. Si no, el OAuth falla con redirect_uri_mismatch.
2. **Mapear** esas 3 credenciales en los nodos correspondientes de los 3 workflows ya importados.
3. **Actualizar la Meta App** (developers.facebook.com): agregar `https://vps-6120781-x.dattaweb.com/webhook/oauth-callback` en *Valid OAuth Redirect URIs*, reemplazando el de ngrok (`viewable-zombie-linked.ngrok-free.dev`).
4. **Re-registrar el webhook de Telegram** apuntando al nuevo dominio (el bot solo puede tener un webhook activo; si sigue apuntando al ngrok viejo, los mensajes no van a llegar al VPS).
5. **Activar** los 3 workflows en la instancia nueva (quedan inactivos tras importar).
6. **Apagar la instancia local** (`start-n8n.ps1` + túnel ngrok) una vez confirmado que todo funciona en el VPS, para no tener dos instancias respondiendo al mismo bot en simultáneo.

Ver [[postly-n8n-ops]] (arranque/edición del n8n local, ya parcialmente obsoleto tras esta migración) y [[postly-meta-setup]] (config original de la App de Meta).
