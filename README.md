# Postly

**Sistema de Automatización Inteligente para la Generación y Publicación de Contenido en Redes Sociales mediante n8n e IA**

> Trabajo Integrador — Tecnicatura Universitaria en Programación
> Universidad Tecnológica Nacional, Facultad Regional Mendoza — 2026
> **Autores:** Jeremías Bontorno · Nicolás Hassan · **Director:** Alberto Cortez

---

## ¿Qué es Postly?

Postly permite a una **Consultora de Belleza Independiente** (venta directa) generar y publicar
contenido profesional en redes sociales conversando con un **chatbot de Telegram** en lenguaje
natural. La IA genera el texto, valida el cumplimiento legal del contenido y lo publica de forma
autónoma en Facebook e Instagram.

### Arquitectura por capas

| Capa | Tecnología | Responsabilidad |
|------|-----------|-----------------|
| Presentación / CUI | **Telegram** | Único punto de entrada; lenguaje natural |
| Orquestación | **n8n** | Webhooks, lógica condicional, manejo de errores |
| Procesamiento cognitivo | **Google Gemini** | Generación de texto e interpretación multimodal |
| Compliance Sentinel | RegEx + OCR | Audita el contenido contra normativa legal antes de publicar |
| Integración / API Gateway | **Meta Graph API** (OAuth 2.0) | Publicación en Facebook / Instagram |
| Persistencia | **Google Sheets** | "Base de datos": estados, historial, métricas |

`Disparo (Telegram) → Enrutamiento (n8n) → Inferencia (Gemini) → Auditoría (Compliance) → Inyección (Meta) → Registro (Sheets)`

> **Hosting:** el sistema **se desplegó y se validó de extremo a extremo** sobre un **VPS self-hosted**
> (DonWeb · Docker + Caddy + SSL), operativo 24/7 entre el 2026-06-29 y septiembre de 2026: sobre esa
> instancia se ejecutaron las validaciones de las 14 HU y las mediciones del Capítulo 5 de la tesis.
> Ese servidor ya **no está contratado**. El entorno de trabajo actual es el de **n8n self-hosted local
> + túnel ngrok** que se describe más abajo.

---

## Estructura del repo

```
Postly/
├── workflows/        # Workflows de n8n exportados (.json) — SIN secretos (token vía $env)
├── scripts/          # Utilidades (get-meta-token.ps1, etc.)
├── code-nodes/       # JS de los nodos "Code" extraído y comentado
├── data/             # Exports CSV/XLSX del Google Sheets (sin credenciales)
├── docs/             # Tesis y documentación
├── assets/           # Imágenes, diagramas
├── .claude/skills/   # Skills de n8n para Claude Code (czlonkowski/n8n-skills)
├── start-n8n.ps1     # Carga el .env y arranca n8n
├── .env.example      # Plantilla de variables de entorno
└── .gitignore
```

Workflows actuales:
- **`Postly - Entrega Final Sprint 1 v2`** — principal (185 nodos): todo el flujo conversacional (foto, carrusel, video; IG + FB).
- **`Postly - HU2 OAuth Callback`** — callback de vinculación OAuth.
- **`Postly - Programador`** — Cron (cada 5 min) de **programación a futuro** (HU10): publica los posts agendados al llegar la hora.
- **`Postly - Publicar Post`** / **`Postly - Publicar Carrusel`** — sub-workflows de publicación (imagen única / carrusel) invocados por el Cron.
- **`Postly - Feedback Loop`** — Cron diario (HU14) de **métricas**: trae likes/comentarios de la Graph API y los persiste en Sheets.

Nodos usados: Telegram, Google Sheets, HTTP Request (Meta), Code, Switch/IF, Gemini, Schedule Trigger, Execute Workflow.

---

## Requisitos

- **Node.js** + **n8n** (`npm i -g n8n`)
- **ngrok** (cuenta gratis — incluye 1 dominio estático)
- PowerShell (Windows)

---

## Puesta en marcha

> Estos son los pasos del **entorno actual**: n8n self-hosted local (Windows) detrás de un túnel ngrok.
> El despliegue en VPS con Docker + Caddy, sobre el que se validó el sistema, quedó dado de baja.

```bash
git clone https://github.com/NicolasHassanP/Postly.git
cd Postly
cp .env.example .env       # completar valores (Nico comparte el .env real por privado)
```

