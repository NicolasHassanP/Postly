# docs/contexto — Handoff de contexto para el equipo

Esta carpeta junta **todo el contexto del proyecto** para que cualquiera del equipo (o su Claude)
arranque con la película completa al clonar el repo.

## Qué hay acá

| Archivo | Para qué |
|---------|----------|
| [`ESTADO-Y-ROADMAP.md`](ESTADO-Y-ROADMAP.md) | Mapeo de las 14 HU vs. lo implementado, deudas técnicas y próximos pasos. **Empezá por acá.** |
| [`memoria-claude/`](memoria-claude/) | Copia de la memoria de proyecto de Claude (contexto técnico de las sesiones), lista para importar. |
| `../../CLAUDE.md` (raíz del repo) | Contexto que **Claude Code carga solo** al abrir el proyecto. |

## Cómo hace tu Claude para tener el contexto

### 1. Automático (lo más simple) — `CLAUDE.md`
Claude Code lee **automáticamente** el archivo `CLAUDE.md` de la raíz del repo cuando abrís el proyecto.
Ahí está el resumen operativo (qué es Postly, cómo se edita n8n, variables, gotchas, estado actual).
**No tenés que hacer nada**: clonás, abrís la carpeta en Claude Code, y ya lo tiene.

### 2. Para el detalle — leer esta carpeta
Al empezar una sesión, podés pedirle a tu Claude:
> "Leé `docs/contexto/ESTADO-Y-ROADMAP.md` y `docs/contexto/memoria-claude/` antes de arrancar."

### 3. (Opcional / avanzado) Importar la memoria persistente de Claude
La memoria automática de Claude Code vive **en tu máquina**, no se sincroniza sola por git. Si querés que
tu Claude tenga la memoria persistente poblada (no solo leerla), copiá los `.md` de `memoria-claude/` a tu
carpeta de memoria local:

- **Ruta de memoria** (Windows, si clonaste en `C:\dev\Tesis`):
  `C:\Users\<vos>\.claude\projects\C--dev-Tesis\memory\`
- El nombre de la carpeta del proyecto se deriva de la ruta del repo (`C:\dev\Tesis` → `C--dev-Tesis`).
  Si clonaste en otra ruta, va a ser otro nombre — en ese caso, lo más fácil es usar la opción 2 (que lo lea).

> **Nota:** se incluyen solo las memorias **de proyecto/referencia** (técnicas). Las de preferencias
> personales de interacción quedaron afuera a propósito.

## Convenciones del proyecto (resumen)

- **La tesis (`docs/Tesis Postly Bontorno Hassan.docx`) es la fuente de la verdad.** No desviarse de lo documentado.
- Se trabaja **directo sobre `main`** (proyecto chico, sin PRs).
- Los workflows se editan **por la API de n8n** con scripts (no a mano sobre el JSON). Tras editar por API,
  **refrescar (F5)** la pestaña de n8n. Ver `memoria-claude/postly-n8n-ops.md`.
- Secretos (`.env`) **nunca** van a git.
