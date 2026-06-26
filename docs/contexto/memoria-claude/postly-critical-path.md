---
name: postly-critical-path
description: Camino crítico de Postly según la tesis — la URL estable (VPS) bloquea OAuth/onboarding
metadata:
  node_type: memory
  type: project
---

Postly (tesis n8n, autores Hassan + Bontorno, UTN FRM 2026). La doc `docs/Tesis Postly Bontorno Hassan.docx` es la **fuente de la verdad** y no se puede deviar de lo documentado (decisión del usuario, 2026-06-25).

**Brecha doc vs. realidad:** la tesis define el **Módulo A (Seguridad, Onboarding, Autenticación)** como fundacional y como punto #1 del MVP, con flujo **OAuth 2.0 Authorization Code Grant** (HU2): token largo de 60 días obtenido y guardado cifrado en Google Sheets **sin hardcodear**.

**Camino acordado (doc-faithful):** la tesis (Sprint 1) documenta **VPS + Docker + proxy inverso + SSL/TLS** y declara el self-hosting como NFR "innegociable". El destino final es VPS (skill `n8n-self-hosting`), pero Oracle Cloud rechazó las tarjetas virtuales (MercadoPago/Lemon) y el usuario no quiso usar la de un familiar **por ahora**. Oracle queda pendiente.

**Estado de infra (2026-06-25):** URL estable provisional vía **ngrok dominio estático gratis `https://viewable-zombie-linked.ngrok-free.dev`** → localhost:5678. n8n corre local con `WEBHOOK_URL` apuntando ahí. Credencial Google Sheets reconectada (redirect URI `.../rest/oauth2-credential/callback` cargado en Google Cloud Console). Telegram + Gemini + Sheets funcionando.

**HU2 COMPLETO (2026-06-25):** flujo OAuth 2.0 end-to-end. Workflow "Postly - HU2 OAuth Callback" (id vy60xNtAvcVKRdAx): webhook /oauth-callback → code→token corto→largo → consulta directa a la página (`/{$env.META_PAGE_ID}?fields=name,access_token,instagram_business_account`) que devuelve el **Page Token que NO expira** → Code "Preparar fila" → Google Sheets appendOrUpdate en hoja "Usuarios" (por TelegramUserID) → Telegram. Página Postly (id 1130825220107231) + IG postlyproject (17841435642266301). Nada hardcodeado.

**Gotchas resueltos:** /me/accounts devuelve [] con FB Login for Business → se consulta la página directo por id. Google Sheets node: el `sheetName.value` necesita el gid **sin prefijo** ("600115356", no "gid=600115356"). Hoja Usuarios gid=600115356 en Postly_DB (1b85sqw...). Vars en .env: META_PAGE_ID=1130825220107231, META_CONFIG_ID=1348643850539258.

**HU1 (2026-06-25):** onboarding desde el bot en el workflow principal (VOgbHGLELJfRgVO5). Gateo en `/start`: `Es Start?` → `Buscar usuario` (Sheets read Usuarios, filtra TelegramUserID, **Always Output Data** para que 0 filas no corte la rama) → `¿Ya vinculado?` (IF `Boolean($json.AccessToken)`) → SÍ: `Bienvenida` / NO: `Pedir vinculación`. También comando `/vincular`. `Pedir vinculación` = mensaje con **Inline Keyboard botón tipo URL** que abre el login de Meta con `state={chat_id}` → el callback de HU2 engancha. Gotcha: `Bienvenida` lee `$('Telegram Trigger').first().json.message...` (ya no le llega el message tras el Sheets read).

**HU3 IMPLEMENTADO (2026-06-25):** validación preventiva del token. (1) Gate antes de pedir foto/IA: `Es Nueva Pub?(out0) → HU3: Leer token → HU3: Validar token (GET /me, onError continueRegularOutput) → HU3: ¿Token vigente? (IF Boolean($json.id))` → SÍ: Pedir Foto / NO: `HU3: Re-vincular`. (2) Publicación con **token por-usuaria**: los 3 nodos de IG leen `AccessToken`+`IGAccountID` de la hoja Usuarios vía `HU3: Leer credenciales` (ya NO usan `$env.META_ACCESS_TOKEN` ni el IG id hardcodeado).

**HU11+HU12 (2026-06-25, commit ac2f809):** "Mi Agenda". HU11 (visualización): `Get row(s) in sheet2` (alwaysOutputData) → `Armar tarjetas` (Code: últimas 5, estado 🟢/🔴/🟡, hasImage) → ruteo → tarjeta con/sin foto / agenda vacía. HU12 (Smart Re-post): botón "Volver a publicar" → re-analiza la misma imagen con IA → fila nueva → engancha al camino Publicar/Editar. **Fidelidad:** `Actualizar Sheets` guarda `Copy_Final = Caption_IG` (el caption realmente publicado).

**B-FULL: Retomar borradores (2026-06-25, commit 40d40f9):** publish row-aware. El `append` NO devuelve row_number (verificado), así que el publish fresco sigue con "última fila" y solo el Retomar es row-aware. Se reemplazó `Limit1` por `Elegir fila a publicar` (Code) que apunta a la fila puntual cuando el callback es `pubR_<row>_<n>`. Botón adaptativo: 🟢 → "Volver a publicar" (`repost_`), 🔴 → "Retomar borrador" (`resume_`). Nuevo `Router callback` (Switch v3.4 startsWith) separa `repost_`/`resume_`/`pubR_` del resto. Workflow principal = 74 nodos. **Gotcha:** las reglas del Switch NO deben doble-anidarse o matchean todo en la salida 0.

**Estado HU (9/14):** ✅ HU1,HU2,HU3,HU4,HU6,HU7,HU9,HU11,HU12 · ❌ HU5 (carruseles), HU8 (OCR precios imagen) [se pueden hacer ya] · HU10/HU13/HU14 [requieren VPS]. Detalle en `docs/contexto/ESTADO-Y-ROADMAP.md`.

**Próximo paso:** HU8 → HU5 → migración a VPS (destraba HU10/HU13/HU14). Ver [[postly-n8n-ops]] [[postly-meta-setup]] [[postly-repo-setup]].