**1. Levantar el túnel** (terminal 1) — con tu dominio estático de ngrok:
```powershell
ngrok http 5678 --url https://<tu-dominio>.ngrok-free.dev
```

> ⚠️ El dominio no está en el árbol de este repositorio —es una URL directa a una máquina personal y el
> repo es público—; vive en el `.env` como `N8N_BASE_URL`. Aun así, **commits anteriores lo contienen**:
> el historial de git no se reescribió. Por eso **conviene bajar el túnel cuando no se usa**:
> los `webhookId` de los workflows sí están en el repo y los webhooks de n8n no tienen autenticación,
> así que mientras el túnel esté arriba se los puede disparar desde afuera (el riesgo concreto es
> ejecuciones no deseadas y consumo de cuota de Gemini, no acceso a las cuentas: los tokens
> por-usuaria están cifrados en la hoja y el webhook no los expone).

**2. Arrancar n8n** (terminal 2) — el script carga el `.env` y levanta n8n:
```powershell
.\start-n8n.ps1
```

**3. En n8n:** importar los `.json` de `workflows/` (si tu instancia está vacía) y reconectar las
credenciales (Telegram, Google Sheets, Gemini) desde tu propia cuenta.

> ℹ️ **Piezas personales (no se comparten en el `.env`):** el **dominio + authtoken de ngrok** y el
> **`N8N_API_KEY_LOCAL`** son de cada máquina/cuenta —la API key de n8n es por instancia—. Si corrés
> en otra PC con otro dominio de ngrok, hay que actualizar `WEBHOOK_URL`, `N8N_BASE_URL` y los
> *redirect URIs* en Google Cloud y Meta.

---

## Variables de entorno (`.env`)

El `.env` **no se sube a git**. `start-n8n.ps1` lo carga al arrancar n8n.

| Variable | Para qué |
|----------|----------|
| `META_ACCESS_TOKEN` | Token de Meta de fallback (la publicación real usa el token **por-usuaria, cifrado** de la hoja *Usuarios*) |
| `META_APP_ID` / `META_APP_SECRET` / `META_CONFIG_ID` / `META_PAGE_ID` | App de Meta (intercambio de tokens y OAuth/HU2) |
| `IG_BUSINESS_ID` | ID de la cuenta de Instagram Business |
| `WEBHOOK_URL` | URL pública estable con la que n8n arma los webhooks (el dominio de ngrok) |
| `N8N_BASE_URL` | Misma URL pública, la usan los scripts de `scripts/` para hablar con la API de n8n. **No se hardcodea en el repo** |
| `N8N_API_KEY_LOCAL` | API key de tu n8n (para editar workflows por API). **Es por instancia**: un JWT firmado con el secreto de ese n8n, no sirve en otro. Se genera en *Settings → n8n API* |
| `N8N_BLOCK_ENV_ACCESS_IN_NODE` | Debe ser `false` para que las expresiones y los Code nodes puedan leer `$env` |
| `POSTLY_ENC_KEY` | Clave AES-256-GCM (hex, 32 bytes) que cifra el token de Meta en Sheets (HU2). Si se pierde, hay que re-vincular |
| `NODE_FUNCTION_ALLOW_BUILTIN` | `crypto,fs,child_process` — habilita `require('crypto')` (cifrado del token), `require('fs')` (buffer del carrusel HU5) y `require('child_process')` (ejecutar **FFmpeg** para HU13) en los Code nodes |

---

## Gestión del token de Meta

El token **ya no se hardcodea** ni se guarda en texto plano: la publicación usa el **token por-usuaria
cifrado con AES-256-GCM** en la hoja *Usuarios* (se obtiene vía OAuth desde el bot — HU2 — y se descifra
al leer). El `META_ACCESS_TOKEN` del `.env` queda como fallback/utilidad.

Para obtener un token de larga duración (60 días) o un **Page Token (no expira)**:

```powershell
# 1. Sacá un token corto del Graph API Explorer (con scopes de IG/pages)
# 2. Convertilo:
.\scripts\get-meta-token.ps1 -ShortToken "EAAxxxx..."
# 3. Pegá el token resultante en .env como META_ACCESS_TOKEN
# 4. Reiniciá:  .\start-n8n.ps1
```

> ✅ **HU2 ya implementado:** el token se obtiene vía **OAuth 2.0 desde el bot** y se guarda **por-usuaria**
> en la hoja *Usuarios*; la publicación usa ese token, no el de `.env`. Este script queda como utilidad/fallback.

---

## Editar workflows por API

