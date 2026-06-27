# Project Memory — Postly (Tesis n8n)

> Índice de la memoria de proyecto de Claude Code (contexto técnico de las sesiones).
> Solo se incluyen las memorias **de proyecto/referencia** (no preferencias personales de interacción).

> Última sync: **2026-06-27**. Estado: 10/14 HU + HU5 implementada e2e (pendiente test por cuota Gemini). Detalle en `../ESTADO-Y-ROADMAP.md`.

- [Postly critical path](postly-critical-path.md) — historia completa de implementación (HU1-3, HU8, HU9, HU11/12, HU5 carrusel), deudas técnicas saldadas (cifrado token, gateo agenda, firma Config), aprendizajes (agregación media group, rate limit Gemini) + estado y bloqueantes
- [Postly repo setup](postly-repo-setup.md) — repo privado, estructura, token Meta redactado, skills n8n instaladas
- [Postly Meta setup](postly-meta-setup.md) — App ID/Secret, FB Login for Business, config_id, redirect URI
- [Postly n8n ops](postly-n8n-ops.md) — arranque, edición por API, vars de entorno (POSTLY_ENC_KEY, NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs), buffer de carrusel, rate limit Gemini, gotchas
