---
name: postly-meta-setup
description: Estado de la App de Meta de Postly y qué falta para HU2 (OAuth)
metadata: 
  node_type: memory
  type: project
  originSessionId: 75b3d179-6c35-423c-88e9-068d5ba0fea8
---

Estado en Meta for Developers (confirmado por Nico 2026-06-25):
- App creada ✅ con **App ID** y **App Secret** disponibles.
- **Página de Facebook** creada en su cuenta personal de FB.
- **Cuenta de Instagram Business** de prueba (la creó un amigo para publicaciones de test), vinculada a la Page.
- Con token **hardcodeado**, el flujo **ya publica** en IG correctamente.

**Falta para HU2 (OAuth Authorization Code):**
- Producto **"Facebook Login"** en la App (Nico cree que no lo tiene).
- Registrar el **redirect URI** (webhook de n8n) en *Valid OAuth Redirect URIs*, ej. `https://viewable-zombie-linked.ngrok-free.dev/webhook/meta-callback`.
- Scopes de publicación (instagram_content_publish, pages_show_list, etc.).

**Honestidad / alcance:** el onboarding self-service para usuarias reales requiere **App Review** de Meta. Para el MVP de tesis NO hace falta: correr en **modo desarrollo** + agregar la cuenta de prueba como **tester** de la App. Encaja con el framing "sandbox/pre-experimental" del doc. App Review = trabajo futuro.

**Secretos:** App ID / App Secret van a `.env` (META_APP_ID, META_APP_SECRET), NO al chat ni hardcodeados. App ID público: 951310281090450.

**HU2 — progreso (2026-06-25):** Producto "Inicio de sesión con Facebook para empresas" (FB Login for Business) configurado. **Configuración creada → config_id `1348643850539258`** (token de usuario, permisos: instagram_basic, instagram_content_publish, pages_read_engagement, pages_show_list). Redirect URI registrado: `https://viewable-zombie-linked.ngrok-free.dev/webhook/oauth-callback`. **Workflow callback creado y activo en n8n: "Postly - HU2 OAuth Callback" (id vy60xNtAvcVKRdAx)** — webhook GET /oauth-callback → intercambia code→corto→largo→Page Token → avisa por Telegram → responde HTML. Falta: probar round-trip + agregar guardado en Sheets (hoja "Usuarios") + Parte 1 (botón en el bot). URL login usa config_id (FB Login for Business). Ver [[postly-critical-path]] [[postly-n8n-ops]].