Se pueden editar los workflows sin la UI, vía la API de n8n (`http://localhost:5678/api/v1`,
header `X-N8N-API-KEY`). **Ojo:** editar por API cambia la versión del workflow → si tenías una
pestaña abierta en n8n, **refrescala (F5)** antes de tocar, o vas a ver "someone else just updated
this workflow". Coordinar quién edita (API vs UI) para no pisarse.

Scripts disponibles (todos toman el host de `N8N_BASE_URL` y la key de `N8N_API_KEY_LOCAL`):

| Script | Qué hace |
|--------|----------|
| `probe-local-n8n.mjs` | Solo lectura: lista los workflows de la instancia y diffea el principal contra el `.json` del repo |
| `deploy-local-n8n.mjs` | Despliega el workflow del repo a la instancia. Remapea las credenciales por nombre a los IDs locales y conserva los `webhookId` existentes, así no hay que reconectar nada a mano. Respalda antes de escribir |
| `import-local-workflows.mjs` | Crea el Programador y los sub-workflows de HU10 si faltan, remapeando las referencias entre ellos |
| `fix-compliance-patterns.mjs` | Aplica el set canónico de patrones del Centinela a los 4 nodos que auditan precios. Idempotente |

Todos aceptan `--deploy`; sin ese flag hacen *dry-run* e informan qué cambiarían. Las **credenciales
y los `webhookId` son por instancia**, así que un `.json` exportado de otro n8n no se puede subir tal
cual: de eso se encarga el remapeo de `deploy-local-n8n.mjs`.

---

## Estado actual / Roadmap

Mapeo de las **14 Historias de Usuario** de la tesis (5 módulos) contra lo implementado:

**Módulo A — Seguridad, Onboarding y Autenticación**
- ✅ **HU1 — Registro e identificación** (`/start` → busca Chat ID en Sheets → onboarding vs sesión activa).
- ✅ **HU2 — Vinculación OAuth 2.0** (botón Inline → autorización en Meta → callback en n8n → Page Token guardado en la hoja *Usuarios*).
- ✅ **HU3 — Validación preventiva del token** (ping a la Graph API antes de crear; bloquea y ofrece reconectar).

**Módulo B — Creación de Contenido con IA**
- ✅ **HU4 — Análisis de imagen única** (foto → Gemini → 3 copys, parseo JSON).
- ✅ **HU5 — Carruseles (hasta 10 imágenes)** — *validada e2e (2026-06-28)*: ingesta de media group, orden narrativo IA, gate de compliance visual, confirmar/reordenar, editar caption, publicación de carrusel en IG vía Graph API y guardado en Sheets (fila Pendiente → Publicado).
- ✅ **HU6 — Tres tonos** (Informativa / Vendedora / Divertida, botones, Humano-en-el-bucle).

**Módulo C — Compliance (Centinela)** — *completo*
- ✅ **HU7 — Detección de precios en TEXTO** (RegEx, bloquea y avisa).
- ✅ **HU8 — Detección de precios en IMÁGENES (visión Gemini)** — gate visual antes de generar copys; bloquea si detecta precio/promo incrustado.
- ✅ **HU9 — Inyección de firma legal** (firma leída de la pestaña `Config` de la BD, con contacto).

**Módulo D — Publicación y Agenda** — *completo*
- ✅ **HU10 — Programación a futuro (Cron Scheduling)** — *validada e2e (2026-06-30)*: botón "🗓 Programar" → fecha/hora → fila `Programado`; el Cron `Postly - Programador` publica solo al llegar la hora (imagen única **y carruseles**) y notifica por Telegram.
- ✅ **HU11 — Visualización de agenda** (tarjetas con estado 🟢/🔴/🟡, últimas 5, casos borde, **métricas ❤️/💬**).
- ✅ **HU12 — Smart Re-post** + extensión "Retomar borrador" (cierra Pendientes, publish row-aware).

**Módulo E — Multimedia y Analítica** — *completo*
- ✅ **HU13 — Normalización de video (FFmpeg, 9:16, H.264, ≤60s)** — *validada e2e (2026-07-02)*: se manda un video → se descarga de Telegram → **FFmpeg** (vía `require('child_process')` en un Code node, invocado por nombre y resuelto por PATH) lo fuerza a **1080×1920 / H.264 / ≤60s**; si dura más de 60s **pregunta si recortar**; extrae un frame para que Gemini genere los 3 copys; se publica como **Reel en Instagram** (con polling del estado del contenedor) **y como video en la página de Facebook**.
- ✅ **HU14 — Métricas de engagement** — *validada e2e (2026-06-30)*: Cron diario (`Postly - Feedback Loop`) trae likes/comentarios de la Graph API con el token por-usuaria, los persiste en Sheets y se ven en "Mi Agenda".

