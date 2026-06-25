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
| Orquestación | **n8n** (en VPS) | Webhooks, lógica condicional, manejo de errores |
| Procesamiento cognitivo | **Google Gemini** | Generación de texto e interpretación multimodal |
| Compliance Sentinel | RegEx + OCR | Audita el contenido contra normativa legal antes de publicar |
| Integración / API Gateway | **Meta Graph API** (OAuth 2.0) | Publicación en Facebook / Instagram |
| Persistencia | **Google Sheets** | "Base de datos": estados, historial, métricas |

### Flujo de datos (Pipes & Filters)

`Disparo (Telegram) → Enrutamiento (n8n) → Inferencia (Gemini) → Auditoría (Compliance) → Inyección (Meta) → Registro (Sheets)`

---

## Estructura del repo

```
Postly/
├── workflows/        # Workflows de n8n exportados (.json) — SIN secretos
├── code-nodes/       # JS de los nodos "Code" extraído y comentado
├── data/             # Exports CSV/XLSX del Google Sheets (sin credenciales)
├── docs/             # Tesis y documentación
├── assets/           # Imágenes, diagramas
├── .claude/skills/   # Skills de n8n para Claude Code (czlonkowski/n8n-skills)
├── .env.example      # Plantilla de variables de entorno
└── .gitignore
```

> Los workflows tienen **36 nodos** (main) y **7 nodos** (feedback loop): Telegram, Google
> Sheets, HTTP Request (Meta), Code, Switch/IF, Gemini.

---

## Setup (al clonar el repo)

```bash
git clone https://github.com/NicolasHassanP/Postly.git
cd Postly
cp .env.example .env      # y completar META_ACCESS_TOKEN
```

Después, en n8n: **importar** los `.json` de `workflows/` y reconectar las credenciales
(Telegram, Google Sheets, Gemini) desde tu propia instancia.

---

## Levantar n8n con túnel de Cloudflare

Para que Telegram (y Meta) puedan llegar a los webhooks de tu n8n local, exponemos el puerto
`5678` con un túnel de Cloudflare.

**1. Abrir el túnel** (terminal 1):

```bash
cloudflared tunnel --url http://localhost:5678
```

Esto imprime una URL pública del tipo `https://<algo>.trycloudflare.com`. **Copiala.**

**2. Arrancar n8n con esa URL como WEBHOOK_URL** (terminal 2):

PowerShell:
```powershell
$env:WEBHOOK_URL="https://<algo>.trycloudflare.com/"; n8n start
```

CMD:
```cmd
set WEBHOOK_URL=https://<algo>.trycloudflare.com/&& n8n start
```

> ⚠️ El túnel gratuito de `trycloudflare` genera una **URL nueva cada vez**. Cuando cambia,
> hay que actualizar la URL del webhook en el bot de Telegram (BotFather / nodo Telegram Trigger).

---

## Gestión del token de Meta

El token de la Graph API **ya no se hardcodea** en los nodos. Se lee como variable de entorno:

```
access_token = {{ $env.META_ACCESS_TOKEN }}
```

El valor real va en el archivo `.env` (gitignored). Para que n8n lo vea, la variable de entorno
`META_ACCESS_TOKEN` debe estar definida en el entorno **antes de arrancar n8n**.

> 🔄 **Pendiente de esta etapa:** automatizar la obtención/renovación del token para no
> regenerarlo a mano desde *Meta for Developers* cada vez que expira. Ver `docs/`.

---

## Skills de n8n para Claude Code

El repo incluye las skills de [`czlonkowski/n8n-skills`](https://github.com/czlonkowski/n8n-skills)
en `.claude/skills/`, así que cualquiera que clone el repo las tiene disponibles automáticamente
al abrir Claude Code en esta carpeta (n8n-workflow-patterns, n8n-code-javascript, n8n-node-configuration, etc.).
