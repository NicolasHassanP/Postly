---
name: postly-meta-setup
description: Estado de la App de Meta de Postly (OAuth, config_id, redirect URI)
metadata:
  node_type: memory
  type: project
---

Estado en Meta for Developers:
- App creada con **App ID** (público: 951310281090450) y **App Secret** (en `.env`, NO en git).
- **Página de Facebook** "Postly" (id 1130825220107231) + **Instagram Business** de prueba "postlyproject" (id 17841435642266301), vinculada a la Page.
- Producto **"Inicio de sesión con Facebook para empresas"** (FB Login for Business) configurado.
- **Configuración / config_id `1348643850539258`** (token de usuario; permisos: instagram_basic, instagram_content_publish, pages_read_engagement, pages_show_list). En `.env` como `META_CONFIG_ID`.
- **Redirect URI registrado:** `https://viewable-zombie-linked.ngrok-free.dev/webhook/oauth-callback`.

**Honestidad / alcance:** el onboarding self-service para usuarias reales requiere **App Review** de Meta. Para el MVP de tesis NO hace falta: correr en **modo desarrollo** + agregar la cuenta de prueba como **tester** de la App. App Review = trabajo futuro.

**Secretos:** App Secret y tokens van a `.env`, NO al chat ni hardcodeados. Si se cambia el dominio de ngrok hay que re-registrar el redirect URI en Meta y en Google Cloud Console.

Ver [[postly-critical-path]] [[postly-n8n-ops]].