> **Resumen: 14/14 implementadas.** Los 5 módulos (A–E) completos y validados e2e.

### Extras implementados (más allá de las 14 HU)

- ✅ **Publicación en Facebook** (además de Instagram): imagen única, carrusel (álbum multi-foto) y video, con el mismo copy y compliance.
- ✅ **Sincronización automática desde Instagram**: al abrir "Mi Agenda" el bot trae los posts publicados de IG con sus likes/comentarios frescos.
- ✅ **Métricas de ambas redes en la agenda**: cada publicación muestra `📷 IG ❤️ 💬` y `📘 FB ❤️ 💬`.
- ✅ **Anti-duplicación**: dedup por `callback_query.id` (posts simples) y candado atómico vía `editMessageText` (carruseles, que tardan más).

### Deudas técnicas — saldadas

- ✅ **Cifrado de credenciales:** el token de Meta ahora se guarda **cifrado con AES-256-GCM** en Sheets (antes texto plano).
- ✅ **HU3 en agenda:** "Mi Agenda" valida el token antes de abrirse (antes solo al crear contenido).
- ✅ **HU9 desde BD:** la firma se lee de la pestaña `Config` de la BD (con contacto), ya no hardcodeada.
- ⏸️ **Publish "última fila"** *(fuera de alcance):* en el flujo fresco, publicar apunta al último post (el `append` de n8n no devuelve el `row`). El "Retomar" sí es de fila exacta.

### Notas técnicas de la última iteración

- **Agregación de carrusel:** Telegram entrega un media group como mensajes separados (N ejecuciones concurrentes). Se usa un **buffer en archivo** (`fs.appendFileSync` a `/tmp/postly_carrusel_buffer.tsv`, serializado por el proceso Node; en Windows, Node resuelve `/tmp` como `C:	mp`, que tiene que existir) porque el estado en memoria y el `append` de Google Sheets se pisan bajo concurrencia.
- **Migración a VPS (2026-06-29) y sus regresiones:** pasar de Windows+ngrok a un VPS Linux (n8n 2.27.5) destapó bugs específicos de plataforma que se corrigieron: ruta del buffer de carrusel (`C:/Users/...` → `/tmp/`), URLs de OAuth que apuntaban al ngrok viejo, `mappingMode:defineBelow` que ahora exige `schema` no vacío, y `$('Nodo')` que pierde las comillas si el nombre es un identificador JS válido (se usan nombres con espacio + nodos `NoOp` para merge de ramas preservando el *pairing*).
- **Programación a futuro (HU10):** la fecha se guarda en ISO con offset `-03:00` (evita ambigüedad de timezone del server); el Cron poolea cada 5 min (lag ≤5 min, por diseño). Las URLs de carrusel se guardan **una por línea** en `Carousel_URLs`.
- **Rate limit de Gemini:** el free tier topea en 20 requests; mitigado con reintentos y fusionando llamadas. Para una demo fluida conviene habilitar billing en la API key.
- **Fixes de la validación de HU5 (2026-06-28):** (1) link del post en el mensaje de éxito del carrusel; (2) el carrusel ahora crea **fila Pendiente** al ingestar y la **actualiza** al publicar (`appendOrUpdate` por `ImageURL`), guardando los 3 tonos como el post simple; (3) la **firma** la inyecta siempre el nodo dedicado — se sacó del prompt de la IA también para imagen única. Detalle en `docs/contexto/ESTADO-Y-ROADMAP.md`.
- **Editar el workflow por API en Windows:** usar siempre un script **Node** (UTF-8); `Get-Content` de PowerShell lee el `.json` como ANSI y corrompe los emojis/acentos (mojibake) al re-PUTearlo.

---

## Skills de n8n para Claude Code

El repo incluye las skills de [`czlonkowski/n8n-skills`](https://github.com/czlonkowski/n8n-skills)
en `.claude/skills/`, así que cualquiera que clone el repo las tiene disponibles automáticamente
al abrir Claude Code en esta carpeta (n8n-workflow-patterns, n8n-code-javascript, n8n-node-configuration, etc.).
