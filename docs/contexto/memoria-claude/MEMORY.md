# Project Memory — Postly (Tesis n8n)

> Índice de la memoria de proyecto de Claude Code (contexto técnico de las sesiones).
> Solo se incluyen las memorias **de proyecto/referencia** (no preferencias personales de interacción).

> Última sync: **2026-06-29**. Estado: **11/14 HU** — Módulos A, B y C completos (HU5 validada e2e). Solo restan HU10/HU13/HU14 — **migración a VPS completada (DonWeb)**, pendiente reconectar credenciales y redirect URIs. Detalle en `../ESTADO-Y-ROADMAP.md`.

- [Postly critical path](postly-critical-path.md) — historia completa de implementación (HU1-3, HU8, HU9, HU11/12, HU5 carrusel), deudas técnicas saldadas (cifrado token, gateo agenda, firma Config), aprendizajes (agregación media group, rate limit Gemini) + estado y bloqueantes
- [Postly repo setup](postly-repo-setup.md) — repo privado, estructura, token Meta redactado, skills n8n instaladas
- [Postly Meta setup](postly-meta-setup.md) — App ID/Secret, FB Login for Business, config_id, redirect URI
- [Postly n8n ops](postly-n8n-ops.md) — arranque, edición por API, vars de entorno (POSTLY_ENC_KEY, NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs), buffer de carrusel, rate limit Gemini, gotchas (parcialmente obsoleto tras la migración a VPS, ver siguiente)
- [Postly VPS migration](postly-vps-migration.md) — intentos fallidos (Oracle, Azure for Students, DigitalOcean) por tarjeta prepaga, despliegue exitoso en DonWeb (Docker+n8n+Caddy+SSL), y los pasos pendientes (credenciales, redirect URIs) para Nico
