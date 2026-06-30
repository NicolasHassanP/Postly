# Project Memory — Postly (Tesis n8n)

> Índice de la memoria de proyecto de Claude Code (contexto técnico de las sesiones).
> Solo se incluyen las memorias **de proyecto/referencia** (no preferencias personales de interacción).

> Última sync: **2026-06-30**. Estado: **13/14 HU** — Módulos A, B, C y D completos; HU14 hecha. **Solo resta HU13 (FFmpeg).** **VPS en producción** (DonWeb, `vps-6120781-x.dattaweb.com`), migración cerrada y validada e2e. Detalle en `../ESTADO-Y-ROADMAP.md`.

- [Postly critical path](postly-critical-path.md) — historia completa de implementación (HU1-3, HU8, HU9, HU11/12, HU5 carrusel), deudas técnicas saldadas (cifrado token, gateo agenda, firma Config), aprendizajes (agregación media group, rate limit Gemini) + estado y bloqueantes
- [Postly repo setup](postly-repo-setup.md) — repo privado, estructura, token Meta redactado, skills n8n instaladas
- [Postly Meta setup](postly-meta-setup.md) — App ID/Secret, FB Login for Business, config_id, redirect URI
- [Postly n8n ops](postly-n8n-ops.md) — arranque, edición por API, vars de entorno (POSTLY_ENC_KEY, NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs), buffer de carrusel, rate limit Gemini, gotchas (parcialmente obsoleto tras la migración a VPS, ver siguiente)
- [Postly VPS migration](postly-vps-migration.md) — intentos fallidos (Oracle, Azure, DigitalOcean) por tarjeta prepaga, despliegue exitoso en DonWeb (Docker+n8n+Caddy+SSL), **migración CERRADA** (credenciales reconectadas, workflows activos, bot e2e) + gotchas de la edición por API
- [Postly HU10 scheduling](postly-hu10-scheduling.md) — programación a futuro (Cron): sub-workflows `Publicar Post`/`Publicar Carrusel` + Cron `Programador` + botón "Programar" en el principal. Imagen única **y carruseles** validados e2e. IDs de workflows, estado conversacional (staticData), y regresiones de migración corregidas
- [Postly HU14 metrics](postly-hu14-metrics.md) — métricas de engagement: `Feedback Loop` reescrito (Cron diario, likes/comentarios por-usuaria desde Graph API) + métricas en Mi Agenda. `Reach` es placeholder sin uso. Gemini free tier = 20 req/día
