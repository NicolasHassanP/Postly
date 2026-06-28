# Project Memory — Postly (Tesis n8n)

> Índice de la memoria de proyecto de Claude Code (contexto técnico de las sesiones).
> Solo se incluyen las memorias **de proyecto/referencia** (no preferencias personales de interacción).

> Última sync: **2026-06-28**. Estado: **11/14 HU** — Módulos A, B y C completos (HU5 validada e2e). Solo restan HU10/HU13/HU14, las tres bloqueadas por la migración a VPS. Detalle en `../ESTADO-Y-ROADMAP.md`.

- [Postly critical path](postly-critical-path.md) — historia completa de implementación (HU1-3, HU8, HU9, HU11/12, HU5 carrusel), deudas técnicas saldadas (cifrado token, gateo agenda, firma Config), aprendizajes (agregación media group, rate limit Gemini) + estado y bloqueantes
- [Postly repo setup](postly-repo-setup.md) — repo privado, estructura, token Meta redactado, skills n8n instaladas
- [Postly Meta setup](postly-meta-setup.md) — App ID/Secret, FB Login for Business, config_id, redirect URI
- [Postly n8n ops](postly-n8n-ops.md) — arranque, edición por API, vars de entorno (POSTLY_ENC_KEY, NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs), buffer de carrusel, rate limit Gemini, gotchas

---

### Cómo importar estas memorias en tu Claude Code

Copiá los `.md` de esta carpeta (incluido este `MEMORY.md`) a la carpeta de memoria de tu proyecto:

```
~/.claude/projects/<slug-de-tu-ruta>/memory/
```

El `<slug>` lo genera Claude Code a partir de la ruta absoluta del repo (p.ej. `C:\dev\Tesis` → `C--dev-Tesis`); si lo clonaste en otra ruta, el slug cambia. La forma fácil: abrí Claude Code en el repo y preguntale "¿dónde está mi carpeta de memoria de este proyecto?" o dejá que él las recupere. Una vez ahí, `MEMORY.md` se autocarga en cada sesión y el resto se recupera por relevancia.

> Estas son solo las memorias **de proyecto** (técnicas). Las preferencias personales de interacción quedan fuera a propósito.
