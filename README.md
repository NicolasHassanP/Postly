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

> **Hosting:** la tesis define como objetivo un **VPS self-hosted** (Docker + proxy inverso + SSL).
> Hoy, en desarrollo, corremos **n8n local** expuesto con un **túnel de ngrok** (URL estable gratis).
> El paso a VPS queda pendiente (ver *Roadmap*).

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

Workflows actuales: **`Postly - Entrega Final Sprint 1 v2`** (principal, ~74 nodos),
**`Postly - HU2 OAuth Callback`** (callback de vinculación) y **`Postly - Feedback Loop`** (~7 nodos):
Telegram, Google Sheets, HTTP Request (Meta), Code, Switch/IF, Gemini.

---

## Requisitos

- **Node.js** + **n8n** (`npm i -g n8n`)
- **ngrok** (cuenta gratis — incluye 1 dominio estático)
- PowerShell (Windows)

---

## Puesta en marcha

```bash
git clone https://github.com/NicolasHassanP/Postly.git
cd Postly
cp .env.example .env       # completar valores (Nico comparte el .env real por privado)
```

**1. Levantar el túnel** (terminal 1) — usa el dominio estático de ngrok:
```powershell
ngrok http 5678 --url https://viewable-zombie-linked.ngrok-free.dev
```

**2. Arrancar n8n** (terminal 2) — el script carga el `.env` y levanta n8n:
```powershell
.\start-n8n.ps1
```

**3. En n8n:** importar los `.json` de `workflows/` (si tu instancia está vacía) y reconectar las
credenciales (Telegram, Google Sheets, Gemini) desde tu propia cuenta.

> ℹ️ **Piezas personales (no se comparten en el `.env`):** el **dominio + authtoken de ngrok** y el
> **`N8N_API_KEY`** son de cada máquina/cuenta. Si corrés en otra PC con otro dominio de ngrok,
> hay que actualizar `WEBHOOK_URL` y los *redirect URIs* en Google Cloud y Meta.

---

## Variables de entorno (`.env`)

El `.env` **no se sube a git**. `start-n8n.ps1` lo carga al arrancar n8n.

| Variable | Para qué |
|----------|----------|
| `META_ACCESS_TOKEN` | Token de Meta para publicar (Page Token / token largo). Lo leen los nodos como `{{ $env.META_ACCESS_TOKEN }}` |
| `META_APP_ID` / `META_APP_SECRET` | App de Meta (intercambio de tokens y, próximamente, OAuth/HU2) |
| `IG_BUSINESS_ID` | ID de la cuenta de Instagram Business |
| `WEBHOOK_URL` | URL pública estable (dominio de ngrok) |
| `N8N_API_KEY` | API key de tu n8n (para editar workflows por API). **Personal de cada máquina** |
| `N8N_BLOCK_ENV_ACCESS_IN_NODE` | Debe ser `false` para que las expresiones puedan leer `$env` |

---

## Gestión del token de Meta

El token **ya no se hardcodea** en los nodos: se lee de `{{ $env.META_ACCESS_TOKEN }}`.

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

---

## Estado actual / Roadmap

Mapeo de las **14 Historias de Usuario** de la tesis (5 módulos) contra lo implementado:

**Módulo A — Seguridad, Onboarding y Autenticación**
- ✅ **HU1 — Registro e identificación** (`/start` → busca Chat ID en Sheets → onboarding vs sesión activa).
- ✅ **HU2 — Vinculación OAuth 2.0** (botón Inline → autorización en Meta → callback en n8n → Page Token guardado en la hoja *Usuarios*).
- ✅ **HU3 — Validación preventiva del token** (ping a la Graph API antes de crear; bloquea y ofrece reconectar).

**Módulo B — Creación de Contenido con IA**
- ✅ **HU4 — Análisis de imagen única** (foto → Gemini → 3 copys, parseo JSON).
- ❌ **HU5 — Carruseles (hasta 10 imágenes)** — *pendiente (no requiere VPS)*.
- ✅ **HU6 — Tres tonos** (Informativa / Vendedora / Divertida, botones, Humano-en-el-bucle).

**Módulo C — Compliance (Centinela)**
- ✅ **HU7 — Detección de precios en TEXTO** (RegEx, bloquea y avisa).
- ❌ **HU8 — Detección de precios en IMÁGENES (OCR / visión)** — *pendiente (no requiere VPS)*.
- ✅ **HU9 — Inyección de firma legal** (concatena la firma obligatoria de Mary Kay).

**Módulo D — Publicación y Agenda**
- ❌ **HU10 — Programación a futuro (Cron Scheduling)** — *requiere VPS (cron 24/7)*.
- ✅ **HU11 — Visualización de agenda** (tarjetas con estado 🟢/🔴/🟡, últimas 5, casos borde).
- ✅ **HU12 — Smart Re-post** + extensión "Retomar borrador" (cierra Pendientes, publish row-aware).

**Módulo E — Multimedia y Analítica**
- ❌ **HU13 — Normalización de video (FFmpeg, 9:16, H.264)** — *requiere VPS*.
- ❌ **HU14 — Métricas de engagement (Cron 24h, likes/comments en la agenda)** — *requiere VPS (cron 24/7)*.

> **Resumen: 9/14 implementadas.** Faltan **HU5** y **HU8** (ambas se pueden encarar ya, no dependen de infra) y **HU10 / HU13 / HU14** (dependen de la migración a VPS por necesitar Cron o FFmpeg corriendo 24/7).

### Próximos pasos

1. **HU5 (carruseles)** y **HU8 (OCR de precios en imagen)** — no dependen de infraestructura, se pueden hacer sobre el setup actual.
2. **Migración a VPS** (Docker + proxy inverso + SSL) — destraba HU10, HU13 y HU14. Bloqueada por Oracle Cloud (rechazo de tarjetas virtuales).

### Deudas técnicas conocidas

- **Cifrado de credenciales:** la tesis pide guardar el token "cifrado" en Sheets; hoy se guarda en texto plano.
- **HU3 en agenda:** la validación de token corre al crear contenido, no al abrir la agenda (decisión de alcance).
- **HU9 desde BD:** la firma está hardcodeada en el nodo Code; la tesis sugiere leerla de la base y sumar hipervínculos de contacto.
- **Publish "última fila":** en el flujo fresco, publicar apunta al último post (el `append` de n8n no devuelve el `row`). El "Retomar" sí es de fila exacta.

---

## Skills de n8n para Claude Code

El repo incluye las skills de [`czlonkowski/n8n-skills`](https://github.com/czlonkowski/n8n-skills)
en `.claude/skills/`, así que cualquiera que clone el repo las tiene disponibles automáticamente
al abrir Claude Code en esta carpeta (n8n-workflow-patterns, n8n-code-javascript, n8n-node-configuration, etc.).
